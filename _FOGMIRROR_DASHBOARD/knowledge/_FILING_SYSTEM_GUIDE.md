# RHDP17 — CUSTOMER FILING SYSTEM (the standard, every job the same)
### So anyone can open a file and instantly know where it stands

## ONE FOLDER PER CUSTOMER, named by last name (e.g. `Castro`, `Haraguchi`).
Inside every customer folder — always the same layout:

```
[Customer]/
  STATUS.md                         ← the living status/process sheet (open this first)
  00_Intake_and_Contract/           ← intake form, onboarding, design-binder/retainer (signed)
  01_DESIGN/
     Plans/                         ← DWG/PDF plan sets and revisions
     Emails/                        ← every email to/from the client about design + changes
     City-County/                  ← plan-check notices, corrections, resubmittals, permit docs
     Consultants/
        Title24/                    ← energy reports + HERS certs
        Engineering/                ← structural calcs, stamped sheets, engineer emails
        Soils/                      ← geotechnical reports, soils testing
        Environmental/              ← CEQA / environmental consultant docs
     Selection_Board/               ← finishes, materials, pricing selections
  02_CONSTRUCTION/                   ← kept separate from design, same area
     Subcontractors/                ← sub contracts, scopes, COIs
     Invoices_and_Billing/          ← our invoices out + sub billing in + order forms
     Inspections/                   ← inspection cards, proof photos/video
     Emails/                        ← construction-phase correspondence
```

## NAMING — keep it findable
`YYYY-MM-DD_[Customer]_[what it is].pdf`  → e.g. `2026-04-16_Castro_RD4_Resubmittal.pdf`

## WHAT GOES WHERE (quick rules)
- Client emails about the DESIGN or CHANGES → `01_DESIGN/Emails/`
- Anything from the CITY or COUNTY → `01_DESIGN/City-County/`
- Title 24 / engineer / soils / environmental → `01_DESIGN/Consultants/[type]/`
- Our invoices, sub billing, order forms → `02_CONSTRUCTION/Invoices_and_Billing/`
- Sub contracts & proof of work → `02_CONSTRUCTION/Subcontractors/` and `/Inspections/`

## THE FORMS (blank masters live in `_FORMS/`)
1. FORM-001 Client Intake  2. FORM-002 Onboarding  3. FORM-003 Design Binder & Selection Board
4. Forms 3–7 (incl. **Form 5 — Weekly Project Status** = the status/process sheet)
A copy of the intake + design binder + a retainer template goes in each customer's `00_Intake_and_Contract/`.
