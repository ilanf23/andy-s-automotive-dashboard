import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Truck,
  Settings as SettingsIcon,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import { PageShell } from "@/components/shop/PageShell";
import { fleetPlatforms } from "@/data/fleetPlatforms";

export const Route = createFileRoute("/fleet-integrations")({
  component: FleetIntegrationsPage,
});

const availableIntegrations = [
  { id: "geotab", name: "Geotab", description: "Telematics + fleet management", connected: false },
  { id: "samsara", name: "Samsara", description: "Connected operations cloud", connected: false },
  { id: "wex", name: "WEX Fleet", description: "Fuel cards + maintenance", connected: false },
  { id: "verizon", name: "Verizon Connect", description: "GPS tracking + maintenance", connected: false },
];

function FleetIntegrationsPage() {
  const connectedCount = fleetPlatforms.filter((p) => p.status === "connected").length;
  const totalActiveJobs = fleetPlatforms.reduce((acc, p) => acc + p.activeJobs, 0);

  return (
    <PageShell
      title="Fleet Integrations"
      description={`${connectedCount} connected · ${totalActiveJobs} active jobs syncing`}
      actions={
        <>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface">
            <RefreshCw className="h-3 w-3" />
            Sync All
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Integration
          </button>
        </>
      }
    >
      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Connected" value={String(connectedCount)} icon={CheckCircle} tone="success" />
        <StatTile label="Active Jobs" value={String(totalActiveJobs)} icon={Truck} />
        <StatTile label="Fleet Customers" value="6" icon={Truck} />
        <StatTile label="Sync Errors" value="0" icon={AlertTriangle} />
      </div>

      {/* Connected integrations */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Connected
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {fleetPlatforms.map((p) => (
            <ConnectionCard key={p.id} platform={p} />
          ))}
        </div>
      </div>

      {/* Available */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Available
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {availableIntegrations.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface text-sm font-bold">
                {a.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{a.name}</div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {a.description}
                </p>
                <button className="mt-3 inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-semibold hover:bg-surface">
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function ConnectionCard({ platform }: { platform: (typeof fleetPlatforms)[number] }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent text-xl font-bold text-accent-foreground">
            {platform.logoLetter}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{platform.name}</h3>
              <span
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                  platform.status === "connected"
                    ? "bg-success/15 text-success"
                    : "bg-surface text-muted-foreground",
                )}
              >
                <span
                  className={clsx(
                    "h-1.5 w-1.5 rounded-full",
                    platform.status === "connected"
                      ? "bg-success animate-pulse"
                      : "bg-muted-foreground",
                  )}
                />
                {platform.status}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Last sync {platform.lastSync}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
            title="Settings"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
          </button>
          <button
            className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
            title="Open in platform"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active Jobs
          </div>
          <div className="mt-0.5 text-lg font-semibold tabular-nums">
            {platform.activeJobs}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Customers
          </div>
          <div className="mt-0.5 text-xs font-medium">
            {platform.customers.length}
          </div>
        </div>
      </div>

      {platform.customers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {platform.customers.map((c) => (
            <span
              key={c}
              className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      <button className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface">
        <RefreshCw className="h-3 w-3" />
        Sync now
      </button>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof CheckCircle;
  tone?: "success" | "danger";
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon
          className={clsx(
            "h-3.5 w-3.5",
            tone === "success" && "text-success",
            tone === "danger" && "text-destructive",
            !tone && "text-muted-foreground",
          )}
        />
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
