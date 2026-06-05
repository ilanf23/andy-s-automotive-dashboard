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
      // Lower cost-per-hour is better, so invert both the direction AND the
      // delta sign: a cost drop reads as a positive "▲ +x%" improvement.
      return {
        value: usd(cur),
        subValue: "/build hr",
        delta: pctChangeDelta(pre, cur),
        deltaDirection: dir(pre, cur),
      };
    },
  },
];

export function getKpiById(id: string): KpiDef | undefined {
  return KPI_REGISTRY.find((k) => k.id === id);
}
