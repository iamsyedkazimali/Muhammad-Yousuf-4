import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { qExtra } from "@/lib/portfolio-queries";
import { Button } from "@/components/ui/button";

export function PopupNotification() {
  const { data: popups = [] } = useQuery(qExtra.popups);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const now = Date.now();
  const popup = popups.find((p: any) => {
    if (dismissed.includes(p.id)) return false;
    if (p.starts_at && new Date(p.starts_at).getTime() > now) return false;
    if (p.ends_at && new Date(p.ends_at).getTime() < now) return false;
    return true;
  });

  useEffect(() => {
    setVisible(false);
    if (!popup) return;
    const id = setTimeout(() => setVisible(true), Math.max(0, (popup.delay_seconds ?? 3) * 1000));
    return () => clearTimeout(id);
  }, [popup?.id]);

  const close = () => {
    if (popup) setDismissed((d) => [...d, popup.id]);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {popup && visible && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-label={popup.title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            {popup.image_url && (
              <img src={popup.image_url} alt={popup.title} className="h-44 w-full object-cover" loading="lazy" />
            )}
            <div className="p-6 text-center">
              <h3 className="font-serif text-2xl">{popup.title}</h3>
              {popup.message && <p className="mt-3 text-sm text-muted-foreground">{popup.message}</p>}
              {popup.cta_label && popup.cta_url && (
                <Button asChild className="mt-6 w-full">
                  <a href={popup.cta_url}>{popup.cta_label}</a>
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
