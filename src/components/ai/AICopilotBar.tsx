import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  ChevronRight,
  AlertTriangle,
  MessageSquare,
  Clock,
  TrendingDown,
  X,
  Wrench,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import { AppDrawer } from "@/components/ui/AppDrawer";
import { useShopState, isLostRevenueResolved } from "@/lib/shop-store";
import { useModals } from "@/components/ui/ModalProvider";

type Priority = {
  id: string;
  icon: typeof AlertTriangle;
  severity: "high" | "medium" | "info";
  title: string;
  detail: string;
  action: {
    label: string;
    onClick: () => void;
  };
};

export function AICopilotBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { repairOrders } = useShopState();
  const { open: openModal } = useModals();

  // Compute priorities from store state - the actual AI copilot prioritization
  const priorities: Priority[] = [];

  // 1) Lost Revenue Risk
  const lostRevenueROs = repairOrders.filter(
    (r) =>
      r.flags?.some((f) => f.toLowerCase().includes("lost revenue")) &&
      !isLostRevenueResolved(r.id),
  );
  if (lostRevenueROs.length > 0) {
    const r = lostRevenueROs[0];
    priorities.push({
      id: "lr",
      icon: TrendingDown,
      severity: "high",
      title: `$1,213 lost revenue on RO #${r.id}`,
      detail: "4 inspection findings unestimated - AI can resolve in 30 seconds",
      action: {
        label: "Run AI Builder",
        onClick: () => openModal("ai-estimate-builder", { roId: r.id }),
      },
    });
  }

  // 2) Unread customer messages (hardcoded for demo)
  priorities.push({
    id: "msg",
    icon: MessageSquare,
    severity: "medium",
    title: "2 unread customer messages",
    detail: "Med Trust asked to add an oil change; City Form approved EST-4847",
    action: {
      label: "Open Messages",
      onClick: () => (window.location.href = "/messages"),
    },
  });

  // 3) Past-due AR
  priorities.push({
    id: "ar",
    icon: CreditCard,
    severity: "high",
    title: "Northpoint 185 days past due - $17k",
    detail: "Day 75 of dunning - AI will draft lien notice if you approve",
    action: {
      label: "Open AR",
      onClick: () => (window.location.href = "/ar"),
    },
  });

  // 4) Long-running RO
  const longRO = repairOrders.find((r) => r.daysInShop >= 3 && r.status !== "completed");
  if (longRO) {
    priorities.push({
      id: "stuck",
      icon: Clock,
      severity: "medium",
      title: `RO #${longRO.id} stuck - ${longRO.daysInShop} days in shop`,
      detail: longRO.description,
      action: {
        label: "View RO",
        onClick: () => (window.location.href = `/repair-orders/${longRO.id}`),
      },
    });
  }

  // 5) Churn-risk customer
  priorities.push({
    id: "churn",
    icon: TrendingDown,
    severity: "info",
    title: "Reliable Ducks overdue for service",
    detail: "Normally services every 2 weeks - last visit was 5 weeks ago",
    action: {
      label: "Send Outreach",
      onClick: () => (window.location.href = "/customers/CUST-DUCKS"),
    },
  });

  const highCount = priorities.filter((p) => p.severity === "high").length;
  const topPriority = priorities[0];

  return (
    <>
      {/* The bar itself - slim, sticky, between topbar and main */}
      <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-brand-green-tint via-background to-background px-4 py-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="hidden text-[10px] font-semibold uppercase tracking-wider text-brand-green-soft md:block">
          AI Copilot
        </div>
        <div className="hidden h-4 w-px bg-border md:block" />

        {/* Inline top priority */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-background/60"
        >
          {topPriority && (
            <>
              <topPriority.icon
                className={clsx(
                  "h-3.5 w-3.5 shrink-0",
                  topPriority.severity === "high" && "text-destructive",
                  topPriority.severity === "medium" && "text-[#991B1B]",
                  topPriority.severity === "info" && "text-muted-foreground",
                )}
              />
              <span className="truncate text-xs font-semibold">
                {topPriority.title}
              </span>
              <span className="hidden truncate text-[11px] text-muted-foreground md:inline">
                · {topPriority.detail}
              </span>
            </>
          )}
        </button>

        {/* Counts */}
        <div className="hidden items-center gap-1 lg:flex">
          {highCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
              {highCount} high
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {priorities.length} total
          </span>
        </div>

        {/* Expand button */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-brand-green/40 bg-background px-2.5 py-1 text-[11px] font-semibold text-brand-green-soft transition-colors hover:bg-brand-green-tint"
        >
          Brief me
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Drawer with full briefing */}
      <AppDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Morning Briefing"
        description={`Good morning, Cameron - ${priorities.length} items need your attention`}
        side="right"
      >
        <div className="space-y-3">
          {/* Greeting card */}
          <div className="rounded-lg border border-brand-green/30 bg-brand-green-tint p-4">
            <div className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-soft" />
              <div>
                <p className="text-xs font-semibold text-brand-green-soft">
                  Here's where to spend your first hour
                </p>
                <p className="mt-1 text-[11px] text-brand-green-soft/80">
                  I've ranked these by dollar impact and urgency. The top item recovers
                  $1,213 of lost revenue in about 30 seconds.
                </p>
              </div>
            </div>
          </div>

          {/* Priority list */}
          <ul className="space-y-2">
            {priorities.map((p, idx) => {
              const Icon = p.icon;
              return (
                <li key={p.id}>
                  <div
                    className={clsx(
                      "rounded-lg border bg-background p-3 transition-all",
                      p.severity === "high" && "border-destructive/30",
                      p.severity === "medium" && "border-accent/40",
                      p.severity === "info" && "border-border",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={clsx(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                            p.severity === "high" && "bg-destructive/10 text-destructive",
                            p.severity === "medium" && "bg-accent/30 text-[#991B1B]",
                            p.severity === "info" && "bg-surface text-muted-foreground",
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Icon
                              className={clsx(
                                "h-3.5 w-3.5",
                                p.severity === "high" && "text-destructive",
                                p.severity === "medium" && "text-[#991B1B]",
                                p.severity === "info" && "text-muted-foreground",
                              )}
                            />
                            <p className="text-xs font-semibold">{p.title}</p>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {p.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          p.action.onClick();
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1 text-[10px] font-semibold text-background hover:opacity-90"
                      >
                        {p.action.label}
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Footer summary */}
          <div className="rounded-lg border border-border bg-surface/40 p-3 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">If you handle all 5 today:</span>
              <span className="font-semibold text-brand-green-soft">
                ~$18,200 recovered + ~2 hrs saved
              </span>
            </div>
          </div>
        </div>
      </AppDrawer>
    </>
  );
}
