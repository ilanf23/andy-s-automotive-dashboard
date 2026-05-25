import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Truck, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { ListPageShell } from "@/components/shop/ListPageShell";
import { FilterBar } from "@/components/shop/FilterBar";
import { DateCell, TableHeader, TableRow } from "@/components/shop/cells";
import { vehicles } from "@/data/vehicles";
import { customers } from "@/data/customers";
import { repairOrders } from "@/data/repairOrders";

export const Route = createFileRoute("/vehicles/")({
  component: VehiclesIndex,
});

type TabKey = "all" | "fleet" | "retail" | "in-shop" | "frankenstein";

function VehiclesIndex() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");

  const enriched = useMemo(() => {
    const custMap = new Map(customers.map((c) => [c.id, c]));
    const openROMap = new Map<string, string>(); // vehicleId -> roId
    for (const ro of repairOrders) {
      if (ro.status !== "completed" && ro.status !== "ready") {
        openROMap.set(ro.vehicleId, ro.id);
      }
    }
    return vehicles.map((v) => {
      const c = custMap.get(v.customerId);
      return {
        ...v,
        customer: c?.name ?? "—",
        customerType: c?.type ?? "Retail",
        openRO: openROMap.get(v.id),
        inShop: openROMap.has(v.id),
      };
    });
  }, []);

  const counts: Record<TabKey, number> = useMemo(
    () => ({
      all: enriched.length,
      fleet: enriched.filter((v) => v.customerType === "Fleet").length,
      retail: enriched.filter((v) => v.customerType === "Retail").length,
      "in-shop": enriched.filter((v) => v.inShop).length,
      frankenstein: enriched.filter((v) => v.isFrankenstein).length,
    }),
    [enriched],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched
      .filter((v) => {
        if (activeTab === "all") return true;
        if (activeTab === "fleet") return v.customerType === "Fleet";
        if (activeTab === "retail") return v.customerType === "Retail";
        if (activeTab === "in-shop") return v.inShop;
        if (activeTab === "frankenstein") return v.isFrankenstein;
        return true;
      })
      .filter((v) => {
        if (!q) return true;
        return (
          v.unit.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q) ||
          v.licensePlate.toLowerCase().includes(q) ||
          v.customer.toLowerCase().includes(q)
        );
      });
  }, [enriched, activeTab, search]);

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "fleet", label: "Fleet", count: counts.fleet },
    { id: "retail", label: "Retail", count: counts.retail },
    {
      id: "in-shop",
      label: "In Shop",
      count: counts["in-shop"],
      badgeTone: counts["in-shop"] > 0 ? ("accent" as const) : undefined,
    },
    { id: "frankenstein", label: "Frankenstein", count: counts.frankenstein },
  ];

  return (
    <ListPageShell
      title="Vehicles"
      description="All vehicles serviced — fleet and retail"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as TabKey)}
      actions={
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      }
      filterBar={
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search unit, year/make/model, VIN, plate, customer…"
          filters={[
            { id: "make", label: "Make", value: "All" },
            { id: "year", label: "Year", value: "Any" },
          ]}
          showExport
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <TableHeader
            cols={[
              { id: "unit", label: "Vehicle" },
              { id: "vin", label: "VIN", w: "180px" },
              { id: "plate", label: "Plate", w: "100px" },
              { id: "customer", label: "Customer", w: "200px" },
              { id: "miles", label: "Mileage / Hrs", align: "right", w: "110px" },
              { id: "lastSvc", label: "Last Service", align: "right", w: "110px" },
              { id: "ro", label: "Open RO", w: "100px" },
            ]}
          />
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-xs text-muted-foreground">
                  No vehicles in this view.
                </td>
              </tr>
            ) : (
              filteredRows.map((v) => (
                <TableRow
                  key={v.id}
                  onClick={() => navigate({ to: "/vehicles/$id", params: { id: v.id } })}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface">
                        <Truck className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-semibold">{v.unit}</span>
                          {v.isFrankenstein && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FCE7F3] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#9D174D]">
                              <AlertTriangle className="h-2.5 w-2.5" />F
                            </span>
                          )}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {v.year} {v.make} {v.model}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-muted-foreground">
                    {v.vin}
                  </td>
                  <td className="px-3 py-2.5 text-[11px]">{v.licensePlate}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs">{v.customer}</span>
                      {v.customerType === "Fleet" && (
                        <span className="rounded-full bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1E40AF]">
                          F
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right text-[11px] tabular-nums">
                    {v.hours !== undefined
                      ? `${v.hours.toLocaleString()} hrs`
                      : `${(v.mileage ?? 0).toLocaleString()} mi`}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <DateCell date={v.lastService} className="text-[11px]" />
                  </td>
                  <td className="px-3 py-2.5">
                    {v.openRO ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-[#991B1B]">
                        #{v.openRO}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
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
