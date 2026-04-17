"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DataTable } from "@/components/superadmin/DataTable";
import { KpiCard } from "@/components/superadmin/KpiCard";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { usePartners } from "@/lib/superadmin/hooks";

export default function PartnerDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { partners, loaded } = usePartners();
  const partner = partners.find((p) => p.id === id);

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;
  if (!partner) return <p className="text-sm text-[var(--accent-error)]">Partner not found.</p>;

  const commissionLabel =
    partner.commission.model === "percent"
      ? `${partner.commission.percent ?? 0}%`
      : `$${((partner.commission.amountCents ?? 0) / 100).toFixed(2)}`;

  return (
    <>
      <BackLink href="/superadmin/partners">Partners</BackLink>
      <PageHeader
        title={partner.name}
        description={`${partner.type} · ${commissionLabel}`}
        actions={
          <Link
            href={`/superadmin/partners/${id}/edit`}
            className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]"
          >
            Edit
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Revenue" value={`$${(partner.revenueCents / 100).toLocaleString()}`} />
        <KpiCard title="Referrals" value={partner.referrals.length} />
        <KpiCard title="Status" value={partner.status} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-[var(--text-1)]">Referrals</h2>
        <DataTable
          columns={[
            { key: "name", header: "Name" },
            { key: "convertedAt", header: "Converted" },
            {
              key: "valueCents",
              header: "Value",
              render: (r: { valueCents: number }) => `$${(r.valueCents / 100).toLocaleString()}`,
            },
          ]}
          rows={partner.referrals}
          getRowKey={(r) => r.id}
          empty="No referrals recorded."
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Earnings</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {partner.earnings.map((e) => (
              <li key={e.month} className="flex justify-between">
                <span className="text-[var(--text-2)]">{e.month}</span>
                <span className="font-medium tabular-nums">${(e.amountCents / 100).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Performance</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {partner.performance.map((p) => (
              <li key={p.label} className="flex justify-between">
                <span className="text-[var(--text-2)]">{p.label}</span>
                <span className="font-medium tabular-nums">{p.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
