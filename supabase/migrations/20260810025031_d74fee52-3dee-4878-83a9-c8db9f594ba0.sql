-- ============ portfolio lifecycle ============
alter table public.portfolios
  add column if not exists lifecycle text not null default 'active';

update public.portfolios set lifecycle = status where lifecycle is null;

-- ============ portfolio_domains ============
create table if not exists public.portfolio_domains (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  domain text not null,
  kind text not null default 'primary',
  is_primary boolean not null default false,
  ssl_status text not null default 'pending',
  verification_status text not null default 'pending',
  verification_token text not null default encode(gen_random_bytes(12), 'hex'),
  connected_at timestamptz,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portfolio_domains_domain_key on public.portfolio_domains (lower(domain));
create index if not exists portfolio_domains_portfolio_idx on public.portfolio_domains (portfolio_id);
create index if not exists portfolio_domains_lookup_idx on public.portfolio_domains (verification_status, status);

grant select on public.portfolio_domains to anon;
grant select, insert, update, delete on public.portfolio_domains to authenticated;
grant all on public.portfolio_domains to service_role;

alter table public.portfolio_domains enable row level security;

create policy "Verified domains are publicly resolvable"
  on public.portfolio_domains for select
  using (verification_status = 'verified' and status = 'active');

create policy "Portfolio members read their domains"
  on public.portfolio_domains for select to authenticated
  using (public.has_portfolio_access(portfolio_id));

create policy "Super admins manage domains"
  on public.portfolio_domains for all to authenticated
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

create trigger portfolio_domains_updated
  before update on public.portfolio_domains
  for each row execute function public.set_updated_at();

-- ============ clients ============
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references public.portfolios(id) on delete set null,
  full_name text not null,
  company text,
  email text,
  phone text,
  address text,
  country text,
  timezone text,
  notes text,
  status text not null default 'active',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_portfolio_idx on public.clients (portfolio_id);
create index if not exists clients_status_idx on public.clients (status, created_at desc);

grant select, insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;

alter table public.clients enable row level security;

create policy "Super admins manage clients"
  on public.clients for all to authenticated
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

create policy "Portfolio members read their client record"
  on public.clients for select to authenticated
  using (portfolio_id is not null and public.has_portfolio_access(portfolio_id));

create trigger clients_updated
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ============ media_assets ============
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  folder text not null default 'images',
  file_name text not null,
  storage_path text not null,
  public_url text not null,
  mime_type text,
  kind text not null default 'image',
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  alt_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists media_assets_path_key on public.media_assets (storage_path);
create index if not exists media_assets_portfolio_idx on public.media_assets (portfolio_id, folder, created_at desc);

grant select on public.media_assets to anon;
grant select, insert, update, delete on public.media_assets to authenticated;
grant all on public.media_assets to service_role;

alter table public.media_assets enable row level security;

create policy "Media is publicly readable"
  on public.media_assets for select using (true);

create policy "Portfolio members manage their media"
  on public.media_assets for all to authenticated
  using (public.has_portfolio_access(portfolio_id))
  with check (public.has_portfolio_access(portfolio_id));

create trigger media_assets_updated
  before update on public.media_assets
  for each row execute function public.set_updated_at();

-- ============ portfolio_backups ============
create table if not exists public.portfolio_backups (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  label text not null,
  payload jsonb not null,
  size_bytes bigint not null default 0,
  table_count integer not null default 0,
  row_count integer not null default 0,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_backups_portfolio_idx on public.portfolio_backups (portfolio_id, created_at desc);

grant select, insert, delete on public.portfolio_backups to authenticated;
grant all on public.portfolio_backups to service_role;

alter table public.portfolio_backups enable row level security;

create policy "Super admins manage backups"
  on public.portfolio_backups for all to authenticated
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

-- ============ platform_notifications ============
create table if not exists public.platform_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  message text,
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  severity text not null default 'info',
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_notifications_unread_idx on public.platform_notifications (is_read, created_at desc);

grant select, insert, update, delete on public.platform_notifications to authenticated;
grant all on public.platform_notifications to service_role;

alter table public.platform_notifications enable row level security;

create policy "Super admins manage notifications"
  on public.platform_notifications for all to authenticated
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

create policy "Authenticated users can raise notifications"
  on public.platform_notifications for insert to authenticated
  with check (true);

-- ============ email_settings ============
create table if not exists public.email_settings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null unique references public.portfolios(id) on delete cascade,
  sender_name text,
  sender_email text,
  reply_to text,
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_secure boolean not null default true,
  is_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.email_settings to authenticated;
grant all on public.email_settings to service_role;

alter table public.email_settings enable row level security;

create policy "Portfolio members manage their email settings"
  on public.email_settings for all to authenticated
  using (public.has_portfolio_access(portfolio_id))
  with check (public.has_portfolio_access(portfolio_id));

create trigger email_settings_updated
  before update on public.email_settings
  for each row execute function public.set_updated_at();

-- ============ richer audit logs ============
alter table public.activity_logs
  add column if not exists old_value jsonb,
  add column if not exists new_value jsonb,
  add column if not exists user_agent text;

create index if not exists activity_logs_recent_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_portfolio_idx on public.activity_logs (portfolio_id, created_at desc);

-- ============ system settings extras ============
alter table public.system_settings
  add column if not exists language text not null default 'en',
  add column if not exists company_name text,
  add column if not exists favicon_url text,
  add column if not exists support_email text,
  add column if not exists app_url text;

-- ============ SEO extras on site_settings ============
alter table public.site_settings
  add column if not exists canonical_url text,
  add column if not exists robots_directive text not null default 'index,follow',
  add column if not exists twitter_handle text,
  add column if not exists structured_data jsonb;

-- ============ storage policies (bucket created separately) ============
create policy "Portfolio media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

create policy "Authenticated users upload portfolio media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media');

create policy "Authenticated users update portfolio media"
  on storage.objects for update to authenticated
  using (bucket_id = 'portfolio-media');

create policy "Authenticated users delete portfolio media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-media');