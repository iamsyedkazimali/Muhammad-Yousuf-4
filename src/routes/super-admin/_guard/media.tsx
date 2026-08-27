import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, FileText, Film, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTitle } from "@/components/super-admin/SuperAdminShell";
import { saQ } from "@/lib/super-admin/queries";
import { pfQ, PLATFORM_QUERY_ROOT } from "@/lib/platform/queries";
import {
  deleteMedia,
  formatBytes,
  MEDIA_FOLDERS,
  refreshMediaUrl,
  STORAGE_QUOTA_BYTES,
  uploadMedia,
} from "@/lib/platform/media";
import type { MediaAssetRecord } from "@/lib/platform/types";

export const Route = createFileRoute("/super-admin/_guard/media")({
  component: MediaPage,
});

const ICON = { image: ImageIcon, icon: ImageIcon, video: Film, document: FileText, other: FileText };

function MediaPage() {
  const qc = useQueryClient();
  const { data: portfolios } = useQuery(saQ.portfolios(false));
  const [portfolioId, setPortfolioId] = useState<string>("");
  const [folder, setFolder] = useState<string>("images");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: assets, isLoading } = useQuery(pfQ.media(portfolioId || undefined));

  const activePortfolio = portfolioId || (portfolios ?? [])[0]?.id || "";

  const invalidate = () => qc.invalidateQueries({ queryKey: PLATFORM_QUERY_ROOT });

  const upload = useMutation({
    mutationFn: async (files: FileList) => {
      if (!activePortfolio) throw new Error("Select a portfolio first.");
      for (const file of Array.from(files)) {
        await uploadMedia({ portfolioId: activePortfolio, folder, file });
      }
    },
    onSuccess: () => {
      toast.success("Upload complete.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (asset: MediaAssetRecord) => deleteMedia(asset),
    onSuccess: () => {
      toast.success("File deleted.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (assets ?? []).filter((a) => {
    if (kind !== "all" && a.kind !== kind) return false;
    if (folder !== "all" && a.folder !== folder) return false;
    const q = search.trim().toLowerCase();
    return !q || a.file_name.toLowerCase().includes(q);
  });

  const used = useMemo(
    () => (assets ?? []).reduce((n, a) => n + Number(a.size_bytes ?? 0), 0),
    [assets],
  );

  const copyUrl = async (asset: MediaAssetRecord) => {
    const url = (await refreshMediaUrl(asset)) || asset.public_url;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied — paste it into any content field.");
  };

  return (
    <>
      <PageTitle
        title="Media Library"
        description="Every file is stored under its own portfolio folder — client files never mix."
      />

      <Card className="mb-4 border-border p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Portfolio</Label>
            <Select value={portfolioId} onValueChange={setPortfolioId}>
              <SelectTrigger>
                <SelectValue placeholder="All portfolios" />
              </SelectTrigger>
              <SelectContent>
                {(portfolios ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Folder</Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All folders</SelectItem>
                {MEDIA_FOLDERS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["all", "image", "icon", "video", "document"].map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="media-search">Search</Label>
            <Input
              id="media-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="File name…"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && upload.mutate(e.target.files)}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={upload.isPending || folder === "all"}
          >
            <Upload className="mr-2 h-4 w-4" />
            {upload.isPending ? "Uploading…" : "Upload"}
          </Button>
          <div className="min-w-[200px] flex-1">
            <Progress value={Math.min(100, (used / STORAGE_QUOTA_BYTES) * 100)} />
            <p className="mt-1 text-xs text-muted-foreground">
              {formatBytes(used)} of {formatBytes(STORAGE_QUOTA_BYTES)} used · {rows.length} files
            </p>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card className="border-border p-12 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No media here yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((asset) => {
            const Icon = ICON[asset.kind as keyof typeof ICON] ?? FileText;
            return (
              <Card key={asset.id} className="overflow-hidden border-border">
                <div className="flex h-32 items-center justify-center bg-secondary/40">
                  {asset.kind === "image" || asset.kind === "icon" ? (
                    <img
                      src={asset.public_url}
                      alt={asset.alt_text ?? asset.file_name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm font-medium" title={asset.file_name}>
                    {asset.file_name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{asset.folder}</Badge>
                    {formatBytes(Number(asset.size_bytes))}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => copyUrl(asset)}>
                      <Copy className="mr-1 h-3.5 w-3.5" /> Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => remove.mutate(asset)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
