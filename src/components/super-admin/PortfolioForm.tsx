import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { slugify, type PortfolioInput, type PortfolioRecord } from "@/lib/super-admin/types";

export function PortfolioForm({
  initial,
  submitLabel,
  busy,
  onSubmit,
}: {
  initial?: PortfolioRecord | null;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (values: PortfolioInput) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [theme, setTheme] = useState(initial?.theme_name ?? "scholarly-emerald");
  const [active, setActive] = useState((initial?.status ?? "active") === "active");
  const [logo, setLogo] = useState(initial?.logo ?? "");
  const [favicon, setFavicon] = useState(initial?.favicon ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const effectiveSlug = slugTouched ? slug : slugify(name);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: name.trim(),
          slug: slugify(effectiveSlug),
          status: active ? "active" : "suspended",
          theme_name: theme.trim() || "scholarly-emerald",
          logo: logo.trim() || null,
          favicon: favicon.trim() || null,
          description: description.trim() || null,
        });
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pf-name">Portfolio name</Label>
          <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-slug">Slug</Label>
          <Input
            id="pf-slug"
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
          />
          <p className="text-xs text-muted-foreground">
            Must be unique. Used for the future public route /{effectiveSlug || "slug"}.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-theme">Theme name</Label>
          <Input id="pf-theme" value={theme} onChange={(e) => setTheme(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-logo">Logo URL</Label>
          <Input id="pf-logo" value={logo} onChange={(e) => setLogo(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-favicon">Favicon URL</Label>
          <Input id="pf-favicon" value={favicon} onChange={(e) => setFavicon(e.target.value)} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div>
            <Label htmlFor="pf-status">Active</Label>
            <p className="text-xs text-muted-foreground">Suspended portfolios are offline.</p>
          </div>
          <Switch id="pf-status" checked={active} onCheckedChange={setActive} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pf-description">Description (optional)</Label>
        <Textarea
          id="pf-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
