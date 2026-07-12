# RHDP17 / FOG MIRROR — MEMORY & BOOT CONTEXT

> ## ► COPY-PASTE BOOT PROMPT (start every new session with this)
> **Good morning. Before anything else, connect the folder `Christine Contract files\Customers` and read `RHDP17_MEMORY_CLAUDE.md` in it, top to bottom — that's your full context for RHDP17 / Fog Mirror. Confirm you've loaded it by giving me a 3-line status: (1) current dashboard version, (2) anything in the Open Queue you'd flag, (3) what you need from me. Then wait for my task. Follow all guardrails in the file. Do not assume memory from any past session.**

---

### Paste or attach this file at the START of every new Cowork session.
Cowork has no automatic memory across sessions (each session starts blank). This one file is the memory. It lets any fresh session pick up the whole system without reverse-engineering it. Keep it updated: when something important changes, tell Claude "update the memory file."

_Last updated: 2026-07-11 by Mark + Claude. Source: verified session logs + the real files in this folder._

---

## 1. WHO / WHAT
- **Business:** Richard Haro Drafting & Planning (RHDP). CA contractor/design license **#704179**. Residential **design & drafting** firm in the San José / Santa Clara County / Bay Area market.
- **Critical rule:** the firm is **NOT an architect** and must never hold out as one (California Architects Practice Act). Plans are signed by the designer; structural is by the licensed **engineer of record**.
- **Primary user:** Mark Jensen — mark@rhdpinc.com (director).
- **"Fog Mirror" / "RHDP17"** = the internal codename for this whole system (mail engine + dashboard + filing system). It is NOT the German backup software of the same name — ignore that.

## 2. THE SYSTEM (three parts)
1. **Serverless mail engine** — Supabase edge functions (`mail-sweep` v9, `draft-reply`, `followup-status`, `sp-explore`, `aol-mail-poller`, `client-data`) + DST-safe `pg_cron` job `rhdp17-mail-sweep-dst-safe` (fires 7am/1pm/4pm PT). Reads the shared `haroinc@rhdpinc.com` mailbox via Microsoft Graph (app-only), classifies + routes mail into a `followups` table, and can create Outlook **drafts** (never sends). Runs fully in the cloud.
2. **Dashboard** — static multi-page site deployed to **Cloudflare Pages** (`rhdp17-fogmirror.pages.dev/dashboard.html?v=NN`). Latest local build worked on here: **v97**. History: v96 = all 15 customer folder links wired to OneDrive; **v97 = login lock-down layer 1** — shared `authgate.js` Microsoft sign-in gate added to all 25 internal pages (front-end gate only; server-side enforcement still pending, see `RHDP17_LOCKDOWN_STEP1.md`). Pages: dashboard, clients (Client Cockpit), design, construction, billing, selection boards, forms, plus the Fog Mirror chat widget.
3. **Customer filing system** — the 15 customer folders in THIS folder (OneDrive-synced Desktop). Standard layout is defined in `_FILING_SYSTEM_GUIDE.md`. Masters live in `_FORMS/` and `_TEMPLATE/`.

## 3. GUARDRAILS (do not cross)
- **AI drafts; a human approves** anything sent to a client, city, or consultant.
- **Money out = Irma or Richard only.** Never initiate payments/transfers.
- **Keys live only in Supabase secrets** — never in files or the dashboard.
- Dashboard has **no login gate yet** — the #1 security item before wider sharing.
- **Never touch `harodraftingplanning.com` DNS.**
- RHDP17 branding stays off client-facing legal docs.

## 3b. DEPLOYMENT — LIVE & AUTO-DEPLOYING (as of 2026-07-12) ✅
- **LIVE URL:** `https://rhdp17-fogmirror.markjensens1020.workers.dev` (serving the real dashboard + login gate). Deployed as a Cloudflare **Worker** (Git-connected, `npx wrangler deploy`), serving static files from the `_FOGMIRROR_DASHBOARD/` subfolder of the repo.
- **AUTO-DEPLOY IS DONE — no more zips.** GitHub repo `github.com/markjensens1020-dot/rhdp17-fogmirror` (branch `main`) is connected to Cloudflare. Any commit to the repo rebuilds + redeploys automatically. To publish a change: update the files in `_FOGMIRROR_DASHBOARD/` in the repo (GitHub web upload), commit — Cloudflare deploys in ~1 min.
- Site files live in the repo under **`_FOGMIRROR_DASHBOARD/`** (not root). Build output/assets dir = that subfolder. Old junk (`.git` internals, `fogmirror-rhdp17-v95.zip`) still sits at repo root — harmless, can be cleaned.
- The OLD `rhdp17-fogmirror.pages.dev` project is an orphaned blank direct-upload project — safe to delete.
- **Version-number ritual (`?v=NN`) retired** — `sw.js` is network-first + `_headers` forces revalidation, so visitors always get the latest once deployed.
- Git can't run inside the OneDrive mount (sync locks `.git`); do git work via GitHub web upload. Clean upload source kept at `Customers/_FOGMIRROR_UPLOAD_ME/` (no `.git`).

## 4. STANDING "FOREVER" RULES
- **#3 — Full set in every customer folder.** Every customer folder is always pre-loaded with the complete form/contract set. `_TEMPLATE/` holds the masters. **On any master update, re-distribute to all customers.** (Verified 2026-07-11: all 15 folders complete; CSLB Standards doc re-synced to the newest master.)
- **#4 — Every new dashboard version ships automatically:** deliver the `.zip` + the copy-paste URL, no asking.

## 5. TEAM & ROLES (used by the dashboard routing/board)
- **Mark** — Director (routes picks to drawings).
- **Richard** — Design/approval (also money-approval). ~70–80% out (health). Guidance/approval only.
- **Irma** — Intake / selection concierge (also money-approval). ~70–80% out (caretaker).
- **Jesus** — Drafter (city/plan-check corrections, engineer coordination).
- **Cassie** — Coordinator (client/inbound, selection intake).
- **Maya** — Bookkeeper (billing/money items).
- Mail routing: **city/.gov → All** (shows for everyone), corrections → Jesus, client → Cassie, money → Maya, unclear → Triage.

## 6. CUSTOMERS (15) — folder name / notes
Balcunas · Bocian · Buddhist_Temple_Huyen_Khong · Castro · Chang · Chung · Eckinger · Haraguchi · Hsieh · Kurt_Apen · Loukanov · Orquidea_Negrete · Sanchez · Tavares_Uvas_Rd · Tolentino.
Each folder: `STATUS.md` (open first) + `00_Intake_and_Contract/` + `01_DESIGN/` (Plans, Emails, City-County, Consultants[Title24/Engineering/Soils/Environmental], Selection_Board) + `02_CONSTRUCTION/` (Subcontractors, Invoices_and_Billing, Inspections, Emails).

## 7. CONTRACTS & LEGAL (key facts — details in `_FORMS/RHDP17_Contract_Standards_CSLB.md`)
- **Design Services Agreement** = a separate professional-services contract, **NOT** a home-improvement contract under BPC §7159 → **not** subject to the §7159.5 down-payment cap → the **25% retainer (first & separate) is legal**, no bond. Fee schedule: **25% retainer / 50% at submittal / 25% at permit.** Keep it design-only.
- **Design Phase Retainer** doc = fallback, home-improvement style with the $1,000/10% cap language (only for an actual construction contract).
- **Additions / new SFR for a homeowner** = home improvement → subject to the $1,000-or-10% **deposit** cap (cap is on the up-front deposit only, not the total; collect the rest via dollar-value progress milestones). Legal ways to take more up front: CSLB-approved bond, commercial/developer client, or the separate design retainer.
- **Subcontractor Agreement + Info/Insurance form** = B2B (GC↔sub), consumer deposit cap doesn't apply; require CSLB license + COI (additional insured) + W-9 + workers' comp + lien waiver + CA anti-indemnity (Civ §2782) + 3-bids rule.
- Style rule: all contracts/retainers are plain **black-and-white professional** (CSLB ≥10pt + bold headings). Color is for dashboards only.
- Legal-software path (Mark's budget choice): CSLB free Sample Home Improvement Contract + Rocket Lawyer (~$40/mo, monthly attorney review). Not legal advice.

## 8. KNOWLEDGE BASES BUILT (in `_FORMS/`)
- `RHDP17_BayArea_JobSite_Posting_Requirements.md` (23 jurisdictions; story-pole cities, sign rules).
- `RHDP17_Setbacks_SantaClaraCounty.md` and `RHDP17_Setbacks_SanMateo_and_SF.md` (front/side/rear, height, FAR, ADU; per-jurisdiction gotchas).
- Compliance red-flags (fire/WUI/7A/sprinklers, demolition/C&D, dust/NOA, stormwater/SWPPP, per-city triggers).

## 9. OPEN QUEUE (as of 2026-07-11, confirm before acting)
1. Dashboard **login lock-down** (roles enum + allowlist exist; gated on Mark sending team emails).
2. Wire dashboard Plans → each client's current DWG+PDF; Corrections → city correction list; retire Team view.
3. Customer **share-link** view (client sees only their project; margins hidden).
4. Email attachments → auto-file into client folders (dedup; older DWG/PDF → `Plans/Previous_Versions/`).
5. **SharePoint = single source of truth (DECIDED 2026-07-12).** Files live in a shared SharePoint library (the master); each teammate syncs it locally so it also appears as a OneDrive folder (same files, both places). Dashboard folder cards link to the SharePoint web URLs (work for the whole team, any device). Migration + sharing permissions = Mark's action (Claude can't move files into SharePoint or change access). Candidate home: existing `AllProjectsAlert / RHDP DRAFTING PROJECTS 2025` library (already has project folders + was linked in v95). Once the SharePoint home + folder URLs are known, Claude re-wires the 15 dashboard cards (currently pointing at Mark's local OneDrive path = a v96 mistake for a shared dashboard).
6. AI Selection Concierge (bot fetch/classify/place products); address→zoning/buildability lookup tool.

## 10. HOW TO USE THIS FILE (per the Cowork "memory system" approach)
- Start each new session by attaching this file (or say: "Read RHDP17_MEMORY_CLAUDE.md in the Customers folder first").
- There is **no** persistent "version 97" agent — every session is fresh. This file is what makes a new session feel continuous.
- When something material changes (a new dashboard version, a rule, a customer, a legal finding), tell Claude to **update this file** so it never drifts.
- Separate parallel sessions do **not** share memory with each other — pick one session to drive a given piece of work.

## 11. INSTALLED SKILL + WHERE THE FILES LIVE (2026-07-12)
- **Skill installed:** `deploy-fogmirror-dashboard` — say "deploy the dashboard" to run the web-upload → GitHub → Cloudflare auto-deploy workflow.
- **Ready-to-upload build:** `Customers/_FOGMIRROR_FINAL_UPLOAD/` (clean, no private docs; has dashboard.html w/ SharePoint buttons + authgate.js v98 + index.html). Upload its contents to the GitHub repo's `_FOGMIRROR_DASHBOARD/` folder to publish.
- **Per-customer deliverables (PRIVATE, in each customer folder):** `<Name>_Client_File.html` (branded gold/dark), `<Name>_Process_Form_FILLED.html`, plus the earlier `<Name>_Client_Packet.html` and `FORM-001_..._FILLED.html`. Never put these in the dashboard repo.
- **Memory/context files (this folder):** `RHDP17_MEMORY_CLAUDE.md` (this file — read first), `RHDP17_LOCKDOWN_STEP1.md`, `SHAREPOINT_MIGRATION_STEPS.md`, `RHDP17_GEMINI_REVIEW_PROMPT.md`, `_FILING_SYSTEM_GUIDE.md`.
- **Status snapshot:** dashboard LIVE + auto-deploying ✓ · login gate deployed ✓ · v98 token wiring done (in the pending upload) ✓ · SharePoint = source of truth, buttons wired to team site ✓ · 15 branded Client Files done ✓ · server-side lock-down (Supabase) still Mark's to-do.
