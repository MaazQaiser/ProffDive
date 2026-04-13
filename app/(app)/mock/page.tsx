"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Urbanist } from "next/font/google";
import { Clock, Zap, ArrowRight, Target, Mic, Info } from "lucide-react";
import { useUser } from "@/lib/user-context";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const glassCard =
  "relative overflow-hidden rounded-[24px] border-[0.5px] border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

const GRAD = "linear-gradient(103deg, #016E89 0%, #034657 100%)";

// ── Badge ────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const c = score >= 3.5
    ? { dot: "#34D399", text: "#059669", bg: "rgba(52,211,153,0.14)", border: "rgba(5,150,105,0.2)", label: "Ready" }
    : score >= 2.5
    ? { dot: "#FBBF24", text: "#B45309", bg: "rgba(251,191,36,0.14)", border: "rgba(180,83,9,0.18)", label: "Borderline" }
    : { dot: "#F87171", text: "#DC2626", bg: "rgba(248,113,113,0.14)", border: "rgba(220,38,38,0.2)", label: "Not ready" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium leading-none"
      style={{ background: c.bg, borderColor: c.border, color: c.text }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: c.dot }} aria-hidden />
      {c.label}
    </span>
  );
}

// ── Session type options ─────────────────────────────
const SESSION_TYPES = [
  {
    id:"full",
    label:"Full Practice",
    duration:"30 min",
    desc:"All 4 pillars + intro. Complete interview simulation.",
    icon:Mic,
    iconColor: "#0087A8",
    href:"/mock/setup",
  },
  {
    id:"action",
    label:"Quick: Action Pillar",
    duration:"12 min",
    desc:"Focus on your weakest driver. AI-recommended based on your last report.",
    icon:Zap,
    iconColor: "#F59E0B",
    href:"/mock/setup?pillar=action",
    ai:true,
  },
];

// ── Recent sessions ──
// NOTE: Set this array to empty [] to see the Zero State banner and hide the table.
const RECENT_SESSIONS = [
  {
    id:"1", title:"Role-Based Mock", role: "Product Manager", type:"Full Practice",
    date:"Oct 24, 2024", duration:"30 min", qCount:4, score:3.4,
    feedback: "Structured thinking was solid, but action steps felt slightly vague in execution.",
  },
  {
    id:"2", title:"Behavioral Only", role: "Software Engineer", type:"Single Pillar — Action",
    date:"Oct 20, 2024", duration:"12 min", qCount:2, score:4.2,
    feedback: "Excellent concrete examples with clear impact and defined outcomes.",
  },
];

export default function PracticePage() {
  const router = useRouter();
  const { user } = useUser();
  const hasSessions = RECENT_SESSIONS.length > 0;
  const firstName = useMemo(() => user.name?.trim().split(" ")[0] || "Maaz", [user.name]);

  return (
    <div className={`${urbanist.className} max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 py-12 space-y-12`}>

      {/* ── Page header — dashboard hero pattern ── */}
      <section className="relative z-[1] mb-2 flex flex-col items-center animate-in slide-in-from-bottom-2 fade-in duration-700">
        <div className="flex flex-col items-center pt-1">
          <h1 className="max-w-[min(100%,920px)] text-center text-[34px] font-normal leading-normal">
            <span className="text-[#0A89A9]">{firstName},</span>
            <span className="text-[#334155]"> this is where </span>
            <span className="text-[#0A89A9]">prep becomes performance</span>
            <span className="text-[#334155]">
              {" "}
              — practice and review your sessions, all in one place.
            </span>
          </h1>
        </div>
      </section>

      {/* ── First visit CTA (no AI recommendation rail) ── */}
      {!hasSessions && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-1000">
          <div style={{ background: GRAD, borderRadius: 24 }} className="relative overflow-hidden p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-col items-center text-center">
            <div className="relative z-10">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Target size={24} className="text-white" />
              </div>
              <h2 className="mb-2 text-[22px] font-medium leading-tight text-white">Ready for your first practice session?</h2>
              <p className="mx-auto mb-8 max-w-md text-[16px] leading-relaxed text-[#CBD5E1]/90">
                Take a full mock interview or focus on a specific pillar. You&apos;ll get detailed feedback and a personalized action plan.
              </p>
              <Link
                href="/mock/setup"
                className="mx-auto inline-flex h-10 items-center justify-center rounded-lg bg-white px-6 text-[13px] font-medium text-[#0F172A] shadow-sm transition-colors hover:bg-[#F8FAFC]"
              >
                Start my first interview
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Start a session — dashboard glass cards ── */}
      <div className="animate-in slide-in-from-bottom-5 fade-in duration-1000 space-y-4">
        <div>
          <h2 className="text-[24px] font-medium text-[#1E293B]">Start a session</h2>
          <p className="mt-1 text-[12px] font-normal text-[#475569]">Full mock or a focused pillar run.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {SESSION_TYPES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                role="link"
                tabIndex={0}
                aria-label={`${s.label}: start interview`}
                onClick={() => router.push(s.href)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(s.href);
                  }
                }}
                data-journey-id={s.id === "full" ? "mock-card" : undefined}
                className={`${glassCard} group flex cursor-pointer flex-col items-start p-6 transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A89A9]/30 md:p-8`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]"
                />
                <div className="relative z-[1] flex w-full flex-col gap-5">
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-slate-200/80 bg-white/70 shadow-sm transition-transform group-hover:scale-[1.02]">
                      <Icon size={20} style={{ color: s.iconColor }} strokeWidth={2} />
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {s.ai ? (
                        <span className="group/tooltip relative inline-flex items-center gap-1 rounded-full border border-[#F59E0B]/25 bg-[linear-gradient(90.31deg,rgba(255,233,197,0.45)_0%,rgba(255,242,221,0.4)_99.92%)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#B45309]">
                          Suggested
                          <Info size={12} className="opacity-70 group-hover/tooltip:opacity-100" />
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-[min(240px,calc(100vw-2rem))] translate-y-1 rounded-[12px] border border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.98)_99.92%)] px-3 py-2 text-left text-[11px] font-normal normal-case tracking-normal text-[#475569] opacity-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-[12px] transition-all group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100"
                          >
                            Based on your last session, we’re working on the <span className="font-semibold text-[#1E293B]">Action</span> pillar.
                          </span>
                        </span>
                      ) : null}
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/60 px-3 py-1 text-[12px] font-medium text-[#475569]">
                        <Clock size={12} className="text-[#64748B]" />
                        {s.duration}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[18px] font-medium leading-snug text-[#1E293B]">{s.label}</h3>
                    <p className="mt-2 text-[13px] font-normal leading-relaxed text-[#64748B]">{s.desc}</p>
                  </div>

                  <Link
                    href={s.href}
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-[1] inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
                  >
                    Start interview
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Past Sessions — dashboard glass + Urbanist (page root) ── */}
      {hasSessions && (
        <div className="animate-in slide-in-from-bottom-6 fade-in duration-1000 space-y-5">
          <div className="space-y-1">
            <h2 className="text-[26px] font-medium leading-tight tracking-tight text-[#1E293B]">Past mock interviews</h2>
            <p className="max-w-xl text-[13px] font-normal leading-relaxed text-[#64748B]">
              Your recent runs by role, how long they took, and where you landed.
            </p>
          </div>

          <div className={`${glassCard} overflow-hidden border-[0.5px]`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-white/35">
                    <th className="px-5 py-3.5 text-left text-[12px] font-medium text-[#64748B]">Role</th>
                    <th className="px-5 py-3.5 text-left text-[12px] font-medium text-[#64748B]">Duration</th>
                    <th className="px-5 py-3.5 text-left text-[12px] font-medium text-[#64748B]">Rating</th>
                    <th className="px-5 py-3.5 text-left text-[12px] font-medium text-[#64748B]">Status</th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      <span className="sr-only">Report</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {RECENT_SESSIONS.map((session) => (
                    <tr key={session.id} className="transition-colors hover:bg-white/45">
                      <td className="px-5 py-4 align-top">
                        <p className="text-[15px] font-semibold leading-snug text-[#1E293B]">{session.role}</p>
                        <p className="mt-0.5 text-[12px] font-normal text-[#94A3B8]">{session.type}</p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-1.5 pt-0.5 text-[13px] font-normal text-[#475569]">
                          <Clock size={14} className="shrink-0 text-[#94A3B8]" strokeWidth={2} />
                          {session.duration}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className="inline-block pt-0.5 text-[20px] font-bold tabular-nums leading-none text-[#0F172A]">
                          {session.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="pt-1">
                          <ScoreBadge score={session.score} />
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center justify-end pt-0.5">
                          <Link
                            href={`/report/${session.id}`}
                            className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#0A89A9]/25 bg-white/40 px-3.5 text-[12px] font-medium text-[#0A89A9] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm transition-colors hover:border-[#0A89A9]/40 hover:bg-white/70"
                          >
                            View details
                            <ArrowRight size={14} strokeWidth={2.5} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
