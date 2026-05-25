import clsx from "clsx";

export type TechRow = {
  id: string;
  name: string;
  initials: string;
  role: string;
  hoursBilled: number;
  hoursSold: number;
  hoursAvailable: number;
  efficiency: number; // percent
};

type Props = {
  rows: TechRow[];
};

export function TechProductivityList({ rows }: Props) {
  return (
    <div className="space-y-3">
      {rows.map((t) => {
        const pctBilled = Math.min(100, (t.hoursBilled / t.hoursAvailable) * 100);
        const pctSold = Math.min(100, (t.hoursSold / t.hoursAvailable) * 100);
        return (
          <div key={t.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">{t.name}</div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {t.role}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={clsx(
                    "text-xs font-semibold tabular-nums",
                    t.efficiency >= 100 && "text-success",
                    t.efficiency < 80 && "text-destructive",
                  )}
                >
                  {t.efficiency}%
                </div>
                <div className="text-[10px] text-muted-foreground">
                  efficiency
                </div>
              </div>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="absolute inset-y-0 left-0 bg-accent/40"
                style={{ width: `${pctSold}%` }}
                title={`${t.hoursSold} sold`}
              />
              <div
                className="absolute inset-y-0 left-0 bg-foreground"
                style={{ width: `${pctBilled}%` }}
                title={`${t.hoursBilled} billed`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>
                <span className="font-semibold text-foreground">
                  {t.hoursBilled.toFixed(1)}
                </span>{" "}
                billed /{" "}
                <span className="font-semibold text-foreground">
                  {t.hoursSold.toFixed(1)}
                </span>{" "}
                sold
              </span>
              <span>{t.hoursAvailable.toFixed(1)} avail</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
