# How Our RHDP17 "Fog Mirror" System Works (Plain English)
### For Mark, Cassie, Richard, Irma, Jesus — everyone

_The short version: it's always on, it works for everyone anytime, and no one's computer needs to be running for it to work. Here's what each piece does and why you can count on it._

---

## The big idea
Think of it like your bank's website. The bank isn't "on your computer" — it lives on the internet, running all the time, and you just sign in to use it. Ours is the same: our dashboard lives **in the cloud**, open 24/7. You open the link, sign in with your **@rhdpinc.com** Microsoft account, and it's there — morning, night, weekend, from any computer or phone.

**You do NOT need Mark's computer on. You do NOT need any special app. Anyone on the team can use it anytime, at the same time.**

---

## The pieces and what each one does

**1. The Dashboard (what you see and click)**
The screens — Overview, Design, Construction, Bidding, Selections, Clients, the buttons. This lives on a service called **Cloudflare**, which keeps it online all the time. This is your "one place" for every project.

**2. The Brain (behind the scenes)**
A cloud service called **Supabase** handles the sign-in, stores the project info, and runs the automatic jobs — like checking the shared email a few times a day and sorting it. It runs on its own schedule in the cloud. Nobody has to start it.

**3. Fog Mirror — the built-in AI assistant**
The "🎙️ Fog Mirror" button. You **type** a question or request (no need to talk to it) and it helps — status, drafts, reminders. The AI runs through the cloud too, so it's available to everyone, all the time. It's like having a smart helper built right into the app.

**4. The Email Helper (automatic)**
A few times a day the system reads the shared inbox, sorts the messages, and **writes draft replies into Outlook Drafts** for you. It does this by itself. Your job: open Drafts, read, fix if needed, and **send** — a person always sends.

**5. Your Microsoft tools (Outlook, Teams, Calendar, SharePoint)**
The buttons take you straight into these. Client files open from the shared **SharePoint** library, so everyone sees the same files on any device.

---

## Why it "just works" all the time
- The dashboard and its brain live in the cloud (Cloudflare + Supabase), not on anyone's laptop — so they're on 24/7.
- Signing in with your company Microsoft account is your key in. That's the same for everyone.
- The automatic jobs (email sorting, drafting) run on a cloud schedule, on their own.

**What keeps it healthy (Mark/admin):** the Supabase account and its keys stay active (that's the engine), and the sign-in gate keeps it staff-only. As long as those are in place, the system keeps running.

---

## What each of you can count on
- **Cassie** — intake, status, selections, and routing drafts. Open the link, sign in, work. Fog Mirror helps you draft and find things.
- **Jesus** — Design/plan-check boards, portals, and the plan files in SharePoint. Save finished plans as **PDF** in each job's Plans folder so the system can read them.
- **Irma** — review/approve client drafts and money; intake/selections support.
- **Richard** — design oversight, approvals, money approvals.
- **Everyone** — you can click around freely; **nothing you click can break it.**

---

## Two rules that never change
1. **The AI writes DRAFTS — a person always reviews and sends.** Nothing emails a client on its own.
2. **Money out (payments/refunds) = Irma or Richard only.** Billing runs through Maya.

---

## Quick facts to remember
- **Link:** `rhdp17-fogmirror.markjensens1020.workers.dev/?v=3` — sign in with your **@rhdpinc.com** account.
- Looks like an old version? Press **Ctrl + Shift + R**.
- It's hosted on **Cloudflare + Supabase** (not Webflow, not on anyone's PC) — that's why it's always on.
- A button not working or something confusing? Text **Mark** — it won't break anything.
