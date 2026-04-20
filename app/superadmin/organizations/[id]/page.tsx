"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { KpiCard } from "@/components/superadmin/KpiCard";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { Field, Select } from "@/components/superadmin/Field";
import { useCompetencyEngines, useOrganizations, usePlans } from "@/lib/superadmin/hooks";
import { getOrgUsage } from "@/lib/superadmin/seed";

export default function OrganizationDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { orgs, loaded, update } = useOrganizations();
  const { plans, loaded: pLoaded } = usePlans();
  const { versions: competencyEngines, loaded: ceLoaded } = useCompetencyEngines();
  const org = orgs.find((o) => o.id === id);
  const plan = plans.find((p) => p.id === org?.planId);
  const usage = org ? getOrgUsage(org.id) : null;
  const [planDraft, setPlanDraft] = useState<string | null>(null);

  const effectivePlanId = planDraft ?? org?.planId ?? "";
  const effectivePlan = useMemo(
    () => plans.find((p) => p.id === effectivePlanId),
    [plans, effectivePlanId]
  );

  if (!loaded || !pLoaded || !ceLoaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;
  if (!org) return <p className="text-sm text-[var(--accent-error)]">Organization not found.</p>;

  const competencyEngineName =
    competencyEngines.find((v) => v.id === org.competencyEngineId)?.name ??
    (org.competencyEngineId ? org.competencyEngineId : "Default");

  return (
    <>
      <BackLink href="/superadmin/organizations">Organizations</BackLink>
      <PageHeader
        title={org.name}
        description="Organization profile, subscription, and usage."
        actions={
          <Link
            href={`/superadmin/organizations/${id}/edit`}
            className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]"
          >
            Edit
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Organization</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Status</dt>
              <dd className="font-medium capitalize">{org.status}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Users</dt>
              <dd className="font-medium tabular-nums">{org.userCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Plan</dt>
              <dd className="font-medium">{plan?.name ?? org.planId}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Competency engine</dt>
              <dd className="font-medium">{competencyEngineName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Last invite</dt>
              <dd className="font-medium">
                {org.invites && org.invites.length > 0
                  ? `${org.invites[org.invites.length - 1]?.email} · ${org.invites[org.invites.length - 1]?.status}`
                  : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-1)]">Current package</h3>
            <p className="mt-1 text-xs text-[var(--text-2)]">
              Change the organization’s plan. Limits and modules follow the selected plan.
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field label="Plan">
                <Select
                  value={effectivePlanId}
                  onChange={(e) => setPlanDraft(e.target.value)}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · ${ (p.priceCents / 100).toFixed(2) } / {p.billingType}
                    </option>
                  ))}
                </Select>
              </Field>
              <button
                type="button"
                disabled={!planDraft || planDraft === org.planId}
                onClick={() => {
                  if (!planDraft) return;
                  update(org.id, { planId: planDraft });
                  setPlanDraft(null);
                }}
                className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save plan
              </button>
            </div>

            {effectivePlan ? (
              <p className="mt-2 text-xs text-[var(--text-3)]">
                Selected: <span className="font-medium text-[var(--text-2)]">{effectivePlan.name}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Subscription</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">State</dt>
              <dd className="font-medium">{org.subscription?.status ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Renews</dt>
              <dd className="font-medium">{org.subscription?.renewsAt ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-2)]">Billing</dt>
              <dd className="font-medium">{plan ? `${(plan.priceCents / 100).toFixed(2)} / ${plan.billingType}` : "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {usage ? (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-1)]">Usage stats</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Mock interviews" value={usage.mockInterviews} />
            <KpiCard title="Storyboards" value={usage.storyboards} />
            <KpiCard title="Reports" value={usage.reports} />
            <KpiCard title="Trainings completed" value={usage.trainingsCompleted} />
          </div>
        </div>
      ) : null}
    </>
  );
}
