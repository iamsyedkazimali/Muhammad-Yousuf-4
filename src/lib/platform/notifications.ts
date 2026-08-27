import { supabase } from "@/integrations/supabase/client";
import type { NotificationRecord } from "./types";

/** Super Admin notification centre. */
const t = () => supabase.from("platform_notifications" as never) as any;

export type NotifyInput = {
  type:
    | "portfolio.created"
    | "portfolio.suspended"
    | "domain.connected"
    | "admin.login_failed"
    | "storage.limit"
    | "backup.completed"
    | string;
  title: string;
  message?: string;
  portfolioId?: string | null;
  severity?: "info" | "warning" | "critical";
  metadata?: Record<string, unknown>;
};

export async function notify(input: NotifyInput): Promise<void> {
  try {
    await t().insert({
      type: input.type,
      title: input.title,
      message: input.message ?? null,
      portfolio_id: input.portfolioId ?? null,
      severity: input.severity ?? "info",
      metadata: input.metadata ?? {},
    });
  } catch {
    /* notifications are best effort */
  }
}

export async function listNotifications(limit = 100): Promise<NotificationRecord[]> {
  const { data, error } = await t()
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as NotificationRecord[];
}

export async function markRead(id: string): Promise<void> {
  const { error } = await t().update({ is_read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllRead(): Promise<void> {
  const { error } = await t().update({ is_read: true }).eq("is_read", false);
  if (error) throw error;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await t().delete().eq("id", id);
  if (error) throw error;
}
