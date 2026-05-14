import clsx from "clsx";
import { SUPER_GLASS_CARD_MD, SUPER_GLASS_INSET } from "@/components/superadmin/superadmin-glass";

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
        "relative overflow-hidden p-4 md:p-5",
        SUPER_GLASS_CARD_MD,
        className
      )}
    >
      <span aria-hidden className={SUPER_GLASS_INSET} />
      <div className="relative z-[1]">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748B]">{title}</p>
      <p className="mt-1.5 text-[28px] font-semibold tabular-nums leading-none tracking-tight text-[#1E293B] md:text-[30px]">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[#64748B]">{hint}</p>}
      {delta && (
        <p
          className={clsx(
            "mt-2 text-xs font-medium",
            delta.positive === false ? "text-[#DC2626]" : "text-[#059669]"
          )}
        >
          {delta.label}
        </p>
      )}
      </div>
    </div>
  );
}
