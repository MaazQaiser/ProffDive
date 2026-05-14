import clsx from "clsx";
import { SUPER_GLASS_CARD, SUPER_GLASS_INSET } from "@/components/superadmin/superadmin-glass";

type SuperAdminPanelProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Glass panel for charts and section blocks — matches KPI / report card surfaces.
 */
export function SuperAdminPanel({ title, description, children, className }: SuperAdminPanelProps) {
  return (
    <div className={clsx("relative overflow-hidden p-4 md:p-5", SUPER_GLASS_CARD, className)}>
      <span aria-hidden className={SUPER_GLASS_INSET} />
      <div className="relative z-[1]">
        <h2 className={clsx("text-sm font-semibold text-[#1E293B]", description ? "mb-1" : "mb-4")}>{title}</h2>
        {description ? <p className="mb-4 text-xs text-[#64748B]">{description}</p> : null}
        {children}
      </div>
    </div>
  );
}
