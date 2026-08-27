import { supabase } from "@/integrations/supabase/client";

/**
 * Audit trail writer.
 *
 * Every platform mutation records actor, action, target, before/after values,
 * browser and timestamp. Failures are swallowed: logging must never break the
 * action it describes.
 */
export type AuditEntry = {
  action: string;
  entityType: string;
  entityId?: string | null;
  portfolioId?: string | null;
  portfolioName?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
};

export async function audit(entry: AuditEntry): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    await (supabase.from("activity_logs" as never) as any).insert({
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      portfolio_id: entry.portfolioId ?? null,
      portfolio_name: entry.portfolioName ?? null,
      actor_id: data.user?.id ?? null,
      actor_email: data.user?.email ?? null,
      old_value: entry.oldValue ?? null,
      new_value: entry.newValue ?? null,
      user_agent: typeof navigator === "undefined" ? null : navigator.userAgent,
      metadata: entry.metadata ?? {},
    });
  } catch {
    /* never throw from the audit path */
  }
}
