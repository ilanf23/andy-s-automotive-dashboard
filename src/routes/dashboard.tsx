import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import {
  Plus,
  Wrench,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Package,
  ThumbsUp,
  LogIn,
  ChevronRight,
  Bell,
  MessageSquare,
  CalendarPlus,
  ClipboardCheck,
  UserPlus,
  PackagePlus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PageShell, SectionHeader } from "@/components/shop/PageShell";
import { KpiStrip } from "@/components/shop/KpiStrip";
import { KpiCustomizer } from "@/components/shop/KpiCustomizer";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CarCountChart, type CarCountBucket } from "@/components/shop/CarCountChart";
import { HoursChart, type HoursBucket } from "@/components/shop/HoursChart";
import {
  ROWorkflowBoard,
  type WorkflowColumn,
} from "@/components/shop/ROWorkflowBoard";
import {
  TechProductivityList,
  type TechRow,
} from "@/components/shop/TechProductivityList";
import {
  AppointmentsList,
  type AppointmentRow,
} from "@/components/shop/AppointmentsList";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { technicians } from "@/data/technicians";
import type { ShopStatus } from "@/components/shop/StatusBadge";
import { useShopState, updateROStatus, isLostRevenueResolved } from "@/lib/shop-store";
import { useModals } from "@/components/ui/ModalProvider";
import { AtRiskCustomersWidget } from "@/components/ai/CustomerHealthScore";
import { toast } from "sonner";
import clsx from "clsx";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

// =========================================================================
// Workflow column config - mirrors a standard shop-management RO pipeline.
// =========================================================================
const workflowConfig: Array<{
  status: ShopStatus;
  label: string;
  short: string;
  color: string;
}> = [
  { status: "just-arrived", label: "Estimate", short: "Est", color: "#94A3B8" },
  { status: "inspection", label: "Inspection", short: "Insp", color: "#F59E0B" },
  {
    status: "estimate-building",
    label: "Estimate Building",
    short: "Bldg",
    color: "#3B82F6",
  },
  {
    status: "awaiting-approval",
    label: "Awaiting Approval",
    short: "Appr",
    color: "#E10600",
  },
  { status: "in-progress", label: "Work In Progress", short: "WIP", color: "#6366F1" },
  { status: "ready", label: "Ready", short: "Ready", color: "#16A34A" },
  { status: "completed", label: "Posted", short: "Posted", color: "#15803D" },
];

// =========================================================================
// Activity feed
// =========================================================================
type ActivityItem = {
  id: string;
  icon: typeof CheckCircle;
  tone: "ink" | "accent" | "success" | "danger" | "muted";
  actor: string;
  text: string;
  time: string;
};

const activity: ActivityItem[] = [
  {
    id: "a1",
    icon: CheckCircle,
    tone: "success",
    actor: "Marcus",
    text: "completed inspection on Med Trust Unit 47 - 2 red, 3 yellow findings",
    time: "14m",
  },
  {
    id: "a2",
    icon: FileText,
    tone: "ink",
    actor: "System",
    text: "Estimate EST-4847 sent to Med Trust fleet manager via Fleetio",
    time: "1h",
  },
  {
    id: "a3",
    icon: ThumbsUp,
    tone: "accent",
    actor: "Cameron",
    text: "approved RO 4831 close-out - Davy Tree DT-7 ($6,104)",
    time: "2h",
  },
  {
    id: "a4",
    icon: Package,
    tone: "muted",
    actor: "Stewart",
    text: "ordered 4× front brake pads (HDPAD-F) from WorldPac",
    time: "2h",
  },
  {
    id: "a5",
    icon: AlertTriangle,
    tone: "danger",
    actor: "AR",
    text: "Northpoint Logistics - 185 days past due, $17,000 outstanding",
    time: "3h",
  },
  {
    id: "a6",
    icon: LogIn,
    tone: "muted",
    actor: "Andre",
    text: "clocked in - assigned to bay 3",
    time: "6h",
  },
];

const toneClasses: Record<ActivityItem["tone"], string> = {
  ink: "bg-foreground text-background",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success/15 text-success",
  danger: "bg-destructive/10 text-destructive",
  muted: "bg-surface text-foreground",
};

// =========================================================================
// Static synthetic dashboard data
// =========================================================================
const appointments: AppointmentRow[] = [
  {
    id: "ap1",
    time: "08:00",
    customer: "City Fleet Services",
    vehicle: "2022 Ford F-450 · CF-304",
    type: "Drop-off",
    bay: "2",
    confirmed: true,
  },
  {
    id: "ap2",
    time: "09:30",
    customer: "Med Trust",
    vehicle: "2024 Ford Transit · MT-52",
    type: "Diagnostic",
    bay: "1",
    confirmed: true,
  },
  {
    id: "ap3",
    time: "10:15",
    customer: "FSCJ",
    vehicle: "2019 Chevy Silverado · 09",
    type: "Inspection",
    bay: "3",
    confirmed: false,
  },
  {
    id: "ap4",
    time: "11:00",
    customer: "Bayside Distribution",
    vehicle: "2020 Freightliner M2 · BAY-01",
    type: "Estimate Review",
    confirmed: true,
  },
  {
    id: "ap5",
    time: "13:30",
    customer: "Davy Tree",
    vehicle: "2018 Peterbilt 567 · DT-7",
    type: "Pickup",
    bay: "5",
    confirmed: true,
  },
  {
    id: "ap6",
    time: "15:00",
    customer: "Coastal Plumbing",
    vehicle: "2021 Ram Promaster · COA-01",
    type: "Scheduled Service",
    bay: "4",
    confirmed: true,
  },
];

const partsOnOrder = [
  {
    id: "p1",
    part: "Front brake pads - HDPAD-F",
    qty: 4,
    vendor: "WorldPac",
    eta: "Tomorrow 10:00 AM",
    forRO: "4848",
  },
  {
    id: "p2",
    part: "Hydraulic cylinder seal kit",
    qty: 1,
    vendor: "NAPA",
    eta: "May 22, 2:00 PM",
    forRO: "4851",
  },
  {
    id: "p3",
    part: "DEF doser injector",
    qty: 1,
    vendor: "OEM",
    eta: "May 23, AM",
    forRO: "4849",
  },
  {
    id: "p4",
    part: "ABS wheel sensor (rear LH)",
    qty: 2,
    vendor: "WorldPac",
    eta: "Today 4:00 PM",
    forRO: "4845",
  },
];

const messages = [
  {
    id: "m1",
    from: "Dana Whitfield · Med Trust",
    preview: "Can we add an oil change to MT-47 while you have it?",
    time: "8m",
    unread: true,
  },
  {
    id: "m2",
    from: "City Fleet Services",
    preview: "Approved estimate EST-4847. Greenlight the work.",
    time: "47m",
    unread: true,
  },
  {
    id: "m3",
    from: "FSCJ - Patel",
    preview: "Need DOT inspection paperwork emailed by 5pm Friday",
    time: "2h",
    unread: false,
  },
];

const quickActions = [
  { id: "qa1", label: "New Repair Order", icon: Plus, featured: true },
  { id: "qa2", label: "Schedule Appointment", icon: CalendarPlus },
  { id: "qa3", label: "Start Inspection", icon: ClipboardCheck },
  { id: "qa4", label: "Add Customer", icon: UserPlus },
  { id: "qa5", label: "Receive Parts", icon: PackagePlus },
  { id: "qa6", label: "AI: Build Estimate", icon: Sparkles },
];

// =========================================================================
// Dashboard
// =========================================================================
function Dashboard() {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const { repairOrders } = useShopState();
  const { open: openModal } = useModals();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<"Today" | "Week" | "Month">("Today");

  const custMap = new Map(customers.map((c) => [c.id, c]));
  const vehMap = new Map(vehicles.map((v) => [v.id, v]));
  const techMap = new Map(technicians.map((t) => [t.id, t]));

  // Group ROs into workflow columns
  const workflowColumns: WorkflowColumn[] = workflowConfig.map((cfg) => {
    const cards = repairOrders
      .filter((r) => r.status === cfg.status)
      .map((r) => {
        const v = vehMap.get(r.vehicleId);
        const c = custMap.get(r.customerId);
        const t = r.technicianId ? techMap.get(r.technicianId) : undefined;
        return {
          roId: r.id,
          unit: v?.unit ?? "-",
          vehicle: v ? `${v.year} ${v.make} ${v.model}` : "",
          customer: c?.name ?? "",
          technician: t?.name?.split(" ")[0],
          status: r.status,
          daysInShop: r.daysInShop,
          total: r.total,
          flagged: (r.flags?.length ?? 0) > 0,
        };
      });
    return {
      status: cfg.status,
      label: cfg.label,
      color: cfg.color,
      cards,
    };
  });

  // Build chart data from workflow columns
  const carCountData: CarCountBucket[] = workflowConfig
    .filter((c) => c.status !== "completed") // posted is a count-only stat
    .map((c) => ({
      status: c.status,
      short: c.short,
      count: workflowColumns.find((w) => w.status === c.status)?.cards.length ?? 0,
      color: c.color,
    }));
  // Append a Posted column to mimic the A/R bar
  carCountData.push({
    status: "posted",
    short: "Posted",
    count: 47, // MTD posted
    color: "#15803D",
  });

  // Hours per column (synthetic but proportional to RO count & avg hours)
  const hoursPerStatus: Record<string, number> = {
    "just-arrived": 0.5,
    inspection: 2.0,
    "estimate-building": 8.5,
    "awaiting-approval": 14.2,
    "in-progress": 18.7,
    ready: 4.0,
    posted: 38.4,
  };
  const hoursData: HoursBucket[] = workflowConfig
    .filter((c) => c.status !== "completed")
    .map((c) => ({
      status: c.status,
      short: c.short,
      hours: hoursPerStatus[c.status] ?? 0,
      color: c.color,
    }));
  hoursData.push({
    status: "posted",
    short: "Posted",
    hours: hoursPerStatus.posted,
    color: "#15803D",
  });

  // Tech rows - synthetic billed/sold/available from utilization
  const techRows: TechRow[] = technicians.map((t) => {
    const avail = 8;
    const billed = Math.round(((t.utilization / 100) * avail) * 10) / 10;
    const sold = Math.round((billed * (0.92 + Math.random() * 0.25)) * 10) / 10;
    const efficiency = Math.round((sold / billed) * 100);
    return {
      id: t.id,
      name: t.name,
      initials: t.initials,
      role: t.role,
      hoursBilled: billed,
      hoursSold: sold,
      hoursAvailable: avail,
      efficiency,
    };
  });

  const carsInShop = workflowColumns
    .filter((c) => c.status !== "completed" && c.status !== "ready")
    .reduce((acc, c) => acc + c.cards.length, 0);
  const openROs = repairOrders.filter(
    (r) => r.status !== "completed" && r.status !== "ready",
  ).length;
  const unreadMessages = messages.filter((m) => m.unread).length;

  return (
    <PageShell
      title={`Good morning, Cameron`}
      description={today}
      actions={
        <>
          <button
            type="button"
            onClick={() => {
              toast.info("Schedule appointment", { description: "Opens the Schedule page" });
              navigate({ to: "/schedule" });
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            <CalendarPlus className="h-4 w-4" />
            Schedule
          </button>
          <button
            type="button"
            onClick={() => openModal("new-ro", {})}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3.5 py-2 text-sm font-semibold text-brand-green-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Repair Order
          </button>
        </>
      }
    >
      {/* ======================================================== */}
      {/* HERO: Lost Revenue Risk banner - the AI value prop      */}
      {/* ======================================================== */}
      {(() => {
        const lostRevenueROs = repairOrders.filter(
          (r) =>
            r.flags?.some((f) => f.toLowerCase().includes("lost revenue")) &&
            !isLostRevenueResolved(r.id),
        );
        const resolvedROs = repairOrders.filter(
          (r) =>
            r.flags?.some((f) => f.toLowerCase().includes("lost revenue")) &&
            isLostRevenueResolved(r.id),
        );
        if (lostRevenueROs.length > 0) {
          const totalAtRisk = 1213; // sum of unestimated findings across flagged ROs
          const targetRO = lostRevenueROs[0];
          const targetCustomer = custMap.get(targetRO.customerId);
          const targetVehicle = vehMap.get(targetRO.vehicleId);
          return (
            <div className="flex items-center justify-between gap-4 rounded-lg border-2 border-accent bg-accent/15 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold tabular-nums text-[#991B1B]">
                      ${totalAtRisk.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-[#991B1B]">
                      in unestimated inspection findings
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-[#991B1B]/80">
                    {targetCustomer?.name} · {targetVehicle?.unit} (RO #{targetRO.id})
                    {" "}- 4 findings need estimating · awaiting approval &gt;48hrs
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openModal("ai-estimate-builder", { roId: targetRO.id })}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-xs font-semibold text-background shadow-sm hover:opacity-90"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Review with AI
                <ArrowRight className="h-3 w-3 opacity-80" />
              </button>
            </div>
          );
        }
        if (resolvedROs.length > 0) {
          return (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-green/30 bg-brand-green-tint px-4 py-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-brand-green-soft" />
                <p className="text-xs font-semibold text-brand-green-soft">
                  All inspection findings captured this session ·{" "}
                  <span className="font-bold">$1,213</span> in additional work added by AI Estimate Builder
                </p>
              </div>
              <span className="rounded-full bg-brand-green/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-green-soft">
                Resolved
              </span>
            </div>
          );
        }
        return null;
      })()}

      {/* ======================================================== */}
      {/* TOP: Customizable KPI Strip                                */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <ToggleGroup
            type="single"
            value={dateRange}
            onValueChange={(v) => {
              if (v === "Today" || v === "Week" || v === "Month") {
                setDateRange(v);
              }
            }}
            className="rounded-md border border-border p-0.5"
          >
            <ToggleGroupItem value="Today" className="h-7 px-3 text-[11px]">
              Today
            </ToggleGroupItem>
            <ToggleGroupItem value="Week" className="h-7 px-3 text-[11px]">
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="Month" className="h-7 px-3 text-[11px]">
              Month
            </ToggleGroupItem>
          </ToggleGroup>
          <KpiCustomizer />
        </div>
        <KpiStrip timeframe={dateRange} />
      </div>

      {/* ======================================================== */}
      {/* CHARTS: Car Count + Hours bar charts                       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CarCountChart data={carCountData} />
        <HoursChart data={hoursData} />
      </div>

      {/* ======================================================== */}
      {/* AT-RISK CUSTOMERS - AI churn radar                         */}
      {/* ======================================================== */}
      <AtRiskCustomersWidget />

      {/* ======================================================== */}
      {/* RO WORKFLOW BOARD - Kanban-style columns                   */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <SectionHeader
          title="Active Job Board"
          description={`${carsInShop} vehicles on the floor · ${openROs} open repair orders`}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  toast.info("Tech filter", { description: "Filter dropdown - coming soon" })
                }
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-surface"
              >
                All Techs
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/repair-orders" })}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                Full board <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          }
        />
        <ROWorkflowBoard
          columns={workflowColumns}
          onMove={(roId, fromStatus, toStatus) => {
            updateROStatus(roId, toStatus);
            const toLabel = workflowConfig.find((w) => w.status === toStatus)?.label ?? toStatus;
            toast.success(`RO #${roId} moved`, {
              description: `Now in: ${toLabel}`,
            });
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* MID GRID: Appointments | Tech Productivity | Alerts/Msgs   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Today's Appointments */}
        <div className="rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold">Today's Appointments</h2>
              <p className="text-[11px] text-muted-foreground">
                {appointments.length} scheduled
              </p>
            </div>
            <Link
              to="/schedule"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Schedule <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-3 py-1">
            <AppointmentsList
              rows={appointments}
              onRowClick={() => navigate({ to: "/schedule" })}
            />
          </div>
        </div>

        {/* Tech Productivity */}
        <div className="rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold">Tech Productivity</h2>
              <p className="text-[11px] text-muted-foreground">
                Hours billed vs. sold today
              </p>
            </div>
            <Link
              to="/my-work"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Time clock <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5">
            <TechProductivityList rows={techRows} />
            <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-foreground" /> Billed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-accent/40" /> Sold
              </span>
              <span className="ml-auto">8.0 hr shifts</span>
            </div>
          </div>
        </div>

        {/* Messages + Alerts */}
        <div className="flex flex-col gap-4">
          {/* Customer Messages */}
          <div className="rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h2 className="text-sm font-semibold">Messages</h2>
                <p className="text-[11px] text-muted-foreground">
                  {unreadMessages} unread customer thread
                  {unreadMessages === 1 ? "" : "s"}
                </p>
              </div>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <ul className="divide-y divide-border">
              {messages.map((m) => (
                <li
                  key={m.id}
                  onClick={() => navigate({ to: "/messages" })}
                  className={clsx(
                    "flex cursor-pointer items-start gap-3 px-5 py-3 transition-colors hover:bg-surface/40",
                    m.unread && "bg-accent/[0.04]",
                  )}
                >
                  <div
                    className={clsx(
                      "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                      m.unread ? "bg-accent" : "bg-border",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold">
                        {m.from}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {m.time}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {m.preview}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Alerts */}
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-destructive" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive">
                Needs Attention
              </h3>
            </div>
            <ul className="mt-2 space-y-1.5 text-[11px] text-foreground">
              <li
                onClick={() =>
                  navigate({ to: "/repair-orders/$id", params: { id: "4847" } })
                }
                className="flex cursor-pointer items-start gap-1.5 rounded px-1 py-0.5 hover:bg-destructive/10"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                <span>
                  <span className="font-semibold">RO 4847</span> awaiting customer
                  approval - 3 days, $1,850 at risk
                </span>
              </li>
              <li
                onClick={() => {
                  toast.info("Northpoint Logistics", {
                    description: "185 days past due - $17,000",
                  });
                  navigate({ to: "/customers" });
                }}
                className="flex cursor-pointer items-start gap-1.5 rounded px-1 py-0.5 hover:bg-destructive/10"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                <span>
                  Northpoint Logistics - 185 days past due,{" "}
                  <span className="font-semibold">$17,000</span>
                </span>
              </li>
              <li
                onClick={() => {
                  toast.info("Stuck job - FT-3");
                  navigate({ to: "/repair-orders" });
                }}
                className="flex cursor-pointer items-start gap-1.5 rounded px-1 py-0.5 hover:bg-destructive/10"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                <span>
                  <span className="font-semibold">FT-3</span> stuck in Estimate
                  Building - no labor guide for Frankenstein build
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM GRID: Parts on Order | Recent Activity | Quick Acts */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Parts on Order */}
        <div className="rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold">Parts on Order</h2>
              <p className="text-[11px] text-muted-foreground">
                {partsOnOrder.length} outstanding orders
              </p>
            </div>
            <Link
              to="/inventory"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Inventory <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {partsOnOrder.map((p) => (
              <li
                key={p.id}
                onClick={() => navigate({ to: "/inventory" })}
                className="flex cursor-pointer items-start gap-3 px-5 py-3 transition-colors hover:bg-surface/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface">
                  <Package className="h-3.5 w-3.5 text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold">
                      {p.part}
                    </span>
                    <span className="shrink-0 rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                      ×{p.qty}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{p.vendor}</span>
                    <span>·</span>
                    <span>ETA {p.eta}</span>
                    <span>·</span>
                    <span className="text-foreground">RO #{p.forRO}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold">Recent Activity</h2>
              <p className="text-[11px] text-muted-foreground">Last 24 hours</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/repair-orders"
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                View all
              </Link>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <ul className="space-y-0.5 px-3 py-2">
            {activity.map((a) => {
              const Icon = a.icon;
              const activityLabel = `${a.actor} ${a.text}`;
              return (
                <li
                  key={a.id}
                  onClick={() => toast.info(activityLabel)}
                  className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-surface/60"
                >
                  <div
                    className={clsx(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      toneClasses[a.tone],
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] leading-snug">
                      <span className="font-semibold">{a.actor}</span>{" "}
                      <span className="text-muted-foreground">{a.text}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {a.time}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold">Quick Actions</h2>
              <p className="text-[11px] text-muted-foreground">Common tasks</p>
            </div>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              const handleClick = () => {
                if (qa.id === "qa1") {
                  openModal("new-ro", {});
                } else if (qa.id === "qa2") {
                  navigate({ to: "/schedule" });
                } else if (qa.id === "qa3") {
                  navigate({ to: "/inspections" });
                } else if (qa.id === "qa4") {
                  toast.info("Add customer - fill the form on the customers page");
                  navigate({ to: "/customers" });
                } else if (qa.id === "qa5") {
                  navigate({ to: "/inventory" });
                } else if (qa.id === "qa6") {
                  navigate({ to: "/estimates" });
                } else {
                  toast.info(qa.label, { description: "Coming soon" });
                }
              };
              return (
                <button
                  key={qa.id}
                  type="button"
                  onClick={handleClick}
                  className={clsx(
                    "flex flex-col items-start gap-2 rounded-md border p-3 text-left transition-all",
                    qa.featured
                      ? "border-brand-green bg-brand-green text-brand-green-foreground hover:opacity-95"
                      : "border-border bg-background hover:border-foreground/30 hover:bg-surface/60",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[11px] font-semibold leading-tight">
                    {qa.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
