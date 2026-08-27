/** Domain types for the Phase 4 platform infrastructure. */

export type DomainKind = "primary" | "redirect";
export type DomainStatus = "active" | "disabled";
export type VerificationStatus = "pending" | "verified" | "failed";
export type SslStatus = "pending" | "issued" | "failed";

export type PortfolioDomainRecord = {
  id: string;
  portfolio_id: string;
  domain: string;
  kind: string;
  is_primary: boolean;
  ssl_status: string;
  verification_status: string;
  verification_token: string;
  connected_at: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DomainInput = {
  portfolio_id: string;
  domain: string;
  kind: DomainKind;
  status?: DomainStatus;
  notes?: string | null;
};

export type ClientRecord = {
  id: string;
  portfolio_id: string | null;
  full_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  timezone: string | null;
  notes: string | null;
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientInput = Omit<
  ClientRecord,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;

export type MediaKind = "image" | "video" | "document" | "icon" | "other";

export type MediaAssetRecord = {
  id: string;
  portfolio_id: string;
  folder: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  mime_type: string | null;
  kind: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
};

export type BackupRecord = {
  id: string;
  portfolio_id: string;
  label: string;
  payload: unknown;
  size_bytes: number;
  table_count: number;
  row_count: number;
  created_by: string | null;
  created_at: string;
};

export type NotificationRecord = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  portfolio_id: string | null;
  severity: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type PortfolioLifecycle = "draft" | "active" | "suspended" | "archived" | "deleted";

export const LIFECYCLE_BEHAVIOUR: Record<
  PortfolioLifecycle,
  { label: string; publiclyVisible: boolean; adminWritable: boolean; description: string }
> = {
  draft: {
    label: "Draft",
    publiclyVisible: false,
    adminWritable: true,
    description: "Being prepared. Hidden from visitors, editable by its admin.",
  },
  active: {
    label: "Active",
    publiclyVisible: true,
    adminWritable: true,
    description: "Live and fully editable.",
  },
  suspended: {
    label: "Suspended",
    publiclyVisible: false,
    adminWritable: false,
    description: "Shows a suspension notice. Admin login is blocked.",
  },
  archived: {
    label: "Archived",
    publiclyVisible: false,
    adminWritable: false,
    description: "Read-only cold storage. Content preserved for restore.",
  },
  deleted: {
    label: "Deleted",
    publiclyVisible: false,
    adminWritable: false,
    description: "Soft deleted. Restorable by a Super Admin only.",
  },
};

/** Content tables copied by backup, export and restore. */
export const CONTENT_TABLES = [
  "profile",
  "hero_section",
  "about_section",
  "contact_info",
  "site_settings",
  "subjects",
  "qualifications",
  "experiences",
  "achievements",
  "teaching_services",
  "featured_courses",
  "exam_countdowns",
  "gallery",
  "testimonials",
  "student_results",
  "announcements",
  "popup_notifications",
  "faqs",
  "social_links",
] as const;

export type ContentTable = (typeof CONTENT_TABLES)[number];

export type BackupPayload = {
  version: 1;
  created_at: string;
  portfolio: Record<string, unknown>;
  tables: Record<string, Record<string, unknown>[]>;
  media: Record<string, unknown>[];
  admins: Record<string, unknown>[];
};
