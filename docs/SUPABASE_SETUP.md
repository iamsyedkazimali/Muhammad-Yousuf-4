# Supabase setup guide

The project ships with a complete schema. This guide covers wiring a fresh Supabase project.

## 1. Create the project

1. Create a new project at [supabase.com](https://supabase.com) and choose a region close to your
   students.
2. Copy the **Project URL**, **Project ref** and **publishable (anon) key** into `.env`
   (see [ENVIRONMENT.md](ENVIRONMENT.md)).

## 2. Apply the schema

Run the migrations in `supabase/migrations/` in chronological order — see
[DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md).

### Tables

**Singletons** (single row, `id = 1`): `profile`, `hero_section`, `about_section`,
`contact_info`, `site_settings`.

**Collections** (ordered, publishable): `subjects`, `qualifications`, `experiences`,
`teaching_services`, `featured_courses`, `exam_countdowns`, `gallery`, `testimonials`,
`student_results`, `achievements`, `announcements`, `popup_notifications`, `faqs`,
`social_links`.

**Operational**: `enrollment_requests` (demo + enroll leads), `user_roles` (admin/editor).

## 3. Authentication

1. **Authentication → Providers → Email**: enabled. Keep "Confirm email" on for production.
2. Disable anonymous sign-ins.
3. For a smoother local/testing loop only, you may temporarily enable auto-confirm.
4. Add your production domain and `http://localhost:8080` under
   **Authentication → URL Configuration → Redirect URLs**.

## 4. Roles and security model

Roles are stored in the dedicated `user_roles` table — never on a profile row — and checked
through a `SECURITY DEFINER` helper so RLS policies never recurse:

```sql
select public.has_role(auth.uid(), 'admin');
```

Policy shape used across the schema:

- **Public read** — `select` is allowed to `anon` and `authenticated` only where
  `is_published = true` (and, for popups/announcements, within their schedule window).
- **Admin write** — `insert`, `update`, `delete` require `public.has_role(auth.uid(), 'admin')`.
- **Leads** — `enrollment_requests` accepts inserts from the public form but is readable only by
  admins, so no visitor can enumerate other people's contact details.
- Every public-schema table has explicit `GRANT`s; RLS alone is not enough for the Data API.

## 5. Realtime

The admin dashboard and public site stay in sync through Supabase Realtime. Every content table
is added to the `supabase_realtime` publication, and `useRealtimeContent()` invalidates the
matching TanStack Query cache entries on change.

## 6. Create your first admin

See [ADMIN_GUIDE.md](ADMIN_GUIDE.md).
