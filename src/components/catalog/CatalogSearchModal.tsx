import { useMemo, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";
import { laborGuide, type LaborGuideEntry } from "@/data/laborGuide";
import { partsCatalog, type PartsCatalogEntry } from "@/data/partsCatalog";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "labor" | "parts";
  onSelectLabor?: (entry: LaborGuideEntry) => void;
  onSelectPart?: (entry: PartsCatalogEntry) => void;
};

/**
 * Shared search modal that surfaces the mock labor guide / parts catalog.
 *
 * In production this would proxy live results from Mitchell 1 / AllData /
 * WorldPac. For the demo we filter the local catalog client-side - instant on
 * 30–40 rows with no library overhead.
 */
export function CatalogSearchModal({
  open,
  onClose,
  mode,
  onSelectLabor,
  onSelectPart,
}: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Reset state when the modal closes so reopening starts fresh.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveCategory(null);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sourceCount = mode === "labor" ? laborGuide.length : partsCatalog.length;

  const categories = useMemo(() => {
    const set = new Set<string>();
    if (mode === "labor") {
      laborGuide.forEach((e) => set.add(e.category));
    } else {
      partsCatalog.forEach((e) => set.add(e.category));
    }
    return Array.from(set).sort();
  }, [mode]);

  const matchesQuery = (haystacks: string[], q: string) =>
    haystacks.some((h) => h.toLowerCase().includes(q));

  const laborResults = useMemo(() => {
    if (mode !== "labor") return [];
    const q = query.trim().toLowerCase();
    return laborGuide.filter((e) => {
      if (activeCategory && e.category !== activeCategory) return false;
      if (!q) return true;
      return matchesQuery(
        [
          e.description,
          e.jobCode,
          e.category,
          ...e.applicableMakes,
        ],
        q,
      );
    });
  }, [mode, query, activeCategory]);

  const partsResults = useMemo(() => {
    if (mode !== "parts") return [];
    const q = query.trim().toLowerCase();
    return partsCatalog.filter((e) => {
      if (activeCategory && e.category !== activeCategory) return false;
      if (!q) return true;
      return matchesQuery(
        [
          e.description,
          e.partNumber,
          e.category,
          e.vendor,
          ...e.applicableMakes,
          ...(e.applicableModels ?? []),
        ],
        q,
      );
    });
  }, [mode, query, activeCategory]);

  const resultCount = mode === "labor" ? laborResults.length : partsResults.length;

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-[720px] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">
              {mode === "labor" ? "Labor Guide" : "Parts Catalog"}
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {mode === "labor"
                ? "Search industry-standard labor times"
                : "Search parts by number, vendor, or description"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search input + category chips */}
        <div className="space-y-2.5 border-b border-border bg-surface/30 px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by description, code, vendor…"
              className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryChip
              label="All"
              active={activeCategory === null}
              onClick={() => setActiveCategory(null)}
            />
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
              />
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {resultCount === 0 ? (
            <div className="flex h-32 items-center justify-center text-center text-xs text-muted-foreground">
              No matches. Try a different search term.
            </div>
          ) : mode === "labor" ? (
            <LaborTable
              entries={laborResults}
              onSelect={(e) => {
                onSelectLabor?.(e);
                onClose();
              }}
            />
          ) : (
            <PartsTable
              entries={partsResults}
              onSelect={(e) => {
                onSelectPart?.(e);
                onClose();
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-0.5 border-t border-border bg-surface/30 px-4 py-2.5">
          <div className="text-[11px] text-muted-foreground">
            Showing {resultCount} of {sourceCount} entries
          </div>
          <div className="text-[10px] italic text-muted-foreground/80">
            Demo catalog - connects to Mitchell 1 / AllData / WorldPac in production.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Subcomponents
// ============================================================================

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:bg-surface",
      )}
    >
      {label}
    </button>
  );
}

function LaborTable({
  entries,
  onSelect,
}: {
  entries: LaborGuideEntry[];
  onSelect: (entry: LaborGuideEntry) => void;
}) {
  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur text-[10px] uppercase tracking-wider text-muted-foreground">
        <tr>
          <th className="px-3 py-2 text-left font-semibold">Code</th>
          <th className="px-3 py-2 text-left font-semibold">Description</th>
          <th className="px-3 py-2 text-left font-semibold">Category</th>
          <th className="px-3 py-2 text-left font-semibold">Makes</th>
          <th className="px-3 py-2 text-right font-semibold">Hours</th>
          <th className="px-3 py-2 text-center font-semibold">Skill</th>
          <th className="px-3 py-2 text-right font-semibold">&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr
            key={e.id}
            className="cursor-pointer border-b border-border last:border-0 hover:bg-surface/40"
            onClick={() => onSelect(e)}
          >
            <td className="px-3 py-2 align-top font-mono text-[10px] text-muted-foreground">
              {e.jobCode}
            </td>
            <td className="px-3 py-2 align-top">
              <div className="text-[12px] font-medium">{e.description}</div>
              <div className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                {e.detail}
              </div>
            </td>
            <td className="px-3 py-2 align-top text-[11px]">
              <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-medium">
                {e.category}
              </span>
            </td>
            <td className="px-3 py-2 align-top text-[10px] text-muted-foreground">
              {e.applicableMakes.slice(0, 2).join(", ")}
              {e.applicableMakes.length > 2 && (
                <span className="ml-1 text-muted-foreground/60">
                  +{e.applicableMakes.length - 2}
                </span>
              )}
            </td>
            <td className="px-3 py-2 text-right align-top font-semibold tabular-nums">
              {e.laborHours.toFixed(1)}
            </td>
            <td className="px-3 py-2 text-center align-top">
              <SkillBadge skill={e.skillLevel} />
            </td>
            <td className="px-3 py-2 text-right align-top">
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onSelect(e);
                }}
                className="rounded-md bg-foreground px-2 py-1 text-[10px] font-semibold text-background hover:opacity-90"
              >
                Select
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PartsTable({
  entries,
  onSelect,
}: {
  entries: PartsCatalogEntry[];
  onSelect: (entry: PartsCatalogEntry) => void;
}) {
  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur text-[10px] uppercase tracking-wider text-muted-foreground">
        <tr>
          <th className="px-3 py-2 text-left font-semibold">Part #</th>
          <th className="px-3 py-2 text-left font-semibold">Description</th>
          <th className="px-3 py-2 text-left font-semibold">Vendor</th>
          <th className="px-3 py-2 text-left font-semibold">Category</th>
          <th className="px-3 py-2 text-right font-semibold">Price</th>
          <th className="px-3 py-2 text-right font-semibold">In Stock</th>
          <th className="px-3 py-2 text-right font-semibold">&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr
            key={e.id}
            className="cursor-pointer border-b border-border last:border-0 hover:bg-surface/40"
            onClick={() => onSelect(e)}
          >
            <td className="px-3 py-2 align-top font-mono text-[10px] text-muted-foreground">
              {e.partNumber}
            </td>
            <td className="px-3 py-2 align-top">
              <div className="text-[12px] font-medium">{e.description}</div>
              {e.applicableModels && e.applicableModels.length > 0 && (
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  Fits: {e.applicableModels.join(", ")}
                </div>
              )}
            </td>
            <td className="px-3 py-2 align-top text-[11px]">{e.vendor}</td>
            <td className="px-3 py-2 align-top text-[11px]">
              <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-medium">
                {e.category}
              </span>
            </td>
            <td className="px-3 py-2 text-right align-top font-semibold tabular-nums">
              ${e.unitPrice}
            </td>
            <td className="px-3 py-2 text-right align-top">
              <StockBadge inStock={e.inStock} leadTimeDays={e.leadTimeDays} />
            </td>
            <td className="px-3 py-2 text-right align-top">
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onSelect(e);
                }}
                className="rounded-md bg-foreground px-2 py-1 text-[10px] font-semibold text-background hover:opacity-90"
              >
                Add
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SkillBadge({ skill }: { skill: "A" | "B" | "C" }) {
  const tone =
    skill === "A"
      ? "bg-destructive/10 text-destructive"
      : skill === "B"
        ? "bg-accent/30 text-[#991B1B]"
        : "bg-success/15 text-success";
  return (
    <span
      className={clsx(
        "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
        tone,
      )}
      title={
        skill === "A"
          ? "Master tech"
          : skill === "B"
            ? "Journeyman"
            : "Apprentice OK"
      }
    >
      {skill}
    </span>
  );
}

function StockBadge({
  inStock,
  leadTimeDays,
}: {
  inStock: number;
  leadTimeDays: number;
}) {
  if (inStock <= 0) {
    return (
      <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
        Order · {leadTimeDays}d
      </span>
    );
  }
  if (inStock < 3) {
    return (
      <span className="rounded-full bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-[#991B1B]">
        {inStock} low
      </span>
    );
  }
  return (
    <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
      {inStock} in stock
    </span>
  );
}
