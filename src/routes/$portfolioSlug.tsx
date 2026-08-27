import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { getPortfolio, setActiveSlug } from "@/lib/portfolio-context";

/**
 * Public tenant root — every portfolio gets its own URL (`/muhammad-yousaf`).
 *
 * Client rendered: the active tenant is process-wide state, so binding it on
 * the server could leak between concurrent requests.
 */
export const Route = createFileRoute("/$portfolioSlug")({
  ssr: false,
  beforeLoad: async ({ params, context }) => {
    const portfolio = await getPortfolio(params.portfolioSlug).catch(() => null);
    if (!portfolio || portfolio.deleted_at) throw notFound();

    // Rebind every portfolio-scoped query to this tenant.
    if (setActiveSlug(portfolio.slug)) context.queryClient.clear();
    return { portfolio };
  },
  head: ({ match }) => {
    const name = (match.context as { portfolio?: { name: string } }).portfolio?.name ?? "Portfolio";
    return {
      meta: [
        { title: `${name} — Mathematics Tuition` },
        { name: "description", content: `The official portfolio and online tuition site of ${name}.` },
        { property: "og:title", content: name },
        { property: "og:description", content: `Online mathematics tuition with ${name}.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: () => <Outlet />,
});
