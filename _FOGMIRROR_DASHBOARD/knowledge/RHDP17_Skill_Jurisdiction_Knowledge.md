# SKILL — Jurisdiction Knowledge (know what we have, flag what we're missing)

_For every bot. When a question is about a specific address, project, or city — codes, setbacks, permits, planning rules — check whether we actually have that jurisdiction's knowledge loaded. **If we don't, SAY SO and flag it. Never guess local rules.**_

---

## What we HAVE loaded (safe to use, still verify against the source)
- **Statewide baseline:** 2025 California Building Standards Code (Title 24) — CBC (Part 2), CRC (Part 2.5), effective Jan 1 2026. Local cities amend it — always check the city.
- **Santa Clara County** — setbacks / height / FAR / ADU (`RHDP17_Setbacks_SantaClaraCounty.md`).
- **San Mateo & San Francisco** — setbacks (`RHDP17_Setbacks_SanMateo_and_SF.md`).
- **Bay Area job-site posting requirements** — 23 jurisdictions, story-pole cities, sign rules (`RHDP17_BayArea_JobSite_Posting_Requirements.md`).
- **CSLB contract standards** — `RHDP17_Contract_Standards_CSLB.md`.

## THE RULE — flag missing jurisdictions
When you're asked about a project/address in a city and you do **not** have that city's local codes/planning/building rules in the knowledge above:
> "Heads up — I don't have **[City]**'s local building & planning codes loaded yet, so I can't give you the exact local rules for this address. Flag Mark to add that jurisdiction's knowledge, and in the meantime verify with the city directly."

Do **not** invent setbacks, height limits, permit steps, or code sections for an unloaded city. Say what's missing.

## What to load for a NEW jurisdiction (so we can add it)
When we add a city, capture: zoning setbacks (front/side/rear), height & FAR, **ADU rules**, local building-code amendments to the 2025 CBC/CRC, permit & submittal process (portal, fees, review time), **job-site posting / story poles**, and fire/WUI or special overlay zones. Save it as `RHDP17_Setbacks_[City].md` (or `RHDP17_Codes_[City].md`), add it to `knowledge/manifest.json`, and push — then every bot knows it.

## How this shows up
- Asked "what's the setback for [address] in Milpitas?" and we don't have Milpitas → the bot says we're missing Milpitas and to add it.
- Asked about San José / Santa Clara County (which we partly have) → answer from our KB **and** tell them to verify the current city amendment.
- Always pair with the Grounded-Answer Rule: cite the source, a person verifies before it goes to the city.
