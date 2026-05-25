import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import clsx from "clsx";
import {
  runSearch,
  KIND_LABEL,
  type SearchResult,
  type SearchResultKind,
} from "@/lib/search";

const KIND_ORDER: SearchResultKind[] = ["ro", "customer", "vehicle"];

export function TopNavSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => runSearch(query), [query]);

  const grouped = useMemo(() => {
    const byKind = new Map<SearchResultKind, SearchResult[]>();
    for (const r of results) {
      const arr = byKind.get(r.kind) ?? [];
      arr.push(r);
      byKind.set(r.kind, arr);
    }
    const flat: SearchResult[] = [];
    const sections: { kind: SearchResultKind; items: SearchResult[] }[] = [];
    for (const kind of KIND_ORDER) {
      const items = byKind.get(kind);
      if (items && items.length) {
        sections.push({ kind, items });
        flat.push(...items);
      }
    }
    return { sections, flat };
  }, [results]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function commit(result: SearchResult) {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    navigate({ to: result.href });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!grouped.flat.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % grouped.flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (i) => (i - 1 + grouped.flat.length) % grouped.flat.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = grouped.flat[activeIndex];
      if (r) commit(r);
    }
  }

  const showPanel = open && query.trim().length > 0;
  let runningIndex = 0;

  return (
    <div ref={containerRef} className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search ROs, customers, vehicles…  ⌘K"
        className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
      />

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-surface shadow-lg">
          {grouped.flat.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">
              No matches for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-1">
              {grouped.sections.map((section) => (
                <li key={section.kind}>
                  <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {KIND_LABEL[section.kind]}
                  </div>
                  <ul>
                    {section.items.map((r) => {
                      const idx = runningIndex++;
                      const isActive = idx === activeIndex;
                      return (
                        <li key={`${r.kind}-${r.id}`}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(idx)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              commit(r);
                            }}
                            className={clsx(
                              "flex w-full items-start gap-3 px-3 py-2 text-left text-sm",
                              isActive ? "bg-accent/10" : "hover:bg-accent/5",
                            )}
                          >
                            <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded border border-border bg-background px-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {r.kind === "ro" ? "RO" : r.kind}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium">
                                {r.title}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {r.subtitle}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
