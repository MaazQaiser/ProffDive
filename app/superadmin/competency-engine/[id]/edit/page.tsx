"use client";

import { useParams, useRouter } from "next/navigation";
import { CompetencyEngineForm } from "@/components/superadmin/CompetencyEngineForm";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { useCompetencyEngines } from "@/lib/superadmin/hooks";

export default function EditCompetencyEnginePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const { versions, update, loaded } = useCompetencyEngines();
  const ver = versions.find((v) => v.id === id);
  const formId = "competency-engine-form";

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;
  if (!ver) return <p className="text-sm text-[var(--accent-error)]">Version not found.</p>;

  return (
    <>
      <div className="sticky top-0 z-20 -mx-6 bg-[var(--bg-app)] px-6 pt-6">
        <BackLink href={`/superadmin/competency-engine/${ver.id}`}>{ver.name}</BackLink>
        <PageHeader
          title="Edit Competency Engine"
          description="Update version name and the 12 competency cards."
          actions={
            <>
              <button
                type="submit"
                form={formId}
                className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]"
              >
                Cancel
              </button>
            </>
          }
        />
        <div className="border-b border-[var(--border)]" />
      </div>
      <CompetencyEngineForm
        formId={formId}
        initial={ver}
        submitLabel="Save changes"
        onSubmit={(data) => {
          update(id, data);
          router.push(`/superadmin/competency-engine/${id}`);
        }}
        onCancel={() => router.back()}
        showFooterActions={false}
      />
    </>
  );
}

