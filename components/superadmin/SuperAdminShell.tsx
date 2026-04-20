"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { SUPERADMIN_NAV } from "@/lib/superadmin/config/navigation";
import { SUPERADMIN_SESSION_STORAGE_KEY } from "@/lib/superadmin/admin-session-key";

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)] text-[var(--text-1)]">
      <aside className="flex h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
          <Link href="/superadmin/overview" className="text-sm font-semibold tracking-tight text-[var(--primary)]">
            ProofDive
          </Link>
          <p className="text-xs text-[var(--text-2)]">Super Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {SUPERADMIN_NAV.map(({ href, label, Icon }) => {
            const active = path === href || (href !== "/superadmin/overview" && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-2 rounded-[var(--r-inner)] px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[var(--primary-50)] font-medium text-[var(--primary)]"
                    : "text-[var(--text-2)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-1)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-[var(--text-3)]">Config-driven · local persistence</span>
            <button
              type="button"
              className="text-[10px] font-medium text-[var(--text-2)] hover:text-[var(--text-1)]"
              onClick={() => {
                try {
                  sessionStorage.removeItem(SUPERADMIN_SESSION_STORAGE_KEY);
                } catch {
                  /* ignore */
                }
                router.push("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-12 items-center border-b border-[var(--border)] bg-[var(--bg-surface)]/95 px-6 backdrop-blur-sm">
          <span className="text-sm font-medium text-[var(--text-2)]">Administration</span>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-0">{children}</main>
      </div>
    </div>
  );
}
