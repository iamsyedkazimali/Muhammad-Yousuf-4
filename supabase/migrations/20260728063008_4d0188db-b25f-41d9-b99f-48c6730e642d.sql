
-- Anon can only read published rows; drop the combined policies and split per role
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'subjects','qualifications','experiences','gallery','testimonials',
    'announcements','popup_notifications','featured_courses','student_results',
    'achievements','faqs','social_links'
  ]) LOOP
    EXECUTE format('DROP POLICY %I ON public.%I;', t||'_public_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon USING (is_published = true);', t||'_anon_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (is_published = true OR public.has_role(auth.uid(), ''admin''));', t||'_auth_read', t);
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
