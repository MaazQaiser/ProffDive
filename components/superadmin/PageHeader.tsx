import Link from "next/link";
import clsx from "clsx";

export function PageHeader({
  title,
  /** When set, renders `title` in brand teal, then " — {subtitle}" in slate (report-style). */
  subtitle,
  description,
  actions,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={clsx("mb-8 flex flex-col gap-4 pt-6 sm:mb-10 sm:flex-row sm:items-start sm:justify-between")}>
      <div>
        <h1 className="text-[24px] font-medium leading-snug tracking-tight md:text-[28px]">
          {subtitle ? (
            <>
              <span className="text-[#0A89A9]">{title}</span>
              <span className="text-[#334155]"> — {subtitle}</span>
            </>
          ) : (
            <span className="text-[#1E293B]">{title}</span>
          )}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#64748B]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
    >
      <span aria-hidden>←</span> {children}
    </Link>
  );
}
