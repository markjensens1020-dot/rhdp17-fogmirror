# RHDP17 — Subcontractor Bid Management (3 Bids Per Trade)

_How to run subcontractor bidding: pull the trades from the plans, get the top Bay Area subs, collect 3 bids per trade, compare, and award — with the AI (Fog Mirror) helping at each step. For Cassie and the team._

---

## The rule
- **3 bids per trade.** Every trade the plans call for gets at least **three** subcontractor bids before we award.
- **Top-rated, licensed subs only.** Prefer Bay Area subs with strong Google ratings AND a verified CSLB license + insurance.
- **Award on value, not just price** — scope match, rating, availability, and a clean paperwork packet.

---

## Step 1 — Get the trades from the plans (Scope)
Look at the plan set and list every trade the project needs. Typical residential trades:
> Foundation/Concrete · Framing · Roofing · Plumbing · Electrical · HVAC · Insulation · Drywall · Windows/Doors · Stucco/Siding · Flooring · Cabinets/Millwork · Painting · Landscape/Hardscape.

**Ask Fog Mirror:** "List the trades we'll need to bid for **[project]** based on the plans." (It drafts the trade list; Jesus/Richard confirm against the drawings.)

---

## Step 2 — Find the top subs per trade (Invite Subs)
For each trade, line up **3 candidates**. How to source the best-rated Bay Area subs:

**Manual method (works today):**
1. In Google Maps, search **"[trade] contractor near [project city]"** (e.g., "framing contractor near San José").
2. Pick the ones with **4.5★+ and lots of reviews**.
3. **Verify the CSLB license** at cslb.ca.gov (active, correct classification, no major discipline).
4. Grab phone/email → that's your candidate.

**Ask Fog Mirror:** "Find 3 top-rated **[trade]** subcontractors near **[city]** for **[project]**." → It drafts a candidate shortlist for you to verify.

_(Auto-populate from Google — pulling the top-rated subs by trade automatically into the Bid Manager — is a feature we can build next; see "Level up" below. For now, use the method above and let the AI draft the shortlist.)_

---

## Step 3 — Send the invitations (Invite Subs)
**Ask Fog Mirror:** "Draft a bid invitation to **[sub]** for the **[trade]** scope on **[project]**, due **[date]**."
- Include the scope, the plan sheets, and the due date.
- Send the same scope to all 3 subs per trade so the bids are comparable.

---

## Step 4 — Collect & compare (Collect Bids → Compare)
- Log each bid as it comes in (amount, inclusions/exclusions, timeline).
- **Ask Fog Mirror:** "Compare the 3 **[trade]** bids for **[project]** — price, scope, rating, availability." → It builds a side-by-side so Richard can decide fast.

---

## Step 5 — Award & paperwork (Award → Contracts)
Before any sub starts, they must return a complete packet (this protects RHDP and the client):
- ✅ **CSLB license** — verified active + correct classification
- ✅ **Certificate of Insurance (COI)** — RHDP named **additional insured**
- ✅ **W-9**
- ✅ **Workers' Comp** (or valid exemption)
- ✅ **Signed Subcontractor Agreement** (incl. CA anti-indemnity, Civ. §2782)
- ✅ **Lien waiver** terms agreed

**Ask Fog Mirror:** "Draft the subcontractor agreement and document checklist for **[awarded sub]** on **[project]**." → Cassie sends it, collects the packet, and files it in the client's **02_CONSTRUCTION → Subcontractors** folder.

---

## Who does what
- **Cassie** — sources/verifies sub candidates, sends invitations, collects bids and the document packet, chases anything missing.
- **Jesus / Richard** — confirm the trade list from the plans, review the bid comparison, and pick the winner.
- **Irma / Richard** — approve the award and any money.
- **Fog Mirror (AI)** — drafts the trade list, sub shortlist, invitations, bid comparisons, and the agreement/checklist. **You review and send.**

---

## Fog Mirror phrases for subs (type these)
- "List the trades to bid for **[project]** from the plans."
- "Find 3 top-rated **[trade]** subs near **[city]**."
- "Draft a bid invitation to **[sub]** for **[trade]** on **[project]**, due **[date]**."
- "Compare the **[trade]** bids for **[project]**."
- "Which trades still need 3 bids on **[project]**?"
- "Draft the subcontractor agreement + insurance checklist for **[sub]**."
- "Draft a reminder to **[sub]** — their bid/COI is still outstanding."

---

## Guardrails
- **3 bids per trade** before award — no exceptions without Richard's OK.
- **No sub starts** until the full packet (license, COI additional-insured, W-9, workers' comp, signed agreement) is in.
- **Money out = Irma or Richard only.** The AI drafts; a person sends and pays.

---

## Level up (build next, optional)
**Auto-populate best-rated Bay Area subs from Google:** a small tool that, given a trade + city, pulls the top-rated Google results and drops them into the Bid Manager as candidates (with rating + a CSLB-verify link). This is a Google Places integration — say the word and I'll build it, or I can research and hand you a **vetted starter sub list per trade** right now if you give me the project's city and the trades from the plans.
