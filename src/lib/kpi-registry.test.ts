import { test, expect } from "vitest";
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
