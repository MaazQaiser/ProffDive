"use client";

import { KpiCard } from "@/components/superadmin/KpiCard";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { SuperAdminBarChart, SuperAdminLineChart, SuperAdminPieChart } from "@/components/superadmin/SuperAdminChart";
import { useOrganizations, useOverviewMetrics } from "@/lib/superadmin/hooks";

export default function SuperAdminOverviewPage() {
  const { orgs, loaded: orgsLoaded } = useOrganizations();
  const { metrics, loaded: mLoaded } = useOverviewMetrics();

  if (!orgsLoaded || !mLoaded) {
    return <p className="text-sm text-[var(--text-2)]">Loading…</p>;
  }

  const trend = metrics.interviewReadinessTrend.map((d) => ({
    date: d.date.slice(5),
    readiness: d.value,
  }));

  const mockVol = metrics.mockInterviewVolume.map((d) => ({
    date: d.date.slice(5),
    interviews: d.count,
  }));

  const featurePie = metrics.featureUsage.map((f) => ({ name: f.feature, value: f.value }));

  return (
    <>
      <PageHeader
        title="Overview"
        description="Read-only platform KPIs and usage trends."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total organizations" value={orgs.length} />
        <KpiCard title="Active users" value={metrics.totalActiveUsers.toLocaleString()} />
        <KpiCard
          title="Mock interviews (7d)"
          value={metrics.mockInterviewVolume.reduce((a, b) => a + b.count, 0).toLocaleString()}
        />
        <KpiCard
          title="Storyboard generations (7d)"
          value={metrics.storyboardGenerations.reduce((a, b) => a + b.count, 0).toLocaleString()}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Interview / readiness trend</h2>
          <p className="mb-4 text-xs text-[var(--text-2)]">Rolling daily index</p>
          <SuperAdminLineChart
            data={trend}
            xKey="date"
            series={[{ key: "readiness", name: "Readiness" }]}
          />
        </div>
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Mock interview volume</h2>
          <p className="mb-4 text-xs text-[var(--text-2)]">Sessions per day</p>
          <SuperAdminLineChart
            data={mockVol}
            xKey="date"
            series={[{ key: "interviews", name: "Volume" }]}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Report generations</h2>
          <p className="mb-4 text-xs text-[var(--text-2)]">Last 7 days</p>
          <SuperAdminBarChart
            data={metrics.reportGenerations.map((d) => ({
              day: d.date.slice(5),
              reports: d.count,
            }))}
            xKey="day"
            barKey="reports"
            name="Reports"
          />
        </div>
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Feature usage breakdown</h2>
          <p className="mb-4 text-xs text-[var(--text-2)]">Relative volume</p>
          <SuperAdminPieChart data={featurePie} />
        </div>
      </div>
    </>
  );
}
