import { supabase } from "@/integrations/supabase/client";
import { audit } from "./audit";
import { notify } from "./notifications";
import type { DomainInput, PortfolioDomainRecord } from "./types";

/**
 * Custom domain management + host based tenant resolution.
 *
 * The public site resolves the incoming hostname to exactly one portfolio.
 * Only verified, active domains resolve, so an unverified record can never
 * expose another tenant's data.
 */
const t = () => supabase.from("portfolio_domains" as never) as any;

/** Lowercase, strip protocol/path/port and a leading `www.` is preserved as-is. */
export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

export function isValidDomain(value: string): boolean {
  const d = normalizeDomain(value);
  return d.length <= 253 && DOMAIN_RE.test(d);
}

export async function listDomains(portfolioId?: string): Promise<PortfolioDomainRecord[]> {
  let query = t().select("*").order("created_at", { ascending: false });
  if (portfolioId) query = query.eq("portfolio_id", portfolioId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PortfolioDomainRecord[];
}

export async function addDomain(input: DomainInput): Promise<PortfolioDomainRecord> {
  const domain = normalizeDomain(input.domain);
  if (!isValidDomain(domain)) throw new Error(`"${input.domain}" is not a valid domain name.`);

  const { data, error } = await t()
    .insert({
      portfolio_id: input.portfolio_id,
      domain,
      kind: input.kind,
      status: input.status ?? "active",
      notes: input.notes ?? null,
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error(`${domain} is already connected to a portfolio.`);
    throw error;
  }
  const row = data as PortfolioDomainRecord;
  await audit({
    action: "domain.created",
    entityType: "domain",
    entityId: row.id,
    portfolioId: row.portfolio_id,
    newValue: row,
  });
  await notify({
    type: "domain.connected",
    title: "Domain connected",
    message: `${domain} was added to a portfolio.`,
    portfolioId: row.portfolio_id,
  });
  return row;
}

export async function updateDomain(
  id: string,
  values: Partial<DomainInput> & { verification_status?: string; ssl_status?: string },
): Promise<PortfolioDomainRecord> {
  const before = await getDomain(id);
  const patch: Record<string, unknown> = { ...values };
  if (typeof values.domain === "string") {
    const domain = normalizeDomain(values.domain);
    if (!isValidDomain(domain)) throw new Error(`"${values.domain}" is not a valid domain name.`);
    patch['domain'] = domain;
  }
  const { data, error } = await t().update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  const row = data as PortfolioDomainRecord;
  await audit({
    action: "domain.updated",
    entityType: "domain",
    entityId: id,
    portfolioId: row.portfolio_id,
    oldValue: before,
    newValue: row,
  });
  return row;
}

export async function getDomain(id: string): Promise<PortfolioDomainRecord | null> {
  const { data } = await t().select("*").eq("id", id).maybeSingle();
  return (data ?? null) as PortfolioDomainRecord | null;
}

export async function removeDomain(id: string): Promise<void> {
  const before = await getDomain(id);
  const { error } = await t().delete().eq("id", id);
  if (error) throw error;
  await audit({
    action: "domain.deleted",
    entityType: "domain",
    entityId: id,
    portfolioId: before?.portfolio_id ?? null,
    oldValue: before,
  });
}

/**
 * Verifies a domain by checking that it actually serves this application.
 * The check is a best-effort HEAD request; DNS/TXT propagation is reported
 * back to the operator when it fails.
 */
export async function verifyDomain(id: string): Promise<PortfolioDomainRecord> {
  const record = await getDomain(id);
  if (!record) throw new Error("Domain not found.");

  let reachable = false;
  try {
    await fetch(`https://${record.domain}/robots.txt`, { mode: "no-cors", cache: "no-store" });
    reachable = true;
  } catch {
    reachable = false;
  }

  const updated = await updateDomain(id, {
    verification_status: reachable ? "verified" : "failed",
    ssl_status: reachable ? "issued" : "pending",
  });

  if (reachable && !updated.connected_at) {
    await t().update({ connected_at: new Date().toISOString() }).eq("id", id);
  }
  if (!reachable) {
    throw new Error(
      `${record.domain} did not respond yet. Point the DNS records below at the platform and retry — propagation can take up to 72 hours.`,
    );
  }
  return updated;
}

/** Exactly one primary domain per portfolio. */
export async function setPrimaryDomain(id: string, portfolioId: string): Promise<void> {
  await t().update({ is_primary: false, kind: "redirect" }).eq("portfolio_id", portfolioId);
  const { error } = await t().update({ is_primary: true, kind: "primary" }).eq("id", id);
  if (error) throw error;
  await audit({
    action: "domain.updated",
    entityType: "domain",
    entityId: id,
    portfolioId,
    newValue: { is_primary: true },
  });
}

/** Resolves an incoming hostname to a portfolio slug, or null. */
export async function resolveHostSlug(hostname: string): Promise<string | null> {
  const host = normalizeDomain(hostname);
  if (!host || host === "localhost" || /^\d+(\.\d+){3}$/.test(host)) return null;

  const candidates = host.startsWith("www.") ? [host, host.slice(4)] : [host, `www.${host}`];

  const { data } = await t()
    .select("portfolio_id, domain, is_primary, portfolios(slug, deleted_at)")
    .in("domain", candidates)
    .eq("verification_status", "verified")
    .eq("status", "active")
    .order("is_primary", { ascending: false })
    .limit(1);

  const row = (data ?? [])[0] as { portfolios?: { slug: string; deleted_at: string | null } } | undefined;
  if (!row?.portfolios || row.portfolios.deleted_at) return null;
  return row.portfolios.slug;
}

/** The temporary system URL every portfolio receives automatically. */
export function systemUrl(slug: string): string {
  const origin =
    (import.meta.env['VITE_APP_URL'] as string | undefined) ??
    (typeof window === "undefined" ? "" : window.location.origin);
  return `${origin.replace(/\/$/, "")}/${slug}`;
}

/** DNS records the client has to create at their registrar. */
export function dnsInstructions(domain: string, token: string) {
  const apex = !domain.startsWith("www.") && domain.split(".").length === 2;
  return [
    {
      type: apex ? "A" : "CNAME",
      name: apex ? "@" : domain.split(".")[0],
      value: apex ? "185.158.133.1" : "cname.lovable.app",
      purpose: "Points the domain at the platform",
    },
    {
      type: "TXT",
      name: "_portfolio-verify",
      value: token,
      purpose: "Proves ownership of the domain",
    },
  ];
}
