import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Mail, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteRow, listAll, updateRow } from "@/lib/portfolio-repository";
import { ACTIVE_PORTFOLIO_SLUG } from "@/lib/portfolio-context";

export function EnrollmentsManager() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", ACTIVE_PORTFOLIO_SLUG, "enrollment_requests"],
    queryFn: () => listAll<any>("enrollment_requests", "created_at", false),
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await updateRow("enrollment_requests", id, { status });
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    refetch();
    qc.invalidateQueries({ queryKey: ["admin", ACTIVE_PORTFOLIO_SLUG, "stats"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    const { error } = await deleteRow("enrollment_requests", id);
    if (error) return toast.error(error.message);
    refetch();
  };

  if (isLoading)
    return (
      <Card className="p-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </Card>
    );

  if (rows.length === 0)
    return <Card className="p-10 text-center text-muted-foreground">No enrollment requests yet.</Card>;

  return (
    <div className="grid gap-3">
      {rows.map((r: any) => (
        <Card key={r.id} className="border-border p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.full_name}</span>
                <Badge variant={r.status === "contacted" ? "default" : "secondary"}>{r.status ?? "new"}</Badge>
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{r.email}</span>
                {r.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{r.phone}</span>}
                {r.country && <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{r.country}</span>}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Level: {r.level ?? "—"} · {new Date(r.created_at).toLocaleString()}
              </div>
              {r.message && <p className="mt-3 text-sm">{r.message}</p>}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "contacted")}>
                Mark contacted
              </Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(r.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
