import { Search, Filter, ArrowUpDown, Download, Plus } from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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

const DATE_OPTIONS = ["All", "Last 7 days", "Last 30 days", "Last 90 days"];
const GENERIC_OPTIONS = ["All", "Option A", "Option B", "Option C"];
const SORT_OPTIONS = ["Most recent", "Oldest", "Name A–Z", "Total $ desc"];

function isDateFilter(id: string, label: string) {
  const idLower = id.toLowerCase();
  const labelLower = label.toLowerCase();
  return (
    idLower.includes("date") ||
    labelLower.includes("visit") ||
    labelLower.includes("created") ||
    labelLower.includes("opened")
  );
}

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
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [chipValues, setChipValues] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openPopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenPopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPopover]);

  const handleChipSelect = (
    chipId: string,
    chipLabel: string,
    value: string,
  ) => {
    setChipValues((prev) => ({ ...prev, [chipId]: value }));
    setOpenPopover(null);
    toast.success(`Filter applied: ${chipLabel} = ${value}`);
  };

  const handleSortSelect = (option: string) => {
    setOpenPopover(null);
    toast.success(`Sorted by ${option}`);
  };

  const handleMoreFilters = () => {
    toast.info("Advanced filters", {
      description: "More filters drawer — coming soon",
    });
  };

  const handleExport = () => {
    toast.success("Exporting to CSV…", {
      description: "Your file will download shortly.",
    });
    setTimeout(() => {
      toast.success("Export ready", { description: "filename.csv" });
    }, 1000);
  };

  return (
    <div
      ref={containerRef}
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

      {filters.map((f) => {
        const popoverId = `chip:${f.id}`;
        const isOpen = openPopover === popoverId;
        const displayValue = chipValues[f.id] ?? f.value ?? "All";
        const options = isDateFilter(f.id, f.label)
          ? DATE_OPTIONS
          : GENERIC_OPTIONS;
        return (
          <div key={f.id} className="relative">
            <button
              type="button"
              onClick={() => setOpenPopover(isOpen ? null : popoverId)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-foreground/80 hover:border-foreground/30 hover:text-foreground"
            >
              <span className="text-muted-foreground">{f.label}:</span>
              <span className="font-semibold text-foreground">
                {displayValue}
              </span>
            </button>
            {isOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-border bg-background py-1 shadow-md">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChipSelect(f.id, f.label, opt)}
                    className="block w-full px-3 py-1.5 text-left text-[11px] hover:bg-surface"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {showFilter && (
        <button
          type="button"
          onClick={handleMoreFilters}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
        >
          <Filter className="h-3 w-3" />
          More filters
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        {showSort && (
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenPopover(openPopover === "sort" ? null : "sort")
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
            >
              <ArrowUpDown className="h-3 w-3" />
              {sortLabel}
            </button>
            {openPopover === "sort" && (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-border bg-background py-1 shadow-md">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSortSelect(opt)}
                    className="block w-full px-3 py-1.5 text-left text-[11px] hover:bg-surface"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {showExport && (
          <button
            type="button"
            onClick={handleExport}
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
