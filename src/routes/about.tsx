import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, GraduationCap, Languages, Sparkles } from "lucide-react";

import { q } from "@/lib/portfolio-queries";
import { PageShell, PageHero, SectionHeader } from "@/components/site/PageShell";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Prof. Muhammad Yousaf | 36 Years of Mathematics Teaching" },
      { name: "description", content: "Biography, qualifications, professional experience, teaching philosophy and languages of Prof. Muhammad Yousaf — retired O/A Level Mathematics Professor." },
      { property: "og:title", content: "About Prof. Muhammad Yousaf" },
      { property: "og:description", content: "36+ years of teaching Cambridge, Edexcel and AQA Mathematics." },
      { property: "og:url", content: "/about" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q.about);
    context.queryClient.ensureQueryData(q.qualifications);
    context.queryClient.ensureQueryData(q.experiences);
    context.queryClient.ensureQueryData(q.profile);
  },
  component: AboutPage,
});

export function AboutPage() {
  return (
    <PageShell>
      <PageHero eyebrow="About the Professor" title="A lifetime devoted to Mathematics"
        description="From chalkboards to interactive whiteboards — three decades of shaping the next generation of thinkers." />
      <Biography />
      <Qualifications />
      <Experience />
      <Philosophy />
      <LanguagesBlock />
    </PageShell>
  );
}

function Biography() {
  const { data: about } = useSuspenseQuery(q.about);
  const highlights: string[] = Array.isArray(about?.highlights) ? about.highlights : [];
  return (
    <section className="py-16 md:py-24">
      <div className="container-x grid md:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border shadow-elegant">
            {about?.image_url && (
              <img src={about.image_url} alt="About Prof. Yousaf" loading="lazy"
                className="absolute inset-0 h-full w-full object-cover" />
            )}
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="font-serif text-3xl md:text-4xl">{about?.heading}</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed whitespace-pre-line">{about?.body}</p>
          <ul className="mt-6 grid gap-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  );
}

function Qualifications() {
  const { data: quals } = useSuspenseQuery(q.qualifications);
  return (
    <section className="py-16 md:py-24 bg-secondary/40">
      <div className="container-x">
        <SectionHeader label="Credentials" title="Qualifications" />
        <StaggerGroup className="grid md:grid-cols-3 gap-5">
          {quals.map((q) => (
            <StaggerItem key={q.id}>
              <Card className="p-6 h-full border-border hover:shadow-elegant transition-shadow">
                <GraduationCap className="h-6 w-6 text-gold mb-3" />
                <h3 className="font-serif text-lg">{q.degree}</h3>
                <p className="text-sm text-muted-foreground mt-1">{q.institution}</p>
                <p className="text-xs text-gold mt-2 font-medium">{q.year}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function Experience() {
  const { data: exp } = useSuspenseQuery(q.experiences);
  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <SectionHeader label="Career" title="Professional Experience" />
        <ol className="relative border-l-2 border-gold/40 ml-3 space-y-8 max-w-3xl mx-auto">
          {exp.map((e, i) => (
            <FadeIn key={e.id} delay={i * 0.05}>
              <li className="pl-8 relative">
                <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-gold ring-4 ring-background" />
                <div className="text-xs font-medium text-muted-foreground">
                  {e.start_year} — {e.end_year ?? "Present"}
                </div>
                <h3 className="font-serif text-xl mt-1">{e.role}</h3>
                <div className="text-sm text-primary font-medium">{e.organization}</div>
                <p className="mt-2 text-muted-foreground">{e.description}</p>
              </li>
            </FadeIn>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Philosophy() {
  const pillars = [
    { title: "Concept First", desc: "Understanding the 'why' before the 'how' — building strong foundations that outlast any exam." },
    { title: "Practice with Purpose", desc: "Targeted past-paper drills, focused on the exam board's marking style." },
    { title: "Confidence & Care", desc: "A supportive environment where every question is welcomed and every student is heard." },
  ];
  return (
    <section className="py-16 md:py-24 bg-secondary/40">
      <div className="container-x">
        <SectionHeader label="Approach" title="Teaching Philosophy" />
        <StaggerGroup className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {pillars.map((p) => (
            <StaggerItem key={p.title}>
              <Card className="p-6 h-full border-border">
                <Sparkles className="h-5 w-5 text-gold" />
                <h3 className="mt-3 font-serif text-xl">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function LanguagesBlock() {
  const langs = ["English", "Urdu", "Punjabi"];
  return (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl text-center">
        <Languages className="h-6 w-6 mx-auto text-gold" />
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">Languages</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {langs.map((l) => (
            <span key={l} className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
