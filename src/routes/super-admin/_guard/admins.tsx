import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, MoreHorizontal, PauseCircle, PlayCircle, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTitle } from "@/components/super-admin/SuperAdminShell";
import {
  CreateAdminDialog,
  ForcePasswordDialog,
} from "@/components/super-admin/AdminAccountDialogs";
import type { PortfolioAdminRecord } from "@/lib/super-admin/types";
import { saQ, SUPER_ADMIN_QUERY_ROOT } from "@/lib/super-admin/queries";
import { sendAdminPasswordReset, setAdminStatus, softDeleteAdmin } from "@/lib/super-admin/repository";

export const Route = createFileRoute("/super-admin/_guard/admins")({
  component: AdminsPage,
});

function AdminsPage() {
  const qc = useQueryClient();
  const admins = useQuery(saQ.admins);
  const portfolios = useQuery(saQ.portfolios(true));
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [creating, setCreating] = useState(false);
  const [forcing, setForcing] = useState<PortfolioAdminRecord | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: SUPER_ADMIN_QUERY_ROOT });

  const toggle = useMutation({
    mutationFn: ({ id, next }: { id: string; next: "active" | "suspended" }) =>
      setAdminStatus(id, next),
    onSuccess: () => {
      toast.success("Admin status updated.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => softDeleteAdmin(id),
    onSuccess: () => {
      toast.success("Admin removed.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reset = useMutation({
    mutationFn: (email: string) => sendAdminPasswordReset(email),
    onSuccess: () => toast.success("Password reset email sent."),
    onError: (e: Error) => toast.error(e.message),
  });

  const portfolioName = (id: string) =>
    (portfolios.data ?? []).find((p) => p.id === id)?.name ?? "—";

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (admins.data ?? []).filter(
      (a) =>
        (status === "all" || a.status === status) &&
        (!term ||
          a.email.toLowerCase().includes(term) ||
          (a.full_name ?? "").toLowerCase().includes(term)),
    );
  }, [admins.data, search, status]);

  return (
    <>
      <PageTitle
        title="Portfolio Admins"
        description="Accounts that manage a single portfolio and nothing else."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> New admin
          </Button>
        }
      />

      <Card className="border-border p-4">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
            aria-label="Search admins"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 overflow-x-auto">
          {admins.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No portfolio admins yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Portfolio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.full_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{a.email}</TableCell>
                    <TableCell>{portfolioName(a.portfolio_id)}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "active" ? "default" : "secondary"}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {a.last_login_at ? new Date(a.last_login_at).toLocaleString() : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${a.email}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {a.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => toggle.mutate({ id: a.id, next: "suspended" })}
                            >
                              <PauseCircle className="mr-2 h-4 w-4" /> Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => toggle.mutate({ id: a.id, next: "active" })}
                            >
                              <PlayCircle className="mr-2 h-4 w-4" /> Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => reset.mutate(a.email)}>
                            <KeyRound className="mr-2 h-4 w-4" /> Send password reset
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setForcing(a)}>
                            <ShieldAlert className="mr-2 h-4 w-4" /> Force password reset
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => remove.mutate(a.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <CreateAdminDialog
        portfolios={(portfolios.data ?? []).filter((p) => !p.deleted_at)}
        open={creating}
        onOpenChange={setCreating}
      />
      <ForcePasswordDialog admin={forcing} onOpenChange={(open) => !open && setForcing(null)} />
    </>
  );
}
