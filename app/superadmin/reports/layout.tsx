import Link from "next/link";
import clsx from "clsx";
import { REPORTS_PAGES } from "@/lib/superadmin/config/reports-pages";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
        {REPORTS_PAGES.map((p) => (
          <Link
            key={p.slug}
            href={p.href}
            className={clsx(
              "rounded-full border border-[var(--border)] px-3 py-1.5 text-sm",
              "hover:bg-[var(--bg-subtle)]"
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
