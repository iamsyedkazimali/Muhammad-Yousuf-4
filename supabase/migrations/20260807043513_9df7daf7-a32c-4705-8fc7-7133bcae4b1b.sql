-- 1. portfolios table
CREATE TABLE public.portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  theme_name text NOT NULL DEFAULT 'scholarly-emerald',
  logo text,
  favicon text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portfolios TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolios TO authenticated;
GRANT ALL ON public.portfolios TO service_role;

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active portfolios are public"
  ON public.portfolios FOR SELECT
  USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage portfolios"
  ON public.portfolios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER portfolios_updated
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. seed the first portfolio
INSERT INTO public.portfolios (name, slug, status)
VALUES ('Muhammad Yousaf', 'muhammad-yousaf', 'active')
ON CONFLICT (slug) DO NOTHING;

-- 3. future-facing access helper (currently equivalent to the admin check)
CREATE OR REPLACE FUNCTION public.has_portfolio_access(_portfolio_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

REVOKE EXECUTE ON FUNCTION public.has_portfolio_access(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_portfolio_access(uuid) TO authenticated, service_role;

-- 4. portfolio_id on every content table + backfill + FK + index
DO $$
DECLARE
  t text;
  pid uuid;
  tables text[] := ARRAY[
    'profile','hero_section','about_section','contact_info','site_settings',
    'subjects','qualifications','experiences','achievements','teaching_services',
    'featured_courses','exam_countdowns','gallery','testimonials','student_results',
    'announcements','popup_notifications','faqs','social_links','enrollment_requests'
  ];
BEGIN
  SELECT id INTO pid FROM public.portfolios WHERE slug = 'muhammad-yousaf';

  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS portfolio_id uuid', t);
    EXECUTE format('UPDATE public.%I SET portfolio_id = %L WHERE portfolio_id IS NULL', t, pid);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN portfolio_id SET NOT NULL', t);
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE',
      t, t || '_portfolio_id_fkey'
    );
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (portfolio_id)', t || '_portfolio_id_idx', t);
  END LOOP;
END $$;

-- 5. singleton tables: one row per portfolio, auto-generated ids
DO $$
DECLARE
  t text;
  singletons text[] := ARRAY['profile','hero_section','about_section','contact_info','site_settings'];
BEGIN
  FOREACH t IN ARRAY singletons LOOP
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS public.%I AS integer START WITH 2 OWNED BY public.%I.id', t || '_id_seq', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT nextval(%L)', t, 'public.' || t || '_id_seq');
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE public.%I TO authenticated, service_role', t || '_id_seq');
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I UNIQUE (portfolio_id)', t, t || '_portfolio_id_key');
  END LOOP;
END $$;

-- 6. composite indexes for published content lists per portfolio
CREATE INDEX IF NOT EXISTS subjects_portfolio_pub_idx ON public.subjects (portfolio_id, is_published, order_index);
CREATE INDEX IF NOT EXISTS gallery_portfolio_pub_idx ON public.gallery (portfolio_id, is_published, order_index);
CREATE INDEX IF NOT EXISTS testimonials_portfolio_pub_idx ON public.testimonials (portfolio_id, is_published, order_index);
CREATE INDEX IF NOT EXISTS enrollment_requests_portfolio_created_idx ON public.enrollment_requests (portfolio_id, created_at DESC);