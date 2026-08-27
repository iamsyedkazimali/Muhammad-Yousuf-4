import { Wrench } from "lucide-react";

/** Shown on public pages when an admin enables maintenance mode in settings. */
export function Maintenance({ title, message }: { title?: string; message?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-5 text-foreground">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-gold">
          <Wrench className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl">{title ?? "We'll be back shortly"}</h1>
        <p className="mt-4 text-muted-foreground">
          {message ??
            "The site is undergoing scheduled maintenance. Classes continue as normal — please reach out on WhatsApp if you need anything urgently."}
        </p>
      </div>
    </div>
  );
}
