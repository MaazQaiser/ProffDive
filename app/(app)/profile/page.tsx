"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Urbanist } from "next/font/google";
import { ArrowUpRight, ChevronRight, Pencil, Sparkles } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { readReports } from "@/lib/report-store";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const glassCard =
  "relative overflow-hidden rounded-[24px] border border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

function CardShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={glassCard}>
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
        <h2 className="text-[16px] font-medium text-[#475569]">{title}</h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">{label}</div>
      <div
        className={[
          "mt-1 text-[14px] leading-snug",
          muted ? "text-[#94A3B8] italic" : "text-[#1E293B]",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function UsageLimitCard() {
  const now = Date.now();
  const windowDays = 30;
  const limit = 12; // prototype limit for "AI insights" in a rolling 30-day window

  const used = useMemo(() => {
    try {
      const reports = readReports();
      const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
      return reports.filter((r) => {
        const t = Date.parse(r.createdAt || "");
        if (Number.isNaN(t)) return false;
        return t >= cutoff;
      }).length;
    } catch {
      return 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.min(100, Math.max(0, Math.round((used / Math.max(1, limit)) * 100)));
  const over = used > limit;

  return (
    <CardShell
      title="Usage limit"
      action={
        <span className="inline-flex items-center gap-1 rounded-full border border-white/90 bg-white/40 px-3 py-1.5 text-[11px] font-semibold text-[#0A89A9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[21px]">
          <Sparkles size={14} aria-hidden />
          AI insights
        </span>
      }
    >
      <div className="px-5 py-5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#1E293B]">
              {used}/{limit} used
            </p>
            <p className="mt-1 text-[12px] text-[#64748B]">Rolling {windowDays}-day window</p>
          </div>
          <p className={["text-[12px] font-semibold", over ? "text-[#B91C1C]" : "text-[#0A89A9]"].join(" ")}>
            {over ? "Limit exceeded" : `${pct}%`}
          </p>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200/90">
          <div
            className={["h-full rounded-full transition-[width] duration-300", over ? "bg-[#EF4444]" : "bg-[#0A89A9]"].join(
              " "
            )}
            style={{ width: `${Math.min(100, pct)}%` }}
            aria-hidden
          />
        </div>

        <p className="mt-3 text-[12px] leading-snug text-[#64748B]">
          We count generated feedback reports toward this limit. Upgrade limits will be wired once billing lands.
        </p>
      </div>
    </CardShell>
  );
}

export default function ProfilePage() {
  const { user, isLoaded, resetUser } = useUser();

  const initial = useMemo(() => {
    const f = (user.name || "P").trim().charAt(0);
    return f ? f.toUpperCase() : "P";
  }, [user.name]);

  const displayName = useMemo(() => {
    const raw = (user.name || "").trim();
    if (!raw) return "Your profile";
    return raw.split(/\s+/).join(" ");
  }, [user.name]);

  const subtitle = useMemo(() => {
    const career = (user.career || "").trim();
    const role = (user.targetRole || user.role || "").trim();
    const bits = [career, role].filter(Boolean);
    return bits.length ? bits.join(" · ") : "Interview prep";
  }, [user.career, user.role, user.targetRole]);

  const memberSince = useMemo(() => {
    const iso = (user.createdAt || "").trim();
    const t = Date.parse(iso);
    if (!iso || Number.isNaN(t)) return "—";
    return new Date(t).toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [user.createdAt]);

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-x-hidden pb-20`}>
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6">
        <div
          className="pointer-events-none invisible absolute left-[-251px] top-[66px] z-[1] h-[1127px] w-[1127px] opacity-45"
          aria-hidden
        >
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        <section className="relative z-[1] flex w-full flex-col items-center gap-6 px-8 py-3">
          <div className="flex w-full max-w-[920px] flex-col items-center pt-3">
            <h1 className="text-center text-[34px] font-normal leading-normal text-[#334155]">
              <span className="text-[#334155]">Your</span> <span className="text-[#0A89A9]">profile</span>
            </h1>
            <p className="mt-2 text-center text-[14px] leading-relaxed text-[#64748B]">
              Keep your role and details up to date — it helps tailor trainings, storyboards, and mock feedback.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[1100px]">
            <section className={`${glassCard} p-5 sm:p-6`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0087A8] to-[#006785] text-[16px] font-bold text-white shadow-sm ring-2 ring-white">
                      {initial}
                    </span>
                    <button
                      type="button"
                      aria-label="Edit avatar"
                      className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/90 bg-white/70 text-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-[14px] transition-colors hover:bg-white"
                    >
                      <Pencil size={14} aria-hidden />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[18px] font-semibold text-[#1E293B]">
                      {isLoaded ? displayName : "Loading…"}
                    </p>
                    <p className="mt-1 truncate text-[13px] text-[#64748B]">{isLoaded ? subtitle : " "}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white/50 px-4 py-2 text-[13px] font-semibold text-[#0A89A9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[21px] transition-colors hover:border-[#94A3B8] hover:bg-white/70"
                  >
                    Edit profile
                    <ArrowUpRight size={14} aria-hidden />
                  </button>
                </div>
              </div>
            </section>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="flex min-w-0 flex-col gap-4">
                <CardShell
                  title="Personal information"
                  action={
                    <button
                      type="button"
                      className="text-[12px] font-semibold text-[#0A89A9] transition-colors hover:text-[#088299]"
                    >
                      Edit
                    </button>
                  }
                >
                  <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
                    <Field label="Full name" value={isLoaded ? (user.name?.trim() || "—") : "Loading…"} />
                    <Field label="Email" value={isLoaded ? (user.email?.trim() || "—") : " "} muted={!user.email?.trim()} />
                    <Field
                      label="Career stage"
                      value={isLoaded ? ((user.career || "").trim() || "—") : " "}
                      muted={!((user.career || "").trim())}
                    />
                    <Field label="Target role" value={isLoaded ? ((user.targetRole || user.role || "").trim() || "—") : " "} muted={!((user.targetRole || user.role || "").trim())} />
                    <Field label="Industry" value={isLoaded ? ((user.industry || "").trim() || "—") : " "} muted={!((user.industry || "").trim())} />
                    <Field label="Member since" value={isLoaded ? memberSince : " "} muted={memberSince === "—"} />
                  </div>
                </CardShell>

                <CardShell
                  title="Preferences"
                  action={
                    <button
                      type="button"
                      className="text-[12px] font-semibold text-[#0A89A9] transition-colors hover:text-[#088299]"
                    >
                      Manage
                    </button>
                  }
                >
                  <div className="divide-y divide-slate-200/70">
                    {(
                      [
                        { label: "Password", sub: "Change your password", value: "" },
                        { label: "Notifications", sub: "Practice reminders and score updates", value: "On" },
                        { label: "Language", sub: "Interface and interview language", value: "English" },
                        { label: "Data & privacy", sub: "Manage your data and delete your account", value: "" },
                      ] as const
                    ).map((row) => (
                      <button
                        key={row.label}
                        type="button"
                        className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/30"
                      >
                        <span className="min-w-0">
                          <span className="block text-[14px] font-medium text-[#1E293B]">{row.label}</span>
                          <span className="mt-0.5 block text-[12px] text-[#64748B]">{row.sub}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-[#94A3B8]">
                          {row.value ? <span className="text-[12px] font-medium text-[#64748B]">{row.value}</span> : null}
                          <ChevronRight size={18} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </CardShell>
              </div>

              <aside className="flex min-w-0 flex-col gap-4">
                <UsageLimitCard />

                <CardShell title="Account">
                  <div className="px-5 py-5">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Status</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">Active</p>
                    <p className="mt-2 text-[12px] text-[#64748B]">
                      This is a prototype account stored locally in your browser for now.
                    </p>

                    <button
                      type="button"
                      onClick={resetUser}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-[#FCA5A5] bg-white/40 px-4 py-2.5 text-[13px] font-semibold text-[#B91C1C] shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[21px] transition-colors hover:bg-red-50/60"
                    >
                      Sign out
                    </button>
                  </div>
                </CardShell>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
