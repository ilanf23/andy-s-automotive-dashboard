import clsx from "clsx";
import { PageShell } from "./PageShell";
import { TabStrip, type TabItem } from "./TabStrip";

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tabs?: TabItem[];
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  filterBar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/**
 * Standard list-page layout: header → tab strip → filter bar → list/table.
 * Used by Repair Orders, Estimates, Inspections, Customers, Vehicles, Parts, AR.
 */
export function ListPageShell({
  title,
  description,
  actions,
  tabs,
  activeTabId,
  onTabChange,
  filterBar,
  children,
  className,
}: Props) {
  return (
    <PageShell title={title} description={description} actions={actions}>
      <div
        className={clsx(
          "overflow-hidden rounded-lg border border-border bg-background",
          className,
        )}
      >
        {tabs && tabs.length > 0 && activeTabId && onTabChange && (
          <TabStrip tabs={tabs} activeId={activeTabId} onChange={onTabChange} />
        )}
        {filterBar}
        <div className="min-h-[400px]">{children}</div>
      </div>
    </PageShell>
  );
}
