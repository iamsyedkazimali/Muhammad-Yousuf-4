import { createFileRoute } from "@tanstack/react-router";
import { SiteLink as Link } from "@/components/site/SiteLink";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Award, BookOpen, CheckCircle2, GraduationCap, MessageCircle,
  Sparkles, Star, Users, ArrowRight, Clock, Calendar, Megaphone,
} from "lucide-react";

import { q, qExtra } from "@/lib/portfolio-queries";
import { PageShell, SectionHeader } from "@/components/site/PageShell";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { RequestDialog } from "@/components/site/RequestDialog";
import { CoursesCarousel } from "@/components/site/CoursesCarousel";
import { TestimonialsCarousel } from "@/components/site/TestimonialsCarousel";
import { SmartImage } from "@/components/site/SmartImage";
import { useHydrated } from "@/hooks/use-hydrated";
import { personSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import heroBg from "@/assets/hero-bg.jpg";
import professorImg from "@/assets/professor.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prof. Muhammad Yousaf — O/A Level Mathematics Tutor | 36+ Years" },
      { name: "description", content: "Online O/A Level Mathematics tuition by Prof. Muhammad Yousaf. 36+ years of teaching Cambridge, Edexcel & AQA. Book a free demo class." },
      { property: "og:title", content: "Prof. Muhammad Yousaf — O/A Level Mathematics Tutor" },
      { property: "og:description", content: "Master O & A Level Mathematics with 36+ years of expertise — online worldwide." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(personSchema()) },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q.profile);
    context.queryClient.ensureQueryData(q.hero);
    context.queryClient.ensureQueryData(q.contact);
    context.queryClient.ensureQueryData(q.subjects);
    context.queryClient.ensureQueryData(q.testimonials);
    context.queryClient.ensureQueryData(q.featuredCourses);
    context.queryClient.ensureQueryData(q.faqs);
    context.queryClient.ensureQueryData(q.announcements);
    context.queryClient.ensureQueryData(q.gallery);
    context.queryClient.ensureQueryData(q.settings);
  },
  component: HomePage,
});

export function HomePage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="h-screen" />}>
        <Hero />
        <Stats />
        <SubjectsPreview />
        <WhyChoose />
        <Announcements />
        <CoursesPreview />
        <Countdown />
        <TestimonialsPreview />
        <GalleryPreview />
        <FAQ />
        <CTA />
      </Suspense>
    </PageShell>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  const { data: hero } = useSuspenseQuery(q.hero);
  const { data: profile } = useSuspenseQuery(q.profile);
  const { data: contact } = useSuspenseQuery(q.contact);
  const wa = contact?.whatsapp?.replace(/\D/g, "");
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-[0.08] dark:opacity-20"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/40 to-background" aria-hidden />
      <div className="container-x grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            36+ Years of Teaching Excellence
          </span>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
            {hero?.headline ?? "Muhammad Yousaf"}
          </h1>
          <p className="mt-4 text-lg font-medium text-primary">
            Retired O/A Level Mathematics Professor
          </p>
          <p className="mt-4 text-muted-foreground max-w-xl">{hero?.subheadline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <RequestDialog
              type="demo"
              sourcePage="home-hero"
              trigger={
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant">
                  Book Demo Class
                </Button>
              }
            />
            <RequestDialog
              type="enroll"
              sourcePage="home-hero"
              trigger={<Button size="lg" variant="outline" className="border-primary/30">Enroll Now</Button>}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {wa && (
              <Button asChild size="lg" variant="outline" className="border-gold/40 text-gold-foreground">
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </Button>
            )}
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
            <p>Trusted by 1500+ students worldwide</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-gold/30 to-primary/30 blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-3xl border-4 border-gold/30 shadow-elegant">
            <img
              src={profile?.avatar_url || professorImg}
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = professorImg)}
              alt={`${profile?.full_name ?? "Professor"} portrait`}
              width={800} height={1000}
              className="w-full h-auto object-cover"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="absolute -bottom-5 -left-5 hidden sm:block rounded-2xl bg-card border border-border shadow-elegant p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 grid place-items-center rounded-lg bg-gold/20">
                <Award className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Consistent</p>
                <p className="font-semibold">A/A* Results</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- STATS ---------------- */
function Stats() {
  const stats = [
    { icon: Users, value: "1500+", label: "Students Mentored" },
    { icon: GraduationCap, value: "36+", label: "Years Experience" },
    { icon: Award, value: "Cambridge", label: "Certified Tutor" },
    { icon: BookOpen, value: "Edexcel", label: "Certified Tutor" },
  ];
  return (
    <section className="border-y border-border bg-primary text-primary-foreground">
      <StaggerGroup className="container-x py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, si) => (
          <StaggerItem key={`${s.label}-${si}`} className="text-center">
            <s.icon className="h-6 w-6 mx-auto mb-2 text-gold" />
            <div className="font-serif text-2xl md:text-4xl text-gold-gradient">{s.value}</div>
            <div className="text-xs md:text-sm text-primary-foreground/70 mt-1">{s.label}</div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

/* ---------------- SUBJECTS PREVIEW ---------------- */
function SubjectsPreview() {
  const { data: subjects } = useSuspenseQuery(q.subjects);
  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container-x">
        <SectionHeader label="What I Teach" title="Subjects & Levels" description="Structured curricula across Cambridge and Edexcel — from IGCSE fundamentals to A-Level Further Mathematics." />
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.slice(0, 6).map((s) => (
            <StaggerItem key={s.id}>
              <Card className="p-6 h-full hover:shadow-elegant hover:-translate-y-1 transition-all border-border">
                <div className="flex items-start gap-4">
                  <div className="grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gold uppercase tracking-wider">{s.level}</div>
                    <h3 className="mt-1 font-serif text-xl">{s.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="border-primary/30">
            <Link to="/subjects" className="inline-flex items-center gap-2">
              View all subjects <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHY CHOOSE ---------------- */
function WhyChoose() {
  const items = [
    { icon: Award, title: "Proven Track Record", desc: "Consistent A/A* results across three decades of teaching." },
    { icon: Users, title: "One-to-One Focus", desc: "Personalised attention with tailored study plans for every student." },
    { icon: BookOpen, title: "Deep Syllabus Mastery", desc: "Cambridge, Edexcel and AQA specifications, inside out." },
    { icon: Sparkles, title: "Interactive Sessions", desc: "Live whiteboard, past papers, and structured weekly assessments." },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <SectionHeader label="Why Choose Me" title="An experience shaped by 36 years" />
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((i) => (
            <StaggerItem key={i.title}>
              <Card className="p-6 h-full border-border hover:shadow-elegant transition-shadow">
                <div className="h-11 w-11 rounded-xl bg-gold/15 grid place-items-center">
                  <i.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="mt-4 font-serif text-lg">{i.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{i.desc}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* ---------------- ANNOUNCEMENTS ---------------- */
function Announcements() {
  const { data: items } = useSuspenseQuery(q.announcements);
  if (!items?.length) return null;
  return (
    <section className="py-16 bg-secondary/40">
      <div className="container-x">
        <SectionHeader label="News" title="Latest Announcements" />
        <StaggerGroup className="grid md:grid-cols-3 gap-5">
          {items.slice(0, 3).map((a) => (
            <StaggerItem key={a.id}>
              <Card className="p-6 border-border h-full">
                <Megaphone className="h-5 w-5 text-gold" />
                <h3 className="mt-3 font-serif text-lg">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.body ?? a.message}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* ---------------- COURSES PREVIEW ---------------- */
function CoursesPreview() {
  const { data: courses } = useSuspenseQuery(q.featuredCourses);
  if (!courses?.length) return null;
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <SectionHeader label="Learn With Me" title="Featured Courses" />
        <CoursesCarousel items={courses} />
        <div className="mt-8 text-center">
          <RequestDialog
            type="enroll"
            sourcePage="home-courses"
            trigger={<Button size="lg" className="bg-primary hover:bg-primary/90">Enroll in a course</Button>}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- COUNTDOWN ---------------- */
function useCountdown(target: Date, enabled: boolean) {
  const [now, setNow] = useState(() => target.getTime());
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [enabled]);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff / 3_600_000) % 24);
  const mins = Math.floor((diff / 60_000) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { days, hours, mins, secs };
}

function Countdown() {
  const { data: exams = [] } = useQuery(qExtra.examCountdowns);
  const hydrated = useHydrated();
  const exam = exams[0];
  // Fallback: next May 1 (typical Cambridge May/June session start)
  const target = exam?.exam_date
    ? new Date(exam.exam_date)
    : (() => {
        const now = new Date();
        const y = now.getMonth() >= 4 ? now.getFullYear() + 1 : now.getFullYear();
        return new Date(y, 4, 1, 9, 0, 0);
      })();
  const { days, hours, mins, secs } = useCountdown(target, hydrated);
  const cells = [
    { v: days, l: "Days" }, { v: hours, l: "Hours" }, { v: mins, l: "Minutes" }, { v: secs, l: "Seconds" },
  ];
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container-x text-center">
        <div className="text-xs uppercase tracking-[0.24em] text-gold font-semibold">Exam Countdown</div>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">
          {exam?.exam_name ? `${exam.exam_name} Begins In` : "May/June Session Begins In"}
        </h2>
        {exam?.description && (
          <p className="mt-3 text-sm text-primary-foreground/70">{exam.description}</p>
        )}
        <div className="mt-8 grid grid-cols-4 gap-3 md:gap-6 max-w-2xl mx-auto">
          {cells.map((c) => (
            <motion.div
              key={c.l}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 py-6"
            >
              <div className="font-serif text-3xl md:text-5xl text-gold-gradient">
                {String(c.v).padStart(2, "0")}
              </div>
              <div className="mt-2 text-xs md:text-sm text-primary-foreground/70">{c.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS PREVIEW ---------------- */
function TestimonialsPreview() {
  const { data: items } = useSuspenseQuery(q.testimonials);
  if (!items?.length) return null;
  const featured = items.filter((t: any) => t.is_featured);
  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container-x max-w-3xl">
        <SectionHeader label="What Students Say" title="Testimonials" />
        <TestimonialsCarousel items={(featured.length ? featured : items).slice(0, 6)} />
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="border-primary/30">
            <Link to="/testimonials" className="inline-flex items-center gap-2">Read more <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- GALLERY PREVIEW ---------------- */
function GalleryPreview() {
  const { data: items } = useSuspenseQuery(q.gallery);
  if (!items?.length) return null;
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <SectionHeader label="Moments" title="From the Classroom" />
        <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.slice(0, 8).map((g) => (
            <StaggerItem key={g.id}>
              <div className="aspect-square overflow-hidden rounded-2xl border border-border group">
                <SmartImage
                  src={g.image_url}
                  alt={g.title ?? "Classroom photograph"}
                  wrapperClassName="h-full w-full"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="border-primary/30">
            <Link to="/gallery" className="inline-flex items-center gap-2">View full gallery <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const { data: faqs } = useSuspenseQuery(q.faqs);
  if (!faqs?.length) return null;
  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container-x max-w-3xl">
        <SectionHeader label="Answers" title="Frequently Asked Questions" />
        <FadeIn>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="rounded-xl border border-border bg-card px-5">
                <AccordionTrigger className="font-serif text-lg text-left">{f.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-10 md:p-16 text-center shadow-elegant">
            <Sparkles className="h-8 w-8 mx-auto text-gold" />
            <h2 className="mt-4 font-serif text-3xl md:text-5xl">Ready to master Mathematics?</h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              Book a free demo class and experience one of the finest O/A Level Maths teachers.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <RequestDialog
                type="demo"
                sourcePage="home-cta"
                trigger={
                  <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">Book Free Demo</Button>
                }
              />
              <Button asChild size="lg" variant="outline" className="border-[#0f5132]/30 text-[#0f5132] hover:bg-[#0f5132]/10">
                <Link to="/online-tuition">See how it works</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
