"use client";

import Link from "next/link";
import { DataTable } from "@/components/superadmin/DataTable";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { useCompetencyEngines } from "@/lib/superadmin/hooks";
import type { CompetencyEngineVersion } from "@/lib/superadmin/types";

export default function CompetencyEngineListPage() {
  const { versions, loaded } = useCompetencyEngines();

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;

  return (
    <>
      <PageHeader
        title="Competency Engine"
        description="Versioned competency frameworks (12 competency cards per version)."
        actions={
          <Link
            href="/superadmin/competency-engine/new?from=cev_default"
            className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            New version
          </Link>
        }
      />
      <DataTable<CompetencyEngineVersion>
        columns={[
          { key: "name", header: "Version" },
          {
            key: "createdAt",
            header: "Created",
            render: (r) => new Date(r.createdAt).toLocaleString(),
          },
          {
            key: "competencies",
            header: "Cards",
            render: (r) => String(r.competencies?.length ?? 0),
          },
        ]}
        rows={versions}
        getRowKey={(r) => r.id}
        empty="No competency engine versions yet."
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <Link href={`/superadmin/competency-engine/${row.id}`} className="text-[var(--primary)] hover:underline">
              View
            </Link>
            <Link href={`/superadmin/competency-engine/${row.id}/edit`} className="text-[var(--primary)] hover:underline">
              Edit
            </Link>
          </div>
        )}
      />
    </>
  );
}

