import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Clock,
  Receipt,
  Wrench,
  Users,
  Bell,
  Plug,
  CreditCard,
  Shield,
  Printer,
  Smartphone,
  Save,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { PageShell } from "@/components/shop/PageShell";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

type SettingsSection =
  | "shop-info"
  | "hours"
  | "tax-pricing"
  | "labor-rates"
  | "employees"
  | "notifications"
  | "integrations"
  | "payments"
  | "security"
  | "billing";

const sections: Array<{
  id: SettingsSection;
  label: string;
  icon: typeof SettingsIcon;
  group: "Shop" | "Operations" | "People" | "System";
}> = [
  { id: "shop-info", label: "Shop Information", icon: Building2, group: "Shop" },
  { id: "hours", label: "Business Hours", icon: Clock, group: "Shop" },
  { id: "tax-pricing", label: "Tax & Pricing", icon: Receipt, group: "Operations" },
  { id: "labor-rates", label: "Labor Rates", icon: Wrench, group: "Operations" },
  { id: "employees", label: "Employees & Roles", icon: Users, group: "People" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "People" },
  { id: "integrations", label: "Integrations", icon: Plug, group: "System" },
  { id: "payments", label: "Payment Methods", icon: CreditCard, group: "System" },
  { id: "security", label: "Security & Access", icon: Shield, group: "System" },
  { id: "billing", label: "Subscription & Billing", icon: Receipt, group: "System" },
];

function SettingsPage() {
  const [active, setActive] = useState<SettingsSection>("shop-info");

  const grouped = new Map<string, typeof sections>();
  for (const s of sections) {
    const arr = grouped.get(s.group) ?? [];
    arr.push(s);
    grouped.set(s.group, arr);
  }

  return (
    <PageShell
      title="Settings"
      description="Configure your shop, team, and integrations"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        {/* Settings nav rail */}
        <aside className="rounded-lg border border-border bg-background p-1.5">
          {Array.from(grouped.entries()).map(([group, items]) => (
            <div key={group} className="mb-2 last:mb-0">
              <div className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </div>
              <ul className="space-y-0.5">
                {items.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setActive(s.id)}
                        className={clsx(
                          "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                          active === s.id
                            ? "bg-foreground text-background"
                            : "hover:bg-surface/60",
                        )}
                      >
                        <Icon
                          className={clsx(
                            "h-3.5 w-3.5 shrink-0",
                            active === s.id ? "" : "text-muted-foreground",
                          )}
                        />
                        <span className="flex-1 font-medium">{s.label}</span>
                        {active === s.id && <ChevronRight className="h-3 w-3" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* Settings panel */}
        <div className="min-w-0">
          {active === "shop-info" && <ShopInfoPanel />}
          {active === "hours" && <HoursPanel />}
          {active === "tax-pricing" && <TaxPricingPanel />}
          {active === "labor-rates" && <LaborRatesPanel />}
          {active === "employees" && <EmployeesPanel />}
          {active === "notifications" && <NotificationsPanel />}
          {active === "integrations" && <IntegrationsPanel />}
          {active === "payments" && <PaymentsPanel />}
          {active === "security" && <SecurityPanel />}
          {active === "billing" && <BillingPanel />}
        </div>
      </div>
    </PageShell>
  );
}

// ====================================================================
// Panels
// ====================================================================
function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background hover:opacity-90">
          <Save className="h-3 w-3" />
          Save
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        defaultValue={value}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
    </div>
  );
}

function Toggle({
  label,
  description,
  defaultOn = false,
}: {
  label: string;
  description: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={clsx(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          on ? "bg-foreground" : "bg-surface",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
            on ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function ShopInfoPanel() {
  return (
    <Panel title="Shop Information" description="Public-facing shop details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Shop Name" value="Andy's Automotive" />
        <Field label="DBA / Legal" value="Andy's Automotive, LLC" />
        <Field label="Phone" value="(904) 555-0100" />
        <Field label="Email" value="service@andysauto.com" />
        <Field label="Address" value="1240 Industrial Pkwy" />
        <Field label="City / State / ZIP" value="Jacksonville, FL 32218" />
        <Field label="Tax ID" value="59-XXXXXXX" />
        <Field label="Time Zone" value="America/New_York" />
      </div>
    </Panel>
  );
}

function HoursPanel() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return (
    <Panel title="Business Hours" description="When customers can book online">
      <div className="space-y-2">
        {days.map((d, i) => {
          const closed = i === 6;
          return (
            <div
              key={d}
              className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
            >
              <div className="w-28 text-sm font-semibold">{d}</div>
              {closed ? (
                <span className="text-xs text-muted-foreground">Closed</span>
              ) : (
                <>
                  <input
                    defaultValue={i === 5 ? "9:00 AM" : "7:30 AM"}
                    className="w-24 rounded-md border border-border bg-background px-2 py-1 text-xs tabular-nums outline-none focus:border-accent"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    defaultValue={i === 5 ? "1:00 PM" : "6:00 PM"}
                    className="w-24 rounded-md border border-border bg-background px-2 py-1 text-xs tabular-nums outline-none focus:border-accent"
                  />
                </>
              )}
              <button className="ml-auto rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface">
                {closed ? "Open" : "Close"}
              </button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function TaxPricingPanel() {
  return (
    <Panel title="Tax & Pricing" description="Sales tax rates and parts markup">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Sales Tax Rate (%)" value="7.0" />
        <Field label="Tax Type" value="Parts only" />
        <Field label="Default Parts Markup (%)" value="100" />
        <Field label="Min Margin (%)" value="35" />
        <Field label="Shop Supplies %" value="3.5" />
        <Field label="EPA / Haz Materials Fee" value="$2.50" />
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <Toggle
          label="Apply shop supplies to every RO"
          description="Auto-add a supplies line based on labor hours"
          defaultOn
        />
        <Toggle
          label="Show GP% on RO header"
          description="Display gross profit % to service advisors"
          defaultOn
        />
      </div>
    </Panel>
  );
}

function LaborRatesPanel() {
  const rates = [
    { name: "Standard", rate: 148, desc: "General service" },
    { name: "Heavy Duty / Diesel", rate: 168, desc: "Class 5-8 trucks" },
    { name: "Diagnostic", rate: 195, desc: "Electrical, programming" },
    { name: "Fleet", rate: 138, desc: "Negotiated fleet rate" },
    { name: "Warranty", rate: 95, desc: "Manufacturer reimbursement" },
  ];
  return (
    <Panel title="Labor Rates" description="Rate matrix used on estimates and ROs">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Rate Name</th>
            <th className="px-3 py-2 text-left font-semibold">Description</th>
            <th className="px-3 py-2 text-right font-semibold">Rate ($/hr)</th>
            <th className="px-3 py-2 text-right font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <tr key={r.name} className="border-b border-border last:border-0">
              <td className="px-3 py-2.5 text-xs font-semibold">{r.name}</td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">{r.desc}</td>
              <td className="px-3 py-2.5 text-right text-xs font-semibold tabular-nums">
                ${r.rate}
              </td>
              <td className="px-3 py-2.5 text-right">
                <button className="text-[10px] font-medium text-muted-foreground hover:text-foreground">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function EmployeesPanel() {
  const employees = [
    { name: "Cameron Mills", role: "Service Advisor", email: "cameron@andysauto.com", active: true },
    { name: "Stewart Park", role: "Service Advisor", email: "stewart@andysauto.com", active: true },
    { name: "Cody Bell", role: "Service Advisor", email: "cody@andysauto.com", active: true },
    { name: "Marcus Reeves", role: "Lead Diesel Tech", email: "marcus@andysauto.com", active: true },
    { name: "Jose Alvarez", role: "Hydraulics Specialist", email: "jose@andysauto.com", active: true },
    { name: "Andre Bell", role: "Electrical Specialist", email: "andre@andysauto.com", active: true },
    { name: "Trevor Hicks", role: "General Tech", email: "trevor@andysauto.com", active: true },
    { name: "Danny Pearce", role: "Apprentice", email: "danny@andysauto.com", active: true },
  ];
  return (
    <Panel title="Employees & Roles" description="Team members with platform access">
      <div className="space-y-1">
        {employees.map((e) => (
          <div
            key={e.email}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                {e.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div>
                <div className="text-xs font-semibold">{e.name}</div>
                <div className="text-[10px] text-muted-foreground">{e.email}</div>
              </div>
            </div>
            <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold">
              {e.role}
            </span>
            {e.active && (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                Active
              </span>
            )}
            <button className="text-[10px] font-medium text-muted-foreground hover:text-foreground">
              Edit
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NotificationsPanel() {
  return (
    <Panel title="Notifications" description="What gets sent automatically — and to whom">
      <div className="divide-y divide-border">
        <Toggle
          label="SMS estimate to customer"
          description="When advisor presses Send Estimate"
          defaultOn
        />
        <Toggle
          label="Email estimate to customer"
          description="Also email a PDF copy"
          defaultOn
        />
        <Toggle
          label="Auto-send to fleet manager"
          description="Route fleet customer estimates via Fleetio/Holman/etc."
          defaultOn
        />
        <Toggle
          label="Inspection ready for review"
          description="Notify advisor when tech completes a DVI"
          defaultOn
        />
        <Toggle
          label="Past-due reminders"
          description="Auto-email customers at 30/60/90 days past due"
          defaultOn
        />
        <Toggle
          label="Daily summary email"
          description="EOD recap to owner at 6pm"
          defaultOn
        />
      </div>
    </Panel>
  );
}

function IntegrationsPanel() {
  return (
    <Panel title="Integrations" description="Connected platforms and APIs">
      <p className="text-xs text-muted-foreground">
        Manage individual integrations on the{" "}
        <a
          href="/fleet-integrations"
          className="font-semibold text-foreground underline-offset-2 hover:underline"
        >
          Fleet Integrations
        </a>{" "}
        page.
      </p>
    </Panel>
  );
}

function PaymentsPanel() {
  return (
    <Panel title="Payment Methods" description="Accepted payment types and processor settings">
      <div className="divide-y divide-border">
        <Toggle label="Credit / Debit (Tekmetric Pay)" description="Visa, MC, Amex, Discover" defaultOn />
        <Toggle label="ACH / Bank transfer" description="For fleet accounts net-30" defaultOn />
        <Toggle label="Cash" description="In-shop only" defaultOn />
        <Toggle label="Check" description="Manual entry, no auto-deposit" defaultOn />
        <Toggle label="In-bay tap-to-pay" description="iPhone NFC at the bay" />
      </div>
    </Panel>
  );
}

function SecurityPanel() {
  return (
    <Panel title="Security & Access" description="Authentication and role permissions">
      <div className="space-y-3">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs font-semibold">Two-factor authentication</div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Required for all owner accounts. Optional for technicians.
          </p>
          <button className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-surface">
            <Shield className="h-3 w-3" />
            Configure
          </button>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs font-semibold">Session timeout</div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Sign out idle users after 30 minutes
          </p>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs font-semibold">Audit log</div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Track logins, RO posts, and AR adjustments
          </p>
        </div>
      </div>
    </Panel>
  );
}

function BillingPanel() {
  return (
    <Panel title="Subscription & Billing" description="Your platform plan and payment method">
      <div className="rounded-md border border-accent/40 bg-accent/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold">Andy's OS — Heavy Duty Plan</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              5 service advisors · unlimited techs · AI features included
            </div>
          </div>
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
            ACTIVE
          </span>
        </div>
        <div className="mt-3 border-t border-accent/30 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Next invoice</span>
            <span className="font-semibold tabular-nums">$849.00 · June 1</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
