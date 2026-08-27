import { supabase } from "@/integrations/supabase/client";

/**
 * The portfolio this request/session renders and administers.
 *
 * Resolution order:
 *  1. an explicit runtime override (set by the `/$portfolioSlug` public routes
 *     and by the admin area once the signed-in admin's portfolio is known),
 *  2. `VITE_PORTFOLIO_SLUG`,
 *  3. the seeded `muhammad-yousaf` portfolio.
 *
 * Server-side rendering never mutates the override — the tenant routes are
 * client rendered — so this module-level state can never leak across requests.
 */
export const DEFAULT_PORTFOLIO_SLUG =
  (import.meta.env['VITE_PORTFOLIO_SLUG'] as string | undefined) ?? "muhammad-yousaf";

/** Back-compat alias used by the admin query keys. */
export const ACTIVE_PORTFOLIO_SLUG = DEFAULT_PORTFOLIO_SLUG;

export type Portfolio = {
  id: string;
  name: string;
  slug: string;
  status: string;
  theme_name: string | null;
  logo: string | null;
  favicon: string | null;
  deleted_at?: string | null;
};

let activeSlug: string = DEFAULT_PORTFOLIO_SLUG;

/** The slug every portfolio-scoped query is currently bound to. */
export function getActiveSlug(): string {
  return activeSlug;
}

/** Binds every subsequent query to `slug`. Returns true when it changed. */
export function setActiveSlug(slug: string): boolean {
  const next = slug || DEFAULT_PORTFOLIO_SLUG;
  if (next === activeSlug) return false;
  activeSlug = next;
  return true;
}

/** Restores the deployment default (called by the root route on every match). */
export function resetActiveSlug(): boolean {
  return setActiveSlug(DEFAULT_PORTFOLIO_SLUG);
}

const cache = new Map<string, Promise<Portfolio>>();

/** Resolves (and memoises) a portfolio record by slug. */
export function getPortfolio(slug: string = getActiveSlug()): Promise<Portfolio> {
  const hit = cache.get(slug);
  if (hit) return hit;

  const request = (async () => {
    const { data, error } = await supabase
      .from("portfolios")
      .select("id, name, slug, status, theme_name, logo, favicon, deleted_at")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Portfolio "${slug}" was not found`);
    return data as Portfolio;
  })();

  // Don't memoise failures — a transient network error shouldn't poison the app.
  request.catch(() => cache.delete(slug));
  cache.set(slug, request);
  return request;
}

/** Convenience accessor used by every portfolio-scoped query. */
export async function getPortfolioId(slug: string = getActiveSlug()): Promise<string> {
  return (await getPortfolio(slug)).id;
}

/** Resolves the portfolio a signed-in admin is assigned to (RLS enforced). */
export async function getMyAdminPortfolio(): Promise<{
  portfolioId: string;
  slug: string;
  mustResetPassword: boolean;
} | null> {
  const { data: membership } = await supabase
    .from("portfolio_admins")
    .select("portfolio_id, must_reset_password, status, deleted_at")
    .is("deleted_at", null)
    .eq("status", "active")
    .maybeSingle();
  if (!membership) return null;

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("slug")
    .eq("id", membership.portfolio_id)
    .maybeSingle();
  if (!portfolio) return null;

  return {
    portfolioId: membership.portfolio_id,
    slug: portfolio.slug,
    mustResetPassword: Boolean(membership.must_reset_password),
  };
}
