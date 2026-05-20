import { createFileRoute } from "@tanstack/react-router";
import { Wrench, ClipboardCheck, DollarSign, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const stats = [
  { label: "Open ROs", value: "12", icon: Wrench, accent: "bg-accent" },
  { label: "Inspections Today", value: "5", icon: ClipboardCheck, accent: "bg-success text-white" },
  { label: "A/R Outstanding", value: "$8,420", icon: DollarSign, accent: "bg-foreground text-background" },
  { label: "Active Customers", value: "248", icon: Users, accent: "bg-surface" },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Here's what's happening in the shop today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${s.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Today's Schedule</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Connect appointments and technicians to populate this view.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">No recent activity yet.</p>
        </div>
      </div>
    </div>
  );
}
