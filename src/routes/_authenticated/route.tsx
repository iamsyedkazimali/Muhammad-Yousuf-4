import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminPortfolio, setActiveSlug } from "@/lib/portfolio-context";

/**
 * Portfolio Admin gate.
 *
 * Besides requiring a session it binds every query in the admin area to the
 * portfolio this admin is assigned to, and forces a password change when the
 * Super Admin has flagged the account.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const membership = await getMyAdminPortfolio();
    if (membership) {
      if (setActiveSlug(membership.slug)) context.queryClient.clear();
      if (membership.mustResetPassword && location.pathname !== "/reset-password") {
        throw redirect({ to: "/reset-password", search: { forced: true } });
      }
      void supabase.rpc("record_admin_login");
    }

    return { user: data.user, membership };
  },
  component: () => <Outlet />,
});
