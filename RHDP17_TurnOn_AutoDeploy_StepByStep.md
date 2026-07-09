# Turn On Auto-Deploy (Option A) — step by step
### Do this once. After that, updates publish themselves. ~15 minutes.

You'll connect three things: **GitHub** (holds the files) → **Cloudflare Pages** (already have it) → auto-publish. I never enter your logins — these steps are yours, but they're simple and one-time.

---

## Part 1 — Put the site on GitHub (GitHub Desktop = easiest)
1. Download **GitHub Desktop**: https://desktop.github.com → install → open.
2. **Sign in** (or create a free GitHub account — use your rhdpinc email).
3. In GitHub Desktop: **File → Add local repository**.
4. Browse to this folder:
   `...\Christine Contract files\RHDP17_System\01_Dashboard\site`
5. It'll say "this isn't a git repository — create one?" → click **Create a repository** → **Create repository**.
6. Click **Publish repository** (top bar). Name it `rhdp17-fogmirror`. Uncheck "Keep this code private" if you want, or leave private — either works. Click **Publish**.
   ✅ Your dashboard files are now on GitHub.

---

## Part 2 — Connect Cloudflare Pages to that repo
1. Go to **Cloudflare dashboard** → **Workers & Pages** → open your **rhdp17-fogmirror** project.
2. **Settings → Builds & deployments → Connect to Git** (or "Connect to GitHub").
3. Authorize GitHub, then pick the **`rhdp17-fogmirror`** repo.
4. Build settings — set them exactly:
   - **Framework preset:** None
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/`  (just a slash)
5. **Save / Deploy.**
   ✅ Cloudflare now watches that repo.

---

## Part 3 — You're done. From now on:
- When I give you a new version, I update the files in the `site` folder.
- You open **GitHub Desktop** → it shows the changes → type a note → click **Commit to main** → click **Push origin**.
- Cloudflare sees the push and **auto-publishes** in ~1 minute. No zip, no drag-drop, ever again.

---

## If you get stuck
Tell me which Part and step, and I'll walk you through that exact screen. I can also do a live guided walkthrough on your screen if you want — just say "walk me through it."

*Guardrail: I never enter your GitHub or Cloudflare passwords/tokens. You own the accounts; I own the code.*
