# RealPortal — Company Admin, Broker, Sales Manager, Sales Person Spec

Read this alongside the existing CLAUDE.md (roles, base commission rates, mock
data conventions, design tokens). This file adds the detailed page-by-page spec
for the internal (logged-in) portals, and the corrected commission logic.

## Commission logic — FINAL (use this, not any earlier draft)

Base rates (Model A — fixed % of total sale price), unchanged from before:
- Direct Sale: Broker 2%, Sales Manager 4%
- Referred Sale: Broker 2%, Sales Manager 1.5%, Sales Person 2.5%

Payment methods: Cash, In-House, Bank Financing (Pag-IBIG dropped — not part
of this system's scope).

Commission is released in tranches as payment milestones are hit, not as one
lump sum. Total commission for a sale = sale_price × role_rate%. That total is
split as follows:

- Cash: 1 tranche, released when 100% of price is paid (one-time, full
  commission in one voucher).
- In-House financing: 4 tranches, released at 25%, 50%, 75%, 100% of total
  contract price paid. Each tranche = 25% of that role's total commission.
- Bank financing: 4 tranches, released every 3 months within the buyer's
  12-month down payment period, contingent on the buyer staying current and
  meeting requirements. Each tranche = 25% of that role's total commission.
  The 4th/final tranche coincides with full DP completion and the bank's
  take-out release to the developer.

Each tranche reached = a new CommissionVoucher record (not an update to one
voucher). A single sale can have multiple vouchers over its lifetime, one per
tranche, one per role entitled to a share (broker + sales manager, or broker +
sales manager + sales person, depending on sale type).

## Client requirements checklist (per payment method + buyer employment status)
Tracked per client, checked off by the assigned consultant before/during the
payment phase. This is what was missing from the earlier ERD/FR. Based on an
actual developer requirements sheet, not a generic placeholder — reflect this
level of detail in the mock data.

Add an employment_status field to Client: OFW | Locally Employed |
Self-Employed. This only matters for Bank Financing — it determines which
documents are required.

Cash: valid ID, plus a declaration of source of funds. No employment-status
branching needed.

In-House financing: proof of income, valid government ID. No
employment-status branching needed — same for everyone.

Bank financing: requirements are checked in two phases — Basic
(required to start / needed for the first tranche) and Complete (the rest,
needed by the time later tranches are released). Confirmed business rule:
commission release depends on both the buyer's payment progress AND their
document completion — not payment alone. The specific documents differ by
employment_status:

- Locally Employed — Basic: 2 valid IDs, Certificate of Employment w/
  Compensation, Payslips (last 3 months), Income Tax Return (ITR). Complete
  (in addition to Basic): Birth Certificate, Marriage Contract (if married),
  Proof of Billing Address, Verified TIN, ESAV (if Pag-IBIG-linked).
- OFW — Basic: 2 valid IDs, Certificate of Employment / Employment Contract
  / Salary Certificate, Payslips or Payroll Bank Statements, Passport ID with
  entry/exit stamps (plus Seaman's Book if a seafarer). Complete (in addition
  to Basic): Birth Certificate, Marriage Contract (if married), Proof of
  Billing Address, Verified TIN, Special Power of Attorney.
- Self-Employed — Basic: 2 valid IDs, Income Tax Return (last 2 years), Bank
  Statements (last 6 months). Complete (in addition to Basic): Birth
  Certificate, Marriage Contract (if married), Audited Financial Statements
  (last 2 years), DTI Registration/Business Clearance, Mayor's Permit, Proof
  of Billing Address, Verified TIN, picture of the business establishment.

Model this as a RequirementsChecklist linked to a client: a list of items,
each tagged with which phase it belongs to (Basic/Complete — Bank financing
only), a checked boolean, verified_by (consultant user id), verified_date. The
Monitor Clients view should show at a glance whether a Bank-financing client
has completed Basic requirements, Complete requirements, or neither — this
gates whether a tranche can actually be released, alongside the payment
progress itself.

## Property fields to add (missing from the original ERD)
bedrooms (int), bathrooms (int), turnover_status (string, e.g. "Ready for
turnover" / "Under construction"), house_model (string). Add these to the
mock Property data and to the Add Property form.

---

## Property Seeker portal (public, no login)

Top nav — company name/logo on the left, a "Loan Calculator" button on the
right that opens the calculator (see below). No login/account controls here.

Main browse view — interactive Leaflet map as the primary element.
- Left panel: search and filters — location, property type, price range,
  minimum floor area, house model, number of bedrooms.
- Markers on the map for every available property (house or lot).
- Below the map: a grid/list of the same available properties (image,
  property name, price, location) — a second way to browse besides the map.

Selecting a property has two different behaviors depending on entry point:
- Clicking a map marker: a short popup appears above the marker (image,
  location, price, short description) AND a panel opens on the right side of
  the screen (~30% width) with fuller info: property image, name, developer,
  location, price, type, lot area, floor area, rooms, plus "Add to Compare"
  and "View Full Details" buttons.
- Clicking a property card in the list below the map: only the right-side
  panel opens (same content as above) — no marker popup, since it didn't come
  from the map.

Add to Compare — clicking "Add to Compare" on the right panel selects that
property (count: 1). The seeker picks a second property the same way. Once 2
are selected, navigate to the Comparison page automatically.

Comparison page — two properties side by side, each with its image and a
"View Full Details" button. Comparison table fields: price, property type,
lot area, floor area, bedrooms, bathrooms, turnover status, location,
developer, features, status.

Full Property Details page (reached from "View Full Details" on the map
panel or the comparison page):
- Large hero image at top, with a gallery of additional images below it.
- Below the gallery: price, developer, type, location, lot area, floor area,
  bedrooms, bathrooms, turnover status, description, features and amenities,
  specifications, and a small embedded map showing the property's location.
- Right side panel (~30% width): price, status, type, turnover status,
  bedrooms, and a "Schedule Visit" button.
- Below the right panel: the assigned consultant's name, contact number, and
  email — populated only if the seeker arrived via a consultant link (see
  ConsultantLink handling in CLAUDE.md); if no consultant link is active for
  the session, don't render this block.
- Below that: a "Similar Properties" section (same location or property type).

Loan Calculator (opened from the top nav button, not tied to one
property) — two tabs:

Manual: standalone, no stored data, purely client-side. Seeker enters their
total budget (not monthly — that was a wording slip earlier, the input is an
overall budget amount). Output: computed monthly budget, max affordable
price, and a list of matching/suggested properties from the mock property
list that fit within that budget (image, price, name, type, "View Details"
button).

Fixed Quotation: seeker selects a developer, then a property under that
developer, and sees the breakdown pulled from the mock Loan_Quotation data
set up in Company Admin: property image, price, down payment, net loan
amount, interest rate, loan term, monthly amortization, total interest paid,
total amount payable, principal, and a "View Property" button.

Schedule Visit — triggered by the "Schedule Visit" button on the Full
Property Details page. Form: full name, email address, phone number,
preferred date, preferred time, notes. On submit, show a confirmation message
("Request submitted — please wait within 24 hours for schedule confirmation")
and simulate creating/finding a Client record plus a Visit_Request record
(status "Pending"), attaching the active consultant link's source_link_id if
one is present in the session. This is what the Company Admin later
approves/declines on the Visit Schedules page.

---

## Company Admin portal
Sidebar: Dashboard, Manage Properties, Manage Developers, Loan Quotation, Visit
Schedules, Consultant Accounts, Consultant Links, Sales Report, Notifications.

Manage Developers — table with filters (search, all/active/inactive). Add
Developer form: developer name, total developer cut %, status, Direct Sale
rates (broker %, sales manager %), Referred Sale rates (broker %, sales
manager %, sales person %).

Manage Properties — table with filters (search, developer, type
house/lot, all/available/reserved/sold). Add Property form: property name,
developer (select), property type, price, status, location (address,
latitude, longitude), property details (lot area, floor area, bedrooms,
bathrooms, turnover status, house model, description, features, amenities),
property images (multiple).

Loan Quotation — table with search. Add Quotation form: select property,
property price, interest rate, down payment %, down payment amount, terms
(months), monthly payment, payment breakdown description.

Visit Schedules — list of pending Visit_Request records, accept/decline
actions.

Consultant Accounts — table with filters (search, role: all/broker/sales
manager/sales person, status: all/active/inactive). Add Consultant form:
personal info (first/middle/last name, email, contact number), set password,
role (broker / sales manager / sales person), "assign under" dropdown — only
shown for Sales Manager (assign under a Broker) and Sales Person (assign under
a Sales Manager), not shown for Broker. Status (active/inactive). On save, if
role is Sales Manager or Sales Person, auto-generate a unique consultant link.
Brokers do not get a consultant link.

Consultant Links — read-only table of generated links (Sales Manager and
Sales Person only), filters (search, role, all/active/inactive).

Sales Report — total sales this month/quarter, sales breakdown by
developer, sales breakdown by consultant/team, top-performing consultants
list, filterable by date range, "Download" button (simulate CSV export).

Notifications — feed of system notifications for the Company Admin.

---

## Broker portal
Sidebar: Dashboard, Releasable Commission, Team Overview, Top Agents, Sales
Managers, Create Commission Voucher, All Commission Vouchers, Release
Commission, Send Notification, Notifications.

Dashboard — total sales managers, total sales persons, eligible commission
requests, commission released this month, table of releasable commissions,
team overview summary.

Top Agents — ranked list for recognition purposes (not tied to payouts).

Sales Managers — list of the broker's sales managers: total clients, total
sales, performance badge.

Create Commission Voucher — triggered when a consultant's milestone
tranche is reached. Broker selects the consultant → sees the commission
breakdown for that tranche → voucher form: commission voucher for [developer],
date disbursed, paid to, buyer, RS date, NTCP, release number (1 of 4, etc.),
% rate, block/lot, check number, bank, amount, gross commission, less EWT
(developer), gross commission released from, less ADCOM, total commission
due, less misc. tax, net commission receivable, other deductions, approved by
(broker name + signature), received by (consultant name + signature).

All Commission Vouchers — full history/record of all vouchers generated.

Release Commission — after the consultant signs a voucher, it returns to
the broker for release. On release, notify the consultant that commission is
ready.

Send Notification — broker sends announcements/meeting notices to their
team.

Notifications — feed received by the broker.

---

## Sales Manager portal
Sidebar: Dashboard, Sales Persons, Top Sales Person, Performance, Send
Notification, Monitor Clients (View Clients / Contact Clients), Consultant
Link, My Commission, Sign Voucher, Upload Payment Proof, Notifications.

Dashboard — my direct clients, team total clients, vouchers to sign, my
released commission, table of recent clients, payment milestone tracker.

Sales Persons — table (no., name, email, phone, clients, active status,
sales amount, link, actions). View details → that sales person's clients,
property bought, status, added date, commission.

Top Sales Person — recognition ranking of sales persons under this
manager.

Performance — total clients, total sales amount, direct sale clients,
commission this month, monthly performance trend table.

Monitor Clients — two views:
- View Clients: table of assigned clients, including payment method, current
  milestone progress, and requirements checklist status (see checklist spec
  above) — this was the missing piece, make sure it's a real, visible part of
  this table/detail view, not just a placeholder.
- Contact Clients: contact info view for follow-up (phone, email, last
  contacted date, notes).

Consultant Link — view/copy own consultant link.

My Commission — dashboard (total vouchers, needs signature, commission
released, eligible for processing) + table of commission records.

Sign Voucher — vouchers sent by the broker awaiting signature; accept &
sign or dispute.

Upload Payment Proof — select client, enter payment details, review, save.
On save, recompute that client's milestone progress automatically; if a new
tranche threshold is crossed, notify the broker that a voucher is due.

Notifications — feed received by the sales manager.

---

## Sales Person portal
Same as Sales Manager, minus "Sales Persons" and "Top Sales Person" (a Sales
Person has no one under them). Dashboard labels adjust accordingly (e.g. "my
total clients, active clients" instead of "team total clients").

---

## Claude Code prompts — paste one at a time, in order

### Prompt 1 — Property Seeker portal (map, details, comparison, calculator, schedule visit)
```
Build the full Property Seeker portal — this is public-facing, no login required. Read the "Property Seeker portal" section of SYSTEM_SPEC_AND_PROMPTS.md and implement it exactly, including both distinct popup behaviors (map marker click vs. list card click), the Add to Compare flow (max 2 properties), the Comparison page, the Full Property Details page layout (hero image + gallery, main info block, right-side price/status panel, conditional consultant card, similar properties), the Loan Calculator with its Manual and Fixed Quotation tabs, and the Schedule Visit form and confirmation flow. Use Leaflet for the map with mock property coordinates around Naga City and Pili, Camarines Sur. Route this at /property-seeker (or as the root "/" route, since this is the public entry point). Top nav should be simple (company name + Loan Calculator button), not a sidebar — this is a public page, not an internal dashboard. Use the design tokens (navy #132135, gold #B8863B, warm bg #FAF9F6, Inter font) but keep the feel public/marketing-adjacent rather than an admin panel. Use the existing mock properties (Lot 14 Greenview Estates, Unit 4B Riverside Homes) plus add 3–4 more mock properties across different price points and bedroom counts so the filters and "matching properties" results in the loan calculator have something real to show. Simulate an active consultant link via a URL query param (e.g. ?ref=consultant-slug) so the conditional consultant card on the details page can be demoed both with and without a link present.
```

### Prompt 2 — Developers, Properties, Loan Quotation
```
Build the Company Admin module's Manage Developers, Manage Properties, and Loan Quotation pages. Follow the mock-data architecture already established (src/mocks/, src/services/). Read SYSTEM_SPEC_AND_PROMPTS.md for the exact fields and table/filter requirements for each page — implement them exactly as specified there, including the new Property fields (bedrooms, bathrooms, turnover_status, house_model). Route this under /company-admin, reuse the existing sidebar shell and design tokens (navy #132135, gold #B8863B, Inter font). Use Golden Horizon Developers and the existing mock properties as seed data, and add at least one more mock developer and two more properties for realistic list/filter demos.
```

### Prompt 3 — Visit Schedules, Consultant Accounts, Consultant Links
```
Build the Company Admin module's Visit Schedules, Consultant Accounts, and Consultant Links pages, per SYSTEM_SPEC_AND_PROMPTS.md. Important: the "assign under" field on the Consultant Account form only appears for Sales Manager (assign under a Broker) and Sales Person (assign under a Sales Manager) roles — not for Broker. Auto-generate a mock consultant link (unique slug + full link) only for Sales Manager and Sales Person accounts on save, not for Broker. Reuse the existing Company Admin sidebar and design tokens. Add mock consultant accounts for at least 1 broker, 2 sales managers, and 3 sales persons so the hierarchy and filters are demonstrable.
```

### Prompt 4 — Sales Report, Notifications, Dashboard
```
Build the Company Admin module's Dashboard, Sales Report, and Notifications pages, per SYSTEM_SPEC_AND_PROMPTS.md. Sales Report needs: total sales this period, breakdown by developer, breakdown by consultant, top-performing consultants list, date-range filter, and a Download button that simulates a CSV export (can just trigger a mock file download of the visible table data). Reuse the existing sidebar and design tokens.
```

### Prompt 5 — Broker portal
```
Build the full Broker portal as a new role dashboard, per the "Broker portal" section of SYSTEM_SPEC_AND_PROMPTS.md. Route it under /broker with its own sidebar (same navy/gold/Inter design system, but Broker-specific nav items). Implement the commission tranche logic exactly as described in the "Commission logic — FINAL" section: multiple vouchers per sale, one per tranche, 4 tranches for In-House and Bank financing (25% each), 1 tranche for Cash. The Create Commission Voucher form should include every field listed in the spec (RS date, NTCP, release number, block/lot, check number, bank, gross commission, less EWT, less ADCOM, net commission receivable, etc.) with realistic mock values. Seed at least one mock sale that's mid-way through its tranches (e.g. 2 of 4 released) so the Broker dashboard and All Commission Vouchers page have something meaningful to show.
```

### Prompt 6 — Sales Manager portal
```
Build the full Sales Manager portal, per the "Sales Manager portal" section of SYSTEM_SPEC_AND_PROMPTS.md. Route it under /sales-manager with its own sidebar. Pay special attention to Monitor Clients → View Clients: this needs to visibly show each client's payment method, current milestone/tranche progress (e.g. "Tranche 2 of 4 released"), and the requirements checklist status from the "Client requirements checklist" section of the spec — this is a core, gradeable feature, not decoration. Upload Payment Proof should update a client's milestone progress and, when a new tranche threshold is crossed, show a visible notification/flag that a voucher is now due for broker action. Seed mock clients at different stages (one just starting, one mid-tranches, one fully released) so the monitoring view has real variety to demo.
```

### Prompt 7 — Sales Person portal
```
Build the Sales Person portal by reusing the Sales Manager portal's components and logic, per the "Sales Person portal" section of SYSTEM_SPEC_AND_PROMPTS.md — same pages except no "Sales Persons" or "Top Sales Person" list (a Sales Person has no one under them). Route it under /sales-person. Reuse existing components where the UI is identical, don't duplicate code that doesn't need to differ.
```