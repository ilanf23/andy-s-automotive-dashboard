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

export type CarCountBucket = {
  status: string;
  short: string;
  count: number;
  color: string;
};

type Props = {
  data: CarCountBucket[];
};

export function CarCountChart({ data }: Props) {
  const total = data.reduce((acc, b) => acc + b.count, 0);
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-end justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Car Count
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight">{total}</span>
            <span className="text-xs text-muted-foreground">on board</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          {data.map((b) => (
            <span key={b.status} className="inline-flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: b.color }}
              />
              {b.short}
            </span>
          ))}
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
              allowDecimals={false}
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
              formatter={(v: number) => [`${v} cars`, "Count"]}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
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
