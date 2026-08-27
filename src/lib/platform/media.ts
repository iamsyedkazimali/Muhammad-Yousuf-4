import { supabase } from "@/integrations/supabase/client";
import { audit } from "./audit";
import { notify } from "./notifications";
import type { MediaAssetRecord, MediaKind } from "./types";

/**
 * Central media library backed by Supabase Storage.
 *
 * Layout: `<portfolio-id>/<folder>/<timestamp>-<safe-name>` so client files
 * can never mix. The bucket is private; URLs are long-lived signed links.
 */
export const MEDIA_BUCKET = "portfolio-media";
export const MEDIA_FOLDERS = ["images", "logos", "favicons", "documents", "videos"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 year
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const STORAGE_QUOTA_BYTES = 2 * 1024 * 1024 * 1024;

const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "video/mp4",
  "video/webm",
  "application/pdf",
];

const t = () => supabase.from("media_assets" as never) as any;

export function kindFor(mime: string | null | undefined): MediaKind {
  if (!mime) return "other";
  if (mime === "image/x-icon" || mime === "image/vnd.microsoft.icon") return "icon";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "document";
  return "other";
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function safeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function signedUrl(path: string): Promise<string> {
  const { data } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? "";
}

export async function listMedia(portfolioId?: string): Promise<MediaAssetRecord[]> {
  let query = t().select("*").order("created_at", { ascending: false });
  if (portfolioId) query = query.eq("portfolio_id", portfolioId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as MediaAssetRecord[];
}

export async function storageUsage(portfolioId?: string): Promise<number> {
  const rows = await listMedia(portfolioId);
  return rows.reduce((sum, r) => sum + Number(r.size_bytes ?? 0), 0);
}

/** Validates, uploads and registers one file. */
export async function uploadMedia(args: {
  portfolioId: string;
  folder: MediaFolder | string;
  file: File;
  altText?: string;
  replacePath?: string;
}): Promise<MediaAssetRecord> {
  const { portfolioId, folder, file } = args;

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name} is larger than the ${formatBytes(MAX_UPLOAD_BYTES)} limit.`);
  }
  if (file.type && !ALLOWED_MIME.includes(file.type)) {
    throw new Error(`${file.type} files are not allowed.`);
  }

  const path = args.replacePath ?? `${portfolioId}/${folder}/${Date.now()}-${safeName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { upsert: Boolean(args.replacePath), contentType: file.type || undefined });
  if (uploadError) throw uploadError;

  const url = await signedUrl(path);
  const row = {
    portfolio_id: portfolioId,
    folder,
    file_name: file.name,
    storage_path: path,
    public_url: url,
    mime_type: file.type || null,
    kind: kindFor(file.type),
    size_bytes: file.size,
    alt_text: args.altText ?? null,
  };

  const { data, error } = await t().upsert(row, { onConflict: "storage_path" }).select("*").single();
  if (error) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    throw error;
  }

  await audit({
    action: "media.uploaded",
    entityType: "media",
    entityId: (data as MediaAssetRecord).id,
    portfolioId,
    newValue: { file_name: file.name, size_bytes: file.size, folder },
  });

  const used = await storageUsage(portfolioId);
  if (used > STORAGE_QUOTA_BYTES * 0.9) {
    await notify({
      type: "storage.limit",
      severity: "warning",
      title: "Storage limit approaching",
      message: `A portfolio is using ${formatBytes(used)} of ${formatBytes(STORAGE_QUOTA_BYTES)}.`,
      portfolioId,
    });
  }

  return data as MediaAssetRecord;
}

export async function deleteMedia(asset: MediaAssetRecord): Promise<void> {
  await supabase.storage.from(MEDIA_BUCKET).remove([asset.storage_path]);
  const { error } = await t().delete().eq("id", asset.id);
  if (error) throw error;
  await audit({
    action: "media.deleted",
    entityType: "media",
    entityId: asset.id,
    portfolioId: asset.portfolio_id,
    oldValue: { file_name: asset.file_name, storage_path: asset.storage_path },
  });
}

export async function updateMedia(id: string, values: { alt_text?: string; folder?: string }) {
  const { error } = await t().update(values).eq("id", id);
  if (error) throw error;
}

/** Refreshes an expired signed URL for one asset. */
export async function refreshMediaUrl(asset: MediaAssetRecord): Promise<string> {
  const url = await signedUrl(asset.storage_path);
  if (url) await t().update({ public_url: url }).eq("id", asset.id);
  return url;
}

/**
 * Detects media that no content row references. Purely advisory — nothing is
 * deleted automatically.
 */
export async function findUnusedMedia(
  assets: MediaAssetRecord[],
  contentBlobs: string[],
): Promise<Set<string>> {
  const haystack = contentBlobs.join("\n");
  const unused = new Set<string>();
  for (const asset of assets) {
    if (!haystack.includes(asset.storage_path) && !haystack.includes(asset.file_name)) {
      unused.add(asset.id);
    }
  }
  return unused;
}
