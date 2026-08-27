import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Loader2, Plus, ArrowRight, Activity } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sections } from "@/lib/admin-config";
import { countRows, selectScoped } from "@/lib/portfolio-repository";
import { ACTIVE_PORTFOLIO_SLUG } from "@/lib/portfolio-context";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

const counted = [
  { key: "subjects", table: "subjects", label: "Subjects" },
  { key: "courses", table: "featured_courses", label: "Courses" },
  { key: "testimonials", table: "testimonials", label: "Testimonials" },
  { key: "results", table: "student_results", label: "Results" },
  { key: "gallery", table: "gallery", label: "Gallery" },
  { key: "faqs", table: "faqs", label: "FAQs" },
  { key: "achievements", table: "achievements", label: "Achievements" },
  { key: "services", table: "teaching_services", label: "Services" },
];

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as any)[name] ?? Icons.Circle;
  return <C className={className} />;
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", ACTIVE_PORTFOLIO_SLUG, "stats"],
    queryFn: async () => {
      const counts = await Promise.all(
        counted.map(async (c) => ({ ...c, count: await countRows(c.table) })),
      );
      const enrollments = await selectScoped<any>(
        "enrollment_requests",
        "id, full_name, created_at, status",
        (query) => query.order("created_at", { ascending: false }).limit(60),
      );
      const announcements = await selectScoped<any>(
        "announcements",
        "id, title, updated_at, is_published",
        (query) => query.order("updated_at", { ascending: false }).limit(5),
      );
      return { counts, enrollments, announcements };
    },
  });


  if (isLoading || !data) {
    return (
      <div className="grid h-64 place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const totalContent = data.counts.reduce((a, c) => a + c.count, 0);
  const newRequests = data.enrollments.filter((e: any) => (e.status ?? "new") === "new").length;

  // enrollments per month (last 6 months)
  const months: { month: string; requests: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const label = d.toLocaleString(undefined, { month: "short" });
    const requests = data.enrollments.filter((e: any) => {
      const c = new Date(e.created_at);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    }).length;
    months.push({ month: label, requests });
  }

  const kpis = [
    { label: "Content items", value: totalContent, icon: "Layers" },
    { label: "Enrollment requests", value: data.enrollments.length, icon: "Inbox" },
    { label: "New / unhandled", value: newRequests, icon: "BellRing" },
    { label: "Managed sections", value: sections.length, icon: "Settings" },
  ];

  const quick = ["announcements", "popups", "gallery", "testimonials", "courses", "countdown"]
    .map((k) => sections.find((s) => s.key === k)!)
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Overview</div>
        <h1 className="mt-1 font-serif text-3xl">Dashboard</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-primary" /> Every change publishes to the live website instantly.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="border-border p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{k.label}</span>
                <Icon name={k.icon} className="h-4 w-4 text-gold" />
              </div>
              <div className="mt-3 font-serif text-4xl">{k.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border p-5">
          <h2 className="font-serif text-xl">Content by section</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.counts}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ opacity: 0.1 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.counts.map((_, i) => (
                    <Cell key={i} fill={i % 2 ? "var(--gold)" : "var(--primary)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border p-5">
          <h2 className="font-serif text-xl">Enrollment requests (6 months)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-xl">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quick.map((s) => (
            <Link key={s.key} to="/admin/$section" params={{ section: s.key }}>
              <Card className="flex items-center gap-3 border-border p-4 transition-colors hover:border-primary/50">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">Manage entries</div>
                </div>
                <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Recent announcements</h2>
            <Link to="/admin/$section" params={{ section: "announcements" }}>
              <Button variant="ghost" size="sm">
                Manage <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.announcements.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet.</p>}
            {data.announcements.map((a: any) => (
              <div key={a.id} className="flex items-center gap-2 border-b border-border pb-2 last:border-0">
                <span className="min-w-0 flex-1 truncate text-sm">{a.title}</span>
                <Badge variant={a.is_published ? "default" : "secondary"}>{a.is_published ? "Live" : "Off"}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(a.updated_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Latest requests</h2>
            <Link to="/admin/$section" params={{ section: "enrollments" }}>
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.enrollments.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
            {data.enrollments.slice(0, 5).map((e: any) => (
              <div key={e.id} className="flex items-center gap-2 border-b border-border pb-2 last:border-0">
                <span className="min-w-0 flex-1 truncate text-sm">{e.full_name}</span>
                <Badge variant={(e.status ?? "new") === "new" ? "default" : "secondary"}>{e.status ?? "new"}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
