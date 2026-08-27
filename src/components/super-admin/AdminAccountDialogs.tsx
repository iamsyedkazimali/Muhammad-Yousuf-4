import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPortfolioAdmin,
  resetPortfolioAdminPassword,
} from "@/lib/super-admin/provisioning.functions";
import { SUPER_ADMIN_QUERY_ROOT } from "@/lib/super-admin/queries";
import type { PortfolioAdminRecord, PortfolioRecord } from "@/lib/super-admin/types";

/** Readable temporary password the Super Admin can hand over. */
export function temporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("") + "#1";
}

export function CreateAdminDialog({
  portfolios,
  open,
  onOpenChange,
}: {
  portfolios: PortfolioRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const run = useServerFn(createPortfolioAdmin);
  const [portfolioId, setPortfolioId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) return;
    setPortfolioId(portfolios[0]?.id ?? "");
    setFullName("");
    setEmail("");
    setPassword(temporaryPassword());
  }, [open, portfolios]);

  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          portfolioId,
          fullName: fullName.trim() || undefined,
          email: email.trim(),
          password,
        },
      }),
    onSuccess: () => {
      toast.success("Portfolio admin created. Share the temporary password securely.");
      qc.invalidateQueries({ queryKey: SUPER_ADMIN_QUERY_ROOT });
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create portfolio admin</DialogTitle>
          <DialogDescription>
            The account can only manage the selected portfolio and must change this password at
            first sign in.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="admin-portfolio">Portfolio</Label>
            <Select value={portfolioId} onValueChange={setPortfolioId}>
              <SelectTrigger id="admin-portfolio">
                <SelectValue placeholder="Select a portfolio" />
              </SelectTrigger>
              <SelectContent>
                {portfolios.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="admin-name">Full name</Label>
            <Input id="admin-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="admin-password">Temporary password</Label>
            <div className="flex gap-2">
              <Input
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={() => setPassword(temporaryPassword())}>
                Generate
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !portfolioId}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ForcePasswordDialog({
  admin,
  onOpenChange,
}: {
  admin: PortfolioAdminRecord | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const run = useServerFn(resetPortfolioAdminPassword);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (admin) setPassword(temporaryPassword());
  }, [admin]);

  const mutation = useMutation({
    mutationFn: () => run({ data: { adminId: admin!.id, password } }),
    onSuccess: () => {
      toast.success("Password reset. The admin must change it at next sign in.");
      qc.invalidateQueries({ queryKey: SUPER_ADMIN_QUERY_ROOT });
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={!!admin} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Force password reset</DialogTitle>
          <DialogDescription>
            Sets a new password for {admin?.email} immediately and forces a change at next sign in.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5">
          <Label htmlFor="force-password">New temporary password</Label>
          <div className="flex gap-2">
            <Input
              id="force-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={() => setPassword(temporaryPassword())}>
              Generate
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
