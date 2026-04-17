"use client";

import { PageHeader } from "@/components/superadmin/PageHeader";
import { SuperAdminLineChart } from "@/components/superadmin/SuperAdminChart";
import { useOverviewMetrics } from "@/lib/superadmin/hooks";

export default function ReportsUsagePage() {
  const { metrics, loaded } = useOverviewMetrics();
  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;

  const readiness = metrics.interviewReadinessTrend.map((d) => ({
    day: d.date.slice(5),
    score: d.value,
  }));

  return (
    <>
      <PageHeader title="Usage trends" description="Readiness index and volume trends." />
      <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <SuperAdminLineChart
          data={readiness}
          xKey="day"
          series={[{ key: "score", name: "Readiness" }]}
        />
      </div>
    </>
  );
}
