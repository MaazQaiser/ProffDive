"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { REPORTS_PAGES } from "@/lib/superadmin/config/reports-pages";

export function ReportsSubnav() {
  const path = usePathname();

  return (
    <div
      className="mb-8 flex flex-wrap gap-0.5 rounded-2xl border border-white/80 bg-white/35 p-1 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[12px]"
      role="navigation"
      aria-label="Report views"
    >
      {REPORTS_PAGES.map((p) => {
        const active = path === p.href || path.startsWith(`${p.href}/`);
        return (
          <Link
            key={p.slug}
            href={p.href}
            className={clsx(
              "rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all",
              active
                ? "bg-white/85 text-[#0A89A9] shadow-sm"
                : "text-[#64748B] hover:bg-white/50 hover:text-[#1E293B]"
            )}
          >
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}
