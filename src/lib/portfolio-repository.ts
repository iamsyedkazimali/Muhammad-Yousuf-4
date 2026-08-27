import { supabase } from "@/integrations/supabase/client";
import { getPortfolioId } from "./portfolio-context";

/**
 * Portfolio-aware data access layer.
 *
 * Every read and write in the app goes through these helpers so no query can
 * ever leak across portfolios. Tables are addressed by name; the Supabase
 * generated types are intentionally loosened here because the managers are
 * schema-driven (see `admin-config.ts`).
 */
type Row = Record<string, any>;

const table = (name: string) => supabase.from(name as never) as any;

/** Published rows of a collection table, ordered, scoped to one portfolio. */
export async function listPublished<T = Row>(
  name: string,
  order = "order_index",
  ascending = true,
): Promise<T[]> {
  const portfolioId = await getPortfolioId();
  const { data, error } = await table(name)
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("is_published", true)
    .order(order, { ascending });
  if (error) throw error;
  return (data ?? []) as T[];
}

/** All rows of a collection table (admin view), scoped to one portfolio. */
export async function listAll<T = Row>(
  name: string,
  order = "order_index",
  ascending = true,
): Promise<T[]> {
  const portfolioId = await getPortfolioId();
  const { data, error } = await table(name)
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order(order, { ascending });
  if (error) throw error;
  return (data ?? []) as T[];
}

/** Row count for a table within the active portfolio. */
export async function countRows(name: string): Promise<number> {
  const portfolioId = await getPortfolioId();
  const { count } = await table(name)
    .select("*", { count: "exact", head: true })
    .eq("portfolio_id", portfolioId);
  return count ?? 0;
}

/** The single settings-style row belonging to the active portfolio. */
export async function getSingleton<T = Row>(name: string): Promise<T | null> {
  const portfolioId = await getPortfolioId();
  const { data, error } = await table(name)
    .select("*")
    .eq("portfolio_id", portfolioId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as T | null;
}

/** Creates or updates the active portfolio's singleton row. */
export async function upsertSingleton(name: string, values: Row) {
  const portfolioId = await getPortfolioId();
  const existing = await getSingleton<Row>(name);
  if (existing?.id != null) {
    return table(name).update(values).eq("id", existing.id).eq("portfolio_id", portfolioId);
  }
  return table(name).insert({ ...values, portfolio_id: portfolioId });
}

export async function insertRow(name: string, values: Row) {
  const portfolioId = await getPortfolioId();
  return table(name).insert({ ...values, portfolio_id: portfolioId });
}

export async function updateRow(name: string, id: string | number, values: Row) {
  const portfolioId = await getPortfolioId();
  const { portfolio_id: _ignored, ...safe } = values;
  return table(name).update(safe).eq("id", id).eq("portfolio_id", portfolioId);
}

export async function deleteRow(name: string, id: string | number) {
  const portfolioId = await getPortfolioId();
  return table(name).delete().eq("id", id).eq("portfolio_id", portfolioId);
}

/** Arbitrary scoped select for bespoke screens (dashboard widgets, leads). */
export async function selectScoped<T = Row>(
  name: string,
  columns: string,
  build?: (query: any) => any,
): Promise<T[]> {
  const portfolioId = await getPortfolioId();
  let query = table(name).select(columns).eq("portfolio_id", portfolioId);
  if (build) query = build(query);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as T[];
}
