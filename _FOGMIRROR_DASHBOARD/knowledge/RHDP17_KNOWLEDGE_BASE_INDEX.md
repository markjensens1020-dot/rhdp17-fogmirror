# RHDP17 — Master Knowledge Base Index (the AI Bots' Brain)

_This is the single catalog of everything the RHDP17 AI bots (Fog Mirror, and the role assistants) should "know." Every real form, knowledge base, process guide, template, and vendor lives here. **Load this + the files it points to into the bots as their knowledge base** so they can guide the team accurately. Keep it updated as we add more._

> **Rule for the bots:** guide the team using this knowledge, but for exact **legal/code specifics** (CSLB rules, California/city building codes, setbacks), cite the source doc and have a person verify against the official code — never state a code number as final on the bot's word alone. **★ The full rule is in `RHDP17_Codes_and_Verification_Rule.md` (the Grounded-Answer Rule) — load it into every bot.** Current code: 2025 California Building Standards Code (Title 24), effective Jan 1 2026.

_Last updated: 2026-07-16._

---

## 1. THE FORMS (real, in `_FORMS/` and each job's `_TEMPLATE`)
- **FORM-001 — Client Intake** (`FORM-001_Client_Intake.html`) — first contact; captures client, project type, budget, timeline. Live on the dashboard at `/forms/01-client-intake`; Submit now downloads a named record to file.
- **FORM-002 — Customer Onboarding** (`FORM-002_Customer_Onboarding.html`) — after booking; sets up the client in the system.
- **FORM-003 — Design Binder & Selection Board** (`FORM-003_...html`) — the design/selection package.
- **FORM-003b — Selection Board WITH Vendors** — selection board pre-loaded with vendor sources (see §5 vendors).
- **FORM-003c — Selection Board Concierge** — selection board + vendor product sourcing (granite/marble/tile) + photos.
- **Forms 3–7 incl. Form 5 Weekly Status** (`FORMS-3to7_incl_Form5_Weekly_Status.html`) — the ongoing process/status forms.
- **Agreements/contracts:** `RHDP17_Design_Services_Agreement.docx`, `RHDP17_Design_Phase_Retainer.docx`, `RHDP17_Agreement_Owner_and_Designer_TEMPLATE.docx`, `RHDP17_Project_Process_Form_TEMPLATE.docx`, plus `Contracts/`.

## 2. KNOWLEDGE BASES (California / Bay Area codes & rules — in `_FORMS/`)
- **`RHDP17_Contract_Standards_CSLB.md`** — CSLB contract rules, design-services vs. home-improvement, deposit caps, fee schedule (25/50/25), subcontractor B2B requirements.
- **`RHDP17_Setbacks_SantaClaraCounty.md`** — front/side/rear setbacks, height, FAR, ADU rules; per-jurisdiction gotchas (San José, Milpitas, etc.).
- **`RHDP17_Setbacks_SanMateo_and_SF.md`** — same for San Mateo & San Francisco.
- **`RHDP17_BayArea_JobSite_Posting_Requirements.md`** — 23 jurisdictions; story-pole cities, sign rules, posting.
- _(Compliance red-flags — fire/WUI/7A/sprinklers, demolition/C&D, dust/NOA, stormwater/SWPPP — captured in the above.)_

## 3. PROCESS GUIDES (how we do things — in Customers root)
- **`RHDP17_TEAM_GUIDE.md`** — full dashboard guide + Phrases & Prompts Cheat Sheet.
- **`RHDP17_How_The_System_Works.md`** — plain-English architecture for the whole team.
- **`RHDP17_Billing_With_Maya.md`** — milestone → invoice → collect via Maya; fee schedule; approvals.
- **`RHDP17_Subcontractor_Bid_Management.md`** — 3-bids-per-trade process + required doc packet.
- **`RHDP17_SubList_SouthBay_Castro_Bocian.md`** — vetted South Bay subs by trade (verify before use).
- **`RHDP17_Bid_Invitation_Template.md`** — reusable bid invite (email + SMS).
- **`RHDP17_Plans_to_PDF_Instructions.md`** — get plan PDFs into the folder so the AI can read trades.
- **`RHDP17_Cassie_Checklist_Files_and_Subs.md`** — Cassie's execution checklist.
- **`RHDP17_AutoFile_PowerAutomate_Guide.md`** — auto-file intakes into SharePoint (pending build).
- **`_FILING_SYSTEM_GUIDE.md`** — the standard folder layout.

## 4. FILING SYSTEM (the `_TEMPLATE` layout — every job matches this)
`00_Intake_and_Contract/` (intake, onboarding, agreements, status sheet) · `01_DESIGN/` (Plans, City-County, Consultants[Title24/Engineering/Soils/Environmental], Emails, Selection_Board) · `02_CONSTRUCTION/` (Subcontractors, Invoices_and_Billing, Inspections, Emails). **Standing Rule #3:** every customer folder is pre-loaded with the full form/contract set; on any master update, re-distribute.

## 5. SELECTION-BOARD VENDORS (granite / marble / quartz / tile — from FORM-003b/c)
- **Stone / slab (countertops):** Bay Stone Depot (baystonedepot.com), Artistic Stone (artisticstoneinc.com), All Natural Stone (allnaturalstone.com), Deco Kitchen Bath (decokitchenbath.com), HomeXpo Design (homexpodesign.com), KBDC Showroom (kbdcshowroom.com).
- **Tile:** Porcelanosa San José (porcelanosa.com), The Tile Shop (tileshop.com), FMD Distributor (fmddistributor.com).
- _Use for sourcing client selections; keep the product's source link on the board (see photo workflow)._

## 6. TEAM ROLES & GUARDRAILS (the bots enforce these)
- **Roles:** Mark (director) · Richard (design/approvals/money) · Irma (approvals/money/intake) · Jesus (drafter/plan-check) · Cassie (coordinator/intake/selections) · Maya (bookkeeper).
- **Guardrails:** AI drafts, a person always sends · money out = Irma/Richard only · keys stay in Supabase secrets · firm is NOT an architect (never hold out as one) · never touch harodraftingplanning.com DNS · RHDP17 branding off client legal docs.

## 7. HOW TO LOAD THIS INTO THE BOTS
**★ Per-role assignments: `RHDP17_Role_Knowledge_Map.md`** — which docs load into Cassie vs Maya vs Irma vs Richard/"Raymond", plus a Shared Brain for all. Load the Shared Brain into every bot, then each role's own set, then the live-lookup tool (`fogmirror-grounded-lookup.ts`).
The bots become "smart about RHDP17" when this index + the docs it points to are given to them as their knowledge base (a system prompt + the reference docs, or a retrieval index in Supabase). Next build: wire Fog Mirror's edge function to this knowledge so Cassie/Maya/etc. get answers grounded in *our* real forms and rules — not generic guesses. (Mark's Supabase side + Claude designs the setup.)

## 8. ADD-MORE QUEUE (grow the brain)
- Selection Board photo workflow / Concierge (pull vendor product photos onto the board — see chat).
- Per-jurisdiction submittal checklists (extend the setbacks/posting KBs into step-by-step submittal guides).
- Bookkeeping playbook for Maya (invoice templates, collections cadence, QuickBooks steps).
- City portal quick-links per jurisdiction.
