import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isSuperAdmin } from "@/lib/super-admin/repository";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";

/** Gate for every super-admin screen. Unauthorised users go back to the login page. */
export const Route = createFileRoute("/super-admin/_guard")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/super-admin/login" });
    if (!(await isSuperAdmin())) throw redirect({ to: "/super-admin/login" });
    return { user: data.user };
  },
  component: () => (
    <SuperAdminShell>
      <Outlet />
    </SuperAdminShell>
  ),
});
