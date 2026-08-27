import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/super-admin/SuperAdminShell";

export const Route = createFileRoute("/super-admin/_guard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLastSignIn(data.user?.last_sign_in_at ?? null);
    });
  }, []);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    setPassword("");
    setConfirm("");
    toast.success("Password updated.");
  };

  return (
    <>
      <PageTitle title="Profile" description="Your Super Admin account." />

      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <Card className="border-border p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-gold" />
            <div>
              <p className="font-medium">{email ?? "—"}</p>
              <Badge variant="secondary" className="mt-1">
                super_admin
              </Badge>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Last sign in: {lastSignIn ? new Date(lastSignIn).toLocaleString() : "—"}
          </p>
        </Card>

        <Card className="border-border p-6">
          <h2 className="font-serif text-lg">Change password</h2>
          <form className="mt-4 space-y-4" onSubmit={changePassword}>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Updating…" : "Update password"}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
