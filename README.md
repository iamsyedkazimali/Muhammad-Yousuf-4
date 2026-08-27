# Prof. Muhammad Yousaf — O/A Level Mathematics Portfolio

A production-ready, fully content-managed portfolio and enrollment platform for a retired
O/A Level Mathematics professor with 36+ years of teaching experience.

- **Public site** — Home, About, Subjects, Online Tuition, Achievements, Gallery, Testimonials, Contact
- **Super Admin dashboard** (`/admin`) — CRUD for every section, live-syncing to the public site
- **Lead capture** — demo-class and enrollment requests stored in the database
- **Design system** — "Scholarly Emerald" (deep green + gold), light/dark mode, Framer Motion throughout

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start v1 (React 19 + Vite 7, SSR) |
| Styling | Tailwind CSS v4 (CSS-first config in `src/styles.css`) + shadcn/ui |
| Animation | Framer Motion |
| Data | TanStack Query + Supabase (Postgres, Auth, Realtime) |
| Charts | Recharts |
| Validation | Zod |

## Quick start

```sh
git clone <repository-url>
cd <repository-name>
npm install
cp .env.example .env   # fill in your Supabase values
npm run dev            # http://localhost:8080
```

## Project structure

```
src/
  assets/                 static images (hero, portrait)
  components/
    admin/                dashboard shells + generic CRUD managers
    site/                 public-site building blocks (Header, Footer, carousels, Lightbox…)
    ui/                   shadcn/ui primitives
  hooks/                  use-collection (search/filter/sort/paginate), use-realtime-content, use-hydrated
  integrations/supabase/  generated client, types, auth middleware (do not edit)
  lib/                    admin-config, portfolio-queries, requests, seo, theme, utils
  routes/                 file-based routes; `_authenticated/` is the protected admin subtree
  styles.css              design tokens, themes, custom utilities
supabase/                 project config + migrations
docs/                     setup, deployment, migration and admin guides
```

## Documentation

- [Environment variables](docs/ENVIRONMENT.md)
- [Supabase setup guide](docs/SUPABASE_SETUP.md)
- [Database migration guide](docs/DATABASE_MIGRATIONS.md)
- [Deployment guide (incl. Vercel)](docs/DEPLOYMENT.md)
- [Admin login instructions](docs/ADMIN_GUIDE.md)

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server on port 8080 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Feature checklist

Search, filtering, sorting and pagination (`useCollection`) · lazy-loaded images with skeleton
shimmers (`SmartImage`) · gallery lightbox with keyboard navigation · testimonial and course
carousels · exam countdown (hydration-safe) · announcement popups with scheduling and priority ·
toast notifications · Zod-validated forms · loading / error / empty / 404 / maintenance / success
states · JSON-LD structured data, Open Graph, per-route metadata, `sitemap.xml`, `robots.txt` ·
light/dark theme · Supabase Realtime content sync · row-level security on every table.
