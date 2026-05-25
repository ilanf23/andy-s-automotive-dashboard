import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Send,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { ListPageShell } from "@/components/shop/ListPageShell";
import { FilterBar } from "@/components/shop/FilterBar";
import { MoneyCell, DateCell, TableHeader, TableRow } from "@/components/shop/cells";
import { estimates, type Estimate } from "@/data/estimates";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { useModals } from "@/components/ui/ModalProvider";

export const Route = createFileRoute("/estimates/")({
  component: EstimatesListPage,
});

type TabKey =
  | "all"
  | "draft"
  | "sent"
  | "approved"
  | "partially-approved"
  | "declined";

const TABS: { key: TabKey; label: string; statuses: Estimate["status"][] | "all" }[] = [
  { key: "all", label: "All", statuses: "all" },
  { key: "draft", label: "Draft", statuses: ["draft"] },
  { key: "sent", label: "Sent", statuses: ["sent"] },
  { key: "partially-approved", label: "Partial", statuses: ["partially-approved"] },
  { key: "approved", label: "Approved", statuses: ["approved"] },
  { key: "declined", label: "Declined", statuses: ["declined"] },
];

const STATUS_STYLES: Record<Estimate["status"], string> = {
  draft: "bg-surface text-foreground border-border",
  sent: "bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]",
  approved: "bg-success/15 text-success border-success/30",
  declined: "bg-destructive/10 text-destructive border-destructive/30",
  "partially-approved": "bg-accent/30 text-[#991B1B] border-accent",
};

const STATUS_LABELS: Record<Estimate["status"], string> = {
  draft: "Draft",
  sent: "Sent",
  approved: "Approved",
  declined: "Declined",
  "partially-approved": "Partial",
};

type Row = Estimate & {
  customerName: string;
  customerType: "Fleet" | "Retail";
  vehicleUnit: string;
};

function EstimatesListPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { open: openModal } = useModals();

  const enriched: Row[] = useMemo(() => {
    const custMap = new Map(customers.map((c) => [c.id, c]));
    const vehMap = new Map(vehicles.map((v) => [v.id, v]));
    return estimates.map((e) => ({
      ...e,
      customerName: custMap.get(e.customerId)?.name ?? "—",
      customerType: custMap.get(e.customerId)?.type ?? "Retail",
      vehicleUnit: vehMap.get(e.vehicleId)?.unit ?? "—",
    }));
  }, []);

  const counts = useMemo(() => {
    const out: Record<TabKey, number> = {
      all: enriched.length,
      sent: 0,
      approved: 0,
      "partially-approved": 0,
      declined: 0,
      draft: 0,
    };
    for (const e of enriched) {
      out[e.status as TabKey] = (out[e.status as TabKey] ?? 0) + 1;
    }
    return out;
  }, [enriched]);

  const filteredRows = useMemo(() => {
    const tabDef = TABS.find((t) => t.key === activeTab)!;
    const q = search.trim().toLowerCase();
    return enriched
      .filter((r) =>
        tabDef.statuses === "all"
          ? true
          : (tabDef.statuses as Estimate["status"][]).includes(r.status),
      )
      .filter((r) => {
        if (!q) return true;
        return (
          r.id.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.vehicleUnit.toLowerCase().includes(q)
        );
      });
  }, [enriched, activeTab, search]);

  const tabs = TABS.map((t) => ({
    id: t.key,
    label: t.label,
    count: counts[t.key],
    badgeTone:
      t.key === "sent" && counts[t.key] > 0
        ? ("accent" as const)
        : undefined,
  }));

  const lostRevenueEstimate = enriched.find((e) => e.id === "EST-4847");

  return (
    <ListPageShell
      title="Estimates"
      description="Customer-facing estimates and approvals"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as TabKey)}
      actions={
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3.5 py-2 text-sm font-semibold text-brand-green-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Estimate
        </button>
      }
      filterBar={
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search estimate #, customer, vehicle…"
          filters={[
            { id: "advisor", label: "Advisor", value: "All" },
            { id: "date", label: "Created", value: "Last 30 days" },
            { id: "amount", label: "Amount", value: "Any" },
          ]}
          showExport
        />
      }
    >
      {/* Lost Revenue callout — platform differentiator, kept */}
      {lostRevenueEstimate && (
        <div className="border-b border-border bg-accent/10 px-3 py-2.5">
          <div className="flex items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/20">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#991B1B]" />
            <Link
              to="/estimates/$id"
              params={{ id: lostRevenueEstimate.id }}
              className="min-w-0 flex-1"
            >
              <div className="text-xs font-semibold text-[#991B1B]">
                EST-4847 — {lostRevenueEstimate.customerName} ·{" "}
                {lostRevenueEstimate.vehicleUnit}
              </div>
              <div className="mt-0.5 text-[11px] text-[#991B1B]/80">
                4 unestimated inspection findings · ~$1,200 potential revenue ·
                awaiting approval &gt;48hrs
              </div>
            </Link>
            <button
              type="button"
              onClick={() =>
                openModal("ai-estimate-builder", {
                  roId: lostRevenueEstimate.repairOrderId,
                })
              }
              className="inline-flex shrink-0 items-center gap-1 self-center rounded-md bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background hover:opacity-90"
            >
              <Sparkles className="h-3 w-3" />
              Build from findings
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <TableHeader
            cols={[
              { id: "id", label: "Estimate #", w: "120px" },
              { id: "status", label: "Status", w: "120px" },
              { id: "customer", label: "Customer / Vehicle" },
              { id: "created", label: "Created", align: "right", w: "100px" },
              { id: "lines", label: "Lines", align: "right", w: "60px" },
              { id: "routing", label: "Routing", w: "140px" },
              { id: "total", label: "Total", align: "right", w: "110px" },
            ]}
          />
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-xs text-muted-foreground">
                  No estimates in this view.
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() => navigate({ to: "/estimates/$id", params: { id: r.id } })}
                >
                  <td className="px-3 py-2.5">
                    <span className="font-semibold tabular-nums">{r.id}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        STATUS_STYLES[r.status],
                      )}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
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
                        {r.vehicleUnit}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <DateCell date={r.createdAt} className="text-[11px]" />
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-xs">
                    {r.lineItems.length}
                  </td>
                  <td className="px-3 py-2.5">
                    {r.sentToFleetManager ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E0E7FF] px-1.5 py-0.5 text-[9px] font-semibold text-[#3730A3]">
                        <Send className="h-2.5 w-2.5" />
                        Fleet Mgr
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        Customer direct
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <MoneyCell value={r.total} className="text-xs font-semibold" />
                  </td>
                </TableRow>
              ))
            )}
          </tbody>
          {filteredRows.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-surface/40">
                <td colSpan={6} className="px-3 py-2 text-right text-[11px] text-muted-foreground">
                  {filteredRows.length} of {enriched.length} estimates
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
