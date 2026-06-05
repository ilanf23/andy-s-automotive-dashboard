# Customizable KPI System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dashboard's six hardcoded KPI tiles with a customizable strip of 4–5 KPIs (from a catalog of 12), computed from a deterministic data engine, filterable by the owner role and a Today/Week/Month timeline.

**Architecture:** A pure `kpi-engine` produces per-period financial primitives (seeded, deterministic). A `kpi-registry` maps those primitives into 12 formatted KPI results. A `kpi-prefs` external store (localStorage-backed, same pattern as `shop-store.ts`) holds the 4–5 selected KPI ids. A `KpiStrip` renders selected KPIs via the existing `MetricTile`; a `KpiCustomizer` popover (owner-only) edits the selection. The dashboard gets a timeline `ToggleGroup` bound to existing `dateRange` state.

**Tech Stack:** React 18, TanStack Router, TypeScript, Tailwind, Radix UI primitives (`popover`, `checkbox`, `toggle-group`), lucide-react icons, `useSyncExternalStore`. Tests run via Bun's built-in test runner (`bun test`) — no new dependencies.

---

## File Structure

- Create: `src/lib/kpi-engine.ts` — `Timeframe`, `PeriodFinancials`, seeded generators.
- Create: `src/lib/kpi-engine.test.ts` — engine determinism + scaling tests.
- Create: `src/lib/kpi-registry.ts` — `KpiDef`, `KpiResult`, the 12 KPI definitions, formatters.
- Create: `src/lib/kpi-registry.test.ts` — formula/consistency tests.
- Create: `src/lib/kpi-prefs.ts` — selection store + `useKpiPrefs()` hook.
- Create: `src/lib/kpi-prefs.test.ts` — cap (min 4 / max 5) + default tests.
- Create: `src/components/shop/KpiStrip.tsx` — renders selected KPIs.
- Create: `src/components/shop/KpiCustomizer.tsx` — owner-only selection popover.
- Modify: `src/routes/dashboard.tsx` — KPI strip header (timeline + customizer), replace hardcoded array (`499-554`), remove the cycling date button (`609-622`).

---

## Task 1: KPI Engine

**Files:**
- Create: `src/lib/kpi-engine.ts`
- Test: `src/lib/kpi-engine.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/kpi-engine.test.ts
import { test, expect } from "bun:test";
import {
  getPeriodFinancials,
  getPreviousPeriodFinancials,
  type Timeframe,
} from "@/lib/kpi-engine";

const TIMEFRAMES: Timeframe[] = ["Today", "Week", "Month"];

test("getPeriodFinancials is deterministic per timeframe", () => {
  for (const tf of TIMEFRAMES) {
    expect(getPeriodFinancials(tf)).toEqual(getPeriodFinancials(tf));
  }
});

test("all financial primitives are positive and revenue exceeds cost", () => {
  for (const tf of TIMEFRAMES) {
    const f = getPeriodFinancials(tf);
    for (const v of Object.values(f)) expect(v).toBeGreaterThan(0);
    expect(f.partsRevenue).toBeGreaterThan(f.partsCost);
    expect(f.laborRevenue).toBeGreaterThan(f.laborCost);
    expect(f.revenue).toBeGreaterThan(0);
    expect(f.soldHours).toBeGreaterThan(0);
  }
});

test("volume scales Month > Week > Today", () => {
  expect(getPeriodFinancials("Month").revenue).toBeGreaterThan(
    getPeriodFinancials("Week").revenue,
  );
  expect(getPeriodFinancials("Week").revenue).toBeGreaterThan(
    getPeriodFinancials("Today").revenue,
  );
});

test("previous period differs from current but stays deterministic", () => {
  for (const tf of TIMEFRAMES) {
    expect(getPreviousPeriodFinancials(tf)).toEqual(
      getPreviousPeriodFinancials(tf),
    );
    expect(getPreviousPeriodFinancials(tf).revenue).not.toBe(
      getPeriodFinancials(tf).revenue,
    );
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/kpi-engine.test.ts`
Expected: FAIL — `Cannot find module '@/lib/kpi-engine'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/kpi-engine.ts
export type Timeframe = "Today" | "Week" | "Month";

export type PeriodFinancials = {
  partsRevenue: number;
  partsCost: number;
  tireRevenue: number;
  tireCost: number;
  batteryRevenue: number;
  batteryCost: number;
  laborRevenue: number;
  laborCost: number;
  soldHours: number;
  actualHours: number;
  buildHours: number;
  roCount: number;
  writtenRoCount: number;
  revenue: number;
  writtenRevenue: number;
};

// Deterministic PRNG so a given seed always yields the same sequence.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Number of working days each timeframe represents.
const DAYS: Record<Timeframe, number> = { Today: 1, Week: 6, Month: 26 };

// Distinct base seed per timeframe + offset so "previous" differs from "current".
const SEED: Record<Timeframe, number> = { Today: 101, Week: 202, Month: 303 };

function build(tf: Timeframe, seedOffset: number): PeriodFinancials {
  const rand = mulberry32(SEED[tf] + seedOffset);
  const days = DAYS[tf];
  // jitter in +/-8% so periods look organic but stay deterministic.
  const j = () => 0.92 + rand() * 0.16;

  // Per-day baselines (single-day shop economics), scaled by days.
  const partsRevenue = Math.round(3800 * days * j());
  const partsCost = Math.round(partsRevenue * (0.58 + rand() * 0.04));
  const tireRevenue = Math.round(900 * days * j());
  const tireCost = Math.round(tireRevenue * (0.78 + rand() * 0.04));
  const batteryRevenue = Math.round(420 * days * j());
  const batteryCost = Math.round(batteryRevenue * (0.7 + rand() * 0.04));
  const laborRevenue = Math.round(6100 * days * j());
  const laborCost = Math.round(laborRevenue * (0.34 + rand() * 0.04));

  const soldHours = Math.round(41 * days * j() * 10) / 10;
  const actualHours = Math.round((soldHours / (1.12 + rand() * 0.1)) * 10) / 10;
  const buildHours = Math.round((soldHours * (0.9 + rand() * 0.1)) * 10) / 10;

  const roCount = Math.max(1, Math.round(8 * days * j()));
  const writtenRoCount = roCount + Math.max(1, Math.round(2 * days * j()));

  const revenue =
    partsRevenue + tireRevenue + batteryRevenue + laborRevenue;
  const writtenRevenue = Math.round(revenue * (1.18 + rand() * 0.1));

  return {
    partsRevenue,
    partsCost,
    tireRevenue,
    tireCost,
    batteryRevenue,
    batteryCost,
    laborRevenue,
    laborCost,
    soldHours,
    actualHours,
    buildHours,
    roCount,
    writtenRoCount,
    revenue,
    writtenRevenue,
  };
}

export function getPeriodFinancials(tf: Timeframe): PeriodFinancials {
  return build(tf, 0);
}

export function getPreviousPeriodFinancials(tf: Timeframe): PeriodFinancials {
  return build(tf, 7777);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/kpi-engine.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/kpi-engine.ts src/lib/kpi-engine.test.ts
git commit -m "feat: add deterministic KPI financial engine"
```

---

## Task 2: KPI Registry

**Files:**
- Create: `src/lib/kpi-registry.ts`
- Test: `src/lib/kpi-registry.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/kpi-registry.test.ts
import { test, expect } from "bun:test";
import { KPI_REGISTRY, getKpiById } from "@/lib/kpi-registry";
import { getPeriodFinancials, getPreviousPeriodFinancials } from "@/lib/kpi-engine";

test("registry has all 12 KPIs with unique ids", () => {
  expect(KPI_REGISTRY).toHaveLength(12);
  const ids = KPI_REGISTRY.map((k) => k.id);
  expect(new Set(ids).size).toBe(12);
});

test("expected ids are present", () => {
  const ids = KPI_REGISTRY.map((k) => k.id).sort();
  expect(ids).toEqual(
    [
      "aro",
      "awro",
      "cost-per-build-hr",
      "elr",
      "gp-dollars",
      "gp-per-hr",
      "hours-per-ro",
      "labor-gp",
      "parts-gp",
      "proficiency",
      "sold-hours",
      "total-gp",
    ].sort(),
  );
});

test("every KPI computes a formatted, non-empty value", () => {
  const curr = getPeriodFinancials("Month");
  const prev = getPreviousPeriodFinancials("Month");
  for (const kpi of KPI_REGISTRY) {
    const r = kpi.compute(curr, prev);
    expect(r.value.length).toBeGreaterThan(0);
    expect(["up", "down", "flat"]).toContain(r.deltaDirection);
  }
});

test("parts GP% equals the parts-only gross-profit ratio", () => {
  const curr = getPeriodFinancials("Month");
  const prev = getPreviousPeriodFinancials("Month");
  const expected =
    ((curr.partsRevenue - curr.partsCost) / curr.partsRevenue) * 100;
  const r = getKpiById("parts-gp")!.compute(curr, prev);
  expect(r.value).toBe(`${expected.toFixed(1)}%`);
});

test("delta direction reflects current vs previous", () => {
  const curr = getPeriodFinancials("Week");
  const prev = getPreviousPeriodFinancials("Week");
  const r = getKpiById("gp-dollars")!.compute(curr, prev);
  const currGP =
    curr.partsRevenue - curr.partsCost +
    (curr.laborRevenue - curr.laborCost) +
    (curr.tireRevenue - curr.tireCost) +
    (curr.batteryRevenue - curr.batteryCost);
  const prevGP =
    prev.partsRevenue - prev.partsCost +
    (prev.laborRevenue - prev.laborCost) +
    (prev.tireRevenue - prev.tireCost) +
    (prev.batteryRevenue - prev.batteryCost);
  expect(r.deltaDirection).toBe(currGP >= prevGP ? "up" : "down");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/kpi-registry.test.ts`
Expected: FAIL — `Cannot find module '@/lib/kpi-registry'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/kpi-registry.ts
import type { LucideIcon } from "lucide-react";
import {
  Percent,
  DollarSign,
  Wrench,
  Package,
  Clock,
  Gauge,
  TrendingUp,
  Activity,
  FileText,
  Timer,
} from "lucide-react";
import type { PeriodFinancials } from "@/lib/kpi-engine";

export type KpiResult = {
  value: string;
  subValue?: string;
  delta: string;
  deltaDirection: "up" | "down" | "flat";
};

export type KpiDef = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: "default" | "success" | "warning" | "danger" | "ink";
  compute: (curr: PeriodFinancials, prev: PeriodFinancials) => KpiResult;
};

// ---- formatting helpers -----------------------------------------------------
const usd = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (n: number) => `${n.toFixed(1)}%`;
const hrs = (n: number) => n.toFixed(1);

function dir(curr: number, prev: number): "up" | "down" | "flat" {
  if (Math.abs(curr - prev) < 1e-9) return "flat";
  return curr > prev ? "up" : "down";
}

// percentage-point delta for ratio KPIs
function ptsDelta(curr: number, prev: number): string {
  const d = curr - prev;
  return `${d >= 0 ? "+" : ""}${d.toFixed(1)}pts`;
}

// percent-change delta for absolute KPIs
function pctChangeDelta(curr: number, prev: number): string {
  if (prev === 0) return "—";
  const d = ((curr - prev) / prev) * 100;
  return `${d >= 0 ? "+" : ""}${d.toFixed(0)}% vs prev`;
}

// ---- shared derivations -----------------------------------------------------
const partsGP = (f: PeriodFinancials) =>
  ((f.partsRevenue - f.partsCost) / f.partsRevenue) * 100;
const laborGP = (f: PeriodFinancials) =>
  ((f.laborRevenue - f.laborCost) / f.laborRevenue) * 100;
const totalGPdollars = (f: PeriodFinancials) =>
  f.partsRevenue - f.partsCost +
  (f.laborRevenue - f.laborCost) +
  (f.tireRevenue - f.tireCost) +
  (f.batteryRevenue - f.batteryCost);
const totalGPpct = (f: PeriodFinancials) =>
  (totalGPdollars(f) / f.revenue) * 100;
const totalCost = (f: PeriodFinancials) =>
  f.partsCost + f.laborCost + f.tireCost + f.batteryCost;

export const KPI_REGISTRY: KpiDef[] = [
  {
    id: "parts-gp",
    label: "Parts GP %",
    description: "Parts gross profit %, excluding tires and batteries.",
    icon: Package,
    accent: "success",
    compute: (c, p) => ({
      value: pct(partsGP(c)),
      subValue: "excl. tires/batt",
      delta: ptsDelta(partsGP(c), partsGP(p)),
      deltaDirection: dir(partsGP(c), partsGP(p)),
    }),
  },
  {
    id: "labor-gp",
    label: "Labor GP %",
    description: "Labor gross profit %.",
    icon: Wrench,
    accent: "success",
    compute: (c, p) => ({
      value: pct(laborGP(c)),
      delta: ptsDelta(laborGP(c), laborGP(p)),
      deltaDirection: dir(laborGP(c), laborGP(p)),
    }),
  },
  {
    id: "total-gp",
    label: "Total GP %",
    description: "Blended gross profit % across parts, labor, tires, batteries.",
    icon: Percent,
    accent: "success",
    compute: (c, p) => ({
      value: pct(totalGPpct(c)),
      subValue: usd(totalGPdollars(c)) + " GP",
      delta: ptsDelta(totalGPpct(c), totalGPpct(p)),
      deltaDirection: dir(totalGPpct(c), totalGPpct(p)),
    }),
  },
  {
    id: "gp-dollars",
    label: "GP $",
    description: "Total gross profit dollars.",
    icon: DollarSign,
    accent: "success",
    compute: (c, p) => ({
      value: usd(totalGPdollars(c)),
      delta: pctChangeDelta(totalGPdollars(c), totalGPdollars(p)),
      deltaDirection: dir(totalGPdollars(c), totalGPdollars(p)),
    }),
  },
  {
    id: "hours-per-ro",
    label: "Hours / RO",
    description: "Sold hours per repair order.",
    icon: Clock,
    accent: "ink",
    compute: (c, p) => {
      const cur = c.soldHours / c.roCount;
      const pre = p.soldHours / p.roCount;
      return {
        value: hrs(cur),
        subValue: "hrs/RO",
        delta: pctChangeDelta(cur, pre),
        deltaDirection: dir(cur, pre),
      };
    },
  },
  {
    id: "aro",
    label: "ARO",
    description: "Average repair order (posted revenue / RO count).",
    icon: Gauge,
    accent: "ink",
    compute: (c, p) => {
      const cur = c.revenue / c.roCount;
      const pre = p.revenue / p.roCount;
      return {
        value: usd(cur),
        subValue: "avg",
        delta: pctChangeDelta(cur, pre),
        deltaDirection: dir(cur, pre),
      };
    },
  },
  {
    id: "awro",
    label: "Avg Written RO",
    description: "Average written repair order (written revenue / written RO count).",
    icon: FileText,
    accent: "ink",
    compute: (c, p) => {
      const cur = c.writtenRevenue / c.writtenRoCount;
      const pre = p.writtenRevenue / p.writtenRoCount;
      return {
        value: usd(cur),
        subValue: "written",
        delta: pctChangeDelta(cur, pre),
        deltaDirection: dir(cur, pre),
      };
    },
  },
  {
    id: "sold-hours",
    label: "Sold Hours",
    description: "Total billed/sold labor hours.",
    icon: Clock,
    accent: "ink",
    compute: (c, p) => ({
      value: hrs(c.soldHours),
      subValue: `/ ${hrs(c.actualHours)} actual`,
      delta: pctChangeDelta(c.soldHours, p.soldHours),
      deltaDirection: dir(c.soldHours, p.soldHours),
    }),
  },
  {
    id: "proficiency",
    label: "Proficiency",
    description: "Sold hours / actual hours worked.",
    icon: Activity,
    accent: "success",
    compute: (c, p) => {
      const cur = (c.soldHours / c.actualHours) * 100;
      const pre = (p.soldHours / p.actualHours) * 100;
      return {
        value: pct(cur),
        subValue: "eff.",
        delta: ptsDelta(cur, pre),
        deltaDirection: dir(cur, pre),
      };
    },
  },
  {
    id: "elr",
    label: "ELR",
    description: "Effective labor rate (labor revenue / sold hours).",
    icon: TrendingUp,
    accent: "warning",
    compute: (c, p) => {
      const cur = c.laborRevenue / c.soldHours;
      const pre = p.laborRevenue / p.soldHours;
      return {
        value: usd(cur),
        subValue: "/hr",
        delta: pctChangeDelta(cur, pre),
        deltaDirection: dir(cur, pre),
      };
    },
  },
  {
    id: "gp-per-hr",
    label: "GP$ / Hr",
    description: "Total gross profit per sold hour.",
    icon: DollarSign,
    accent: "success",
    compute: (c, p) => {
      const cur = totalGPdollars(c) / c.soldHours;
      const pre = totalGPdollars(p) / p.soldHours;
      return {
        value: usd(cur),
        subValue: "/hr",
        delta: pctChangeDelta(cur, pre),
        deltaDirection: dir(cur, pre),
      };
    },
  },
  {
    id: "cost-per-build-hr",
    label: "Cost / Build Hr",
    description: "Total cost per build hour.",
    icon: Timer,
    accent: "warning",
    compute: (c, p) => {
      const cur = totalCost(c) / c.buildHours;
      const pre = totalCost(p) / p.buildHours;
      // lower cost-per-hour is better, so invert the direction
      return {
        value: usd(cur),
        subValue: "/build hr",
        delta: pctChangeDelta(cur, pre),
        deltaDirection: dir(pre, cur),
      };
    },
  },
];

export function getKpiById(id: string): KpiDef | undefined {
  return KPI_REGISTRY.find((k) => k.id === id);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/kpi-registry.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/kpi-registry.ts src/lib/kpi-registry.test.ts
git commit -m "feat: add 12-KPI registry with formatters and deltas"
```

---

## Task 3: KPI Preferences Store

**Files:**
- Create: `src/lib/kpi-prefs.ts`
- Test: `src/lib/kpi-prefs.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/kpi-prefs.test.ts
import { test, expect, beforeEach } from "bun:test";
import {
  DEFAULT_KPI_IDS,
  MIN_KPIS,
  MAX_KPIS,
  getSelectedKpiIds,
  toggleKpi,
  resetKpis,
  _resetForTest,
} from "@/lib/kpi-prefs";

beforeEach(() => {
  _resetForTest();
});

test("defaults to the 5 starter KPIs", () => {
  expect(DEFAULT_KPI_IDS).toEqual([
    "total-gp",
    "gp-dollars",
    "aro",
    "elr",
    "proficiency",
  ]);
  expect(getSelectedKpiIds()).toEqual(DEFAULT_KPI_IDS);
});

test("cannot exceed MAX_KPIS", () => {
  expect(MAX_KPIS).toBe(5);
  // already at 5; adding a new one is a no-op
  toggleKpi("parts-gp");
  expect(getSelectedKpiIds()).toHaveLength(5);
  expect(getSelectedKpiIds()).not.toContain("parts-gp");
});

test("toggling an active KPI removes it down to MIN_KPIS, then stops", () => {
  expect(MIN_KPIS).toBe(4);
  toggleKpi("proficiency"); // 5 -> 4
  expect(getSelectedKpiIds()).toHaveLength(4);
  toggleKpi("elr"); // 4 -> blocked, stays 4
  expect(getSelectedKpiIds()).toHaveLength(4);
  expect(getSelectedKpiIds()).toContain("elr");
});

test("can swap: remove one then add another", () => {
  toggleKpi("aro"); // 5 -> 4
  toggleKpi("parts-gp"); // 4 -> 5
  expect(getSelectedKpiIds()).toContain("parts-gp");
  expect(getSelectedKpiIds()).not.toContain("aro");
});

test("resetKpis restores defaults", () => {
  toggleKpi("aro");
  resetKpis();
  expect(getSelectedKpiIds()).toEqual(DEFAULT_KPI_IDS);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/kpi-prefs.test.ts`
Expected: FAIL — `Cannot find module '@/lib/kpi-prefs'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/kpi-prefs.ts
import { useSyncExternalStore } from "react";

export const MIN_KPIS = 4;
export const MAX_KPIS = 5;
export const DEFAULT_KPI_IDS = [
  "total-gp",
  "gp-dollars",
  "aro",
  "elr",
  "proficiency",
];

const STORAGE_KEY = "andys.kpiPrefs";

function load(): string[] {
  if (typeof localStorage === "undefined") return [...DEFAULT_KPI_IDS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_KPI_IDS];
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every((x) => typeof x === "string") &&
      parsed.length >= MIN_KPIS &&
      parsed.length <= MAX_KPIS
    ) {
      return parsed;
    }
  } catch {
    // fall through to defaults
  }
  return [...DEFAULT_KPI_IDS];
}

function persist(ids: string[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore quota/availability errors
  }
}

let selected: string[] = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getSelectedKpiIds(): string[] {
  return selected;
}

export function subscribeKpiPrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleKpi(id: string) {
  if (selected.includes(id)) {
    if (selected.length <= MIN_KPIS) return; // enforce floor
    selected = selected.filter((x) => x !== id);
  } else {
    if (selected.length >= MAX_KPIS) return; // enforce ceiling
    selected = [...selected, id];
  }
  persist(selected);
  emit();
}

export function resetKpis() {
  selected = [...DEFAULT_KPI_IDS];
  persist(selected);
  emit();
}

// Test-only: restore in-memory + storage to defaults.
export function _resetForTest() {
  selected = [...DEFAULT_KPI_IDS];
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export function useKpiPrefs(): {
  selectedIds: string[];
  toggle: (id: string) => void;
  reset: () => void;
} {
  const selectedIds = useSyncExternalStore(
    subscribeKpiPrefs,
    getSelectedKpiIds,
    getSelectedKpiIds,
  );
  return { selectedIds, toggle: toggleKpi, reset: resetKpis };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/kpi-prefs.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Run the whole suite + commit**

Run: `bun test`
Expected: PASS (all lib tests green).

```bash
git add src/lib/kpi-prefs.ts src/lib/kpi-prefs.test.ts
git commit -m "feat: add localStorage-backed KPI selection store"
```

---

## Task 4: KpiStrip Component

**Files:**
- Create: `src/components/shop/KpiStrip.tsx`

(No automated component test — RTL is not installed in this project. Verify via the dev server in Task 6.)

- [ ] **Step 1: Write the component**

```tsx
// src/components/shop/KpiStrip.tsx
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import clsx from "clsx";
import { MetricTile } from "@/components/shop/MetricTile";
import {
  getPeriodFinancials,
  getPreviousPeriodFinancials,
  type Timeframe,
} from "@/lib/kpi-engine";
import { getKpiById } from "@/lib/kpi-registry";
import { useKpiPrefs } from "@/lib/kpi-prefs";

const COLS: Record<number, string> = {
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
};

export function KpiStrip({ timeframe }: { timeframe: Timeframe }) {
  const navigate = useNavigate();
  const { selectedIds } = useKpiPrefs();
  const curr = getPeriodFinancials(timeframe);
  const prev = getPreviousPeriodFinancials(timeframe);

  const kpis = selectedIds
    .map((id) => getKpiById(id))
    .filter((k): k is NonNullable<typeof k> => Boolean(k));

  return (
    <div
      className={clsx(
        "grid grid-cols-2 gap-3",
        COLS[kpis.length] ?? "sm:grid-cols-3 lg:grid-cols-5",
      )}
    >
      {kpis.map((kpi) => {
        const r = kpi.compute(curr, prev);
        return (
          <button
            key={kpi.id}
            type="button"
            onClick={() => {
              toast.info(`${kpi.label} drill-down`);
              navigate({ to: "/reports" });
            }}
            className="text-left transition-transform hover:-translate-y-0.5"
          >
            <MetricTile
              label={kpi.label}
              value={r.value}
              subValue={r.subValue}
              delta={r.delta}
              deltaDirection={r.deltaDirection}
              icon={kpi.icon}
              accent={kpi.accent}
            />
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `bunx tsc --noEmit`
Expected: No errors in `KpiStrip.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/shop/KpiStrip.tsx
git commit -m "feat: add KpiStrip rendering selected KPIs per timeframe"
```

---

## Task 5: KpiCustomizer Component (owner-only)

**Files:**
- Create: `src/components/shop/KpiCustomizer.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/shop/KpiCustomizer.tsx
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { KPI_REGISTRY } from "@/lib/kpi-registry";
import { useKpiPrefs, MIN_KPIS, MAX_KPIS } from "@/lib/kpi-prefs";
import { useAuth } from "@/lib/auth-context";

export function KpiCustomizer() {
  const { user } = useAuth();
  const { selectedIds, toggle, reset } = useKpiPrefs();

  // Owner ("admin") only.
  if (user?.role !== "owner") return null;

  const atMax = selectedIds.length >= MAX_KPIS;
  const atMin = selectedIds.length <= MIN_KPIS;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-surface"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Customize
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-semibold">
            KPIs shown ({selectedIds.length}/{MAX_KPIS})
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {KPI_REGISTRY.map((kpi) => {
            const checked = selectedIds.includes(kpi.id);
            const disabled =
              (!checked && atMax) || (checked && atMin);
            return (
              <label
                key={kpi.id}
                className={
                  "flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-surface " +
                  (disabled ? "opacity-50" : "")
                }
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => toggle(kpi.id)}
                  className="mt-0.5"
                />
                <span className="flex flex-col">
                  <span className="text-xs font-medium">{kpi.label}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {kpi.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
          Choose {MIN_KPIS}–{MAX_KPIS} KPIs to display on the dashboard.
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `bunx tsc --noEmit`
Expected: No errors in `KpiCustomizer.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/shop/KpiCustomizer.tsx
git commit -m "feat: add owner-only KPI customizer popover"
```

---

## Task 6: Wire into the Dashboard

**Files:**
- Modify: `src/routes/dashboard.tsx`

- [ ] **Step 1: Add imports**

At the top of `src/routes/dashboard.tsx`, after the existing
`import { MetricTile } from "@/components/shop/MetricTile";` line, add:

```tsx
import { KpiStrip } from "@/components/shop/KpiStrip";
import { KpiCustomizer } from "@/components/shop/KpiCustomizer";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
```

- [ ] **Step 2: Replace the hardcoded KPI strip block**

In `src/routes/dashboard.tsx`, replace the entire block currently spanning the
`{/* TOP: KPI Strip ... */}` comment through the closing `</div>` of the KPI grid
(lines `495-576`: the comment banner, the `<div className="grid grid-cols-2 ...">`,
the inline 6-KPI array, the `.map(...)` rendering `MetricTile`, and its closing
`</div>`) with:

```tsx
      {/* ======================================================== */}
      {/* TOP: Customizable KPI Strip                                */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <ToggleGroup
            type="single"
            value={dateRange}
            onValueChange={(v) => {
              if (v === "Today" || v === "Week" || v === "Month") {
                setDateRange(v);
              }
            }}
            className="rounded-md border border-border p-0.5"
          >
            <ToggleGroupItem value="Today" className="h-7 px-3 text-[11px]">
              Today
            </ToggleGroupItem>
            <ToggleGroupItem value="Week" className="h-7 px-3 text-[11px]">
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="Month" className="h-7 px-3 text-[11px]">
              Month
            </ToggleGroupItem>
          </ToggleGroup>
          <KpiCustomizer />
        </div>
        <KpiStrip timeframe={dateRange} />
      </div>
```

- [ ] **Step 3: Remove the now-redundant cycling date button**

In `src/routes/dashboard.tsx`, in the job-board header (the section after the KPI
strip), delete the `<button>` whose label renders `{dateRange}` and whose onClick
cycles `Today → Week → Month` (originally lines `609-622`, the button between the
"All Techs" button and the "Full board" button). Leave the "All Techs" and
"Full board" buttons intact. The timeline is now controlled solely by the
`ToggleGroup` added in Step 2.

- [ ] **Step 4: Type-check + lint**

Run: `bunx tsc --noEmit && bun run lint`
Expected: No errors. (If `tsc` reports the `MetricTile` import is now unused —
i.e. it's no longer referenced anywhere in `dashboard.tsx` — remove that import
line. It may still be used elsewhere in the file; only remove if unused.)

- [ ] **Step 5: Manual verification in the browser**

Run: `bun run dev`
Then verify:
1. Sign in as the owner (`login.tsx` lists the Owner demo user) → the dashboard
   shows the default 5 KPIs (`total-gp`, `gp-dollars`, `aro`, `elr`,
   `proficiency`) and a **Customize** button.
2. Switching the timeline ToggleGroup (Today/Week/Month) changes the KPI values
   and deltas (Month values are larger than Today).
3. Open Customize → uncheck one KPI then check another (cap holds at 5, floor at
   4; checkboxes disable at the bounds). Reload the page → the selection persists.
4. Sign in as a non-owner (Advisor or Tech demo user) → the strip renders but the
   **Customize** button is absent.
5. Click any KPI tile → a drill-down toast fires and it navigates to `/reports`.

- [ ] **Step 6: Commit**

```bash
git add src/routes/dashboard.tsx
git commit -m "feat: wire customizable KPI strip and timeline into dashboard"
```

---

## Self-Review Notes

- **Spec coverage:** 12 KPIs (Task 2) ✓; seeded engine, not hardcoded (Task 1) ✓;
  owner-only filter, 4–5 cap (Tasks 3, 5) ✓; Today/Week/Month timeline (Task 6) ✓;
  persistence (Task 3) ✓; reuses existing `MetricTile` (Task 4) ✓; light unit tests
  on pure functions (Tasks 1–3) ✓; dashboard-only scope ✓.
- **Type consistency:** `Timeframe`, `PeriodFinancials` (engine) consumed unchanged
  by registry, strip; `KpiDef.compute` signature matches every call site;
  `getKpiById`, `getSelectedKpiIds`, `toggleKpi`, `resetKpis`, `useKpiPrefs` names
  match across tasks; `MIN_KPIS`/`MAX_KPIS` used consistently.
- **Component tests:** RTL is not installed; component behavior is verified manually
  in Task 6 Step 5 (documented, not silently skipped).
```
