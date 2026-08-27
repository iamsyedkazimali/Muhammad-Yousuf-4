import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldInput } from "./FieldInput";
import { getSingleton, upsertSingleton } from "@/lib/portfolio-repository";
import { ACTIVE_PORTFOLIO_SLUG } from "@/lib/portfolio-context";
import type { SectionConfig } from "@/lib/admin-config";

export function SingletonManager({ section }: { section: SectionConfig }) {
  const qc = useQueryClient();
  const [row, setRow] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", ACTIVE_PORTFOLIO_SLUG, section.table, "single"],
    queryFn: async () => (await getSingleton<Record<string, any>>(section.table)) ?? {},
  });

  useEffect(() => {
    if (data) setRow({ ...(data as any) });
  }, [data]);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const payload: Record<string, any> = {};
    section.fields.forEach((f) => (payload[f.name] = row[f.name] ?? null));
    const { error } = await upsertSingleton(section.table, payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${section.label} updated — live on the site`);
    qc.invalidateQueries({ queryKey: ["public"] });
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  if (isLoading || !row) {
    return (
      <Card className="p-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="border-border p-6">
      <div className="grid gap-5 md:grid-cols-2">
        {section.fields.map((f) => (
          <FieldInput
            key={f.name}
            field={f}
            value={row[f.name]}
            onChange={(v) => setRow((r) => ({ ...(r as any), [f.name]: v }))}
          />
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save changes
        </Button>
      </div>
    </Card>
  );
}
