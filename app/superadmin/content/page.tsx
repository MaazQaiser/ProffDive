"use client";

import Link from "next/link";
import { DataTable } from "@/components/superadmin/DataTable";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { useTrainingModules } from "@/lib/superadmin/hooks";
import type { TrainingModule } from "@/lib/superadmin/types";

export default function ContentModulesListPage() {
  const { modules, loaded } = useTrainingModules();

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;

  return (
    <>
      <PageHeader
        title="Content (Training)"
        description="Training modules, lessons, checkpoints, and evaluation."
        actions={
          <Link
            href="/superadmin/content/new"
            className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            New module
          </Link>
        }
      />
      <DataTable<TrainingModule>
        columns={[
          { key: "title", header: "Module" },
          { key: "category", header: "Category" },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <span className="capitalize">{r.status === "published" ? "Published" : "Draft"}</span>
            ),
          },
        ]}
        rows={modules}
        getRowKey={(r) => r.id}
        empty="No modules yet."
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <Link href={`/superadmin/content/${row.id}`} className="text-[var(--primary)] hover:underline">
              View
            </Link>
            <Link href={`/superadmin/content/${row.id}/edit`} className="text-[var(--primary)] hover:underline">
              Edit
            </Link>
          </div>
        )}
      />
    </>
  );
}
