import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
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
  Save,
  ChevronRight,
  Plus,
  Upload,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { PageShell } from "@/components/shop/PageShell";
import { Modal } from "@/components/ui/Modal";

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
        <button
          type="button"
          onClick={() => toast.success("Settings saved")}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background hover:opacity-90"
        >
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <Panel title="Shop Information" description="Public-facing shop details">
      <div className="mb-4 flex items-center gap-3 rounded-md border border-border bg-surface/30 p-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-background">
          LOGO
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold">Shop Logo</div>
          <div className="text-[10px] text-muted-foreground">PNG or SVG, square preferred</div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={() => toast.success("Logo uploaded")}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
        >
          <Upload className="h-3 w-3" />
          Upload Logo
        </button>
      </div>
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
  const [dayClosed, setDayClosed] = useState<Record<string, boolean>>({
    Sunday: true,
  });
  return (
    <Panel title="Business Hours" description="When customers can book online">
      <div className="space-y-2">
        {days.map((d, i) => {
          const closed = !!dayClosed[d];
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
              <button
                type="button"
                onClick={() =>
                  setDayClosed((p) => ({ ...p, [d]: !p[d] }))
                }
                className="ml-auto rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface"
              >
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
      <div className="mt-4 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => toast.success("Tax added")}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
        >
          <Plus className="h-3 w-3" />
          Add Tax
        </button>
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
                <button
                  type="button"
                  onClick={() => toast.info(`Edit ${r.name}`)}
                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                >
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
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Service Advisor");
  return (
    <Panel title="Employees & Roles" description="Team members with platform access">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
        >
          <Plus className="h-3 w-3" />
          Invite User
        </button>
      </div>
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
            <button
              type="button"
              onClick={() => toast.info(`Edit ${e.name}`)}
              className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
      <Modal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Invite User"
        description="Send a platform invitation to a new team member"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success(`Invitation sent to ${inviteEmail || "user"}`);
                setInviteEmail("");
                setInviteOpen(false);
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
              Email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option>Service Advisor</option>
              <option>Technician</option>
              <option>Manager</option>
              <option>Owner</option>
            </select>
          </div>
        </div>
      </Modal>
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
  const [showKey, setShowKey] = useState(false);
  const apiKey = "sk_demo_placeholder_0000000000000000";
  const masked = "sk_live_" + "•".repeat(apiKey.length - 8);
  return (
    <Panel title="Integrations" description="Connected platforms and APIs">
      <p className="text-xs text-muted-foreground">
        Manage individual integrations on the{" "}
        <Link
          to="/fleet-integrations"
          className="font-semibold text-foreground underline-offset-2 hover:underline"
        >
          Fleet Integrations
        </Link>{" "}
        page.
      </p>
      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xs font-semibold">OpenAI Copilot</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Connected via{" "}
              <code className="rounded bg-surface px-1 py-0.5 font-mono text-[10px]">
                OPENAI_API_KEY
              </code>{" "}
              (.env.local) — server-managed, never exposed to the client.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Connected
          </span>
        </div>
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-xs font-semibold">API Access</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Use this key for API integrations or webhooks.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={showKey ? apiKey : masked}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none"
          />
          <button
            type="button"
            onClick={() => setShowKey((s) => !s)}
            className="rounded-md border border-border bg-background p-2 hover:bg-surface"
            title={showKey ? "Hide" : "Show"}
          >
            {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(apiKey).catch(() => {});
              }
              toast.success("API key copied");
            }}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
          <button
            type="button"
            onClick={() => toast.success("API key regenerated")}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </button>
        </div>
      </div>
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
      <div className="mt-4 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => toast.info("Add payment method — coming soon")}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
        >
          <Plus className="h-3 w-3" />
          Add payment method
        </button>
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
          <button
            type="button"
            onClick={() => toast.info("2FA setup — coming soon")}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-surface"
          >
            <Shield className="h-3 w-3" />
            Configure
          </button>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs font-semibold">Session timeout</div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Sign out idle users after a period of inactivity
          </p>
          <select
            defaultValue="30"
            onChange={(e) =>
              toast.success(
                `Timeout set to ${e.target.value === "never" ? "Never" : e.target.value + " minutes"}`,
              )
            }
            className="mt-2 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium outline-none focus:border-accent"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="never">Never</option>
          </select>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-xs font-semibold">Audit log</div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Track logins, RO posts, and AR adjustments
          </p>
          <button
            type="button"
            onClick={() => toast.info("Audit log — coming soon")}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-surface"
          >
            View log
          </button>
        </div>
      </div>
    </Panel>
  );
}

function BillingPanel() {
  const invoices = [
    { id: "INV-2026-05", date: "May 1, 2026", amount: 849.0 },
    { id: "INV-2026-04", date: "April 1, 2026", amount: 849.0 },
    { id: "INV-2026-03", date: "March 1, 2026", amount: 849.0 },
  ];
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
        <div className="mt-3 border-t border-accent/30 pt-3">
          <button
            type="button"
            onClick={() => toast.info("Plan management — coming soon")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
          >
            Update plan
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Past Invoices
        </h3>
        <div className="divide-y divide-border rounded-md border border-border bg-background">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between px-3 py-2.5">
              <div>
                <div className="text-xs font-semibold">{inv.id}</div>
                <div className="text-[10px] text-muted-foreground">{inv.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tabular-nums">${inv.amount.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => toast.success("Invoice downloaded")}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-surface"
                >
                  <Download className="h-3 w-3" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
