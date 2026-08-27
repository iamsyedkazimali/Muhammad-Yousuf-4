import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitRequest, type RequestType } from "@/lib/requests";

/**
 * Book-a-demo / enroll request modal. Validates with zod and stores the
 * submission in the backend.
 */
export function RequestDialog({
  type,
  trigger,
  sourcePage = "home",
}: {
  type: Exclude<RequestType, "contact">;
  trigger: ReactNode;
  sourcePage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDemo = type === "demo";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form));
    setErrors({});
    setLoading(true);
    const res = await submitRequest(raw, type, sourcePage);
    setLoading(false);
    if (!res.ok) {
      setErrors({ form: res.message });
      toast.error(res.message);
      return;
    }
    toast.success(
      isDemo ? "Demo class requested — I'll confirm your slot shortly." : "Enrollment request received. Thank you!",
    );
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {isDemo ? "Book a Free Demo Class" : "Enroll Now"}
          </DialogTitle>
          <DialogDescription>
            {isDemo
              ? "Tell me a little about the student and I'll arrange a free trial lesson."
              : "Share your details and I'll get back within 24 hours with a schedule."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="rq-name">Full name *</Label>
            <Input id="rq-name" name="full_name" required maxLength={200} autoComplete="name" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="rq-email">Email *</Label>
              <Input id="rq-email" name="email" type="email" required maxLength={320} autoComplete="email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rq-phone">Phone / WhatsApp</Label>
              <Input id="rq-phone" name="phone" maxLength={50} autoComplete="tel" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="rq-country">Country</Label>
              <Input id="rq-country" name="country" maxLength={100} autoComplete="country-name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rq-level">Level (O / A)</Label>
              <Input id="rq-level" name="level" maxLength={100} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rq-message">Message</Label>
            <Textarea
              id="rq-message"
              name="message"
              rows={3}
              maxLength={4000}
              placeholder={isDemo ? "Preferred days and time zone…" : "Your goals and current grades…"}
            />
          </div>
          {errors.form && (
            <p role="alert" className="text-sm text-destructive">{errors.form}</p>
          )}
          <Button type="submit" size="lg" disabled={loading} className="mt-2">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDemo ? "Request Demo Class" : "Send Enrollment Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
