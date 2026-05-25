import { useEffect, useRef, useState } from "react";
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
  Sun,
  Moon,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useModals } from "@/components/ui/ModalProvider";
import { AICopilotBar } from "@/components/ai/AICopilotBar";
import { TopNavSearch } from "@/components/layout/TopNavSearch";
import { useAuth } from "@/lib/auth-context";

type MockNotification = {
  id: string;
  title: string;
  time: string;
};

const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: "n1", title: "RO #4847 awaiting customer approval", time: "3m ago" },
  { id: "n2", title: "Northpoint Logistics payment overdue · 32 days", time: "1h ago" },
  { id: "n3", title: "Marcus completed inspection on MT-47", time: "2h ago" },
  { id: "n4", title: "New parts received — WorldPac PO #88421", time: "4h ago" },
];

const MOCK_SHOPS = [
  "Andy's Automotive — Heavy Duty",
  "Andy's Automotive — South Bay",
];

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

  // Topbar interactive state
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(4);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(MOCK_SHOPS[0]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (shopRef.current && !shopRef.current.contains(target)) {
        setShopOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = () => {
    if (typeof signOut === "function") {
      signOut();
    }
    navigate({ to: "/" });
    toast.success("Signed out");
  };

  const handleProfileSignOut = () => {
    setProfileOpen(false);
    handleSignOut();
  };

  const handleHelp = () => {
    toast.info("Help & Support", {
      description: "Live chat with our team — coming soon",
    });
  };

  const handleToggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    toast.success(`Switched to ${next} mode`);
  };

  const handleSelectShop = (name: string) => {
    setSelectedShop(name);
    setShopOpen(false);
    toast.success(`Switched to ${name}`);
  };

  const handleNotificationClick = () => {
    setNotifOpen(false);
    toast.info("Opening notification…");
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    setNotifOpen(false);
  };

  // Parse selected shop into brand + suffix for display
  const shopSuffix = selectedShop.split(" — ")[1] ?? "";

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
          "fixed top-0 z-40 flex h-screen flex-col bg-[#0a0a0a] text-white transition-all duration-200 md:sticky md:z-auto md:shrink-0 md:self-start",
          collapsed ? "md:w-[68px]" : "md:w-[232px]",
          mobileOpen
            ? "w-[232px] translate-x-0"
            : "w-[232px] -translate-x-full md:translate-x-0",
        )}
      >
        {/* Brand / Shop selector */}
        <div
          className={clsx(
            "relative flex items-center gap-2 border-b border-white/10",
            collapsed
              ? "h-14 justify-center px-2"
              : "h-14 px-3",
          )}
          ref={shopRef}
        >
          {collapsed ? (
            <Link
              to="/dashboard"
              aria-label="Andy's Automotive & Truck Services"
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-black"
              title={selectedShop}
            >
              <img
                src="/andys-logo.png"
                alt=""
                className="h-9 w-auto max-w-none object-cover object-left"
                style={{ clipPath: "inset(0 60% 0 0)" }}
              />
            </Link>
          ) : (
            <>
              <Link
                to="/dashboard"
                aria-label="Andy's Automotive & Truck Services"
                className="flex shrink-0 items-center"
              >
                <img
                  src="/andys-logo.png"
                  alt="Andy's Automotive & Truck Services"
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setShopOpen((v) => !v)}
                aria-expanded={shopOpen}
                title={selectedShop}
                className="group ml-auto flex min-w-0 shrink items-center gap-1 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-white/10"
              >
                <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-white/55">
                  {shopSuffix || "Shop"}
                </span>
                <ChevronsRight className="h-3 w-3 shrink-0 text-white/40 transition-transform group-hover:text-white/80" />
              </button>
              {shopOpen && (
                <div className="absolute left-2 right-2 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-background text-foreground shadow-lg">
                  <div className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Switch shop
                  </div>
                  <ul className="py-1">
                    {MOCK_SHOPS.map((shop) => {
                      const isSelected = shop === selectedShop;
                      return (
                        <li key={shop}>
                          <button
                            type="button"
                            onClick={() => handleSelectShop(shop)}
                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] hover:bg-surface"
                          >
                            <span className="truncate">{shop}</span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
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
                  onClick={handleHelp}
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
                onClick={handleHelp}
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
              type="button"
              onClick={handleToggleTheme}
              aria-label="Toggle theme"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className="rounded-md p-2 hover:bg-surface"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative rounded-md p-2 hover:bg-surface"
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-md border border-border bg-background text-foreground shadow-lg">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <div className="text-[12px] font-semibold">Notifications</div>
                    <div className="text-[10px] text-muted-foreground">
                      {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                    </div>
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    {MOCK_NOTIFICATIONS.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={handleNotificationClick}
                          className="flex w-full items-start justify-between gap-3 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-surface"
                        >
                          <span className="text-[12px] leading-snug">{n.title}</span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {n.time}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-border p-2">
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="w-full rounded-md px-2 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    >
                      Mark all read
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
                aria-label="Open profile menu"
                className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 transition-colors hover:bg-background"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#0a0a0a]">
                  CM
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-semibold leading-tight">Cameron</div>
                  <div className="text-[10px] leading-tight text-muted-foreground">
                    Service Advisor
                  </div>
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border border-border bg-background text-foreground shadow-lg">
                  <ul className="py-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          toast.info("Profile", { description: "Coming soon" });
                        }}
                        className="w-full px-3 py-2 text-left text-[12px] hover:bg-surface"
                      >
                        Profile
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          toast.info("Switch role", {
                            description:
                              "Service Advisor / Tech / Owner — coming soon",
                          });
                        }}
                        className="w-full px-3 py-2 text-left text-[12px] hover:bg-surface"
                      >
                        Switch role
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate({ to: "/settings" });
                        }}
                        className="w-full px-3 py-2 text-left text-[12px] hover:bg-surface"
                      >
                        Settings
                      </button>
                    </li>
                  </ul>
                  <div className="border-t border-border" />
                  <ul className="py-1">
                    <li>
                      <button
                        type="button"
                        onClick={handleProfileSignOut}
                        className="w-full px-3 py-2 text-left text-[12px] text-destructive hover:bg-surface"
                      >
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
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
