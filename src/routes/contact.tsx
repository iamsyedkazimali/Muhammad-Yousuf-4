import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { q } from "@/lib/portfolio-queries";
import { submitRequest } from "@/lib/requests";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { FadeIn } from "@/components/site/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Enroll — Prof. Muhammad Yousaf | Free Demo Class" },
      { name: "description", content: "Enroll for O/A Level Mathematics online tuition. WhatsApp, email, and enrollment form — free demo class available." },
      { property: "og:title", content: "Contact Prof. Muhammad Yousaf" },
      { property: "og:description", content: "Get in touch and book your free trial Mathematics class today." },
      { property: "og:url", content: "/contact" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q.contact);
    context.queryClient.ensureQueryData(q.socialLinks);
  },
  component: ContactPage,
});

export function ContactPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Get In Touch" title="Enroll for online tuition"
        description="A free trial class is offered. I'll respond personally within 24 hours." />
      <ContactBlock />
      <MapBlock />
    </PageShell>
  );
}


function ContactBlock() {
  const { data: contact } = useSuspenseQuery(q.contact);
  const { data: socials } = useSuspenseQuery(q.socialLinks);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const wa = contact?.whatsapp?.replace(/\D/g, "");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form));
    setLoading(true);
    const res = await submitRequest(raw, "enroll", "contact");
    setLoading(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success("Thank you! We'll get back to you soon.");
    form.reset();
    navigate({ to: "/thank-you" });
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container-x grid md:grid-cols-2 gap-10 lg:gap-16">
        <FadeIn>
          <div className="space-y-4">
            {contact?.email && (
              <ContactRow icon={Mail} label="Email" value={contact.email} href={`mailto:${contact.email}`} />
            )}
            {contact?.phone && (
              <ContactRow icon={Phone} label="Phone" value={contact.phone} href={`tel:${contact.phone}`} />
            )}
            {wa && (
              <ContactRow
                icon={MessageCircle} label="WhatsApp" value={contact!.whatsapp}
                href={`https://wa.me/${wa}`}
              />
            )}
            {contact?.hours && <ContactRow icon={MapPin} label="Availability" value={contact.hours} />}
            {contact?.location && <ContactRow icon={MapPin} label="Location" value={contact.location} />}
          </div>

          {socials && socials.length > 0 && (
            <div className="mt-8">
              <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">Follow</div>
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank" rel="noreferrer"
                    className="px-4 py-2 rounded-full border border-border bg-card text-sm hover:bg-accent hover:border-gold/40 transition-colors"
                  >
                    {s.platform}
                  </a>
                ))}
              </div>
            </div>
          )}
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="p-6 md:p-8 border-border shadow-elegant">
            <h2 className="font-serif text-2xl mb-6">Enrollment Form</h2>
            <form onSubmit={onSubmit} className="grid gap-4">
              <Field label="Full name" name="full_name" required />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone / WhatsApp" name="phone" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Country" name="country" />
                <Field label="Level (O / A)" name="level" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" rows={4} placeholder="Tell me about your goals..." />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="bg-primary hover:bg-primary/90 mt-2">
                {loading ? "Sending..." : "Request a Free Trial Class"}
              </Button>
            </form>
          </Card>
        </FadeIn>
      </div>
    </section>
  );
}

function MapBlock() {
  const { data: contact } = useSuspenseQuery(q.contact);
  const query = encodeURIComponent(contact?.location || "Lahore, Pakistan");
  return (
    <section className="pb-24">
      <div className="container-x">
        <FadeIn>
          <div className="overflow-hidden rounded-3xl border border-border shadow-elegant aspect-[16/8]">
            <iframe
              title="Location"
              src={`https://www.google.com/maps?q=${query}&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}{required && <span className="text-destructive">*</span>}</Label>
      <Input id={name} name={name} type={type} required={required} />
    </div>
  );
}

function ContactRow({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:shadow-elegant hover:border-gold/30 transition-all">
      <div className="h-11 w-11 grid place-items-center rounded-xl bg-gold/15 text-gold shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="font-medium truncate">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block">{inner}</a> : inner;
}
