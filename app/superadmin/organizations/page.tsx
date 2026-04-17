"use client";

import Link from "next/link";
import { DataTable } from "@/components/superadmin/DataTable";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { useOrganizations, usePlans } from "@/lib/superadmin/hooks";
import type { Organization } from "@/lib/superadmin/types";

export default function OrganizationsListPage() {
  const { orgs, loaded, update } = useOrganizations();
  const { plans, loaded: plansLoaded } = usePlans();

  if (!loaded || !plansLoaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;

  const planName = (id: string) => plans.find((p) => p.id === id)?.name ?? id;

  return (
    <>
      <PageHeader
        title="Organizations"
        description="Create and manage tenant organizations, plans, and limits."
        actions={
          <Link
            href="/superadmin/organizations/new"
            className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            New organization
          </Link>
        }
      />
      <DataTable<Organization>
        columns={[
          { key: "name", header: "Name" },
          {
            key: "planId",
            header: "Plan",
            render: (r) => planName(r.planId),
          },
          { key: "status", header: "Status" },
          { key: "userCount", header: "Users" },
        ]}
        rows={orgs}
        getRowKey={(r) => r.id}
        empty="No organizations yet."
        actions={(row) => (
          <div className="flex flex-wrap justify-end gap-2">
            <Link href={`/superadmin/organizations/${row.id}`} className="text-[var(--primary)] hover:underline">
              View
            </Link>
            <Link href={`/superadmin/organizations/${row.id}/edit`} className="text-[var(--primary)] hover:underline">
              Edit
            </Link>
            <button
              type="button"
              className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)]"
              onClick={() =>
                update(row.id, { status: row.status === "active" ? "inactive" : "active" })
              }
            >
              {row.status === "active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        )}
      />
    </>
  );
}
