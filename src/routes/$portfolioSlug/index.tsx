import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/routes/index";

/** `/muhammad-yousaf` — the tenant's home page, sharing the default home UI. */
export const Route = createFileRoute("/$portfolioSlug/")({
  component: HomePage,
});
