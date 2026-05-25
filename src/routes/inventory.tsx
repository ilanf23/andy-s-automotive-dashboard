import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  ArrowDownToLine,
  ScanLine,
  RotateCcw,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { ListPageShell } from "@/components/shop/ListPageShell";
import { FilterBar } from "@/components/shop/FilterBar";
import { MoneyCell, TableHeader, TableRow } from "@/components/shop/cells";
import { inventory } from "@/data/inventory";
import { useModals } from "@/components/ui/ModalProvider";
import { Modal } from "@/components/ui/Modal";
import { Sparkles, Camera, Search } from "lucide-react";
import { CatalogSearchModal } from "@/components/catalog/CatalogSearchModal";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});

type TabKey = "all" | "low-stock" | "on-order" | "vendors" | "returns";

function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const { open: openModal } = useModals();
  const [receivePoOpen, setReceivePoOpen] = useState(false);
  const [addPartOpen, setAddPartOpen] = useState(false);

  const enriched = useMemo(
    () =>
      inventory.map((item) => ({
        ...item,
        isLow: item.onHand <= item.reorderPoint,
        value: item.onHand * item.cost,
      })),
    [],
  );

  const RETURNED_ITEMS = [
    { partNumber: "BR-RTN-001", description: "Brake rotor — wrong size", vendor: "Worldpac", category: "Brakes", reason: "Wrong fitment", returnedAt: "May 18" },
    { partNumber: "FL-RTN-114", description: "Oil filter — duplicate", vendor: "NAPA", category: "Filters", reason: "Duplicate order", returnedAt: "May 16" },
    { partNumber: "SP-RTN-220", description: "Spark plug set", vendor: "AutoZone", category: "Engine", reason: "Defective", returnedAt: "May 12" },
    { partNumber: "AB-RTN-309", description: "Air brake hose", vendor: "Worldpac", category: "Brakes", reason: "Cracked on arrival", returnedAt: "May 9" },
    { partNumber: "CB-RTN-401", description: "Cabin filter", vendor: "NAPA", category: "Filters", reason: "Wrong model", returnedAt: "May 4" },
  ] as const;

  const counts = {
    all: enriched.length,
    "low-stock": enriched.filter((i) => i.isLow).length,
    "on-order": 4,
    vendors: new Set(enriched.map((i) => i.vendor)).size,
    returns: 1,
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = enriched.slice();
    if (activeTab === "low-stock") {
      list = list.filter((i) => i.isLow);
    } else if (activeTab === "on-order") {
      list = list.slice(0, 4);
    } else if (activeTab === "vendors") {
      const seen = new Set<string>();
      list = list.filter((i) => {
        if (seen.has(i.vendor)) return false;
        seen.add(i.vendor);
        return true;
      });
    }
    if (q) {
      list = list.filter(
        (i) =>
          i.partNumber.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.vendor.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }
    return list;
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
          <button
            type="button"
            onClick={() => {
              toast.info("Scanning…");
              setTimeout(() => {
                toast.success("Found: BR-4521 — Brake pad set");
              }, 800);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
          >
            <ScanLine className="h-3 w-3" />
            Scan Barcode
          </button>
          <button
            type="button"
            onClick={() =>
              toast.info("Parts Matrix", {
                description: "Opening matrix view — coming soon",
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
          >
            <TrendingUp className="h-3 w-3" />
            Parts Matrix
          </button>
          <button
            type="button"
            onClick={() => setReceivePoOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
          >
            <ArrowDownToLine className="h-3 w-3" />
            Receive PO
          </button>
          <button
            type="button"
            onClick={() => setAddPartOpen(true)}
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

      {activeTab === "returns" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <TableHeader
              cols={[
                { id: "part", label: "Part" },
                { id: "vendor", label: "Vendor", w: "150px" },
                { id: "cat", label: "Category", w: "110px" },
                { id: "reason", label: "Reason" },
                { id: "date", label: "Returned", align: "right", w: "100px" },
              ]}
            />
            <tbody>
              {RETURNED_ITEMS.map((r) => (
                <TableRow key={r.partNumber}>
                  <td className="px-3 py-2.5">
                    <div className="text-xs font-semibold">{r.description}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {r.partNumber}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[11px]">{r.vendor}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{r.reason}</td>
                  <td className="px-3 py-2.5 text-right text-[11px] text-muted-foreground">{r.returnedAt}</td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
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
                { id: "actions", label: "", w: "90px" },
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
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`PO drafted for ${i.partNumber}`);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold hover:bg-surface"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      Reorder
                    </button>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ReceivePOModal open={receivePoOpen} onOpenChange={setReceivePoOpen} />
      <AddPartModal open={addPartOpen} onOpenChange={setAddPartOpen} />
    </ListPageShell>
  );
}

function ReceivePOModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [poNumber, setPoNumber] = useState("PO-21458");
  const [line1Part, setLine1Part] = useState("");
  const [line1Qty, setLine1Qty] = useState("");
  const [line2Part, setLine2Part] = useState("");
  const [line2Qty, setLine2Qty] = useState("");

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Receive PO"
      description="Log a received purchase order into stock"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success("PO received — 3 parts added to stock");
              onOpenChange(false);
            }}
            className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            PO Number
          </label>
          <input
            type="text"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="rounded-md border border-border bg-surface/30 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Line 1
          </div>
          <div className="mt-2 grid grid-cols-[1fr_80px] gap-2">
            <input
              type="text"
              value={line1Part}
              onChange={(e) => setLine1Part(e.target.value)}
              placeholder="Part #"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent"
            />
            <input
              type="number"
              value={line1Qty}
              onChange={(e) => setLine1Qty(e.target.value)}
              placeholder="Qty"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="rounded-md border border-border bg-surface/30 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Line 2
          </div>
          <div className="mt-2 grid grid-cols-[1fr_80px] gap-2">
            <input
              type="text"
              value={line2Part}
              onChange={(e) => setLine2Part(e.target.value)}
              placeholder="Part #"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent"
            />
            <input
              type="number"
              value={line2Qty}
              onChange={(e) => setLine2Qty(e.target.value)}
              placeholder="Qty"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function AddPartModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [vendor, setVendor] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [partsSearchOpen, setPartsSearchOpen] = useState(false);

  return (
    <>
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Part"
      description="Create a new part SKU"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success(`Added ${name || "new part"}`);
              onOpenChange(false);
            }}
            className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
          >
            Save
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => setPartsSearchOpen(true)}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-brand-green/40 bg-brand-green-tint px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-soft hover:bg-brand-green/20"
          >
            <Search className="h-3 w-3" />
            Search Parts Catalog
          </button>
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Part Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Part Number
          </label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Vendor
          </label>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quantity
          </label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Price
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Reorder Point
          </label>
          <input
            type="number"
            value={reorderPoint}
            onChange={(e) => setReorderPoint(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>
    </Modal>
    <CatalogSearchModal
      open={partsSearchOpen}
      onClose={() => setPartsSearchOpen(false)}
      mode="parts"
      onSelectPart={(entry) => {
        setName(entry.description);
        setNumber(entry.partNumber);
        setVendor(entry.vendor);
        setPrice(String(entry.unitPrice));
        toast.success(`Loaded ${entry.partNumber} from Parts Catalog`);
      }}
    />
    </>
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
