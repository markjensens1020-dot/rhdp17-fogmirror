# RHDP17 — Codes & the Grounded-Answer Verification Rule

_The safety measure: whenever a bot's answer will be **used for something real** — a city correction response, a submittal, a permit, or a client communication — it must be **verified against the authoritative source**, not answered from memory alone. This rule is what makes the bots trustworthy instead of risky. Load it into every bot._

---

## THE GROUNDED-ANSWER RULE (wire into all bots)
For any **code / legal / structural / jurisdiction** question whose answer will leave the building (go to the city, a client, a permit, or a contract), the bot MUST:

1. **Cite the exact source** — code name, **edition (2025)**, section, or the specific city ordinance/page.
2. **Look it up live** — the bot should pull the current text from the source (see "give the bot a lookup tool" below) rather than recall from memory.
3. **Require human verification** — a person confirms against the official code before it's sent: **Jesus/Richard** for building code, the **engineer of record** for anything structural.
4. **Defer structural to the engineer** — Simpson Strong-Tie connectors, hold-downs, shear/lateral, beams, footings, fastening = the **licensed engineer of record** specifies. The firm is NOT the engineer; **the bot never invents structural specs.**
5. **Check local amendments** — the city's amendments override the base state code. Always confirm the specific jurisdiction (San José ≠ Milpitas ≠ County).
6. **Never state a code number as final on memory alone.** If unsure: *"Here's the likely provision — verify at [source] before you use it."*

_This is a guide-and-verify system: the bot speeds you up and points to the source; a qualified person makes it final._

---

## Current code (as of Jan 1, 2026)
- **2025 California Building Standards Code (Title 24)** is now in effect — it replaced the 2022 code on **January 1, 2026**.
  - **CBC** = Title 24 **Part 2** (based on IBC 2024) — commercial/general.
  - **CRC** = Title 24 **Part 2.5** — residential.
  - Also: Energy **Part 6**, CALGreen **Part 11**, Fire **Part 9**, Existing Building, Historical.
- **Authoritative source:** California Building Standards Commission / DGS — `dgs.ca.gov/bsc/codes`. Free reader: `up.codes`.

## Our jurisdictions (verify amendments here)
- **San José:** adopted 2025 CBC + CRC with local amendments in the San José Municipal Code. → `sanjoseca.gov` (Building Division); San José Residential Code 2025 on up.codes.
- **Milpitas:** adopted the 2025 CA Building Code (Ordinance No. 65.155). → `milpitas.gov` → Adopted Building & Municipal Codes.
- **Santa Clara County (unincorporated):** → `plandev.santaclaracounty.gov` → Building Code; County Ordinance Code on Municode.
- **San Mateo / SF:** see our `RHDP17_Setbacks_SanMateo_and_SF.md` + each city's site.

## Structural — Simpson Strong-Tie
- Connector/hardware specs come from **Simpson Strong-Tie** (`strongtie.com` — catalogs + their design software) **and** the project's **engineer of record**.
- **Rule:** the bot may point to the engineer and Simpson resources, but it does **not** specify connectors, hold-downs, shear walls, or fastening on its own. Structural = engineer of record. (Firm is not the engineer — hard guardrail.)

---

## Why we REFERENCE the code, not paste the whole thing in
Mark asked about putting "the whole code" into memory. The safer, more accurate way is to keep **authoritative links + summaries of the most-used provisions** here — because the full codes are (a) huge, (b) copyrighted, (c) updated on a 3-year cycle (just changed to 2025), and (d) **amended differently by each city**. A pasted-in copy would go stale and could be wrong — and wrong code = failed inspection or liability. So we keep pointers + our own summaries, and the bot **verifies the live source** for anything that matters.

## What we DO keep (our grounded knowledge)
- This verify rule.
- Authoritative links per jurisdiction (above).
- Our own summarized KBs — already built, each stamped "verify against source":
  `RHDP17_Setbacks_SantaClaraCounty.md`, `RHDP17_Setbacks_SanMateo_and_SF.md`, `RHDP17_BayArea_JobSite_Posting_Requirements.md`, `RHDP17_Contract_Standards_CSLB.md`.

## Common quick-questions playbook (each tied to its source)
- Setbacks / height / FAR / ADU → our Setbacks KBs **+** the city's zoning code.
- Story poles / job-site posting → our Posting Requirements KB **+** city.
- Contract / deposit / retainer / fee schedule → our CSLB Contract Standards KB.
- Structural / connectors → **engineer of record + Simpson Strong-Tie**.
- Energy / Title 24 compliance → Part 6 **+** a Title 24 consultant.
- City corrections response → pull the exact correction, cite the code section it references, verify against the current 2025 code **before** replying.

---

## BUILD NEXT: give the bot a live-lookup tool
For the bot to actually "go do the research" itself, its Supabase function needs a **web-lookup/search tool** (the same kind of live search used to build this doc). Then the Grounded-Answer Rule runs automatically: the bot fetches the current code/city text on demand, cites it, and flags it for human sign-off — instead of guessing from memory. This is the single upgrade that makes the bots genuinely safe for code work.

_Sources for this doc (verify anytime): dgs.ca.gov/bsc/codes · sanjoseca.gov · milpitas.gov · plandev.santaclaracounty.gov · strongtie.com_
