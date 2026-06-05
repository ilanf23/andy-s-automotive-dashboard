import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Send,
  Sparkles,
  AlertTriangle,
  FileText,
  Mail,
  Printer,
  Plus,
  Wrench,
  ArrowRight,
  CheckCircle,
  Truck,
  Save,
  Trash2,
  X,
  Copy,
  CheckCheck,
} from "lucide-react";
import clsx from "clsx";
import { DetailPageShell, MetaPair } from "@/components/shop/DetailPageShell";
import { PageShell } from "@/components/shop/PageShell";
import { EmptyState } from "@/components/shop/EmptyState";
import { estimates, type EstimateLineItem } from "@/data/estimates";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { repairOrders } from "@/data/repairOrders";
import { useModals } from "@/components/ui/ModalProvider";
import { toast } from "sonner";
import { usdCents } from "@/lib/format";
import { CatalogSearchModal } from "@/components/catalog/CatalogSearchModal";
import { Search } from "lucide-react";

export const Route = createFileRoute("/estimates/$id")({
  component: EstimateDetail,
});

type LineStatus = EstimateLineItem["status"];

const statusPillStyles: Record<string, string> = {
  draft: "bg-surface text-foreground border-border",
  sent: "bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]",
  approved: "bg-success/15 text-success border-success/30",
  declined: "bg-destructive/10 text-destructive border-destructive/30",
  "partially-approved": "bg-accent/30 text-[#991B1B] border-accent",
};

type Tab = "lines" | "customer" | "messages" | "activity";

type ExtraLine = {
  id: string;
  description: string;
  partNumber?: string;
  qty: number;
  partPrice: number;
  laborHours: number;
  laborPrice: number;
  total: number;
};

type LineEdit = {
  qty: number;
  partPrice: number;
  laborHours: number;
  laborPrice: number;
};

function EstimateDetail() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<Tab>("lines");
  const { open: openModal } = useModals();
  const navigate = useNavigate();
  const estimate = estimates.find((e) => e.id === id);

  const initialStatuses = useMemo(() => {
    const m: Record<string, LineStatus> = {};
    estimate?.lineItems.forEach((li) => {
      m[li.id] = li.status;
    });
    return m;
  }, [estimate]);

  const initialLineEdits = useMemo(() => {
    const m: Record<string, LineEdit> = {};
    estimate?.lineItems.forEach((li) => {
      m[li.id] = {
        qty: li.qty,
        partPrice: li.partPrice,
        laborHours: li.laborHours,
        laborPrice: li.laborPrice,
      };
    });
    return m;
  }, [estimate]);

  const [lineStatuses, setLineStatuses] = useState<Record<string, LineStatus>>(initialStatuses);
  const [lineEdits, setLineEdits] = useState<Record<string, LineEdit>>(initialLineEdits);
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
  const [extraLines, setExtraLines] = useState<ExtraLine[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [showSend, setShowSend] = useState(false);
  const [showAddLine, setShowAddLine] = useState(false);
  const [sentStatus, setSentStatus] = useState<"draft" | "sent" | "approved" | null>(null);

  if (!estimate) {
    return (
      <PageShell title={`Estimate ${id}`}>
        <EmptyState
          icon={FileText}
          title="Estimate not found"
          description={`We couldn't find an estimate with ID ${id}.`}
        />
      </PageShell>
    );
  }

  const customer = customers.find((c) => c.id === estimate.customerId);
  const vehicle = vehicles.find((v) => v.id === estimate.vehicleId);
  const ro = repairOrders.find((r) => r.id === estimate.repairOrderId);

  const computeLineTotal = (edit: LineEdit) =>
    edit.qty * edit.partPrice + edit.laborHours * edit.laborPrice;

  const visibleLineItems = estimate.lineItems.filter((li) => !hiddenLines.has(li.id));

  const authorizedCount = visibleLineItems.filter(
    (li) => lineStatuses[li.id] === "authorized",
  ).length;
  const pendingCount = visibleLineItems.filter(
    (li) => lineStatuses[li.id] === "pending",
  ).length;
  const declinedCount = visibleLineItems.filter(
    (li) => lineStatuses[li.id] === "declined",
  ).length;

  const visibleSubtotal =
    visibleLineItems.reduce((acc, li) => {
      const edit = lineEdits[li.id] ?? {
        qty: li.qty,
        partPrice: li.partPrice,
        laborHours: li.laborHours,
        laborPrice: li.laborPrice,
      };
      return acc + computeLineTotal(edit);
    }, 0) + extraLines.reduce((acc, l) => acc + l.total, 0);
  const computedTax = Math.round(visibleSubtotal * 0.07);
  const computedTotal = Math.max(0, visibleSubtotal + computedTax - discount * 100);

  const authorizedSubtotal = visibleLineItems
    .filter((li) => lineStatuses[li.id] === "authorized")
    .reduce((acc, li) => {
      const edit = lineEdits[li.id] ?? {
        qty: li.qty,
        partPrice: li.partPrice,
        laborHours: li.laborHours,
        laborPrice: li.laborPrice,
      };
      return acc + computeLineTotal(edit);
    }, 0);

  const isThinEstimate = estimate.id === "EST-4847";

  const shareLink = `https://demo.andysautomotive.com/e/${estimate.id}`;

  const handleSendOpen = () => setShowSend(true);
  const handleSendConfirm = (channels: { sms: boolean; email: boolean }) => {
    const parts = [channels.sms && "SMS", channels.email && "Email"].filter(Boolean).join(" + ");
    toast.success("Estimate sent", {
      description: `To ${customer?.contactName ?? "customer"} via ${parts || "Email"}`,
    });
    setSentStatus("sent");
    setShowSend(false);
  };

  const handlePrint = () => {
    window.print();
    toast.info("Print preview opened");
  };

  const handleConvertToRO = () => {
    openModal("confirm", {
      title: `Convert ${estimate.id} to a Repair Order?`,
      description:
        "Approved line items become billable on the RO. Pending items move to recommendations. The customer will receive a notification.",
      confirmLabel: "Convert to RO",
      tone: "success",
      onConfirm: () => {
        toast.success(`${estimate.id} converted`, {
          description:
            "Authorized lines moved to RO; pending lines saved as recommendations",
        });
        navigate({
          to: "/repair-orders/$id",
          params: { id: ro?.id ?? "4847" },
        });
      },
    });
  };

  const handleBuildFromFindings = () => {
    openModal("ai-estimate-builder", { roId: ro?.id ?? estimate.repairOrderId });
    toast.info("Building estimate from findings…");
  };

  const handleMarkAllApproved = () => {
    setLineStatuses((prev) => {
      const next = { ...prev };
      visibleLineItems.forEach((li) => {
        next[li.id] = "authorized";
      });
      return next;
    });
    toast.success("All lines marked authorized");
  };

  const handleSimulateApproved = () => {
    setLineStatuses((prev) => {
      const next = { ...prev };
      visibleLineItems.forEach((li) => {
        next[li.id] = "authorized";
      });
      return next;
    });
    setSentStatus("approved");
    toast.success("Customer approved estimate", {
      description: "Ready to convert to RO",
    });
  };

  const displayStatus = sentStatus ?? estimate.status;

  const tabs = [
    { id: "lines", label: "Line Items", count: estimate.lineItems.length },
    { id: "customer", label: "Customer & Vehicle" },
    { id: "messages", label: "Messages", count: 2, badgeTone: "accent" as const },
    { id: "activity", label: "Activity" },
  ];

  return (
    <>
    <DetailPageShell
      backTo="/estimates"
      backLabel="All estimates"
      eyebrow={`ESTIMATE · CREATED ${format(parseISO(estimate.createdAt), "MMM d, yyyy 'AT' h:mm a").toUpperCase()}`}
      title={`${estimate.id} - ${customer?.name ?? "Unknown"}`}
      titleMeta={
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={clsx(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
              statusPillStyles[displayStatus] ?? statusPillStyles[estimate.status],
            )}
          >
            {displayStatus.replace("-", " ")}
          </span>
          {estimate.sentToFleetManager && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E0E7FF] px-2 py-0.5 text-[10px] font-semibold text-[#3730A3]">
              <Send className="h-2.5 w-2.5" />
              Sent via Fleet Mgr
            </span>
          )}
          {ro && (
            <Link
              to="/repair-orders/$id"
              params={{ id: ro.id }}
              className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-foreground hover:bg-foreground hover:text-background"
            >
              <Wrench className="h-2.5 w-2.5" />
              RO #{ro.id}
            </Link>
          )}
        </div>
      }
      headerRight={
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total
          </div>
          <div className="text-3xl font-semibold tracking-tight tabular-nums">
            {usdCents.format(computedTotal)}
          </div>
          <div className="text-[11px] text-success">
            Authorized: <span className="font-semibold tabular-nums">{usdCents.format(authorizedSubtotal)}</span>
          </div>
        </div>
      }
      actions={
        <>
          <button
            type="button"
            onClick={() => toast.success("Estimate saved")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <Save className="h-3 w-3" />
            Save
          </button>
          <button
            type="button"
            onClick={handleSendOpen}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <Mail className="h-3 w-3" />
            Send to Customer
          </button>
          <button
            type="button"
            onClick={() =>
              openModal("customer-estimate-explainer", {
                estimateId: estimate.id,
                customerName: customer?.name,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-green/40 bg-brand-green-tint px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-soft hover:bg-brand-green/20"
          >
            <Sparkles className="h-3 w-3" />
            Preview customer view
          </button>
          <button
            type="button"
            onClick={() =>
              openModal("frankenstein-labor", {
                jobDescription: "R&R front brake pads + rotor turn",
                vehicleLabel: vehicle
                  ? `${vehicle.unit} · ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.isFrankenstein ? " (Frankenstein)" : ""}`
                  : undefined,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-green/40 bg-brand-green-tint px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-soft hover:bg-brand-green/20"
          >
            <Sparkles className="h-3 w-3" />
            AI: Lookup labor
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <Printer className="h-3 w-3" />
            Print
          </button>
          <button
            type="button"
            onClick={handleMarkAllApproved}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <CheckCheck className="h-3 w-3" />
            Mark All Approved
          </button>
          <button
            type="button"
            onClick={handleSimulateApproved}
            className="inline-flex items-center gap-1.5 rounded-md border border-accent bg-accent/20 px-2.5 py-1.5 text-[11px] font-semibold text-[#991B1B] hover:bg-accent/30"
          >
            <Sparkles className="h-3 w-3" />
            Simulate customer approved
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                openModal("fleet-submit", {
                  estimateId: estimate.id,
                  platform: "Fleetio",
                })
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
            >
              <Send className="h-3 w-3" />
              Send to Fleet Mgr
            </button>
            <button
              type="button"
              onClick={handleConvertToRO}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-[11px] font-semibold text-brand-green-foreground hover:opacity-90"
            >
              <Wrench className="h-3 w-3" />
              Convert to RO
            </button>
          </div>
        </>
      }
      metaRow={
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <MetaPair label="Customer" value={customer?.name ?? "-"} />
          <MetaPair label="Vehicle" value={vehicle?.unit ?? "-"} />
          <MetaPair
            label="Y/M/M"
            value={
              vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "-"
            }
          />
          <MetaPair
            label="Routing"
            value={
              estimate.sentToFleetManager
                ? `Fleet Manager · ${customer?.fleetPlatform ?? "Direct"}`
                : "Customer direct"
            }
          />
          <MetaPair label="Lines" value={`${estimate.lineItems.length} items`} />
        </div>
      }
      tabs={tabs}
      activeTabId={tab}
      onTabChange={(id) => setTab(id as Tab)}
    >
      {/* Thin estimate / Lost Revenue Risk callout */}
      {isThinEstimate && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-lg border-2 border-accent bg-accent/15 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#991B1B]" />
            <div>
              <p className="text-sm font-semibold text-[#991B1B]">
                5 inspection findings - only 1 on this estimate
              </p>
              <p className="mt-0.5 text-xs text-[#991B1B]/80">
                4 unestimated items totaling ~$1,200 potential revenue
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleBuildFromFindings}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Build from Findings
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {tab === "lines" && (
            <LinesTab
              estimate={estimate}
              lineStatuses={lineStatuses}
              setLineStatuses={setLineStatuses}
              lineEdits={lineEdits}
              setLineEdits={setLineEdits}
              hiddenLines={hiddenLines}
              setHiddenLines={setHiddenLines}
              extraLines={extraLines}
              setExtraLines={setExtraLines}
              onAddLine={() => setShowAddLine(true)}
            />
          )}
          {tab === "customer" && (
            <CustomerVehicleTab customer={customer} vehicle={vehicle} />
          )}
          {tab === "messages" && <MessagesTab />}
          {tab === "activity" && <ActivityTab estimateId={estimate.id} />}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Totals
            </h3>
            <div className="mt-3 space-y-1.5 text-sm">
              <Row label="Subtotal" value={usdCents.format(visibleSubtotal)} />
              <Row label="Tax" value={usdCents.format(computedTax)} />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Discount</span>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted-foreground">$</span>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="w-16 rounded border border-border bg-background px-1.5 py-0.5 text-right text-xs tabular-nums"
                  />
                </div>
              </div>
              <div className="border-t border-border pt-2">
                <Row
                  label="Total"
                  value={usdCents.format(computedTotal)}
                  large
                />
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t border-border pt-3 text-[11px]">
              <Row
                label="Authorized"
                value={
                  <span className="font-semibold text-success tabular-nums">
                    {authorizedCount}
                  </span>
                }
              />
              <Row
                label="Pending"
                value={
                  <span className="font-semibold text-muted-foreground tabular-nums">
                    {pendingCount}
                  </span>
                }
              />
              <Row
                label="Declined"
                value={
                  <span className="font-semibold text-destructive tabular-nums">
                    {declinedCount}
                  </span>
                }
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </h3>
            <div className="mt-3 space-y-2">
              <ActionButton
                icon={Mail}
                label="Email to customer"
                onClick={handleSendOpen}
              />
              <ActionButton
                icon={Send}
                label="Send to fleet manager"
                onClick={() =>
                  openModal("fleet-submit", {
                    estimateId: estimate.id,
                    platform: "Fleetio",
                  })
                }
              />
              <ActionButton
                icon={Printer}
                label="Print estimate"
                onClick={handlePrint}
              />
              <ActionButton
                icon={Wrench}
                label="Convert to RO"
                featured
                onClick={handleConvertToRO}
              />
            </div>
          </div>
        </aside>
      </div>
    </DetailPageShell>
    {showSend && (
      <SendEstimateModal
        estimateId={estimate.id}
        customer={customer}
        shareLink={shareLink}
        onClose={() => setShowSend(false)}
        onSend={handleSendConfirm}
      />
    )}
    {showAddLine && (
      <AddLineModal
        onClose={() => setShowAddLine(false)}
        onSave={(line) => {
          setExtraLines((prev) => [...prev, line]);
          toast.success("Line added");
          setShowAddLine(false);
        }}
      />
    )}
    </>
  );
}

// ====================================================================
// Tabs
// ====================================================================

function LinesTab({
  estimate,
  lineStatuses,
  setLineStatuses,
  lineEdits,
  setLineEdits,
  hiddenLines,
  setHiddenLines,
  extraLines,
  setExtraLines,
  onAddLine,
}: {
  estimate: ReturnType<typeof estimates.find>;
  lineStatuses: Record<string, LineStatus>;
  setLineStatuses: React.Dispatch<React.SetStateAction<Record<string, LineStatus>>>;
  lineEdits: Record<string, LineEdit>;
  setLineEdits: React.Dispatch<React.SetStateAction<Record<string, LineEdit>>>;
  hiddenLines: Set<string>;
  setHiddenLines: React.Dispatch<React.SetStateAction<Set<string>>>;
  extraLines: ExtraLine[];
  setExtraLines: React.Dispatch<React.SetStateAction<ExtraLine[]>>;
  onAddLine: () => void;
}) {
  if (!estimate) return null;
  const updateEdit = (id: string, patch: Partial<LineEdit>) => {
    setLineEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };
  const handleDeleteLine = (id: string, description: string) => {
    if (confirm(`Remove "${description}" from this estimate?`)) {
      setHiddenLines((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      toast.info("Line removed");
    }
  };
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Line Items</h3>
        <button
          type="button"
          onClick={onAddLine}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface"
        >
          <Plus className="h-3 w-3" />
          Add Line
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="border-b border-border bg-surface/40">
            <tr>
              <Th>Description</Th>
              <Th>Part #</Th>
              <Th>Vendor</Th>
              <Th align="right">Qty</Th>
              <Th align="right">Part $</Th>
              <Th align="right">Labor Hrs</Th>
              <Th align="right">Labor $</Th>
              <Th align="right">Total</Th>
              <Th>Status</Th>
              <Th>&nbsp;</Th>
            </tr>
          </thead>
          <tbody>
            {estimate.lineItems
              .filter((li) => !hiddenLines.has(li.id))
              .map((li) => {
                const current = lineStatuses[li.id] ?? li.status;
                const edit =
                  lineEdits[li.id] ?? {
                    qty: li.qty,
                    partPrice: li.partPrice,
                    laborHours: li.laborHours,
                    laborPrice: li.laborPrice,
                  };
                const total =
                  edit.qty * edit.partPrice + edit.laborHours * edit.laborPrice;
                return (
                  <tr key={li.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5 align-top">
                      <div className="text-xs font-medium">{li.description}</div>
                      {li.aiEstimated && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-accent bg-accent/20 px-1.5 py-0.5 text-[9px] font-semibold text-[#991B1B]">
                          <Sparkles className="h-2.5 w-2.5" />
                          AI-estimated
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top font-mono text-[10px] text-muted-foreground">
                      {li.partNumber ?? "-"}
                    </td>
                    <td className="px-3 py-2.5 align-top text-[11px] text-muted-foreground">
                      {li.vendor ?? "-"}
                    </td>
                    <td className="px-3 py-2.5 text-right align-top">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={edit.qty}
                        onChange={(e) =>
                          updateEdit(li.id, { qty: Number(e.target.value) || 0 })
                        }
                        className="w-14 rounded border border-border bg-background px-1.5 py-0.5 text-right text-xs tabular-nums"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right align-top">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={edit.partPrice}
                        onChange={(e) =>
                          updateEdit(li.id, {
                            partPrice: Number(e.target.value) || 0,
                          })
                        }
                        className="w-20 rounded border border-border bg-background px-1.5 py-0.5 text-right text-xs tabular-nums"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right align-top">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={edit.laborHours}
                        onChange={(e) =>
                          updateEdit(li.id, {
                            laborHours: Number(e.target.value) || 0,
                          })
                        }
                        className="w-16 rounded border border-border bg-background px-1.5 py-0.5 text-right text-xs tabular-nums"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right align-top">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={edit.laborPrice}
                        onChange={(e) =>
                          updateEdit(li.id, {
                            laborPrice: Number(e.target.value) || 0,
                          })
                        }
                        className="w-20 rounded border border-border bg-background px-1.5 py-0.5 text-right text-xs tabular-nums"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right align-top text-xs font-semibold tabular-nums">
                      {usdCents.format(total)}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <SegmentedStatus
                        value={current}
                        onChange={(s) =>
                          setLineStatuses((prev) => ({ ...prev, [li.id]: s }))
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <button
                        type="button"
                        onClick={() => handleDeleteLine(li.id, li.description)}
                        className="inline-flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove line"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            {extraLines.map((line) => (
              <tr key={line.id} className="border-b border-border last:border-0 bg-success/5">
                <td className="px-3 py-2.5 align-top">
                  <div className="text-xs font-medium">{line.description}</div>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-1.5 py-0.5 text-[9px] font-semibold text-success">
                    Added
                  </span>
                </td>
                <td className="px-3 py-2.5 align-top font-mono text-[10px] text-muted-foreground">
                  {line.partNumber ?? "-"}
                </td>
                <td className="px-3 py-2.5 align-top text-[11px] text-muted-foreground">-</td>
                <td className="px-3 py-2.5 text-right align-top tabular-nums text-xs">
                  {line.qty}
                </td>
                <td className="px-3 py-2.5 text-right align-top tabular-nums text-xs">
                  {usdCents.format(line.partPrice)}
                </td>
                <td className="px-3 py-2.5 text-right align-top tabular-nums text-xs">
                  {line.laborHours.toFixed(1)}
                </td>
                <td className="px-3 py-2.5 text-right align-top tabular-nums text-xs">
                  {usdCents.format(line.laborPrice)}
                </td>
                <td className="px-3 py-2.5 text-right align-top text-xs font-semibold tabular-nums">
                  {usdCents.format(line.total)}
                </td>
                <td className="px-3 py-2.5 align-top">
                  <span className="text-[10px] text-muted-foreground">draft</span>
                </td>
                <td className="px-3 py-2.5 align-top">
                  <button
                    type="button"
                    onClick={() => {
                      setExtraLines((prev) => prev.filter((l) => l.id !== line.id));
                      toast.info("Line removed");
                    }}
                    className="inline-flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove line"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerVehicleTab({
  customer,
  vehicle,
}: {
  customer?: ReturnType<typeof customers.find>;
  vehicle?: ReturnType<typeof vehicles.find>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-background p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Customer</h3>
        {customer && (
          <div className="mt-3 space-y-2 text-sm">
            <div className="text-lg font-semibold">{customer.name}</div>
            <div className="text-xs text-muted-foreground">
              {customer.contactName}
            </div>
            <div className="space-y-1 text-xs">
              <div>{customer.phone}</div>
              <div>{customer.email}</div>
              <div className="text-muted-foreground">
                {customer.address}, {customer.city}, {customer.state} {customer.zip}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-lg border border-border bg-background p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Vehicle</h3>
        {vehicle && (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex h-16 w-full items-center justify-center rounded-md bg-surface">
              <Truck className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <div className="text-lg font-semibold">{vehicle.unit}</div>
            <div className="text-xs text-muted-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </div>
            <div className="space-y-1 text-xs">
              <div>VIN: <span className="font-mono text-[10px]">{vehicle.vin}</span></div>
              <div>Plate: {vehicle.licensePlate}</div>
              <div className="text-muted-foreground">
                {vehicle.hours !== undefined
                  ? `${vehicle.hours.toLocaleString()} hrs`
                  : `${(vehicle.mileage ?? 0).toLocaleString()} mi`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessagesTab() {
  const [draft, setDraft] = useState("");
  const [extraMessages, setExtraMessages] = useState<
    { id: string; text: string; ts: string }[]
  >([]);
  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setExtraMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, text, ts: "just now" },
    ]);
    setDraft("");
    toast.success("Message sent");
  };
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Customer Communication</h3>
        <Link
          to="/messages"
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          Open in Messages <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-3 space-y-2.5">
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-3 py-2 text-[13px] text-background">
            Here's the estimate for the brake service + ABS sensor. Should I greenlight?
            <div className="mt-1 text-[10px] text-background/60">2h ago · Email</div>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-background px-3 py-2 text-[13px]">
            Approved on brake service + ABS sensor. Skip the DEF doser for now.
            <div className="mt-1 text-[10px] text-muted-foreground">1h ago · Email</div>
          </div>
        </div>
        {extraMessages.map((m) => (
          <div key={m.id} className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-3 py-2 text-[13px] text-background">
              {m.text}
              <div className="mt-1 text-[10px] text-background/60">{m.ts} · Email</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type a message…"
          className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={handleSend}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
        >
          <Send className="h-3 w-3" />
          Send
        </button>
      </div>
    </div>
  );
}

function ActivityTab({ estimateId }: { estimateId: string }) {
  const events = [
    { id: "1", icon: FileText, title: "Estimate created", time: "Yesterday 3:10 PM" },
    { id: "2", icon: Send, title: `Sent to fleet manager via Fleetio`, time: "Yesterday 3:14 PM" },
    { id: "3", icon: CheckCircle, title: "Customer reviewed", time: "Yesterday 4:30 PM" },
    { id: "4", icon: AlertTriangle, title: "Flagged: 4 inspection findings unestimated", time: "Today 9:14 AM" },
  ];
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider">Activity</h3>
      <ol className="relative mt-3 space-y-1 border-l border-border pl-6">
        {events.map((e) => {
          const Icon = e.icon;
          return (
            <li key={e.id} className="relative pb-3">
              <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-border">
                <Icon className="h-3 w-3" />
              </span>
              <div className="text-xs font-semibold">{e.title}</div>
              <div className="text-[10px] text-muted-foreground">{e.time}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ====================================================================
// Helpers
// ====================================================================

function Row({
  label,
  value,
  large,
}: {
  label: string;
  value: React.ReactNode;
  large?: boolean;
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
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  featured,
  onClick,
}: {
  icon: typeof FileText;
  label: string;
  featured?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[12px] font-medium transition-colors",
        featured
          ? "bg-foreground text-background hover:opacity-90"
          : "border border-border bg-background hover:bg-surface",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={clsx(
        "whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

function SegmentedStatus({
  value,
  onChange,
}: {
  value: LineStatus;
  onChange: (s: LineStatus) => void;
}) {
  const options: { key: LineStatus; label: string; active: string }[] = [
    { key: "authorized", label: "Auth", active: "bg-success text-success-foreground" },
    { key: "pending", label: "Pend", active: "bg-foreground text-background" },
    { key: "declined", label: "Decl", active: "bg-destructive text-destructive-foreground" },
  ];
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-border bg-background">
      {options.map((o) => {
        const isActive = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={clsx(
              "px-1.5 py-1 text-[9px] font-semibold transition-colors",
              isActive ? o.active : "text-muted-foreground hover:bg-surface/60",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ====================================================================
// Modals
// ====================================================================

function SendEstimateModal({
  estimateId,
  customer,
  shareLink,
  onClose,
  onSend,
}: {
  estimateId: string;
  customer?: ReturnType<typeof customers.find>;
  shareLink: string;
  onClose: () => void;
  onSend: (channels: { sms: boolean; email: boolean }) => void;
}) {
  const [sms, setSms] = useState(true);
  const [email, setEmail] = useState(true);
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [emailAddr, setEmailAddr] = useState(customer?.email ?? "");
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState(true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Send estimate {estimateId}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 px-4 py-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Channels
            </div>
            <div className="mt-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={sms}
                  onChange={(e) => setSms(e.target.checked)}
                />
                Text (SMS)
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={email}
                  onChange={(e) => setEmail(e.target.checked)}
                />
                Email
              </label>
            </div>
          </div>
          {sms && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
              />
            </div>
          )}
          {email && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
              />
            </div>
          )}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Hi - your estimate is ready for review."
              className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Customer share link
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  toast.success("Link copied");
                }}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={followUp}
              onChange={(e) => setFollowUp(e.target.checked)}
            />
            Follow-up reminder in 24h
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSend({ sms, email })}
            disabled={!sms && !email}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-3 w-3" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function AddLineModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (line: ExtraLine) => void;
}) {
  const [description, setDescription] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [qty, setQty] = useState(1);
  const [partPrice, setPartPrice] = useState(0);
  const [laborHours, setLaborHours] = useState(0);
  const [laborPrice, setLaborPrice] = useState(0);
  const [laborSearchOpen, setLaborSearchOpen] = useState(false);
  const [partsSearchOpen, setPartsSearchOpen] = useState(false);

  const total = qty * partPrice + laborHours * laborPrice;

  const handleSave = () => {
    if (!description.trim()) {
      toast.error("Description required");
      return;
    }
    onSave({
      id: `extra-${Date.now()}`,
      description: description.trim(),
      partNumber: partNumber.trim() || undefined,
      qty,
      partPrice,
      laborHours,
      laborPrice,
      total,
    });
  };

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Add line item</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 px-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLaborSearchOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-brand-green/40 bg-brand-green-tint px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-soft hover:bg-brand-green/20"
            >
              <Search className="h-3 w-3" />
              Find labor
            </button>
            <button
              type="button"
              onClick={() => setPartsSearchOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-brand-green/40 bg-brand-green-tint px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-soft hover:bg-brand-green/20"
            >
              <Search className="h-3 w-3" />
              Find part
            </button>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
              className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Part #
            </label>
            <input
              type="text"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[11px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Qty
              </label>
              <input
                type="number"
                min={0}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Part price (¢)
              </label>
              <input
                type="number"
                min={0}
                value={partPrice}
                onChange={(e) => setPartPrice(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Labor hours
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={laborHours}
                onChange={(e) => setLaborHours(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Labor price (¢)
              </label>
              <input
                type="number"
                min={0}
                value={laborPrice}
                onChange={(e) => setLaborPrice(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs tabular-nums"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-surface/40 px-3 py-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <span className="font-semibold tabular-nums">{usdCents.format(total)}</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    <CatalogSearchModal
      open={laborSearchOpen}
      onClose={() => setLaborSearchOpen(false)}
      mode="labor"
      onSelectLabor={(entry) => {
        setDescription(entry.description);
        setLaborHours(entry.laborHours);
        // Standard $135/hr rate, stored as cents (matches existing units).
        setLaborPrice(135 * 100);
        toast.success(`Loaded ${entry.jobCode}`);
      }}
    />
    <CatalogSearchModal
      open={partsSearchOpen}
      onClose={() => setPartsSearchOpen(false)}
      mode="parts"
      onSelectPart={(entry) => {
        setDescription(entry.description);
        setPartNumber(entry.partNumber);
        setQty(1);
        // Price stored as cents in this modal - convert dollars → cents.
        setPartPrice(entry.unitPrice * 100);
        toast.success(`Loaded ${entry.partNumber}`);
      }}
    />
    </>
  );
}
