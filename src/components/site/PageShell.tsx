import { Suspense, type ReactNode } from "react";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PopupNotification } from "./PopupNotification";
import { SiteSettingsSync } from "./SiteSettingsSync";
import { Maintenance } from "./Maintenance";
import { q } from "@/lib/portfolio-queries";
import { useRealtimeContent } from "@/hooks/use-realtime-content";

function FooterWrap() {
  const { data: socials } = useSuspenseQuery(q.socialLinks);
  const { data: settings } = useQuery(q.settings);
  return <Footer socials={socials ?? []} text={settings?.footer_text ?? undefined} />;
}

export function PageShell({ children }: { children: ReactNode }) {
  useRealtimeContent();
  const { data: settings } = useQuery(q.settings);
  const { data: portfolio } = useQuery(q.portfolio);

  if (portfolio && portfolio.status !== "active") {
    return (
      <Maintenance
        title="This portfolio is currently unavailable"
        message="The site has been suspended by the platform administrator. Please check back later."
      />
    );
  }

  if (settings?.maintenance_mode) return <Maintenance />;

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <SiteSettingsSync />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Header />
      <motion.main
        id="main-content"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
      >
        {children}
      </motion.main>
      <Suspense fallback={<div className="h-24" />}>
        <FooterWrap />
      </Suspense>
      <PopupNotification />
    </div>
  );
}


export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative pt-32 md:pt-40 pb-16 md:pb-20 overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-[0.06] dark:opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--gold) 0, transparent 40%), radial-gradient(circle at 80% 60%, var(--primary) 0, transparent 45%)",
        }}
        aria-hidden
      />
      <div className="container-x max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.24em] text-gold font-semibold"
        >
          {eyebrow}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05]"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">{children}</div>
  );
}

export function SectionHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <SectionLabel>{label}</SectionLabel>
      <h2 className="mt-3 font-serif text-3xl md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-muted-foreground">{description}</p>}
    </div>
  );
}
