import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { ACTIVITY_LABELS } from "@/lib/super-admin/types";

export const Route = createFileRoute("/super-admin/_guard/logs")({
  component: LogsPage,
});

const PAGE_SIZE = 20;

function LogsPage() {
  const { data, isLoading } = useQuery(saQ.logs);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter(
      (l) =>
        (action === "all" || l.action === action) &&
        (!term ||
          (l.portfolio_name ?? "").toLowerCase().includes(term) ||
          (l.actor_email ?? "").toLowerCase().includes(term) ||
          l.action.toLowerCase().includes(term)),
    );
  }, [data, search, action]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <PageTitle title="Activity Logs" description="Every administrative action on the platform." />

      <Card className="border-border p-4">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search portfolio, actor or action…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-xs"
            aria-label="Search activity logs"
          />
          <Select
            value={action}
            onValueChange={(v) => {
              setAction(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[220px]" aria-label="Filter by action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 space-y-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
          ) : visible.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No activity recorded yet.
            </div>
          ) : (
            visible.map((l) => (
              <div
                key={l.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3"
              >
                <Badge variant="secondary">{ACTIVITY_LABELS[l.action] ?? l.action}</Badge>
                <span className="text-sm">
                  {l.portfolio_name ?? l.entity_type}
                  {l.actor_email ? (
                    <span className="text-muted-foreground"> · by {l.actor_email}</span>
                  ) : null}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {rows.length} entr{rows.length === 1 ? "y" : "ies"} · page {current} of {pageCount}
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
    </>
  );
}
