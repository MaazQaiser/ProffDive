"use client";

import { useRouter, useParams } from "next/navigation";
import { OrganizationForm } from "@/components/superadmin/OrganizationForm";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { useOrganizations, usePlans } from "@/lib/superadmin/hooks";

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const { orgs, update } = useOrganizations();
  const { plans, loaded } = usePlans();
  const org = orgs.find((o) => o.id === id);

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;
  if (!org) return <p className="text-sm text-[var(--accent-error)]">Organization not found.</p>;

  return (
    <>
      <BackLink href={`/superadmin/organizations/${id}`}>{org.name}</BackLink>
      <PageHeader title="Edit organization" />
      <OrganizationForm
        plans={plans}
        initial={org}
        submitLabel="Save changes"
        onSubmit={(data) => {
          update(id, data);
          router.push(`/superadmin/organizations/${id}`);
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
