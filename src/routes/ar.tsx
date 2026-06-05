import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { deriveOpenInvoices, type OpenInvoice } from "@/lib/financials";
import {
  Send,
  Download,
  AlertTriangle,
  Phone,
  Mail,
  CreditCard,
  Plus,
  FileText,
} from "lucide-react";
import clsx from "clsx";
import { ListPageShell } from "@/components/shop/ListPageShell";
import { FilterBar } from "@/components/shop/FilterBar";
import { MoneyCell, DateCell, TableHeader, TableRow } from "@/components/shop/cells";
import { customers } from "@/data/customers";
import { useShopState } from "@/lib/shop-store";
import { useModals } from "@/components/ui/ModalProvider";
import { toast } from "sonner";
import { usd } from "@/lib/format";

export const Route = createFileRoute("/ar")({
  component: ARPage,
});

type TabKey = "open" | "past-due" | "payments" | "statements";

function ARPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("open");
  const [search, setSearch] = useState("");
  const { repairOrders } = useShopState();
  const { open: openModal } = useModals();

  const invoices: OpenInvoice[] = useMemo(() => deriveOpenInvoices(), []);

  // Aging buckets
  const buckets = useMemo(() => {
    const result = { current: 0, b30: 0, b60: 0, b90: 0, b91: 0 };
    for (const inv of invoices) {
      if (inv.daysPastDue <= 0) result.current += inv.balance;
      else if (inv.daysPastDue <= 30) result.b30 += inv.balance;
      else if (inv.daysPastDue <= 60) result.b60 += inv.balance;
      else if (inv.daysPastDue <= 90) result.b90 += inv.balance;
      else result.b91 += inv.balance;
    }
    return result;
  }, [invoices]);

  const totalOpen = invoices.reduce((acc, i) => acc + i.balance, 0);
  const pastDue = invoices.filter((i) => i.daysPastDue > 0);

  const counts: Record<TabKey, number> = {
    open: invoices.length,
    "past-due": pastDue.length,
    payments: 18,
    statements: customers.filter((c) => c.openBalance > 0).length,
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices
      .filter((i) => {
        if (activeTab === "past-due") return i.daysPastDue > 0;
        return true;
      })
      .filter((i) => {
        if (!q) return true;
        return (
          i.id.toLowerCase().includes(q) ||
          i.customer.toLowerCase().includes(q) ||
          i.roId.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.daysPastDue - a.daysPastDue);
  }, [invoices, activeTab, search]);

  const tabs = [
    { id: "open", label: "Open Invoices", count: counts.open },
    {
      id: "past-due",
      label: "Past Due",
      count: counts["past-due"],
      badgeTone: counts["past-due"] > 0 ? ("danger" as const) : undefined,
    },
    { id: "payments", label: "Payments", count: counts.payments },
    { id: "statements", label: "Statements", count: counts.statements },
  ];

  return (
    <ListPageShell
      title="AR / Payments"
      description="Outstanding invoices and payment activity"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as TabKey)}
      actions={
        <>
          <button
            onClick={() =>
              openModal("confirm", {
                title: `Send ${counts.statements} customer statements?`,
                description:
                  "Statements will be emailed to each customer with an open balance. Past-due customers will receive a stronger reminder.",
                confirmLabel: "Send statements",
                tone: "default",
                onConfirm: () => {
                  toast.success(`${counts.statements} statements queued`, {
                    description: "Sending in batches over the next 5 minutes",
                  });
                },
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
          >
            <Send className="h-3 w-3" />
            Send Statements
          </button>
          <button
            onClick={() => {
              const firstOpen = repairOrders.find((r) => r.total > 0);
              if (firstOpen) openModal("take-payment", { roId: firstOpen.id });
              else toast.info("No open invoices to pay");
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-2 text-sm font-semibold text-brand-green-foreground hover:opacity-90"
          >
            <CreditCard className="h-4 w-4" />
            Take Payment
          </button>
        </>
      }
      filterBar={
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search invoice #, customer, RO…"
          filters={[
            { id: "aging", label: "Aging", value: "All" },
            { id: "amount", label: "Amount", value: "Any" },
          ]}
          showExport
        />
      }
    >
      {/* Aging buckets */}
      <div className="grid grid-cols-2 gap-2 border-b border-border bg-surface/30 px-3 py-3 sm:grid-cols-5">
        <BucketTile label="Current" value={buckets.current} tone="default" />
        <BucketTile label="1-30 days" value={buckets.b30} tone="warning" />
        <BucketTile label="31-60 days" value={buckets.b60} tone="warning" />
        <BucketTile label="61-90 days" value={buckets.b90} tone="danger" />
        <BucketTile label="91+ days" value={buckets.b91} tone="danger" />
      </div>

      {activeTab === "payments" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <TableHeader
              cols={[
                { id: "pay", label: "Payment", w: "120px" },
                { id: "date", label: "Date", align: "right", w: "110px" },
                { id: "customer", label: "Customer" },
                { id: "method", label: "Method", w: "120px" },
                { id: "amount", label: "Amount", align: "right", w: "110px" },
              ]}
            />
            <tbody>
              {[
                { id: "PMT-9012", date: "May 19", customer: "Med Trust", method: "ACH", amount: 4250.0 },
                { id: "PMT-9013", date: "May 18", customer: "City Form", method: "Credit Card", amount: 1820.5 },
                { id: "PMT-9014", date: "May 17", customer: "Reliable Ducks", method: "Check", amount: 3475.0 },
              ].map((p) => (
                <TableRow key={p.id}>
                  <td className="px-3 py-2.5 text-xs font-semibold tabular-nums">{p.id}</td>
                  <td className="px-3 py-2.5 text-right text-[11px]">{p.date}</td>
                  <td className="px-3 py-2.5 text-xs font-semibold">{p.customer}</td>
                  <td className="px-3 py-2.5 text-[11px]">{p.method}</td>
                  <td className="px-3 py-2.5 text-right">
                    <MoneyCell value={p.amount} className="text-xs font-semibold" />
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === "statements" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <TableHeader
              cols={[
                { id: "stmt", label: "Statement", w: "120px" },
                { id: "customer", label: "Customer" },
                { id: "period", label: "Period", w: "140px" },
                { id: "sent", label: "Sent", w: "100px" },
                { id: "balance", label: "Balance", align: "right", w: "110px" },
              ]}
            />
            <tbody>
              {[
                { id: "STMT-2401", customer: "Med Trust", period: "May 2026", sent: "May 20", balance: 8420 },
                { id: "STMT-2402", customer: "Northpoint Logistics", period: "May 2026", sent: "May 20", balance: 12750 },
              ].map((s) => (
                <TableRow key={s.id}>
                  <td className="px-3 py-2.5 text-xs font-semibold tabular-nums">{s.id}</td>
                  <td className="px-3 py-2.5 text-xs font-semibold">{s.customer}</td>
                  <td className="px-3 py-2.5 text-[11px]">{s.period}</td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{s.sent}</td>
                  <td className="px-3 py-2.5 text-right">
                    <MoneyCell value={s.balance} className="text-xs font-semibold" />
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <TableHeader
            cols={[
              { id: "inv", label: "Invoice", w: "100px" },
              { id: "ro", label: "RO", w: "80px" },
              { id: "customer", label: "Customer" },
              { id: "issued", label: "Issued", align: "right", w: "100px" },
              { id: "due", label: "Due", align: "right", w: "100px" },
              { id: "aging", label: "Aging", w: "120px" },
              { id: "balance", label: "Balance", align: "right", w: "110px" },
              { id: "actions", label: "", w: "120px" },
            ]}
          />
          <tbody>
            {filtered.map((i) => (
              <TableRow key={i.id}>
                <td className="px-3 py-2.5 text-xs font-semibold tabular-nums">
                  {i.id}
                </td>
                <td className="px-3 py-2.5 text-xs tabular-nums">#{i.roId}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">{i.customer}</span>
                    {i.customerType === "Fleet" && (
                      <span className="rounded-full bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#1E40AF]">
                        F
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <DateCell date={i.issued} className="text-[11px]" />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <DateCell date={i.due} className="text-[11px]" />
                </td>
                <td className="px-3 py-2.5">
                  <AgingBadge days={i.daysPastDue} />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <MoneyCell
                    value={i.balance}
                    className={clsx(
                      "text-xs font-semibold",
                      i.daysPastDue > 60 && "text-destructive",
                    )}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Statement sent to ${i.customer}`);
                      }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                      title="Send statement"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Calling ${i.customer}…`);
                      }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                      title="Call"
                    >
                      <Phone className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const matchedRO = repairOrders.find(
                          (r) => r.customerId === i.customerId && r.total > 0,
                        );
                        if (matchedRO) openModal("take-payment", { roId: matchedRO.id });
                        else if (repairOrders[0])
                          openModal("take-payment", { roId: repairOrders[0].id });
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-brand-green px-2 py-1 text-[10px] font-semibold text-brand-green-foreground hover:opacity-90"
                      title="Take payment"
                    >
                      <CreditCard className="h-3 w-3" />
                      Pay
                    </button>
                  </div>
                </td>
              </TableRow>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-surface/40">
              <td colSpan={6} className="px-3 py-2 text-right text-[11px] text-muted-foreground">
                {filtered.length} invoices · Total outstanding
              </td>
              <td className="px-3 py-2 text-right text-xs font-bold tabular-nums">
                ${totalOpen.toLocaleString()}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      )}
    </ListPageShell>
  );
}

function BucketTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "warning" | "danger";
}) {
  return (
    <div
      className={clsx(
        "rounded-md border bg-background p-2.5",
        tone === "warning" && "border-accent/40",
        tone === "danger" && "border-destructive/30 bg-destructive/5",
        tone === "default" && "border-border",
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={clsx(
          "mt-1 text-base font-semibold tabular-nums",
          tone === "danger" && value > 0 && "text-destructive",
          tone === "warning" && value > 0 && "text-[#991B1B]",
        )}
      >
        {usd.format(value)}
      </div>
    </div>
  );
}

function AgingBadge({ days }: { days: number }) {
  if (days <= 0) {
    return (
      <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
        Current
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold text-[#991B1B]">
        {days} days
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">
      <AlertTriangle className="h-2.5 w-2.5" />
      {days} days
    </span>
  );
}
