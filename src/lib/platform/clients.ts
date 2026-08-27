import { supabase } from "@/integrations/supabase/client";
import { audit } from "./audit";
import type { ClientInput, ClientRecord } from "./types";

/** Client (portfolio owner) records. Super Admin owned. */
const t = () => supabase.from("clients" as never) as any;

export async function listClients(includeDeleted = false): Promise<ClientRecord[]> {
  let query = t().select("*").order("created_at", { ascending: false });
  if (!includeDeleted) query = query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ClientRecord[];
}

export async function getClient(id: string): Promise<ClientRecord | null> {
  const { data, error } = await t().select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as ClientRecord | null;
}

function clean(input: Partial<ClientInput>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    out[k] = typeof v === "string" ? (v.trim() || null) : v;
  }
  if (typeof out['full_name'] === "string" && !out['full_name']) {
    throw new Error("Client name is required.");
  }
  const email = out['email'];
  if (typeof email === "string" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }
  return out;
}

export async function createClient(input: ClientInput): Promise<ClientRecord> {
  if (!input.full_name?.trim()) throw new Error("Client name is required.");
  const { data, error } = await t().insert(clean(input)).select("*").single();
  if (error) throw error;
  const row = data as ClientRecord;
  await audit({
    action: "client.created",
    entityType: "client",
    entityId: row.id,
    portfolioId: row.portfolio_id,
    newValue: row,
  });
  return row;
}

export async function updateClient(id: string, values: Partial<ClientInput>): Promise<ClientRecord> {
  const before = await getClient(id);
  const { data, error } = await t().update(clean(values)).eq("id", id).select("*").single();
  if (error) throw error;
  const row = data as ClientRecord;
  await audit({
    action: "client.updated",
    entityType: "client",
    entityId: id,
    portfolioId: row.portfolio_id,
    oldValue: before,
    newValue: row,
  });
  return row;
}

export async function setClientStatus(id: string, status: "active" | "suspended") {
  return updateClient(id, { status } as Partial<ClientInput>);
}

/** Soft delete — client history is never physically removed. */
export async function deleteClient(id: string): Promise<void> {
  const before = await getClient(id);
  const { error } = await t()
    .update({ deleted_at: new Date().toISOString(), status: "suspended" })
    .eq("id", id);
  if (error) throw error;
  await audit({
    action: "client.deleted",
    entityType: "client",
    entityId: id,
    portfolioId: before?.portfolio_id ?? null,
    oldValue: before,
  });
}

export async function restoreClient(id: string): Promise<void> {
  const { error } = await t().update({ deleted_at: null, status: "active" }).eq("id", id);
  if (error) throw error;
  await audit({ action: "client.updated", entityType: "client", entityId: id, newValue: { restored: true } });
}
