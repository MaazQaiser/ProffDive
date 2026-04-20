"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, Select, TextInput } from "@/components/superadmin/Field";
import type { CompetencyEngineVersion, Organization, OrgStatus, Plan } from "@/lib/superadmin/types";

type OrganizationFormProps = {
  plans: Plan[];
  competencyEngines?: CompetencyEngineVersion[];
  initial?: Organization;
  submitLabel: string;
  onSubmit: (data: Omit<Organization, "id">) => void;
  onCancel?: () => void;
};

export function OrganizationForm({
  plans,
  competencyEngines,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: OrganizationFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [planId, setPlanId] = useState(initial?.planId ?? plans[0]?.id ?? "");
  const [competencyEngineId, setCompetencyEngineId] = useState(initial?.competencyEngineId ?? "cev_default");
  const [status, setStatus] = useState<OrgStatus>(initial?.status ?? "active");
  const [userCount, setUserCount] = useState(initial?.userCount?.toString() ?? "0");
  const [inviteEmail, setInviteEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    const newInvite = email
      ? [{ email, sentAt: new Date().toISOString(), status: "sent" as const }]
      : [];
    onSubmit({
      name: name.trim(),
      planId,
      competencyEngineId: competencyEngines ? competencyEngineId : initial?.competencyEngineId,
      status,
      userCount: parseInt(userCount, 10) || 0,
      // Keep existing overrides (edit) or none (create).
      // Plan-driven limits are configured on the Plan itself.
      limits: initial?.limits ?? {},
      invites: email ? [...(initial?.invites ?? []), ...newInvite] : (initial?.invites ?? []),
      subscription: initial?.subscription,
    });
  };

  const effectiveSubmitLabel = inviteEmail.trim()
    ? submitLabel.includes("Save")
      ? "Save & send invite"
      : "Create & send invite"
    : submitLabel;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Field label="Organization name">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Plan">
        <Select value={planId} onChange={(e) => setPlanId(e.target.value)}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>

      {competencyEngines ? (
        <Field
          label="Competency Engine"
          hint="Select a competency engine version for this organization, or create a new version."
        >
          <div className="space-y-2">
            <Select value={competencyEngineId} onChange={(e) => setCompetencyEngineId(e.target.value)}>
              {competencyEngines.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
            <Link
              href="/superadmin/competency-engine/new?from=cev_default"
              className="inline-flex text-sm font-medium text-[var(--primary)] hover:underline"
            >
              Create new Competency Engine
            </Link>
          </div>
        </Field>
      ) : null}

      <Field label="Status">
        <Select value={status} onChange={(e) => setStatus(e.target.value as OrgStatus)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </Field>
      <Field label="Users count" hint="Reporting field — edit as needed.">
        <TextInput type="number" min={0} value={userCount} onChange={(e) => setUserCount(e.target.value)} />
      </Field>

      <Field label="Send invite (optional)" hint="This is a demo invite record (no email delivery yet).">
        <TextInput
          type="email"
          placeholder="admin@company.com"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          {effectiveSubmitLabel}
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
    </form>
  );
}
