-- Gallery categories + featured
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS category text DEFAULT 'Teaching';
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Popup extras
ALTER TABLE public.popup_notifications ADD COLUMN IF NOT EXISTS delay_seconds integer NOT NULL DEFAULT 3;
ALTER TABLE public.popup_notifications ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0;

-- Site settings: SEO + branding + analytics + footer
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_keywords text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS og_image_url text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_primary text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_accent text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS footer_text text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS analytics_id text;

-- Teaching services
CREATE TABLE IF NOT EXISTS public.teaching_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text,
  platform text,
  order_index integer DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teaching_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teaching_services TO authenticated;
GRANT ALL ON public.teaching_services TO service_role;
ALTER TABLE public.teaching_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teaching_services public read" ON public.teaching_services FOR SELECT USING (is_published = true);
CREATE POLICY "teaching_services admin read" ON public.teaching_services FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "teaching_services admin write" ON public.teaching_services FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER teaching_services_updated_at BEFORE UPDATE ON public.teaching_services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Exam countdowns
CREATE TABLE IF NOT EXISTS public.exam_countdowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name text NOT NULL,
  exam_date timestamptz NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exam_countdowns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_countdowns TO authenticated;
GRANT ALL ON public.exam_countdowns TO service_role;
ALTER TABLE public.exam_countdowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_countdowns public read" ON public.exam_countdowns FOR SELECT USING (is_published = true);
CREATE POLICY "exam_countdowns admin read" ON public.exam_countdowns FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "exam_countdowns admin write" ON public.exam_countdowns FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER exam_countdowns_updated_at BEFORE UPDATE ON public.exam_countdowns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed
INSERT INTO public.teaching_services (title, description, icon, platform, order_index)
SELECT * FROM (VALUES
  ('Live Interactive Classes','One-to-one and small group live sessions with an interactive whiteboard.','Video','Zoom',0),
  ('Weekly Tests','Timed past-paper style tests every week with detailed marking.','ClipboardCheck','All',1),
  ('Digital Notes','Handwritten digital notes and worked solutions shared after each class.','FileText','All',2),
  ('Performance Tracking','Monthly progress reports shared with students and parents.','TrendingUp','All',3)
) v WHERE NOT EXISTS (SELECT 1 FROM public.teaching_services);

INSERT INTO public.exam_countdowns (exam_name, exam_date, description, order_index)
SELECT * FROM (VALUES
  ('CAIE May/June Session', (now() + interval '120 days')::timestamptz, 'O Level & A Level Mathematics examinations', 0)
) v WHERE NOT EXISTS (SELECT 1 FROM public.exam_countdowns);