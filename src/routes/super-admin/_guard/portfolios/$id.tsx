import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/super-admin/SuperAdminShell";
import { PortfolioForm } from "@/components/super-admin/PortfolioForm";
import { saQ, SUPER_ADMIN_QUERY_ROOT } from "@/lib/super-admin/queries";
import {
  restorePortfolio,
  setPortfolioStatus,
  slugExists,
  updatePortfolio,
} from "@/lib/super-admin/repository";
import type { PortfolioInput } from "@/lib/super-admin/types";

type Search = { edit?: boolean };

export const Route = createFileRoute("/super-admin/_guard/portfolios/$id")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    edit: search['edit'] === true || search['edit'] === "true",
  }),
  component: PortfolioDetail,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function PortfolioDetail() {
  const { id } = Route.useParams();
  const { edit } = Route.useSearch();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(saQ.portfolio(id));
  const [editing, setEditing] = useState(Boolean(edit));

  const invalidate = () => qc.invalidateQueries({ queryKey: SUPER_ADMIN_QUERY_ROOT });

  const save = useMutation({
    mutationFn: async (values: PortfolioInput) => {
      if (await slugExists(values.slug, id)) throw new Error(`The slug "${values.slug}" is taken.`);
      return updatePortfolio(id, values);
    },
    onSuccess: () => {
      toast.success("Portfolio updated.");
      setEditing(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (next: "active" | "suspended") => setPortfolioStatus(id, next),
    onSuccess: () => {
      toast.success("Status updated.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const restore = useMutation({
    mutationFn: () => restorePortfolio(id),
    onSuccess: () => {
      toast.success("Portfolio restored.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Skeleton className="h-64 w-full max-w-3xl rounded-xl" />;
  if (!data) {
    return (
      <Card className="max-w-lg border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">This portfolio no longer exists.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/super-admin/portfolios">Back to portfolios</Link>
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/super-admin/portfolios">
          <ArrowLeft className="mr-2 h-4 w-4" /> All portfolios
        </Link>
      </Button>

      <PageTitle
        title={data.name}
        description={data.description ?? `Portfolio slug /${data.slug}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setEditing((v) => !v)}>
              {editing ? "Cancel edit" : "Edit"}
            </Button>
            {data.deleted_at ? (
              <Button onClick={() => restore.mutate()}>Restore</Button>
            ) : data.status === "active" ? (
              <Button variant="outline" onClick={() => toggle.mutate("suspended")}>
                Suspend
              </Button>
            ) : (
              <Button onClick={() => toggle.mutate("active")}>Activate</Button>
            )}
            <Button asChild variant="outline">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Open
              </a>
            </Button>
          </div>
        }
      />

      {editing ? (
        <Card className="max-w-3xl border-border p-6">
          <PortfolioForm
            initial={data}
            submitLabel="Save changes"
            busy={save.isPending}
            onSubmit={(v) => save.mutate(v)}
          />
        </Card>
      ) : (
        <Card className="max-w-3xl border-border p-6">
          <Row label="Name" value={data.name} />
          <Row label="Slug" value={`/${data.slug}`} />
          <Row
            label="Status"
            value={
              <Badge variant={data.status === "active" ? "default" : "secondary"}>
                {data.deleted_at ? "deleted" : data.status}
              </Badge>
            }
          />
          <Row label="Theme" value={data.theme_name ?? "—"} />
          <Row label="Logo" value={data.logo ?? "—"} />
          <Row label="Favicon" value={data.favicon ?? "—"} />
          <Row label="Description" value={data.description ?? "—"} />
          <Row label="Created" value={new Date(data.created_at).toLocaleString()} />
          <Row label="Updated" value={new Date(data.updated_at).toLocaleString()} />
        </Card>
      )}
    </>
  );
}
