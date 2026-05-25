import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wrench,
  ClipboardCheck,
  FileText,
  Briefcase,
  Users,
  Car,
  Calendar,
  Package,
  BarChart3,
  CreditCard,
  Truck,
  ListChecks,
  MessageSquare,
  Settings,
  Menu,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  LogOut,
  Plus,
  ScanLine,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "@tanstack/react-router";
import { useModals } from "@/components/ui/ModalProvider";
import { AICopilotBar } from "@/components/ai/AICopilotBar";
import { TopNavSearch } from "@/components/layout/TopNavSearch";
import { useAuth } from "@/lib/auth-context";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: string | number;
  badgeTone?: "accent" | "danger" | "muted";
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
      {
        to: "/copilot",
        label: "AI Copilot",
        icon: Sparkles,
        badge: "NEW",
        badgeTone: "accent",
      },
    ],
  },
  {
    label: "Workflow",
    items: [
      { to: "/schedule", label: "Schedule", icon: Calendar },
      { to: "/estimates", label: "Estimates", icon: FileText },
      {
        to: "/repair-orders",
        label: "Repair Orders",
        icon: Wrench,
        badge: 9,
        badgeTone: "accent",
      },
      { to: "/inspections", label: "Inspections", icon: ClipboardCheck },
      { to: "/jobs", label: "Jobs", icon: Briefcase },
    ],
  },
  {
    label: "Records",
    items: [
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/vehicles", label: "Vehicles", icon: Car },
      { to: "/inventory", label: "Parts", icon: Package },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        to: "/messages",
        label: "Messages",
        icon: MessageSquare,
        badge: 2,
        badgeTone: "accent",
      },
      { to: "/my-work", label: "My Work", icon: ListChecks },
      { to: "/ar", label: "AR / Payments", icon: CreditCard, badge: "!", badgeTone: "danger" },
      { to: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Setup",
    items: [
      { to: "/fleet-integrations", label: "Fleet Integrations", icon: Truck },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { open: openModal } = useModals();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/" });
  };

  // Derive display name + initials from authenticated user, with sensible fallback
  const displayName = user?.name ?? "Cameron Mills";
  const displayRole =
    user?.role === "owner"
      ? "Owner"
      : user?.role === "tech"
        ? "Technician"
        : user?.role === "office"
          ? "Office"
          : "Service Advisor";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

      {/* ==================================================================== */}
      {/* Sidebar — dark, sectioned, dense                                     */}
      {/* ==================================================================== */}
      <aside
        className={clsx(
          "fixed top-0 z-40 flex h-screen flex-col bg-foreground text-background transition-all duration-200 md:sticky md:z-auto md:shrink-0 md:self-start",
          collapsed ? "md:w-[68px]" : "md:w-[232px]",
          mobileOpen
            ? "w-[232px] translate-x-0"
            : "w-[232px] -translate-x-full md:translate-x-0",
        )}
      >
        {/* Brand / Shop selector */}
        <div
          className={clsx(
            "flex h-14 items-center gap-2.5 border-b border-white/10 px-3",
            collapsed && "md:justify-center md:px-2",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
            A
          </div>
          {!collapsed && (
            <button
              type="button"
              className="group flex min-w-0 flex-1 items-center justify-between rounded-md px-1.5 py-1 text-left transition-colors hover:bg-white/10"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold leading-tight">
                  Andy's Automotive
                </div>
                <div className="truncate text-[10px] leading-tight text-white/50">
                  Heavy Duty Shop
                </div>
              </div>
              <ChevronsRight className="h-3.5 w-3.5 shrink-0 text-white/40 transition-transform group-hover:text-white/80" />
            </button>
          )}
        </div>

        {/* Quick actions — primary CTAs */}
        <div className={clsx("space-y-1.5 px-3 pt-3", collapsed && "md:px-2")}>
          <button
            type="button"
            onClick={() => openModal("new-ro", {})}
            className={clsx(
              "flex items-center justify-center gap-2 rounded-md bg-brand-green text-brand-green-foreground shadow-sm transition-opacity hover:opacity-90",
              collapsed
                ? "h-9 w-full md:h-10"
                : "w-full px-3 py-2 text-[13px] font-semibold",
            )}
            title="New Repair Order"
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span>New Repair Order</span>}
          </button>
          {!collapsed && (
            <button
              type="button"
              onClick={() => openModal("auto-ro-arrival", {})}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/85 transition-colors hover:bg-white/15"
              title="Vehicle Arrived — AI auto-creates RO from VIN/plate"
            >
              <ScanLine className="h-3 w-3" />
              <span>Vehicle Arrived</span>
            </button>
          )}
          {collapsed && (
            <button
              type="button"
              onClick={() => openModal("auto-ro-arrival", {})}
              className="flex h-8 w-full items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/85 transition-colors hover:bg-white/15"
              title="Vehicle Arrived"
            >
              <ScanLine className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="mt-3 flex-1 overflow-y-auto px-2 pb-3">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className={clsx(sIdx > 0 && "mt-4")}>
              {section.label && !collapsed && (
                <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
                  {section.label}
                </div>
              )}
              {section.label && collapsed && sIdx > 0 && (
                <div className="mx-2 mb-1.5 h-px bg-white/10" />
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to, item.exact);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to as string}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={clsx(
                          "group relative flex items-center gap-3 rounded-md text-[13px] font-medium transition-colors",
                          collapsed
                            ? "md:h-9 md:justify-center md:px-2"
                            : "px-2.5 py-2",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-white/75 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        {/* Active accent bar (when not collapsed) */}
                        {active && !collapsed && (
                          <span className="absolute -left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent" />
                        )}
                        <Icon
                          className={clsx(
                            "h-[18px] w-[18px] shrink-0",
                            !active && "text-white/60 group-hover:text-white",
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1">{item.label}</span>
                            {item.badge != null && (
                              <span
                                className={clsx(
                                  "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                                  item.badgeTone === "danger" &&
                                    "bg-destructive text-destructive-foreground",
                                  item.badgeTone === "accent" &&
                                    (active
                                      ? "bg-accent-foreground text-accent"
                                      : "bg-accent text-accent-foreground"),
                                  (!item.badgeTone || item.badgeTone === "muted") &&
                                    "bg-white/15 text-white",
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {/* Collapsed badge dot */}
                        {collapsed && item.badge != null && (
                          <span
                            className={clsx(
                              "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full",
                              item.badgeTone === "danger"
                                ? "bg-destructive"
                                : "bg-accent",
                            )}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom utility — user card + footer row */}
        <div className="mt-auto border-t border-white/10">
          {!collapsed ? (
            <>
              {/* User card */}
              <div className="p-2">
                <div className="group flex items-center gap-2.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-2 transition-colors hover:bg-white/10">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold leading-tight">
                      {displayName}
                    </div>
                    <div className="truncate text-[10px] leading-tight text-white/50">
                      {displayRole}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    title="Sign out"
                    className="rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/15 hover:text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Footer row — Help on left, Collapse on right */}
              <div className="flex items-center justify-between gap-1 border-t border-white/10 px-2 py-1.5">
                <button
                  type="button"
                  title="Help & Support"
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Help
                </button>
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  title="Collapse sidebar"
                  className="hidden rounded-md p-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white md:inline-flex"
                  aria-label="Collapse sidebar"
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            // Collapsed state — stack of three centered icons
            <div className="flex flex-col items-center gap-1 p-2">
              <button
                type="button"
                onClick={handleSignOut}
                title={`${displayName} · ${displayRole} — click to sign out`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground"
              >
                {initials}
              </button>
              <button
                type="button"
                title="Help & Support"
                className="flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                title="Expand sidebar"
                className="hidden h-8 w-8 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white md:flex"
                aria-label="Expand sidebar"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* Main column                                                            */}
      {/* ==================================================================== */}
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
            <TopNavSearch />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              className="relative rounded-md p-2 hover:bg-surface"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                CM
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold leading-tight">Cameron</div>
                <div className="text-[10px] leading-tight text-muted-foreground">
                  Service Advisor
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* AI Copilot bar — prioritized briefing below the topbar */}
        <AICopilotBar />

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
