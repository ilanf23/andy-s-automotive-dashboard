import { test, expect } from "vitest";
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
