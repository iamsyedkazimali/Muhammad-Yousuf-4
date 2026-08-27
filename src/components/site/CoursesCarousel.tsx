import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmartImage } from "./SmartImage";

type Course = {
  id: string;
  title: string;
  level?: string | null;
  summary?: string | null;
  duration?: string | null;
  schedule?: string | null;
  price?: string | null;
  image_url?: string | null;
  features?: unknown;
};

/** Horizontal scroll-snap carousel of featured courses. */
export function CoursesCarousel({ items }: { items: Course[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 420), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label="Featured courses">
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") scrollBy(1);
          if (e.key === "ArrowLeft") scrollBy(-1);
        }}
      >
        {items.map((c, i) => {
          const features = Array.isArray(c.features) ? (c.features as string[]) : [];
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-[32%]"
            >
              <Card className="flex h-full flex-col overflow-hidden border-border transition-shadow hover:shadow-elegant">
                {c.image_url && (
                  <SmartImage
                    src={c.image_url}
                    alt={c.title}
                    wrapperClassName="aspect-[16/9] w-full"
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  {c.level && (
                    <span className="w-fit rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
                      {c.level}
                    </span>
                  )}
                  <h3 className="mt-3 font-serif text-xl">{c.title}</h3>
                  {c.summary && <p className="mt-2 text-sm text-muted-foreground">{c.summary}</p>}
                  <ul className="mt-4 space-y-2 text-sm">
                    {features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-4 pt-5 text-xs text-muted-foreground">
                    {c.duration && (
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden />{c.duration}</span>
                    )}
                    {c.schedule && (
                      <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" aria-hidden />{c.schedule}</span>
                    )}
                    {c.price && <span className="ml-auto font-semibold text-foreground">{c.price}</span>}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {items.length > 1 && (
        <div className="mt-2 flex justify-center gap-3">
          <Button variant="outline" size="icon" aria-label="Scroll courses left" onClick={() => scrollBy(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Scroll courses right" onClick={() => scrollBy(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
