"use client";

import Image from "next/image";
import Link from "next/link";
import { Urbanist } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { SUPERADMIN_NAV } from "@/lib/superadmin/config/navigation";
import { SUPERADMIN_SESSION_STORAGE_KEY } from "@/lib/superadmin/admin-session-key";
import { SUPER_GLASS_INSET, SUPER_GLASS_PANEL, SUPER_TEAL } from "@/components/superadmin/superadmin-glass";

const urbanist = Urbanist({ subsets: ["latin"], display: "swap" });

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();

  return (
    <div
      className={clsx(
        urbanist.className,
        "relative flex min-h-screen overflow-x-hidden text-[#1E293B] antialiased"
      )}
    >
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <Image
          src="/figma-dashboard/insphere-saas-page-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_20%]"
        />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(250,254,255,0.82) 0%, rgba(239,248,252,0.78) 55%, rgba(230,243,251,0.88) 100%)",
        }}
      />

      <div className="relative z-[2] flex min-h-screen w-full">
        <aside
          className={clsx(
            "flex h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-white/60",
            SUPER_GLASS_PANEL,
            "bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.32)_100%)]"
          )}
        >
          <span aria-hidden className={clsx(SUPER_GLASS_INSET, "rounded-none")} />
          <div className="relative z-[1] flex h-14 shrink-0 items-center border-b border-white/60 px-4">
            <Link href="/superadmin/overview" className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-bold text-white shadow-sm ring-2 ring-white/90"
                style={{ background: `linear-gradient(135deg, ${SUPER_TEAL}, #006785)` }}
              >
                A
              </span>
              <span className="text-[16px] font-medium tracking-[-0.4px] text-[#0f172a]">ProofDive</span>
              <span
                className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ color: SUPER_TEAL, background: "rgba(10,137,169,0.10)" }}
              >
                Admin
              </span>
            </Link>
          </div>
          <nav className="relative z-[1] flex flex-1 flex-col gap-0.5 p-2.5">
            {SUPERADMIN_NAV.map(({ href, label, Icon }) => {
              const active = path === href || (href !== "/superadmin/overview" && path.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] transition-all",
                    active
                      ? "border border-white/80 bg-white/50 font-semibold text-[#0A89A9] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                      : "text-[#475569] hover:bg-white/40 hover:text-[#0f172a]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="relative z-[1] border-t border-white/55 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] leading-tight text-[#64748B]">Config-driven · local persistence</span>
              <button
                type="button"
                className="text-[10px] font-medium text-[#0A89A9] transition-opacity hover:opacity-80"
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
          <header
            className={clsx(
              "sticky top-0 z-10 flex h-14 items-center border-b border-white/70 px-5 backdrop-blur-[21px] md:px-8",
              "bg-[linear-gradient(90deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.38)_100%)]"
            )}
          >
            <div className="flex w-full max-w-[1600px] items-center gap-2">
              <h2 className="text-[15px] font-medium text-[#334155]">Administration</h2>
            </div>
          </header>
          <main className="relative z-[1] min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] px-5 pb-10 pt-0 md:px-8 lg:px-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
