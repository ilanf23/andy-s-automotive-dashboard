import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, ClipboardCheck, AlertTriangle, Camera } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { ListPageShell } from "@/components/shop/ListPageShell";
import { FilterBar } from "@/components/shop/FilterBar";
import { DateCell, TableHeader, TableRow } from "@/components/shop/cells";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { technicians } from "@/data/technicians";
import { useShopState } from "@/lib/shop-store";
import { useModals } from "@/components/ui/ModalProvider";

export const Route = createFileRoute("/inspections/")({
  component: InspectionsList,
});

type TabKey = "all" | "in-progress" | "completed" | "awaiting-response";

type Row = {
  id: string;
  roId: string;
  customer: string;
  customerType: "Fleet" | "Retail";
  vehicleUnit: string;
  vehicleYMM: string;
  tech?: string;
  techInitials?: string;
  completedAt?: string;
  red: number;
  yellow: number;
  green: number;
  na: number;
  unset: number;
  estimated: number;
  hasPhotos: boolean;
  state: "in-progress" | "completed" | "awaiting-response";
};

function InspectionsList() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { open: openModal } = useModals();
  const { inspections, repairOrders, newlyCreatedInspections } = useShopState();

  const enriched: Row[] = useMemo(() => {
    const custMap = new Map(customers.map((c) => [c.id, c]));
    const vehMap = new Map(vehicles.map((v) => [v.id, v]));
    const techMap = new Map(technicians.map((t) => [t.id, t]));
    return inspections.map((ins) => {
      const ro = repairOrders.find((r) => r.id === ins.repairOrderId);
      const c = ro ? custMap.get(ro.customerId) : undefined;
      const v = ro ? vehMap.get(ro.vehicleId) : undefined;
      const t = techMap.get(ins.technicianId);
      const red = ins.items.filter((i) => i.status === "red").length;
      const yellow = ins.items.filter((i) => i.status === "yellow").length;
      const green = ins.items.filter((i) => i.status === "green").length;
      const na = ins.items.filter((i) => i.status === "na").length;
      const unset = ins.items.filter((i) => i.status === "unset").length;
      const hasPhotos = ins.items.some((i) => i.hasPhoto);
      const state: Row["state"] =
        unset > 0
          ? "in-progress"
          : ins.completedAt
            ? red + yellow > 0
              ? "awaiting-response"
              : "completed"
            : "in-progress";
      const estimated = ro?.inspectionFindings?.estimated ?? 0;
      return {
        id: ins.id,
        roId: ins.repairOrderId,
        customer: c?.name ?? "-",
        customerType: c?.type ?? "Retail",
        vehicleUnit: v?.unit ?? "-",
        vehicleYMM: v ? `${v.year} ${v.make} ${v.model}` : "-",
        tech: t?.name,
        techInitials: t?.initials,
        completedAt: ins.completedAt,
        red,
        yellow,
        green,
        na,
        unset,
        estimated,
        hasPhotos,
        state,
      };
    });
  }, [inspections, repairOrders]);

  const counts: Record<TabKey, number> = useMemo(() => {
    return {
      all: enriched.length,
      "in-progress": enriched.filter((r) => r.state === "in-progress").length,
      completed: enriched.filter((r) => r.state === "completed").length,
      "awaiting-response": enriched.filter((r) => r.state === "awaiting-response").length,
    };
  }, [enriched]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched
      .filter((r) => (activeTab === "all" ? true : r.state === activeTab))
      .filter((r) => {
        if (!q) return true;
        return (
          r.id.toLowerCase().includes(q) ||
          r.roId.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.vehicleUnit.toLowerCase().includes(q)
        );
      });
  }, [enriched, activeTab, search]);

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "in-progress", label: "In Progress", count: counts["in-progress"] },
    {
      id: "awaiting-response",
      label: "Awaiting Customer",
      count: counts["awaiting-response"],
      badgeTone: counts["awaiting-response"] > 0 ? ("accent" as const) : undefined,
    },
    { id: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <ListPageShell
      title="Inspections"
      description="Digital vehicle inspections (DVI)"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as TabKey)}
      actions={
        <button
          type="button"
          onClick={() => openModal("new-inspection", {})}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Start Inspection
        </button>
      }
      filterBar={
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search inspection #, RO #, customer, vehicle…"
          filters={[
            { id: "tech", label: "Tech", value: "All" },
            { id: "template", label: "Template", value: "37-Point DVI" },
          ]}
          showExport
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <TableHeader
            cols={[
              { id: "id", label: "Inspection", w: "130px" },
              { id: "ro", label: "RO #", w: "80px" },
              { id: "customer", label: "Customer / Vehicle" },
              { id: "tech", label: "Tech", w: "140px" },
              { id: "findings", label: "Findings", align: "center", w: "180px" },
              { id: "photos", label: "Photos", align: "center", w: "70px" },
              { id: "completed", label: "Completed", align: "right", w: "110px" },
              { id: "state", label: "State", w: "150px" },
            ]}
          />
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-xs text-muted-foreground">
                  No inspections in this view.
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() => navigate({ to: "/inspections/$id", params: { id: r.id } })}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold tabular-nums">{r.id}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-xs font-semibold">#{r.roId}</td>
                  <td className="px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold">{r.customer}</span>
                        {r.customerType === "Fleet" && (
                          <span className="rounded-full bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1E40AF]">
                            F
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground/80">{r.vehicleUnit}</span>{" "}
                        · {r.vehicleYMM}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {r.techInitials ? (
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                          {r.techInitials}
                        </span>
                        <span className="truncate text-[11px]">{r.tech?.split(" ")[0]}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <FindingPill
                        count={r.red}
                        tone="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate({ to: "/inspections/$id", params: { id: r.id } });
                          toast.info(`${r.red} red findings`, {
                            description: `Opening ${r.id}`,
                          });
                        }}
                      />
                      <FindingPill
                        count={r.yellow}
                        tone="yellow"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate({ to: "/inspections/$id", params: { id: r.id } });
                          toast.info(`${r.yellow} yellow findings`, {
                            description: `Opening ${r.id}`,
                          });
                        }}
                      />
                      <FindingPill
                        count={r.green}
                        tone="green"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate({ to: "/inspections/$id", params: { id: r.id } });
                          toast.info(`${r.green} green findings`, {
                            description: `Opening ${r.id}`,
                          });
                        }}
                      />
                      <FindingPill
                        count={r.na}
                        tone="gray"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate({ to: "/inspections/$id", params: { id: r.id } });
                          toast.info(`${r.na} N/A findings`, {
                            description: `Opening ${r.id}`,
                          });
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {r.hasPhotos && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate({ to: "/inspections/$id", params: { id: r.id } });
                          toast.info("Opening Photos tab");
                        }}
                        className="mx-auto inline-flex items-center justify-center rounded p-0.5 hover:bg-surface"
                        aria-label="Open photos"
                      >
                        <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {r.completedAt ? (
                      <DateCell date={r.completedAt} className="text-[11px]" />
                    ) : (
                      <span className="text-[11px] text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <StateBadge state={r.state} estimated={r.estimated} red={r.red} yellow={r.yellow} />
                  </td>
                </TableRow>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ListPageShell>
  );
}

function FindingPill({
  count,
  tone,
  onClick,
}: {
  count: number;
  tone: "red" | "yellow" | "green" | "gray";
  onClick?: (e: React.MouseEvent) => void;
}) {
  if (count === 0) {
    return <span className="text-[10px] text-muted-foreground/50 tabular-nums">·</span>;
  }
  const styles: Record<typeof tone, string> = {
    red: "bg-destructive/15 text-destructive",
    yellow: "bg-accent/40 text-[#991B1B]",
    green: "bg-success/15 text-success",
    gray: "bg-surface text-muted-foreground",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums transition-opacity hover:opacity-80",
        styles[tone],
      )}
    >
      {count}
    </button>
  );
}

function StateBadge({
  state,
  estimated,
  red,
  yellow,
}: {
  state: "in-progress" | "completed" | "awaiting-response";
  estimated: number;
  red: number;
  yellow: number;
}) {
  if (state === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#92400E]">
        In Progress
      </span>
    );
  }
  if (state === "awaiting-response") {
    const unestimated = red + yellow - estimated;
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold text-[#991B1B]">
        {unestimated > 0 && <AlertTriangle className="h-2.5 w-2.5" />}
        Awaiting Customer
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
      Completed
    </span>
  );
}
