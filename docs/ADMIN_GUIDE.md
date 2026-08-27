# Admin login instructions

## Creating the first administrator

1. Open `/auth` on the deployed site and sign up with the professor's email address.
2. Confirm the email if confirmation is enabled.
3. Grant the admin role by running this once in the Supabase SQL editor:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'you@example.com'
on conflict (user_id, role) do nothing;
```

4. Reload `/admin`. Without the role you'll see an "Admin access required" screen instead of the
   dashboard — this is enforced by RLS, not just the UI.

Roles are `admin` (full control) and `editor`. Add further administrators by repeating step 3.

## Signing in

- Go to `/auth`, enter email and password, and you'll land on `/admin`.
- Sessions persist securely in the browser and refresh automatically.
- **Sign out** is in the dashboard header; it clears the query cache before ending the session.

## What you can manage

| Group | Sections |
| --- | --- |
| Site | Hero, About, Profile, Site settings (SEO, brand colours, footer, analytics, maintenance mode) |
| Teaching | Subjects, Featured courses, Teaching services, Exam countdowns |
| Credibility | Qualifications, Experience, Achievements, Student results, Testimonials |
| Media | Gallery (image URL, category, featured flag, ordering) |
| Communication | Announcements, Popup notifications, FAQs, Contact info, Social links |
| Leads | Enrollment & demo requests, with status tracking |

Every change publishes instantly to the public site over Realtime — no rebuild required.

## Tips

- `is_published` hides an item from the public site without deleting it.
- `order_index` controls display order (lower first).
- Announcements and popups accept start/end timestamps for scheduled campaigns.
- Enabling **maintenance mode** in Site settings replaces the public site with a maintenance
  screen; the admin dashboard stays accessible.
- Gallery images are referenced by URL — upload to storage or a CDN and paste the public link.
