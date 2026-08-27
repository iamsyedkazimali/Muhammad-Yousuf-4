import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { q } from "@/lib/portfolio-queries";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { DataToolbar, Pager } from "@/components/site/DataToolbar";
import { Lightbox } from "@/components/site/Lightbox";
import { SmartImage } from "@/components/site/SmartImage";
import { useCollection } from "@/hooks/use-collection";
import { breadcrumbSchema } from "@/lib/seo";

const CATEGORIES = ["All", "Teaching", "Events", "Certificates", "Whiteboard", "Online Classes"] as const;

const SORTS = [
  { key: "order_index", label: "Curated order" },
  { key: "title", label: "Title A–Z" },
  { key: "created_at", label: "Newest first", dir: "desc" as const },
];

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Classroom Moments | Prof. Muhammad Yousaf" },
      { name: "description", content: "Photos from teaching sessions, academic events, certificates, whiteboard work and online classes." },
      { property: "og:title", content: "Gallery — Prof. Muhammad Yousaf" },
      { property: "og:description", content: "Visual moments from 36+ years of Mathematics teaching." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/gallery" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Gallery", url: "/gallery" },
          ]),
        ),
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q.gallery);
  },
  component: GalleryPage,
});

export function GalleryPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Moments" title="Gallery"
        description="Snapshots from the classroom, events, certifications and online sessions." />
      <Grid />
    </PageShell>
  );
}

function Grid() {
  const { data: items } = useSuspenseQuery(q.gallery);
  const [viewer, setViewer] = useState<number | null>(null);

  const c = useCollection(items, {
    searchFields: ["title", "caption", "category"],
    filterField: "category",
    sortKeys: SORTS,
    pageSize: 12,
  });

  return (
    <section className="pb-24">
      <div className="container-x">
        <DataToolbar
          search={c.search}
          onSearch={c.setSearch}
          placeholder="Search photos…"
          sort={c.sort}
          onSort={c.setSort}
          sortOptions={SORTS}
          filters={CATEGORIES}
          filter={c.filter}
          onFilter={c.setFilter}
          resultCount={c.total}
        />

        {c.items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No photos match your search.</p>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {c.items.map((g, i) => (
                <motion.button
                  key={g.id}
                  layout
                  type="button"
                  onClick={() => setViewer(i)}
                  aria-label={`View ${g.title ?? "gallery image"} larger`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <SmartImage
                    src={g.image_url}
                    alt={g.title ?? "Gallery photograph"}
                    wrapperClassName="h-full w-full"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                  {g.title && (
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-primary-foreground opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <div className="text-sm font-medium">{g.title}</div>
                      {g.category && <div className="text-xs text-primary-foreground/80">{g.category}</div>}
                    </div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <Pager page={c.page} pageCount={c.pageCount} onPage={c.setPage} />
      </div>

      <Lightbox items={c.items} index={viewer} onClose={() => setViewer(null)} onIndexChange={setViewer} />
    </section>
  );
}
