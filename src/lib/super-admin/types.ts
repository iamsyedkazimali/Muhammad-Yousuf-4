/** Domain types for the Super Admin system. */

export type PortfolioStatus = "active" | "suspended";

export type PortfolioRecord = {
  id: string;
  name: string;
  slug: string;
  status: string;
  theme_name: string | null;
  logo: string | null;
  favicon: string | null;
  description: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PortfolioInput = {
  name: string;
  slug: string;
  status: PortfolioStatus;
  theme_name: string;
  logo?: string | null;
  favicon?: string | null;
  description?: string | null;
};

export type PortfolioAdminRecord = {
  id: string;
  portfolio_id: string;
  user_id: string | null;
  full_name: string | null;
  email: string;
  status: string;
  last_login_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityLogRecord = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  portfolio_id: string | null;
  portfolio_name: string | null;
  actor_id: string | null;
  actor_email: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type SystemSettingsRecord = {
  id: number;
  system_name: string;
  logo_url: string | null;
  timezone: string;
  default_theme: string;
  maintenance_mode: boolean;
  created_at: string;
  updated_at: string;
};

export type ActivityAction =
  | "portfolio.created"
  | "portfolio.updated"
  | "portfolio.deleted"
  | "portfolio.suspended"
  | "portfolio.activated"
  | "admin.created"
  | "admin.updated"
  | "admin.deleted"
  | "settings.updated";

export const ACTIVITY_LABELS: Record<string, string> = {
  "portfolio.created": "Portfolio created",
  "portfolio.updated": "Portfolio updated",
  "portfolio.deleted": "Portfolio deleted",
  "portfolio.suspended": "Portfolio suspended",
  "portfolio.activated": "Portfolio activated",
  "admin.created": "Admin created",
  "admin.updated": "Admin updated",
  "admin.deleted": "Admin deleted",
  "settings.updated": "Settings updated",
};

/** Slugify a portfolio name — lowercase, dash separated, url safe. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
