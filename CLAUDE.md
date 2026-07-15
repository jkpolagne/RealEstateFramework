# RealPortal — Real Estate Management System (Frontend Prototype)

Capstone project (BSIT, University of Nueva Caceres). Research locale: Advench Realty,
Naga City, Camarines Sur. Methodology: Feature-Driven Development (FDD).

## Scope for THIS deliverable — read carefully
This build is a frontend-only prototype with pre-set realistic data, for a
10–15 minute individual demonstration per group member. There is no real backend,
no real database, and no real authentication in this version.

Do NOT wire up Express, Prisma, or PostgreSQL for this deliverable. Instead:
- Build a src/mocks/ folder with realistic hardcoded data (see "Mock data" below)
- Build a thin src/services/ layer where each function returns
  Promise.resolve(mockData) — same function signatures a real API call would use
  later (e.g. getDevelopers(), getClientsByConsultant(id))
- Components call the service layer, never the mock data directly. This means
  when the real Node/Express/Prisma backend is built post-defense, we only replace
  the inside of the service functions with real fetch calls — components don't
  change.
- Add small artificial delays (e.g. 300–500ms) in the mock service functions so
  loading states are visible and look real during the demo.

## Tech stack (target full system — for context, not required in this build)
Frontend: React + TypeScript + Vite. Backend (future): Node.js + Express.js,
PostgreSQL + PostGIS, Prisma ORM. Maps: Leaflet.

## User roles (6)
1. Super Admin — creates company accounts, creates Company Admin accounts,
   updates company status, views system logs. Not scoped to one company.
2. Company Admin — manages developers, properties, loan quotations, visit
   schedule approvals, and consultant accounts (Broker / Sales Manager /
   Sales Person).
3. Broker — reviews/approves commission vouchers, prepares/releases checks,
   monitors Sales Managers.
4. Sales Manager — monitors Sales Persons and clients, records payments,
   signs commission vouchers.
5. Sales Person — manages assigned clients, records payments, signs
   commission vouchers.
6. Property Seeker — browses properties, computes loans, schedules visits.
   No login required.

One shared login screen for roles 1–5, redirect to the right dashboard based on
role. Property Seeker never logs in.

## Module ownership (route each module separately so each member can demo
their own part directly — e.g. /property-inquiry, /sales-monitoring,
/commission, /company-admin)
- Property Inquiry and Loan Computation — Jann Kevin
- Sales and Client Monitoring (incl. Consultant Account and Link Management,
  Client Information Management) — Sean Rey
- Commission Management — Jerome Mark
- Company Account Management (Super Admin + Company Admin) — owner TBD, confirm
  with adviser before the demo

## Commission logic — critical business rule
Total developer cut is set per developer (rates depend on the individual deal
each broker negotiates with that developer — not a fixed system-wide number).
Base split shape:
- Direct Sale: Broker %, Sales Manager % (no Sales Person share)
- Referred Sale: Broker %, Sales Manager %, Sales Person %

Sale type is set by the consultant link: a Property Seeker who arrives through a
Sales Person's unique link produces a Referred Sale; otherwise it's a Direct Sale.
Store this as an explicit field on the mock client/sale records, not inferred.

Full commission tranche logic, requirements checklist, and voucher flow are
defined in SYSTEM_SPEC_AND_PROMPTS.md — that file is authoritative for
commission behavior, this file only covers the base rate shape above.

## Mock data — use these consistently across every screen, don't invent new
names per screen
- Company: Advench Realty, Naga City, Camarines Sur
- Developer: Golden Horizon Developers — total cut 6%, Direct 2%/4%,
  Referred 2%/1.5%/2.5%
- Property: Lot 14, Greenview Estates — ₱1,500,000, available
- Property: Unit 4B, Riverside Homes — ₱2,300,000, reserved
- Client: Maria Santos — interested in Lot 14, Greenview Estates
- Client: Carlo Reyes — interested in Unit 4B, Riverside Homes
- Use realistic Filipino names, Bicol-region addresses (Naga City, Legazpi City,
  Camarines Sur towns), and PHP currency formatting (₱) throughout

## Design tokens — apply consistently, don't let Claude Code invent new colors
per screen
- Navy #132135 — sidebar / dark surfaces
- Gold #B8863B — accent / primary actions / brand mark
- Warm off-white #FAF9F6 — page background
- White #FFFFFF — cards
- Success green #1E7F52 / bg #E7F3EC
- Warning amber #B7791F / bg #FBF0DD
- Font: Inter only, no serif
- Sidebar navigation per role dashboard, compact spacing, cards with a colored
  left-accent bar for status rather than badges alone

## Build order
1. Project scaffold + routing shell + mock service layer + design tokens
2. Login screen (shared, role-based redirect simulated client-side)
3. Company Account Management (Super Admin + Company Admin)
4. Property Inquiry and Loan Computation
5. Sales and Client Monitoring
6. Commission Management