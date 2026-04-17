"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#0087A8", "#34D399", "#FBBF24", "#A5B4FC", "#F87171", "#818CF8"];

type LineChartProps = {
  data: Record<string, string | number | undefined>[];
  xKey: string;
  series: { key: string; name: string; color?: string }[];
};

export function SuperAdminLineChart({ data, xKey, series }: LineChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="var(--text-3)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--text-3)" />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 12,
            }}
          />
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SuperAdminBarChart({
  data,
  xKey,
  barKey,
  name,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  barKey: string;
  name?: string;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="var(--text-3)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--text-3)" />
          <Tooltip />
          <Bar dataKey={barKey} name={name ?? barKey} fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SuperAdminPieChart({
  data,
  nameKey,
  valueKey,
}: {
  data: { name: string; value: number }[];
  nameKey?: string;
  valueKey?: string;
}) {
  const rows = data.map((d, i) => {
    const r = d as Record<string, unknown>;
    const name = nameKey ? String(r[nameKey] ?? "") : String(d.name ?? "");
    const value = valueKey ? Number(r[valueKey] ?? 0) : Number(d.value ?? 0);
    return {
      name,
      value,
      fill: COLORS[i % COLORS.length],
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {rows.map((e, i) => (
              <Cell key={`c-${i}`} fill={e.fill} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
