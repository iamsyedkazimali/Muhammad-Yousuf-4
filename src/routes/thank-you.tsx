import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { FadeIn } from "@/components/site/motion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Request Received — Prof. Muhammad Yousaf Mathematics Tuition" },
      {
        name: "description",
        content:
          "Your enrollment or demo class request has been received. Prof. Muhammad Yousaf will reply personally within 24 hours.",
      },
      { property: "og:title", content: "Request Received — Prof. Muhammad Yousaf" },
      { property: "og:description", content: "Thanks for reaching out. You'll receive a reply within 24 hours." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/thank-you" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/thank-you" }],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  return (
    <PageShell>
      <section className="container-x flex min-h-[70vh] max-w-2xl flex-col items-center justify-center py-32 text-center">
        <FadeIn>
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-10 w-10" aria-hidden />
          </span>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h1 className="mt-8 font-serif text-4xl sm:text-5xl">Request received</h1>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mt-5 text-lg text-muted-foreground">
            Thank you for getting in touch. Your details have been saved and Prof. Muhammad Yousaf will reply
            personally within 24 hours to schedule your free demo class.
          </p>
        </FadeIn>
        <FadeIn delay={0.24}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/">Back to home</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/subjects">
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden /> Explore subjects
              </Link>
            </Button>
          </div>
        </FadeIn>
      </section>
    </PageShell>
  );
}
