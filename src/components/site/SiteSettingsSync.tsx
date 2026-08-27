import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { q } from "@/lib/portfolio-queries";

function setMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Applies admin-managed SEO, branding and analytics settings to the live site. */
export function SiteSettingsSync() {
  const { data: settings } = useQuery(q.settings);

  useEffect(() => {
    if (!settings || typeof document === "undefined") return;

    if (settings.site_description) setMeta("name", "description", settings.site_description);
    if (settings.seo_keywords) setMeta("name", "keywords", settings.seo_keywords);
    if (settings.site_title) setMeta("property", "og:title", settings.site_title);
    if (settings.site_description) setMeta("property", "og:description", settings.site_description);
    if (settings.og_image_url) {
      setMeta("property", "og:image", settings.og_image_url);
      setMeta("name", "twitter:image", settings.og_image_url);
    }

    if (settings.favicon_url) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }

    const root = document.documentElement;
    if (settings.brand_primary) root.style.setProperty("--primary", settings.brand_primary);
    if (settings.brand_accent) root.style.setProperty("--gold", settings.brand_accent);

    if (settings.analytics_id && !document.getElementById("site-analytics")) {
      const s = document.createElement("script");
      s.id = "site-analytics";
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${settings.analytics_id}`;
      document.head.appendChild(s);
      const inline = document.createElement("script");
      inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.analytics_id}');`;
      document.head.appendChild(inline);
    }
  }, [settings]);

  return null;
}
