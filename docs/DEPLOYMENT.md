# Deployment guide

The app is a TanStack Start (SSR) application. It builds to a server bundle plus static assets and
runs on any Node or edge host.

## Build

```sh
npm ci
npm run build
```

## Option 1 — One-click (Lovable)

Open the project in Lovable and press **Publish**. Frontend changes go live after publishing;
backend changes (database, policies) apply immediately. A custom domain can be connected from
**Project settings → Domains** once the project has been published at least once.

## Option 2 — Vercel

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project** and import the repository.
3. Framework preset: **Vite**. Vercel detects the TanStack Start build automatically.
   - Build command: `npm run build`
   - Install command: `npm ci`
4. Add every variable from [ENVIRONMENT.md](ENVIRONMENT.md) under **Settings → Environment
   Variables** for Production, Preview and Development.
5. Deploy. Vercel handles SSR routing — no `vercel.json` rewrites are needed, and you must not add
   SPA catch-all rewrites, which would break server rendering.
6. Add your domain under **Settings → Domains**, then add the same origin to the Supabase
   **Redirect URLs** list so admin login works in production.

### Vercel checklist

- [ ] Environment variables set for all three environments
- [ ] Production domain added to Supabase redirect URLs
- [ ] `site_settings.maintenance_mode` is `false`
- [ ] `public/robots.txt` and `/sitemap.xml` reachable on the live domain
- [ ] Google Analytics id set in the admin dashboard (optional)

## Option 3 — Netlify / Cloudflare / Node host

- Build command `npm run build`; serve the generated server entry with `node`.
- Cloudflare Workers: the output targets the edge runtime — avoid Node-only dependencies
  (`child_process`, `sharp`, native addons) in server code.

## Post-deploy verification

1. Visit `/` and confirm content renders server-side (view source shows the copy).
2. Submit a demo request and confirm the row appears under **Admin → Enrollments**.
3. Sign in at `/auth`, confirm `/admin` loads and an edit reflects on the public site instantly.
4. Check `/sitemap.xml`, `/robots.txt`, and a deliberate 404 such as `/nope`.
