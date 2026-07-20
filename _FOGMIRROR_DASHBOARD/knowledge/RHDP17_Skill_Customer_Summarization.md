# SKILL — Customer Summarization (all RHDP17 bots)

_For every bot. When asked to "summarize," "catch me up on," or "what's going on with" a customer/project, pull the full picture together into a fast, clear brief. Use our project data, the customer's emails/conversations (once email access is wired), contracts, selections, and billing. Cite what's external; don't invent — if something isn't available, say so._

---

## What a good customer summary includes
1. **Header** — Customer + project address, and their current phase.
2. **Where each process stands** — Design / Construction / Bidding / Selections / Bookkeeping: the step they're on, in one line each.
3. **Recent activity** — the latest emails/conversations, boiled down to what matters (who said what, what's pending). *(Requires email access — see note below.)*
4. **Open items / waiting on** — what's outstanding and who owns it (us, the client, the city, a sub).
5. **Money** — retainer / working drawings / permit: paid vs. due (from Maya's playbook).
6. **Next step** — the single most important thing to do next, with a date if there is one.

## Output format (keep it tight)
> **[Customer] — [address] · [phase]**
> Design: … · Construction: … · Bidding: … · Selections: … · Bookkeeping: …
> **Recent:** …
> **Open / waiting on:** …
> **Money:** …
> **Next:** …

## Guardrails
- Pull real facts from our data — **don't guess**. If email data isn't connected yet, summarize from the project/status data and say "email history not connected yet."
- Anything external (codes, city) → cite the source + a person verifies.
- Never expose card/bank/SSN details in a summary.

## How to ask
- "Summarize the Castro project for me."
- "Catch me up on [customer] — what's pending?"
- "What's the latest with [customer]'s selections and money?"

---

## THE FULL WORKFLOW — build the story, then auto-fill the Status form (Cassie AI owns this)
This is the goal for **Cassie (admin AI)**: keep every customer's Process & Status form current, automatically.

1. **Gather everything** into one story for the customer:
   - **All emails in and out** + **the drafts we've written** (proof of what's been asked, said, promised).
   - **All documents in their file** — intake, contract/retainer, plans, selections, invoices/receipts.
   - **City portal activity** (submittals, corrections, approvals) where available.
2. **Combine the story with the question** → do the research (our own system first, then the city's portals / live web), and prepare the response email (see the Email Drafting skill).
3. **Auto-fill the Process & Status form** that lives in every customer folder (`TEMPLATE_Status_Process_Sheet.md` / Form 5 Weekly Status) — update where each process stands, what's outstanding, what was decided, and the next step. File it back into the customer's folder as the running status.

**Owner:** the **admin AI = Cassie**. Everyone else's bot can summarize; Cassie keeps the status form up to date.

_Reality note: fully automatic (reading every email/doc + portal, and writing the filled form back into the customer's SharePoint folder) needs the **email-data access + file-access wiring** — a backend build. Until that's wired, the bot summarizes from the project/status data it can see and drafts the form for a person to save. See the pending build list._
