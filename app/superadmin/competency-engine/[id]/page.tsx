"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { COMPETENCY_PILLARS, COMPETENCY_TITLES_12 } from "@/lib/superadmin/competency-engine";
import { useCompetencyEngines } from "@/lib/superadmin/hooks";

export default function CompetencyEngineDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { versions, loaded } = useCompetencyEngines();
  const ver = versions.find((v) => v.id === id);

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;
  if (!ver) return <p className="text-sm text-[var(--accent-error)]">Version not found.</p>;

  return (
    <>
      <div className="sticky top-0 z-20 -mx-6 bg-[var(--bg-app)] px-6 pt-6">
        <BackLink href="/superadmin/competency-engine">Competency Engine</BackLink>
        <PageHeader
          title={ver.name}
          actions={
            <>
              <Link
                href={`/superadmin/competency-engine/new?from=${encodeURIComponent(ver.id)}`}
                className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]"
              >
                Create copy
              </Link>
              <Link
                href={`/superadmin/competency-engine/${ver.id}/edit`}
                className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
              >
                Edit
              </Link>
            </>
          }
        />
        <div className="border-b border-[var(--border)]" />
      </div>

      <div className="space-y-8">
        {COMPETENCY_PILLARS.map((pillar, pIdx) => {
          const offset = pIdx * 3;
          return (
            <section key={pillar.id}>
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-semibold text-[var(--text-1)]">{pillar.label}</h2>
                <div className="text-xs text-[var(--text-3)]">3 competencies</div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {[0, 1, 2].map((i) => {
                  const idx = offset + i;
                  const c = (ver.competencies ?? [])[idx];
                  return (
                    <div
                      key={c?.id || idx}
                      className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                    >
                      <div className="mt-2 text-sm font-semibold text-[var(--text-1)]">
                        {COMPETENCY_TITLES_12[idx] ?? c?.title ?? `Competency ${idx + 1}`}
                      </div>
                      <pre className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-2)]">
                        {c?.description || "—"}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

