import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type HoursBucket = {
  status: string;
  short: string;
  hours: number;
  color: string;
};

type Props = {
  data: HoursBucket[];
};

export function HoursChart({ data }: Props) {
  const total = data.reduce((acc, b) => acc + b.hours, 0);
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-end justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Labor Hours
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight">
              {total.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">hrs on board</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Posted to A/R
          </div>
          <div className="mt-1 text-lg font-semibold tracking-tight">
            {data.find((d) => d.status === "posted")?.hours.toFixed(1) ?? "0.0"}{" "}
            <span className="text-xs font-normal text-muted-foreground">hrs</span>
          </div>
        </div>
      </div>
      <div className="h-44 w-full px-2 pb-2 pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 2"
              vertical={false}
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="short"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "var(--color-surface)" }}
              contentStyle={{
                background: "var(--color-background)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ fontWeight: 600 }}
              formatter={(v: number) => [`${v.toFixed(1)} hrs`, "Hours"]}
            />
            <Bar dataKey="hours" radius={[3, 3, 0, 0]}>
              {data.map((b) => (
                <Cell key={b.status} fill={b.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
