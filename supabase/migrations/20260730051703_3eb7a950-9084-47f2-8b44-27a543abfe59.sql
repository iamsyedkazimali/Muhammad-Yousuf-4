DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['profile','hero_section','about_section','contact_info','site_settings','subjects','qualifications','experiences','gallery','testimonials','announcements','popup_notifications','featured_courses','student_results','achievements','faqs','social_links','teaching_services','exam_countdowns']
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;