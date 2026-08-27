import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Pencil, PauseCircle, PlayCircle, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  createClient,
  deleteClient,
  setClientStatus,
  updateClient,
} from "@/lib/platform/clients";
import type { ClientInput, ClientRecord } from "@/lib/platform/types";

export const Route = createFileRoute("/super-admin/_guard/clients")({
  component: ClientsPage,
});

const EMPTY: ClientInput = {
  portfolio_id: null,
  full_name: "",
  company: null,
  email: null,
  phone: null,
  address: null,
  country: null,
  timezone: null,
  notes: null,
  status: "active",
};

function ClientsPage() {
  const qc = useQueryClient();
  const { data: clients, isLoading } = useQuery(pfQ.clients());
  const { data: portfolios } = useQuery(saQ.portfolios(false));
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ClientRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ClientInput>(EMPTY);

  useEffect(() => {
    if (editing) {
      const { id: _id, created_at: _c, updated_at: _u, deleted_at: _d, ...rest } = editing;
      setForm(rest as ClientInput);
    } else if (creating) {
      setForm(EMPTY);
    }
  }, [editing, creating]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: PLATFORM_QUERY_ROOT });
    qc.invalidateQueries({ queryKey: SUPER_ADMIN_QUERY_ROOT });
  };

  const portfolioName = useMemo(() => {
    const map = new Map((portfolios ?? []).map((p) => [p.id, p.name]));
    return (id: string | null) => (id ? (map.get(id) ?? "—") : "Unassigned");
  }, [portfolios]);

  const save = useMutation({
    mutationFn: () => (editing ? updateClient(editing.id, form) : createClient(form)),
    onSuccess: () => {
      toast.success(editing ? "Client updated." : "Client created.");
      setEditing(null);
      setCreating(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (c: ClientRecord) =>
      setClientStatus(c.id, c.status === "active" ? "suspended" : "active"),
    onSuccess: () => {
      toast.success("Client status updated.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      toast.success("Client deleted.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (clients ?? []).filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [c.full_name, c.company, c.email, c.phone, c.country]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const set = (patch: Partial<ClientInput>) => setForm((f) => ({ ...f, ...patch }));
  const dialogOpen = creating || !!editing;

  return (
    <>
      <PageTitle
        title="Clients"
        description="The people behind each portfolio — contact details, status and assignment."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> New client
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search name, company, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No clients match this search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Portfolio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.full_name}</TableCell>
                    <TableCell>{c.company ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>{c.email ?? "—"}</div>
                      <div>{c.phone ?? ""}</div>
                    </TableCell>
                    <TableCell className="text-sm">{c.country ?? "—"}</TableCell>
                    <TableCell className="text-sm">{portfolioName(c.portfolio_id)}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "active" ? "default" : "secondary"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggle.mutate(c)}>
                          {c.status === "active" ? (
                            <PauseCircle className="h-3.5 w-3.5" />
                          ) : (
                            <PlayCircle className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => remove.mutate(c.id)}
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            setEditing(null);
            setCreating(false);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit client" : "New client"}</DialogTitle>
            <DialogDescription>Contact and assignment details for this client.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c-name">Name</Label>
                <Input
                  id="c-name"
                  value={form.full_name}
                  onChange={(e) => set({ full_name: e.target.value })}
                  maxLength={120}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-company">Company</Label>
                <Input
                  id="c-company"
                  value={form.company ?? ""}
                  onChange={(e) => set({ company: e.target.value })}
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">Email</Label>
                <Input
                  id="c-email"
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => set({ email: e.target.value })}
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-phone">Phone</Label>
                <Input
                  id="c-phone"
                  value={form.phone ?? ""}
                  onChange={(e) => set({ phone: e.target.value })}
                  maxLength={40}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-country">Country</Label>
                <Input
                  id="c-country"
                  value={form.country ?? ""}
                  onChange={(e) => set({ country: e.target.value })}
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-tz">Timezone</Label>
                <Input
                  id="c-tz"
                  placeholder="Asia/Karachi"
                  value={form.timezone ?? ""}
                  onChange={(e) => set({ timezone: e.target.value })}
                  maxLength={64}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-address">Address</Label>
              <Input
                id="c-address"
                value={form.address ?? ""}
                onChange={(e) => set({ address: e.target.value })}
                maxLength={255}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Assigned portfolio</Label>
                <Select
                  value={form.portfolio_id ?? "none"}
                  onValueChange={(v) => set({ portfolio_id: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {(portfolios ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set({ status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-notes">Notes</Label>
              <Textarea
                id="c-notes"
                rows={3}
                value={form.notes ?? ""}
                onChange={(e) => set({ notes: e.target.value })}
                maxLength={2000}
              />
            </div>

            <Button type="submit" className="w-full" disabled={save.isPending}>
              {save.isPending ? "Saving…" : editing ? "Save changes" : "Create client"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
