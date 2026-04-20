"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CompetencyEngineForm } from "@/components/superadmin/CompetencyEngineForm";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { useCompetencyEngines } from "@/lib/superadmin/hooks";

export default function NewCompetencyEnginePage() {
  const router = useRouter();
  const search = useSearchParams();
  const fromId = search.get("from");
  const { versions, create, loaded } = useCompetencyEngines();
  const formId = "competency-engine-form";

  const copyFrom = useMemo(() => {
    if (fromId) return versions.find((v) => v.id === fromId);
    return versions.find((v) => v.id === "cev_default");
  }, [fromId, versions]);

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;

  return (
    <>
      <div className="sticky top-0 z-20 -mx-6 bg-[var(--bg-app)] px-6 pt-6">
        <BackLink href="/superadmin/competency-engine">Competency Engine</BackLink>
        <PageHeader
          title={copyFrom ? "Create copy" : "New version"}
          actions={
            <>
              <button
                type="submit"
                form={formId}
                className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
              >
                {copyFrom ? "Save copy" : "Create version"}
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
        initial={
          copyFrom
            ? {
                name: `Copy of ${copyFrom.name}`,
                competencies: copyFrom.competencies,
              }
            : undefined
        }
        submitLabel={copyFrom ? "Save copy" : "Create version"}
        onSubmit={(data) => {
          const id = create(data);
          router.push(`/superadmin/competency-engine/${id}`);
        }}
        onCancel={() => router.back()}
        showFooterActions={false}
      />
    </>
  );
}

