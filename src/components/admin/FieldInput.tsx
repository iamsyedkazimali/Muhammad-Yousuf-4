import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Field } from "@/lib/admin-config";

export function toLocalInput(value: any) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: any;
  onChange: (v: any) => void;
}) {
  const type = field.type ?? "text";

  return (
    <div className={`grid gap-2 ${field.full ? "md:col-span-2" : ""}`}>
      <Label className="text-xs font-medium text-muted-foreground">{field.label}</Label>

      {type === "textarea" ? (
        <Textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : type === "switch" ? (
        <div className="flex h-10 items-center">
          <Switch checked={!!value} onCheckedChange={onChange} />
        </div>
      ) : type === "number" ? (
        <Input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      ) : type === "datetime" ? (
        <Input
          type="datetime-local"
          value={toLocalInput(value)}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
        />
      ) : type === "color" ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={field.label}
            value={/^#[0-9a-fA-F]{6}$/.test(value ?? "") ? value : "#0f5132"}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background p-1"
          />
          <Input value={value ?? ""} placeholder="#0f5132" onChange={(e) => onChange(e.target.value)} />
        </div>
      ) : (
        <Input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={type === "image" || type === "url" ? "https://…" : undefined}
        />
      )}

      {type === "image" && value ? (
        <img
          src={value}
          alt={`${field.label} preview`}
          loading="lazy"
          className="mt-1 h-28 w-auto rounded-md border border-border object-cover"
        />
      ) : null}

      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}
