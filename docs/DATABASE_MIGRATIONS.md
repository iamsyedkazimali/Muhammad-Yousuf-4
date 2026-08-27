# Database migration guide

## Where migrations live

`supabase/migrations/<timestamp>_<name>.sql`. They are plain SQL, applied in filename order, and
must be idempotent-friendly (use `if not exists` / `or replace` where sensible).

## Rules for every new table in the `public` schema

Write the four steps in this exact order in the **same** migration:

```sql
-- 1. table
create table public.example (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  is_published boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. grants (PostgREST has no default privileges on public)
grant select on public.example to anon, authenticated;
grant insert, update, delete on public.example to authenticated;
grant all on public.example to service_role;

-- 3. row level security
alter table public.example enable row level security;

-- 4. policies
create policy "Published rows are public"
  on public.example for select
  using (is_published = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage rows"
  on public.example for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- timestamps
create trigger set_example_updated_at
  before update on public.example
  for each row execute function public.set_updated_at();
```

## Applying migrations

**Supabase CLI (recommended):**

```sh
supabase link --project-ref <project-ref>
supabase db push          # applies pending migrations
supabase db diff -f name  # generate a migration from local changes
```

**SQL editor:** paste the file contents and run them as a single transaction.

## Type generation

Regenerate `src/integrations/supabase/types.ts` after any schema change:

```sh
supabase gen types typescript --project-id <project-ref> > src/integrations/supabase/types.ts
```

## Performance notes

- Content lists are queried as `where is_published = true order by order_index`, so a composite
  index on `(is_published, order_index)` keeps them index-only as content grows.
- `enrollment_requests` is read newest-first in the dashboard — index `created_at desc`.
- Keep `select *` out of hot paths if a table gains large text/JSON columns; project the columns
  the UI actually renders.

## Rollback

Write a paired `down` migration when a change is risky, or restore from a Supabase point-in-time
backup. Never edit an already-applied migration file — add a new one.
