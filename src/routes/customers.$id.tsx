import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  Plus,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Truck,
  Send,
  MessageSquare,
  FileText,
  Users,
  Edit,
  CreditCard,
  Calendar,
} from "lucide-react";
import clsx from "clsx";
import { DetailPageShell, MetaPair } from "@/components/shop/DetailPageShell";
import { PageShell } from "@/components/shop/PageShell";
import { EmptyState } from "@/components/shop/EmptyState";
import { StatusBadge } from "@/components/shop/StatusBadge";
import { MoneyCell, DateCell } from "@/components/shop/cells";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { estimates } from "@/data/estimates";
import { useShopState } from "@/lib/shop-store";
import { useModals } from "@/components/ui/ModalProvider";
import { toast } from "sonner";
import { usd } from "@/lib/format";
import {
  CustomerHealthCard,
  getHealthDetail,
  HealthBadge,
} from "@/components/ai/CustomerHealthScore";
import { ARDunningTimeline } from "@/components/ai/ARDunningTimeline";

export const Route = createFileRoute("/customers/$id")({
  component: CustomerDetail,
});

function formatLifetimeValue(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString()}`;
}

type Tab = "overview" | "vehicles" | "repair-orders" | "estimates" | "messages" | "notes";

function CustomerDetail() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<Tab>("overview");
  const { repairOrders } = useShopState();
  const { open: openModal } = useModals();

  const customer = customers.find((c) => c.id === id);
  if (!customer) {
    return (
      <PageShell title="Customer not found">
        <EmptyState
          icon={Users}
          title="Customer not found"
          description={`We couldn't find a customer with ID ${id}.`}
        />
      </PageShell>
    );
  }

  const custVehicles = vehicles.filter((v) => v.customerId === id);
  const custROs = repairOrders.filter((r) => r.customerId === id);
  const custEstimates = estimates.filter((e) => e.customerId === id);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "vehicles", label: "Vehicles", count: custVehicles.length },
    { id: "repair-orders", label: "Repair Orders", count: custROs.length },
    { id: "estimates", label: "Estimates", count: custEstimates.length },
    { id: "messages", label: "Messages", count: 2, badgeTone: "accent" as const },
    { id: "notes", label: "Notes" },
  ];

  return (
    <DetailPageShell
      backTo="/customers"
      backLabel="All customers"
      eyebrow={`${customer.type.toUpperCase()} CUSTOMER · CUSTOMER SINCE ${format(parseISO(customer.lastVisit), "yyyy")}`}
      title={customer.name}
      titleMeta={
        <div className="flex flex-wrap items-center gap-2">
          <HealthBadge status={getHealthDetail(customer.id).status} />
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              customer.type === "Fleet"
                ? "bg-[#DBEAFE] text-[#1E40AF]"
                : "bg-surface text-foreground",
            )}
          >
            {customer.type}
          </span>
          {customer.fleetPlatform && (
            <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold text-[#991B1B]">
              {customer.fleetPlatform}
            </span>
          )}
          {customer.lifetimeValue >= 100000 && (
            <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
              VIP
            </span>
          )}
          {customer.openBalance > 10000 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
              <AlertTriangle className="h-2.5 w-2.5" />
              Past Due
            </span>
          )}
        </div>
      }
      headerRight={
        <div className="grid grid-cols-2 gap-3 text-right">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Lifetime
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {formatLifetimeValue(customer.lifetimeValue)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Open Balance
            </div>
            <div
              className={clsx(
                "mt-1 text-2xl font-semibold tabular-nums",
                customer.openBalance > 0 && "text-destructive",
              )}
            >
              {usd.format(customer.openBalance)}
            </div>
          </div>
        </div>
      }
      actions={
        <>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface">
            <Edit className="h-3 w-3" />
            Edit
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface">
            <Phone className="h-3 w-3" />
            Call
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface">
            <MessageSquare className="h-3 w-3" />
            Message
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface">
              <Calendar className="h-3 w-3" />
              Schedule
            </button>
            <button
              onClick={() => openModal("new-ro", { customerId: customer.id })}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-[11px] font-semibold text-brand-green-foreground hover:opacity-90"
            >
              <Plus className="h-3 w-3" />
              New RO
            </button>
          </div>
        </>
      }
      metaRow={
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <MetaPair label="Primary Contact" value={customer.contactName} />
          <MetaPair label="Phone" value={customer.phone} />
          <MetaPair label="Email" value={customer.email} />
          <MetaPair label="Last Visit" value={format(parseISO(customer.lastVisit), "MMM d, yyyy")} />
          <MetaPair label="Trucks In Shop" value={String(customer.trucksInShop)} />
        </div>
      }
      tabs={tabs}
      activeTabId={tab}
      onTabChange={(id) => setTab(id as Tab)}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {tab === "overview" && (
            <OverviewTab
              customer={customer}
              vehicles={custVehicles}
              repairOrders={custROs.slice(0, 5)}
            />
          )}
          {tab === "vehicles" && <VehiclesTab vehicles={custVehicles} />}
          {tab === "repair-orders" && <RepairOrdersTab ros={custROs} />}
          {tab === "estimates" && <EstimatesTab estimates={custEstimates} />}
          {tab === "messages" && <MessagesTab customerName={customer.name} />}
          {tab === "notes" && <NotesTab note={customer.notes} />}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          {/* Health Score — AI insights at the top */}
          <CustomerHealthCard
            customerName={customer.name}
            detail={getHealthDetail(customer.id)}
          />

          {/* Contact card */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider">Contact</h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="font-semibold">{customer.contactName}</div>
                  <div className="text-[10px] text-muted-foreground">Primary contact</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="tabular-nums">{customer.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <span>
                  {customer.address}
                  <br />
                  {customer.city}, {customer.state} {customer.zip}
                </span>
              </div>
            </div>
          </div>

          {/* Fleet integration */}
          {customer.fleetPlatform && (
            <div className="rounded-lg border border-border bg-background p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Fleet Integration
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
                  {customer.fleetPlatform[0]}
                </div>
                <div>
                  <div className="text-xs font-semibold">{customer.fleetPlatform}</div>
                  <div className="text-[10px] text-muted-foreground">Connected · Auto-sync ON</div>
                </div>
              </div>
              <button className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface">
                <ExternalLink className="h-3 w-3" />
                Open in {customer.fleetPlatform}
              </button>
            </div>
          )}

          {/* AR summary */}
          <div
            className={clsx(
              "rounded-lg border p-4",
              customer.openBalance > 10000
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-background",
            )}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Accounts Receivable
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current</span>
                <span className="font-semibold tabular-nums">
                  {usd.format(customer.openBalance * 0.3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">31-60 days</span>
                <span className="font-semibold tabular-nums">
                  {usd.format(customer.openBalance * 0.2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">61-90 days</span>
                <span className="font-semibold tabular-nums">
                  {usd.format(customer.openBalance * 0.1)}
                </span>
              </div>
              <div
                className={clsx(
                  "flex justify-between",
                  customer.openBalance > 10000 && "text-destructive",
                )}
              >
                <span>91+ days</span>
                <span className="font-semibold tabular-nums">
                  {usd.format(customer.openBalance * 0.4)}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Open</span>
                  <span
                    className={clsx(
                      "tabular-nums",
                      customer.openBalance > 0 && "text-destructive",
                    )}
                  >
                    {usd.format(customer.openBalance)}
                  </span>
                </div>
              </div>
            </div>
            {customer.openBalance > 0 && (
              <button className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90">
                <Send className="h-3 w-3" />
                Send Statement
              </button>
            )}
          </div>
        </aside>
      </div>
    </DetailPageShell>
  );
}

// ====================================================================
// Tab panels
// ====================================================================

function OverviewTab({
  customer,
  vehicles,
  repairOrders,
}: {
  customer: NonNullable<ReturnType<typeof customers.find>>;
  vehicles: ReturnType<typeof Array.prototype.filter>;
  repairOrders: ReturnType<typeof Array.prototype.filter>;
}) {
  const showDunning = customer.openBalance > 10000;
  return (
    <div className="space-y-4">
      {showDunning && (
        <ARDunningTimeline
          customerName={customer.name}
          amount={customer.openBalance}
          daysPastDue={185}
        />
      )}
      {customer.notes && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-4">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              !
            </span>
            <p className="text-xs text-[#991B1B]">{customer.notes}</p>
          </div>
        </div>
      )}

      <Section title="Vehicles" count={vehicles.length}>
        {vehicles.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-muted-foreground">
            No vehicles linked to this customer
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {vehicles.slice(0, 5).map((v: any) => (
              <li key={v.id} className="py-2">
                <Link
                  to="/vehicles/$id"
                  params={{ id: v.id }}
                  className="flex items-center gap-2.5 transition-colors hover:bg-surface/40"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold">{v.unit}</div>
                    <div className="truncate text-[10px] text-muted-foreground">
                      {v.year} {v.make} {v.model}
                    </div>
                  </div>
                  <div className="text-right text-[10px]">
                    <div className="text-muted-foreground">
                      {v.hours !== undefined
                        ? `${v.hours.toLocaleString()} hrs`
                        : `${(v.mileage ?? 0).toLocaleString()} mi`}
                    </div>
                    <div className="text-muted-foreground">
                      Last svc {format(parseISO(v.lastService), "MMM d")}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Recent Repair Orders" count={repairOrders.length}>
        {repairOrders.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-muted-foreground">
            No repair orders yet
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {repairOrders.map((r: any) => (
              <li key={r.id} className="py-2">
                <Link
                  to="/repair-orders/$id"
                  params={{ id: r.id }}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tabular-nums">#{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {r.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold tabular-nums">
                      {usd.format(r.total)}
                    </div>
                    <DateCell
                      date={r.openedAt}
                      className="text-[10px] text-muted-foreground"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function VehiclesTab({ vehicles }: { vehicles: ReturnType<typeof Array.prototype.filter> }) {
  if (vehicles.length === 0) {
    return (
      <EmptyState
        icon={Truck}
        title="No vehicles"
        description="Add a vehicle to this customer to start tracking service history."
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Vehicle</th>
            <th className="px-3 py-2 text-left font-semibold">VIN</th>
            <th className="px-3 py-2 text-left font-semibold">Plate</th>
            <th className="px-3 py-2 text-right font-semibold">Mileage/Hrs</th>
            <th className="px-3 py-2 text-right font-semibold">Last Service</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v: any) => (
            <tr
              key={v.id}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-surface/40"
            >
              <td className="px-3 py-2.5">
                <Link to="/vehicles/$id" params={{ id: v.id }}>
                  <div className="text-xs font-semibold">{v.unit}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {v.year} {v.make} {v.model}
                  </div>
                </Link>
              </td>
              <td className="px-3 py-2.5 font-mono text-[10px] text-muted-foreground">
                {v.vin}
              </td>
              <td className="px-3 py-2.5 text-[11px]">{v.licensePlate}</td>
              <td className="px-3 py-2.5 text-right text-[11px] tabular-nums">
                {v.hours !== undefined
                  ? `${v.hours.toLocaleString()} hrs`
                  : `${(v.mileage ?? 0).toLocaleString()} mi`}
              </td>
              <td className="px-3 py-2.5 text-right text-[11px]">
                {format(parseISO(v.lastService), "MMM d, yyyy")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RepairOrdersTab({ ros }: { ros: ReturnType<typeof Array.prototype.filter> }) {
  if (ros.length === 0) {
    return <EmptyState icon={FileText} title="No repair orders yet" />;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">RO #</th>
            <th className="px-3 py-2 text-left font-semibold">Description</th>
            <th className="px-3 py-2 text-left font-semibold">Status</th>
            <th className="px-3 py-2 text-right font-semibold">Opened</th>
            <th className="px-3 py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {ros.map((r: any) => (
            <tr key={r.id} className="cursor-pointer border-b border-border last:border-0 hover:bg-surface/40">
              <td className="px-3 py-2.5">
                <Link
                  to="/repair-orders/$id"
                  params={{ id: r.id }}
                  className="text-xs font-semibold tabular-nums hover:underline"
                >
                  #{r.id}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-xs">{r.description}</td>
              <td className="px-3 py-2.5">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-3 py-2.5 text-right text-[11px]">
                <DateCell date={r.openedAt} />
              </td>
              <td className="px-3 py-2.5 text-right">
                <MoneyCell value={r.total} className="text-xs font-semibold" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EstimatesTab({ estimates }: { estimates: ReturnType<typeof Array.prototype.filter> }) {
  if (estimates.length === 0) {
    return <EmptyState icon={FileText} title="No estimates" />;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Estimate</th>
            <th className="px-3 py-2 text-left font-semibold">Status</th>
            <th className="px-3 py-2 text-right font-semibold">Created</th>
            <th className="px-3 py-2 text-right font-semibold">Lines</th>
            <th className="px-3 py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((e: any) => (
            <tr key={e.id} className="cursor-pointer border-b border-border last:border-0 hover:bg-surface/40">
              <td className="px-3 py-2.5">
                <Link
                  to="/estimates/$id"
                  params={{ id: e.id }}
                  className="text-xs font-semibold tabular-nums hover:underline"
                >
                  {e.id}
                </Link>
              </td>
              <td className="px-3 py-2.5">
                <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold capitalize">
                  {e.status.replace("-", " ")}
                </span>
              </td>
              <td className="px-3 py-2.5 text-right text-[11px]">
                <DateCell date={e.createdAt} />
              </td>
              <td className="px-3 py-2.5 text-right text-[11px] tabular-nums">
                {e.lineItems.length}
              </td>
              <td className="px-3 py-2.5 text-right">
                <MoneyCell value={e.total} className="text-xs font-semibold" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MessagesTab({ customerName }: { customerName: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">Conversation with {customerName}</p>
      <div className="mt-3 space-y-2.5">
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-background px-3 py-2 text-[13px]">
            Can we add an oil change to MT-47 while you have it?
            <div className="mt-1 text-[10px] text-muted-foreground">8m ago · SMS</div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-3 py-2 text-[13px] text-background">
            Sure, adding it now.
            <div className="mt-1 text-[10px] text-background/60">Just now · drafted</div>
          </div>
        </div>
      </div>
      <Link
        to="/messages"
        className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-foreground hover:underline"
      >
        Open thread <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
}

function NotesTab({ note }: { note?: string }) {
  return (
    <div className="space-y-3">
      <textarea
        defaultValue={note ?? ""}
        placeholder="Internal notes about this customer…"
        className="h-32 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none"
      />
      <button className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background hover:opacity-90">
        Save Note
      </button>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider">
          {title}
          {count != null && (
            <span className="ml-2 text-muted-foreground">({count})</span>
          )}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
