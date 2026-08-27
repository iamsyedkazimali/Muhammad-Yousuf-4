import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/super-admin/SuperAdminShell";
import { saQ, SUPER_ADMIN_QUERY_ROOT } from "@/lib/super-admin/queries";
import { updateSystemSettings } from "@/lib/super-admin/repository";
import type { SystemSettingsRecord } from "@/lib/super-admin/types";

export const Route = createFileRoute("/super-admin/_guard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(saQ.settings);

  const [form, setForm] = useState<Partial<SystemSettingsRecord>>({});
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      updateSystemSettings({
        system_name: form.system_name?.trim() || "Portfolio Platform",
        logo_url: form.logo_url?.trim() || null,
        timezone: form.timezone?.trim() || "UTC",
        default_theme: form.default_theme?.trim() || "scholarly-emerald",
        maintenance_mode: !!form.maintenance_mode,
      }),
    onSuccess: () => {
      toast.success("System settings saved.");
      qc.invalidateQueries({ queryKey: SUPER_ADMIN_QUERY_ROOT });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Skeleton className="h-72 w-full max-w-3xl rounded-xl" />;

  const set = (patch: Partial<SystemSettingsRecord>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <>
      <PageTitle title="System Settings" description="Platform-wide defaults and branding." />

      <Card className="max-w-3xl border-border p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sys-name">System name</Label>
              <Input
                id="sys-name"
                value={form.system_name ?? ""}
                onChange={(e) => set({ system_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sys-logo">System logo URL</Label>
              <Input
                id="sys-logo"
                value={form.logo_url ?? ""}
                onChange={(e) => set({ logo_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sys-tz">Timezone</Label>
              <Input
                id="sys-tz"
                value={form.timezone ?? ""}
                onChange={(e) => set({ timezone: e.target.value })}
                placeholder="Asia/Karachi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sys-theme">Default theme</Label>
              <Input
                id="sys-theme"
                value={form.default_theme ?? ""}
                onChange={(e) => set({ default_theme: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <Label htmlFor="sys-maintenance">Platform maintenance mode</Label>
              <p className="text-xs text-muted-foreground">
                Shows a maintenance screen on every portfolio. Super Admin stays reachable.
              </p>
            </div>
            <Switch
              id="sys-maintenance"
              checked={!!form.maintenance_mode}
              onCheckedChange={(v) => set({ maintenance_mode: v })}
            />
          </div>

          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save settings"}
          </Button>
        </form>
      </Card>
    </>
  );
}
