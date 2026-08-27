import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Layers, PauseCircle, PlayCircle, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/super-admin/SuperAdminShell";
import { saQ } from "@/lib/super-admin/queries";
import { ACTIVITY_LABELS } from "@/lib/super-admin/types";

export const Route = createFileRoute("/super-admin/_guard/")({
  component: SuperAdminDashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-gold" />
      </div>
      <div className="mt-3 font-serif text-3xl">{value}</div>
    </Card>
  );
}

function monthKey(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function SuperAdminDashboard() {
  const portfolios = useQuery(saQ.portfolios(true));
  const admins = useQuery(saQ.admins);
  const logs = useQuery(saQ.logs);

  const live = (portfolios.data ?? []).filter((p) => !p.deleted_at);
  const active = live.filter((p) => p.status === "active");
  const suspended = live.filter((p) => p.status !== "active");
  const recent = live.slice(0, 5);

  const chart = Object.entries(
    live.reduce<Record<string, number>>((acc, p) => {
      const k = monthKey(p.created_at);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([month, count]) => ({ month, count }))
    .reverse();

  if (portfolios.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Dashboard" description="Every portfolio instance on the platform." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total portfolios" value={live.length} icon={Layers} />
        <StatCard label="Active" value={active.length} icon={PlayCircle} />
        <StatCard label="Suspended" value={suspended.length} icon={PauseCircle} />
        <StatCard label="Total admins" value={admins.data?.length ?? 0} icon={Users} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="border-border p-5 lg:col-span-2">
          <h2 className="font-serif text-lg">Portfolios created</h2>
          <div className="mt-4 h-64">
            {chart.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                No data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="border-border p-5">
          <h2 className="font-serif text-lg">Recently created</h2>
          <ul className="mt-4 space-y-3">
            {recent.length === 0 && <li className="text-sm text-muted-foreground">Nothing yet.</li>}
            {recent.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to="/super-admin/portfolios/$id"
                    params={{ id: p.id }}
                    className="block truncate text-sm hover:underline"
                  >
                    {p.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">/{p.slug}</span>
                </div>
                <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 border-border p-5">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-gold" />
          <h2 className="font-serif text-lg">Latest activity</h2>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {(logs.data ?? []).slice(0, 8).map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span>
                {ACTIVITY_LABELS[l.action] ?? l.action}
                {l.portfolio_name ? ` — ${l.portfolio_name}` : ""}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(l.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {(logs.data ?? []).length === 0 && (
            <li className="py-2 text-sm text-muted-foreground">No activity recorded yet.</li>
          )}
        </ul>
      </Card>
    </>
  );
}
