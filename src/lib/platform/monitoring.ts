import { supabase } from "@/integrations/supabase/client";
import { CONTENT_TABLES } from "./types";

/** System health, storage usage and recent-error monitoring for Super Admin. */
const t = (name: string) => supabase.from(name as never) as any;

export type HealthReport = {
  databaseOk: boolean;
  latencyMs: number;
  portfolios: { total: number; active: number; suspended: number; draft: number; archived: number };
  admins: number;
  clients: number;
  domains: { total: number; verified: number; pending: number };
  storageBytes: number;
  mediaCount: number;
  contentRows: number;
  recentErrors: { action: string; created_at: string; message: string }[];
  failedLogins: number;
};

export async function getHealthReport(): Promise<HealthReport> {
  const started = performance.now();

  const [{ data: portfolios }, { count: admins }, { count: clients }, { data: domains }, { data: media }] =
    await Promise.all([
      t("portfolios").select("status, lifecycle, deleted_at"),
      t("portfolio_admins").select("*", { count: "exact", head: true }).is("deleted_at", null),
      t("clients").select("*", { count: "exact", head: true }).is("deleted_at", null),
      t("portfolio_domains").select("verification_status"),
      t("media_assets").select("size_bytes"),
    ]);

  const latencyMs = Math.round(performance.now() - started);

  const rows = (portfolios ?? []) as { lifecycle?: string; status: string; deleted_at: string | null }[];
  const live = rows.filter((r) => !r.deleted_at);
  const byState = (state: string) =>
    live.filter((r) => (r.lifecycle ?? r.status) === state).length;

  const domainRows = (domains ?? []) as { verification_status: string }[];
  const mediaRows = (media ?? []) as { size_bytes: number }[];

  let contentRows = 0;
  for (const table of CONTENT_TABLES) {
    const { count } = await t(table).select("*", { count: "exact", head: true });
    contentRows += count ?? 0;
  }

  const { data: errorLogs } = await t("activity_logs")
    .select("action, created_at, metadata")
    .in("action", ["system.error", "admin.login_failed"])
    .order("created_at", { ascending: false })
    .limit(10);

  const logs = (errorLogs ?? []) as {
    action: string;
    created_at: string;
    metadata: Record<string, unknown> | null;
  }[];

  return {
    databaseOk: Array.isArray(portfolios),
    latencyMs,
    portfolios: {
      total: live.length,
      active: byState("active"),
      suspended: byState("suspended"),
      draft: byState("draft"),
      archived: byState("archived"),
    },
    admins: admins ?? 0,
    clients: clients ?? 0,
    domains: {
      total: domainRows.length,
      verified: domainRows.filter((d) => d.verification_status === "verified").length,
      pending: domainRows.filter((d) => d.verification_status !== "verified").length,
    },
    storageBytes: mediaRows.reduce((sum, m) => sum + Number(m.size_bytes ?? 0), 0),
    mediaCount: mediaRows.length,
    contentRows,
    recentErrors: logs
      .filter((l) => l.action === "system.error")
      .map((l) => ({
        action: l.action,
        created_at: l.created_at,
        message: String(l.metadata?.['message'] ?? "Unknown error"),
      })),
    failedLogins: logs.filter((l) => l.action === "admin.login_failed").length,
  };
}

/* ------------------------------------------------------------ global search */

export type SearchHit = {
  kind: "Portfolio" | "Client" | "Admin" | "Domain";
  title: string;
  subtitle: string;
  to: string;
  params?: Record<string, string>;
};

export async function globalSearch(term: string): Promise<SearchHit[]> {
  const q = term.trim();
  if (q.length < 2) return [];
  const like = `%${q}%`;

  const [portfolios, clients, admins, domains] = await Promise.all([
    t("portfolios").select("id, name, slug").or(`name.ilike.${like},slug.ilike.${like}`).limit(8),
    t("clients")
      .select("id, full_name, company, email, phone")
      .or(`full_name.ilike.${like},company.ilike.${like},email.ilike.${like},phone.ilike.${like}`)
      .limit(8),
    t("portfolio_admins")
      .select("id, email, full_name")
      .or(`email.ilike.${like},full_name.ilike.${like}`)
      .limit(8),
    t("portfolio_domains").select("id, domain, portfolio_id").ilike("domain", like).limit(8),
  ]);

  const hits: SearchHit[] = [];

  for (const p of (portfolios.data ?? []) as any[]) {
    hits.push({
      kind: "Portfolio",
      title: p.name,
      subtitle: `/${p.slug}`,
      to: "/super-admin/portfolios/$id",
      params: { id: p.id },
    });
  }
  for (const c of (clients.data ?? []) as any[]) {
    hits.push({
      kind: "Client",
      title: c.full_name,
      subtitle: [c.company, c.email, c.phone].filter(Boolean).join(" · ") || "Client",
      to: "/super-admin/clients",
    });
  }
  for (const a of (admins.data ?? []) as any[]) {
    hits.push({
      kind: "Admin",
      title: a.full_name || a.email,
      subtitle: a.email,
      to: "/super-admin/admins",
    });
  }
  for (const d of (domains.data ?? []) as any[]) {
    hits.push({ kind: "Domain", title: d.domain, subtitle: "Custom domain", to: "/super-admin/domains" });
  }

  return hits;
}
