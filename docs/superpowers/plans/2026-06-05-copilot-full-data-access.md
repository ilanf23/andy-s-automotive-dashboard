# Copilot Full Data Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the AI Copilot read-only access to all site data — financials (KPIs, AR aging, open balances, payments), technicians, inventory, parts catalog, labor guide, canned jobs, and fleet integrations — so it can answer any question about the shop in this demo.

**Architecture:** Keep the existing two-channel pattern — an always-on snapshot injected into the system prompt plus on-demand read tools. Add a new `src/lib/financials.ts` as the single source of financial truth (KPI constants extracted from `dashboard.tsx` + a `selectFinancials()` deriver over live shop data and customer balances). Extend `buildSnapshot()` with a financials block and counts; add 8 new read-only tools; update the system prompt.

**Tech Stack:** TypeScript, React, TanStack Start/Router, Vitest, date-fns, OpenAI chat-completions (gpt-4o).

---

## File Structure

- **Create** `src/lib/financials.ts` — KPI constants (`SHOP_KPIS`), shared open-invoice deriver (`deriveOpenInvoices`), and `selectFinancials()`. Single source of financial truth.
- **Create** `src/lib/financials.test.ts` — unit tests for `selectFinancials()` and `deriveOpenInvoices()`.
- **Create** `src/lib/copilot-tools-client.test.ts` — unit tests for the new read-tool executors.
- **Modify** `src/lib/copilot-tools.ts` — new tool schemas, `TOOL_META` entries, `ShopSnapshot` type extension, system prompt update.
- **Modify** `src/lib/copilot-tools-client.ts` — new tool executors, extended `buildSnapshot()`.
- **Modify** `src/routes/dashboard.tsx` — KPI strip reads `SHOP_KPIS` instead of inline literals.
- **Modify** `src/routes/ar.tsx` — invoice derivation comes from the shared `deriveOpenInvoices()` helper.

### Conventions to follow (from existing code)
- Data files live in `src/data/*` and export a typed array (e.g. `export const technicians: Technician[]`).
- Live/mutable shop state comes from `src/lib/shop-store.ts` via `getShopState()`.
- Tool executors live in the `TOOLS` map in `copilot-tools-client.ts`; long lists are capped with `.slice(0, 50)`; misses return `{ error: "..." }`.
- Tool schemas live in `READ_TOOLS`/`WRITE_TOOLS` in `copilot-tools.ts`; every tool also gets a `TOOL_META` entry.
- Tests: Vitest, `node` environment, files named `*.test.ts` under `src/`, `@` alias → `src`. Run with `npm run test`.

---

## Task 1: Create `financials.ts` with KPI constants + shared invoice deriver

**Files:**
- Create: `src/lib/financials.ts`

- [ ] **Step 1: Create the file with KPI constants and the shared open-invoice deriver**

These KPI strings are copied verbatim from `src/routes/dashboard.tsx` (the 5 static tiles in the KPI strip). The invoice deriver is lifted from `src/routes/ar.tsx:50-74` so both that page and the financials summary share one source for the `daysPastDue` date math.

```ts
// src/lib/financials.ts
import { parseISO, differenceInDays } from "date-fns";
import { customers as seedCustomers } from "@/data/customers";
import { getShopState } from "./shop-store";

// ----------------------------------------------------------------------------
// Headline KPIs - single source of truth, also consumed by the dashboard strip.
// Values mirror the demo figures previously hardcoded in dashboard.tsx.
// ----------------------------------------------------------------------------

export type ShopKPI = {
  label: string;
  value: string;
  numeric?: number;
  subValue?: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  target?: string;
};

export const SHOP_KPIS: Record<
  "salesToday" | "aro" | "elr" | "grossProfit" | "hoursSold",
  ShopKPI
> = {
  salesToday: { label: "Sales Today", value: "$14,820", numeric: 14820, delta: "+18% vs yest.", deltaDirection: "up" },
  aro: { label: "ARO", value: "$1,847", numeric: 1847, subValue: "avg", delta: "+$104 MTD", deltaDirection: "up" },
  elr: { label: "ELR", value: "$148", numeric: 148, subValue: "/hr", delta: "target $155", deltaDirection: "down", target: "$155" },
  grossProfit: { label: "GP %", value: "56.4%", numeric: 56.4, subValue: "GP $8,290", delta: "+1.2pts", deltaDirection: "up" },
  hoursSold: { label: "Hours Sold", value: "47.2", numeric: 47.2, subValue: "/ 40.0 billed", delta: "118% eff.", deltaDirection: "up" },
};

// ----------------------------------------------------------------------------
// Open invoices - derived from customers carrying an open balance. Shared by
// ar.tsx (display) and selectFinancials() (aging). The "today" anchor and
// deterministic issued/due dates match ar.tsx's original logic exactly.
// ----------------------------------------------------------------------------

export type OpenInvoice = {
  id: string;
  roId: string;
  customerId: string;
  customer: string;
  customerType: "Fleet" | "Retail";
  amount: number;
  paid: number;
  balance: number;
  issued: string;
  due: string;
  daysPastDue: number;
};

const AR_TODAY = "2026-05-20";

export function deriveOpenInvoices(): OpenInvoice[] {
  const today = parseISO(AR_TODAY);
  return seedCustomers
    .filter((c) => c.openBalance > 0)
    .map((c, i) => {
      const issued = `2026-0${(i % 4) + 2}-${((i * 3) % 28) + 1}`;
      const due = `2026-0${(i % 4) + 3}-${((i * 3) % 28) + 1}`;
      const daysPastDue = Math.max(0, differenceInDays(today, parseISO(due)));
      return {
        id: `INV-${4800 + i}`,
        roId: `${4830 + i}`,
        customerId: c.id,
        customer: c.name,
        customerType: c.type,
        amount: c.openBalance,
        paid: 0,
        balance: c.openBalance,
        issued,
        due,
        daysPastDue,
      };
    });
}
```

- [ ] **Step 2: Verify it typechecks/builds**

Run: `npx tsc --noEmit`
Expected: PASS (no errors). If `tsc` is not wired for the project, run `npm run lint` and expect no errors in `financials.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/financials.ts
git commit -m "feat: add financials KPI constants and shared invoice deriver"
```

---

## Task 2: Add `selectFinancials()` with tests (TDD)

**Files:**
- Modify: `src/lib/financials.ts`
- Test: `src/lib/financials.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/financials.test.ts
import { describe, it, expect } from "vitest";
import { deriveOpenInvoices, selectFinancials, SHOP_KPIS } from "./financials";
import { customers as seedCustomers } from "@/data/customers";

describe("deriveOpenInvoices", () => {
  it("only includes customers with a positive open balance", () => {
    const invoices = deriveOpenInvoices();
    const expectedCount = seedCustomers.filter((c) => c.openBalance > 0).length;
    expect(invoices).toHaveLength(expectedCount);
    expect(invoices.every((i) => i.balance > 0)).toBe(true);
  });
});

describe("selectFinancials", () => {
  it("exposes the headline KPI constants", () => {
    expect(selectFinancials().kpis).toBe(SHOP_KPIS);
  });

  it("totalOpenBalance equals the sum of all open invoice balances", () => {
    const fin = selectFinancials();
    const expected = deriveOpenInvoices().reduce((s, i) => s + i.balance, 0);
    expect(fin.ar.totalOpenBalance).toBe(expected);
  });

  it("aging buckets sum to the total open balance", () => {
    const { aging, totalOpenBalance } = selectFinancials().ar;
    const sum =
      aging.current + aging.d1_30 + aging.d31_60 + aging.d61_90 + aging.d90plus;
    expect(sum).toBe(totalOpenBalance);
  });

  it("pastDueTotal excludes current (not-yet-due) balances", () => {
    const { aging, pastDueTotal } = selectFinancials().ar;
    expect(pastDueTotal).toBe(
      aging.d1_30 + aging.d31_60 + aging.d61_90 + aging.d90plus,
    );
  });

  it("topDebtors are sorted descending by open balance and capped at 5", () => {
    const top = selectFinancials().ar.topDebtors;
    expect(top.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].openBalance).toBeGreaterThanOrEqual(top[i].openBalance);
    }
  });

  it("reports zero payments today on a fresh store", () => {
    const { payments } = selectFinancials();
    expect(payments.countToday).toBe(0);
    expect(payments.totalToday).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- src/lib/financials.test.ts`
Expected: FAIL — `selectFinancials` is not exported / not a function.

- [ ] **Step 3: Implement `selectFinancials()`**

Append to `src/lib/financials.ts`:

```ts
// ----------------------------------------------------------------------------
// Financial summary - headline KPIs plus aggregates derived from live shop
// state (payments, open RO value) and customer balances (AR aging).
// ----------------------------------------------------------------------------

export type FinancialSummary = {
  kpis: typeof SHOP_KPIS;
  ar: {
    totalOpenBalance: number;
    pastDueTotal: number;
    aging: {
      current: number;
      d1_30: number;
      d31_60: number;
      d61_90: number;
      d90plus: number;
    };
    topDebtors: Array<{ customerId: string; name: string; openBalance: number }>;
  };
  payments: { countToday: number; totalToday: number };
  openROValue: number;
};

export function selectFinancials(): FinancialSummary {
  const invoices = deriveOpenInvoices();

  const aging = { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 };
  for (const inv of invoices) {
    const bal = inv.balance ?? 0;
    if (inv.daysPastDue <= 0) aging.current += bal;
    else if (inv.daysPastDue <= 30) aging.d1_30 += bal;
    else if (inv.daysPastDue <= 60) aging.d31_60 += bal;
    else if (inv.daysPastDue <= 90) aging.d61_90 += bal;
    else aging.d90plus += bal;
  }

  const totalOpenBalance = invoices.reduce((s, i) => s + (i.balance ?? 0), 0);
  const pastDueTotal = aging.d1_30 + aging.d31_60 + aging.d61_90 + aging.d90plus;

  const topDebtors = [...invoices]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)
    .map((i) => ({ customerId: i.customerId, name: i.customer, openBalance: i.balance }));

  const st = getShopState();
  const payments = {
    countToday: st.payments.length,
    totalToday: st.payments.reduce((s, p) => s + (p.amount ?? 0), 0),
  };

  const openROValue = st.repairOrders
    .filter((r) => r.status !== "completed")
    .reduce((s, r) => s + (r.total ?? 0), 0);

  return { kpis: SHOP_KPIS, ar: { totalOpenBalance, pastDueTotal, aging, topDebtors }, payments, openROValue };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- src/lib/financials.test.ts`
Expected: PASS (all assertions green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/financials.ts src/lib/financials.test.ts
git commit -m "feat: add selectFinancials deriver with tests"
```

---

## Task 3: Refactor `ar.tsx` to use the shared invoice deriver

**Files:**
- Modify: `src/routes/ar.tsx` (imports near top; `invoices` useMemo at lines ~50-74; local `Invoice` type at lines ~30-44)

- [ ] **Step 1: Replace the local invoice derivation with the shared helper**

Add the import alongside the other `@/lib` imports near the top of `ar.tsx`:

```ts
import { deriveOpenInvoices, type OpenInvoice } from "@/lib/financials";
```

Delete the local `type Invoice = { ... }` block (lines ~30-44) and replace its usages with `OpenInvoice`. Replace the `invoices` useMemo body (lines ~50-74) with:

```ts
  const invoices: OpenInvoice[] = useMemo(() => deriveOpenInvoices(), []);
```

Leave everything else (the `buckets` useMemo at lines ~77-87, `totalOpen`, `pastDue`, tabs, filtering, JSX) unchanged — `OpenInvoice` has the same fields the rest of the file already reads (`balance`, `daysPastDue`, `customer`, `customerType`, `id`, etc.). Remove now-unused imports (`parseISO`, `differenceInDays`, the `customers` seed import) only if nothing else in the file uses them; otherwise leave them.

- [ ] **Step 2: Verify nothing else broke — typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS. Fix any "unused import" lint errors by removing the dead imports flagged in `ar.tsx`.

- [ ] **Step 3: Manually verify the AR page is unchanged**

Run: `npm run dev`, open `/ar`. Expected: the Open / Past-Due / Statements tabs, counts, aging totals, and invoice rows look identical to before the change.

- [ ] **Step 4: Commit**

```bash
git add src/routes/ar.tsx
git commit -m "refactor: ar page uses shared deriveOpenInvoices helper"
```

---

## Task 4: Refactor `dashboard.tsx` KPI strip to read `SHOP_KPIS`

**Files:**
- Modify: `src/routes/dashboard.tsx` (KPI strip array, lines ~499-554; imports near top)

- [ ] **Step 1: Import the constants**

Add near the other `@/lib` imports in `dashboard.tsx`:

```ts
import { SHOP_KPIS } from "@/lib/financials";
```

- [ ] **Step 2: Replace the 5 hardcoded KPI literals with constant references**

In the KPI strip array (lines ~499-554), replace the first five object literals (`Sales Today`, `ARO`, `ELR`, `GP %`, `Hours Sold`) with values pulled from `SHOP_KPIS`. Icons and `accent` are presentational and stay in the component. The sixth tile, "Cars In Shop", stays exactly as-is (it is computed live from `carsInShop`/`openROs`). Result:

```tsx
        {(
          [
            {
              label: SHOP_KPIS.salesToday.label,
              value: SHOP_KPIS.salesToday.value,
              delta: SHOP_KPIS.salesToday.delta,
              deltaDirection: SHOP_KPIS.salesToday.deltaDirection,
              icon: DollarSign,
              accent: "success" as const,
            },
            {
              label: SHOP_KPIS.aro.label,
              value: SHOP_KPIS.aro.value,
              subValue: SHOP_KPIS.aro.subValue,
              delta: SHOP_KPIS.aro.delta,
              deltaDirection: SHOP_KPIS.aro.deltaDirection,
              icon: Gauge,
              accent: "ink" as const,
            },
            {
              label: SHOP_KPIS.elr.label,
              value: SHOP_KPIS.elr.value,
              subValue: SHOP_KPIS.elr.subValue,
              delta: SHOP_KPIS.elr.delta,
              deltaDirection: SHOP_KPIS.elr.deltaDirection,
              icon: TrendingUp,
              accent: "warning" as const,
            },
            {
              label: SHOP_KPIS.grossProfit.label,
              value: SHOP_KPIS.grossProfit.value,
              subValue: SHOP_KPIS.grossProfit.subValue,
              delta: SHOP_KPIS.grossProfit.delta,
              deltaDirection: SHOP_KPIS.grossProfit.deltaDirection,
              icon: Percent,
              accent: "success" as const,
            },
            {
              label: SHOP_KPIS.hoursSold.label,
              value: SHOP_KPIS.hoursSold.value,
              subValue: SHOP_KPIS.hoursSold.subValue,
              delta: SHOP_KPIS.hoursSold.delta,
              deltaDirection: SHOP_KPIS.hoursSold.deltaDirection,
              icon: Clock,
              accent: "ink" as const,
            },
            {
              label: "Cars In Shop",
              value: String(carsInShop),
              subValue: `of 12 bays`,
              delta: `${openROs} open ROs`,
              deltaDirection: "flat" as const,
              icon: Truck,
              accent: "default" as const,
            },
          ]
        ).map((kpi) => (
```

- [ ] **Step 3: Verify typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 4: Manually verify the dashboard renders identically**

Run: `npm run dev`, open `/dashboard`. Expected: the 6-tile KPI strip shows the same labels, values, sub-values, and deltas as before.

- [ ] **Step 5: Commit**

```bash
git add src/routes/dashboard.tsx
git commit -m "refactor: dashboard KPI strip reads SHOP_KPIS constants"
```

---

## Task 5: Add new read-tool schemas + metadata

**Files:**
- Modify: `src/lib/copilot-tools.ts` (`READ_TOOLS` array; `TOOL_META` map)

- [ ] **Step 1: Add the 8 new tool schemas to `READ_TOOLS`**

Insert these entries into the `READ_TOOLS` array (after the existing `get_today_schedule` entry, before the closing `]`):

```ts
  {
    type: "function",
    function: {
      name: "get_financial_summary",
      description:
        "Get the shop's financial summary: headline KPIs (Sales Today, ARO, ELR, GP%, Hours Sold), AR aging buckets, total open balance, total past-due, top debtors, payments taken today, and total open repair-order value.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_ar_aging",
      description:
        "List open AR invoices, optionally filtered to an aging bucket: 'current', 'd1_30', 'd31_60', 'd61_90', or 'd90plus'. Each invoice includes customer, balance, and daysPastDue.",
      parameters: {
        type: "object",
        properties: {
          bucket: {
            type: "string",
            description: "Optional aging bucket filter.",
            enum: ["current", "d1_30", "d31_60", "d61_90", "d90plus"],
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_technicians",
      description:
        "List all technicians with their role, hourly rate, and utilization percentage.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "list_inventory",
      description:
        "List inventory items. Optionally filter to lowStockOnly (onHand at or below reorder point) or by category (e.g. 'Filters', 'Brakes').",
      parameters: {
        type: "object",
        properties: {
          lowStockOnly: { type: "boolean" },
          category: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_parts",
      description:
        "Search the parts catalog. Optionally pass a search string (matches description or part number) and/or a category. Returns up to 50 entries.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string" },
          category: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_labor_guide",
      description:
        "Look up flat-rate labor times. Optionally pass a search string (matches description or job code) and/or a category. Returns jobCode, description, laborHours, and skillLevel.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string" },
          category: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_jobs",
      description:
        "List canned jobs (pre-built service packages) with standard labor hours and default labor cost.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "list_fleet_integrations",
      description:
        "List connected fleet platforms (e.g. Fleetio, Holman) with connection status, active job count, last sync time, and the customers routed through each.",
      parameters: { type: "object", properties: {} },
    },
  },
```

- [ ] **Step 2: Add `TOOL_META` entries**

In the `TOOL_META` map, add these to the "Reads" section (all read-only, no approval):

```ts
  get_financial_summary: { requiresApproval: false },
  get_ar_aging: { requiresApproval: false },
  list_technicians: { requiresApproval: false },
  list_inventory: { requiresApproval: false },
  list_parts: { requiresApproval: false },
  get_labor_guide: { requiresApproval: false },
  list_jobs: { requiresApproval: false },
  list_fleet_integrations: { requiresApproval: false },
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/copilot-tools.ts
git commit -m "feat: add read-tool schemas for financials and operational data"
```

---

## Task 6: Implement the new tool executors with tests (TDD)

**Files:**
- Modify: `src/lib/copilot-tools-client.ts` (imports near top; `TOOLS` map)
- Test: `src/lib/copilot-tools-client.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/copilot-tools-client.test.ts
import { describe, it, expect } from "vitest";
import { TOOLS } from "./copilot-tools-client";

const run = (name: string, args: Record<string, unknown> = {}) =>
  TOOLS[name].execute(args, { navigate: () => {} });

describe("new read-tool executors", () => {
  it("get_financial_summary returns KPIs and AR aggregates", () => {
    const r = run("get_financial_summary") as any;
    expect(r.kpis).toBeDefined();
    expect(typeof r.ar.totalOpenBalance).toBe("number");
    expect(r.ar.aging).toHaveProperty("d90plus");
  });

  it("get_ar_aging filters to a bucket", () => {
    const all = run("get_ar_aging") as any[];
    const pastDue = run("get_ar_aging", { bucket: "d90plus" }) as any[];
    expect(Array.isArray(all)).toBe(true);
    expect(pastDue.every((i) => i.daysPastDue > 90)).toBe(true);
  });

  it("list_technicians returns techs with utilization", () => {
    const r = run("list_technicians") as any[];
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]).toHaveProperty("utilization");
  });

  it("list_inventory respects lowStockOnly", () => {
    const low = run("list_inventory", { lowStockOnly: true }) as any[];
    expect(low.every((i) => i.onHand <= i.reorderPoint)).toBe(true);
  });

  it("list_parts caps results at 50 and filters by search", () => {
    const r = run("list_parts", { search: "filter" }) as any[];
    expect(r.length).toBeLessThanOrEqual(50);
  });

  it("get_labor_guide returns labor hours", () => {
    const r = run("get_labor_guide", { search: "brake" }) as any[];
    expect(r.every((e) => typeof e.laborHours === "number")).toBe(true);
  });

  it("list_jobs and list_fleet_integrations return arrays", () => {
    expect(Array.isArray(run("list_jobs"))).toBe(true);
    expect(Array.isArray(run("list_fleet_integrations"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- src/lib/copilot-tools-client.test.ts`
Expected: FAIL — `TOOLS["get_financial_summary"]` is undefined.

- [ ] **Step 3: Add imports and executors**

Add these imports near the top of `copilot-tools-client.ts` (alongside the existing `@/data/*` imports):

```ts
import { selectFinancials, deriveOpenInvoices } from "./financials";
import { technicians as seedTechnicians } from "@/data/technicians";
import { inventory as seedInventory } from "@/data/inventory";
import { partsCatalog } from "@/data/partsCatalog";
import { laborGuide } from "@/data/laborGuide";
import { jobs as seedJobs } from "@/data/jobs";
import { fleetPlatforms } from "@/data/fleetPlatforms";
```

> Note: confirm each export name against its data file. As of this writing the files export `technicians`, `inventory`, `partsCatalog`, `laborGuide`, `jobs`, and `fleetPlatforms`. If any differs, match the actual export.

Add these executors into the `TOOLS` map, in the READS section (after `get_today_schedule`):

```ts
  get_financial_summary: {
    requiresApproval: meta("get_financial_summary").requiresApproval,
    execute: () => selectFinancials(),
  },

  get_ar_aging: {
    requiresApproval: meta("get_ar_aging").requiresApproval,
    execute: (args) => {
      const { bucket } = args as { bucket?: string };
      const inBucket = (d: number) => {
        switch (bucket) {
          case "current": return d <= 0;
          case "d1_30": return d > 0 && d <= 30;
          case "d31_60": return d > 30 && d <= 60;
          case "d61_90": return d > 60 && d <= 90;
          case "d90plus": return d > 90;
          default: return true;
        }
      };
      return deriveOpenInvoices()
        .filter((i) => inBucket(i.daysPastDue))
        .slice(0, 50)
        .map((i) => ({
          id: i.id,
          customerId: i.customerId,
          customer: i.customer,
          customerType: i.customerType,
          balance: i.balance,
          due: i.due,
          daysPastDue: i.daysPastDue,
        }));
    },
  },

  list_technicians: {
    requiresApproval: meta("list_technicians").requiresApproval,
    execute: () =>
      seedTechnicians.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        hourlyRate: t.hourlyRate,
        utilization: t.utilization,
      })),
  },

  list_inventory: {
    requiresApproval: meta("list_inventory").requiresApproval,
    execute: (args) => {
      const { lowStockOnly, category } = args as {
        lowStockOnly?: boolean;
        category?: string;
      };
      return seedInventory
        .filter((it) => (category ? it.category === category : true))
        .filter((it) => (lowStockOnly ? it.onHand <= it.reorderPoint : true))
        .slice(0, 50)
        .map((it) => ({
          id: it.id,
          partNumber: it.partNumber,
          description: it.description,
          vendor: it.vendor,
          onHand: it.onHand,
          reorderPoint: it.reorderPoint,
          cost: it.cost,
          category: it.category,
        }));
    },
  },

  list_parts: {
    requiresApproval: meta("list_parts").requiresApproval,
    execute: (args) => {
      const { search, category } = args as { search?: string; category?: string };
      const needle = search?.toLowerCase();
      return partsCatalog
        .filter((p) => (category ? p.category === category : true))
        .filter((p) =>
          needle
            ? p.description.toLowerCase().includes(needle) ||
              p.partNumber.toLowerCase().includes(needle)
            : true,
        )
        .slice(0, 50)
        .map((p) => ({
          id: p.id,
          partNumber: p.partNumber,
          description: p.description,
          category: p.category,
          vendor: p.vendor,
        }));
    },
  },

  get_labor_guide: {
    requiresApproval: meta("get_labor_guide").requiresApproval,
    execute: (args) => {
      const { search, category } = args as { search?: string; category?: string };
      const needle = search?.toLowerCase();
      return laborGuide
        .filter((e) => (category ? e.category === category : true))
        .filter((e) =>
          needle
            ? e.description.toLowerCase().includes(needle) ||
              e.jobCode.toLowerCase().includes(needle)
            : true,
        )
        .slice(0, 50)
        .map((e) => ({
          id: e.id,
          jobCode: e.jobCode,
          category: e.category,
          description: e.description,
          laborHours: e.laborHours,
          skillLevel: e.skillLevel,
        }));
    },
  },

  list_jobs: {
    requiresApproval: meta("list_jobs").requiresApproval,
    execute: () =>
      seedJobs.map((j) => ({
        id: j.id,
        name: j.name,
        category: j.category,
        standardLaborHours: j.standardLaborHours,
        defaultLaborCost: j.defaultLaborCost,
        applicableVehicles: j.applicableVehicles,
      })),
  },

  list_fleet_integrations: {
    requiresApproval: meta("list_fleet_integrations").requiresApproval,
    execute: () =>
      fleetPlatforms.map((f) => ({
        id: f.id,
        name: f.name,
        status: f.status,
        activeJobs: f.activeJobs,
        lastSync: f.lastSync,
        customers: f.customers,
      })),
  },
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- src/lib/copilot-tools-client.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/copilot-tools-client.ts src/lib/copilot-tools-client.test.ts
git commit -m "feat: implement read-tool executors for financials and operational data"
```

---

## Task 7: Extend the snapshot with financials + counts

**Files:**
- Modify: `src/lib/copilot-tools.ts` (`ShopSnapshot` type)
- Modify: `src/lib/copilot-tools-client.ts` (`buildSnapshot()`; imports if not already present from Task 6)

- [ ] **Step 1: Extend the `ShopSnapshot` type**

In `copilot-tools.ts`, add these fields to the `ShopSnapshot` type (after `todaySchedule`):

```ts
  financials: {
    kpis: {
      salesToday: string;
      aro: string;
      elr: string;
      grossProfitPct: string;
      hoursSold: string;
    };
    arOpenTotal: number;
    arPastDueTotal: number;
    topDebtors: Array<{ name: string; openBalance: number }>;
  };
  counts: {
    technicians: number;
    inventoryItems: number;
    lowStockItems: number;
    cannedJobs: number;
    fleetIntegrations: number;
  };
```

- [ ] **Step 2: Populate them in `buildSnapshot()`**

In `copilot-tools-client.ts`, add to the object returned by `buildSnapshot()` (the new tool imports from Task 6 — `selectFinancials`, `seedTechnicians`, `seedInventory`, `seedJobs`, `fleetPlatforms` — are reused here):

```ts
    financials: (() => {
      const fin = selectFinancials();
      return {
        kpis: {
          salesToday: fin.kpis.salesToday.value,
          aro: fin.kpis.aro.value,
          elr: fin.kpis.elr.value,
          grossProfitPct: fin.kpis.grossProfit.value,
          hoursSold: fin.kpis.hoursSold.value,
        },
        arOpenTotal: fin.ar.totalOpenBalance,
        arPastDueTotal: fin.ar.pastDueTotal,
        topDebtors: fin.ar.topDebtors
          .slice(0, 3)
          .map((d) => ({ name: d.name, openBalance: d.openBalance })),
      };
    })(),
    counts: {
      technicians: seedTechnicians.length,
      inventoryItems: seedInventory.length,
      lowStockItems: seedInventory.filter((it) => it.onHand <= it.reorderPoint).length,
      cannedJobs: seedJobs.length,
      fleetIntegrations: fleetPlatforms.length,
    },
```

- [ ] **Step 3: Verify typecheck — the `ShopSnapshot` type and `buildSnapshot()` return must agree**

Run: `npx tsc --noEmit`
Expected: PASS. (A mismatch between the type and the returned object surfaces here.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/copilot-tools.ts src/lib/copilot-tools-client.ts
git commit -m "feat: add financials block and domain counts to copilot snapshot"
```

---

## Task 8: Update the system prompt

**Files:**
- Modify: `src/lib/copilot-tools.ts` (`SYSTEM_PROMPT`)

- [ ] **Step 1: Expand the prompt to advertise the new read access and glossary**

Replace the `SYSTEM_PROMPT` export with:

```ts
export const SYSTEM_PROMPT = `You are the AI Copilot for Andy's Automotive - a heavy-duty truck repair shop.
Your job: help the service advisor and shop manager run their day. You can READ all shop data and take a defined set of real actions (creating repair orders, sending estimates, taking payments, etc.) through the available tools.

You can read the full operation, including:
- Repair orders, customers, vehicles, estimates, inspections, today's schedule.
- Financials: headline KPIs (Sales Today, ARO, ELR, GP%, Hours Sold), AR aging buckets, total open balance, past-due totals, top debtors, payments taken today, and open repair-order value (get_financial_summary, get_ar_aging).
- Operations: technicians and utilization, inventory and low-stock items, the parts catalog, the flat-rate labor guide, canned jobs, and connected fleet platforms.

Rules:
- Be concise. Two sentences when one will do.
- When you take an action, say what you did briefly.
- For write actions, the system will pause for the user to approve before executing - that's expected, don't apologize for it.
- All financial and operational lookups are read-only; there is no approval step for reads.
- If you don't have enough info, ask one short clarifying question.
- Use the customer's preferred terminology (RO = repair order, ARO = avg repair order, ELR = effective labor rate, GP = gross profit, DVI = digital vehicle inspection, AR = accounts receivable; AR aging buckets are current / 1-30 / 31-60 / 61-90 / 90+ days past due).
- Never invent IDs, prices, balances, or KPI numbers. Read them via the tools or the CURRENT SHOP STATE snapshot you were given.
- Prefer the snapshot for quick headline lookups (KPIs, open AR total, counts); use tools when you need the full record, a filtered list, or to take an action.`;
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/copilot-tools.ts
git commit -m "feat: expand copilot system prompt for full read access"
```

---

## Task 9: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: PASS — all tests including `financials.test.ts` and `copilot-tools-client.test.ts`.

- [ ] **Step 2: Typecheck + lint the whole project**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS, no errors.

- [ ] **Step 3: Manual smoke test of the copilot in the running app**

Run: `npm run dev`, open `/copilot` (ensure `OPENAI_API_KEY` is set in `.env.local`). Ask each, and confirm the copilot answers from real data without inventing numbers:
- "How's the shop doing financially today?" → cites KPIs / AR open total from the snapshot.
- "Which customers are more than 90 days past due?" → calls `get_ar_aging` with `d90plus`.
- "What's in stock that's low?" → calls `list_inventory` with `lowStockOnly`.
- "What's the flat-rate time on a front brake job?" → calls `get_labor_guide`.
- "Who are our technicians and how busy are they?" → calls `list_technicians`.
- "Which fleet platforms are connected?" → calls `list_fleet_integrations`.

Expected: each answer reflects the seed/live data; no fabricated figures.

- [ ] **Step 4: Final commit (if any lint/format fixups were needed)**

```bash
git add -A
git commit -m "chore: verification fixups for copilot full data access"
```

(Skip if the working tree is clean.)

---

## Self-Review Notes (for the implementer)

- **Spec coverage:** §5a KPI constants → Task 1; §5b `selectFinancials` → Task 2; §6 dashboard refactor → Task 4; AR shared deriver (§5b note) → Tasks 1+3; §7 read tools → Tasks 5-6; §8 snapshot → Task 7; §9 system prompt → Task 8; §12 testing → Tasks 2, 6, 9.
- **Read-only guarantee (§3):** every new tool has `requiresApproval: false` and only reads; no `shop-store` mutators are called.
- **Type consistency:** aging bucket keys are `current / d1_30 / d31_60 / d61_90 / d90plus` everywhere (financials.ts, the `get_ar_aging` filter, tests). Snapshot KPI key is `grossProfitPct` (string display) while the `SHOP_KPIS` source key is `grossProfit` — intentional and mapped explicitly in Task 7 Step 2.
- **Before coding Task 6:** verify the actual export names in each `src/data/*` file match the imports (noted inline).
