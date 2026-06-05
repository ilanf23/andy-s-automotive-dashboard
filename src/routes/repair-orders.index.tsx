import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, AlertTriangle, Clock } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { ListPageShell } from "@/components/shop/ListPageShell";
import { FilterBar } from "@/components/shop/FilterBar";
import { StatusBadge } from "@/components/shop/StatusBadge";
import { MoneyCell, DateCell, TableRow } from "@/components/shop/cells";
import { type RepairOrder } from "@/data/repairOrders";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { technicians } from "@/data/technicians";
import { useShopState } from "@/lib/shop-store";
import { useModals } from "@/components/ui/ModalProvider";

export const Route = createFileRoute("/repair-orders/")({
  component: RepairOrdersList,
});

type TabKey =
  | "all"
  | "estimate"
  | "wip"
  | "awaiting-approval"
  | "awaiting-parts"
  | "ready"
  | "posted";

const tabConfig: Array<{
  key: TabKey;
  label: string;
  statuses: RepairOrder["status"][] | "all";
}> = [
  { key: "all", label: "All", statuses: "all" },
  {
    key: "estimate",
    label: "Estimate",
    statuses: ["just-arrived", "inspection", "estimate-building"],
  },
  { key: "awaiting-approval", label: "Awaiting Approval", statuses: ["awaiting-approval"] },
  { key: "wip", label: "Work In Progress", statuses: ["in-progress"] },
  { key: "awaiting-parts", label: "Awaiting Parts", statuses: [] },
  { key: "ready", label: "Ready", statuses: ["ready"] },
  { key: "posted", label: "Posted", statuses: ["completed"] },
];

type Row = RepairOrder & {
  customerName: string;
  customerType: "Fleet" | "Retail";
  vehicleUnit: string;
  vehicleYMM: string;
  techName?: string;
  techInitials?: string;
  advisor: string;
};

function RepairOrdersList() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();
  const { repairOrders, newlyCreatedROs } = useShopState();
  const { open: openModal } = useModals();

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const enriched: Row[] = useMemo(() => {
    const custMap = new Map(customers.map((c) => [c.id, c]));
    const vehMap = new Map(vehicles.map((v) => [v.id, v]));
    const techMap = new Map(technicians.map((t) => [t.id, t]));
    const advisors = ["Cameron Mills", "Stewart Park", "Cody Bell"];
    return repairOrders.map((ro, i) => {
      const c = custMap.get(ro.customerId);
      const v = vehMap.get(ro.vehicleId);
      const t = ro.technicianId ? techMap.get(ro.technicianId) : undefined;
      return {
        ...ro,
        customerName: c?.name ?? "-",
        customerType: c?.type ?? "Retail",
        vehicleUnit: v?.unit ?? "-",
        vehicleYMM: v ? `${v.year} ${v.make} ${v.model}` : "-",
        techName: t?.name,
        techInitials: t?.initials,
        advisor: advisors[i % advisors.length],
      };
    });
  }, [repairOrders]);

  const counts: Record<TabKey, number> = useMemo(() => {
    const result = {} as Record<TabKey, number>;
    for (const tab of tabConfig) {
      result[tab.key] =
        tab.statuses === "all"
          ? enriched.length
          : enriched.filter((r) => tab.statuses.includes(r.status)).length;
    }
    return result;
  }, [enriched]);

  const filteredRows = useMemo(() => {
    const cfg = tabConfig.find((t) => t.key === activeTab)!;
    const q = search.trim().toLowerCase();
    const rows = enriched
      .filter(
        (r) =>
          cfg.statuses === "all" ||
          (Array.isArray(cfg.statuses) && cfg.statuses.includes(r.status)),
      )
      .filter((r) => {
        if (!q) return true;
        return (
          r.id.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.vehicleUnit.toLowerCase().includes(q) ||
          r.vehicleYMM.toLowerCase().includes(q) ||
          (r.techName?.toLowerCase().includes(q) ?? false)
        );
      });

    if (sortKey) {
      const dirMult = sortDir === "asc" ? 1 : -1;
      const sorted = [...rows].sort((a, b) => {
        let av: number | string = "";
        let bv: number | string = "";
        switch (sortKey) {
          case "id":
            av = a.id;
            bv = b.id;
            break;
          case "status":
            av = a.status;
            bv = b.status;
            break;
          case "total":
            av = a.total;
            bv = b.total;
            break;
          case "days":
            av = a.daysInShop;
            bv = b.daysInShop;
            break;
          default:
            return 0;
        }
        if (typeof av === "number" && typeof bv === "number") {
          return (av - bv) * dirMult;
        }
        return String(av).localeCompare(String(bv)) * dirMult;
      });
      return sorted;
    }

    return rows;
  }, [enriched, activeTab, search, sortKey, sortDir]);

  const tabs = tabConfig.map((t) => ({
    id: t.key,
    label: t.label,
    count: counts[t.key],
    badgeTone:
      t.key === "awaiting-approval" && counts[t.key] > 0
        ? ("accent" as const)
        : undefined,
  }));

  return (
    <ListPageShell
      title="Repair Orders"
      description="Active, posted, and historical work"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as TabKey)}
      actions={
        <button
          type="button"
          onClick={() => openModal("new-ro", {})}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3.5 py-2 text-sm font-semibold text-brand-green-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Repair Order
        </button>
      }
      filterBar={
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search RO #, customer, vehicle, plate, VIN…"
          filters={[
            { id: "tech", label: "Tech", value: "All" },
            { id: "advisor", label: "Advisor", value: "All" },
            { id: "date", label: "Opened", value: "Last 30 days" },
          ]}
          showExport
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/40">
              {[
                { id: "flag", label: "", w: "32px", sortable: false, align: "left" as const },
                { id: "id", label: "RO #", w: "80px", sortable: true, align: "left" as const },
                { id: "status", label: "Status", w: "150px", sortable: true, align: "left" as const },
                { id: "customer", label: "Customer / Vehicle", sortable: false, align: "left" as const },
                { id: "tech", label: "Tech", w: "140px", sortable: false, align: "left" as const },
                { id: "advisor", label: "Advisor", w: "120px", sortable: false, align: "left" as const },
                { id: "updated", label: "Last Update", align: "right" as const, w: "110px", sortable: false },
                { id: "days", label: "Days", align: "right" as const, w: "70px", sortable: true },
                { id: "total", label: "Total", align: "right" as const, w: "110px", sortable: true },
              ].map((c) => {
                const isActive = sortKey === c.id;
                const indicator = isActive ? (sortDir === "asc" ? " ▲" : " ▼") : "";
                return (
                  <th
                    key={c.id}
                    onClick={c.sortable ? () => handleSort(c.id) : undefined}
                    className={clsx(
                      "px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
                      c.align === "right" && "text-right",
                      c.align !== "right" && "text-left",
                      c.sortable && "cursor-pointer select-none hover:text-foreground",
                    )}
                    style={c.w ? { width: c.w } : undefined}
                  >
                    {c.label}
                    {c.sortable && (
                      <span className="ml-0.5 text-foreground">{indicator}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-xs text-muted-foreground">
                  No repair orders in this view.
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() =>
                    navigate({ to: "/repair-orders/$id", params: { id: r.id } })
                  }
                >
                  <td className="px-3 py-2.5">
                    {r.flags && r.flags.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info("Flags", {
                            description: "View flags - coming soon",
                          });
                        }}
                        title={r.flags.join(", ")}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                      >
                        <AlertTriangle className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-semibold tabular-nums">#{r.id}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info("Change status", {
                          description: "Status menu - coming soon",
                        });
                      }}
                      className="cursor-pointer"
                    >
                      <StatusBadge status={r.status} />
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold">
                          {r.customerName}
                        </span>
                        {r.customerType === "Fleet" && (
                          <span className="rounded-full bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1E40AF]">
                            F
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          {r.vehicleUnit}
                        </span>{" "}
                        · {r.vehicleYMM}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info("Reassign tech", {
                          description: `Currently ${r.techName || "Unassigned"}`,
                        });
                      }}
                      className="rounded hover:bg-surface"
                    >
                      {r.techInitials ? (
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                            {r.techInitials}
                          </span>
                          <span className="truncate text-[11px]">
                            {r.techName?.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Unassigned</span>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info("Change advisor");
                      }}
                      className="text-[11px] hover:underline"
                    >
                      {r.advisor.split(" ")[0]}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <DateCell date={r.openedAt} className="text-[11px]" />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 text-xs tabular-nums",
                        r.daysInShop >= 3 && "font-semibold text-destructive",
                      )}
                    >
                      {r.daysInShop >= 3 && <Clock className="h-3 w-3" />}
                      {r.daysInShop}d
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <MoneyCell
                      value={r.total}
                      showZero={false}
                      className="text-xs font-semibold"
                    />
                  </td>
                </TableRow>
              ))
            )}
          </tbody>
          {filteredRows.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-surface/40">
                <td colSpan={8} className="px-3 py-2 text-right text-[11px] text-muted-foreground">
                  {filteredRows.length} of {enriched.length} ROs
                </td>
                <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums">
                  $
                  {filteredRows
                    .reduce((acc, r) => acc + r.total, 0)
                    .toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </ListPageShell>
  );
}
