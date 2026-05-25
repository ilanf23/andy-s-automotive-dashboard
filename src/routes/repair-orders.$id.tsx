import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  ClipboardCheck,
  Wrench,
  MessageSquare,
  Folder,
  Activity,
  Sparkles,
  Camera,
  Download,
  CheckCircle,
  Send,
  Clock,
  Printer,
  Mail,
  CreditCard,
  ChevronDown,
  Plus,
  Truck,
  User,
  Save,
  MoreHorizontal,
} from "lucide-react";
import clsx from "clsx";
import { DetailPageShell, MetaPair } from "@/components/shop/DetailPageShell";
import { PageShell } from "@/components/shop/PageShell";
import { StatusBadge } from "@/components/shop/StatusBadge";
import { EmptyState } from "@/components/shop/EmptyState";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { technicians } from "@/data/technicians";
import { estimates } from "@/data/estimates";
import { inspections } from "@/data/inspections";
import { usd } from "@/lib/format";
import {
  useShopState,
  postRepairOrder,
  selectBalance,
  selectPaymentsForRO,
  selectAILinesForRO,
  isLostRevenueResolved,
} from "@/lib/shop-store";
import { useModals } from "@/components/ui/ModalProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/repair-orders/$id")({
  component: RepairOrderDetail,
});

type SubTab =
  | "overview"
  | "jobs"
  | "parts"
  | "labor"
  | "inspections"
  | "messages"
  | "files"
  | "activity";

function RepairOrderDetail() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<SubTab>("overview");
  const { repairOrders } = useShopState();
  const { open: openModal } = useModals();

  const ro = repairOrders.find((r) => r.id === id);

  if (!ro) {
    return (
      <PageShell title={`Repair Order #${id}`}>
        <EmptyState
          icon={AlertTriangle}
          title="Repair order not found"
          description={`We couldn't find a repair order with ID ${id}.`}
          action={
            <Link
              to="/repair-orders"
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90"
            >
              Back to repair orders
            </Link>
          }
        />
      </PageShell>
    );
  }

  const customer = customers.find((c) => c.id === ro.customerId);
  const vehicle = vehicles.find((v) => v.id === ro.vehicleId);
  const tech = ro.technicianId ? technicians.find((t) => t.id === ro.technicianId) : undefined;
  const estimate = estimates.find((e) => e.repairOrderId === ro.id);
  const inspection = inspections.find((i) => i.repairOrderId === ro.id);

  const lostRevenueFlagSet = ro.flags?.some((f) => f.toLowerCase().includes("lost revenue"));
  // Lost Revenue banner hides once AI Builder has resolved the gap
  const isLostRevenue = lostRevenueFlagSet && !isLostRevenueResolved(ro.id);
  const findings = ro.inspectionFindings;
  const aiLines = selectAILinesForRO(ro.id);
  const aiAddedTotal = aiLines.reduce((acc, l) => acc + l.total, 0);

  // Totals — reactive to applied payments from the store
  const subtotal = estimate?.subtotal ?? ro.total;
  const tax = estimate?.tax ?? subtotal * 0.07;
  const total = estimate?.total ?? subtotal + tax;
  const payments = selectPaymentsForRO(ro.id);
  const sessionPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const paid = sessionPaid > 0 ? sessionPaid : ro.status === "completed" ? total : 0;
  const balance = Math.max(0, total - paid);

  const tabs = [
    { id: "overview", label: "Overview" },
    {
      id: "jobs",
      label: "Jobs",
      count: 3,
    },
    {
      id: "parts",
      label: "Parts",
      count: 4,
    },
    {
      id: "labor",
      label: "Labor",
      count: 2,
    },
    {
      id: "inspections",
      label: "Inspections",
      count: inspection ? 1 : 0,
    },
    {
      id: "messages",
      label: "Messages",
      count: 2,
      badgeTone: "accent" as const,
    },
    { id: "files", label: "Files", count: 4 },
    { id: "activity", label: "Activity" },
  ];

  return (
    <DetailPageShell
      backTo="/repair-orders"
      backLabel="All repair orders"
      eyebrow={`REPAIR ORDER · OPENED ${format(parseISO(ro.openedAt), "MMM d, yyyy").toUpperCase()}`}
      title={`#${ro.id} — ${customer?.name ?? "Unknown customer"}`}
      titleMeta={
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={ro.status} size="md" />
          {ro.flags?.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive"
            >
              <AlertTriangle className="h-2.5 w-2.5" />
              {f}
            </span>
          ))}
          {vehicle?.isFrankenstein && <StatusBadge status="frankenstein" />}
        </div>
      }
      headerRight={
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total
          </div>
          <div className="text-3xl font-semibold tracking-tight tabular-nums">
            {usd.format(total)}
          </div>
          {balance > 0 && (
            <div className="text-[11px] text-destructive">
              Balance due: <span className="font-semibold tabular-nums">{usd.format(balance)}</span>
            </div>
          )}
        </div>
      }
      actions={
        <>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface">
            <Save className="h-3 w-3" />
            Save
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface">
            <Send className="h-3 w-3" />
            Send Estimate
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface">
            <Printer className="h-3 w-3" />
            Print
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface">
            <Mail className="h-3 w-3" />
            Email
          </button>
          <button
            onClick={() =>
              openModal("diagnostic-assistant", {
                initialSymptom: ro.description,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-green/40 bg-brand-green-tint px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-soft hover:bg-brand-green/20"
          >
            <Sparkles className="h-3 w-3" />
            Diagnose
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => openModal("take-payment", { roId: ro.id })}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand-green/40 bg-brand-green-tint px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-soft hover:bg-brand-green/20"
            >
              <CreditCard className="h-3 w-3" />
              Take Payment
            </button>
            <button
              onClick={() => openModal("pre-ro-qc", { roId: ro.id })}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-[11px] font-semibold text-brand-green-foreground hover:opacity-90"
            >
              <CheckCircle className="h-3 w-3" />
              Post RO
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            <button className="rounded-md border border-border bg-background p-1.5 hover:bg-surface">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </>
      }
      metaRow={
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <MetaPair
            label="Customer"
            value={
              <Link
                to="/customers/$id"
                params={{ id: ro.customerId }}
                className="hover:underline"
              >
                {customer?.name ?? "—"}
              </Link>
            }
          />
          <MetaPair
            label="Vehicle"
            value={
              <Link
                to="/vehicles/$id"
                params={{ id: ro.vehicleId }}
                className="hover:underline"
              >
                {vehicle?.unit ?? "—"}
              </Link>
            }
          />
          <MetaPair label="Service Advisor" value="Cameron Mills" />
          <MetaPair label="Lead Tech" value={tech?.name ?? "Unassigned"} />
          <MetaPair
            label="Days In Shop"
            value={
              <span
                className={clsx(
                  ro.daysInShop >= 3 && "font-semibold text-destructive",
                )}
              >
                {ro.daysInShop} {ro.daysInShop === 1 ? "day" : "days"}
              </span>
            }
          />
        </div>
      }
      tabs={tabs}
      activeTabId={tab}
      onTabChange={(id) => setTab(id as SubTab)}
    >
      {/* Lost Revenue banner */}
      {isLostRevenue && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-lg border border-accent bg-accent/20 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#991B1B]" />
            <div>
              <p className="text-sm font-semibold text-[#991B1B]">
                {(findings?.red ?? 0) + (findings?.yellow ?? 0) - (findings?.estimated ?? 0)} inspection findings not yet on estimate
              </p>
              <p className="mt-0.5 text-xs text-[#991B1B]/80">
                Lost Revenue Risk — ~$1,200 potential revenue unestimated
              </p>
            </div>
          </div>
          <button
            onClick={() => openModal("ai-estimate-builder", { roId: ro.id })}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Build Estimate from Findings
          </button>
        </div>
      )}

      {/* Confirmation strip — shown after AI Builder has resolved the gap */}
      {lostRevenueFlagSet && isLostRevenueResolved(ro.id) && aiAddedTotal > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-brand-green/30 bg-brand-green-tint px-4 py-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-brand-green-soft" />
            <p className="text-xs font-semibold text-brand-green-soft">
              AI Estimate Builder added {aiLines.length} lines · {usd.format(aiAddedTotal)} captured
            </p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-green-soft/70">
            Resolved
          </span>
        </div>
      )}

      {/* Body: main + right rail */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {tab === "overview" && <OverviewTab roDescription={ro.description} />}
          {tab === "jobs" && <JobsTab tech={tech?.name} />}
          {tab === "parts" && <PartsTab />}
          {tab === "labor" && <LaborTab tech={tech?.name} />}
          {tab === "inspections" && (
            <InspectionTab
              roId={ro.id}
              inspectionId={inspection?.id}
              findings={findings}
            />
          )}
          {tab === "messages" && <MessagesTab customerName={customer?.name ?? ""} />}
          {tab === "files" && <FilesTab />}
          {tab === "activity" && <ActivityTab roId={ro.id} />}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          {/* Totals */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Totals
            </h3>
            <div className="mt-3 space-y-1.5">
              <TotalRow label="Subtotal" value={subtotal} />
              <TotalRow label="Tax (7%)" value={tax} />
              <div className="border-t border-border pt-2">
                <TotalRow label="Total" value={total} large />
              </div>
              <TotalRow label="Paid" value={paid} tone="success" />
              <div className="border-t border-border pt-2">
                <TotalRow
                  label="Balance Due"
                  value={balance}
                  large
                  tone={balance > 0 ? "danger" : "success"}
                />
              </div>
            </div>
            {balance > 0 && (
              <button
                onClick={() => openModal("take-payment", { roId: ro.id })}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-green px-3 py-2 text-xs font-semibold text-brand-green-foreground hover:opacity-90"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Take Payment
              </button>
            )}
          </div>

          {/* Customer card */}
          {customer && (
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer
                </h3>
                <Link
                  to="/customers/$id"
                  params={{ id: customer.id }}
                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                >
                  View
                </Link>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                  {customer.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{customer.name}</div>
                  <div className="flex items-center gap-1">
                    <span
                      className={clsx(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        customer.type === "Fleet"
                          ? "bg-[#DBEAFE] text-[#1E40AF]"
                          : "bg-surface text-muted-foreground",
                      )}
                    >
                      {customer.type}
                    </span>
                    {customer.fleetPlatform && (
                      <span className="rounded-full bg-accent/30 px-1.5 py-0.5 text-[9px] font-medium text-[#991B1B]">
                        {customer.fleetPlatform}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-[11px]">
                <div className="text-muted-foreground">{customer.contactName}</div>
                <div className="text-foreground">{customer.phone}</div>
                <div className="truncate text-foreground">{customer.email}</div>
              </div>
              <div className="mt-3 flex items-center gap-3 border-t border-border pt-2 text-[10px]">
                <div>
                  <div className="uppercase tracking-wider text-muted-foreground">LTV</div>
                  <div className="font-semibold tabular-nums">
                    {usd.format(customer.lifetimeValue)}
                  </div>
                </div>
                <div>
                  <div className="uppercase tracking-wider text-muted-foreground">
                    Open Bal
                  </div>
                  <div
                    className={clsx(
                      "font-semibold tabular-nums",
                      customer.openBalance > 0 && "text-destructive",
                    )}
                  >
                    {usd.format(customer.openBalance)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle card */}
          {vehicle && (
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Vehicle
                </h3>
                <Link
                  to="/vehicles/$id"
                  params={{ id: vehicle.id }}
                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                >
                  View
                </Link>
              </div>
              <div className="mt-3 flex h-20 items-center justify-center rounded-md bg-surface">
                <Truck className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div className="mt-3 text-sm font-semibold">{vehicle.unit}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </div>
              <div className="mt-3 space-y-1.5 text-[11px]">
                <KV label="VIN" value={vehicle.vin} mono />
                <KV label="Plate" value={vehicle.licensePlate} />
                <KV
                  label={vehicle.hours !== undefined ? "Hours" : "Mileage"}
                  value={
                    vehicle.hours !== undefined
                      ? `${vehicle.hours.toLocaleString()} hrs`
                      : `${(vehicle.mileage ?? 0).toLocaleString()} mi`
                  }
                />
                <KV
                  label="Last Service"
                  value={format(parseISO(vehicle.lastService), "MMM d, yyyy")}
                />
              </div>
            </div>
          )}
        </aside>
      </div>
    </DetailPageShell>
  );
}

// ====================================================================
// Right rail helpers
// ====================================================================
function TotalRow({
  label,
  value,
  large,
  tone,
}: {
  label: string;
  value: number;
  large?: boolean;
  tone?: "success" | "danger";
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={clsx(
          "text-[11px]",
          large ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={clsx(
          "tabular-nums",
          large ? "text-base font-semibold" : "text-xs font-medium",
          tone === "success" && "text-success",
          tone === "danger" && value !== 0 && "text-destructive",
        )}
      >
        {usd.format(value)}
      </span>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={clsx(
          "truncate text-right",
          mono && "font-mono text-[10px]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ====================================================================
// Tab panels
// ====================================================================

function OverviewTab({ roDescription }: { roDescription: string }) {
  return (
    <div className="space-y-4">
      <Section title="Concern / Symptom">
        <p className="text-sm text-foreground">{roDescription}</p>
      </Section>

      <JobsTab />

      <Section title="Recent Activity" actions={
        <button className="text-[11px] font-medium text-muted-foreground hover:text-foreground">
          View all
        </button>
      }>
        <ul className="space-y-2 text-[11px]">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-success" />
            <span>
              <span className="font-semibold">Marcus</span> completed inspection · 2h ago
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Send className="mt-0.5 h-3 w-3 shrink-0 text-foreground" />
            <span>Estimate sent to fleet manager · 1h ago</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
            <span>Flagged as Lost Revenue Risk · 1h ago</span>
          </li>
        </ul>
      </Section>
    </div>
  );
}

function JobsTab({ tech }: { tech?: string } = {}) {
  const jobs = [
    {
      id: "J1",
      name: "Brake service — front pads & rotor turn",
      hours: 2.5,
      labor: 350,
      parts: 184,
      status: "In Progress",
      authorized: true,
    },
    {
      id: "J2",
      name: "Diesel oil & filter service",
      hours: 1.5,
      labor: 210,
      parts: 138,
      status: "Scheduled",
      authorized: true,
    },
    {
      id: "J3",
      name: "Cabin AC diagnostic — rear unit",
      hours: 1.0,
      labor: 140,
      parts: 0,
      status: "Pending",
      authorized: false,
    },
  ];
  return (
    <Section
      title="Jobs"
      actions={
        <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface">
          <Plus className="h-3 w-3" />
          Add Job
        </button>
      }
    >
      <div className="space-y-2">
        {jobs.map((j) => (
          <div
            key={j.id}
            className="rounded-md border border-border bg-surface/30 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-background">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{j.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{tech ?? "Unassigned"}</span>
                    <span>·</span>
                    <span>{j.status}</span>
                    {j.authorized && (
                      <>
                        <span>·</span>
                        <span className="rounded-full bg-success/15 px-1.5 py-0.5 font-semibold text-success">
                          AUTHORIZED
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">
                  {usd.format(j.labor + j.parts)}
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  {j.hours}h · L {usd.format(j.labor)} · P {usd.format(j.parts)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PartsTab() {
  const parts = [
    { id: "P1", part: "Front brake pads (HD)", number: "HDPAD-F", vendor: "WorldPac", qty: 1, cost: 84, price: 168, status: "On Order" },
    { id: "P2", part: "Rotor (front, drilled & slotted)", number: "DR-F4509", vendor: "NAPA", qty: 2, cost: 72, price: 144, status: "In Stock" },
    { id: "P3", part: "Diesel oil filter", number: "FF5485", vendor: "Cummins", qty: 1, cost: 18, price: 36, status: "In Stock" },
    { id: "P4", part: "Engine oil 15W-40 (gal)", number: "LF9001", vendor: "Cummins", qty: 4, cost: 22, price: 38, status: "In Stock" },
  ];
  return (
    <Section
      title="Parts"
      actions={
        <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface">
          <Plus className="h-3 w-3" />
          Add Part
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-xs">
          <thead className="border-b border-border bg-surface/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Part</th>
              <th className="px-3 py-2 text-left font-semibold">Vendor</th>
              <th className="px-3 py-2 text-right font-semibold">Qty</th>
              <th className="px-3 py-2 text-right font-semibold">Cost</th>
              <th className="px-3 py-2 text-right font-semibold">Price</th>
              <th className="px-3 py-2 text-right font-semibold">Ext</th>
              <th className="px-3 py-2 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  <div className="text-xs font-medium">{p.part}</div>
                  <div className="text-[10px] text-muted-foreground">{p.number}</div>
                </td>
                <td className="px-3 py-2 text-[11px]">{p.vendor}</td>
                <td className="px-3 py-2 text-right tabular-nums">{p.qty}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  ${p.cost}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">${p.price}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">
                  ${p.qty * p.price}
                </td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={clsx(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                      p.status === "On Order"
                        ? "bg-[#FEF3C7] text-[#92400E]"
                        : "bg-success/15 text-success",
                    )}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function LaborTab({ tech }: { tech?: string }) {
  const labor = [
    { id: "L1", description: "R&R front brake pads + rotor turn", tech: tech ?? "Marcus Reeves", hours: 2.5, rate: 148, status: "Active" },
    { id: "L2", description: "Diesel oil & filter service", tech: "Andre Bell", hours: 1.5, rate: 148, status: "Pending" },
  ];
  return (
    <Section
      title="Labor"
      actions={
        <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface">
          <Plus className="h-3 w-3" />
          Add Labor
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-xs">
          <thead className="border-b border-border bg-surface/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Description</th>
              <th className="px-3 py-2 text-left font-semibold">Tech</th>
              <th className="px-3 py-2 text-right font-semibold">Hours</th>
              <th className="px-3 py-2 text-right font-semibold">Rate</th>
              <th className="px-3 py-2 text-right font-semibold">Ext</th>
              <th className="px-3 py-2 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {labor.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-medium">{l.description}</td>
                <td className="px-3 py-2 text-[11px]">{l.tech}</td>
                <td className="px-3 py-2 text-right tabular-nums">{l.hours}</td>
                <td className="px-3 py-2 text-right tabular-nums">${l.rate}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">
                  ${l.hours * l.rate}
                </td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={clsx(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                      l.status === "Active"
                        ? "bg-[#E0E7FF] text-[#3730A3]"
                        : "bg-surface text-muted-foreground",
                    )}
                  >
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function InspectionTab({
  roId,
  inspectionId,
  findings,
}: {
  roId: string;
  inspectionId?: string;
  findings?: { red: number; yellow: number; green: number; estimated: number };
}) {
  const insId = inspectionId ?? `INS-${roId}`;
  if (!findings) {
    return (
      <Section title="Inspection">
        <EmptyState
          icon={ClipboardCheck}
          title="No inspection yet"
          description="Inspection has not been completed for this RO."
        />
      </Section>
    );
  }
  const naCount = 37 - findings.red - findings.yellow - findings.green;
  return (
    <Section
      title="Inspection Summary"
      description="37-point digital vehicle inspection"
      actions={
        <Link
          to="/inspections/$id"
          params={{ id: insId }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface"
        >
          View Full <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <FindingChip count={findings.red} label="Red" tone="red" />
        <FindingChip count={findings.yellow} label="Yellow" tone="yellow" />
        <FindingChip count={findings.green} label="Green" tone="green" />
        <FindingChip count={Math.max(naCount, 0)} label="N/A" tone="gray" />
      </div>
    </Section>
  );
}

function FindingChip({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "red" | "yellow" | "green" | "gray";
}) {
  const styles: Record<typeof tone, string> = {
    red: "bg-destructive/10 text-destructive border-destructive/30",
    yellow: "bg-accent/30 text-[#991B1B] border-accent",
    green: "bg-success/15 text-success border-success/30",
    gray: "bg-surface text-muted-foreground border-border",
  };
  return (
    <div
      className={clsx(
        "flex items-center justify-between rounded-md border px-3 py-2.5",
        styles[tone],
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      <span className="text-xl font-semibold tabular-nums">{count}</span>
    </div>
  );
}

function MessagesTab({ customerName }: { customerName: string }) {
  return (
    <Section
      title="Messages"
      description={`Conversation with ${customerName}`}
      actions={
        <Link
          to="/messages"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface"
        >
          Open thread <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="space-y-2.5">
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-background px-3 py-2 text-[13px]">
            Can we add an oil change to MT-47 while you have it?
            <div className="mt-1 text-[10px] text-muted-foreground">8m ago · SMS</div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-3 py-2 text-[13px] text-background">
            Sure thing Dana, adding it now — should bring the total to about $1,950.
            <div className="mt-1 text-[10px] text-background/60">Just now · drafted</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function FilesTab() {
  const docs = [
    { id: "D1", name: "Inspection-INS-4847.pdf", size: "1.2 MB", date: "May 18, 2026" },
    { id: "D2", name: "Estimate-EST-4847.pdf", size: "284 KB", date: "May 18, 2026" },
    { id: "D3", name: "Customer-signature.png", size: "112 KB", date: "May 17, 2026" },
    { id: "D4", name: "Invoice-draft.pdf", size: "198 KB", date: "May 20, 2026" },
  ];
  return (
    <Section
      title="Files"
      actions={
        <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface">
          <Plus className="h-3 w-3" />
          Upload
        </button>
      }
    >
      <div className="divide-y divide-border">
        {docs.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-xs font-medium">{d.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {d.size} · {d.date}
                </div>
              </div>
            </div>
            <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface">
              <Download className="h-3 w-3" /> Download
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ActivityTab({ roId }: { roId: string }) {
  const events = [
    {
      id: "AC1",
      icon: CheckCircle,
      title: "Inspection completed",
      detail: "Marcus completed 37-point inspection — 2 red, 3 yellow",
      time: "2h ago",
      actor: "Marcus Reeves",
    },
    {
      id: "AC2",
      icon: Send,
      title: "Estimate sent to fleet manager",
      detail: `EST-${roId} delivered via Fleetio to Dana Whitfield`,
      time: "1h ago",
      actor: "System",
    },
    {
      id: "AC3",
      icon: AlertTriangle,
      title: "Flagged as Lost Revenue Risk",
      detail: "4 inspection findings missing from estimate",
      time: "1h ago",
      actor: "System",
    },
    {
      id: "AC4",
      icon: Camera,
      title: "Photos uploaded",
      detail: "5 inspection photos attached to findings",
      time: "3h ago",
      actor: "Marcus Reeves",
    },
    {
      id: "AC5",
      icon: User,
      title: "Vehicle checked in",
      detail: "Med Trust Unit 47 arrived at bay 2",
      time: "3d ago",
      actor: "Cameron Mills",
    },
  ];
  return (
    <Section title="Activity Log">
      <ol className="relative space-y-1 border-l border-border pl-6">
        {events.map((e) => {
          const Icon = e.icon;
          return (
            <li key={e.id} className="relative pb-4">
              <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-border">
                <Icon className="h-3 w-3" />
              </span>
              <div className="text-xs font-semibold">{e.title}</div>
              <div className="text-[11px] text-muted-foreground">{e.detail}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {e.time} · {e.actor}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

// ====================================================================
// Common Section wrapper
// ====================================================================
function Section({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
          )}
        </div>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
