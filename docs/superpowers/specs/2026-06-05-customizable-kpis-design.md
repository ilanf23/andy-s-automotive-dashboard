# Customizable KPI System — Dashboard

**Date:** 2026-06-05
**Scope:** Dashboard page only (engine reusable for Reports/Schedule later)
**Status:** Approved design

## Goal

Replace the dashboard's six hardcoded KPI tiles with a customizable KPI system:

- A catalog of **12 KPIs** (listed below).
- The **owner** ("admin") role can choose which KPIs are shown, with **4–5 visible at a time**.
- KPIs respond to a **timeline** control (Today / Week / Month).
- **Nothing is hardcoded** — every displayed value and delta is computed from an
  underlying financial data layer. This is a demo, so values must be believable
  and react to the timeline and selection.

## The 12 KPIs

| id | Label | Formula |
|----|-------|---------|
| `parts-gp` | Parts GP % (excl. tires/batteries) | (partsRevenue − partsCost) / partsRevenue |
| `labor-gp` | Labor GP % | (laborRevenue − laborCost) / laborRevenue |
| `total-gp` | Total GP % | totalGP / totalRevenue |
| `gp-dollars` | GP $ | totalGP (parts + labor + tires + batteries) |
| `hours-per-ro` | Hours per Repair Order | soldHours / roCount |
| `aro` | Average Repair Order | revenue / roCount |
| `awro` | Average Written Repair Order | writtenRevenue / writtenRoCount |
| `sold-hours` | Sold Hours | soldHours |
| `proficiency` | Proficiency | soldHours / actualHours |
| `elr` | Effective Labor Rate | laborRevenue / soldHours |
| `gp-per-hr` | GP$ / Hour | totalGP / soldHours |
| `cost-per-build-hr` | Cost per Build Hour | totalCost / buildHours |

Derived rollups stay internally consistent: Total GP is the sum of parts, labor,
tire, and battery GP; totals roll up the same primitives used by the component
metrics.

## Architecture

### 1. Data layer — `src/lib/kpi-engine.ts`

A deterministic engine producing a period's raw financial primitives. No display
strings live here.

```ts
type Timeframe = "Today" | "Week" | "Month";

type PeriodFinancials = {
  partsRevenue: number;   partsCost: number;     // excludes tires & batteries
  tireRevenue: number;    tireCost: number;
  batteryRevenue: number; batteryCost: number;
  laborRevenue: number;   laborCost: number;
  soldHours: number;      actualHours: number;   buildHours: number;
  roCount: number;        writtenRoCount: number;
  revenue: number;        writtenRevenue: number;
};

function getPeriodFinancials(tf: Timeframe): PeriodFinancials;
function getPreviousPeriodFinancials(tf: Timeframe): PeriodFinancials;
```

- A **seeded PRNG** (e.g. mulberry32) keyed by timeframe makes values stable
  across re-renders but distinct per period.
- Period scaling: Today ≈ 1 day of volume, Week ≈ 6 working days, Month ≈ 26
  working days, each with small deterministic variance.
- The previous-period figures back the deltas so they are computed, not faked.

### 2. KPI registry — `src/lib/kpi-registry.ts`

One definition per KPI:

```ts
type KpiFormat = "currency" | "percent" | "number" | "hours" | "rate";

type KpiResult = {
  value: string;
  subValue?: string;
  delta: string;
  deltaDirection: "up" | "down" | "flat";
};

type KpiDef = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  format: KpiFormat;
  accent: "default" | "success" | "warning" | "danger" | "ink";
  compute: (curr: PeriodFinancials, prev: PeriodFinancials) => KpiResult;
};

const KPI_REGISTRY: KpiDef[]; // all 12
```

`compute` is pure and formats `value`/`subValue`/`delta` per `format`. Accent may
be static or rule-based (e.g. ELR below target → warning).

### 3. Preferences store — `src/lib/kpi-prefs.ts`

External store using the same `subscribe` + `useSyncExternalStore` pattern as
`shop-store.ts`.

- Holds the array of selected KPI ids, persisted to `localStorage`
  (key e.g. `andys.kpiPrefs`).
- Default 5: `total-gp`, `gp-dollars`, `aro`, `elr`, `proficiency`.
- Enforces the cap: **min 4, max 5** selected.
- Exposes `useKpiPrefs()` → `{ selectedIds, toggle(id), reset() }`.

### 4. UI components

- **`src/components/shop/KpiStrip.tsx`** — props: `timeframe`. Reads prefs, runs
  the engine for current + previous period, maps selected ids through the
  registry, and renders existing `MetricTile`s (unchanged API). Grid columns
  adapt to the selected count. Each tile preserves the existing drill-down
  (`toast.info` + navigate to `/reports`).
- **`src/components/shop/KpiCustomizer.tsx`** — a "Customize" popover, **gated to
  `user.role === "owner"`** via `useAuth()`. Checkbox list of all 12 with
  descriptions, enforces the 4–5 cap (disable further checks at 5; prevent
  unchecking below 4), and a "Reset to default" action.

### 5. Timeline control

Replace the cycling button at `src/routes/dashboard.tsx:610-621` with a
segmented control (Today / Week / Month) driving the existing `dateRange` state.

### 6. Dashboard wiring

Delete the hardcoded KPI array at `src/routes/dashboard.tsx:499-554` and render
`<KpiStrip timeframe={dateRange} />` in its place. Render `<KpiCustomizer />`
near the strip header; it self-hides for non-owners.

## Roles

- `owner` → sees the strip **and** the Customize control.
- `service-advisor` / `tech` / `office` → see the strip only.

## Testing

Light unit tests on the pure functions:

- Engine determinism: same timeframe → same `PeriodFinancials`.
- Period scaling: Month volume > Week > Today.
- Registry consistency: Total GP% equals the rollup of component GP; delta
  direction signs match the curr-vs-prev comparison.
- Prefs cap: cannot exceed 5 or drop below 4.

## Out of scope (for now)

- Applying the KPI system to Reports and Schedule (engine is built reusable so
  this is a later, small step).
- Custom date ranges / Quarter / YTD.
- Per-user (vs per-browser) persistence.
