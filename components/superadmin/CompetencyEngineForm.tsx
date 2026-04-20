"use client";

import { useMemo, useState } from "react";
import { Field, TextArea, TextInput } from "@/components/superadmin/Field";
import { COMPETENCY_PILLARS, COMPETENCY_TITLES_12 } from "@/lib/superadmin/competency-engine";
import type { CompetencyCard, CompetencyEngineVersion } from "@/lib/superadmin/types";

type CompetencyEngineFormData = Omit<CompetencyEngineVersion, "id" | "createdAt">;

function ensure12(input: CompetencyCard[] | undefined): CompetencyCard[] {
  const base = (input ?? []).slice(0, 12);
  while (base.length < 12) {
    base.push({
      id: `cc_${base.length + 1}`,
      title: COMPETENCY_TITLES_12[base.length] ?? `Competency ${base.length + 1}`,
      description: "",
    });
  }
  // Titles are canonical; overwrite to ensure no edits slip in.
  return base.map((c, idx) => ({ ...c, title: COMPETENCY_TITLES_12[idx] ?? c.title }));
}

export function CompetencyEngineForm({
  initial,
  formId,
  submitLabel,
  onSubmit,
  onCancel,
  showFooterActions = true,
}: {
  initial?: Partial<CompetencyEngineVersion>;
  formId?: string;
  submitLabel: string;
  onSubmit: (data: CompetencyEngineFormData) => void;
  onCancel?: () => void;
  showFooterActions?: boolean;
}) {
  const initialCompetencies = useMemo(() => ensure12(initial?.competencies as CompetencyCard[] | undefined), [initial]);

  const [name, setName] = useState(initial?.name ?? "");
  const [competencies, setCompetencies] = useState<CompetencyCard[]>(initialCompetencies);

  return (
    <form
      id={formId}
      className="max-w-5xl space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: name.trim(),
          competencies: competencies.map((c, idx) => ({
            ...c,
            title: COMPETENCY_TITLES_12[idx] ?? c.title,
            description: c.description,
          })),
        });
      }}
    >
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Version details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Version name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Competencies (12)</h2>
          <p className="text-xs text-[var(--text-2)]">Titles are fixed. You can edit descriptions only.</p>
        </div>

        <div className="space-y-8">
          {COMPETENCY_PILLARS.map((pillar, pIdx) => {
            const offset = pIdx * 3;
            return (
              <div key={pillar.id}>
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <h3 className="text-sm font-semibold text-[var(--text-1)]">{pillar.label}</h3>
                  <div className="text-xs text-[var(--text-3)]">3 competencies</div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {[0, 1, 2].map((i) => {
                    const idx = offset + i;
                    const c = competencies[idx];
                    return (
                      <div
                        key={c?.id || idx}
                        className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                      >
                        <div className="text-sm font-semibold text-[var(--text-1)]">
                          {COMPETENCY_TITLES_12[idx] ?? c?.title ?? `Competency ${idx + 1}`}
                        </div>
                        <div className="mt-3">
                          <Field label="Description / rubric">
                            <TextArea
                              value={c?.description ?? ""}
                              onChange={(e) =>
                                setCompetencies((prev) =>
                                  prev.map((x, j) => (j === idx ? { ...x, description: e.target.value } : x))
                                )
                              }
                              className="min-h-[120px]"
                              placeholder="Write the competency description, indicators, and rules…"
                            />
                          </Field>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {showFooterActions ? (
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            {submitLabel}
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--bg-subtle)]"
            >
              Cancel
            </button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

