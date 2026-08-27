import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, Download, RotateCcw, Trash2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageTitle } from "@/components/super-admin/SuperAdminShell";
import { saQ } from "@/lib/super-admin/queries";
import { pfQ, PLATFORM_QUERY_ROOT } from "@/lib/platform/queries";
import {
  applyPayload,
  buildSnapshot,
  createBackup,
  deleteBackup,
  downloadFile,
  loadBackupPayload,
  payloadToCsv,
  restoreBackup,
  validatePayload,
} from "@/lib/platform/backups";
import { formatBytes } from "@/lib/platform/media";

export const Route = createFileRoute("/super-admin/_guard/backups")({
  component: BackupsPage,
});

function BackupsPage() {
  const qc = useQueryClient();
  const { data: portfolios } = useQuery(saQ.portfolios(false));
  const [portfolioId, setPortfolioId] = useState("");
  const [label, setLabel] = useState("");
  const { data: backups, isLoading } = useQuery(pfQ.backups(portfolioId || undefined));

  const invalidate = () => qc.invalidateQueries({ queryKey: PLATFORM_QUERY_ROOT });
  const requirePortfolio = () => {
    if (!portfolioId) throw new Error("Select a portfolio first.");
    return portfolioId;
  };

  const create = useMutation({
    mutationFn: () => createBackup(requirePortfolio(), label),
    onSuccess: () => {
      toast.success("Backup created.");
      setLabel("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const download = useMutation({
    mutationFn: async ({ id, format }: { id: string; format: "json" | "csv" }) => {
      const payload = await loadBackupPayload(id);
      if (format === "json") {
        downloadFile(`backup-${id}.json`, JSON.stringify(payload, null, 2), "application/json");
      } else {
        downloadFile(`backup-${id}.csv`, payloadToCsv(payload), "text/csv");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportLive = useMutation({
    mutationFn: async (format: "json" | "csv") => {
      const payload = await buildSnapshot(requirePortfolio());
      if (format === "json") {
        downloadFile("portfolio-export.json", JSON.stringify(payload, null, 2), "application/json");
      } else {
        downloadFile("portfolio-export.csv", payloadToCsv(payload), "text/csv");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const restore = useMutation({
    mutationFn: (id: string) => restoreBackup(requirePortfolio(), id),
    onSuccess: (r) => {
      toast.success(`Restored ${r.restoredRows} rows.`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteBackup(id),
    onSuccess: () => {
      toast.success("Backup deleted.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const importFile = useMutation({
    mutationFn: async (file: File) => {
      const id = requirePortfolio();
      const parsed = JSON.parse(await file.text());
      const check = validatePayload(parsed);
      if (!check.ok) throw new Error(check.errors.join(" "));
      check.warnings.forEach((w) => toast.warning(w));
      return applyPayload(id, parsed);
    },
    onSuccess: (r) => {
      toast.success(`Imported ${r.restoredRows} rows.`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageTitle
        title="Backup, Restore & Transfer"
        description="Snapshot a portfolio's content, settings, SEO, media index and admins — then restore, export or import it."
      />

      <Card className="mb-6 border-border p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Portfolio</Label>
            <Select value={portfolioId} onValueChange={setPortfolioId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a portfolio" />
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
            <Label htmlFor="bk-label">Backup label</Label>
            <Input
              id="bk-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Before content refresh"
              maxLength={120}
            />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={() => create.mutate()}
              disabled={create.isPending || !portfolioId}
            >
              <Archive className="mr-2 h-4 w-4" />
              {create.isPending ? "Creating…" : "Create backup"}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportLive.mutate("json")} disabled={!portfolioId}>
            <Download className="mr-2 h-4 w-4" /> Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportLive.mutate("csv")} disabled={!portfolioId}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <label className="inline-flex">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importFile.mutate(e.target.files[0])}
            />
            <Button variant="outline" size="sm" asChild disabled={!portfolioId}>
              <span>
                <Upload className="mr-2 h-4 w-4" /> Import JSON
              </span>
            </Button>
          </label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Imports are validated before anything is written, and a safety snapshot is re-applied if a
          table fails mid-restore.
        </p>
      </Card>

      <Card className="border-border">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (backups ?? []).length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No backups yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Tables</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(backups ?? []).map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(b.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{b.table_count}</TableCell>
                    <TableCell>{b.row_count}</TableCell>
                    <TableCell>{formatBytes(Number(b.size_bytes))}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => download.mutate({ id: b.id, format: "json" })}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restore.mutate(b.id)}
                          disabled={restore.isPending}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => remove.mutate(b.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </>
  );
}
