import { SiteLink as Link } from "@/components/site/SiteLink";
import { GraduationCap } from "lucide-react";

export function Footer({
  socials,
  text,
}: {
  socials: Array<{ platform: string; url: string }>;
  text?: string;
}) {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container-x py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-5 w-5 text-gold" />
            <span className="font-serif text-lg">Prof. Muhammad Yousaf</span>
          </div>
          <p className="text-sm text-primary-foreground/70 max-w-sm">
            {text ??
              "36+ years of dedicated O/A Level Mathematics teaching — now online, worldwide. Cambridge · Edexcel · AQA."}
          </p>
        </div>
        <div>
          <h4 className="font-serif text-lg mb-3 text-gold">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/subjects" className="hover:text-gold">Subjects</Link></li>
            <li><Link to="/online-tuition" className="hover:text-gold">Online Tuition</Link></li>
            <li><Link to="/achievements" className="hover:text-gold">Achievements</Link></li>
            <li><Link to="/gallery" className="hover:text-gold">Gallery</Link></li>
            <li><Link to="/testimonials" className="hover:text-gold">Testimonials</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg mb-3 text-gold">Connect</h4>
          <ul className="space-y-2 text-sm">
            {socials.map((s) => (
              <li key={s.platform}>
                <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-gold">
                  {s.platform}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} Prof. Muhammad Yousaf. All rights reserved.
      </div>
    </footer>
  );
}
