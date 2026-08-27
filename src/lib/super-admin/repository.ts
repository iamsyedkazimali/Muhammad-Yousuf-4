import { supabase } from "@/integrations/supabase/client";
import type {
  ActivityAction,
  ActivityLogRecord,
  PortfolioAdminRecord,
  PortfolioInput,
  PortfolioRecord,
  SystemSettingsRecord,
} from "./types";

/**
 * Super Admin data access layer.
 *
 * Every super-admin read/write in the app goes through this module so the
 * pages never talk to the database directly. Access is enforced server side by
 * RLS (`public.is_super_admin()`); these helpers only shape the queries.
 */

const t = (name: string) => supabase.from(name as never) as any;

/* ------------------------------------------------------------------ auth */

export async function currentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/** True when the signed-in user holds the `super_admin` role. */
export async function isSuperAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_super_admin", {});
  if (error) return false;
  return data === true;
}

/* ------------------------------------------------------------ portfolios */

export async function listPortfolios(includeDeleted = false): Promise<PortfolioRecord[]> {
  let query = t("portfolios").select("*").order("created_at", { ascending: false });
  if (!includeDeleted) query = query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PortfolioRecord[];
}

export async function getPortfolioById(id: string): Promise<PortfolioRecord | null> {
  const { data, error } = await t("portfolios").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as PortfolioRecord | null;
}

export async function slugExists(slug: string, exceptId?: string): Promise<boolean> {
  let query = t("portfolios").select("id").eq("slug", slug);
  if (exceptId) query = query.neq("id", exceptId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function createPortfolio(input: PortfolioInput): Promise<PortfolioRecord> {
  const { data, error } = await t("portfolios").insert(input).select("*").single();
  if (error) throw error;
  const row = data as PortfolioRecord;
  await logActivity("portfolio.created", { portfolio: row });
  return row;
}

export async function updatePortfolio(
  id: string,
  values: Partial<PortfolioInput>,
): Promise<PortfolioRecord> {
  const { data, error } = await t("portfolios").update(values).eq("id", id).select("*").single();
  if (error) throw error;
  const row = data as PortfolioRecord;
  await logActivity("portfolio.updated", { portfolio: row });
  return row;
}

export async function setPortfolioStatus(id: string, status: "active" | "suspended") {
  const { data, error } = await t("portfolios").update({ status }).eq("id", id).select("*").single();
  if (error) throw error;
  const row = data as PortfolioRecord;
  await logActivity(status === "active" ? "portfolio.activated" : "portfolio.suspended", {
    portfolio: row,
  });
  return row;
}

/** Soft delete — records are never physically removed. */
export async function softDeletePortfolio(id: string) {
  const { data, error } = await t("portfolios")
    .update({ deleted_at: new Date().toISOString(), status: "suspended" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  const row = data as PortfolioRecord;
  await logActivity("portfolio.deleted", { portfolio: row });
  return row;
}

export async function restorePortfolio(id: string) {
  const { data, error } = await t("portfolios")
    .update({ deleted_at: null })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  const row = data as PortfolioRecord;
  await logActivity("portfolio.updated", { portfolio: row, metadata: { restored: true } });
  return row;
}

/* --------------------------------------------------------- portfolio admins */

export async function listPortfolioAdmins(): Promise<PortfolioAdminRecord[]> {
  const { data, error } = await t("portfolio_admins")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PortfolioAdminRecord[];
}

export async function setAdminStatus(id: string, status: "active" | "suspended") {
  const { data, error } = await t("portfolio_admins")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  await logActivity("admin.updated", {
    portfolioId: (data as PortfolioAdminRecord).portfolio_id,
    metadata: { status, email: (data as PortfolioAdminRecord).email },
  });
  return data as PortfolioAdminRecord;
}

export async function softDeleteAdmin(id: string) {
  const { data, error } = await t("portfolio_admins")
    .update({ deleted_at: new Date().toISOString(), status: "suspended" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  await logActivity("admin.deleted", {
    portfolioId: (data as PortfolioAdminRecord).portfolio_id,
    metadata: { email: (data as PortfolioAdminRecord).email },
  });
  return data as PortfolioAdminRecord;
}

/** Sends a Supabase password-reset email to an existing admin account. */
export async function sendAdminPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  await logActivity("admin.updated", { metadata: { password_reset_sent_to: email } });
}

/* ------------------------------------------------------------ activity logs */

export async function listActivityLogs(limit = 200): Promise<ActivityLogRecord[]> {
  const { data, error } = await t("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ActivityLogRecord[];
}

async function clientIp(): Promise<string | null> {
  // Best effort only — the browser cannot see its public IP reliably.
  return null;
}

export async function logActivity(
  action: ActivityAction,
  options: {
    portfolio?: PortfolioRecord;
    portfolioId?: string | null;
    entityType?: string;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  } = {},
) {
  try {
    const user = await currentUser();
    await t("activity_logs").insert({
      action,
      entity_type: options.entityType ?? (action.startsWith("admin") ? "admin" : "portfolio"),
      entity_id: options.entityId ?? options.portfolio?.id ?? null,
      portfolio_id: options.portfolio?.id ?? options.portfolioId ?? null,
      portfolio_name: options.portfolio?.name ?? null,
      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      ip_address: await clientIp(),
      metadata: options.metadata ?? {},
    });
  } catch {
    // Logging must never break the action it describes.
  }
}

/* --------------------------------------------------------- system settings */

export async function getSystemSettings(): Promise<SystemSettingsRecord | null> {
  const { data, error } = await t("system_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (data ?? null) as SystemSettingsRecord | null;
}

export async function updateSystemSettings(values: Partial<SystemSettingsRecord>) {
  const { error } = await t("system_settings").upsert({ ...values, id: 1 });
  if (error) throw error;
  await logActivity("settings.updated", { entityType: "system", metadata: values as any });
}
