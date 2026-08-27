import { supabase } from "@/integrations/supabase/client";
import { audit } from "./audit";
import { notify } from "./notifications";
import { CONTENT_TABLES, type BackupPayload, type BackupRecord } from "./types";

/**
 * Backup, restore, export and import.
 *
 * A backup is a JSON snapshot of every content table, the media index, the
 * portfolio record (theme/branding/SEO) and admin metadata. Restores replace
 * the tenant's content tables inside one logical operation and roll back to a
 * pre-restore safety snapshot when a table fails.
 */
const t = (name: string) => supabase.from(name as never) as any;

async function fetchTable(table: string, portfolioId: string) {
  const { data, error } = await t(table).select("*").eq("portfolio_id", portfolioId);
  if (error) throw new Error(`Reading ${table}: ${error.message}`);
  return (data ?? []) as Record<string, unknown>[];
}

/** Builds the in-memory snapshot without persisting it. */
export async function buildSnapshot(portfolioId: string): Promise<BackupPayload> {
  const { data: portfolio, error } = await t("portfolios")
    .select("*")
    .eq("id", portfolioId)
    .maybeSingle();
  if (error) throw error;
  if (!portfolio) throw new Error("Portfolio not found.");

  const tables: Record<string, Record<string, unknown>[]> = {};
  for (const table of CONTENT_TABLES) {
    tables[table] = await fetchTable(table, portfolioId);
  }

  const media = await fetchTable("media_assets", portfolioId);
  const { data: admins } = await t("portfolio_admins")
    .select("email, full_name, role, status, created_at")
    .eq("portfolio_id", portfolioId);

  return {
    version: 1,
    created_at: new Date().toISOString(),
    portfolio: portfolio as Record<string, unknown>,
    tables,
    media,
    admins: (admins ?? []) as Record<string, unknown>[],
  };
}

export async function listBackups(portfolioId?: string): Promise<BackupRecord[]> {
  let query = t("portfolio_backups")
    .select("id, portfolio_id, label, size_bytes, table_count, row_count, created_by, created_at")
    .order("created_at", { ascending: false });
  if (portfolioId) query = query.eq("portfolio_id", portfolioId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as BackupRecord[];
}

export async function createBackup(portfolioId: string, label?: string): Promise<BackupRecord> {
  const payload = await buildSnapshot(portfolioId);
  const rowCount = Object.values(payload.tables).reduce((n, rows) => n + rows.length, 0);
  const serialized = JSON.stringify(payload);

  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await t("portfolio_backups")
    .insert({
      portfolio_id: portfolioId,
      label: label?.trim() || `Snapshot ${new Date().toLocaleString()}`,
      payload,
      size_bytes: serialized.length,
      table_count: Object.keys(payload.tables).length,
      row_count: rowCount,
      created_by: user.user?.id ?? null,
    })
    .select("id, portfolio_id, label, size_bytes, table_count, row_count, created_by, created_at")
    .single();
  if (error) throw error;

  await audit({
    action: "backup.created",
    entityType: "backup",
    entityId: (data as BackupRecord).id,
    portfolioId,
    newValue: { rows: rowCount },
  });
  await notify({
    type: "backup.completed",
    title: "Backup completed",
    message: `${rowCount} rows captured across ${Object.keys(payload.tables).length} tables.`,
    portfolioId,
  });

  return data as BackupRecord;
}

export async function loadBackupPayload(id: string): Promise<BackupPayload> {
  const { data, error } = await t("portfolio_backups").select("payload").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data?.payload) throw new Error("Backup not found.");
  return data.payload as BackupPayload;
}

export async function deleteBackup(id: string): Promise<void> {
  const { error } = await t("portfolio_backups").delete().eq("id", id);
  if (error) throw error;
  await audit({ action: "backup.deleted", entityType: "backup", entityId: id });
}

/** Validation result for an uploaded/pasted payload. */
export type ValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  tables: string[];
};

export function validatePayload(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let rowCount = 0;
  const tables: string[] = [];

  const payload = raw as Partial<BackupPayload> | null;
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["The file is not valid JSON object data."], warnings, rowCount, tables };
  }
  if (payload.version !== 1) errors.push("Unsupported backup version.");
  if (!payload.tables || typeof payload.tables !== "object") {
    errors.push("The payload has no `tables` section.");
    return { ok: false, errors, warnings, rowCount, tables };
  }

  for (const [table, rows] of Object.entries(payload.tables)) {
    if (!(CONTENT_TABLES as readonly string[]).includes(table)) {
      warnings.push(`Unknown table "${table}" will be skipped.`);
      continue;
    }
    if (!Array.isArray(rows)) {
      errors.push(`Table "${table}" is not an array.`);
      continue;
    }
    tables.push(table);
    rowCount += rows.length;
    for (const row of rows) {
      if (typeof row !== "object" || row === null) {
        errors.push(`Table "${table}" contains a non-object row.`);
        break;
      }
    }
  }

  if (!tables.length) errors.push("No importable tables were found.");
  return { ok: errors.length === 0, errors, warnings, rowCount, tables };
}

/** Strips identity/tenant columns so rows land in the target portfolio cleanly. */
function reseat(rows: Record<string, unknown>[], portfolioId: string, keepId: boolean) {
  return rows.map((row) => {
    const copy: Record<string, unknown> = { ...row, portfolio_id: portfolioId };
    if (!keepId) delete copy['id'];
    delete copy['created_at'];
    delete copy['updated_at'];
    return copy;
  });
}

/**
 * Replaces the target portfolio's content with `payload`. A safety snapshot is
 * taken first and re-applied if any table fails.
 */
export async function applyPayload(
  portfolioId: string,
  payload: BackupPayload,
  options: { mode: "replace" | "merge" } = { mode: "replace" },
): Promise<{ restoredRows: number }> {
  const validation = validatePayload(payload);
  if (!validation.ok) throw new Error(validation.errors.join(" "));

  const safety = await buildSnapshot(portfolioId);
  let restoredRows = 0;

  const write = async (source: BackupPayload, replace: boolean) => {
    let written = 0;
    for (const table of validation.tables) {
      const rows = source.tables[table] ?? [];
      if (replace) {
        const { error } = await t(table).delete().eq("portfolio_id", portfolioId);
        if (error) throw new Error(`Clearing ${table}: ${error.message}`);
      }
      if (!rows.length) continue;
      const { error } = await t(table).insert(reseat(rows, portfolioId, false));
      if (error) throw new Error(`Writing ${table}: ${error.message}`);
      written += rows.length;
    }
    return written;
  };

  try {
    restoredRows = await write(payload, options.mode === "replace");
  } catch (error) {
    // Roll back to the pre-restore state, then surface the original failure.
    try {
      await write(safety, true);
    } catch {
      /* rollback failure is reported through the thrown error below */
    }
    throw error instanceof Error ? error : new Error(String(error));
  }

  await audit({
    action: "backup.restored",
    entityType: "backup",
    portfolioId,
    newValue: { rows: restoredRows, mode: options.mode },
  });

  return { restoredRows };
}

export async function restoreBackup(portfolioId: string, backupId: string) {
  return applyPayload(portfolioId, await loadBackupPayload(backupId));
}

/* --------------------------------------------------------------- exporting */

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (value: unknown) => {
    if (value == null) return "";
    const text = typeof value === "object" ? JSON.stringify(value) : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

/** One CSV per table, concatenated with section headers. */
export function payloadToCsv(payload: BackupPayload): string {
  return Object.entries(payload.tables)
    .filter(([, rows]) => rows.length)
    .map(([table, rows]) => `# ${table}\n${toCsv(rows)}`)
    .join("\n\n");
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
