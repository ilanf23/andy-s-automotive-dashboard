import { test, expect } from "vitest";
import { KPI_REGISTRY, getKpiById } from "@/lib/kpi-registry";
import {
  getPeriodFinancials,
  getPreviousPeriodFinancials,
  type PeriodFinancials,
} from "@/lib/kpi-engine";

// The 12 KPIs this feature owns. The registry may also contain additional
// entries contributed by other modules (e.g. a SHOP_KPIS-backed "sales-today"
// sourced from financials.ts), so these assertions check for a superset, not
// an exact count.
const REQUIRED_KPI_IDS = [
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
];

test("registry includes all 12 required KPIs with unique ids", () => {
  const ids = KPI_REGISTRY.map((k) => k.id);
  // No duplicate ids anywhere in the registry.
  expect(new Set(ids).size).toBe(ids.length);
  // Every required KPI is present.
  for (const id of REQUIRED_KPI_IDS) {
    expect(ids).toContain(id);
  }
});

test("expected required ids are present", () => {
  const ids = new Set(KPI_REGISTRY.map((k) => k.id));
  for (const id of REQUIRED_KPI_IDS) {
    expect(ids.has(id)).toBe(true);
  }
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
  expect(r.deltaDirection).toBe(
    currGP > prevGP ? "up" : currGP < prevGP ? "down" : "flat",
  );
});

test("cost-per-build-hr inverts direction (lower cost is an improvement)", () => {
  // Build full PeriodFinancials that differ only in parts cost (drives totalCost).
  const make = (partsCost: number): PeriodFinancials => ({
    partsRevenue: 5000,
    partsCost,
    tireRevenue: 1000,
    tireCost: 800,
    batteryRevenue: 500,
    batteryCost: 350,
    laborRevenue: 6000,
    laborCost: 2000,
    soldHours: 40,
    actualHours: 36,
    buildHours: 100,
    roCount: 8,
    writtenRoCount: 10,
    revenue: 12500,
    writtenRevenue: 15000,
  });
  const lo = make(1000); // cheaper
  const hi = make(2000); // pricier
  const kpi = getKpiById("cost-per-build-hr")!;
  // current cheaper than previous => cost fell => "up" (good)
  expect(kpi.compute(lo, hi).deltaDirection).toBe("up");
  // current pricier than previous => cost rose => "down" (bad)
  expect(kpi.compute(hi, lo).deltaDirection).toBe("down");
});
