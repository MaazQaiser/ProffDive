import clsx from "clsx";

type KpiCardProps = {
  title: string;
  value: string | number;
  hint?: string;
  delta?: { label: string; positive?: boolean };
  className?: string;
};

export function KpiCard({ title, value, hint, delta, className }: KpiCardProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-[var(--glass-shadow)]",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-3)]">{title}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--text-1)]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--text-2)]">{hint}</p>}
      {delta && (
        <p
          className={clsx(
            "mt-2 text-xs font-medium",
            delta.positive === false ? "text-[var(--accent-error)]" : "text-[var(--accent-success)]"
          )}
        >
          {delta.label}
        </p>
      )}
    </div>
  );
}
