"use client";

import { useMemo, useState } from "react";
import { Field, Select, TextArea, TextInput } from "@/components/superadmin/Field";
import { Tabs } from "@/components/superadmin/Tabs";
import type {
  Checkpoint,
  CheckpointAiPractice,
  CheckpointMcq,
  EvaluationConfig,
  Lesson,
  TrainingModule,
  TrainingModuleSettings,
} from "@/lib/superadmin/types";

function nid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

type Props = {
  module: TrainingModule;
  onChange: (patch: Partial<TrainingModule>) => void;
};

export function ContentModuleDetail({ module: m, onChange }: Props) {
  const [tab, setTab] = useState<string>("lessons");

  const tabs = useMemo(
    () => [
      { id: "lessons", label: "Lessons" },
      { id: "checkpoints", label: "Checkpoints" },
      { id: "evaluation", label: "Evaluation" },
      { id: "settings", label: "Settings" },
    ],
    []
  );

  const setEvaluation = (evaluation: EvaluationConfig) => onChange({ evaluation });
  const setSettings = (settings: TrainingModuleSettings) => onChange({ settings });

  const addLesson = () => {
    const lesson: Lesson = {
      id: nid("lesson"),
      title: "New lesson",
      body: "",
      order: m.lessons.length,
    };
    onChange({ lessons: [...m.lessons, lesson] });
  };

  const saveLesson = (id: string, patch: Partial<Lesson>) => {
    onChange({
      lessons: m.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  };

  const removeLesson = (id: string) => {
    onChange({ lessons: m.lessons.filter((l) => l.id !== id) });
  };

  const addCheckpoint = (type: Checkpoint["type"]) => {
    const order = m.checkpoints.length;
    const base = { id: nid("cp"), order };
    const cp: Checkpoint =
      type === "mcq"
        ? {
            ...base,
            type: "mcq",
            question: "",
            options: ["", "", ""],
            correctIndex: 0,
          }
        : { ...base, type: "ai_practice", prompt: "" };
    onChange({ checkpoints: [...m.checkpoints, cp] });
  };

  const saveCheckpoint = (id: string, patch: Partial<Checkpoint>) => {
    onChange({
      checkpoints: m.checkpoints.map((c) =>
        c.id === id ? ({ ...c, ...patch } as Checkpoint) : c
      ),
    });
  };

  const removeCheckpoint = (id: string) => {
    onChange({ checkpoints: m.checkpoints.filter((c) => c.id !== id) });
  };

  return (
    <Tabs tabs={tabs} active={tab} onChange={setTab}>
      {tab === "lessons" ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={addLesson}
            className="rounded-[var(--r-button)] bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white"
          >
            Add lesson
          </button>
          {m.lessons.length === 0 ? (
            <p className="text-sm text-[var(--text-2)]">No lessons yet.</p>
          ) : (
            <ul className="space-y-4">
              {m.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="rounded-[var(--r-inner)] border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Title">
                      <TextInput
                        value={lesson.title}
                        onChange={(e) => saveLesson(lesson.id, { title: e.target.value })}
                      />
                    </Field>
                    <Field label="Order">
                      <TextInput
                        type="number"
                        value={lesson.order}
                        onChange={(e) =>
                          saveLesson(lesson.id, { order: parseInt(e.target.value, 10) || 0 })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Body" className="mt-3">
                    <TextArea
                      rows={4}
                      value={lesson.body}
                      onChange={(e) => saveLesson(lesson.id, { body: e.target.value })}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => removeLesson(lesson.id)}
                    className="mt-2 text-sm text-[var(--accent-error)] hover:underline"
                  >
                    Delete lesson
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === "checkpoints" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addCheckpoint("mcq")}
              className="rounded-[var(--r-button)] border border-[var(--border)] px-3 py-1.5 text-sm"
            >
              Add MCQ
            </button>
            <button
              type="button"
              onClick={() => addCheckpoint("ai_practice")}
              className="rounded-[var(--r-button)] border border-[var(--border)] px-3 py-1.5 text-sm"
            >
              Add AI practice
            </button>
          </div>
          {m.checkpoints.length === 0 ? (
            <p className="text-sm text-[var(--text-2)]">No checkpoints.</p>
          ) : (
            <ul className="space-y-4">
              {m.checkpoints.map((c) => (
                <li
                  key={c.id}
                  className="rounded-[var(--r-inner)] border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                >
                  <p className="mb-2 text-xs font-medium uppercase text-[var(--text-3)]">
                    {c.type === "mcq" ? "MCQ" : "AI practice"}
                  </p>
                  {c.type === "mcq" ? (
                    <McqEditor
                      cp={c}
                      onSave={(patch) => saveCheckpoint(c.id, patch)}
                    />
                  ) : (
                    <AiEditor cp={c} onSave={(patch) => saveCheckpoint(c.id, patch)} />
                  )}
                  <button
                    type="button"
                    onClick={() => removeCheckpoint(c.id)}
                    className="mt-2 text-sm text-[var(--accent-error)] hover:underline"
                  >
                    Delete checkpoint
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === "evaluation" ? (
        <EvaluationEditor evaluation={m.evaluation} onChange={setEvaluation} />
      ) : null}

      {tab === "settings" ? (
        <div className="max-w-xl space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={m.settings.published}
              onChange={(e) => {
                const published = e.target.checked;
                onChange({
                  settings: { ...m.settings, published },
                  status: published ? "published" : "draft",
                });
              }}
              className="h-4 w-4 rounded border-[var(--border-strong)]"
            />
            Published
          </label>
          <Field label="Gating rules">
            <TextArea
              rows={4}
              value={m.settings.gatingRules}
              onChange={(e) => setSettings({ ...m.settings, gatingRules: e.target.value })}
            />
          </Field>
        </div>
      ) : null}
    </Tabs>
  );
}

function McqEditor({
  cp,
  onSave,
}: {
  cp: CheckpointMcq;
  onSave: (patch: Partial<CheckpointMcq>) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Question">
        <TextInput value={cp.question} onChange={(e) => onSave({ question: e.target.value })} />
      </Field>
      {cp.options.map((opt, i) => (
        <Field key={i} label={`Option ${i + 1}`}>
          <TextInput
            value={opt}
            onChange={(e) => {
              const options = [...cp.options];
              options[i] = e.target.value;
              onSave({ options });
            }}
          />
        </Field>
      ))}
      <Field label="Correct option">
        <Select
          value={cp.correctIndex}
          onChange={(e) => onSave({ correctIndex: parseInt(e.target.value, 10) })}
        >
          {cp.options.map((_, i) => (
            <option key={i} value={i}>
              {i + 1}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

function AiEditor({
  cp,
  onSave,
}: {
  cp: CheckpointAiPractice;
  onSave: (patch: Partial<CheckpointAiPractice>) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Prompt">
        <TextArea rows={3} value={cp.prompt} onChange={(e) => onSave({ prompt: e.target.value })} />
      </Field>
      <Field label="Duration hint">
        <TextInput
          value={cp.durationHint ?? ""}
          onChange={(e) => onSave({ durationHint: e.target.value })}
        />
      </Field>
    </div>
  );
}

function EvaluationEditor({
  evaluation: ev,
  onChange,
}: {
  evaluation: EvaluationConfig;
  onChange: (e: EvaluationConfig) => void;
}) {
  const levels: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];
  return (
    <div className="max-w-3xl space-y-4">
      <Field label="Prompt for AI">
        <TextArea rows={4} value={ev.aiPrompt} onChange={(e) => onChange({ ...ev, aiPrompt: e.target.value })} />
      </Field>
      <Field label="Competency mapping">
        <TextArea
          rows={3}
          value={ev.competencyMapping}
          onChange={(e) => onChange({ ...ev, competencyMapping: e.target.value })}
        />
      </Field>
      {levels.map((lvl) => (
        <Field key={lvl} label={`Level ${lvl}`}>
          <TextInput
            value={ev.scoringLevels[lvl]}
            onChange={(e) =>
              onChange({
                ...ev,
                scoringLevels: { ...ev.scoringLevels, [lvl]: e.target.value },
              })
            }
          />
        </Field>
      ))}
      <Field label="Pass condition">
        <TextInput
          value={ev.passCondition}
          onChange={(e) => onChange({ ...ev, passCondition: e.target.value })}
        />
      </Field>
    </div>
  );
}
