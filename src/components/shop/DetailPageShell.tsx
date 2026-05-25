import clsx from "clsx";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { TabStrip, type TabItem } from "./TabStrip";

type Props = {
  /** Where back navigation goes (e.g., "/repair-orders") */
  backTo: string;
  backLabel: string;
  /** Top-line eyebrow above the title (e.g., "REPAIR ORDER · #4847") */
  eyebrow: string;
  /** Main title (e.g., customer name or RO description) */
  title: string;
  /** Sub-content next to title (badges, vehicle ref, etc.) */
  titleMeta?: React.ReactNode;
  /** Right-aligned header content (status, totals, etc.) */
  headerRight?: React.ReactNode;
  /** Action buttons row */
  actions?: React.ReactNode;
  /** Optional meta strip below the header — key/value chips */
  metaRow?: React.ReactNode;
  /** Tabs */
  tabs?: TabItem[];
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  /** Main body */
  children: React.ReactNode;
  className?: string;
};

export function DetailPageShell({
  backTo,
  backLabel,
  eyebrow,
  title,
  titleMeta,
  headerRight,
  actions,
  metaRow,
  tabs,
  activeTabId,
  onTabChange,
  children,
  className,
}: Props) {
  return (
    <div className={clsx("space-y-4", className)}>
      {/* Breadcrumb */}
      <div>
        <Link
          to={backTo as string}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
      </div>

      {/* Header card */}
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {eyebrow}
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {title}
            </h1>
            {titleMeta && <div className="mt-2">{titleMeta}</div>}
          </div>
          {headerRight && (
            <div className="shrink-0 text-right">{headerRight}</div>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface/40 px-5 py-2.5">
            {actions}
          </div>
        )}

        {metaRow && (
          <div className="border-t border-border px-5 py-3">{metaRow}</div>
        )}

        {tabs && tabs.length > 0 && activeTabId && onTabChange && (
          <TabStrip
            tabs={tabs}
            activeId={activeTabId}
            onChange={onTabChange}
            className="border-t-0"
          />
        )}
      </div>

      {/* Body */}
      <div>{children}</div>
    </div>
  );
}

/**
 * Compact key/value chip pair for use in detail header metaRow.
 */
export function MetaPair({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("min-w-0", className)}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 truncate text-xs font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}
