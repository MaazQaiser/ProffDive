"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Urbanist } from "next/font/google";
import { ClipboardList, GraduationCap, Home, Mic } from "lucide-react";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import { JourneyController } from "@/components/guided-journey/JourneyController";
import { readDemoPreset, seedFirstTime, seedReturningLight } from "@/lib/demo";
import { useUser } from "@/lib/user-context";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

// Shared glass token used by all page cards
export const G: React.CSSProperties = {
  background: "rgba(255,255,255,0.52)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 20,
  boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
};

const STROKE = 1.5;
const NAV_ICON = 14;

const MAIN_NAV = [
  { label: "Home", href: "/dashboard", Icon: Home },
  { label: "Training", href: "/trainings", Icon: GraduationCap },
  { label: "Storyboard", href: "/storyboard", Icon: ClipboardList },
  { label: "Practice", href: "/mock", Icon: Mic },
] as const;

function TopNav() {
  const path = usePathname();
  const { user, isLoaded } = useUser();

  const initial = useMemo(() => {
    const f = (user.name ?? "P").trim().charAt(0);
    return f ? f.toUpperCase() : "P";
  }, [user.name]);

  const displayName = useMemo(() => {
    const raw = (user.name ?? "").trim();
    if (!raw) return "Your workspace";
    return raw.split(/\s+/).join(" ");
  }, [user.name]);

  const displayTitle = useMemo(() => {
    return (user.targetRole || user.role || "").trim() || "Interview prep";
  }, [user.role, user.targetRole]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return path === "/dashboard";
    return path === href || path.startsWith(`${href}/`);
  };

  return (
    <header className="fixed top-0 z-[100] w-full border-b border-transparent bg-transparent">
      <div
        className={`${urbanist.className} mx-auto flex h-14 w-full max-w-[1600px] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-5 lg:px-10`}
      >
        <div className="flex min-w-0 shrink-0 items-center">
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0087A8] to-[#006785] text-[12px] font-bold text-white shadow-sm ring-2 ring-white">
              {initial}
            </span>
            <span className="text-[18px] font-normal tracking-[-0.45px] text-[#1f1f1f]">
              ProofDive
            </span>
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-[2px] [&::-webkit-scrollbar]:hidden">
          {MAIN_NAV.map(({ label, href, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "relative flex shrink-0 items-center gap-3 overflow-hidden rounded-[80px] border-[0.5px] border-white px-4 py-2.5 text-[14px] font-medium leading-[19.5px] text-[#0f0f0f] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.12)] transition-[box-shadow,transform] hover:shadow-[0px_6px_18px_0px_rgba(0,0,0,0.14)]"
                    : "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-1.5 text-[#0f0f0f] transition-colors hover:bg-white/40"
                }
              >
                {active ? (
                  <>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[80px] backdrop-blur-[21px]"
                      style={{
                        backgroundImage:
                          "linear-gradient(115.26deg, rgba(255, 255, 255, 0.4) 39.99%, rgba(190, 239, 251, 0.4) 93.78%)",
                      }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-[-0.5px] rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]"
                    />
                  </>
                ) : null}
                <Icon
                  size={NAV_ICON}
                  strokeWidth={STROKE}
                  className={`relative z-[1] shrink-0 ${active ? "" : "opacity-90"}`}
                  aria-hidden
                />
                <span className={`relative z-[1] whitespace-nowrap ${active ? "" : "text-[13px]"}`}>{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-3">
          <div className="hidden min-w-0 max-w-[10rem] flex-col items-end gap-0.5 text-right leading-none md:flex lg:max-w-[12rem]">
            <span className="truncate text-[12px] font-normal text-[#1e293b]">
              {!isLoaded ? "…" : displayName}
            </span>
            <span className="truncate text-[10px] font-normal text-[#94a3b8]">{displayTitle}</span>
          </div>

          <Link
            href="/profile"
            className="relative size-8 shrink-0 overflow-hidden rounded-full border border-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] ring-1 ring-slate-200/60 transition hover:ring-slate-300"
            aria-label="Open profile"
          >
            <img src="/avatar.png?v=2" alt="" className="h-full w-full object-cover" width={32} height={32} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey) return;
      if (e.key.toLowerCase() !== "d") return;
      e.preventDefault();

      const current = readDemoPreset();
      if (current === "returning-light") {
        seedFirstTime();
      } else {
        seedReturningLight();
      }

      window.location.assign("/login");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Show a subtle loading cue immediately on internal navigation clicks.
  useEffect(() => {
    if (reduceMotion) return;

    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // left click only
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as Element | null;
      const a = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;

      const href = a.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;

      // Ignore external links.
      let url: URL;
      try {
        url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
      } catch {
        return;
      }

      const next = `${url.pathname}${url.search}${url.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next === current) return;

      // Take over navigation so we can use View Transitions when available.
      e.preventDefault();
      setIsNavigating(true);

      const maybeStartViewTransition = (
        document as unknown as { startViewTransition?: (cb: () => void) => void }
      ).startViewTransition;
      if (typeof maybeStartViewTransition === "function") {
        // `startViewTransition` must be invoked with `document` as `this`.
        maybeStartViewTransition.call(document, () => router.push(next));
      } else {
        router.push(next);
      }
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [reduceMotion, router]);

  // Catch back/forward so the top bar is consistent.
  useEffect(() => {
    if (reduceMotion) return;
    if (typeof window === "undefined") return;

    // Schedule the update to avoid running during insertion effects.
    const mark = () => window.setTimeout(() => setIsNavigating(true), 0);
    window.addEventListener("popstate", mark);

    return () => {
      window.removeEventListener("popstate", mark);
    };
  }, [reduceMotion]);

  // When the route changes, keep the loading cue briefly to avoid "flash" feel.
  useEffect(() => {
    if (reduceMotion) return;

    if (!isNavigating) return;
    const t = window.setTimeout(() => setIsNavigating(false), 260);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
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
      <div className="relative z-[2] flex min-h-screen flex-col">
        <div
          aria-hidden
          className={[
            "route-topbar",
            isNavigating ? "route-topbar--active" : "",
          ].join(" ")}
        />
        {/* Reserve the same height as the fixed nav so in-flow layout starts below it (fixed is out of flow). */}
        <div className="h-14 w-full shrink-0" aria-hidden />
        <TopNav />
        <JourneyController />
        {/* Clip paint to this region so nothing draws back up under the transparent header */}
        <main className="app-main-below-topnav flex-1 min-h-0 selection:bg-[#0087A8]/10 selection:text-[#0087A8]">
          {children}
        </main>
      </div>
    </div>
  );
}
