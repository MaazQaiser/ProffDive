"use client";

import { KpiCard } from "@/components/superadmin/KpiCard";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { SuperAdminPanel } from "@/components/superadmin/SuperAdminPanel";
import { SuperAdminBarChart, SuperAdminLineChart, SuperAdminPieChart } from "@/components/superadmin/SuperAdminChart";
import { useOrganizations, useOverviewMetrics } from "@/lib/superadmin/hooks";

export default function SuperAdminOverviewPage() {
  const { orgs, loaded: orgsLoaded } = useOrganizations();
  const { metrics, loaded: mLoaded } = useOverviewMetrics();

  if (!orgsLoaded || !mLoaded) {
    return <p className="text-sm text-[#64748B]">Loading…</p>;
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
        <SuperAdminPanel title="Interview / readiness trend" description="Rolling daily index">
          <SuperAdminLineChart
            data={trend}
            xKey="date"
            series={[{ key: "readiness", name: "Readiness" }]}
          />
        </SuperAdminPanel>
        <SuperAdminPanel title="Mock interview volume" description="Sessions per day">
          <SuperAdminLineChart
            data={mockVol}
            xKey="date"
            series={[{ key: "interviews", name: "Volume" }]}
          />
        </SuperAdminPanel>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SuperAdminPanel title="Report generations" description="Last 7 days">
          <SuperAdminBarChart
            data={metrics.reportGenerations.map((d) => ({
              day: d.date.slice(5),
              reports: d.count,
            }))}
            xKey="day"
            barKey="reports"
            name="Reports"
          />
        </SuperAdminPanel>
        <SuperAdminPanel title="Feature usage breakdown" description="Relative volume">
          <SuperAdminPieChart data={featurePie} />
        </SuperAdminPanel>
      </div>
    </>
  );
}
