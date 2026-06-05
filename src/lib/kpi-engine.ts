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
  const actualHours =
    Math.round((soldHours / (1.12 + rand() * 0.1)) * 10) / 10;
  const buildHours = Math.round(soldHours * (0.9 + rand() * 0.1) * 10) / 10;

  const roCount = Math.max(1, Math.round(8 * days * j()));
  const writtenRoCount = roCount + Math.max(1, Math.round(2 * days * j()));

  const revenue = partsRevenue + tireRevenue + batteryRevenue + laborRevenue;
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
