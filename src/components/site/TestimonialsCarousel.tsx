import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Testimonial = {
  id: string;
  student_name: string;
  student_title?: string | null;
  quote: string;
  rating?: number | null;
};

/** Auto-advancing, keyboard-accessible testimonials carousel. */
export function TestimonialsCarousel({
  items,
  interval = 6000,
}: {
  items: Testimonial[];
  interval?: number;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (d: number) => setI((p) => (p + d + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(() => go(1), interval);
    return () => clearInterval(id);
  }, [paused, go, interval, items.length]);

  if (items.length === 0) return null;
  const t = items[Math.min(i, items.length - 1)]!;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured testimonials"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      tabIndex={0}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative border-border p-8 text-center shadow-elegant md:p-10">
            <Quote className="mx-auto h-8 w-8 text-gold/40" aria-hidden />
            <div className="mt-4 flex justify-center text-gold" aria-label={`${t.rating ?? 5} out of 5 stars`}>
              {[...Array(t.rating ?? 5)].map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-current" aria-hidden />
              ))}
            </div>
            <p className="mt-5 font-serif text-xl italic leading-relaxed md:text-2xl">"{t.quote}"</p>
            <div className="mt-6">
              <div className="font-semibold">{t.student_name}</div>
              <div className="text-sm text-muted-foreground">{t.student_title}</div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" aria-label="Previous testimonial" onClick={() => go(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-1.5">
            {items.map((it, k) => (
              <button
                key={it.id}
                type="button"
                aria-label={`Go to testimonial ${k + 1}`}
                aria-current={k === i}
                onClick={() => setI(k)}
                className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-2 bg-border"}`}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" aria-label="Next testimonial" onClick={() => go(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
