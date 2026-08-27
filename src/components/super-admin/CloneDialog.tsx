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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clonePortfolio } from "@/lib/super-admin/provisioning.functions";
import { SUPER_ADMIN_QUERY_ROOT } from "@/lib/super-admin/queries";
import { slugify, type PortfolioRecord } from "@/lib/super-admin/types";

/** Generates a readable temporary password for the new portfolio admin. */
function tempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("") + "#1";
}

export function CloneDialog({
  source,
  open,
  onOpenChange,
}: {
  source: PortfolioRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const runClone = useServerFn(clonePortfolio);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [theme, setTheme] = useState("scholarly-emerald");
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [status, setStatus] = useState<"active" | "suspended">("active");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copyData, setCopyData] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName("");
    setSlug("");
    setSlugTouched(false);
    setTheme(source?.theme_name ?? "scholarly-emerald");
    setLogo("");
    setFavicon("");
    setStatus("active");
    setAdminName("");
    setAdminEmail("");
    setPassword(tempPassword());
    setCopyData(true);
  }, [open, source]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!source) throw new Error("No source portfolio selected.");
      return runClone({
        data: {
          sourceId: source.id,
          name: name.trim(),
          slug: slug.trim(),
          theme: theme.trim() || "scholarly-emerald",
          logo: logo.trim() || null,
          favicon: favicon.trim() || null,
          status,
          copyData,
          adminName: adminName.trim() || undefined,
          adminEmail: adminEmail.trim(),
          adminPassword: password,
        },
      });
    },
    onSuccess: (result) => {
      toast.success(`Portfolio cloned — public site available at /${result.slug}`);
      qc.invalidateQueries({ queryKey: SUPER_ADMIN_QUERY_ROOT });
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message || "Cloning failed — nothing was saved."),
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Clone “{source?.name}”</DialogTitle>
          <DialogDescription>
            Creates a fully independent portfolio with its own content and its own administrator.
            Nothing in the source portfolio is modified.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label="Portfolio name" htmlFor="clone-name">
            <Input
              id="clone-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Ghulam Hussain"
            />
          </Field>

          <Field label="Portfolio slug" htmlFor="clone-slug" hint={`Public URL: /${slug || "slug"}`}>
            <Input
              id="clone-slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="ghulam-hussain"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Theme name" htmlFor="clone-theme">
              <Input id="clone-theme" value={theme} onChange={(e) => setTheme(e.target.value)} />
            </Field>
            <Field label="Status" htmlFor="clone-status">
              <Select value={status} onValueChange={(v) => setStatus(v as "active" | "suspended")}>
                <SelectTrigger id="clone-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Logo URL (optional)" htmlFor="clone-logo">
              <Input id="clone-logo" value={logo} onChange={(e) => setLogo(e.target.value)} />
            </Field>
            <Field label="Favicon URL (optional)" htmlFor="clone-favicon">
              <Input
                id="clone-favicon"
                value={favicon}
                onChange={(e) => setFavicon(e.target.value)}
              />
            </Field>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Portfolio administrator</p>
            <div className="mt-3 grid gap-4">
              <Field label="Admin name" htmlFor="clone-admin-name">
                <Input
                  id="clone-admin-name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </Field>
              <Field label="Admin email" htmlFor="clone-admin-email">
                <Input
                  id="clone-admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </Field>
              <Field
                label="Temporary password"
                htmlFor="clone-password"
                hint="The admin is forced to change this on first sign in."
              >
                <div className="flex gap-2">
                  <Input
                    id="clone-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={() => setPassword(tempPassword())}>
                    Generate
                  </Button>
                </div>
              </Field>
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <Checkbox checked={copyData} onCheckedChange={(v) => setCopyData(v === true)} />
            Clone all existing data (profile, sections, gallery, testimonials, settings…)
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Clone portfolio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
