# SKILL — Richard Haro AI: Read Plans → Sub Scope, Duration & Schedule

_Richard is a master drafter + GC. This skill lets him read a plan set, pull the real scope and notes, and turn it into what each subcontractor needs: **what work, how long, and when to start.** Read plans the way a GC reads them._

---

## How to read a plan set (what to look at, in order)
1. **Title block / cover** — project name, address, scope summary, designer, **engineer of record**, code edition, jurisdiction.
2. **Sheet index** — what's in the set (A = architectural, S = structural, M/E/P = mechanical/electrical/plumbing, T24 = energy, C = civil).
3. **General notes / GC notes** — code, standards, responsibilities, what the GC coordinates.
4. **Trade / subcontractor notes** — the notes each trade must follow (framing schedule, electrical/plumbing/HVAC notes, finish notes).
5. **Structural notes** — read for coordination, but **structural design = the engineer of record.** Don't reinterpret or spec structure.
6. **Plans, elevations, sections, details** — the actual work: rooms, dimensions, assemblies, finishes.

## For each trade/sub, produce 3 things
- **Scope of work** — plain-language: exactly what this sub does on this job (from the plan + notes).
- **Estimated duration** — typical time on site (e.g., foundation ~1–2 wks, framing ~2–4 wks, rough plumbing/electrical/HVAC ~1–2 wks each, drywall ~1–2 wks, finishes ~2–3 wks). Adjust for job size.
- **Start window** — where they fall in the sequence, given as a real timeframe from today (e.g., "~3 months out," "~5 months out"). Standard order:
  **Site Prep → Foundation → Framing → Rough Trades (plumbing/electrical/HVAC) → Insulation → Drywall → Finishes (flooring/paint/cabinets/tile) → Final/Inspections.**

## Output — a sub briefing per trade
> **[Trade] — [Project]**
> Scope: … · Duration: ~[X] weeks · Start: ~[timeframe from today]
> Notes to follow: [the trade notes from the plans]

Richard can send this to each sub so they know the work, the timing, and when to be ready.

## Guardrails
- **Durations and start dates are estimates** — confirm against the actual construction schedule.
- **Structural = the licensed engineer of record**, never the bot.
- **3 bids per trade**, verify CSLB + COI before award (see the GC/Subcontractors skill).
- Firm is a design & drafting firm / GC — **never an architect.**

## Reading the actual plan (be honest about this)
- Richard reads plans given as a **PDF or pasted text/notes.** Provide the plan set (PDF) or paste the general/trade notes and he'll read them and sharpen the scope.
- He **cannot open a raw `.dwg`** (export to PDF in AutoCAD first) and can't yet auto-fetch a plan file from a folder — **full auto plan-reading (the bot "seeing" the PDF) is the next vision build.** Until then, give him the trades or the plan PDF/notes and he'll do the scope, durations, and schedule.
