import { parseISO, differenceInDays } from "date-fns";
import { customers as seedCustomers } from "@/data/customers";
import { getShopState } from "./shop-store";

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
      const day = String(((i * 3) % 28) + 1).padStart(2, "0");
      const issued = `2026-0${(i % 4) + 2}-${day}`;
      const due = `2026-0${(i % 4) + 3}-${day}`;
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

export type FinancialSummary = {
  kpis: typeof SHOP_KPIS;
  ar: {
    totalOpenBalance: number;
    pastDueTotal: number;
    aging: { current: number; d1_30: number; d31_60: number; d61_90: number; d90plus: number };
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
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPayments = st.payments.filter((p) => p.at.startsWith(todayStr));
  const payments = {
    countToday: todayPayments.length,
    totalToday: todayPayments.reduce((s, p) => s + (p.amount ?? 0), 0),
  };
  const openROValue = st.repairOrders
    .filter((r) => r.status !== "completed")
    .reduce((s, r) => s + (r.total ?? 0), 0);
  return { kpis: SHOP_KPIS, ar: { totalOpenBalance, pastDueTotal, aging, topDebtors }, payments, openROValue };
}
