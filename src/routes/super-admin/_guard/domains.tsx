import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Copy, Globe, Loader2, Plus, ShieldCheck, Star, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { saQ, SUPER_ADMIN_QUERY_ROOT } from "@/lib/super-admin/queries";
import { pfQ, PLATFORM_QUERY_ROOT } from "@/lib/platform/queries";
import {
  addDomain,
  dnsInstructions,
  removeDomain,
  setPrimaryDomain,
  systemUrl,
  verifyDomain,
} from "@/lib/platform/domains";
import type { PortfolioDomainRecord } from "@/lib/platform/types";

export const Route = createFileRoute("/super-admin/_guard/domains")({
  component: DomainsPage,
});

function StatusBadge({ value, good }: { value: string; good: string }) {
  return (
    <Badge variant={value === good ? "default" : "secondary"} className="capitalize">
      {value}
    </Badge>
  );
}

function DomainsPage() {
  const qc = useQueryClient();
  const { data: portfolios } = useQuery(saQ.portfolios(false));
  const { data: domains, isLoading } = useQuery(pfQ.domains());
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ portfolio_id: "", domain: "", kind: "primary" as const });
  const [instructionsFor, setInstructionsFor] = useState<PortfolioDomainRecord | null>(null);

  const nameOf = useMemo(() => {
    const map = new Map((portfolios ?? []).map((p) => [p.id, p]));
    return (id: string) => map.get(id);
  }, [portfolios]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: PLATFORM_QUERY_ROOT });
    qc.invalidateQueries({ queryKey: SUPER_ADMIN_QUERY_ROOT });
  };

  const create = useMutation({
    mutationFn: () =>
      addDomain({ portfolio_id: form.portfolio_id, domain: form.domain, kind: form.kind }),
    onSuccess: (row) => {
      toast.success("Domain added. Verify it once DNS is pointed.");
      setOpen(false);
      setForm({ portfolio_id: "", domain: "", kind: "primary" });
      setInstructionsFor(row);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const verify = useMutation({
    mutationFn: (id: string) => verifyDomain(id),
    onSuccess: () => {
      toast.success("Domain verified and SSL issued.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const primary = useMutation({
    mutationFn: (row: PortfolioDomainRecord) => setPrimaryDomain(row.id, row.portfolio_id),
    onSuccess: () => {
      toast.success("Primary domain updated.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeDomain(id),
    onSuccess: () => {
      toast.success("Domain removed.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (domains ?? []).filter((d) =>
    filter === "all" ? true : filter === "verified"
      ? d.verification_status === "verified"
      : d.verification_status !== "verified",
  );

  return (
    <>
      <PageTitle
        title="Domains"
        description="Connect custom domains to portfolios. Every portfolio also keeps a permanent system URL."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add domain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a domain</DialogTitle>
                <DialogDescription>
                  Root, www and sub-domains are all supported. Verification runs after DNS is
                  pointed at the platform.
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  create.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label>Portfolio</Label>
                  <Select
                    value={form.portfolio_id}
                    onValueChange={(v) => setForm((f) => ({ ...f, portfolio_id: v }))}
                  >
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
                <div className="space-y-2">
                  <Label htmlFor="dom">Domain</Label>
                  <Input
                    id="dom"
                    placeholder="portfolio.example.com"
                    value={form.domain}
                    onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.kind}
                    onValueChange={(v) => setForm((f) => ({ ...f, kind: v as "primary" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="redirect">Redirect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={create.isPending || !form.portfolio_id || !form.domain}
                >
                  {create.isPending ? "Adding…" : "Add domain"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "verified", "pending"].map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      <Card className="border-border">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <Globe className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No domains yet. Portfolios stay reachable on their system URL.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Portfolio</TableHead>
                  <TableHead>System URL</TableHead>
                  <TableHead>SSL</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Connected</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => {
                  const portfolio = nameOf(d.portfolio_id);
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {d.is_primary && <Star className="h-3.5 w-3.5 text-gold" />}
                          {d.domain}
                        </div>
                        <span className="text-xs capitalize text-muted-foreground">{d.kind}</span>
                      </TableCell>
                      <TableCell>{portfolio?.name ?? "—"}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {portfolio ? systemUrl(portfolio.slug) : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={d.ssl_status} good="issued" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={d.verification_status} good="verified" />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {d.connected_at ? new Date(d.connected_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verify.mutate(d.id)}
                            disabled={verify.isPending}
                          >
                            {verify.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setInstructionsFor(d)}>
                            <Globe className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => primary.mutate(d)}
                            disabled={d.is_primary}
                          >
                            <Star className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => remove.mutate(d.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={!!instructionsFor} onOpenChange={(o) => !o && setInstructionsFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {instructionsFor?.domain}</DialogTitle>
            <DialogDescription>
              Create these records at the domain registrar, then press verify. Propagation can take
              up to 72 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {instructionsFor &&
              dnsInstructions(instructionsFor.domain, instructionsFor.verification_token).map(
                (record) => (
                  <div key={record.type + record.name} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs uppercase text-muted-foreground">{record.type}</p>
                        <p className="truncate text-sm font-medium">{record.name}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {record.value}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(record.value);
                          toast.success("Copied");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{record.purpose}</p>
                  </div>
                ),
              )}
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              The portfolio stays reachable on its system URL the whole time.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
