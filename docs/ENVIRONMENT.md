# Environment variables

Copy `.env.example` to `.env` and fill in the values. `.env` is git-ignored.

## Variables

| Name | Scope | Required | Description |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | Yes | Supabase project API URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Yes | Publishable (anon) key. Safe to ship — RLS enforces access. |
| `VITE_SUPABASE_PROJECT_ID` | Browser | Yes | Project reference id. |
| `SUPABASE_URL` | Server | Yes | Same URL, read by server functions during SSR. |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Yes | Same publishable key, for server-side public reads. |
| `SUPABASE_PROJECT_ID` | Server | Yes | Project reference id. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | No | Bypasses RLS. Only for privileged maintenance jobs. |

## Rules

- Only `VITE_`-prefixed variables reach the browser. Read them with `import.meta.env.VITE_*`.
- Read server variables with `process.env.X` **inside** a handler, never at module scope.
- Never rename a service-role key to a `VITE_` variable.
- On Vercel, add every variable above under **Project → Settings → Environment Variables** for
  the Production, Preview and Development environments.

## Runtime-editable settings

Site title, description, keywords, OG image, logo, favicon, brand colours, footer text, the
Google Analytics measurement id and maintenance mode are **not** environment variables — they
live in the `site_settings` table and are edited from the admin dashboard, applying instantly.
