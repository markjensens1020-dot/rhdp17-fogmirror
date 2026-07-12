# Make SharePoint the Single Source of Truth — step by step
_Goal: the customer files live in a shared SharePoint library (the master). Everyone syncs it down so it's ALSO a local folder on each machine. The dashboard folder buttons point at SharePoint so they work for the whole team. OneDrive is NOT blocked — its sync client is what pulls SharePoint down locally._

## The order matters — move files FIRST, never restrict access before they're safely in SharePoint.

### Step 1 — Pick the SharePoint library (the home)
- Recommended: your existing **`RHDP DRAFTING PROJECTS 2025`** library on the **AllProjectsAlert** site (already shared with the team), or the **"RHDP 17 system and toolkit"** site if you'd rather keep the RHDP17 system separate.
- Open that site → Documents (the library).

### Step 2 — Move the customer files in (keeps history)
- In your OneDrive, select the **`Customers`** folder (the one with all 15 client folders + `_FORMS` + `_TEMPLATE`).
- Use **"Move to"** (not copy) → choose the SharePoint library from Step 1 → move.
- "Move to" preserves version history. Keep the subfolder names exactly as they are (`Castro`, `Bocian`, `Buddhist_Temple_Huyen_Khong`, etc.) — the dashboard matches on those names.

### Step 3 — Share it with the team
- On the library (or the `Customers` folder), set access for Jesus, Cassie, Irma, Richard, Maya (Member/Edit as appropriate).
- This is yours to set — it controls who can see the files.

### Step 4 — Everyone syncs it down (this is the "populate into OneDrive" part)
- Each person opens the SharePoint library in the browser → click **"Add shortcut to OneDrive"** (or **Sync**).
- Now the same files appear as a normal local folder on each machine — SharePoint stays the master, OneDrive just mirrors it.

### Step 5 — Send me the URL, I wire the dashboard (one shot)
- In the SharePoint library, open the `Customers` folder, click **Copy link** (or copy the address bar URL). Also grab one customer subfolder's link as a sample.
- Send me that base URL. I'll paste it into the dashboard's `SP_BASE` setting, you upload `dashboard.html` once, and every folder button opens the shared SharePoint folder for the whole team — auto-deployed.

## After it's working (optional governance)
- If you later want to stop anyone storing master files in *personal* OneDrive, that's a Microsoft 365 admin policy — set it in the admin center. You do NOT need to (and shouldn't) disable the OneDrive sync client, since that's what makes SharePoint show up locally.

## What's mine vs yours
- **Yours:** Steps 1–4 (move files, set sharing, sync) — I can't move files into SharePoint or change access permissions.
- **Mine:** Step 5 (wire the dashboard to the SharePoint URLs) — ready to go the moment you send the link.
