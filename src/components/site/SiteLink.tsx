import { Link, useParams } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

/**
 * Tenant-aware link for the public website.
 *
 * On the default deployment it links to `/about`; when the visitor is browsing
 * a tenant URL (`/ghulam-hussain/about`) it keeps them inside that portfolio.
 * Page components can therefore be shared by both route trees unchanged.
 */
type SiteLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
  activeProps?: ComponentProps<typeof Link>["activeProps"];
  activeOptions?: ComponentProps<typeof Link>["activeOptions"];
  onClick?: () => void;
  "aria-label"?: string;
};

export function SiteLink({ to, children, ...rest }: SiteLinkProps) {
  const params = useParams({ strict: false }) as { portfolioSlug?: string };
  const slug = params.portfolioSlug;

  if (!slug) {
    return (
      <Link to={to} {...rest}>
        {children}
      </Link>
    );
  }

  const path = to.replace(/^\//, "");
  if (!path) {
    return (
      <Link to="/$portfolioSlug" params={{ portfolioSlug: slug }} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Link to="/$portfolioSlug/$" params={{ portfolioSlug: slug, _splat: path }} {...rest}>
      {children}
    </Link>
  );
}
