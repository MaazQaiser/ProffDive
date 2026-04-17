"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, Select, TextArea, TextInput } from "@/components/superadmin/Field";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { useTrainingModules } from "@/lib/superadmin/hooks";
import { DEFAULT_EVALUATION } from "@/lib/superadmin/seed";
import type { Lesson } from "@/lib/superadmin/types";

const CATEGORY_OPTIONS = ["Core", "Interview", "Communication", "Leadership", "Product", "Engineering", "Elective"] as const;

function nid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function NewContentModulePage() {
  const router = useRouter();
  const { create } = useTrainingModules();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryMode, setCategoryMode] = useState<"preset" | "custom">("preset");
  const [categoryPreset, setCategoryPreset] = useState<(typeof CATEGORY_OPTIONS)[number]>("Core");
  const [categoryCustom, setCategoryCustom] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const category = categoryMode === "custom" ? categoryCustom : categoryPreset;

  return (
    <>
      <BackLink href="/superadmin/content">Content</BackLink>
      <PageHeader title="New training module" />
      <form
        className="max-w-xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const id = create({
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            status: "draft",
            lessons: lessons
              .map((l, i) => ({ ...l, order: i }))
              .filter((l) => l.title.trim().length > 0),
            checkpoints: [],
            evaluation: DEFAULT_EVALUATION,
            settings: { published: false, gatingRules: "" },
          });
          router.push(`/superadmin/content/${id}`);
        }}
      >
        <Field label="Title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Description">
          <TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Category mode">
            <Select value={categoryMode} onChange={(e) => setCategoryMode(e.target.value as "preset" | "custom")}>
              <option value="preset">Preset</option>
              <option value="custom">Custom</option>
            </Select>
          </Field>
          {categoryMode === "preset" ? (
            <Field label="Category">
              <Select
                value={categoryPreset}
                onChange={(e) => setCategoryPreset(e.target.value as (typeof CATEGORY_OPTIONS)[number])}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <Field label="Category">
              <TextInput value={categoryCustom} onChange={(e) => setCategoryCustom(e.target.value)} required />
            </Field>
          )}
        </div>

        <div className="space-y-3 rounded-[var(--r-inner)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Initial chapters (lessons)</h2>
              <p className="mt-1 text-xs text-[var(--text-2)]">
                Optional. Add a few lessons now, or create them later in the module detail tabs.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setLessons((prev) => [
                  ...prev,
                  { id: nid("lesson"), title: "", body: "", order: prev.length },
                ])
              }
              className="shrink-0 rounded-[var(--r-button)] border border-[var(--border)] px-3 py-2 text-xs font-medium hover:bg-[var(--bg-subtle)]"
            >
              Add lesson
            </button>
          </div>

          {lessons.length === 0 ? (
            <p className="text-sm text-[var(--text-2)]">No lessons added.</p>
          ) : (
            <div className="space-y-3">
              {lessons.map((l, idx) => (
                <div key={l.id} className="rounded-[var(--r-inner)] border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
                  <Field label={`Lesson ${idx + 1} title`}>
                    <TextInput
                      value={l.title}
                      onChange={(e) =>
                        setLessons((prev) =>
                          prev.map((x) => (x.id === l.id ? { ...x, title: e.target.value } : x))
                        )
                      }
                      placeholder="e.g. The CAR framework"
                    />
                  </Field>
                  <Field label="Lesson body" className="mt-2">
                    <TextArea
                      rows={2}
                      value={l.body}
                      onChange={(e) =>
                        setLessons((prev) =>
                          prev.map((x) => (x.id === l.id ? { ...x, body: e.target.value } : x))
                        )
                      }
                      placeholder="Optional"
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => setLessons((prev) => prev.filter((x) => x.id !== l.id))}
                    className="mt-2 text-xs font-medium text-[var(--accent-error)] hover:underline"
                  >
                    Remove lesson
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Create & open detail
        </button>
      </form>
    </>
  );
}
