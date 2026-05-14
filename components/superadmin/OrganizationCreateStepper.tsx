"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Field, Select, TextInput } from "@/components/superadmin/Field";
import { PlanForm } from "@/components/superadmin/PlanForm";
import type { CompetencyEngineVersion, Organization, OrgCandidate, Plan } from "@/lib/superadmin/types";

type OrganizationCreateStepperProps = {
  plans: Plan[];
  competencyEngines: CompetencyEngineVersion[];
  createCompetencyEngineCopy: (input: Omit<CompetencyEngineVersion, "id" | "createdAt">) => string;
  createPlan: (p: Omit<Plan, "id">) => string;
  submitLabel?: string;
  onSubmit: (data: Omit<Organization, "id">) => void;
  onCancel?: () => void;
};

type StepId = "org" | "competency" | "plan" | "candidates" | "review";

const STEPS: { id: StepId; label: string; hint: string }[] = [
  { id: "org", label: "Organization", hint: "Basics and contact details." },
  { id: "competency", label: "Competency engine", hint: "Pick the default rubric and optionally copy it." },
  { id: "plan", label: "Pricing plan", hint: "Choose Standard, Premium, or build a custom plan." },
  { id: "candidates", label: "Candidates", hint: "Bulk onboarding (optional)." },
  { id: "review", label: "Review", hint: "Confirm details and create the organization." },
] as const;

function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

function safeSubdomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCsvCandidates(text: string): OrgCandidate[] {
  const lines = text
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const rawRows = lines.map((l) => l.split(",").map((c) => c.trim()));
  const first = rawRows[0] ?? [];
  const headerLike =
    first.length >= 2 &&
    ["name", "full name"].includes((first[0] ?? "").toLowerCase()) &&
    ["email", "email address"].includes((first[1] ?? "").toLowerCase());

  const rows = headerLike ? rawRows.slice(1) : rawRows;
  const out: OrgCandidate[] = [];
  for (const r of rows) {
    const name = (r[0] ?? "").trim();
    const email = normalizeEmail(r[1] ?? "");
    if (!email) continue;
    out.push({ name: name || email.split("@")[0] || "Candidate", email });
  }
  return out;
}

function Modal({
  title,
  description,
  open,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative w-full max-w-3xl rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--text-1)]">{title}</h2>
            {description ? <p className="mt-1 text-xs text-[var(--text-2)]">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--r-button)] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-2)] hover:bg-[var(--bg-subtle)]"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function OrganizationCreateStepper({
  plans,
  competencyEngines,
  createCompetencyEngineCopy,
  createPlan,
  submitLabel = "Create organization",
  onSubmit,
  onCancel,
}: OrganizationCreateStepperProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx]!;

  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);

  const [competencyEngineId, setCompetencyEngineId] = useState<string>(competencyEngines[0]?.id ?? "cev_default");
  const [competencyModalOpen, setCompetencyModalOpen] = useState(false);

  const [planMode, setPlanMode] = useState<"standard" | "premium" | "custom">("standard");
  const standardPlanId = useMemo(() => {
    const active = plans.filter((p) => p.status === "active");
    const sorted = [...active].sort((a, b) => a.priceCents - b.priceCents);
    return sorted[0]?.id ?? plans[0]?.id ?? "";
  }, [plans]);
  const premiumPlanId = useMemo(() => {
    const active = plans.filter((p) => p.status === "active");
    const sorted = [...active].sort((a, b) => b.priceCents - a.priceCents);
    return sorted[0]?.id ?? plans[0]?.id ?? "";
  }, [plans]);

  const [customPlanId, setCustomPlanId] = useState(plans[0]?.id ?? "");
  const effectivePlanId =
    planMode === "standard" ? standardPlanId : planMode === "premium" ? premiumPlanId : customPlanId;

  const [planModalOpen, setPlanModalOpen] = useState(false);

  const [candidates, setCandidates] = useState<OrgCandidate[]>([]);
  const [candidatesSkipped, setCandidatesSkipped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedEngine = useMemo(
    () => competencyEngines.find((v) => v.id === competencyEngineId) ?? competencyEngines[0],
    [competencyEngines, competencyEngineId]
  );

  const selectedPlan = useMemo(() => plans.find((p) => p.id === effectivePlanId), [plans, effectivePlanId]);

  const canGoNext = useMemo(() => {
    if (step.id === "org") {
      return name.trim().length > 0 && normalizeEmail(contactEmail).includes("@");
    }
    if (step.id === "competency") return Boolean(competencyEngineId);
    if (step.id === "plan") return Boolean(effectivePlanId);
    return true;
  }, [step.id, name, contactEmail, competencyEngineId, effectivePlanId]);

  const goNext = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));

  const handleLogoPick = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.readAsDataURL(file);
    });
    setLogoDataUrl(dataUrl);
  };

  const handleCandidatesFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseCsvCandidates(text);
    setCandidates((prev) => {
      const merged = [...prev, ...parsed];
      const byEmail = new Map<string, OrgCandidate>();
      for (const c of merged) byEmail.set(normalizeEmail(c.email), { ...c, email: normalizeEmail(c.email) });
      return [...byEmail.values()].filter((c) => c.email);
    });
    setCandidatesSkipped(false);
  };

  const buildPayload = (): Omit<Organization, "id"> => {
    return {
      name: name.trim(),
      contactEmail: normalizeEmail(contactEmail),
      subdomain: safeSubdomain(subdomain),
      logoDataUrl,
      planId: effectivePlanId,
      competencyEngineId,
      status: "active",
      userCount: 0,
      limits: {},
      candidates: candidatesSkipped ? [] : candidates,
      subscription: selectedPlan ? { status: "active" } : undefined,
    };
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--text-2)]">Step {stepIdx + 1} of {STEPS.length}</p>
            <h2 className="mt-1 text-sm font-semibold text-[var(--text-1)]">{step.label}</h2>
            <p className="mt-1 text-xs text-[var(--text-2)]">{step.hint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStepIdx(idx)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  idx === stepIdx
                    ? "border-[var(--border-focus)] bg-[var(--bg-subtle)] text-[var(--text-1)]"
                    : "border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--bg-subtle)]"
                }`}
              >
                {idx + 1}. {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {step.id === "org" ? (
        <section className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Organization name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="Point of contact email">
              <TextInput
                type="email"
                placeholder="admin@company.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Subdomain (optional)" hint="Example: acme (no spaces).">
              <TextInput
                placeholder="acme"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
              />
            </Field>
            <Field label="Upload logo (optional)" hint="Stored locally for demo purposes.">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleLogoPick(f);
                  }}
                  className="block w-full text-xs text-[var(--text-2)] file:mr-3 file:rounded-[var(--r-button)] file:border file:border-[var(--border)] file:bg-[var(--bg-subtle)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[var(--text-2)] hover:file:bg-[var(--bg-subtle)]"
                />
                {logoDataUrl ? (
                  <Image
                    src={logoDataUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md border border-[var(--border)] object-cover"
                  />
                ) : null}
              </div>
            </Field>
          </div>
        </section>
      ) : null}

      {step.id === "competency" ? (
        <section className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Field label="Default competency engine">
              <Select value={competencyEngineId} onChange={(e) => setCompetencyEngineId(e.target.value)}>
                {competencyEngines.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </Field>
            <button
              type="button"
              onClick={() => setCompetencyModalOpen(true)}
              className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]"
            >
              View / change options
            </button>
          </div>

          <p className="mt-3 text-xs text-[var(--text-3)]">
            Need a new variant? You can copy the selected engine and save it as a new version.
          </p>

          <Modal
            open={competencyModalOpen}
            onClose={() => setCompetencyModalOpen(false)}
            title="Competency engine"
            description="Preview the default competencies. You can proceed, or save a copy to customize later."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <Field label="Engine">
                  <Select value={competencyEngineId} onChange={(e) => setCompetencyEngineId(e.target.value)}>
                    {competencyEngines.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const base = competencyEngines.find((v) => v.id === competencyEngineId);
                      if (!base) return;
                      const newId = createCompetencyEngineCopy({
                        name: `${base.name} (Copy)`,
                        competencies: base.competencies,
                      });
                      setCompetencyEngineId(newId);
                      setCompetencyModalOpen(false);
                    }}
                    className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
                  >
                    Save as copy
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompetencyModalOpen(false)}
                    className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--bg-subtle)]"
                  >
                    Next
                  </button>
                  <Link
                    href={`/superadmin/competency-engine/new?from=${encodeURIComponent(competencyEngineId)}`}
                    className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--bg-subtle)]"
                  >
                    Create new (advanced)
                  </Link>
                </div>
              </div>

              <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
                <p className="text-xs font-medium text-[var(--text-2)]">
                  Preview: {selectedEngine?.name ?? "—"}
                </p>
                <ul className="mt-2 grid gap-2 text-xs text-[var(--text-2)]">
                  {(selectedEngine?.competencies ?? []).slice(0, 12).map((c) => (
                    <li key={c.id} className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1.5">
                      <span className="font-medium text-[var(--text-1)]">{c.title}</span>
                      <span className="block text-[var(--text-3)]">{c.description || "—"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Modal>
        </section>
      ) : null}

      {step.id === "plan" ? (
        <section className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="grid gap-3">
            <label className="flex items-start gap-3 rounded-[var(--r-card)] border border-[var(--border)] p-3 hover:bg-[var(--bg-subtle)]">
              <input
                type="radio"
                name="plan-mode"
                checked={planMode === "standard"}
                onChange={() => setPlanMode("standard")}
                className="mt-0.5"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-1)]">Standard</p>
                <p className="text-xs text-[var(--text-2)]">
                  Uses {plans.find((p) => p.id === standardPlanId)?.name ?? "the lowest-priced active plan"}.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-[var(--r-card)] border border-[var(--border)] p-3 hover:bg-[var(--bg-subtle)]">
              <input
                type="radio"
                name="plan-mode"
                checked={planMode === "premium"}
                onChange={() => setPlanMode("premium")}
                className="mt-0.5"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-1)]">Premium</p>
                <p className="text-xs text-[var(--text-2)]">
                  Uses {plans.find((p) => p.id === premiumPlanId)?.name ?? "the highest-priced active plan"}.
                </p>
              </div>
            </label>

            <div className="rounded-[var(--r-card)] border border-[var(--border)] p-3">
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="plan-mode"
                  checked={planMode === "custom"}
                  onChange={() => setPlanMode("custom")}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-1)]">Custom</p>
                  <p className="text-xs text-[var(--text-2)]">Pick an existing plan or create one right now.</p>
                  {planMode === "custom" ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <Field label="Plan">
                        <Select value={customPlanId} onChange={(e) => setCustomPlanId(e.target.value)}>
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} · ${(p.priceCents / 100).toFixed(2)} / {p.billingType}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <button
                        type="button"
                        onClick={() => setPlanModalOpen(true)}
                        className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]"
                      >
                        Create custom plan
                      </button>
                    </div>
                  ) : null}
                </div>
              </label>
            </div>
          </div>

          {selectedPlan ? (
            <p className="mt-4 text-xs text-[var(--text-3)]">
              Selected: <span className="font-medium text-[var(--text-2)]">{selectedPlan.name}</span>
            </p>
          ) : null}

          <Modal
            open={planModalOpen}
            onClose={() => setPlanModalOpen(false)}
            title="Create custom plan"
            description="This creates a plan in the Super Admin console (demo storage), then assigns it to the new organization."
          >
            <PlanForm
              submitLabel="Create plan"
              onSubmit={(data) => {
                const id = createPlan(data);
                setCustomPlanId(id);
                setPlanMode("custom");
                setPlanModalOpen(false);
              }}
              onCancel={() => setPlanModalOpen(false)}
            />
          </Modal>
        </section>
      ) : null}

      {step.id === "candidates" ? (
        <section className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-1)]">Bulk candidate onboarding</p>
              <p className="text-xs text-[var(--text-2)]">Upload a CSV with columns: name,email (header optional).</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]"
              >
                Upload list
              </button>
              <button
                type="button"
                onClick={() => {
                  setCandidates([]);
                  setCandidatesSkipped(true);
                }}
                className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--bg-subtle)]"
              >
                Skip
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleCandidatesFile(f);
              if (e.currentTarget) e.currentTarget.value = "";
            }}
          />

          {candidatesSkipped ? (
            <p className="mt-4 text-xs text-[var(--text-3)]">Skipped. You can onboard candidates later.</p>
          ) : candidates.length === 0 ? (
            <p className="mt-4 text-xs text-[var(--text-3)]">No candidates added yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-[var(--r-card)] border border-[var(--border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg-subtle)]">
                  <tr>
                    <th className="px-3 py-2 text-xs font-medium text-[var(--text-2)]">Name</th>
                    <th className="px-3 py-2 text-xs font-medium text-[var(--text-2)]">Email</th>
                    <th className="px-3 py-2 text-xs font-medium text-[var(--text-2)]" />
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.email} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2 text-sm text-[var(--text-1)]">{c.name}</td>
                      <td className="px-3 py-2 text-sm text-[var(--text-2)]">{c.email}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setCandidates((prev) => prev.filter((x) => x.email !== c.email))}
                          className="rounded-[var(--r-button)] border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-2)] hover:bg-[var(--bg-subtle)]"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {step.id === "review" ? (
        <section className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-1)]">Organization</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-2)]">Name</dt>
                  <dd className="font-medium">{name.trim() || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-2)]">POC email</dt>
                  <dd className="font-medium">{normalizeEmail(contactEmail) || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-2)]">Subdomain</dt>
                  <dd className="font-medium">{safeSubdomain(subdomain) || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-2)]">Logo</dt>
                  <dd className="font-medium">{logoDataUrl ? "Uploaded" : "—"}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-1)]">Configuration</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-2)]">Competency engine</dt>
                  <dd className="font-medium">{selectedEngine?.name ?? competencyEngineId ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-2)]">Plan</dt>
                  <dd className="font-medium">{selectedPlan?.name ?? effectivePlanId ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-2)]">Candidates</dt>
                  <dd className="font-medium">
                    {candidatesSkipped ? "Skipped" : `${candidates.length} in list`}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onSubmit(buildPayload())}
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
        </section>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIdx === 0}
          className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        <div className="flex items-center gap-2">
          {step.id === "candidates" ? (
            <button
              type="button"
              onClick={() => {
                setCandidates([]);
                setCandidatesSkipped(true);
                goNext();
              }}
              className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--bg-subtle)]"
            >
              Skip & continue
            </button>
          ) : null}

          {step.id !== "review" ? (
            <button
              type="button"
              disabled={!canGoNext}
              onClick={goNext}
              className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

