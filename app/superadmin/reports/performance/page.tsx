"use client";

import { PageHeader } from "@/components/superadmin/PageHeader";
import { SuperAdminLineChart } from "@/components/superadmin/SuperAdminChart";
import { SEED_PERFORMANCE_SERIES } from "@/lib/superadmin/seed";

export default function ReportsPerformancePage() {
  const days = ["D1", "D2", "D3", "D4", "D5", "D6", "D7"];
  const data = days.map((day, i) => {
    const row: Record<string, string | number> = { day };
    SEED_PERFORMANCE_SERIES.forEach((s) => {
      row[s.name] = s.data[i] ?? 0;
    });
    return row;
  });

  return (
    <>
      <PageHeader title="Performance insights" description="Latency and error rate (demo series)." />
      <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <SuperAdminLineChart
          data={data}
          xKey="day"
          series={SEED_PERFORMANCE_SERIES.map((s, i) => ({
            key: s.name,
            name: s.name,
            color: i === 0 ? "var(--primary)" : "var(--accent-warning)",
          }))}
        />
      </div>
    </>
  );
}
