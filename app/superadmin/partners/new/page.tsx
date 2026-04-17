"use client";

import { useRouter } from "next/navigation";
import { PartnerForm } from "@/components/superadmin/PartnerForm";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { usePartners } from "@/lib/superadmin/hooks";

export default function NewPartnerPage() {
  const router = useRouter();
  const { create } = usePartners();

  return (
    <>
      <BackLink href="/superadmin/partners">Partners</BackLink>
      <PageHeader title="New partner" />
      <PartnerForm
        submitLabel="Create partner"
        onSubmit={(data) => {
          const id = create(data);
          router.push(`/superadmin/partners/${id}`);
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
