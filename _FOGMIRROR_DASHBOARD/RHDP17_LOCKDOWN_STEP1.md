# RHDP17 / Fog Mirror — DASHBOARD LOCK-DOWN · Step 1
_Built 2026-07-12. Ships in dashboard build **v97**._

## What Step 1 did (front-end gate — done, from the dashboard code)
- Added `authgate.js`: a shared login gate that reuses your existing **Microsoft (azure) Supabase sign-in** from `index.html`.
- Wired it into **all 25 internal pages** (dashboard, clients, design, design-studio, construction, billing, bids, bidmanager, selection boards, portals, debrief, apps, financing, sub, retainer, mic, upload, teach, client, portal, invest pages, copycat).
- Behavior: on load, each page checks for a Supabase session. **No session → a full-screen "Sign in with Microsoft" gate blocks the page.** Signed in → gate clears and a small "sign out" chip appears top-right.
- Skipped on purpose: `index.html` (already self-gates), its `.prev` backups, and `selftest.html`.

## ⚠️ Honest limit — this is layer 1, not full security yet
A front-end gate hides the UI, but the data still comes from your Supabase **edge functions, which currently accept the public anon key**. A technical person could call those endpoints directly and read data without signing in. To make the lock-down real, the enforcement has to move server-side. That's the part below — it needs the Supabase project (the other session / your account), not this one.

## What YOU (or the Supabase session) must do to make it real — in order
1. **Enable the Microsoft/Azure provider in Supabase Auth**
   - Supabase → Authentication → Providers → Azure: turn on, paste the Entra **Application (client) ID** + **client secret**, set tenant to your single tenant.
   - Authentication → URL Configuration → add redirect URLs: `https://rhdp17-fogmirror.pages.dev/*` (and any custom domain).
2. **Restrict to @rhdpinc.com + the allowlist**
   - You already have `rhdp_role_allowlist` + the `app_role` enum. Make sure every staff email is a row there with a role (Executive / Design Studio / Field-Construction / Finance / Client / Subcontractor).
   - This is the "send team emails to the allowlist" item that gates the whole lock-down.
3. **Make the edge functions verify the user (the real fix)**
   - In each data function (`dashboard-data`, `client-data`, `followups-data`, `draft-reply`, `followup-status`, etc.): require the caller's **Authorization: Bearer <user access_token>**, verify it with `supabase.auth.getUser(jwt)`, and reject if the email isn't in `rhdp_role_allowlist`.
   - Stop accepting the bare anon key for data reads.
   - Update the dashboard fetches to send the **session token** instead of the anon key (there's a `window.onAuthReady(token,email)` hook in `authgate.js` you can use — I can wire the fetches to it next).
4. **Turn on Row Level Security** on the underlying tables (`dashboard_projects`, `followups`, `client_status`, etc.) with policies keyed to the authenticated user's role, so even a direct DB hit is scoped.
5. **Re-test:** open `dashboard.html` in a private window → should show the gate → sign in with a @rhdpinc.com account → loads. Try an account NOT on the allowlist → should be denied.

## Suggested next step from THIS session (I can do it)
Wire every page's data fetch to use the signed-in user's token via the `onAuthReady` hook, so the moment you flip the functions to require a real JWT (step 3), the dashboard keeps working with zero more edits. Say the word and I'll do that as v98.

_Guardrail reminder: keys live only in Supabase secrets; never paste the client secret into the dashboard files._
