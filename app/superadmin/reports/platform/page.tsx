"use client";

import { PageHeader } from "@/components/superadmin/PageHeader";
import { SuperAdminBarChart, SuperAdminLineChart } from "@/components/superadmin/SuperAdminChart";
import { useOverviewMetrics } from "@/lib/superadmin/hooks";

export default function ReportsPlatformPage() {
  const { metrics, loaded } = useOverviewMetrics();
  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;

  const activity = metrics.mockInterviewVolume.map((d, i) => ({
    day: d.date.slice(5),
    mock: d.count,
    reports: metrics.reportGenerations[i]?.count ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Platform analytics"
        description="Read-only aggregate signals (seed / local metrics store)."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold">Engagement mix</h2>
          <SuperAdminLineChart
            data={activity}
            xKey="day"
            series={[
              { key: "mock", name: "Mock interviews" },
              { key: "reports", name: "Reports" },
            ]}
          />
        </div>
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold">Storyboard generations</h2>
          <SuperAdminBarChart
            data={metrics.storyboardGenerations.map((d) => ({
              day: d.date.slice(5),
              n: d.count,
            }))}
            xKey="day"
            barKey="n"
            name="Generations"
          />
        </div>
      </div>
    </>
  );
}
