import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  Camera,
  Check,
  X,
  Minus,
  Circle,
  Sparkles,
  ClipboardCheck,
  Image as ImageIcon,
  Save,
  Send,
  Printer,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { DetailPageShell, MetaPair } from "@/components/shop/DetailPageShell";
import { PageShell } from "@/components/shop/PageShell";
import { EmptyState } from "@/components/shop/EmptyState";
import {
  type Inspection,
  type InspectionItem,
  type InspectionItemStatus,
} from "@/data/inspections";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { technicians } from "@/data/technicians";
import { useModals } from "@/components/ui/ModalProvider";
import { VoiceToInspection } from "@/components/ai/VoiceToInspection";
import { useShopState, completeInspection } from "@/lib/shop-store";

export const Route = createFileRoute("/inspections/$id")({
  component: InspectionDetail,
});

const statusMeta: Record<
  InspectionItemStatus,
  { label: string; bg: string; text: string; icon: typeof Check }
> = {
  green: {
    label: "Pass",
    bg: "bg-success text-success-foreground",
    text: "text-success",
    icon: Check,
  },
  yellow: {
    label: "Caution",
    bg: "bg-accent text-accent-foreground",
    text: "text-[#991B1B]",
    icon: AlertTriangle,
  },
  red: {
    label: "Fail",
    bg: "bg-destructive text-destructive-foreground",
    text: "text-destructive",
    icon: X,
  },
  na: {
    label: "N/A",
    bg: "bg-foreground text-background",
    text: "text-muted-foreground",
    icon: Minus,
  },
  unset: {
    label: "Not graded",
    bg: "bg-surface text-muted-foreground border border-dashed border-border",
    text: "text-muted-foreground",
    icon: Circle,
  },
};

type Tab = "findings" | "summary" | "photos" | "history";

function InspectionDetail() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<Tab>("findings");
  const [filter, setFilter] = useState<InspectionItemStatus | "all">("all");
  const { open: openModal } = useModals();
  const navigate = useNavigate();
  const [sentAt, setSentAt] = useState<Date | null>(null);
  const [itemStatuses, setItemStatuses] = useState<Record<string, InspectionItemStatus>>({});
  const { inspections, repairOrders } = useShopState();

  const handleBuildEstimate = () => {
    if (!ro) return;
    openModal("ai-estimate-builder", { roId: ro.id });
    toast.info("Building estimate from findings…");
    setTimeout(() => {
      navigate({ to: "/estimates/$id", params: { id: "EST-4847" } });
      toast.success("Estimate created", {
        description: "Review and send to customer",
      });
    }, 2500);
  };

  const inspection = inspections.find((i) => i.id === id);

  if (!inspection) {
    return (
      <PageShell title={`Inspection ${id}`}>
        <EmptyState
          icon={ClipboardCheck}
          title="Inspection not found"
          description={`We couldn't find an inspection with ID ${id}.`}
        />
      </PageShell>
    );
  }

  const ro = repairOrders.find((r) => r.id === inspection.repairOrderId);
  const customer = ro ? customers.find((c) => c.id === ro.customerId) : undefined;
  const vehicle = ro ? vehicles.find((v) => v.id === ro.vehicleId) : undefined;
  const tech = technicians.find((t) => t.id === inspection.technicianId);

  const effectiveStatus = (item: InspectionItem): InspectionItemStatus =>
    itemStatuses[item.id] ?? item.status;

  const counts = useMemo(() => {
    const eff = inspection.items.map(effectiveStatus);
    return {
      red: eff.filter((s) => s === "red").length,
      yellow: eff.filter((s) => s === "yellow").length,
      green: eff.filter((s) => s === "green").length,
      na: eff.filter((s) => s === "na").length,
      unset: eff.filter((s) => s === "unset").length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspection, itemStatuses]);

  const gradedCount = inspection.items.length - counts.unset;
  const isFullyGraded = counts.unset === 0;

  // Group by category
  const itemsByCategory = useMemo(() => {
    const m = new Map<string, typeof inspection.items>();
    for (const it of inspection.items) {
      const arr = m.get(it.category) ?? [];
      arr.push(it);
      m.set(it.category, arr);
    }
    return m;
  }, [inspection]);

  const photoCount = inspection.items.filter((i) => i.hasPhoto).length;

  const tabs = [
    { id: "findings", label: "Findings", count: inspection.items.length },
    { id: "summary", label: "Summary" },
    { id: "photos", label: "Photos", count: photoCount },
    { id: "history", label: "History" },
  ];

  return (
    <DetailPageShell
      backTo="/inspections"
      backLabel="All inspections"
      eyebrow={
        inspection.completedAt
          ? `INSPECTION · COMPLETED ${format(parseISO(inspection.completedAt), "MMM d, yyyy 'AT' h:mm a").toUpperCase()}`
          : `INSPECTION · IN PROGRESS - ${gradedCount} OF ${inspection.items.length} GRADED`
      }
      title={`${inspection.id} - ${vehicle?.unit ?? "Unknown vehicle"}`}
      titleMeta={
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold">
            37-point DVI
          </span>
          {counts.red > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
              <AlertTriangle className="h-2.5 w-2.5" />
              {counts.red} red
            </span>
          )}
          {counts.yellow > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-[#991B1B]">
              {counts.yellow} yellow
            </span>
          )}
          {ro && (
            <Link
              to="/repair-orders/$id"
              params={{ id: ro.id }}
              className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background hover:opacity-90"
            >
              RO #{ro.id}
            </Link>
          )}
        </div>
      }
      headerRight={
        <div className={clsx("grid gap-2", counts.unset > 0 ? "grid-cols-5" : "grid-cols-4")}>
          {counts.unset > 0 && (
            <FindingTile count={counts.unset} label="Not graded" tone="dashed" />
          )}
          <FindingTile count={counts.red} label="Red" tone="red" />
          <FindingTile count={counts.yellow} label="Yellow" tone="yellow" />
          <FindingTile count={counts.green} label="Green" tone="green" />
          <FindingTile count={counts.na} label="N/A" tone="gray" />
        </div>
      }
      actions={
        <>
          <VoiceToInspection />
          <button
            type="button"
            onClick={() =>
              toast.success("Inspection saved", {
                description: `Draft autosaved at ${new Date().toLocaleTimeString()}`,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <Save className="h-3 w-3" />
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setSentAt(new Date());
              toast.success("Inspection sent", {
                description: "Customer notified via SMS + Email",
              });
            }}
            disabled={gradedCount === 0}
            title={gradedCount === 0 ? "Grade at least one item before sending" : undefined}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface disabled:opacity-40"
          >
            <Send className="h-3 w-3" />
            Send to Customer
          </button>
          {!inspection.completedAt && (
            <button
              type="button"
              onClick={() => {
                if (!isFullyGraded) {
                  toast.error("Grade all items to complete", {
                    description: `${counts.unset} item${counts.unset === 1 ? "" : "s"} still not graded`,
                  });
                  return;
                }
                completeInspection(inspection.id);
                toast.success("Inspection completed", {
                  description: `All ${inspection.items.length} items graded`,
                });
              }}
              disabled={!isFullyGraded}
              title={!isFullyGraded ? `${counts.unset} items not graded` : undefined}
              className="inline-flex items-center gap-1.5 rounded-md border border-success/40 bg-success/10 px-2.5 py-1.5 text-[11px] font-semibold text-success hover:bg-success/15 disabled:opacity-40"
            >
              <Check className="h-3 w-3" />
              Complete
            </button>
          )}
          {sentAt && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              Sent at {sentAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              window.print();
              toast.info("Print preview opened");
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <Printer className="h-3 w-3" />
            Print
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleBuildEstimate}
              disabled={!ro}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background hover:opacity-90 disabled:opacity-40"
            >
              <Sparkles className="h-3 w-3" />
              Build Estimate from Findings
            </button>
          </div>
        </>
      }
      metaRow={
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <MetaPair label="Customer" value={customer?.name ?? "-"} />
          <MetaPair label="Vehicle" value={vehicle?.unit ?? "-"} />
          <MetaPair
            label="Mileage"
            value={
              vehicle?.hours !== undefined
                ? `${vehicle.hours.toLocaleString()} hrs`
                : `${(vehicle?.mileage ?? 0).toLocaleString()} mi`
            }
          />
          <MetaPair label="Technician" value={tech?.name ?? "-"} />
          <MetaPair label="Template" value="37-Point DVI" />
        </div>
      }
      tabs={tabs}
      activeTabId={tab}
      onTabChange={(id) => setTab(id as Tab)}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {tab === "findings" && (
            <FindingsTab
              inspection={inspection}
              itemsByCategory={itemsByCategory}
              filter={filter}
              setFilter={setFilter}
              itemStatuses={itemStatuses}
              setItemStatuses={setItemStatuses}
            />
          )}
          {tab === "summary" && (
            <SummaryTab
              counts={counts}
              totalItems={inspection.items.length}
              gradedCount={gradedCount}
            />
          )}
          {tab === "photos" && <PhotosTab inspection={inspection} />}
          {tab === "history" && <HistoryTab />}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          {/* Recommendations */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Recommendations
            </h3>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {counts.red + counts.yellow} items need attention
            </p>
            <ul className="mt-3 space-y-2">
              {inspection.items
                .filter((i) => i.status === "red" || i.status === "yellow")
                .slice(0, 5)
                .map((item) => {
                  const Icon = statusMeta[item.status].icon;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          toast.info(`Add ${item.name} to estimate`);
                          if (ro) openModal("ai-estimate-builder", { roId: ro.id });
                        }}
                        className={clsx(
                          "w-full rounded-md border p-2 text-left text-[11px] transition-opacity hover:opacity-80",
                          item.status === "red"
                            ? "border-destructive/30 bg-destructive/5"
                            : "border-accent/40 bg-accent/10",
                        )}
                      >
                        <div className="flex items-start gap-1.5">
                          <Icon
                            className={clsx(
                              "mt-0.5 h-3 w-3 shrink-0",
                              item.status === "red"
                                ? "text-destructive"
                                : "text-[#991B1B]",
                            )}
                          />
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold">{item.name}</div>
                            {item.notes && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* AI action */}
          <div className="rounded-lg border border-accent bg-accent/10 p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#991B1B]" />
              <div>
                <h3 className="text-xs font-semibold text-[#991B1B]">
                  AI: Build Estimate
                </h3>
                <p className="mt-0.5 text-[10px] text-[#991B1B]/80">
                  Generate estimate lines for all red & yellow findings.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleBuildEstimate}
              disabled={!ro}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-green px-3 py-2 text-xs font-semibold text-brand-green-foreground hover:opacity-90 disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate Estimate
            </button>
          </div>
        </aside>
      </div>
    </DetailPageShell>
  );
}

// ====================================================================
// Tab panels
// ====================================================================

function FindingsTab({
  inspection,
  itemsByCategory,
  filter,
  setFilter,
  itemStatuses,
  setItemStatuses,
}: {
  inspection: Inspection | undefined;
  itemsByCategory: Map<string, InspectionItem[]>;
  filter: InspectionItemStatus | "all";
  setFilter: (f: InspectionItemStatus | "all") => void;
  itemStatuses: Record<string, InspectionItemStatus>;
  setItemStatuses: React.Dispatch<React.SetStateAction<Record<string, InspectionItemStatus>>>;
}) {
  const cycle = (s: InspectionItemStatus): InspectionItemStatus =>
    s === "unset"
      ? "green"
      : s === "green"
        ? "yellow"
        : s === "yellow"
          ? "red"
          : s === "red"
            ? "na"
            : "unset";
  if (!inspection) return null;
  const filters: Array<{ id: InspectionItemStatus | "all"; label: string }> = [
    { id: "all", label: "All" },
    { id: "unset", label: "Not graded" },
    { id: "red", label: "Red" },
    { id: "yellow", label: "Yellow" },
    { id: "green", label: "Green" },
    { id: "na", label: "N/A" },
  ];
  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={clsx(
              "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors",
              filter === f.id
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Category accordions */}
      <div className="space-y-3">
        {Array.from(itemsByCategory.entries()).map(([category, items]) => {
          const effective = (i: InspectionItem) => itemStatuses[i.id] ?? i.status;
          const visible = items.filter((i) => filter === "all" || effective(i) === filter);
          if (visible.length === 0) return null;
          const catRed = items.filter((i) => effective(i) === "red").length;
          const catYellow = items.filter((i) => effective(i) === "yellow").length;
          const catGraded = items.filter((i) => effective(i) !== "unset").length;
          return (
            <div
              key={category}
              className="overflow-hidden rounded-lg border border-border bg-background"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border bg-surface/30 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider">
                    {category}
                  </h3>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {catGraded}/{items.length} graded
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {catRed > 0 && (
                    <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-destructive">
                      {catRed}
                    </span>
                  )}
                  {catYellow > 0 && (
                    <span className="rounded-full bg-accent/40 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-[#991B1B]">
                      {catYellow}
                    </span>
                  )}
                </div>
              </div>
              <ul className="divide-y divide-border">
                {visible.map((item) => {
                  const current: InspectionItemStatus =
                    itemStatuses[item.id] ?? item.status;
                  const meta = statusMeta[current];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-surface/40"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const next = cycle(current);
                          setItemStatuses((prev) => ({ ...prev, [item.id]: next }));
                          toast.info(`Marked ${item.name}: ${statusMeta[next].label}`);
                        }}
                        className={clsx(
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110",
                          meta.bg,
                        )}
                        aria-label={`Cycle status - current ${meta.label}`}
                      >
                        <Icon className="h-3 w-3" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{item.name}</span>
                          {item.hasPhoto && (
                            <Camera className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        {item.notes && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <span
                        className={clsx(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                          meta.bg,
                        )}
                      >
                        {meta.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}

function SummaryTab({
  counts,
  totalItems,
  gradedCount,
}: {
  counts: { red: number; yellow: number; green: number; na: number; unset: number };
  totalItems: number;
  gradedCount: number;
}) {
  if (gradedCount === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
        <Circle className="mx-auto h-6 w-6 text-muted-foreground/50" />
        <h3 className="mt-3 text-xs font-semibold uppercase tracking-wider">
          Inspection in progress
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          0 of {totalItems} items graded. Tap status circles on the Findings tab to grade.
        </p>
      </div>
    );
  }
  const denom = Math.max(1, gradedCount - counts.na);
  const passRate = Math.round((counts.green / denom) * 100);
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-background p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Overall</h3>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">{passRate}%</span>
          <span className="text-xs text-muted-foreground">
            pass rate {counts.unset > 0 && `· ${counts.unset} not yet graded`}
          </span>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface">
          <div className="flex h-full">
            <div
              className="bg-success transition-all"
              style={{ width: `${(counts.green / totalItems) * 100}%` }}
            />
            <div
              className="bg-accent transition-all"
              style={{ width: `${(counts.yellow / totalItems) * 100}%` }}
            />
            <div
              className="bg-destructive transition-all"
              style={{ width: `${(counts.red / totalItems) * 100}%` }}
            />
            <div
              className="bg-muted-foreground/40 transition-all"
              style={{ width: `${(counts.na / totalItems) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotosTab({
  inspection,
}: {
  inspection: Inspection | undefined;
}) {
  if (!inspection) return null;
  const photoItems = inspection.items.filter((i) => i.hasPhoto);
  const uploadButton = (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={() =>
          toast.success("Photo uploaded", {
            description: `photo_${Date.now()}.jpg`,
          })
        }
        className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 text-[11px] font-semibold text-background hover:opacity-90"
      >
        <Upload className="h-3 w-3" />
        Upload Photo
      </button>
    </div>
  );
  if (photoItems.length === 0) {
    return (
      <div className="space-y-3">
        {uploadButton}
        <EmptyState
          icon={ImageIcon}
          title="No photos attached"
          description="Tech hasn't uploaded photos with this inspection."
        />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {uploadButton}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photoItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toast.info("Photo preview")}
            className="overflow-hidden rounded-lg border border-border bg-background text-left transition-opacity hover:opacity-90"
          >
            <div className="flex h-32 items-center justify-center bg-surface">
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div className="p-2.5">
              <div className="text-[11px] font-semibold">{item.name}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {item.category}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryTab() {
  const events = [
    { id: "1", title: "Inspection started", time: "Yesterday 8:14 AM", actor: "Marcus Reeves" },
    { id: "2", title: "20 items checked", time: "Yesterday 9:21 AM", actor: "Marcus Reeves" },
    { id: "3", title: "Photos uploaded (5)", time: "Yesterday 9:38 AM", actor: "Marcus Reeves" },
    { id: "4", title: "Inspection completed", time: "Yesterday 10:47 AM", actor: "Marcus Reeves" },
    { id: "5", title: "Sent to customer via SMS", time: "Yesterday 10:48 AM", actor: "System" },
  ];
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <ol className="relative space-y-1 border-l border-border pl-6">
        {events.map((e) => (
          <li key={e.id} className="relative pb-3">
            <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-border">
              <FileText className="h-3 w-3" />
            </span>
            <div className="text-xs font-semibold">{e.title}</div>
            <div className="text-[10px] text-muted-foreground">
              {e.time} · {e.actor}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ====================================================================
// Helpers
// ====================================================================
function FindingTile({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "red" | "yellow" | "green" | "gray" | "dashed";
}) {
  const styles: Record<typeof tone, string> = {
    red: "border-destructive/30 bg-destructive/5 text-destructive",
    yellow: "border-accent/40 bg-accent/10 text-[#991B1B]",
    green: "border-success/30 bg-success/5 text-success",
    gray: "border-border bg-surface text-muted-foreground",
    dashed: "border-dashed border-border bg-background text-muted-foreground",
  };
  return (
    <div
      className={clsx(
        "rounded-md border px-2 py-1.5 text-center",
        styles[tone],
      )}
    >
      <div className="text-lg font-semibold tabular-nums leading-tight">{count}</div>
      <div className="text-[9px] font-semibold uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
