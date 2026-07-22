# RHDP17 — The One Filing Standard (SharePoint + OneDrive, forever)

_This is THE rule for where every file lives. Loaded into every bot so they file things the same way every time, tell the team exactly where to find anything, and never let it turn into a mess again. One home. One structure. Latest on top, old stuff archived — never deleted._

## The #1 rule: ONE home
All project files live in **one** SharePoint site — the canonical team site:
**`richardharodraftingand.sharepoint.com/sites/TeamRHDP17` → `Shared Documents`**
The old sites (**AllProjectsAlert** and the two "**Collaborate**" ones) are **legacy** — do not save new work there. Anything still on them gets **moved** into the home above (copy, verify, then the old copy goes to an `_ARCHIVE` folder — never delete). If you're ever unsure where a file goes, it goes here.

## The top-level structure (mirrors the desktop)
Inside `RHDP DRAFTING PROJECTS 2025`:
```
├── 01_In-Process_Design/        → customers in design
├── 02_In-Process_Construction/  → customers in construction/bidding
├── 03_On_Hold/                  → paused jobs
├── 04_Completed/                → finished jobs
├── _FORMS/                      → blank forms & contracts (one copy, master)
├── _TEMPLATE/                   → the new-customer starter folder
└── _ARCHIVE/                    → old sites' contents, superseded files
```
A customer moves between the four phase folders as their job progresses — that's the live pipeline.

## Inside every customer folder (always the same)
```
[Customer Name]/
├── 01_DESIGN/         → plans (latest PDF + DWG), intake, retainer, selections
├── 02_CONSTRUCTION/   → subcontractors, permits, inspections, schedule
├── 03_EMAILS/         → saved client/city/consultant emails
├── 04_CITY-COUNTY/    → submittals, corrections, portal receipts
├── 05_BILLING/        → invoices, payments (money handled by Irma/Richard)
└── _OLD/              → superseded plan versions (keep, don't delete)
```

## File rules (so it stays clean)
- **Latest on top, old underneath.** The current plan set stays in `01_DESIGN`; older rounds move to `_OLD`. Same for DWGs.
- **Plans:** the editable **DWG** is the source of truth (edited only in AutoCAD, then locked). A **PDF** of the sheet set always sits next to it — that's what the bots read and what goes to city portals.
- **One name per customer**, matching the desktop folders (e.g., `Castro`, `Chang`, `Bocian`). No duplicates, no "Castro copy," no "Castro final final."
- **Nothing deleted** — superseded files move to `_OLD` or `_ARCHIVE`.

## How the bots use this (every bot)
- When asked "where is X for [customer]?" → give the exact path from this standard.
- When filing something → put it in the right subfolder above; if it's a plan, keep latest on top and move the old one to `_OLD`.
- If a file is found on a legacy "Collaborate" site → flag it to be moved into the one home, don't work off the old copy.
- Keep each customer's Status/Process form current in `02_CONSTRUCTION` (or `01_DESIGN` pre-permit).

This standard is the same on the desktop (`Christine Contract files/Customers`) and in SharePoint — they mirror each other so anyone, on any device, finds things in the same place.
