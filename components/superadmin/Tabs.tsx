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
      <div
        className={clsx(
          "inline-flex flex-wrap gap-0.5 rounded-2xl border border-white/80 bg-white/35 p-1 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[12px]"
        )}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={clsx(
              "rounded-xl px-4 py-2 text-sm font-medium transition-all",
              active === t.id
                ? "bg-white/80 text-[#0A89A9] shadow-sm"
                : "text-[#64748B] hover:bg-white/50 hover:text-[#1E293B]"
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
