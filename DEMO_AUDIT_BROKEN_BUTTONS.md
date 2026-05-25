# Andy's Automotive Dashboard — Broken-Button Audit

**Audit date:** 2026-05-25
**Standard applied:** Every interactive element should be fully walkable — clicking it should trigger a toast, update local/mock state, AND where the click implies a workflow, advance to the next screen with the mock data carried forward. Anything less than that is listed here as a bug.

Items are tagged:
- **P0** — On the critical demo path the owner called out (VIN entry/scan, vehicle arrival, diagnose → estimate → send). Fix before the client sees the demo.
- **P1** — Visible dead button on a primary action surface. Looks broken to anyone clicking around.
- **P2** — Secondary/cosmetic dead control, or a display element that looks interactive but isn't. Won't block a demo if skipped, but degrades polish.
- **MISSING** — Functionality the audit expected to find but isn't rendered anywhere.

---

## 1. Owner's headline complaints — root causes

### 1.1 "When a vehicle arrives, you can't type in the VIN number and you can't scan it."

Three separate surfaces are dead:

| Where | Element | File / Line | Status |
|---|---|---|---|
| Vehicle-arrival modal | "type VIN/plate manually" fallback link | `src/components/flows/AutoROArrivalModal.tsx` ~146 | **P0 — no onClick.** The exact button the owner is talking about. |
| Vehicle-arrival modal | Camera viewport / "Scan now" | `src/components/flows/AutoROArrivalModal.tsx` ~111–134 | **P0** — "Scan now" works (advances to a fake animation) but there's no camera viewport click, no file-input fallback, and any input always resolves to MT-47 hardcoded. |
| Schedule page | "New Appointment" header CTA | `src/routes/schedule.tsx` ~249–255 | **P0 — no onClick.** No path to start an arrival/check-in from the schedule. |
| Vehicles index | "Add Vehicle" header CTA | `src/routes/vehicles.index.tsx` ~99–106 | **P0 — no onClick.** No add-vehicle modal exists. |
| Vehicle detail | "Edit" header button | `src/routes/vehicles.$id.tsx` ~133–136 | **P1 — no onClick.** No way to re-enter or correct a VIN. |
| Vehicle detail | "Copy VIN" header button | `src/routes/vehicles.$id.tsx` ~137–140 | **P1 — no onClick.** Should `navigator.clipboard.writeText(vin)` + toast. |

There is **literally no UI surface anywhere in the app that accepts VIN entry, typed or scanned, on a working handler**.

### 1.2 "When diagnosing the issue, you need to create an estimate and send it right away — that thought process is not currently working."

The diagnose → estimate → send chain breaks at four seams:

| Seam | Element | File / Line | Status |
|---|---|---|---|
| Inspection → Estimate | "Build Estimate from Findings" header (inspection detail) | `src/routes/inspections.$id.tsx` ~184 | **P0** — opens the AI-builder modal but the modal never persists a new estimate or navigates to `/estimates/$id`. Demo ends in a dead modal. |
| Inspection → Estimate | "Generate Estimate" (right-rail AI card) | `src/routes/inspections.$id.tsx` ~293 | **P0** — same problem as above. |
| Estimate detail | "Send to Customer" header button | `src/routes/estimates.$id.tsx` ~149 | **P0 — no onClick.** The single most important button on the estimate page is dead. |
| Estimate detail | "Email to customer" right-rail quick-action | `src/routes/estimates.$id.tsx` ~333 | **P0 — no onClick.** Backup send path is also dead. `ActionButton` component (~line 583) doesn't accept or wire `onClick`. |
| Estimate detail | "Add Line" button | `src/routes/estimates.$id.tsx` ~363 | **P0 — no onClick.** Can't shape an estimate before sending. |
| Estimate detail | All line-item numeric cells (qty / part $ / labor hrs / labor $) | `src/routes/estimates.$id.tsx` ~403–417 | **P0** — rendered as plain `<td>` text. Nothing is editable. Tax/subtotal/total therefore never recompute. |
| Estimate detail | Yellow "Build from Findings" banner CTA (EST-4847) | `src/routes/estimates.$id.tsx` ~259 | **P1 — no onClick.** Highest-visibility lost-revenue CTA is dead. |

Two more closely related missing pieces:
- **MISSING** — Signature pad anywhere on the estimate page.
- **MISSING** — "Simulate customer approved" demo button to advance state.

---

## 2. Cross-cutting bug — one fix, big leverage

### 2.1 `FilterBar` is mostly dead across every list page

`src/components/shop/FilterBar.tsx` is reused on customers, vehicles, repair-orders, estimates, inspections, inventory, AR. Inside the component:

| Line | Element | Status |
|---|---|---|
| ~47–56 | Each filter chip (`filters.map`) | **P1 — no onClick.** All filter pills on every list page are inert. |
| ~58–66 | "More filters" button | **P1 — no onClick.** |
| ~69–77 | "Sort" button | **P1 — no onClick.** Sort is hardcoded. |
| ~78–86 | "Export" button | **P1 — no onClick.** Every "Export" button on every list page is the same dead button. |

Fixing FilterBar to accept `onClick` / `onChange` on chips and `onSort` / `onExport` callbacks (or wire to toasts internally) repairs all of the following at once, which I'll otherwise list per-page below:

- Customers index: Platform / Last visit filters + Export + More filters + Sort
- Vehicles index: Make / Year filters + Export
- Repair orders index: Tech / Advisor / Opened filters + Export + Sort
- Estimates index: Advisor / Created / Amount filters + Export
- Inspections index: Tech / Template filters + Export
- Inventory: Vendor / Category filters + Export + More filters + Sort
- AR: Aging / Amount filters + Export

---

## 3. Page-by-page catalog

### 3.1 Landing page — `src/routes/index.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~972 | "Approve in one tap →" button (PreviewEstimate) | P1 | No onClick. Centerpiece of the photo-estimate hero demo. | Navigate to `/estimates/$id` with mock approved state + toast. |
| ~359–388 | "About Us video" section | P1 | A `.png` styled to look like a video, no play button, no `<video>`, no modal. | Wrap in a button that opens a modal player or links to a real video. Add Play icon overlay. |
| ~211–225 | Hero slide indicators | P2 | Clicks work but auto-rotate stomps user selection within 6s. | Pause `setInterval` on user click (mirror `AboutSection` pattern). |
| ~341–349 | TrustMarquee industry pills | P2 | Plain `<span>` with hover-color treatment — look clickable, aren't. | Make each a button that toasts "Filtered case studies — coming soon" or remove hover affordance. |
| ~1147 | ServicesPreview cards (6) | P2 | Cards have `hover:-translate-y` lift but aren't `<Link>`. | Wrap each card in a `<Link to="/services">`. |
| ~1277 | "Read all Google reviews" link | P2 | External Google Maps short URL — verify it resolves. | Confirm URL or replace with internal `/reviews`. |
| MISSING | "Watch demo" / "Book a demo" CTA in hero | P2 | A SaaS landing page with no in-app demo CTA. | Add a "Try the demo" hero button → `/login` or `/dashboard`. |

### 3.2 About — `src/routes/about.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~162–177 | Shop gallery marquee | P2 | Photos have `hover:scale-110`, no lightbox/click. | Add lightbox modal or remove hover scale. |
| ~330–372 | Team grid (8 cards) | P2 | Strong "clickable card" hover affordance, no onClick. | Open "Meet the tech" drawer on click, or toast bio coming soon. |

### 3.3 Contact — `src/routes/contact.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~331 | Map placeholder | P1 | Static styled div pretending to be a map. | Embed Google Maps iframe or wrap in link to maps URL. |
| ~164 | Email field | P2 | `type="email"` but `handleSubmit` doesn't validate format — silently passes garbage. | Add regex check + toast. |
| ~158 | Phone field | P2 | `type="tel"` accepts any string. | Pattern/format. |

### 3.4 Services — `src/routes/services.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~171–238 | Service cards (6) | P1 | `hover:-translate-y` lift, no link/handler, no per-service "Request" CTA. | Wrap each card or add per-card CTA → `/contact?service=...`. |

### 3.5 Login — `src/routes/login.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~228 | "Forgot?" link | P1 | No onClick. On the critical auth path. | Toast "Reset link sent to <email>" using current email state, or open modal. |
| ~263 | "Keep me signed in" checkbox | P1 | `defaultChecked` only — no onChange, no state, ignored on submit. | Bind to `rememberMe`, persist or toast on submit. |
| MISSING | SSO buttons (Google/Microsoft/Apple) | P2 | None present despite fleet-SaaS positioning. | Add at least one mock SSO that toasts. |

### 3.6 Public footer / header — `src/components/public/*`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| PublicFooter ~103 | Vimeo social icon | P2 | URL `vimeo.com/AndysATS` is likely 404 (vanity slug format wrong). | Verify or replace. |
| PublicFooter ~113 | Services column links (6) | P2 | All point to plain `/services` with no anchor — links don't deep-link to the named section. | Add `hash="after-hours"` etc. and matching `id` on services.tsx sections. |
| PublicFooter ~128 | Company column links | P2 | Same: all point to plain `/about` regardless of label ("Our Values", "The Team"). | Anchors + hash links. |
| PublicFooter | Newsletter signup | MISSING P2 | Audit expected one, not rendered. | Add a stubbed signup that toasts "Subscribed". |

### 3.7 AppShell (sidebar + topbar) — `src/components/layout/AppShell.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~373 | Notifications bell | P1 | No onClick. Red dot is decorative. | Open notifications panel with mock items; clear red dot. |
| ~380 | Profile pill ("CM / Cameron") | P1 | `<div>`, no dropdown, no Sign out, no theme toggle, no role switch. | Add dropdown menu. |
| ~177 | Shop selector ("Andy's Automotive / Heavy Duty Shop" with `ChevronsRight`) | P1 | No onClick — looks like a switcher, isn't. | Open shop-switcher popover. |
| ~340, ~314 | Help button (collapsed + expanded sidebar) | P2 | No onClick. | Open help modal / navigate / toast. |
| MISSING | Theme toggle | P2 | Not in topbar. | Add sun/moon button. |

### 3.8 Dashboard — `src/routes/dashboard.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~399–408 | "Schedule" header button | P1 | Only toasts; doesn't navigate. | `navigate({ to: "/schedule" })`. |
| ~572–580 | Job-board "All Techs" / "Today" / "Full board" filter buttons | P1 | All three have no onClick. | Open dropdowns / navigate. |
| ~609 | "Schedule" chevron link (Today's Appointments) | P1 | No onClick. | Navigate. |
| ~614 | AppointmentsList rows | P1 | Not clickable. | Pass `onRowClick` → navigate to appointment/RO. |
| ~627 | "Time clock" chevron link | P2 | No onClick. | Navigate / open modal. |
| ~657 | Messages icon header | P2 | Icon-only, no click. | Add Inbox link. |
| ~660–688 | Messages card list items | P1 | Hover styling, no onClick. | Open thread on click. |
| ~700–722 | Needs Attention alerts (3) | P1 | Reference specific ROs/customers but click does nothing. | Navigate to RO/customer. |
| ~740 | "Inventory" chevron (Parts on Order) | P2 | No onClick. | Navigate. |
| ~744–771 | Parts on Order rows | P2 | Hover styling, no onClick. | Navigate to RO/part. |
| ~782 | Activity icon header | P2 | Icon-only. | Add "View all" link. |
| ~788–810 | Recent Activity rows | P2 | Hover styling, no onClick. | Navigate to entity. |
| ~825–849 | Quick Actions (5 of 6) | P1 | All except "New Repair Order" fall through to `toast.info("Coming soon")`. Schedule Appointment, Start Inspection, Add Customer, Receive Parts, AI: Build Estimate — all dead. | Each should open the relevant modal or navigate. |
| ~495–547 | Six KPI tiles | P2 | If meant to drill into reports, no onClick. | Toast or navigate to relevant report. |

### 3.9 Schedule — `src/routes/schedule.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~208–222 | Prev / Today / Next date nav | P1 | No onClick. `weekStart` is `useState` without setter exposed (`const [weekStart]` only) — even with handlers, can't advance the calendar. | Add setter, wire handlers. |
| ~244 | "Filters" button | P1 | No onClick. | Open filters drawer. |
| ~249–255 | **"New Appointment" primary CTA** | **P0** | No onClick. No path to start an appointment / VIN entry / check-in. | Open new-appointment modal with VIN entry, customer, vehicle, bay, tech, time. |
| ~429–470 | Empty bay cells (DayView) | P1 | Accept drops but no onClick to create on empty slot. | Click empty slot → open new-appointment modal pre-filled. |
| ~485–528 | Appointment cards (DayView) | P1 | No onClick, no context menu. No way to "Check In". | Open appointment drawer with reschedule / reassign / cancel / check-in. |
| ~313–348 | Unscheduled rail items | P1 | Drag works, click dead. No "+ Add" to push a new arrival into the queue. | Click → edit modal. Add a "+ Add" button. |
| ~570–626 | Week view cells + blocks | P1 | No handlers anywhere. | Click empty → create. Click block → open drawer. |
| ~656–677 | List view rows | P1 | `<tr>` no onClick, no row actions. | Row click → drawer. |
| MISSING | VIN input (typed or scan), Check In button, plate decoder, recurring options, customer search, tech dropdown, time picker | P0 | None of these exist anywhere on the page. | Add as part of New Appointment modal. |

### 3.10 Vehicles index — `src/routes/vehicles.index.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~99 | **"Add Vehicle" primary CTA** | **P0** | No onClick. | Open modal with VIN text + scan + plate decoder + year/make/model + customer + Save. |
| ~108 | Make / Year filter chips | P1 | FilterBar bug — no handlers. | See §2.1. |
| ~116 | Export | P1 | FilterBar bug. | See §2.1. |
| Rows | Per-row hover actions | P2 | Hover implies row actions; none exist (no edit/archive/start RO). | Add kebab/hover actions. |

### 3.11 Vehicle detail — `src/routes/vehicles.$id.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~133 | "Edit" | P1 | No onClick. | Open edit modal. |
| ~137 | "Copy VIN" | P1 | No onClick. | `navigator.clipboard.writeText(vin)` + toast. |
| ~141 | "Add Photo" | P1 | No onClick. | Open upload modal, advance to Photos tab. |
| ~146 | "Start Inspection" | P1 | No onClick. | Navigate to new inspection prefilled with vehicleId. |
| ~226 | "Add photo" (right rail duplicate) | P2 | No onClick. | Same fix. |
| ~242–262 | Recommended Services (3 items) | P1 | DUE indicators, no Schedule CTA. | Add "Schedule" per item → schedule modal prefilled. |
| ~403–422 | Service History rows | P2 | `<tr cursor-pointer>` but only inner `<Link>` works — rest of row is dead. | Whole-row navigate. |
| ~480–494 | Photos tab (6 placeholder cards) | P2 | No click, no upload, no "+ Add Photo". "VIN plate" card is the obvious place for a re-scan affordance. | Add Upload button + tile click → lightbox. |
| ~499 | Notes textarea | P1 | Uncontrolled (`defaultValue`), no onChange. Typed edits dropped. | Make controlled. |
| ~504 | "Save" (notes) | P1 | No onClick. | Toast + persist to local state. |
| MISSING | Re-scan VIN button, Check In button, delete/archive, print history, reassign owner | P0/P1 | None present. | Add as appropriate. |

### 3.12 Inspections index — `src/routes/inspections.index.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~129 | "Start Inspection" | P1 | No onClick. | Generate ID, `navigate({ to: "/inspections/$id" })` + toast. |
| ~140–143 | Tech / Template filter chips + Export | P1 | FilterBar bug. | See §2.1. |
| ~211–219 | Findings count pills, camera icon | P2 | Visual only. | Click red pill → detail with `?filter=red`. |

### 3.13 Inspection detail — `src/routes/inspections.$id.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~168 | "Save" | P1 | No onClick. | Toast. |
| ~172 | "Send to Customer" | P0 | No onClick. Core to the diagnose→estimate→send chain. | Open Send modal (SMS/Email/Both) + toast + append to History tab. |
| ~176 | "Print" | P2 | No onClick. | `window.print()` or toast. |
| ~184 | "Build Estimate from Findings" | **P0** | Opens modal but modal never persists a new estimate or navigates. | On confirm, create estimate, `navigate({ to: "/estimates/$id" })`. |
| ~293 | "Generate Estimate" (right-rail) | **P0** | Same as above. | Same fix. |
| ~390–424 | Inspection item rows | P1 | Status circle (R/Y/G) is decorative, not a selector. Camera icon dead. No way to change status, edit notes, attach photo, record voice. | Click status → cycle/segmented control. Click row → side panel to edit. Camera → upload modal. |
| ~244–275 | Recommendations cards (right rail) | P2 | Not clickable. | Click → scroll to matching finding or seed estimate builder. |
| ~476–512 | Photos tab | P1 | No Upload button. Tiles not clickable. | Add Upload header + tile click → lightbox. |

### 3.14 Estimates index — `src/routes/estimates.index.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~133 | "New Estimate" | P0 | No onClick. Second entry point to the workflow. | Generate ID → navigate to blank draft. |
| ~147–152 | Advisor / Created / Amount + Export | P1 | FilterBar bug. | See §2.1. |

### 3.15 Estimate detail — `src/routes/estimates.$id.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~145 | "Save" | P1 | No onClick. | Toast. |
| ~149 | **"Send to Customer" header** | **P0** | No onClick. The single most important button on the page. | Open Send modal (Text/Email/Both, recipient, message, share link, reminder toggle) → toast + flip status to sent + append Messages entry + push Activity. |
| ~179 | "Print" | P1 | No onClick. | `window.print()` or toast. |
| ~196 | "Convert to RO" header | P0 | Opens confirm modal and toasts, but doesn't update status, doesn't create RO, doesn't navigate. | On confirm: set "converted", `navigate({ to: "/repair-orders/$id" })`. |
| ~259 | "Build from Findings" yellow banner CTA (EST-4847) | P1 | No onClick. | Open AI estimate builder seeded with unestimated findings. |
| ~333–336 | **Right-rail quick actions (4)** — Email, Send to fleet, Print, Convert to RO | **P0** | `ActionButton` component (~line 583) accepts no onClick prop. All four are pure styling. | Give `ActionButton` an `onClick` prop; wire to same handlers as header. |
| ~363 | "Add Line" | P0 | No onClick. | Open Add Line modal or append stub line + recompute totals. |
| ~403–417 | Line item numeric cells (qty/part/labor) | P0 | All `<td>` text — nothing editable. Tax/total can't recompute. | Inline-edit inputs + recompute. |
| MISSING | Per-line delete, discount field, customer-facing share link, reminder toggle, signature pad, "Mark All Approved" / "Decline Estimate" batch actions, customer-approval simulator | P0/P1 | None present. | Add as appropriate. |
| ~490–518 | MessagesTab | P2 | Static bubbles, no compose. | Add compose input + Send. |
| ~520–546 | ActivityTab | P2 | Hardcoded; doesn't reflect session actions. | Drive from same state as Send/Convert handlers. |

### 3.16 Repair orders index — `src/routes/repair-orders.index.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~150–155 | Filters + Export | P1 | FilterBar bug. | See §2.1. |
| ~161–172 | Column headers | P1 | No onSort — sorting missing entirely. | Click header → toggle sort + indicator. |
| ~191–197 | Alert flag pill | P2 | No onClick. | Popover with flags + Resolve. |
| ~203 | Status pill | P1 | Read-only — no way to change RO status from list. | Click → status menu, update store. |
| ~226–238 | Tech avatar / Unassigned | P1 | Not clickable. | Click → tech picker. |
| ~239–241 | Advisor cell | P2 | Plain text. | Click → advisor picker. |

### 3.17 Repair order detail — `src/routes/repair-orders.$id.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~185 | "Save" | P1 | No onClick. | Toast. |
| ~189 | "Send Estimate" | P0 | No onClick. | Toast + advance status + append activity. |
| ~193 | "Print" / Print Invoice | P1 | No onClick. | `window.print()`. |
| ~197 | "Email" | P1 | No onClick. | Open email-compose modal. |
| ~220–227 | "Post RO" chevron (dropdown affordance) | P2 | Chevron is decorative; only main button works. | Chevron opens menu (Post & Close / Post & Email / Post & Print). |
| ~228–230 | "More" three-dot | P1 | No onClick. | Context menu (Delete, Duplicate, Convert, Archive, Print WO). |
| ~115–145 | Tab badge counts (3, 4, 2, 1, 2, 4) | P2 | Hardcoded literals — never update with adds. | Derive from arrays. |
| ~558 | "View all" Recent Activity link | P2 | No onClick. | `setTab("activity")`. |
| ~617 | "Add Job" | P0 | No onClick. Jobs array is component-local — even a stub add wouldn't persist. | Open canned-job picker + append to store. |
| ~625–662 | Job cards | P1 | No Start/Pause/Resume/Complete timer, no auth toggle, no status change. | Add per-card timer controls. |
| ~642–646 | "AUTHORIZED" pill | P2 | Read-only. | Click toggles. |
| ~678 | "Add Part" | P0 | No onClick. Parts lookup search missing. | Open parts-lookup modal → append. |
| ~706 | Qty cell | P1 | Plain text — no +/- stepper. | Inline stepper + recompute price. |
| ~705 | Vendor cell | P2 | Plain text — no vendor picker. | Click → vendor picker. |
| ~715–724 | Parts status pill | P2 | Read-only. | Click → toggle (Received/Returned/Back-ordered). |
| Parts rows | Whole row | P2 | No edit/remove. | Open edit drawer + per-row actions. |
| ~743 | "Add Labor" | P0 | No onClick. | Open add-labor modal. |
| ~766 | Tech cell (labor) | P1 | Plain text. | Click → tech picker. |
| ~767 | Hours cell (labor) | P1 | No inline edit, no timer. | Inline edit + Start/Stop. |
| ~772–782 | Labor status pill | P2 | Read-only. | Click → cycle. |
| ~829 | InspectionTab finding chips | P2 | Look tappable, aren't. | Click → filter findings or jump to inspection. |
| ~881–894 | MessagesTab bubbles | P1 | Static. No compose box. | Add compose + Send. |
| ~873 | "Open thread" link | P2 | Routes to `/messages` (no $id) — lands on default thread. | Pass thread id. |
| ~909 | FilesTab "Upload" | P1 | No onClick. | Open file picker → append row. |
| ~930–932 | "Download" per file row (4) | P2 | No onClick. | Toast / mock download. |
| Files row | Whole row | P2 | No preview. | Open preview modal. |
| ~556 | OverviewTab embeds JobsTab without `tech` prop | P2 | Always shows "Unassigned". | Pass tech name. |

### 3.18 Jobs (canned jobs) — `src/routes/jobs.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~55 | "AI: Suggest Jobs" | P1 | No onClick. | Open suggestion modal or toast. |
| ~59 | "New Canned Job" | P1 | No onClick. Primary CTA. | Open create modal → push to store. |
| ~178 | Detail "Edit" (pencil) | P1 | No onClick. | Open edit modal. |
| ~184 | Detail "Duplicate" (copy) | P1 | No onClick. | Clone with new id. |
| ~241 | **"Add to Repair Order"** | P0 | No onClick. The page's primary workflow CTA. | Open RO picker → append labor + parts → navigate to RO detail. |

### 3.19 My Work — `src/routes/my-work.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~68–87 | "Clocked In · 04:38:12" header pill | P2 | Not clickable; timer is hardcoded literal, never ticks. | Connect to TimeClockPanel state; setInterval the timer. |
| ~91–94 | DayStat cards | P2 | Hardcoded except ROs Today. | Derive when actions wire up. |
| ~206 | "Start" button on assigned ROs | P0 | No onClick. | Update RO status → in-progress, move tab, start timer, toast. |
| ~190 | "Pause" button | P0 | No onClick. | Pause state, swap to Resume. |
| ~197 | "Done" button | P0 | No onClick. | Set status → ready/completed, move to Completed tab. |
| ~257 | "Clock In" | P1 | Pill updates but no log entry appended (entries array is hardcoded). | Lift entries to state, append. |
| ~269 | "Start Break" | P1 | Same. | Append + toggle to End Break. |
| ~281 | "Clock Out" | P1 | Same. | Append + today's-hours total + toast. |
| MISSING | Board/Kanban view with drag between columns | P2 | List view only. | Add board view toggle. |
| MISSING | Priority change (Low/Normal/High/Rush) | P2 | No priority anywhere across all three RO pages. | Add priority pill + cycle on click. |

### 3.20 Customers index — `src/routes/customers.index.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~92 | "Add Customer" | P1 | No onClick. | Open add-customer modal. |
| ~106–109 | Platform / Last visit + Export + More filters + Sort | P1 | FilterBar bug. | See §2.1. |
| ~140–167 | Inline phone/email on rows | P2 | Plain text inside a row that navigates to detail. No direct call/email action. | Add icon buttons with stop-propagation. |

### 3.21 Customer detail — `src/routes/customers.$id.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~148 | "Edit" | P1 | No onClick. | Open edit modal. |
| ~152 | "Call" | P1 | No onClick. | Toast "Calling…" + state pill. |
| ~156 | "Message" | P1 | No onClick. | Navigate to /messages with thread preselected. |
| ~161 | "Schedule" | P1 | No onClick. | Open scheduling modal prefilled. |
| ~257 | "Open in {fleetPlatform}" | P2 | No onClick. | Toast "Opening Fleetio…" / new tab. |
| ~321 | "Send Statement" (AR card) | P1 | No onClick. | Toast + flip AR flag. |
| ~477–498 | Vehicles tab rows | P2 | `cursor-pointer` but no row onClick — only first cell links. | Whole-row navigate. |
| ~523–544 | Repair Orders tab rows | P2 | Same. | Whole-row navigate. |
| ~569–594 | Estimates tab rows | P2 | Same. | Whole-row navigate. |
| ~619 | "Open thread" Messages tab link | P2 | Doesn't pass thread id; lands on default. | Pass id. |
| ~632 | Notes textarea | P1 | Uncontrolled. | Make controlled. |
| ~637 | "Save Note" | P1 | No onClick. | Toast + persist. |
| MISSING | Merge, Email, Text, Send Review Request, Marketing-tags add/remove | P2 | None present. | Add per audit brief. |
| ~601–626 | MessagesTab inside profile | P2 | Hardcoded preview, no composer. | Add mini-composer or remove. |

### 3.22 Messages — `src/routes/messages.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~344 | "New Message" | P1 | No onClick. | Open compose modal → prepend draft thread. |
| ~360 | Thread search input | P1 | No value/onChange — typing is dropped. Filtering only uses status. | Bind to state + filter. |
| ~506 | Conversation "Call" | P1 | No onClick. | Toast. |
| ~512 | Conversation "Email" | P1 | No onClick. | Switch composer channel or open drawer. |
| ~518 | "More" three-dot | P1 | No onClick. | Open menu (Mark resolved, Assign, Mute, Archive). |
| ~578 | Paperclip / Attach | P1 | No onClick, no file input. | Hidden file input + chip above composer. |
| MISSING | Emoji picker | P2 | Not present. | Add emoji button + picker. |
| ~589 | "Templates" | P1 | No onClick. | Open templates popover → insert into draft. |
| ~592 | **"Send" (composer)** | **P0** | No onClick. Messaging workflow is dead at the actual send. | Push draft to conversations + clear draft + toast + update preview + reset unread. |
| MISSING | Channel filter (SMS / Email / In-app) | P2 | Only status filter present. | Add channel pills. |
| ~389–462 | Thread selection | P2 | Selecting doesn't clear `unread`. | Mark read on select. |

### 3.23 Inventory — `src/routes/inventory.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~100 | "Parts Matrix" | P1 | No onClick. | Navigate or open matrix modal. |
| ~104 | "Receive PO" | P1 | No onClick. | Open Receive PO modal → bump on-hand. |
| ~108 | "Add Part" | P1 | No onClick. | Open add-part modal → push to store. |
| ~122–126 | Vendor / Category + Export + More + Sort | P1 | FilterBar bug. | See §2.1. |
| Tabs | Vendors / Returns / On-order tabs | P1 | Tabs render with counts, but `filtered` only branches on `low-stock` — all other tabs show identical data. | Branch per tab. |
| Rows | Per-row Reorder, min/max edit, vendor link, adjust, kebab | MISSING P1 | No row actions at all. | Add Reorder button + inline edit reorder point + vendor link + Adjust modal. |
| MISSING | Barcode scan, inventory adjustment | P2 | Not present. | Add header buttons. |

### 3.24 Reports — `src/routes/reports.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~117 | Date range button | P1 | No onClick; label hardcoded. | Open date-range picker → re-render KPIs. |
| ~121 | "Filters" | P1 | No onClick. | Open filters drawer. |
| ~125 | "Export" | P1 | No onClick. | Toast + mock download. |
| ~183–209 | **Every report card (24 of 24)** | **P1** | Every `<button>` has no onClick. Whole reports catalog is non-walkable. | Each click → navigate to `/reports/$reportId` or open detail modal with chart + table. |
| ~138–144 | KPI tiles (4) | P2 | Not clickable. | Drill into underlying report. |
| ~93–102 | Search state | P2 | `search` state and filter exist but there is **no search input rendered** — state is unreachable. | Render input bound to state, or remove dead code. |
| MISSING | Schedule Report, star/favorite toggle | P2 | `r.starred` icon displays but isn't toggle-able. | Add Schedule button; make star clickable. |

### 3.25 AR (Accounts Receivable) — `src/routes/ar.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~176–181 | Aging / Amount filters + Export | P1 | FilterBar bug. | See §2.1. |
| ~244 | Per-row "Send statement" icon | P1 | No onClick. | Toast + update last-contacted. |
| ~250 | Per-row "Call" icon | P1 | No onClick. | `tel:` or call-logged toast. |
| Tabs | "Payments" and "Statements" tabs | P1 | Tabs selectable but content doesn't switch — same invoice list. | Render different content per tab. |

### 3.26 Fleet Integrations — `src/routes/fleet-integrations.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~36 | "Sync All" | P1 | No onClick. | Toast "Syncing…" → "Sync complete". |
| ~40 | "Add Integration" | P1 | No onClick. | Open modal or scroll to Available. |
| ~89 | **"Connect" on each Available integration (4: Geotab, Samsara, WEX, Verizon)** | P1 | No onClick on any of the 4. The headline bug for this page. | OAuth-style modal → on confirm toast + move card to Connected. |
| ~137 | Settings (gear) on each Connected card | P1 | No onClick. | Config modal (sync freq, default mapping, key reveal, webhook test). |
| ~143 | "Open in platform" ExternalLink | P1 | No onClick, no href. | `window.open(url)` or toast. |
| ~184 | "Sync now" per Connected card | P1 | No onClick. | Toast + animate lastSync. |

### 3.27 Settings — `src/routes/settings.tsx`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| ~148 | **"Save" in shared Panel header** (used by all 10 settings tabs) | **P1** | No onClick. The primary CTA on every settings page is dead — single highest-blast-radius settings bug. | Toast "Settings saved" + checkmark state. |
| ~164 / ~242 | All Field inputs + time inputs | P1 | Uncontrolled `defaultValue` only; user can type but state is never captured anywhere. Save (when wired) has nothing to save. | Make controlled. |
| ~253 | "Open/Close" toggle per day (Hours) | P1 | No onClick. | Toggle closed flag. |
| ~189–203 | All Toggle components (Tax/Notifications/Payments) | P2 | Local state toggles, but never persists across navigation. | Lift to settings store. |
| ~318 | "Edit" per labor rate (5) | P1 | No onClick. | Inline editor or modal + toast. |
| ~370 | "Edit" per employee (8) | P1 | No onClick. | Open edit modal. |
| MISSING | "Add Tax" button | P1 | Not rendered. | Add. |
| MISSING | "Invite User" button | P1 | Not rendered. | Add. |
| MISSING | Role dropdown per employee | P2 | Role is a static `<span>`. | Convert to select. |
| MISSING | Logo upload | P2 | No file input. | Add. |
| ~419–433 | IntegrationsPanel `<a href="/fleet-integrations">` | P2 | Raw `<a>` causes full page reload instead of TanStack navigation. | Use `<Link>`. |
| ~459 | "Configure" 2FA | P2 | No onClick. | Open 2FA setup modal. |
| ~464 | Session timeout card | P2 | No interactive control. | Add select. |
| ~470 | Audit log card | P2 | No view button. | Add View log button. |
| MISSING | API key reveal/copy/regen, webhook URL + Test | P2 | None present in IntegrationsPanel. | Add section. |
| MISSING | "Add payment method" | P2 | Not in PaymentsPanel. | Add modal trigger. |
| ~481–504 | Billing panel | P2 | No interactive elements. | Add Update payment / Download invoice / Change plan buttons. |

### 3.28 Copilot — `src/routes/copilot.tsx` + `src/components/ai/copilot/*`

| Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| copilot.tsx ~56 | "New chat" (left rail) | P2 | Calls `window.location.reload()` — full reload resets everything; in-chat New chat (line 255) does it correctly via `handleReset`. | Call `handleReset()` via prop, or bump a `chatKey` on `<CopilotChat>`. |
| copilot.tsx ~73–99 | Recent chat list items (6) | P1 | All `<button>`s with **no onClick** at all despite active/hover styling. | Each should seed chat (`handleSend(title)`) or load canned conversation. |
| copilot.tsx ~214 | "Open in {Repair Orders/...}" context-card link | P2 | Routes use hardcoded IDs — verify all five detail routes exist and IDs map to seeded data. | Verify or fallback to list page. |
| parts.tsx ~334 | "Modify" button on approval card | P2 | No onClick. Rendered next to working Reject/Approve. | Open editor modal or remove. |
| CopilotChat.tsx ~280 | Typing-dots indicator | P2 | Uses ref instead of state — won't hide while waiting on approval. | Track in `useState`. |
| CopilotChat.tsx ~228 | Header "New chat" | P2 | Reset doesn't abort running scenario; background steps update messages after reset. | Track generation ID; bail in runSteps when changed. |

### 3.29 Shared flow modals — `src/components/flows/*`

| File / Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| AutoROArrivalModal ~146 | "type VIN/plate manually" | **P0** | No onClick. | Switch modal to manual-entry phase (VIN input + plate input + Decode). |
| AutoROArrivalModal ~111–134 | Camera viewport + Scan now | P0 | No real camera, no file input, viewport not tappable. | File-input `accept="image/*" capture="environment"` or label "Simulate scan (demo)". |
| AutoROArrivalModal | Match always = MT-47 regardless of input | P2 | Acceptable for demo but combined with dead manual entry, only one outcome possible. | When manual entry wired, accept any VIN and still resolve to MT-47. |
| NewRepairOrderModal ~226 | "+ Add new customer" | P1 | No onClick. | Sub-modal → mock createCustomer → auto-select. |
| NewRepairOrderModal ~278 | "+ Add new vehicle" | P1 | No onClick. | Sub-form → push to mock vehicles → auto-select. |
| AIEstimateBuilderModal ~521 | "Click any field to edit" copy | P2 | Misleading — nothing is editable. | Either remove copy or wire in-place edits for labor hrs/price. |
| DiagnosticAssistantModal ~302 | "Send to Marcus" | P1 | No onClick. | Toast + close. |
| FleetSubmitModal ~149 | "Open in {platform}" | P2 | `href="#"` jumps to top. | `e.preventDefault()` + toast. |
| PartsIdentifierModal ~196 | VIN narrowing input | P1 | No value/onChange — uncontrolled. | Bind to state, pass to startAnalysis. |
| PartsIdentifierModal ~201 | Part-class select | P1 | Uncontrolled. | Bind to state. |
| PartsIdentifierModal ~243 | "Re-scan" link | P2 | No onClick. | Reset phase to "input". |
| PreROQualityCheckModal ~273 | Per-issue "Fix" button | P1 | No onClick. | Mark resolved + toast + decrement count; better: route to remediation modal. |

### 3.30 Shared shop widgets — `src/components/shop/*`

| File / Line | Element | Severity | What's broken | Should do |
|---|---|---|---|---|
| AppointmentsList.tsx ~42–77 | Each `<li>` row with ChevronRight | P1 | Hover + chevron imply drill-in; no Link, no onClick. | Wrap in `<Link>` or accept `onRowClick` prop. |
| FilterBar.tsx ~47–86 | Filter chips, More filters, Sort, Export | P1 | See §2.1. | See §2.1. |

---

## 4. Recommended fix order (for when you're ready)

If the goal is to get the demo into a sendable state with minimum work, this is the order:

1. **Fix FilterBar (§2.1)** — one component, repairs filters/sort/export across 7 list pages. Highest leverage in the codebase.
2. **Wire VIN entry end-to-end** — AutoROArrivalModal manual-entry button + "Add Vehicle" + "New Appointment" + "Edit"/"Copy VIN" on vehicle detail.
3. **Wire diagnose → estimate → send chain** — Inspection "Build Estimate" must produce a real estimate and navigate; Estimate detail Send + Convert + Add Line + line editing + ActionButton onClick prop.
4. **Wire AppShell topbar** — Notifications, Profile dropdown, Shop selector. These are visible on every screen, so a dead bell is the first thing a customer notices.
5. **Wire reports cards (24 dead buttons in one screen)** — high visible count of dead buttons.
6. **Wire settings Save (one shared Panel header)** — fixes the Save button across all 10 settings tabs.
7. **Wire Messages Send + composer attachments + templates.**
8. **Wire My Work Start/Pause/Done on RO cards.**
9. **Wire Fleet Integrations Connect/Sync.**
10. Everything else as time allows.
