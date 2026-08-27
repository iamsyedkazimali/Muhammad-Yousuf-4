import { createFileRoute } from "@tanstack/react-router";
import { SiteLink as Link } from "@/components/site/SiteLink";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, Calculator, Sigma, TrendingUp } from "lucide-react";

import { q } from "@/lib/portfolio-queries";
import { PageShell, PageHero, SectionHeader } from "@/components/site/PageShell";
import { StaggerGroup, StaggerItem, FadeIn } from "@/components/site/motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — O/A Level Mathematics | Prof. Muhammad Yousaf" },
      { name: "description", content: "O Level, IGCSE, Additional Mathematics, A Level P1–P4, Mechanics M1/M2 and Statistics S1/S2 — taught by a 36-year Mathematics veteran." },
      { property: "og:title", content: "Subjects — Prof. Muhammad Yousaf" },
      { property: "og:description", content: "Full O/A Level Mathematics curriculum: Pure, Mechanics, Statistics." },
      { property: "og:url", content: "/subjects" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/subjects" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q.subjects);
  },
  component: SubjectsPage,
});

export function SubjectsPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Curriculum" title="Subjects & Levels"
        description="Comprehensive coverage across O Level, IGCSE and A Level Mathematics — Cambridge and Edexcel specifications." />
      <FromDatabase />
      <Curriculum />
    </PageShell>
  );
}

function FromDatabase() {
  const { data: subjects } = useSuspenseQuery(q.subjects);
  if (!subjects.length) return null;
  return (
    <section className="py-8">
      <div className="container-x">
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s) => (
            <StaggerItem key={s.id}>
              <Card className="p-6 h-full border-border hover:shadow-elegant hover:-translate-y-1 transition-all">
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
      </div>
    </section>
  );
}

const groups = [
  {
    icon: Calculator,
    level: "O Level & IGCSE",
    items: [
      { name: "O Level Mathematics (D)", desc: "Cambridge 4024 — arithmetic, algebra, geometry, trigonometry." },
      { name: "IGCSE Mathematics", desc: "Cambridge 0580 / Edexcel — Core and Extended tiers." },
      { name: "O Level Additional Mathematics", desc: "Cambridge 4037 — calculus, vectors, advanced algebra." },
    ],
  },
  {
    icon: Sigma,
    level: "A Level — Pure Mathematics",
    items: [
      { name: "P1", desc: "Algebra, coordinate geometry, calculus foundations." },
      { name: "P2", desc: "Logarithms, sequences, trigonometry, differentiation." },
      { name: "P3", desc: "Advanced calculus, differential equations, complex numbers." },
      { name: "P4", desc: "Vectors, further calculus, further complex numbers." },
    ],
  },
  {
    icon: TrendingUp,
    level: "A Level — Mechanics",
    items: [
      { name: "M1", desc: "Kinematics, forces, Newton's laws, momentum." },
      { name: "M2", desc: "Circular motion, work-energy, elastic strings, projectiles." },
    ],
  },
  {
    icon: BookOpen,
    level: "A Level — Statistics",
    items: [
      { name: "S1", desc: "Data representation, probability, distributions." },
      { name: "S2", desc: "Poisson, continuous distributions, hypothesis testing." },
    ],
  },
];

function Curriculum() {
  return (
    <section className="py-16 md:py-24 bg-secondary/40">
      <div className="container-x">
        <SectionHeader label="Full Coverage" title="Structured Curriculum" />
        <div className="grid gap-8">
          {groups.map((g, gi) => (
            <FadeIn key={g.level} delay={gi * 0.05}>
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="grid place-items-center h-11 w-11 rounded-xl bg-gold/15 text-gold">
                    <g.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-2xl">{g.level}</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {g.items.map((i) => (
                    <Card key={i.name} className="p-5 border-border">
                      <div className="font-semibold">{i.name}</div>
                      <p className="mt-2 text-sm text-muted-foreground">{i.desc}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/contact">Enroll for any subject</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
