import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Wrench,
  Briefcase,
  Clock,
  Package,
  Edit,
  Copy,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { PageShell } from "@/components/shop/PageShell";
import { jobs } from "@/data/jobs";
import { usd } from "@/lib/format";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
});

function JobsPage() {
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const j of jobs) set.add(j.category);
    return ["All", ...Array.from(set).sort()];
  }, []);

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(jobs[0]?.id ?? "");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (activeCategory !== "All" && j.category !== activeCategory) return false;
      if (!q) return true;
      return (
        j.name.toLowerCase().includes(q) ||
        j.category.toLowerCase().includes(q) ||
        j.applicableVehicles.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, search]);

  const selected = jobs.find((j) => j.id === selectedId);

  return (
    <PageShell
      title="Canned Jobs"
      description="Reusable job templates with labor + parts presets"
      actions={
        <>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface">
            <Sparkles className="h-3 w-3" />
            AI: Suggest Jobs
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Canned Job
          </button>
        </>
      }
    >
      <div className="grid h-[calc(100vh-13rem)] grid-cols-1 gap-4 lg:grid-cols-[200px_1fr_360px]">
        {/* Categories sidebar */}
        <div className="rounded-lg border border-border bg-background">
          <div className="border-b border-border px-3 py-2.5">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h3>
          </div>
          <ul className="py-1">
            {categories.map((c) => {
              const count =
                c === "All"
                  ? jobs.length
                  : jobs.filter((j) => j.category === c).length;
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(c)}
                    className={clsx(
                      "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition-colors",
                      activeCategory === c
                        ? "bg-foreground text-background"
                        : "hover:bg-surface/60",
                    )}
                  >
                    <span className="font-medium">{c}</span>
                    <span
                      className={clsx(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                        activeCategory === c
                          ? "bg-background/20"
                          : "bg-surface text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Job list */}
        <div className="flex min-h-0 flex-col rounded-lg border border-border bg-background">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search canned jobs…"
                className="w-full rounded-md border border-border bg-surface py-1.5 pl-8 pr-3 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
            {filtered.map((j) => (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(j.id)}
                  className={clsx(
                    "block w-full px-4 py-3 text-left transition-colors",
                    selectedId === j.id
                      ? "bg-accent/10"
                      : "hover:bg-surface/60",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold">{j.name}</span>
                    <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                      {j.standardLaborHours}h
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    {j.category} · {j.applicableVehicles}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">
                      {j.defaultParts.length} parts preset
                    </span>
                    <span className="font-semibold tabular-nums">
                      {usd.format(j.defaultLaborCost)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Detail panel */}
        <div className="rounded-lg border border-border bg-background">
          {selected ? (
            <>
              <div className="border-b border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold">{selected.name}</h2>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded-full bg-surface px-2 py-0.5 font-medium">
                        {selected.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                      title="Duplicate"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Labor
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-semibold tabular-nums">
                      {selected.standardLaborHours}
                    </span>
                    <span className="text-xs text-muted-foreground">hrs · standard</span>
                  </div>
                  <div className="mt-1 text-xs font-semibold tabular-nums">
                    {usd.format(selected.defaultLaborCost)}
                  </div>
                </div>

                <div className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Package className="h-3 w-3" />
                      Default Parts ({selected.defaultParts.length})
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {selected.defaultParts.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-[11px]"
                      >
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border border-border p-3">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Wrench className="h-3 w-3" />
                    Applicable Vehicles
                  </div>
                  <p className="mt-1.5 text-xs">{selected.applicableVehicles}</p>
                </div>

                <button className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90">
                  <Plus className="h-3.5 w-3.5" />
                  Add to Repair Order
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              <div className="text-center">
                <Briefcase className="mx-auto mb-2 h-6 w-6" />
                Select a job to view details
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
