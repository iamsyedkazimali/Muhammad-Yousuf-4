import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { sectionByKey } from "@/lib/admin-config";
import { SingletonManager } from "@/components/admin/SingletonManager";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { EnrollmentsManager } from "@/components/admin/EnrollmentsManager";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/$section")({
  component: SectionPage,
});

function SectionPage() {
  const { section: key } = useParams({ from: "/_authenticated/admin/$section" });
  const section = sectionByKey(key);

  if (!section) {
    return (
      <Card className="p-10 text-center">
        <p className="text-muted-foreground">Unknown section “{key}”.</p>
        <Link to="/admin" className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
          <ChevronLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </Card>
    );
  }

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{section.group}</div>
        <h1 className="mt-1 font-serif text-3xl">{section.label}</h1>
        {section.description && <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>}
      </div>

      {section.kind === "singleton" ? (
        <SingletonManager section={section} />
      ) : section.kind === "enrollments" ? (
        <EnrollmentsManager />
      ) : (
        <CollectionManager section={section} />
      )}
    </motion.div>
  );
}
