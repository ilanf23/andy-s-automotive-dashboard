import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, AlertTriangle, Phone, Mail, X } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { ListPageShell } from "@/components/shop/ListPageShell";
import { FilterBar } from "@/components/shop/FilterBar";
import { MoneyCell, DateCell, TableHeader, TableRow } from "@/components/shop/cells";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { HealthBadge, getHealthDetail } from "@/components/ai/CustomerHealthScore";

export const Route = createFileRoute("/customers/")({
  component: CustomersIndex,
});

type TabKey = "all" | "fleet" | "retail" | "balance" | "vip";

function formatLifetimeValue(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString()}`;
}

function CustomersIndex() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    type: "Retail" as "Retail" | "Fleet",
  });

  const enriched = useMemo(() => {
    return customers.map((c) => {
      const vehs = vehicles.filter((v) => v.customerId === c.id);
      return { ...c, vehicleCount: vehs.length };
    });
  }, []);

  const counts: Record<TabKey, number> = useMemo(
    () => ({
      all: enriched.length,
      fleet: enriched.filter((c) => c.type === "Fleet").length,
      retail: enriched.filter((c) => c.type === "Retail").length,
      balance: enriched.filter((c) => c.openBalance > 0).length,
      vip: enriched.filter((c) => c.lifetimeValue >= 100000).length,
    }),
    [enriched],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched
      .filter((c) => {
        if (activeTab === "all") return true;
        if (activeTab === "fleet") return c.type === "Fleet";
        if (activeTab === "retail") return c.type === "Retail";
        if (activeTab === "balance") return c.openBalance > 0;
        if (activeTab === "vip") return c.lifetimeValue >= 100000;
        return true;
      })
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue);
  }, [enriched, activeTab, search]);

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "fleet", label: "Fleet", count: counts.fleet },
    { id: "retail", label: "Retail", count: counts.retail },
    {
      id: "balance",
      label: "Open Balance",
      count: counts.balance,
      badgeTone: counts.balance > 0 ? ("danger" as const) : undefined,
    },
    { id: "vip", label: "VIP", count: counts.vip },
  ];

  return (
    <ListPageShell
      title="Customers"
      description="Fleet accounts and retail customers"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as TabKey)}
      actions={
        <button
          type="button"
          onClick={() => setShowAddCustomer(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      }
      filterBar={
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by name, contact, phone, email, city…"
          filters={[
            { id: "platform", label: "Platform", value: "All" },
            { id: "lastVisit", label: "Last visit", value: "Any" },
          ]}
          showExport
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <TableHeader
            cols={[
              { id: "name", label: "Customer" },
              { id: "contact", label: "Contact", w: "200px" },
              { id: "vehicles", label: "Vehicles", align: "center", w: "70px" },
              { id: "ltv", label: "LTV", align: "right", w: "90px" },
              { id: "balance", label: "Open Balance", align: "right", w: "110px" },
              { id: "lastVisit", label: "Last Visit", align: "right", w: "100px" },
              { id: "platform", label: "Platform", w: "120px" },
            ]}
          />
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-xs text-muted-foreground">
                  No customers in this view.
                </td>
              </tr>
            ) : (
              filteredRows.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => navigate({ to: "/customers/$id", params: { id: c.id } })}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                        {c.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-semibold">{c.name}</span>
                          <span
                            className={clsx(
                              "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                              c.type === "Fleet"
                                ? "bg-[#DBEAFE] text-[#1E40AF]"
                                : "bg-surface text-muted-foreground",
                            )}
                          >
                            {c.type === "Fleet" ? "F" : "R"}
                          </span>
                          <HealthBadge status={getHealthDetail(c.id).status} />
                        </div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          {c.contactName} · {c.city}, {c.state}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-0.5 text-[11px]">
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Phone className="h-2.5 w-2.5 text-muted-foreground" />
                        {c.phone}
                      </span>
                      <span className="inline-flex items-center gap-1 truncate text-muted-foreground">
                        <Mail className="h-2.5 w-2.5" />
                        {c.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                      {c.vehicleCount}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs font-semibold tabular-nums">
                      {formatLifetimeValue(c.lifetimeValue)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {c.openBalance > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-destructive">
                        {c.openBalance > 10000 && <AlertTriangle className="h-3 w-3" />}
                        <MoneyCell value={c.openBalance} />
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <DateCell date={c.lastVisit} className="text-[11px]" />
                  </td>
                  <td className="px-3 py-2.5">
                    {c.fleetPlatform ? (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-[#991B1B]">
                        {c.fleetPlatform}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">-</span>
                    )}
                  </td>
                </TableRow>
              ))
            )}
          </tbody>
          {filteredRows.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-surface/40 text-[11px] text-muted-foreground">
                <td colSpan={3} className="px-3 py-2">
                  {filteredRows.length} of {enriched.length} customers
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-foreground">
                  $
                  {Math.round(
                    filteredRows.reduce((acc, r) => acc + r.lifetimeValue, 0) / 1000,
                  )}
                  k
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-destructive">
                  $
                  {filteredRows
                    .reduce((acc, r) => acc + r.openBalance, 0)
                    .toLocaleString()}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Add Customer</h2>
              <button
                type="button"
                onClick={() => setShowAddCustomer(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Business Name
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Acme Trucking LLC"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={newCustomer.contactName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, contactName: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="jane@acmetrucking.com"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer Type
                </label>
                <select
                  value={newCustomer.type}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, type: e.target.value as "Retail" | "Fleet" })
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
                >
                  <option value="Retail">Retail</option>
                  <option value="Fleet">Fleet</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={() => setShowAddCustomer(false)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = newCustomer.name.trim() || "New Customer";
                  toast.success(`Added ${name}`);
                  setShowAddCustomer(false);
                  setNewCustomer({
                    name: "",
                    contactName: "",
                    phone: "",
                    email: "",
                    type: "Retail",
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </ListPageShell>
  );
}
