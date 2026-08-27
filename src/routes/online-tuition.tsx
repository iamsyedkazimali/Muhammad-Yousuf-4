import { createFileRoute } from "@tanstack/react-router";
import { SiteLink as Link } from "@/components/site/SiteLink";
import { useQuery } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";
import {
  Video, ClipboardCheck, FileText, PenTool, TrendingUp, Monitor,
  BookOpen, Users, Calendar,
} from "lucide-react";
import { qExtra } from "@/lib/portfolio-queries";


import { PageShell, PageHero, SectionHeader } from "@/components/site/PageShell";
import { StaggerGroup, StaggerItem, FadeIn } from "@/components/site/motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/online-tuition")({
  head: () => ({
    meta: [
      { title: "Online Tuition — Zoom, Google Meet & Teams | Prof. Muhammad Yousaf" },
      { name: "description", content: "Live one-to-one online Mathematics tuition on Zoom, Google Meet and Microsoft Teams. Interactive whiteboard, weekly tests, digital notes, homework and performance tracking." },
      { property: "og:title", content: "Online Tuition — Prof. Muhammad Yousaf" },
      { property: "og:description", content: "Live interactive Maths classes worldwide with weekly assessments and progress tracking." },
      { property: "og:url", content: "/online-tuition" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/online-tuition" }],
  }),
  component: OnlineTuitionPage,
});

export function OnlineTuitionPage() {
  return (
    <PageShell>
      <PageHero eyebrow="How it Works" title="Online Tuition, Delivered Right"
        description="A modern classroom, without borders. Live interactive sessions with the depth and rigor of a traditional academy." />
      <Method />
      <Platforms />
      <Features />
      <Schedule />
    </PageShell>
  );
}

function Method() {
  const steps = [
    { n: "01", title: "Diagnostic Session", desc: "Free 30-minute demo to assess your current level and set learning goals." },
    { n: "02", title: "Personalised Plan", desc: "A tailored study plan mapped to your exam board and target grade." },
    { n: "03", title: "Live Lessons", desc: "Interactive whiteboard, worked examples, and live problem solving." },
    { n: "04", title: "Practice & Feedback", desc: "Weekly assignments, marked past papers, and targeted feedback." },
  ];
  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <SectionHeader label="Teaching Method" title="A proven 4-step approach" />
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <StaggerItem key={s.n}>
              <Card className="p-6 h-full border-border relative overflow-hidden hover:shadow-elegant transition-shadow">
                <div className="absolute -right-4 -top-4 font-serif text-6xl text-gold/15">{s.n}</div>
                <h3 className="font-serif text-xl">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function Platforms() {
  const platforms = [
    { name: "Zoom", desc: "HD video with breakout rooms and screen share." },
    { name: "Google Meet", desc: "Simple, browser-based, no downloads needed." },
    { name: "Microsoft Teams", desc: "Perfect for school-integrated learning." },
  ];
  return (
    <section className="py-16 md:py-24 bg-secondary/40">
      <div className="container-x">
        <SectionHeader label="Platforms" title="Choose what works for you" />
        <StaggerGroup className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {platforms.map((p) => (
            <StaggerItem key={p.name}>
              <Card className="p-6 h-full text-center border-border">
                <div className="h-12 w-12 mx-auto rounded-xl bg-primary text-primary-foreground grid place-items-center">
                  <Video className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-xl">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function Features() {
  const { data: services = [] } = useQuery(qExtra.teachingServices);
  const fallback = [
    { icon: ClipboardCheck, title: "Weekly Tests", desc: "Regular assessments tracked against exam standards." },
    { icon: FileText, title: "Homework", desc: "Targeted assignments with detailed written feedback." },
    { icon: BookOpen, title: "Digital Notes", desc: "PDF summaries and worked-example handouts per topic." },
    { icon: PenTool, title: "Interactive Whiteboard", desc: "Live math notation, sketches, and solutions in real time." },
    { icon: TrendingUp, title: "Performance Tracking", desc: "Progress dashboards shared with students and parents." },
    { icon: Monitor, title: "Recorded Sessions", desc: "Every lesson recorded for revision, on request." },
  ];
  const features = services.length
    ? services.map((s: any) => ({
        icon: ((LucideIcons as any)[s.icon] ?? Monitor) as typeof Monitor,
        title: s.title as string,
        desc: (s.description ?? "") as string,
      }))
    : fallback;
  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <SectionHeader label="What's Included" title="Everything you need to excel" />
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f: { icon: typeof Monitor; title: string; desc: string }, fi: number) => (
            <StaggerItem key={`${f.title}-${fi}`}>

              <Card className="p-6 h-full border-border hover:shadow-elegant transition-shadow">
                <div className="h-11 w-11 rounded-xl bg-gold/15 text-gold grid place-items-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function Schedule() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container-x">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <Calendar className="h-8 w-8 mx-auto text-gold" />
            <h2 className="mt-4 font-serif text-3xl md:text-4xl">Flexible timings across time zones</h2>
            <p className="mt-4 text-primary-foreground/80">
              One-to-one and small-group classes scheduled Monday to Saturday. Sessions available across GMT, GST, PKT, EST and beyond.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/contact">Book a Free Demo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/subjects">
                  <Users className="mr-2 h-4 w-4" /> Browse Subjects
                </Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
