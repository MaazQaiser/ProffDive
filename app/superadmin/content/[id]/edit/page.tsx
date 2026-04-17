"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Field, TextArea, TextInput } from "@/components/superadmin/Field";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { useTrainingModules } from "@/lib/superadmin/hooks";
import type { TrainingModule } from "@/lib/superadmin/types";

function EditModuleForm({
  mod,
  onSave,
  onCancel,
}: {
  mod: TrainingModule;
  onSave: (patch: Pick<TrainingModule, "title" | "description" | "category">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(mod.title);
  const [description, setDescription] = useState(mod.description);
  const [category, setCategory] = useState(mod.category);

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
        });
      }}
    >
      <Field label="Title">
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Description">
        <TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Category">
        <TextInput value={category} onChange={(e) => setCategory(e.target.value)} required />
      </Field>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function EditContentModulePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const { modules, update } = useTrainingModules();
  const mod = modules.find((m) => m.id === id);

  if (!mod) return <p className="text-sm text-[var(--accent-error)]">Module not found.</p>;

  return (
    <>
      <BackLink href={`/superadmin/content/${id}`}>{mod.title}</BackLink>
      <PageHeader title="Edit module" description="Title, description, and category." />
      <EditModuleForm
        key={mod.id}
        mod={mod}
        onSave={(patch) => {
          update(id, patch);
          router.push(`/superadmin/content/${id}`);
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
