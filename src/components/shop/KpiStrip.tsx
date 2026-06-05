import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import clsx from "clsx";
import { MetricTile } from "@/components/shop/MetricTile";
import {
  getPeriodFinancials,
  getPreviousPeriodFinancials,
  type Timeframe,
} from "@/lib/kpi-engine";
import { getKpiById } from "@/lib/kpi-registry";
import { useKpiPrefs } from "@/lib/kpi-prefs";

const COLS: Record<number, string> = {
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
};

export function KpiStrip({ timeframe }: { timeframe: Timeframe }) {
  const navigate = useNavigate();
  const { selectedIds } = useKpiPrefs();
  const curr = getPeriodFinancials(timeframe);
  const prev = getPreviousPeriodFinancials(timeframe);

  const kpis = selectedIds
    .map((id) => getKpiById(id))
    .filter((k): k is NonNullable<typeof k> => Boolean(k));

  return (
    <div
      className={clsx(
        "grid grid-cols-2 gap-3",
        COLS[kpis.length] ?? "sm:grid-cols-3 lg:grid-cols-5",
      )}
    >
      {kpis.map((kpi) => {
        const r = kpi.compute(curr, prev);
        return (
          <button
            key={kpi.id}
            type="button"
            onClick={() => {
              toast.info(`${kpi.label} drill-down`);
              navigate({ to: "/reports" });
            }}
            className="text-left transition-transform hover:-translate-y-0.5"
          >
            <MetricTile
              label={kpi.label}
              value={r.value}
              subValue={r.subValue}
              delta={r.delta}
              deltaDirection={r.deltaDirection}
              icon={kpi.icon}
              accent={kpi.accent}
            />
          </button>
        );
      })}
    </div>
  );
}
