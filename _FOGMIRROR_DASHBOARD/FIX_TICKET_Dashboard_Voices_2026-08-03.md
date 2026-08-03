# FIX TICKET — Dashboard voices dead / overview serving the mock
_For the build session (the one with the GitHub repo connected). Everything verified 8/3 by the cloud session; brain row: `RHDP17_BUG_Dashboard_Voices_DEAD_2026-08-03`._

## The one-line job
Repoint `/overview.html` (and `/overview`) to the WIRED build — the Carbon Brass engine currently live at `/v4` — via a GitHub commit + push (auto-deploys to Cloudflare). No direct-to-Cloudflare deploys (doctrine).

## Verified facts (don't re-diagnose)
- `/overview.html` → redirects to `/overview` → serves the "Fog Mirror — Castro" MOCK (mannequin page, deployed direct-to-Cloudflare on 8/2 by the parallel session). It has speaker/mic icons but NO supabase, NO fog-mirror-chat, NO tts calls. Voices can never work there. Mute button is painted-on.
- `/v4` → serves "Fog Mirror · RHDP17 — Carbon Brass" — the real engine (fog-mirror-chat ✓, supabase ✓, Approve & Send cards ✓, V6 layout per commit db2bec5).
- Backend voice engine is ALIVE and needs nothing: Supabase edge functions `elevenlabs-tts` (v26 ACTIVE) and `tts` (v20 ACTIVE, updated 7/31). ElevenLabs is already wired server-side.

## Steps
1. In the repo, find what serves the `/overview` route (worker router or static asset) — it currently points at the 20KB mock.
2. Point `/overview.html` and `/overview` at the same asset `/v4` serves (or copy the v4 HTML as overview.html). Keep the mock file in the repo under an `_OLD/` or clearly-marked name if the V4.5 Cowork look is still wanted as a design reference — never delete.
3. Commit through GitHub (message: "Restore /overview to wired build — fixes dead voices, closes RHDP17_BUG_Dashboard_Voices_DEAD_2026-08-03") and let auto-deploy run.
4. VERIFY AT THE LIVE LAYER (browser, not repo): open `/overview.html`, hard refresh (Cmd+Shift+R), title must read "Fog Mirror · RHDP17 — Carbon Brass", tap a bot face, confirm you HEAR the voice, and the mute toggle actually silences it.
5. Update the brain row `RHDP17_BUG_Dashboard_Voices_DEAD_2026-08-03` → STATUS: CLOSED, with the commit hash.

## Why the cloud session couldn't do it
Its GitHub credential is bound to zero repositories (probed markjensen1020 / markjensens1020 across 20+ repo names — all refused), and its sandbox can't fetch the live v4 HTML raw. The only current copy of the wired build is in the repo and on the live URL — both reachable only from the build session.
