"use client";

import { useParams, useRouter } from "next/navigation";
import { PlanForm } from "@/components/superadmin/PlanForm";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { usePlans } from "@/lib/superadmin/hooks";

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const { plans, update } = usePlans();
  const plan = plans.find((p) => p.id === id);

  if (!plan) return <p className="text-sm text-[var(--accent-error)]">Plan not found.</p>;

  return (
    <>
      <BackLink href={`/superadmin/billing/plans/${id}`}>{plan.name}</BackLink>
      <PageHeader title="Edit plan" />
      <PlanForm
        initial={plan}
        submitLabel="Save plan"
        onSubmit={(data) => {
          update(id, data);
          router.push(`/superadmin/billing/plans/${id}`);
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
