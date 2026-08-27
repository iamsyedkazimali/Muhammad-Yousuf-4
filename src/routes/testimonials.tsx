import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Quote, Star } from "lucide-react";

import { q } from "@/lib/portfolio-queries";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { StaggerGroup, StaggerItem } from "@/components/site/motion";
import { DataToolbar, Pager } from "@/components/site/DataToolbar";
import { TestimonialsCarousel } from "@/components/site/TestimonialsCarousel";
import { useCollection } from "@/hooks/use-collection";
import { Card } from "@/components/ui/card";
import { breadcrumbSchema } from "@/lib/seo";

const TABS = ["All", "Student", "Parent"] as const;

const SORTS = [
  { key: "order_index", label: "Curated order" },
  { key: "rating", label: "Highest rated", dir: "desc" as const },
  { key: "student_name", label: "Name A–Z" },
  { key: "created_at", label: "Newest first", dir: "desc" as const },
];

/** Testimonials store the author kind inside student_title (e.g. "Parent of …"). */
const kindOf = (t: any) =>
  /parent/i.test(String(t.student_title ?? "")) ? "Parent" : "Student";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — What Students & Parents Say | Prof. Muhammad Yousaf" },
      { name: "description", content: "Reviews from O/A Level Mathematics students and their parents — trusted results from 36+ years of teaching." },
      { property: "og:title", content: "Testimonials — Prof. Muhammad Yousaf" },
      { property: "og:description", content: "Read reviews from students and parents worldwide." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/testimonials" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/testimonials" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Testimonials", url: "/testimonials" },
          ]),
        ),
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q.testimonials);
  },
  component: TestimonialsPage,
});

export function TestimonialsPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Reviews" title="What students & parents say"
        description="Kind words from families around the world whose children have thrived in Mathematics." />
      <Featured />
      <List />
    </PageShell>
  );
}

function Featured() {
  const { data: items } = useSuspenseQuery(q.testimonials);
  const featured = items.filter((t: any) => t.is_featured);
  const slides = featured.length > 0 ? featured : items.slice(0, 5);
  if (slides.length === 0) return null;
  return (
    <section className="pb-8">
      <div className="container-x max-w-3xl">
        <TestimonialsCarousel items={slides} />
      </div>
    </section>
  );
}

function List() {
  const { data: items } = useSuspenseQuery(q.testimonials);
  const withKind = items.map((t: any) => ({ ...t, kind: kindOf(t) }));

  const c = useCollection(withKind, {
    searchFields: ["student_name", "student_title", "quote"],
    filterField: "kind",
    sortKeys: SORTS,
    pageSize: 9,
  });

  return (
    <section className="pb-24">
      <div className="container-x">
        <DataToolbar
          search={c.search}
          onSearch={c.setSearch}
          placeholder="Search reviews…"
          sort={c.sort}
          onSort={c.setSort}
          sortOptions={SORTS}
          filters={TABS}
          filter={c.filter}
          onFilter={c.setFilter}
          resultCount={c.total}
        />

        <StaggerGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.items.map((t: any) => (
            <StaggerItem key={t.id}>
              <Card className="relative h-full border-border p-6 transition-shadow hover:shadow-elegant">
                <Quote className="absolute right-4 top-4 h-10 w-10 text-gold/20" aria-hidden />
                <div className="mb-3 flex text-gold" aria-label={`${t.rating ?? 5} out of 5 stars`}>
                  {[...Array(t.rating ?? 5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
                  ))}
                </div>
                <p className="italic leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="mt-5 border-t border-border pt-5">
                  <div className="font-semibold">{t.student_name}</div>
                  <div className="text-sm text-muted-foreground">{t.student_title}</div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {c.items.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">No reviews match your search.</p>
        )}

        <Pager page={c.page} pageCount={c.pageCount} onPage={c.setPage} />
      </div>
    </section>
  );
}
