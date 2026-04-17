"use client";

import Link from "next/link";
import { DataTable } from "@/components/superadmin/DataTable";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { usePartners } from "@/lib/superadmin/hooks";
import type { Partner } from "@/lib/superadmin/types";

export default function PartnersListPage() {
  const { partners, loaded } = usePartners();

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;

  return (
    <>
      <PageHeader
        title="Partners"
        description="Partner programs, commissions, and performance."
        actions={
          <Link
            href="/superadmin/partners/new"
            className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            New partner
          </Link>
        }
      />
      <DataTable<Partner>
        columns={[
          { key: "name", header: "Partner" },
          { key: "type", header: "Type" },
          { key: "status", header: "Status" },
          {
            key: "revenueCents",
            header: "Revenue",
            render: (r) => `$${(r.revenueCents / 100).toLocaleString()}`,
          },
        ]}
        rows={partners}
        getRowKey={(r) => r.id}
        empty="No partners yet."
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <Link href={`/superadmin/partners/${row.id}`} className="text-[var(--primary)] hover:underline">
              View
            </Link>
            <Link href={`/superadmin/partners/${row.id}/edit`} className="text-[var(--primary)] hover:underline">
              Edit
            </Link>
          </div>
        )}
      />
    </>
  );
}
