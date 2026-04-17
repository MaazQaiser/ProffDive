"use client";

import { useState } from "react";
import { Field, Select, TextArea, TextInput } from "@/components/superadmin/Field";
import type { Partner, PartnerStatus, PartnerType } from "@/lib/superadmin/types";

type PartnerFormProps = {
  initial?: Partner;
  submitLabel: string;
  onSubmit: (data: Omit<Partner, "id" | "referrals" | "earnings" | "performance">) => void;
  onCancel?: () => void;
};

export function PartnerForm({ initial, submitLabel, onSubmit, onCancel }: PartnerFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<PartnerType>(initial?.type ?? "B2B");
  const [status, setStatus] = useState<PartnerStatus>(initial?.status ?? "active");
  const [revenue, setRevenue] = useState(initial ? (initial.revenueCents / 100).toFixed(2) : "0");
  const [model, setModel] = useState<"percent" | "flat">(initial?.commission.model ?? "percent");
  const [percent, setPercent] = useState(initial?.commission.percent?.toString() ?? "");
  const [amount, setAmount] = useState(
    initial?.commission.amountCents ? (initial.commission.amountCents / 100).toFixed(2) : ""
  );
  const [notes, setNotes] = useState(initial?.commission.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      type,
      status,
      revenueCents: Math.round(parseFloat(revenue || "0") * 100),
      commission: {
        model,
        percent: model === "percent" && percent ? parseFloat(percent) : undefined,
        amountCents:
          model === "flat" && amount ? Math.round(parseFloat(amount) * 100) : undefined,
        notes: notes.trim() || undefined,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <Field label="Partner name">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Type">
        <Select value={type} onChange={(e) => setType(e.target.value as PartnerType)}>
          <option value="B2B">B2B</option>
          <option value="Influencer">Influencer</option>
          <option value="Recruiter">Recruiter</option>
        </Select>
      </Field>
      <Field label="Status">
        <Select value={status} onChange={(e) => setStatus(e.target.value as PartnerStatus)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </Field>
      <Field label="Revenue (USD, cumulative)">
        <TextInput type="number" step="0.01" min="0" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
      </Field>

      <div className="space-y-3 rounded-[var(--r-inner)] border border-[var(--border)] p-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Commission model</h2>
        <Field label="Model">
          <Select value={model} onChange={(e) => setModel(e.target.value as "percent" | "flat")}>
            <option value="percent">Percent</option>
            <option value="flat">Flat amount</option>
          </Select>
        </Field>
        {model === "percent" ? (
          <Field label="Percent">
            <TextInput type="number" step="0.1" min="0" value={percent} onChange={(e) => setPercent(e.target.value)} />
          </Field>
        ) : (
          <Field label="Amount (USD)">
            <TextInput type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
        )}
        <Field label="Notes">
          <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </div>

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
    </form>
  );
}
