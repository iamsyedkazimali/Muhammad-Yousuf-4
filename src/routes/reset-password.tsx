import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const searchSchema = z.object({ forced: z.boolean().optional() });

/** Password change screen — also the target of forced resets and reset emails. */
export const Route = createFileRoute("/reset-password")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Set a new password — Admin" },
      { name: "description", content: "Choose a new password for your administrator account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const { forced } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters.");
    if (password !== confirm) return toast.error("The two passwords don't match.");

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    await supabase.rpc("clear_password_reset_flag");
    setBusy(false);
    toast.success("Password updated.");
    nav({ to: "/admin", replace: true });
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-5">
      <Card className="w-full max-w-md border-border p-8">
        <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
          <KeyRound className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="font-serif text-2xl">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {forced
            ? "Your administrator password was reset by the platform owner. Choose a new one to continue."
            : "Choose a new password for your administrator account."}
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-1.5">
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
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
