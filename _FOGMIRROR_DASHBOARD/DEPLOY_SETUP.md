# Fog Mirror Dashboard — Auto-Deploy Setup (do this ONCE, then never zip again)
_Goal: after this one-time setup, the dashboard updates itself. When the GitHub repo changes, Cloudflare rebuilds and publishes automatically. No more uploading zips._

## Good to know first
- Your site already **auto-updates on the visitor's side** (`sw.js` is network-first and `_headers` forces revalidation). So once something is deployed, everyone sees the latest — no `?v=` version bumping needed anymore. We can drop that habit.
- This setup connects your **files → GitHub → Cloudflare**. The only manual thing left after setup is editing a file in GitHub (which I can do for you in a session), and Cloudflare deploys it on its own.

## One-time setup (~10 minutes)
**Step A — clean the folder**
- In `_FOGMIRROR_DASHBOARD`, turn on "show hidden files" and delete the hidden **`.git`** folder if it's there (a broken one got left behind; it's harmless but delete it). Or just use the clean `fogmirror-dashboard-source.zip` I put in the Customers folder and unzip it somewhere fresh.

**Step B — put the files on GitHub**
1. Go to github.com and sign in (create a free account if you don't have one).
2. Click **New repository**. Name it `rhdp17-fogmirror`. Set it **Private**. Don't add a README. Create.
3. On the empty repo page, click **"uploading an existing file."**
4. Drag in **all the files inside** `_FOGMIRROR_DASHBOARD` (the files themselves — dashboard.html, authgate.js, the icons folder, etc. — not the outer folder). Wait for them to list, then **Commit changes**.

**Step C — connect Cloudflare Pages to the repo**
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**.
2. Authorize GitHub, pick the `rhdp17-fogmirror` repo.
3. Build settings (per Cloudflare's docs for a no-build static site):
   - **Framework preset:** None
   - **Build command:** `exit 0`  (Cloudflare's recommended value when there's nothing to build; keeps Pages Functions available)
   - **Build output directory:** `/` (root)
4. **Save and Deploy.** In ~1 minute it's live at your `*.pages.dev` URL (you can point `rhdp17-fogmirror.pages.dev` / a custom domain at it in Settings → Custom domains).

## That's it — from now on
- To publish a change: update the file in GitHub → Cloudflare auto-deploys in about a minute. **No zip, ever again.**
- In a future session I can commit updated files straight to the repo for you (if you connect GitHub in Cowork, or install GitHub Desktop so we can push from your machine).

## Still on your list (separate from this)
- This auto-deploys the **front-end**. The real security lock-down (Supabase Auth + edge-function JWT checks) is the separate `RHDP17_LOCKDOWN_STEP1.md` checklist — do that on the Supabase side so the data endpoints are protected, not just the UI.
