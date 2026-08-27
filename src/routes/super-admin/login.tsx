import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isSuperAdmin } from "@/lib/super-admin/repository";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/super-admin/login")({
  head: () => ({
    meta: [
      { title: "Super Admin Sign In" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuperAdminLogin,
});

function SuperAdminLogin() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && (await isSuperAdmin())) nav({ to: "/super-admin", replace: true });
    })();
  }, [nav]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || password.length < 6) {
      toast.error("Enter a valid email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    const allowed = await isSuperAdmin();
    setLoading(false);
    if (!allowed) {
      await supabase.auth.signOut();
      return toast.error("This account does not have super admin access.");
    }
    nav({ to: "/super-admin", replace: true });
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-5">
      <Card className="w-full max-w-md border-border p-8">
        <div className="text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-gold">
            <ShieldCheck className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="font-serif text-2xl">Super Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Platform-level access. Portfolio administrators should use the standard admin sign in.
          </p>
        </div>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sa-email">Email</Label>
            <Input id="sa-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sa-password">Password</Label>
            <Input
              id="sa-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
