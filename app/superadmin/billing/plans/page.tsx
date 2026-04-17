"use client";

import Link from "next/link";
import { DataTable } from "@/components/superadmin/DataTable";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { usePlans } from "@/lib/superadmin/hooks";
import type { Plan } from "@/lib/superadmin/types";

export default function PlansListPage() {
  const { plans, loaded } = usePlans();

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;

  return (
    <>
      <PageHeader
        title="Billing · Plans"
        description="Configure plans, module access, limits, and credits."
        actions={
          <Link
            href="/superadmin/billing/plans/new"
            className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            New plan
          </Link>
        }
      />
      <DataTable<Plan>
        columns={[
          { key: "name", header: "Plan" },
          {
            key: "priceCents",
            header: "Price",
            render: (r) => `$${(r.priceCents / 100).toFixed(2)}`,
          },
          { key: "status", header: "Status" },
        ]}
        rows={plans}
        getRowKey={(r) => r.id}
        empty="No plans defined."
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <Link href={`/superadmin/billing/plans/${row.id}`} className="text-[var(--primary)] hover:underline">
              View
            </Link>
            <Link href={`/superadmin/billing/plans/${row.id}/edit`} className="text-[var(--primary)] hover:underline">
              Edit
            </Link>
          </div>
        )}
      />
    </>
  );
}
