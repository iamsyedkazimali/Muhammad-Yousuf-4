import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2, X, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FieldInput } from "./FieldInput";
import { deleteRow, insertRow, listAll, updateRow } from "@/lib/portfolio-repository";
import { ACTIVE_PORTFOLIO_SLUG } from "@/lib/portfolio-context";
import type { SectionConfig } from "@/lib/admin-config";

export function CollectionManager({ section }: { section: SectionConfig }) {
  const qc = useQueryClient();
  const orderCol = section.order ?? "order_index";
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", ACTIVE_PORTFOLIO_SLUG, section.table],
    queryFn: () => listAll<Record<string, any>>(section.table, orderCol, section.order !== "created_at"),
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  }, [rows, search]);

  const blank = () => {
    const r: Record<string, any> = { is_published: true };
    section.fields.forEach((f) => {
      r[f.name] = f.type === "number" ? (f.name === "order_index" ? rows.length : 0) : f.type === "switch" ? false : "";
    });
    return r;
  };

  const afterWrite = () => {
    qc.invalidateQueries({ queryKey: ["public"] });
    refetch();
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const payload: Record<string, any> = {};
    section.fields.forEach((f) => {
      const v = editing[f.name];
      payload[f.name] = v === "" ? null : v;
    });
    if (creating) payload.is_published = editing.is_published ?? true;
    const { error } = creating
      ? await insertRow(section.table, payload)
      : await updateRow(section.table, editing.id, payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(creating ? "Created — live on the site" : "Saved — live on the site");
    setEditing(null);
    setCreating(false);
    afterWrite();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this entry permanently?")) return;
    const { error } = await deleteRow(section.table, id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    if (editing?.id === id) setEditing(null);
    afterWrite();
  };

  const togglePublish = async (row: any) => {
    const { error } = await updateRow(section.table, row.id, { is_published: !row.is_published });
    if (error) return toast.error(error.message);
    toast.success(!row.is_published ? "Enabled" : "Disabled");
    afterWrite();
  };

  const statusOf = (row: any) => {
    if (!row.is_published) return { label: "Disabled", tone: "muted" as const };
    const now = Date.now();
    if (row.starts_at && new Date(row.starts_at).getTime() > now) return { label: "Scheduled", tone: "gold" as const };
    if (row.ends_at && new Date(row.ends_at).getTime() < now) return { label: "Expired", tone: "muted" as const };
    if ("is_active" in row && row.is_active === false) return { label: "Paused", tone: "muted" as const };
    return { label: "Live", tone: "live" as const };
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${section.label.toLowerCase()}…`}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setCreating(true);
            setEditing(blank());
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> New entry
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-primary/40 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-serif text-xl">{creating ? "New entry" : "Edit entry"}</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={editing.is_published ?? true}
                      onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
                    />
                    {editing.is_published ?? true ? "Enabled" : "Disabled"}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(null); setCreating(false); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {section.fields.map((f) => (
                  <FieldInput
                    key={f.name}
                    field={f}
                    value={editing[f.name]}
                    onChange={(v) => setEditing({ ...editing, [f.name]: v })}
                  />
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setEditing(null); setCreating(false); }}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {creating ? "Create" : "Save changes"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Card className="p-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">No entries yet.</Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((row, i) => {
            const status = statusOf(row);
            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <Card className="flex flex-wrap items-center gap-4 border-border p-4 transition-colors hover:border-primary/40">
                  {section.imageField && row[section.imageField] ? (
                    <img
                      src={row[section.imageField]}
                      alt={row[section.titleField ?? "title"] ?? "Preview"}
                      loading="lazy"
                      className="h-14 w-14 rounded-md border border-border object-cover"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium">
                        {row[section.titleField ?? "title"] ?? "Untitled"}
                      </span>
                      <Badge
                        variant={status.tone === "live" ? "default" : "secondary"}
                        className={status.tone === "gold" ? "bg-gold text-background" : undefined}
                      >
                        {status.label}
                      </Badge>
                      {row.is_featured && <Badge variant="outline">Featured</Badge>}
                    </div>
                    {section.subtitleField && row[section.subtitleField] && (
                      <p className="truncate text-sm text-muted-foreground">
                        {String(row[section.subtitleField]).length > 90
                          ? `${String(row[section.subtitleField]).slice(0, 90)}…`
                          : String(row[section.subtitleField])}
                      </p>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Enable / disable" onClick={() => togglePublish(row)}>
                      {row.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCreating(false);
                        setEditing({ ...row });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
