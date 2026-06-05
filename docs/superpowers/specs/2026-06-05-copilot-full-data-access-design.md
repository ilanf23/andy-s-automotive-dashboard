# Copilot Full Data Access — Design Spec

**Date:** 2026-06-05
**Status:** Approved for planning
**Scope:** Give the AI Copilot read-only access to *all* site data — including the financial picture — so that in this demo it can answer any question about the shop.

---

## 1. Problem

The Copilot today can only read 6 domains (repair orders, customers, vehicles, estimates, inspections, today's schedule) via read tools, plus a 20-item-capped snapshot injected into the system prompt. It is blind to large parts of the site:

- **Financial:** AR aging / open balances / past-due invoices (`ar.tsx`), payments, and the headline sales KPIs — Sales Today, ARO, ELR, GP%, GP$, Hours Sold (`dashboard.tsx`, `reports.tsx`).
- **Operational:** technicians, inventory, parts catalog, labor guide, canned jobs, fleet integrations.

There is also no single source of financial truth: the dashboard's KPI numbers (`$14,820`, `$1,847`, `$148`, `56.4%`, etc.) are **hardcoded inline in `dashboard.tsx`**, so nothing else can read them.

## 2. Goals

- Copilot can answer questions about every data domain on the site, read-only.
- Copilot has a coherent financial view: headline KPIs + AR aging + open balances + payment totals.
- A single source of truth for financial KPIs that both the dashboard and the copilot read.
- Stay consistent with the existing hybrid architecture (always-on snapshot + on-demand read tools).

## 3. Non-Goals (YAGNI)

- **No new write actions.** New domains are read-only. Existing write tools (create RO, take payment, send estimate, etc.) are unchanged. (Per scoping decision: "Read-only everything.")
- No new backend, DB, or auth. Data stays in `src/data/*` + the in-memory `shop-store`.
- No UI changes beyond the minimal dashboard refactor in §6. No new routes or pages.
- No real financial computation engine — derived aggregates are simple reductions over existing seed/live data.

## 4. Architecture

We keep the existing two-channel pattern, both fed from the same data:

1. **Snapshot (always-on):** `buildSnapshot()` in `copilot-tools-client.ts` is extended with a `financials` block and counts for the new domains. This lets the copilot answer headline questions ("how's the shop doing financially?", "how many techs?") with **zero tool round-trips**.
2. **Read tools (on-demand):** New per-domain read tools return the fuller records for drill-downs (e.g. "list low-stock inventory", "what's the labor time for a DD15 injector swap?", "who owes us money past 60 days?").

```
            ┌─────────────────────────────────────────┐
            │  src/data/*  +  shop-store (live ROs)    │
            └───────────────┬─────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              │   src/lib/financials.ts     │  ← NEW: KPI constants + selectFinancials()
              └─────────────┬──────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                     │
   buildSnapshot()    new READ_TOOLS        dashboard.tsx
   (financials +      (get_financial_        (KPI strip reads
    counts added)      summary, list_         constants)
                       technicians, ...)
```

## 5. New module: `src/lib/financials.ts`

Single source of financial truth.

### 5a. KPI constants (extracted from `dashboard.tsx`)

```ts
export type ShopKPI = {
  label: string;
  value: string;       // display string, e.g. "$14,820"
  numeric?: number;    // machine value where meaningful, e.g. 14820
  subValue?: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  target?: string;
};

export const SHOP_KPIS = {
  salesToday: { label: "Sales Today", value: "$14,820", numeric: 14820, delta: "+18% vs yest.", deltaDirection: "up" },
  aro:        { label: "ARO",         value: "$1,847",  numeric: 1847,  subValue: "avg", delta: "+$104 MTD", deltaDirection: "up" },
  elr:        { label: "ELR",         value: "$148",    numeric: 148,   subValue: "/hr", delta: "target $155", deltaDirection: "down", target: "$155" },
  grossProfit:{ label: "GP %",        value: "56.4%",   numeric: 56.4,  subValue: "GP $8,290", delta: "+1.2pts", deltaDirection: "up" },
  hoursSold:  { label: "Hours Sold",  value: "47.2",    numeric: 47.2,  subValue: "/ 40.0 billed", delta: "118% eff.", deltaDirection: "up" },
} as const;
```

(The 6th dashboard tile, "Cars In Shop", stays computed live from `shop-store` and is *not* a constant — the dashboard keeps computing it; the copilot gets it from the snapshot's RO list.)

### 5b. `selectFinancials()` — derived aggregates from live data

Computes, from live `shop-store` repair orders + `customers` seed:

```ts
export type FinancialSummary = {
  kpis: typeof SHOP_KPIS;
  ar: {
    totalOpenBalance: number;       // Σ customer.openBalance
    pastDueTotal: number;           // Σ balances on invoices past due
    aging: { current: number; d1_30: number; d31_60: number; d61_90: number; d90plus: number };
    topDebtors: Array<{ customerId: string; name: string; openBalance: number }>; // top 5
  };
  payments: { countToday: number; totalToday: number };   // from shop-store payments
  openROValue: number;              // Σ totals of non-completed ROs
};

export function selectFinancials(): FinancialSummary { /* reductions over shop-store + customers */ }
```

AR aging buckets reuse the same `daysPastDue` logic already in `ar.tsx` (extract the invoice-derivation helper so both `ar.tsx` and `financials.ts` share it — single source for AR too, no duplicated date math).

## 6. Dashboard refactor (minimal, low-risk)

In `dashboard.tsx`, replace the 5 hardcoded KPI object literals in the KPI strip (lines ~500–535) with references to `SHOP_KPIS`. The "Cars In Shop" tile and all layout/styling stay exactly as-is. Icons and `accent` stay in the component (they're presentational, not data) — only the value/delta/subValue strings move to `financials.ts`. Verify the strip renders identically.

## 7. New read tools

Added to `READ_TOOLS` in `copilot-tools.ts` (schema), `TOOLS` in `copilot-tools-client.ts` (executor), and `TOOL_META` (all `requiresApproval: false`):

| Tool | Args | Returns |
|---|---|---|
| `get_financial_summary` | — | Full `FinancialSummary` (KPIs + AR aging + payments + open RO value) |
| `get_ar_aging` | `bucket?` | AR invoices, optionally filtered to an aging bucket; each with customer, balance, daysPastDue |
| `list_technicians` | — | All technicians (name, role, hourlyRate, utilization) |
| `list_inventory` | `lowStockOnly?`, `category?` | Inventory items (partNumber, onHand, reorderPoint, cost, lowStock) |
| `list_parts` | `search?`, `category?` | Parts catalog entries (capped 50) |
| `get_labor_guide` | `search?`, `category?` | Labor guide entries (jobCode, description, laborHours, skillLevel) |
| `list_jobs` | — | Canned jobs (name, standardLaborHours, defaultLaborCost) |
| `list_fleet_integrations` | — | Fleet platforms (name, status, activeJobs, lastSync, customers) |

All follow the existing executor conventions: pull from `src/data/*` (or `shop-store` for live data), `.slice(0, 50)` on long lists, return `{ error }` on miss.

## 8. Snapshot extension

`buildSnapshot()` gains:

```ts
financials: {
  kpis: { salesToday, aro, elr, grossProfitPct, hoursSold },   // headline display values
  arOpenTotal: number,
  arPastDueTotal: number,
  topDebtors: Array<{ name, openBalance }>,     // top 3
},
counts: {
  technicians: number,
  inventoryItems: number,
  lowStockItems: number,
  cannedJobs: number,
  fleetIntegrations: number,
},
```

The bulky catalogs (parts ~500 lines, labor guide ~390) are **not** dumped into the snapshot — they stay tool-only to keep request size lean.

## 9. System prompt update

Extend `SYSTEM_PROMPT` in `copilot-tools.ts` so the model knows its expanded reach: it can now read financials (KPIs, AR aging, open balances, payments), technicians, inventory, parts catalog, labor guide, canned jobs, and fleet integrations — all read-only. Add the new domain glossary terms (AR aging buckets, ELR target, ON-HAND/reorder point). Keep it concise; reaffirm "never invent numbers — read them."

## 10. Data flow examples

- *"How's the shop doing financially today?"* → answered from snapshot `financials` block, no tool call.
- *"Which customers are more than 60 days past due?"* → `get_ar_aging({ bucket: "d61_90" })` / `d90plus`.
- *"Do we have the fuel/water separator in stock?"* → `list_inventory({ search via category })` or `list_parts`.
- *"What's the flat-rate time on a DD15 injector swap?"* → `get_labor_guide({ search: "injector" })`.

## 11. Error handling

- Unknown id / empty filter → `{ error: "<thing> not found" }`, same as today.
- `selectFinancials()` is pure over in-memory data and cannot throw on network; defensive `?? 0` on optional balances.
- Missing `OPENAI_API_KEY` behavior is unchanged.

## 12. Testing

- **Unit (Vitest):** `selectFinancials()` — AR aging buckets sum to total open balance; payments-today totals; topDebtors ordering. Tool executors — each new tool returns expected shape and respects filters/caps.
- **Shared-helper test:** the extracted AR-invoice deriver produces identical results when called from `ar.tsx`'s path and `financials.ts`.
- **Manual:** dashboard KPI strip renders identically post-refactor; copilot answers one question per new domain (financial, inventory, labor, technician, fleet) in the running app.

## 13. Files touched

- **New:** `src/lib/financials.ts`, `src/lib/financials.test.ts`
- **Edit:** `src/lib/copilot-tools.ts` (schemas, TOOL_META, snapshot type, system prompt), `src/lib/copilot-tools-client.ts` (executors, `buildSnapshot`), `src/routes/dashboard.tsx` (KPI strip reads constants), `src/routes/ar.tsx` (extract shared invoice deriver)
