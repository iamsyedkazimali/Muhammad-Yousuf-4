import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Award, GraduationCap, ScrollText, Users } from "lucide-react";

import { q } from "@/lib/portfolio-queries";
import { PageShell, PageHero, SectionHeader } from "@/components/site/PageShell";
import { StaggerGroup, StaggerItem } from "@/components/site/motion";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — Prof. Muhammad Yousaf | 36 Years of Excellence" },
      { name: "description", content: "Milestones, certifications and student results — 36+ years of A/A* results in O and A Level Mathematics." },
      { property: "og:title", content: "Achievements — Prof. Muhammad Yousaf" },
      { property: "og:description", content: "A track record built over three decades of teaching excellence." },
      { property: "og:url", content: "/achievements" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/achievements" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q.achievements);
    context.queryClient.ensureQueryData(q.studentResults);
  },
  component: AchievementsPage,
});

export function AchievementsPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Track Record" title="Milestones & Excellence"
        description="A career defined by the success of students — from local classrooms to global online reach." />
      <Numbers />
      <Milestones />
      <Results />
    </PageShell>
  );
}

function Numbers() {
  const items = [
    { icon: GraduationCap, v: "36+", l: "Years of teaching" },
    { icon: Users, v: "1500+", l: "Students mentored" },
    { icon: Award, v: "A/A*", l: "Consistent grades" },
    { icon: ScrollText, v: "20+", l: "Certifications" },
  ];
  return (
    <section className="py-8 md:py-12">
      <div className="container-x">
        <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((i) => (
            <StaggerItem key={i.l}>
              <Card className="p-6 text-center border-border">
                <i.icon className="h-6 w-6 mx-auto text-gold" />
                <div className="mt-3 font-serif text-3xl md:text-4xl text-primary">{i.v}</div>
                <div className="mt-1 text-xs md:text-sm text-muted-foreground">{i.l}</div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function Milestones() {
  const { data: items } = useSuspenseQuery(q.achievements);
  if (!items.length) return null;
  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <SectionHeader label="Milestones" title="Career Highlights" />
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((a) => (
            <StaggerItem key={a.id}>
              <Card className="p-6 h-full border-border hover:shadow-elegant transition-shadow">
                <Award className="h-6 w-6 text-gold" />
                <h3 className="mt-3 font-serif text-xl">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                {a.year && <div className="mt-3 text-xs text-gold font-medium">{a.year}</div>}
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function Results() {
  const { data: results } = useSuspenseQuery(q.studentResults);
  if (!results.length) return null;
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-[0.24em] text-gold font-semibold">Recent Session</div>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">Student Results</h2>
        </div>
        <StaggerGroup className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.map((r) => (
            <StaggerItem key={r.id}>
              <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.student_name}</div>
                  <div className="text-sm text-primary-foreground/70">{r.exam} · {r.year}</div>
                </div>
                <div className="font-serif text-3xl text-gold shrink-0 ml-3">{r.grade}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
