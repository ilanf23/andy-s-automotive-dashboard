import { SlidersHorizontal, RotateCcw } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { KPI_REGISTRY } from "@/lib/kpi-registry";
import { useKpiPrefs, MIN_KPIS, MAX_KPIS } from "@/lib/kpi-prefs";
import { useAuth } from "@/lib/auth-context";

export function KpiCustomizer() {
  const { user } = useAuth();
  const { selectedIds, toggle, reset } = useKpiPrefs();

  // Owner ("admin") only.
  if (user?.role !== "owner") return null;

  const atMax = selectedIds.length >= MAX_KPIS;
  const atMin = selectedIds.length <= MIN_KPIS;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-surface"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Customize
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-semibold">
            KPIs shown ({selectedIds.length}/{MAX_KPIS})
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {KPI_REGISTRY.map((kpi) => {
            const checked = selectedIds.includes(kpi.id);
            const disabled =
              (!checked && atMax) || (checked && atMin);
            return (
              <label
                key={kpi.id}
                className={
                  "flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-surface " +
                  (disabled ? "opacity-50" : "")
                }
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => toggle(kpi.id)}
                  className="mt-0.5"
                />
                <span className="flex flex-col">
                  <span className="text-xs font-medium">{kpi.label}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {kpi.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
          Choose {MIN_KPIS}–{MAX_KPIS} KPIs to display on the dashboard.
        </div>
      </PopoverContent>
    </Popover>
  );
}
