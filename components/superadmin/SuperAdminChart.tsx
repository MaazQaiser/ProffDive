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

const COLORS = ["#0A89A9", "#34D399", "#FBBF24", "#A5B4FC", "#F87171", "#818CF8"];

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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="#94A3B8" tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "0.5px solid rgba(255,255,255,0.9)",
              background: "rgba(255,255,255,0.92)",
              fontSize: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="#94A3B8" tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "0.5px solid rgba(255,255,255,0.9)",
              background: "rgba(255,255,255,0.92)",
              fontSize: 12,
            }}
          />
          <Bar dataKey={barKey} name={name ?? barKey} fill="#0A89A9" radius={[6, 6, 0, 0]} />
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
