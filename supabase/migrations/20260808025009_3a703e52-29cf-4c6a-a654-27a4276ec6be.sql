-- 1. new role level
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- 2. portfolios: description + soft delete
ALTER TABLE public.portfolios
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS portfolios_deleted_at_idx ON public.portfolios (deleted_at);

-- 3. super admin predicate (text compare so the new enum label needs no commit boundary)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = 'super_admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon;

-- 4. portfolio admins
CREATE TABLE IF NOT EXISTS public.portfolio_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_admins_portfolio_idx ON public.portfolio_admins (portfolio_id);
CREATE UNIQUE INDEX IF NOT EXISTS portfolio_admins_email_portfolio_idx
  ON public.portfolio_admins (portfolio_id, lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_admins TO authenticated;
GRANT ALL ON public.portfolio_admins TO service_role;
ALTER TABLE public.portfolio_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage portfolio admins"
  ON public.portfolio_admins FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE TRIGGER portfolio_admins_updated
  BEFORE UPDATE ON public.portfolio_admins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text NOT NULL DEFAULT 'portfolio',
  entity_id uuid,
  portfolio_id uuid REFERENCES public.portfolios(id) ON DELETE SET NULL,
  portfolio_name text,
  actor_id uuid,
  actor_email text,
  ip_address text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_logs_created_idx ON public.activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_portfolio_idx ON public.activity_logs (portfolio_id);

GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins read activity logs"
  ON public.activity_logs FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Super admins write activity logs"
  ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

-- 6. system settings (single row)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id integer PRIMARY KEY DEFAULT 1,
  system_name text NOT NULL DEFAULT 'Portfolio Platform',
  logo_url text,
  timezone text NOT NULL DEFAULT 'Asia/Karachi',
  default_theme text NOT NULL DEFAULT 'scholarly-emerald',
  maintenance_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT system_settings_singleton CHECK (id = 1)
);

GRANT SELECT, INSERT, UPDATE ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage system settings"
  ON public.system_settings FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE TRIGGER system_settings_updated
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.system_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 7. portfolios policies: super admins manage all, public sees active non-deleted
DROP POLICY IF EXISTS "Super admins manage portfolios" ON public.portfolios;
CREATE POLICY "Super admins manage portfolios"
  ON public.portfolios FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());