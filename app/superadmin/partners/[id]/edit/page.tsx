"use client";

import { useParams, useRouter } from "next/navigation";
import { PartnerForm } from "@/components/superadmin/PartnerForm";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { usePartners } from "@/lib/superadmin/hooks";

export default function EditPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const { partners, update } = usePartners();
  const partner = partners.find((p) => p.id === id);

  if (!partner) return <p className="text-sm text-[var(--accent-error)]">Partner not found.</p>;

  return (
    <>
      <BackLink href={`/superadmin/partners/${id}`}>{partner.name}</BackLink>
      <PageHeader title="Edit partner" />
      <PartnerForm
        initial={partner}
        submitLabel="Save partner"
        onSubmit={(data) => {
          update(id, data);
          router.push(`/superadmin/partners/${id}`);
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
