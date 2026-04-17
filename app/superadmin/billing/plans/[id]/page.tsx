"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DataTable } from "@/components/superadmin/DataTable";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { PRODUCT_MODULES } from "@/lib/superadmin/config/product-modules";
import { useOrganizations, usePlans } from "@/lib/superadmin/hooks";
import type { Organization } from "@/lib/superadmin/types";

export default function PlanDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { plans, loaded } = usePlans();
  const { orgs, loaded: oLoaded } = useOrganizations();
  const plan = plans.find((p) => p.id === id);
  const assigned = orgs.filter((o) => o.planId === id);

  if (!loaded || !oLoaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;
  if (!plan) return <p className="text-sm text-[var(--accent-error)]">Plan not found.</p>;

  const enabledModules = PRODUCT_MODULES.filter((m) => plan.moduleAccess[m.id]).map((m) => m.label);

  return (
    <>
      <BackLink href="/superadmin/billing/plans">Plans</BackLink>
      <PageHeader
        title={plan.name}
        description="Plan configuration and organizations on this plan."
        actions={
          <Link
            href={`/superadmin/billing/plans/${id}/edit`}
            className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]"
          >
            Edit
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Plan info</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Price</dt>
              <dd className="font-medium">${(plan.priceCents / 100).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Billing</dt>
              <dd className="font-medium capitalize">{plan.billingType}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Status</dt>
              <dd className="font-medium capitalize">{plan.status}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Credits / mo</dt>
              <dd className="font-medium">{plan.creditsPerMonth ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Enabled modules</h2>
          <ul className="mt-3 list-inside list-disc text-sm text-[var(--text-2)]">
            {enabledModules.length ? enabledModules.map((l) => <li key={l}>{l}</li>) : <li>None</li>}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-sm font-semibold text-[var(--text-1)]">Limits</h2>
        <pre className="overflow-x-auto rounded-[var(--r-inner)] border border-[var(--border)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-1)]">
          {JSON.stringify(plan.limits, null, 2)}
        </pre>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-[var(--text-1)]">Assigned organizations</h2>
        <DataTable<Organization>
          columns={[
            { key: "name", header: "Organization" },
            { key: "status", header: "Status" },
            { key: "userCount", header: "Users" },
          ]}
          rows={assigned}
          getRowKey={(r) => r.id}
          empty="No organizations on this plan."
          actions={(row) => (
            <Link href={`/superadmin/organizations/${row.id}`} className="text-[var(--primary)] hover:underline">
              View
            </Link>
          )}
        />
      </div>
    </>
  );
}
