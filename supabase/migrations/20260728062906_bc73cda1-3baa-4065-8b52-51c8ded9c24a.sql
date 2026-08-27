
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profile (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name TEXT NOT NULL, title TEXT, tagline TEXT, bio TEXT,
  years_experience INT DEFAULT 36, avatar_url TEXT, cover_url TEXT,
  email TEXT, phone TEXT, whatsapp TEXT, location TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile TO anon, authenticated;
GRANT ALL ON public.profile TO authenticated, service_role;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_public_read" ON public.profile FOR SELECT USING (true);
CREATE POLICY "profile_admin_write" ON public.profile FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER profile_updated BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hero_section (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  headline TEXT NOT NULL, subheadline TEXT,
  cta_primary_label TEXT DEFAULT 'Enroll Now', cta_primary_url TEXT DEFAULT '#contact',
  cta_secondary_label TEXT DEFAULT 'Learn More', cta_secondary_url TEXT DEFAULT '#about',
  background_url TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_section TO anon, authenticated;
GRANT ALL ON public.hero_section TO authenticated, service_role;
ALTER TABLE public.hero_section ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hero_public_read" ON public.hero_section FOR SELECT USING (true);
CREATE POLICY "hero_admin_write" ON public.hero_section FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER hero_updated BEFORE UPDATE ON public.hero_section FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.about_section (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  heading TEXT NOT NULL, body TEXT NOT NULL, image_url TEXT,
  highlights JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_section TO anon, authenticated;
GRANT ALL ON public.about_section TO authenticated, service_role;
ALTER TABLE public.about_section ENABLE ROW LEVEL SECURITY;
CREATE POLICY "about_public_read" ON public.about_section FOR SELECT USING (true);
CREATE POLICY "about_admin_write" ON public.about_section FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER about_updated BEFORE UPDATE ON public.about_section FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.contact_info (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  email TEXT, phone TEXT, whatsapp TEXT, address TEXT,
  timezone TEXT DEFAULT 'Asia/Karachi', hours TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contact_info TO anon, authenticated;
GRANT ALL ON public.contact_info TO authenticated, service_role;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_public_read" ON public.contact_info FOR SELECT USING (true);
CREATE POLICY "contact_admin_write" ON public.contact_info FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER contact_updated BEFORE UPDATE ON public.contact_info FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_title TEXT NOT NULL DEFAULT 'Prof. Muhammad Yousaf — O/A Level Mathematics',
  site_description TEXT DEFAULT 'Online O/A Level Mathematics tuition with 36+ years of experience.',
  logo_url TEXT, favicon_url TEXT, theme_mode TEXT DEFAULT 'system',
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO authenticated, service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, level TEXT, description TEXT, icon TEXT,
  order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree TEXT NOT NULL, institution TEXT, year TEXT, description TEXT,
  order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL, organization TEXT, start_year TEXT, end_year TEXT, description TEXT,
  order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, caption TEXT, image_url TEXT NOT NULL,
  order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL, student_title TEXT, avatar_url TEXT,
  quote TEXT NOT NULL, rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true, is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, body TEXT, link_url TEXT,
  starts_at TIMESTAMPTZ DEFAULT now(), ends_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.popup_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, message TEXT, cta_label TEXT, cta_url TEXT, image_url TEXT,
  starts_at TIMESTAMPTZ DEFAULT now(), ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false, is_published BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.featured_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, level TEXT, summary TEXT, duration TEXT, schedule TEXT, price TEXT,
  image_url TEXT, features JSONB DEFAULT '[]'::jsonb,
  order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.student_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL, exam TEXT, grade TEXT, year TEXT,
  photo_url TEXT, note TEXT,
  order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT, year TEXT, icon TEXT,
  order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL, answer TEXT NOT NULL,
  order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL, url TEXT NOT NULL, icon TEXT,
  order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.enrollment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, country TEXT,
  level TEXT, message TEXT, status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'subjects','qualifications','experiences','gallery','testimonials',
    'announcements','popup_notifications','featured_courses','student_results',
    'achievements','faqs','social_links'
  ]) LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO authenticated, service_role;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), ''admin''));', t||'_public_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''));', t||'_admin_write', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t||'_updated', t);
  END LOOP;
END $$;

GRANT INSERT ON public.enrollment_requests TO anon, authenticated;
GRANT ALL ON public.enrollment_requests TO authenticated, service_role;
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrollment_public_insert" ON public.enrollment_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "enrollment_admin_read" ON public.enrollment_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "enrollment_admin_update" ON public.enrollment_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "enrollment_admin_delete" ON public.enrollment_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- SEED
INSERT INTO public.profile (id, full_name, title, tagline, bio, years_experience, avatar_url, email, phone, whatsapp, location) VALUES
(1,'Muhammad Yousaf','Retired O/A Level Mathematics Professor',
 'Shaping mathematical minds for over three decades — now teaching students worldwide, online.',
 'Professor Muhammad Yousaf brings 36+ years of dedicated teaching experience in O Level and A Level Mathematics. Having taught thousands of students across leading institutions, he now offers personalised one-to-one and small-group online tuition to learners around the globe. His approach blends deep conceptual clarity, exam-focused practice and genuine mentorship.',
 36,'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800',
 'yousaf.math@example.com','+92 300 0000000','+92 300 0000000','Online worldwide');

INSERT INTO public.hero_section (id, headline, subheadline) VALUES
(1,'Master O & A Level Mathematics with a Professor who has taught for 36+ years',
 'Personalised online tuition by Prof. Muhammad Yousaf — clarity, confidence and top grades for students worldwide.');

INSERT INTO public.about_section (id, heading, body, image_url, highlights) VALUES
(1,'A lifetime devoted to Mathematics',
 'Professor Yousaf has spent his career translating complex mathematical ideas into intuitive, memorable lessons. His students have gone on to top universities across the UK, US, Canada and Asia. Today, teaching entirely online, he combines classical rigour with modern interactive tools.',
 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200',
 '["36+ years teaching experience","1000+ students mentored worldwide","Specialised in Cambridge, Edexcel & AQA","One-to-one and small-group online classes"]'::jsonb);

INSERT INTO public.contact_info (id, email, phone, whatsapp, hours) VALUES
(1,'yousaf.math@example.com','+92 300 0000000','+92 300 0000000','Mon–Sat, 9:00 AM – 9:00 PM (PKT)');

INSERT INTO public.site_settings (id, site_title, site_description) VALUES
(1,'Prof. Muhammad Yousaf — O/A Level Mathematics Tutor',
 'Online O/A Level Mathematics tuition by Prof. Muhammad Yousaf with 36+ years of teaching experience.');

INSERT INTO public.subjects (name, level, description, icon, order_index) VALUES
 ('Mathematics D (4024)','O Level','Complete syllabus coverage with topical past-paper practice.','Sigma',1),
 ('Additional Mathematics (4037)','O Level','Advanced techniques, calculus foundations and problem solving.','FunctionSquare',2),
 ('Pure Mathematics 1 & 2 (P1/P2)','A Level','Algebra, trigonometry, calculus with exam-focused strategy.','Infinity',3),
 ('Pure Mathematics 3 (P3)','A Level','Complex numbers, differential equations and vectors mastery.','Radical',4),
 ('Mechanics (M1)','A Level','Kinematics, forces and Newtonian mechanics made intuitive.','Move3d',5),
 ('Statistics (S1)','A Level','Probability, distributions and hypothesis testing.','BarChart3',6);

INSERT INTO public.qualifications (degree, institution, year, order_index) VALUES
 ('M.Sc. Mathematics','University of the Punjab','1987',1),
 ('B.Sc. (Hons) Mathematics','Government College University','1985',2),
 ('Teaching Certification — Cambridge Assessment','Cambridge International','1992',3);

INSERT INTO public.experiences (role, organization, start_year, end_year, description, order_index) VALUES
 ('Head of Mathematics Department','Beaconhouse School System','2005','2022','Led curriculum design and taught O/A Level Mathematics to senior sections.',1),
 ('Senior Mathematics Professor','Lahore Grammar School','1995','2005','Taught A Level Pure, Mechanics and Statistics with consistent A/A* results.',2),
 ('Mathematics Lecturer','Government College','1988','1995','Undergraduate calculus, algebra and analysis.',3),
 ('Online Mathematics Tutor','Independent (worldwide)','2022',NULL,'One-to-one and small-group online tuition for students across four continents.',4);

INSERT INTO public.testimonials (student_name, student_title, quote, rating, is_featured, order_index) VALUES
 ('Ayesha K.','A* in A Level Mathematics — London','Sir Yousaf made calculus feel effortless. His patience and clarity took me from a C to an A* in one year.',5,true,1),
 ('Omar S.','O Level Add-Math — Dubai','The best math teacher I have ever had. Every concept was crystal clear after his lessons.',5,true,2),
 ('Zainab R.','A Level Further Math — Toronto','His online classes felt more personal than any in-person tuition. Truly world-class.',5,true,3),
 ('Hassan A.','O Level Math — Karachi','Scored A* thanks to his topical past-paper approach. Cannot recommend him enough.',5,false,4);

INSERT INTO public.featured_courses (title, level, summary, duration, schedule, price, features, order_index) VALUES
 ('O Level Mathematics Intensive','O Level','Full syllabus with weekly past-paper practice.','9 months','3 sessions / week','On request','["Live online classes","Weekly assignments","Past paper drills","WhatsApp doubt support"]'::jsonb,1),
 ('A Level Pure Mathematics','A Level','P1, P2 and P3 with deep conceptual focus.','12 months','3 sessions / week','On request','["Concept + practice","Chapter tests","Mock exams","Recording of every class"]'::jsonb,2),
 ('Crash Course — Final 3 Months','O/A Level','Exam-focused revision and paper technique.','3 months','4 sessions / week','On request','["Topical revision","Timed past papers","Grade-boundary strategy"]'::jsonb,3);

INSERT INTO public.student_results (student_name, exam, grade, year, order_index) VALUES
 ('Ayesha K.','A Level Mathematics','A*','2024',1),
 ('Omar S.','O Level Add-Math','A*','2024',2),
 ('Zainab R.','A Level Further Math','A','2023',3),
 ('Hassan A.','O Level Math D','A*','2024',4),
 ('Ibrahim M.','A Level P1/P2','A*','2023',5),
 ('Sara N.','O Level Math','A','2024',6);

INSERT INTO public.achievements (title, description, year, order_index) VALUES
 ('36+ Years in Education','Continuous teaching career from 1988 to present.','2024',1),
 ('1000+ Students Mentored','Across Pakistan, UK, UAE, Canada and beyond.','2024',2),
 ('Consistent A/A* Track Record','Majority of students achieve top grades.','2024',3),
 ('Cambridge Certified Educator','Recognised training with Cambridge Assessment.','1992',4);

INSERT INTO public.faqs (question, answer, order_index) VALUES
 ('How are the classes conducted?','All classes are conducted online via Zoom / Google Meet with an interactive whiteboard, and recordings are shared after each session.',1),
 ('Which boards do you cover?','Cambridge (CAIE), Edexcel and AQA — O Level, IGCSE and A Level Mathematics.',2),
 ('Do you offer one-to-one tuition?','Yes. Both one-to-one and small-group (max 5 students) formats are available.',3),
 ('How can I enroll?','Fill the enrollment form on this website or send a WhatsApp message. A free trial class is offered.',4),
 ('What are the fees?','Fees depend on level, format and number of sessions per week. Please contact for a personalised quote.',5);

INSERT INTO public.social_links (platform, url, icon, order_index) VALUES
 ('WhatsApp','https://wa.me/923000000000','MessageCircle',1),
 ('YouTube','https://youtube.com/@yousafmath','Youtube',2),
 ('Facebook','https://facebook.com/yousafmath','Facebook',3),
 ('Email','mailto:yousaf.math@example.com','Mail',4);

INSERT INTO public.gallery (title, image_url, order_index) VALUES
 ('Teaching Session','https://images.unsplash.com/photo-1596496050755-c923e73e42e1?w=1200',1),
 ('Whiteboard Class','https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200',2),
 ('Student Success','https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200',3),
 ('Online Class','https://images.unsplash.com/photo-1584697964358-3e14ca57658b?w=1200',4);

INSERT INTO public.announcements (title, body) VALUES
 ('New batch starting September','Registrations open for O and A Level Mathematics — limited seats in each group.');
