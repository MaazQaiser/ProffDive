"use client";

import { useRouter } from "next/navigation";
import { PlanForm } from "@/components/superadmin/PlanForm";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { usePlans } from "@/lib/superadmin/hooks";

export default function NewPlanPage() {
  const router = useRouter();
  const { create } = usePlans();

  return (
    <>
      <BackLink href="/superadmin/billing/plans">Plans</BackLink>
      <PageHeader title="New plan" />
      <PlanForm
        submitLabel="Create plan"
        onSubmit={(data) => {
          const id = create(data);
          router.push(`/superadmin/billing/plans/${id}`);
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
