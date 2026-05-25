import { Search, Filter, ArrowUpDown, Download, Plus } from "lucide-react";
import clsx from "clsx";

type Props = {
  search?: string;
  onSearchChange?: (v: string) => void;
  placeholder?: string;
  filters?: Array<{ id: string; label: string; value?: string }>;
  sortLabel?: string;
  showFilter?: boolean;
  showSort?: boolean;
  showExport?: boolean;
  showAddRow?: { label: string; onClick?: () => void };
  className?: string;
};

export function FilterBar({
  search = "",
  onSearchChange,
  placeholder = "Search…",
  filters = [],
  sortLabel = "Sort",
  showFilter = true,
  showSort = true,
  showExport = false,
  showAddRow,
  className,
}: Props) {
  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-2 border-b border-border bg-surface/40 px-3 py-2",
        className,
      )}
    >
      <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-foreground/80 hover:border-foreground/30 hover:text-foreground"
        >
          <span className="text-muted-foreground">{f.label}:</span>
          <span className="font-semibold text-foreground">{f.value ?? "All"}</span>
        </button>
      ))}

      {showFilter && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
        >
          <Filter className="h-3 w-3" />
          More filters
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        {showSort && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <ArrowUpDown className="h-3 w-3" />
            {sortLabel}
          </button>
        )}
        {showExport && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <Download className="h-3 w-3" />
            Export
          </button>
        )}
        {showAddRow && (
          <button
            type="button"
            onClick={showAddRow.onClick}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background hover:opacity-90"
          >
            <Plus className="h-3 w-3" />
            {showAddRow.label}
          </button>
        )}
      </div>
    </div>
  );
}
