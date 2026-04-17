"use client";

import { PageHeader } from "@/components/superadmin/PageHeader";
import { SuperAdminBarChart } from "@/components/superadmin/SuperAdminChart";
import { SEED_FUNNEL } from "@/lib/superadmin/seed";

export default function ReportsFunnelPage() {
  const data = SEED_FUNNEL.map((f) => ({ stage: f.stage, users: f.count }));

  return (
    <>
      <PageHeader
        title="Funnel"
        description="Build → Learn → Practice → Ready (illustrative counts)."
      />
      <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <SuperAdminBarChart data={data} xKey="stage" barKey="users" name="Users" />
      </div>
    </>
  );
}
