# Gemini Review Prompt — check the Fog Mirror v97 work
_Paste the prompt below into Gemini. Attach `fogmirror-dashboard-source.zip` (or at least `dashboard.html`, `authgate.js`, and 2–3 other page files like `billing.html`, `clients.html`). Then compare Gemini's findings to what was claimed._

---

You are a senior web/security engineer doing an independent code review. I will attach a static multi-page dashboard (HTML/JS deployed to Cloudflare Pages). Another AI just made three changes and I want you to verify them honestly and skeptically. Do not assume the changes are correct — check the actual files.

**Claim 1 — Login gate on every internal page.**
A shared file `authgate.js` was added and included on all internal pages. On load, each page should check for a Supabase auth session and, if none, show a full-screen "Sign in with Microsoft" gate that blocks the page; when signed in it shows a sign-out chip.
- Verify `authgate.js` actually does this (creates the Supabase client, calls `getSession`, injects a gate overlay, wires `signIn`/`signOut` via `signInWithOAuth({provider:'azure'})`, and reacts to `onAuthStateChange`).
- Verify every top-level page (e.g. dashboard.html, clients.html, billing.html, design.html, construction.html) includes `<script src="./authgate.js">`.
- Confirm it's idempotent (no-ops on `index.html`, which already has its own `#gate`).

**Claim 2 — All 15 customer folder links.**
`dashboard.html` has a `CUSTFOLDER` map of 15 customers to real folder names, and clicking a customer card copies the folder path to the clipboard and attempts to open a `file:///` URL.
- Verify all 15 are present and the click handler `openCust` does the copy + open.
- Flag any customer name→folder mismatches.

**Claim 3 — Auto-deploy via Git-connected Cloudflare Pages.**
The plan is: push files to a GitHub repo, connect Cloudflare Pages (Framework: None, no build command, output dir root), and every change auto-deploys — no more manual zip uploads.
- Is that Cloudflare Pages configuration correct for a plain static site with no build step?
- Anything that would break the deploy (bad paths, absolute paths, missing files)?

**Most important — call out honesty gaps.**
- Is the login gate REAL security, or just a front-end UI gate? The Supabase edge functions still accept a public anon key for data. State plainly whether an unauthenticated person could still read data by calling the endpoints directly, and what server-side steps (JWT verification, allowlist, RLS) are required to truly lock it down.
- Point out any JavaScript syntax errors, broken links, or dead buttons you find.

Give me a short verdict per claim (Verified / Partly / Not verified) with the specific evidence you saw.
