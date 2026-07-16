# RHDP17 — Get Plans into the Folder as PDF (so the AI can read them)

_Goal: every job's finished plan set lives in its `01_DESIGN → Plans` folder as a **PDF**. That PDF syncs to SharePoint automatically and lets the AI (Fog Mirror) pull the trade list for bidding. The AI **cannot** read a raw AutoCAD `.dwg` — it needs the PDF._

**Who does what:** Jesus exports the PDF (he has AutoCAD). Cassie confirms it landed in the folder/SharePoint and kicks off the bidding with the AI.

---

## Step 1 — Jesus: export the DWG to PDF (~30 seconds)
1. Open the current DWG for the job (e.g., Castro: `Castro - Corrections 4202026.dwg`).
2. Type **PLOT** (or File → Plot).
3. **Printer/plotter:** `AutoCAD PDF (General Documentation)`.
4. **What to plot:** the full sheet set (all layouts). Use "Publish" if plotting multiple sheets into one PDF.
5. **Save into the job's Plans folder:** `…/[Job]/01_DESIGN/Plans/`
6. **Name it:** `[Job]_Plans_[YYYY-MM-DD].pdf` — e.g., `Castro_Plans_2026-07-16.pdf`.

## Step 2 — It's in SharePoint automatically
Your `Customers` folder is OneDrive-synced, so once the PDF is saved in the local Plans folder it appears in the matching SharePoint folder. (If a job isn't syncing yet, upload the PDF to that job's folder in the **RHDP DRAFTING PROJECTS 2025** SharePoint library.)

## Step 3 — Cassie: start the bidding with the AI
Once the PDF is in the folder, type to Fog Mirror:
> "Read the plans in **[Castro / Bocian]**'s folder and list the trades we need to bid."

Then continue with the sub flow (see **RHDP17_Subcontractor_Bid_Management.md** and the **South Bay sub list**):
> "Find 3 top-rated **[trade]** subs near **[city]**." → verify → "Draft a bid invitation to **[sub]**…" → "Compare the bids…" → "Draft the subcontractor agreement + checklist…"

---

## Right now — status of the two jobs
- **Castro (Milpitas):** the DWG is in the Plans folder → **Jesus just needs to Plot it to PDF** (Step 1) and save it there. A marker file `_ADD_PDF_PLANSET_HERE.txt` is in the folder as a reminder.
- **Bocian (San José):** the Plans folder is **empty** → **the plan set needs to be added** (DWG + PDF). Marker file is in the folder.

## Naming & housekeeping
- Always: `[Job]_Plans_[date].pdf` in `01_DESIGN/Plans/`.
- Keep the DWG too; older versions go to `Plans/Previous_Versions/` (nothing deleted).
- One current PDF per job so the AI reads the latest.
