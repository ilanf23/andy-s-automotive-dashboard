import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  ArrowDownToLine,
  Truck,
} from "lucide-react";
import clsx from "clsx";
import { ListPageShell } from "@/components/shop/ListPageShell";
import { FilterBar } from "@/components/shop/FilterBar";
import { MoneyCell, TableHeader, TableRow } from "@/components/shop/cells";
import { inventory } from "@/data/inventory";
import { useModals } from "@/components/ui/ModalProvider";
import { Sparkles, Camera } from "lucide-react";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});

type TabKey = "all" | "low-stock" | "on-order" | "vendors" | "returns";

function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const { open: openModal } = useModals();

  const enriched = useMemo(
    () =>
      inventory.map((item) => ({
        ...item,
        isLow: item.onHand <= item.reorderPoint,
        value: item.onHand * item.cost,
      })),
    [],
  );

  const counts = {
    all: enriched.length,
    "low-stock": enriched.filter((i) => i.isLow).length,
    "on-order": 4,
    vendors: new Set(enriched.map((i) => i.vendor)).size,
    returns: 1,
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched
      .filter((i) => {
        if (activeTab === "low-stock") return i.isLow;
        return true;
      })
      .filter((i) => {
        if (!q) return true;
        return (
          i.partNumber.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.vendor.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
        );
      });
  }, [enriched, activeTab, search]);

  const tabs = [
    { id: "all", label: "On Hand", count: counts.all },
    {
      id: "low-stock",
      label: "Low Stock",
      count: counts["low-stock"],
      badgeTone: counts["low-stock"] > 0 ? ("danger" as const) : undefined,
    },
    { id: "on-order", label: "On Order", count: counts["on-order"] },
    { id: "returns", label: "Returns", count: counts.returns },
    { id: "vendors", label: "Vendors", count: counts.vendors },
  ];

  const totalValue = enriched.reduce((acc, i) => acc + i.value, 0);

  return (
    <ListPageShell
      title="Parts"
      description="Inventory, vendors, and parts matrix"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as TabKey)}
      actions={
        <>
          <button
            type="button"
            onClick={() => openModal("parts-identifier", {})}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-green/40 bg-brand-green-tint px-2.5 py-1.5 text-xs font-semibold text-brand-green-soft hover:bg-brand-green/20"
          >
            <Sparkles className="h-3 w-3" />
            <Camera className="h-3 w-3" />
            Identify Part
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface">
            <TrendingUp className="h-3 w-3" />
            Parts Matrix
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface">
            <ArrowDownToLine className="h-3 w-3" />
            Receive PO
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Part
          </button>
        </>
      }
      filterBar={
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search part #, description, vendor…"
          filters={[
            { id: "vendor", label: "Vendor", value: "All" },
            { id: "category", label: "Category", value: "All" },
          ]}
          showExport
        />
      }
    >
      {/* Inventory summary strip */}
      <div className="grid grid-cols-2 gap-3 border-b border-border bg-surface/30 px-3 py-3 sm:grid-cols-4">
        <SummaryStat label="Inventory Value" value={`$${(totalValue / 1000).toFixed(1)}k`} icon={Package} />
        <SummaryStat label="Active SKUs" value={String(enriched.length)} icon={Package} />
        <SummaryStat
          label="Low Stock"
          value={String(counts["low-stock"])}
          icon={AlertTriangle}
          danger={counts["low-stock"] > 0}
        />
        <SummaryStat label="On Order" value={String(counts["on-order"])} icon={ShoppingCart} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <TableHeader
            cols={[
              { id: "part", label: "Part" },
              { id: "vendor", label: "Vendor", w: "150px" },
              { id: "cat", label: "Category", w: "110px" },
              { id: "onHand", label: "On Hand", align: "right", w: "80px" },
              { id: "reorder", label: "Reorder Pt", align: "right", w: "90px" },
              { id: "cost", label: "Cost", align: "right", w: "80px" },
              { id: "value", label: "Value", align: "right", w: "100px" },
            ]}
          />
          <tbody>
            {filtered.map((i) => (
              <TableRow key={i.id}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {i.isLow && (
                      <AlertTriangle className="h-3 w-3 shrink-0 text-destructive" />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold">{i.description}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {i.partNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[11px]">{i.vendor}</td>
                <td className="px-3 py-2.5">
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium">
                    {i.category}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span
                    className={clsx(
                      "text-xs font-semibold tabular-nums",
                      i.isLow && "text-destructive",
                    )}
                  >
                    {i.onHand}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-[11px] tabular-nums text-muted-foreground">
                  {i.reorderPoint}
                </td>
                <td className="px-3 py-2.5 text-right text-[11px] tabular-nums">
                  ${i.cost.toFixed(2)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <MoneyCell value={i.value} className="text-xs font-semibold" />
                </td>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </ListPageShell>
  );
}

function SummaryStat({
  label,
  value,
  icon: Icon,
  danger,
}: {
  label: string;
  value: string;
  icon: typeof Package;
  danger?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={clsx("h-3 w-3", danger ? "text-destructive" : "text-muted-foreground")} />
      </div>
      <div
        className={clsx(
          "mt-1 text-lg font-semibold tabular-nums",
          danger && "text-destructive",
        )}
      >
        {value}
      </div>
    </div>
  );
}
