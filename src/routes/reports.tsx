import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  DollarSign,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Package,
  CreditCard,
  Truck,
  Briefcase,
  BarChart3,
  TrendingUp,
  Wrench,
  Clock,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  FileText,
  Star,
  Search,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { PageShell } from "@/components/shop/PageShell";
import { ConversationalReports } from "@/components/ai/ConversationalReports";

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "YTD"] as const;

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

type ReportCategory =
  | "Sales"
  | "Labor"
  | "Parts"
  | "AR"
  | "Customer"
  | "Fleet"
  | "Inspection";

type Report = {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  icon: typeof DollarSign;
  starred?: boolean;
  isNew?: boolean;
};

const reports: Report[] = [
  // Sales
  { id: "r1", name: "Sales Summary", description: "Revenue, ARO, ELR, GP$ — by day/week/month", category: "Sales", icon: DollarSign, starred: true },
  { id: "r2", name: "Sales by Service Advisor", description: "Production, close rate, ARO per advisor", category: "Sales", icon: Users },
  { id: "r3", name: "Sales by Service Type", description: "Maintenance vs repair vs diagnostic", category: "Sales", icon: BarChart3 },
  { id: "r4", name: "Posted ROs", description: "All closed/posted ROs with totals", category: "Sales", icon: FileText },
  { id: "r5", name: "Discount Report", description: "Discounts given by RO, advisor, customer", category: "Sales", icon: TrendingUp },

  // Labor
  { id: "r6", name: "Effective Labor Rate", description: "Labor sales ÷ actual hours worked, by tech", category: "Labor", icon: TrendingUp, starred: true },
  { id: "r7", name: "Technician Productivity", description: "Billed vs sold vs available, efficiency %", category: "Labor", icon: Wrench },
  { id: "r8", name: "Time Clock Report", description: "Hours clocked by tech, by day", category: "Labor", icon: Clock },
  { id: "r9", name: "Labor by Job Type", description: "Average hours per canned job, actual vs standard", category: "Labor", icon: Briefcase },

  // Parts
  { id: "r10", name: "Parts Sales", description: "Parts revenue, GP%, by vendor and category", category: "Parts", icon: Package },
  { id: "r11", name: "Vendor Spend", description: "Spend by vendor, with rebate tracking", category: "Parts", icon: Truck },
  { id: "r12", name: "Inventory Value", description: "On-hand value snapshot + turn rate", category: "Parts", icon: Package },
  { id: "r13", name: "Parts Matrix Audit", description: "Markup health check vs target margin", category: "Parts", icon: TrendingUp },

  // AR
  { id: "r14", name: "Aging Report", description: "Open invoices by aging bucket (0-30, 31-60, …)", category: "AR", icon: AlertTriangle, starred: true },
  { id: "r15", name: "Payment Register", description: "Payments received by method, date", category: "AR", icon: CreditCard },
  { id: "r16", name: "Statement Run", description: "Customer statements ready to send", category: "AR", icon: FileText },
  { id: "r17", name: "Past Due Customers", description: "Customers with balance > 30 days", category: "AR", icon: AlertTriangle, isNew: true },

  // Customer
  { id: "r18", name: "Customer Retention", description: "Active customers, return rate, last visit", category: "Customer", icon: Users },
  { id: "r19", name: "Lifetime Value", description: "LTV by customer + segment ranking", category: "Customer", icon: DollarSign },
  { id: "r20", name: "Customer Source", description: "Where new customers came from", category: "Customer", icon: Users },

  // Fleet
  { id: "r21", name: "Fleet Activity", description: "Visits, spend, and trucks-in-shop per fleet account", category: "Fleet", icon: Truck },
  { id: "r22", name: "Fleet Platform Sync", description: "Status of Fleetio, Holman, Enterprise integrations", category: "Fleet", icon: Truck },

  // Inspection
  { id: "r23", name: "Inspection Findings", description: "Red/yellow/green by category, conversion to estimate", category: "Inspection", icon: ClipboardCheck, starred: true },
  { id: "r24", name: "Lost Revenue Risk", description: "Unestimated inspection findings $ value", category: "Inspection", icon: AlertTriangle, isNew: true },
];

const categoryOrder: ReportCategory[] = ["Sales", "Labor", "Parts", "AR", "Customer", "Fleet", "Inspection"];

function ReportsPage() {
  const [category, setCategory] = useState<ReportCategory | "All" | "Starred">("All");
  const [search, setSearch] = useState("");
  const [dateRangeIdx, setDateRangeIdx] = useState(0);
  const [starredIds, setStarredIds] = useState<Set<string>>(
    () => new Set(reports.filter((r) => r.starred).map((r) => r.id)),
  );

  const isStarred = (id: string) => starredIds.has(id);
  const toggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = reports.filter((r) => {
    if (category === "Starred") return isStarred(r.id);
    if (category !== "All" && r.category !== category) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
  });

  const grouped = new Map<ReportCategory, Report[]>();
  for (const r of filtered) {
    const arr = grouped.get(r.category) ?? [];
    arr.push(r);
    grouped.set(r.category, arr);
  }

  return (
    <PageShell
      title="Reports"
      description="Pull insights on sales, labor, parts, AR, customers, and fleet activity"
      actions={
        <>
          <button
            type="button"
            onClick={() => setDateRangeIdx((i) => (i + 1) % DATE_RANGES.length)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
          >
            <Calendar className="h-3 w-3" />
            {DATE_RANGES[dateRangeIdx]}
          </button>
          <button
            type="button"
            onClick={() => toast.info("Report filters — coming soon")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
          >
            <Filter className="h-3 w-3" />
            Filters
          </button>
          <button
            type="button"
            onClick={() => toast.info("Schedule report — coming soon")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
          >
            <Clock className="h-3 w-3" />
            Schedule
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success("Exporting report bundle…");
              setTimeout(() => {
                const date = new Date().toISOString().split("T")[0];
                toast.success(`Bundle ready — reports_${date}.zip`);
              }, 1000);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </>
      }
    >
      {/* Conversational Reports — AI Q&A surface */}
      <ConversationalReports />

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports…"
          className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile
          label="MTD Sales"
          value="$284,500"
          delta="+12% YoY"
          icon={DollarSign}
          onClick={() => toast.info("Drilling into MTD Sales")}
        />
        <KpiTile
          label="MTD ARO"
          value="$1,847"
          delta="+$104"
          icon={TrendingUp}
          onClick={() => toast.info("Drilling into MTD ARO")}
        />
        <KpiTile
          label="MTD ELR"
          value="$148/hr"
          delta="target $155"
          icon={Wrench}
          onClick={() => toast.info("Drilling into MTD ELR")}
        />
        <KpiTile
          label="MTD GP %"
          value="56.4%"
          delta="+1.2pts"
          icon={BarChart3}
          onClick={() => toast.info("Drilling into MTD GP %")}
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <CategoryPill
          label="All"
          count={reports.length}
          active={category === "All"}
          onClick={() => setCategory("All")}
        />
        <CategoryPill
          label="Starred"
          count={starredIds.size}
          active={category === "Starred"}
          icon={Star}
          onClick={() => setCategory("Starred")}
        />
        {categoryOrder.map((c) => (
          <CategoryPill
            key={c}
            label={c}
            count={reports.filter((r) => r.category === c).length}
            active={category === c}
            onClick={() => setCategory(c)}
          />
        ))}
      </div>

      {/* Report cards grouped by category */}
      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([cat, items]) => (
          <div key={cat}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {cat}
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((r) => {
                const Icon = r.icon;
                const starred = isStarred(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      toast.info(`Opening ${r.name}…`);
                      setTimeout(() => toast.success("Report rendered"), 600);
                    }}
                    className="group flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-all hover:border-foreground/30 hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{r.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(r.id);
                          }}
                          className="rounded p-0.5 hover:bg-surface"
                          aria-label={starred ? "Unstar report" : "Star report"}
                        >
                          <Star
                            className={clsx(
                              "h-3 w-3",
                              starred ? "fill-accent text-accent" : "text-muted-foreground",
                            )}
                          />
                        </button>
                        {r.isNew && (
                          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent-foreground">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {r.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function KpiTile({
  label,
  value,
  delta,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: string;
  delta: string;
  icon: typeof DollarSign;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-foreground/30"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground">{delta}</div>
    </button>
  );
}

function CategoryPill({
  label,
  count,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon?: typeof Star;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground/80 hover:border-foreground/40",
      )}
    >
      {Icon && <Icon className={clsx("h-3 w-3", active && "fill-accent text-accent")} />}
      <span>{label}</span>
      <span
        className={clsx(
          "rounded-full px-1.5 text-[10px] font-bold tabular-nums",
          active ? "bg-background/20" : "bg-surface text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}
