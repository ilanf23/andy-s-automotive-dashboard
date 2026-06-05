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
    const sum = aging.current + aging.d1_30 + aging.d31_60 + aging.d61_90 + aging.d90plus;
    expect(sum).toBe(totalOpenBalance);
  });
  it("pastDueTotal excludes current (not-yet-due) balances", () => {
    const { aging, pastDueTotal } = selectFinancials().ar;
    expect(pastDueTotal).toBe(aging.d1_30 + aging.d31_60 + aging.d61_90 + aging.d90plus);
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
