import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wrench,
  ClipboardCheck,
  Briefcase,
  Users,
  Car,
  Calendar,
  Package,
  BarChart3,
  CreditCard,
  Truck,
  ListChecks,
  Settings,
  Menu,
  Search,
  Bell,
} from "lucide-react";
import clsx from "clsx";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/repair-orders", label: "Repair Orders", icon: Wrench },
  { to: "/inspections", label: "Inspections", icon: ClipboardCheck },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/vehicles", label: "Vehicles", icon: Car },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/ar", label: "A/R", icon: CreditCard },
  { to: "/fleet-integrations", label: "Fleet Integrations", icon: Truck },
  { to: "/my-work", label: "My Work", icon: ListChecks },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex min-h-screen w-full bg-surface text-foreground">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed z-40 flex h-screen flex-col border-r border-border bg-background transition-all duration-200 md:static md:z-auto",
          collapsed ? "md:w-16" : "md:w-60",
          mobileOpen ? "w-60 translate-x-0" : "w-60 -translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent font-bold text-accent-foreground">
            A
          </div>
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight">
              Andy's OS
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to as string}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "text-foreground/80 hover:bg-surface hover:text-foreground",
                      collapsed && "md:justify-center md:px-2",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {active && !collapsed && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden w-full items-center justify-center rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-surface md:flex"
          >
            <Menu className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 hover:bg-surface md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <h1 className="text-sm font-semibold">Andy's Automotive</h1>
          </div>

          <div className="ml-4 hidden flex-1 md:block">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ROs, customers, vehicles…"
                className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="rounded-md p-2 hover:bg-surface" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
              AC
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
