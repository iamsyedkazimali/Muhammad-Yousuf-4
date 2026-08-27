import type React from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { AboutPage } from "@/routes/about";
import { AchievementsPage } from "@/routes/achievements";
import { ContactPage } from "@/routes/contact";
import { GalleryPage } from "@/routes/gallery";
import { OnlineTuitionPage } from "@/routes/online-tuition";
import { SubjectsPage } from "@/routes/subjects";
import { TestimonialsPage } from "@/routes/testimonials";

/**
 * `/muhammad-yousaf/about`, `/ghulam-hussain/gallery`, …
 *
 * The tenant pages reuse the exact same components as the default site — only
 * the resolved portfolio differs, which keeps every portfolio pixel-identical
 * to the original until its admin edits the content.
 */
const PAGES: Record<string, React.ComponentType> = {
  about: AboutPage,
  subjects: SubjectsPage,
  "online-tuition": OnlineTuitionPage,
  achievements: AchievementsPage,
  gallery: GalleryPage,
  testimonials: TestimonialsPage,
  contact: ContactPage,
};

export const Route = createFileRoute("/$portfolioSlug/$")({
  beforeLoad: ({ params }) => {
    if (!PAGES[params._splat ?? ""]) throw notFound();
  },
  component: TenantPage,
});

function TenantPage() {
  const { _splat } = Route.useParams();
  const Page = PAGES[_splat ?? ""];
  return Page ? <Page /> : null;
}
