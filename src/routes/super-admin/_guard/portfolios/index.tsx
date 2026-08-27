import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Copy,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Pencil,
  PauseCircle,
  PlayCircle,
  Plus,
  Trash2,
  UserCircle,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageTitle } from "@/components/super-admin/SuperAdminShell";
import { CloneDialog } from "@/components/super-admin/CloneDialog";
import { saQ, SUPER_ADMIN_QUERY_ROOT } from "@/lib/super-admin/queries";
import { setPortfolioStatus, softDeletePortfolio } from "@/lib/super-admin/repository";
import type { PortfolioRecord } from "@/lib/super-admin/types";

export const Route = createFileRoute("/super-admin/_guard/portfolios/")({
  component: PortfolioList,
});

const PAGE_SIZE = 8;

function PortfolioList() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data, isLoading } = useQuery(saQ.portfolios(false));
  const admins = useQuery(saQ.admins);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("created_desc");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<PortfolioRecord | null>(null);
  const [cloneSource, setCloneSource] = useState<PortfolioRecord | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: SUPER_ADMIN_QUERY_ROOT });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: "active" | "suspended" }) =>
      setPortfolioStatus(id, next),
    onSuccess: (_d, v) => {
      toast.success(v.next === "active" ? "Portfolio activated." : "Portfolio suspended.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => softDeletePortfolio(id),
    onSuccess: () => {
      toast.success("Portfolio deleted (soft delete — data is retained).");
      setPendingDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const adminFor = (portfolioId: string) =>
    (admins.data ?? []).find((a) => a.portfolio_id === portfolioId) ?? null;

  const rows = useMemo(() => {
    let list = [...(data ?? [])];
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term) ||
          (p.theme_name ?? "").toLowerCase().includes(term),
      );
    }
    if (status !== "all") list = list.filter((p) => p.status === status);
    list.sort((a, b) => {
      switch (sort) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "updated_desc":
          return b.updated_at.localeCompare(a.updated_at);
        default:
          return b.created_at.localeCompare(a.created_at);
      }
    });
    return list;
  }, [data, search, status, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <PageTitle
        title="Portfolios"
        description="Every portfolio instance running on this platform."
        action={
          <Button asChild>
            <Link to="/super-admin/portfolios/new">
              <Plus className="mr-2 h-4 w-4" /> New portfolio
            </Link>
          </Button>
        }
      />

      <Card className="border-border p-4">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search name, slug or theme…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-xs"
            aria-label="Search portfolios"
          />
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]" aria-label="Sort portfolios">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">Newest first</SelectItem>
              <SelectItem value="updated_desc">Recently updated</SelectItem>
              <SelectItem value="name_asc">Name A→Z</SelectItem>
              <SelectItem value="name_desc">Name Z→A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No portfolios match these filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Assigned admin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((p) => {
                  const admin = adminFor(p.id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">/{p.slug}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "active" ? "default" : "secondary"}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.theme_name ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(p.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {admin ? admin.email : "Unassigned"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                              onClick={() =>
                                nav({ to: "/super-admin/portfolios/$id", params: { id: p.id } })
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                nav({
                                  to: "/super-admin/portfolios/$id",
                                  params: { id: p.id },
                                  search: { edit: true },
                                })
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {p.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  statusMutation.mutate({ id: p.id, next: "suspended" })
                                }
                              >
                                <PauseCircle className="mr-2 h-4 w-4" /> Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => statusMutation.mutate({ id: p.id, next: "active" })}
                              >
                                <PlayCircle className="mr-2 h-4 w-4" /> Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => nav({ to: "/super-admin/admins" })}>
                              <UserCircle className="mr-2 h-4 w-4" /> View admin
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/${p.slug}`} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" /> Open portfolio
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href="/admin" target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" /> Open admin panel
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setCloneSource(p)}>
                              <Copy className="mr-2 h-4 w-4" /> Clone portfolio
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setPendingDelete(p)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {rows.length} portfolio{rows.length === 1 ? "" : "s"} · page {current} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= pageCount}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{pendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This is a soft delete — the record and all its content stay in the database and can be
              restored later. The portfolio goes offline immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CloneDialog
        source={cloneSource}
        open={!!cloneSource}
        onOpenChange={(open) => !open && setCloneSource(null)}
      />
    </>

  );
}
