import { test, expect, beforeEach } from "vitest";
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
