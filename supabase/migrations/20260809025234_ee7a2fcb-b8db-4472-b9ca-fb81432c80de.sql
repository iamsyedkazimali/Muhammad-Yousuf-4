-- ============================================================
-- PHASE 3: Clone engine + portfolio-scoped admin access
-- ============================================================

-- 1. portfolio_admins gains role / password-reset flag / unique email
ALTER TABLE public.portfolio_admins
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS must_reset_password boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS portfolio_admins_email_unique
  ON public.portfolio_admins (lower(email)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS portfolio_admins_user_idx
  ON public.portfolio_admins (user_id) WHERE deleted_at IS NULL;

-- 2. Link every existing global admin to the seeded portfolio (backward compatibility)
INSERT INTO public.portfolio_admins (portfolio_id, user_id, email, full_name, status, role)
SELECT p.id, u.id, coalesce(u.email, u.id::text), coalesce(u.raw_user_meta_data->>'full_name', u.email), 'active', 'admin'
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'admin'
CROSS JOIN LATERAL (SELECT id FROM public.portfolios ORDER BY created_at LIMIT 1) p
WHERE NOT EXISTS (
  SELECT 1 FROM public.portfolio_admins pa WHERE pa.user_id = u.id AND pa.deleted_at IS NULL
);

-- 3. Membership helpers
CREATE OR REPLACE FUNCTION public.user_portfolio_id(_user_id uuid DEFAULT auth.uid())
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pa.portfolio_id
  FROM public.portfolio_admins pa
  JOIN public.portfolios p ON p.id = pa.portfolio_id
  WHERE pa.user_id = _user_id
    AND pa.deleted_at IS NULL
    AND pa.status = 'active'
    AND p.deleted_at IS NULL
  ORDER BY pa.created_at
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_portfolio_access(_portfolio_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _portfolio_id IS NOT NULL AND (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.portfolio_admins pa
      WHERE pa.user_id = auth.uid()
        AND pa.portfolio_id = _portfolio_id
        AND pa.deleted_at IS NULL
        AND pa.status = 'active'
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.user_portfolio_id(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_portfolio_access(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.user_portfolio_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_portfolio_access(uuid) TO authenticated;

-- 4. Replace every global-admin content policy with a portfolio-scoped one
DO $$
DECLARE
  t text;
  pol record;
  tables text[] := ARRAY[
    'profile','hero_section','about_section','contact_info','site_settings','subjects',
    'qualifications','experiences','achievements','teaching_services','featured_courses',
    'exam_countdowns','gallery','testimonials','student_results','announcements',
    'popup_notifications','faqs','social_links','enrollment_requests'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
        AND (coalesce(qual,'') LIKE '%has_role%' OR coalesce(with_check,'') LIKE '%has_role%')
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.has_portfolio_access(portfolio_id)) WITH CHECK (public.has_portfolio_access(portfolio_id))',
      t || '_portfolio_admin_all', t
    );
  END LOOP;
END $$;

-- 5. portfolio_admins: an admin may read their own row
DROP POLICY IF EXISTS "Admins read own membership" ON public.portfolio_admins;
CREATE POLICY "Admins read own membership" ON public.portfolio_admins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 6. Clone engine ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.clone_portfolio(
  _source_id uuid,
  _name text,
  _slug text,
  _theme text DEFAULT 'scholarly-emerald',
  _logo text DEFAULT NULL,
  _favicon text DEFAULT NULL,
  _status text DEFAULT 'active',
  _description text DEFAULT NULL,
  _copy_data boolean DEFAULT true
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_id uuid;
  t text;
  cols text;
  tables text[] := ARRAY[
    'profile','hero_section','about_section','contact_info','site_settings','subjects',
    'qualifications','experiences','achievements','teaching_services','featured_courses',
    'exam_countdowns','gallery','testimonials','student_results','announcements',
    'popup_notifications','faqs','social_links'
  ];
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can clone portfolios';
  END IF;
  IF coalesce(btrim(_name), '') = '' THEN RAISE EXCEPTION 'Portfolio name is required'; END IF;
  IF coalesce(btrim(_slug), '') = '' THEN RAISE EXCEPTION 'Portfolio slug is required'; END IF;
  IF _slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'Slug must contain lowercase letters, numbers and dashes only';
  END IF;
  IF EXISTS (SELECT 1 FROM public.portfolios WHERE slug = _slug) THEN
    RAISE EXCEPTION 'The slug "%" is already taken', _slug;
  END IF;
  IF _source_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.portfolios WHERE id = _source_id) THEN
    RAISE EXCEPTION 'Source portfolio was not found';
  END IF;

  INSERT INTO public.portfolios (name, slug, status, theme_name, logo, favicon, description)
  VALUES (btrim(_name), _slug, coalesce(_status, 'active'), coalesce(_theme, 'scholarly-emerald'),
          _logo, _favicon, _description)
  RETURNING id INTO new_id;

  IF _copy_data AND _source_id IS NOT NULL THEN
    FOREACH t IN ARRAY tables LOOP
      SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
        INTO cols
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t
        AND column_name NOT IN ('id', 'portfolio_id', 'created_at', 'updated_at')
        AND is_generated = 'NEVER';

      IF cols IS NOT NULL THEN
        EXECUTE format(
          'INSERT INTO public.%I (%s, portfolio_id) SELECT %s, $1 FROM public.%I WHERE portfolio_id = $2',
          t, cols, cols, t
        ) USING new_id, _source_id;
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.activity_logs (action, entity_type, entity_id, portfolio_id, portfolio_name,
                                    actor_id, actor_email, metadata)
  SELECT 'portfolio.cloned', 'portfolio', new_id, new_id, btrim(_name), auth.uid(), u.email,
         jsonb_build_object('source_portfolio_id', _source_id, 'copied_data', _copy_data)
  FROM auth.users u WHERE u.id = auth.uid();

  RETURN new_id;
END $$;

REVOKE EXECUTE ON FUNCTION public.clone_portfolio(uuid, text, text, text, text, text, text, text, boolean) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.clone_portfolio(uuid, text, text, text, text, text, text, text, boolean) TO authenticated, service_role;

-- 7. Admin provisioning ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_portfolio_admin(
  _portfolio_id uuid,
  _user_id uuid,
  _email text,
  _full_name text DEFAULT NULL,
  _must_reset boolean DEFAULT true
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE row_id uuid;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can create portfolio admins';
  END IF;
  IF EXISTS (SELECT 1 FROM public.portfolio_admins WHERE lower(email) = lower(_email) AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'An admin with the email "%" already exists', _email;
  END IF;

  INSERT INTO public.portfolio_admins (portfolio_id, user_id, email, full_name, status, role, must_reset_password)
  VALUES (_portfolio_id, _user_id, lower(_email), _full_name, 'active', 'admin', _must_reset)
  RETURNING id INTO row_id;

  INSERT INTO public.activity_logs (action, entity_type, entity_id, portfolio_id, actor_id, metadata)
  VALUES ('admin.created', 'admin', row_id, _portfolio_id, auth.uid(), jsonb_build_object('email', lower(_email)));

  RETURN row_id;
END $$;

CREATE OR REPLACE FUNCTION public.flag_password_reset(_admin_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can reset admin passwords';
  END IF;
  UPDATE public.portfolio_admins SET must_reset_password = true WHERE id = _admin_id;
  INSERT INTO public.activity_logs (action, entity_type, entity_id, portfolio_id, actor_id, metadata)
  SELECT 'admin.password_reset', 'admin', pa.id, pa.portfolio_id, auth.uid(),
         jsonb_build_object('email', pa.email)
  FROM public.portfolio_admins pa WHERE pa.id = _admin_id;
END $$;

CREATE OR REPLACE FUNCTION public.clear_password_reset_flag()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.portfolio_admins SET must_reset_password = false WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.record_admin_login()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.portfolio_admins
     SET last_login_at = now()
   WHERE user_id = auth.uid() AND deleted_at IS NULL;

  INSERT INTO public.activity_logs (action, entity_type, entity_id, portfolio_id, actor_id, actor_email, metadata)
  SELECT 'admin.login', 'admin', pa.id, pa.portfolio_id, auth.uid(), pa.email, '{}'::jsonb
  FROM public.portfolio_admins pa
  WHERE pa.user_id = auth.uid() AND pa.deleted_at IS NULL;
END $$;

REVOKE EXECUTE ON FUNCTION public.assign_portfolio_admin(uuid, uuid, text, text, boolean) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.flag_password_reset(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.clear_password_reset_flag() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.record_admin_login() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.assign_portfolio_admin(uuid, uuid, text, text, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.flag_password_reset(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.clear_password_reset_flag() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_admin_login() TO authenticated;