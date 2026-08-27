import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/super-admin/SuperAdminShell";
import { PortfolioForm } from "@/components/super-admin/PortfolioForm";
import { createPortfolio, slugExists } from "@/lib/super-admin/repository";
import { SUPER_ADMIN_QUERY_ROOT } from "@/lib/super-admin/queries";
import type { PortfolioInput } from "@/lib/super-admin/types";

export const Route = createFileRoute("/super-admin/_guard/portfolios/new")({
  component: CreatePortfolioPage,
});

function CreatePortfolioPage() {
  const nav = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: PortfolioInput) => {
      if (!values.name) throw new Error("Portfolio name is required.");
      if (!values.slug) throw new Error("Slug is required.");
      if (await slugExists(values.slug)) throw new Error(`The slug "${values.slug}" is taken.`);
      return createPortfolio(values);
    },
    onSuccess: (row) => {
      toast.success(`Portfolio “${row.name}” created.`);
      qc.invalidateQueries({ queryKey: SUPER_ADMIN_QUERY_ROOT });
      nav({ to: "/super-admin/portfolios/$id", params: { id: row.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageTitle
        title="Create portfolio"
        description="Creates an empty portfolio record only — no content is copied."
      />
      <Card className="max-w-3xl border-border p-6">
        <PortfolioForm
          submitLabel="Create portfolio"
          busy={mutation.isPending}
          onSubmit={(v) => mutation.mutate(v)}
        />
      </Card>
    </>
  );
}
