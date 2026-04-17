"use client";

import clsx from "clsx";

type Item = { id: string; label: string };

type CheckboxGroupProps = {
  items: readonly Item[];
  value: Record<string, boolean>;
  onChange: (id: string, checked: boolean) => void;
};

export function CheckboxGroup({ items, value, onChange }: CheckboxGroupProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <label
          key={item.id}
          className={clsx(
            "flex cursor-pointer items-center gap-2 rounded-[var(--r-inner)] border border-[var(--border)] px-3 py-2",
            value[item.id] ? "border-[var(--primary)] bg-[var(--primary-50)]" : "bg-[var(--bg-surface)]"
          )}
        >
          <input
            type="checkbox"
            checked={!!value[item.id]}
            onChange={(e) => onChange(item.id, e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border-strong)] text-[var(--primary)]"
          />
          <span className="text-sm">{item.label}</span>
        </label>
      ))}
    </div>
  );
}
