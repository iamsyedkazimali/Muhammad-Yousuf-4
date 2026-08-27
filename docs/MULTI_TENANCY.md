# Multi-portfolio architecture (phase 1)

This codebase can host unlimited independent portfolios from one deployment. Phase 1 only
prepares the architecture — Super Admin, clone and create flows come later.

## Database

`public.portfolios`

| column | notes |
| --- | --- |
| `id` | uuid primary key |
| `name` | display name |
| `slug` | unique, future public route (`/muhammad-yousaf`) |
| `status` | `active` hides/reveals the portfolio publicly |
| `theme_name` | design preset, defaults to `scholarly-emerald` |
| `logo`, `favicon` | branding overrides |
| `created_at`, `updated_at` | `updated_at` maintained by trigger |

Every content table now has `portfolio_id uuid NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE`
plus an index on `portfolio_id` (and composite indexes for the hot published lists):

`profile`, `hero_section`, `about_section`, `contact_info`, `site_settings`, `subjects`,
`qualifications`, `experiences`, `achievements`, `teaching_services`, `featured_courses`,
`exam_countdowns`, `gallery`, `testimonials`, `student_results`, `announcements`,
`popup_notifications`, `faqs`, `social_links`, `enrollment_requests`.

All pre-existing rows were backfilled to the seeded **Muhammad Yousaf** portfolio.

### Singletons are now per portfolio

`profile`, `hero_section`, `about_section`, `contact_info` and `site_settings` used to be one
hardcoded row with `id = 1`. They now have an auto-incrementing `id` and a
`UNIQUE (portfolio_id)` constraint, so each portfolio gets exactly one row. Nothing in the app
looks up `id = 1` any more.

## Security

- Public read stays "published rows only"; writes stay admin-only through `has_role`.
- `public.has_portfolio_access(portfolio_id)` is the seam for future per-portfolio admins.
  Today it returns `has_role(auth.uid(), 'admin')`, so behaviour is unchanged; later phases
  swap its body (and the policies that call it) for a `portfolio_members` lookup without
  touching application code.

## Application layer

- `src/lib/portfolio-context.ts` — resolves the active portfolio. The slug comes from
  `VITE_PORTFOLIO_SLUG` (default `muhammad-yousaf`); the resolved record is memoised.
  When slug routing lands, this is the only file that changes.
- `src/lib/portfolio-repository.ts` — the single data-access layer:
  `listPublished`, `listAll`, `countRows`, `getSingleton`, `upsertSingleton`, `insertRow`,
  `updateRow`, `deleteRow`, `selectScoped`. Every one of them injects `portfolio_id`, and
  updates/deletes additionally filter by it so a stray id can never cross tenants.
- `src/lib/portfolio-queries.ts` (public site) and the admin managers
  (`SingletonManager`, `CollectionManager`, `EnrollmentsManager`, dashboard stats) call the
  repository only — there are no direct `supabase.from()` content queries left.
- React Query keys are namespaced with the portfolio slug (`["public", slug, table]`,
  `["admin", slug, table]`) so caches never collide between portfolios.

## Rule for new code

Never call `supabase.from("<content table>")` directly. Add or reuse a repository function so
the query stays portfolio-scoped.
