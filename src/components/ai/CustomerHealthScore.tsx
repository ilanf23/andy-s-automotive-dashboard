import { Link } from "@tanstack/react-router";
import { TrendingDown, TrendingUp, Shield, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import clsx from "clsx";
import { AIBubble, SourcePill } from "@/components/ai/AIPrimitives";

export type HealthStatus = "champion" | "growing" | "declining" | "at-risk";

const HEALTH_META: Record<
  HealthStatus,
  { label: string; emoji: string; color: string; bg: string; ring: string }
> = {
  champion: {
    label: "Champion",
    emoji: "🏆",
    color: "text-brand-green-soft",
    bg: "bg-brand-green-tint",
    ring: "border-brand-green/40",
  },
  growing: {
    label: "Growing",
    emoji: "↗",
    color: "text-foreground",
    bg: "bg-surface",
    ring: "border-border",
  },
  declining: {
    label: "Declining",
    emoji: "↘",
    color: "text-[#991B1B]",
    bg: "bg-accent/20",
    ring: "border-accent/40",
  },
  "at-risk": {
    label: "At Risk",
    emoji: "⚠",
    color: "text-destructive",
    bg: "bg-destructive/10",
    ring: "border-destructive/30",
  },
};

// ============================================================================
// Inline badge — small chip for customer list / RO header
// ============================================================================

export function HealthBadge({ status }: { status: HealthStatus }) {
  const meta = HEALTH_META[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        meta.bg,
        meta.color,
      )}
    >
      {meta.emoji}
      {meta.label}
    </span>
  );
}

// ============================================================================
// Customer detail widget — shows score + reasoning + actions
// ============================================================================

export type HealthDetail = {
  status: HealthStatus;
  score: number; // 0-100
  signals: { label: string; weight: "positive" | "negative" | "neutral"; detail: string }[];
  recommendation: string;
  suggestedOutreach?: string;
};

export function CustomerHealthCard({
  customerName,
  detail,
}: {
  customerName: string;
  detail: HealthDetail;
}) {
  const meta = HEALTH_META[detail.status];
  return (
    <div className={clsx("rounded-lg border bg-background p-4", meta.ring)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AIBubble>Health Score</AIBubble>
        </div>
        <SourcePill source="shop-history" />
      </div>

      {/* Headline */}
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className={clsx("text-4xl font-bold tabular-nums leading-none", meta.color)}>
            {detail.score}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            of 100
          </div>
        </div>
        <div
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            meta.bg,
            meta.color,
          )}
        >
          {meta.emoji}
          {meta.label}
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={clsx(
            "h-full transition-all",
            detail.status === "champion" && "bg-brand-green",
            detail.status === "growing" && "bg-foreground",
            detail.status === "declining" && "bg-accent",
            detail.status === "at-risk" && "bg-destructive",
          )}
          style={{ width: `${detail.score}%` }}
        />
      </div>

      {/* Signals */}
      <div className="mt-3 space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          What's driving the score
        </div>
        {detail.signals.map((s, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px]">
            <span
              className={clsx(
                "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                s.weight === "positive" && "bg-brand-green/15 text-brand-green-soft",
                s.weight === "negative" && "bg-destructive/15 text-destructive",
                s.weight === "neutral" && "bg-surface text-muted-foreground",
              )}
            >
              {s.weight === "positive" ? "+" : s.weight === "negative" ? "−" : "·"}
            </span>
            <span>
              <span className="font-semibold">{s.label}:</span>{" "}
              <span className="text-muted-foreground">{s.detail}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="mt-3 rounded-md border border-border bg-surface/40 p-2.5">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-brand-green-soft" />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-green-soft">
              AI Recommendation
            </div>
            <p className="mt-0.5 text-[11px] text-foreground/85">{detail.recommendation}</p>
          </div>
        </div>
        {detail.suggestedOutreach && (
          <button className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background hover:opacity-90">
            {detail.suggestedOutreach}
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Dashboard widget — at-risk customers panel
// ============================================================================

export type AtRiskCustomer = {
  customerId: string;
  name: string;
  status: HealthStatus;
  signal: string;
  daysSinceVisit: number;
  suggestedAction: string;
};

const HERO_AT_RISK: AtRiskCustomer[] = [
  {
    customerId: "CUST-DUCKS",
    name: "Reliable Ducks",
    status: "declining",
    signal: "Last visit 5 weeks ago — normal cadence is 2 weeks",
    daysSinceVisit: 35,
    suggestedAction: "Send check-in SMS",
  },
  {
    customerId: "CUST-NORTHPOINT",
    name: "Northpoint Logistics",
    status: "at-risk",
    signal: "$17k past due 185 days · No service in 6 months",
    daysSinceVisit: 188,
    suggestedAction: "Approve lien filing",
  },
  {
    customerId: "CUST-FCS",
    name: "First Coast Supplies",
    status: "declining",
    signal: "Estimate approval rate dropped from 92% to 64% this quarter",
    daysSinceVisit: 21,
    suggestedAction: "Schedule a check-in call",
  },
];

export function AtRiskCustomersWidget() {
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">At-Risk Customers</h2>
            <AIBubble>AI</AIBubble>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {HERO_AT_RISK.length} accounts trending the wrong direction
          </p>
        </div>
        <TrendingDown className="h-4 w-4 text-destructive" />
      </div>
      <ul className="divide-y divide-border">
        {HERO_AT_RISK.map((c) => (
          <li key={c.customerId}>
            <Link
              to="/customers/$id"
              params={{ id: c.customerId }}
              className="flex items-start justify-between gap-3 px-5 py-3 transition-colors hover:bg-surface/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">{c.name}</span>
                  <HealthBadge status={c.status} />
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{c.signal}</p>
                <button className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-green-soft hover:underline">
                  <Sparkles className="h-2.5 w-2.5" />
                  {c.suggestedAction}
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[10px] text-muted-foreground">Last visit</div>
                <div className="text-xs font-semibold tabular-nums">
                  {c.daysSinceVisit}d ago
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Helper: derive a health detail from a customer id (hardcoded for demo)
// ============================================================================

export function getHealthDetail(customerId: string): HealthDetail {
  const map: Record<string, HealthDetail> = {
    "CUST-MED": {
      status: "champion",
      score: 94,
      signals: [
        { label: "Visit cadence", weight: "positive", detail: "Every 8-12 days, very consistent" },
        { label: "Estimate approval", weight: "positive", detail: "98% approval rate over 12 months" },
        { label: "Payments", weight: "positive", detail: "Net-30, paid on time 22 of last 24 invoices" },
        { label: "Lifetime spend", weight: "positive", detail: "$1.05M · top customer" },
      ],
      recommendation:
        "Offer a PM subscription plan — this customer is a strong candidate for $500-700/mo recurring per truck.",
      suggestedOutreach: "Pitch PM subscription",
    },
    "CUST-CITY": {
      status: "champion",
      score: 88,
      signals: [
        { label: "Visit cadence", weight: "positive", detail: "Steady — every 3 weeks on average" },
        { label: "Estimate approval", weight: "positive", detail: "89% approval rate" },
        { label: "Payments", weight: "neutral", detail: "Net-30, occasionally late by 5-10 days" },
        { label: "Lifetime spend", weight: "positive", detail: "$1.02M" },
      ],
      recommendation: "Solid champion. Stay on cadence. Consider quarterly business review.",
    },
    "CUST-DUCKS": {
      status: "declining",
      score: 52,
      signals: [
        { label: "Visit cadence", weight: "negative", detail: "Last visit 35 days ago — normal is 14 days" },
        { label: "Estimate approval", weight: "neutral", detail: "Dropped from 91% to 76% this quarter" },
        { label: "Payments", weight: "positive", detail: "Always pays on time" },
        { label: "Fleet platform signal", weight: "negative", detail: "Enterprise opened 2 estimates with competitors recently" },
      ],
      recommendation:
        "They're shopping around. Reach out NOW with a service reminder and a small loyalty offer (free filter inspection on next visit).",
      suggestedOutreach: "Send check-in SMS",
    },
    "CUST-FCS": {
      status: "declining",
      score: 58,
      signals: [
        { label: "Estimate approval", weight: "negative", detail: "92% → 64% this quarter — they're declining work" },
        { label: "ARO", weight: "negative", detail: "Average RO dropped from $1,840 to $980" },
        { label: "Payments", weight: "positive", detail: "Net-30, on time" },
        { label: "Visits", weight: "neutral", detail: "Same cadence, but smaller scope" },
      ],
      recommendation:
        "Price sensitivity emerging. Schedule a check-in call to understand if they're under budget pressure. Offer a bundled package.",
      suggestedOutreach: "Schedule check-in call",
    },
    "CUST-NORTHPOINT": {
      status: "at-risk",
      score: 18,
      signals: [
        { label: "Open balance", weight: "negative", detail: "$17,000 past due 185 days" },
        { label: "Communication", weight: "negative", detail: "Last reply from Vince was Feb — radio silence since" },
        { label: "Visits", weight: "negative", detail: "Zero visits in 6 months" },
        { label: "Truck status", weight: "negative", detail: "Vince reported his crew was let go" },
      ],
      recommendation:
        "Approve mechanic's lien filing. Customer has effectively churned — collecting the debt is the focus, not retention.",
      suggestedOutreach: "Approve lien filing",
    },
  };
  return (
    map[customerId] ?? {
      status: "growing",
      score: 75,
      signals: [
        { label: "New customer", weight: "neutral", detail: "Not enough history for full assessment" },
        { label: "Visit cadence", weight: "positive", detail: "On track" },
      ],
      recommendation: "Continue normal service relationship — too early for tailored actions.",
    }
  );
}
