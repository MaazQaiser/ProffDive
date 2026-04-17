"use client";

import { useMemo, useState } from "react";
import { CheckboxGroup } from "@/components/superadmin/CheckboxGroup";
import { Field, Select, TextInput } from "@/components/superadmin/Field";
import { PLAN_LIMIT_FIELDS } from "@/lib/superadmin/config/limit-keys";
import { PRODUCT_MODULES, defaultModuleAccess, type ProductModuleId } from "@/lib/superadmin/config/product-modules";
import type { BillingType, Plan, PlanStatus } from "@/lib/superadmin/types";

type PlanFormProps = {
  initial?: Plan;
  submitLabel: string;
  onSubmit: (data: Omit<Plan, "id">) => void;
  onCancel?: () => void;
};

export function PlanForm({ initial, submitLabel, onSubmit, onCancel }: PlanFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial ? (initial.priceCents / 100).toFixed(2) : "0");
  const [billingType, setBillingType] = useState<BillingType>(initial?.billingType ?? "monthly");
  const [status, setStatus] = useState<PlanStatus>(initial?.status ?? "active");
  const [moduleAccess, setModuleAccess] = useState<Record<ProductModuleId, boolean>>(
    initial?.moduleAccess ?? defaultModuleAccess()
  );
  const [limits, setLimits] = useState<Record<string, number | string>>(initial?.limits ?? {});
  const [credits, setCredits] = useState(initial?.creditsPerMonth?.toString() ?? "");

  const moduleItems = useMemo(
    () => PRODUCT_MODULES.map((m) => ({ id: m.id, label: m.label })),
    []
  );

  const toggleModule = (id: string, checked: boolean) => {
    setModuleAccess((prev) => ({ ...prev, [id]: checked } as Record<ProductModuleId, boolean>));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceCents = Math.round(parseFloat(price || "0") * 100);
    const lim: Record<string, number | string> = { ...limits };
    PLAN_LIMIT_FIELDS.forEach((f) => {
      if (!moduleAccess[f.moduleId]) delete lim[f.key];
    });
    onSubmit({
      name: name.trim(),
      priceCents,
      billingType,
      status,
      moduleAccess,
      limits: lim,
      creditsPerMonth: credits.trim() ? parseInt(credits, 10) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-10">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Basic info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Plan name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Price (USD)">
            <TextInput type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Field label="Billing type">
            <Select value={billingType} onChange={(e) => setBillingType(e.target.value as BillingType)}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as PlanStatus)}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Module access</h2>
        <CheckboxGroup items={moduleItems} value={moduleAccess} onChange={toggleModule} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Limits per module</h2>
        <p className="text-xs text-[var(--text-2)]">Shown only when the parent module is enabled.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PLAN_LIMIT_FIELDS.map((f) => {
            if (!moduleAccess[f.moduleId]) return null;
            const v = limits[f.key];
            return (
              <Field key={f.key} label={f.label}>
                {f.kind === "number" ? (
                  <TextInput
                    type="number"
                    min={0}
                    value={v === undefined ? "" : String(v)}
                    onChange={(e) =>
                      setLimits((prev) => ({
                        ...prev,
                        [f.key]: e.target.value === "" ? 0 : parseInt(e.target.value, 10),
                      }))
                    }
                  />
                ) : (
                  <Select
                    value={typeof v === "string" ? v : "full"}
                    onChange={(e) => setLimits((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  >
                    {(f.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Credits (optional)</h2>
        <Field label="Credits per month" hint="Platform credits pooled across features.">
          <TextInput type="number" min={0} value={credits} onChange={(e) => setCredits(e.target.value)} />
        </Field>
      </section>

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
