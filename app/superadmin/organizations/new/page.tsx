"use client";

import { useRouter } from "next/navigation";
import { OrganizationForm } from "@/components/superadmin/OrganizationForm";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { useOrganizations, usePlans } from "@/lib/superadmin/hooks";

export default function NewOrganizationPage() {
  const router = useRouter();
  const { create } = useOrganizations();
  const { plans, loaded } = usePlans();

  if (!loaded || plans.length === 0) {
    return <p className="text-sm text-[var(--text-2)]">Loading… Create a plan first if none exist.</p>;
  }

  return (
    <>
      <BackLink href="/superadmin/organizations">Organizations</BackLink>
      <PageHeader title="New organization" description="Assign a plan and optional limit overrides." />
      <OrganizationForm
        plans={plans}
        submitLabel="Create organization"
        onSubmit={(data) => {
          const id = create(data);
          router.push(`/superadmin/organizations/${id}`);
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
