"use client";

import clsx from "clsx";

export type TabItem = { id: string; label: string };

type TabsProps = {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
};

export function Tabs({ tabs, active, onChange, children }: TabsProps) {
  return (
    <div>
      <div className="flex gap-1 border-b border-[var(--border)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={clsx(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              active === t.id
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}
