"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Urbanist } from "next/font/google";
import { useParams } from "next/navigation";
import {
  Brain,
  Zap,
  Users,
  Target,
  Play,
  BookOpen,
  Timer,
  ChevronRight,
  ArrowLeft,
  Mic,
  Video,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import { ChipStatic } from "@/components/Chip";
import {
  MOCK_SESSION_META,
  MOCK_DRIVERS,
  MOCK_QUESTIONS,
  MOCK_TRANSCRIPT,
  MOCK_SUMMARY_CHIPS,
  REC_TRAINING_FEATURED,
  SUGGESTED_TRAINING_SLUGS,
  COMPETENCY_DETAILS,
  MOCK_SESSION_AI_COACHING,
  getOverallScore,
  focusFacetLabelForQuestionIndex,
  mockSubSkillScore,
  type ReportQuestion,
  type DriverDef,
} from "@/lib/mock-report-data";
import { TRAININGS, PILLAR_COLORS, type Pillar } from "@/lib/trainings-data";
import { ProofyChatDock } from "@/components/proofy/ProofyChatDock";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const glassPanel =
  "relative overflow-hidden border-[0.5px] border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

const glassCard = `${glassPanel} rounded-[24px]`;
const glassCardMd = `${glassPanel} rounded-[16px]`;
const glassCardLg = `${glassPanel} rounded-[20px]`;

const cardInset =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]";

const stickyBar =
  "relative overflow-hidden rounded-[16px] border-[0.5px] border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.94)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-[21px]";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const IB = "1px solid #E2E8F0";
const TEAL = "#0A89A9";

function stripOuterQuotes(s: string): string {
  const t = s.trim();
  if (
    t.length >= 2 &&
    ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("\u201c") && t.endsWith("\u201d")))
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

const DRIVER_ICONS = {
  thinking: Brain,
  action: Zap,
  people: Users,
  mastery: Target,
} as const;

function getScoreColor(score: number): string {
  if (score < 2.5) return "#EF4444";
  if (score < 3.5) return "#D97706";
  return "#059669";
}

function StatusBadge({ score }: { score: number }) {
  const isReady = score >= 3.5;
  if (isReady) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-[14px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        Ready
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[14px] font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
      Borderline
    </span>
  );
}

function stickyBadge(score: number) {
  if (score >= 3.5) return { dot: "#34D399", bg: "rgba(52,211,153,0.12)", text: "#059669", label: "Ready" };
  if (score >= 2.5) return { dot: "#FBBF24", bg: "rgba(251,191,36,0.12)", text: "#92400E", label: "Borderline" };
  return { dot: "#F87171", bg: "rgba(248,113,113,0.12)", text: "#DC2626", label: "Not Ready" };
}

const tagBase =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium tracking-[0px] shrink-0";

const focusFacetTagClass =
  "inline-flex max-w-[min(100%,17rem)] shrink-0 items-center gap-1.5 truncate rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-1 text-[14px] font-semibold tracking-[0px] text-[#475569] normal-case backdrop-blur-sm";

function QuestionRow({ q, qi }: { q: ReportQuestion; qi: number }) {
  const [open, setOpen] = useState(false);
  const sc = getScoreColor(q.score);
  const focusFacetLabel = focusFacetLabelForQuestionIndex(qi);
  const answerText = (q.answer ?? q.youSaid)?.trim() ?? "";

  return (
    <div
      className={`${glassCardMd} group relative mb-4 overflow-hidden transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]`}
    >
      <span aria-hidden className={cardInset} />
      <div className="relative z-[1] space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={focusFacetTagClass} title={focusFacetLabel}>
            {focusFacetLabel}
          </span>
          <span
            className={`${tagBase} border-slate-200/80 bg-white/90 text-[#1E293B]`}
            style={{ boxShadow: `inset 0 0 0 1px ${q.driverAccent}33` }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 99, background: q.driverAccent }} />
            {q.driver}
          </span>
          <span className={`${tagBase} border-slate-200/70 bg-white/50 text-[#475569]`}>
            <Timer size={12} className="text-[#475569]/50" />
            {q.taken}
          </span>
          <span className={`${tagBase} border-slate-200/80 bg-white/90 tabular-nums`} style={{ color: sc }}>
            {q.score}
            <span className="text-[#475569]/35 font-sans">/5</span>
          </span>
          <StatusBadge score={q.score} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="-mx-1 flex w-full items-start gap-3 rounded-xl px-1 py-1 text-left transition-colors hover:bg-white/50"
          aria-expanded={open}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-slate-100/80 text-[12px] font-bold text-[#94A3B8]">
            {qi + 1}
          </span>
          <p className="min-w-0 flex-1 pr-2 text-[16px] font-semibold leading-snug text-[#1E293B]">&ldquo;{q.q}&rdquo;</p>
          <ChevronDown
            size={20}
            className={`shrink-0 text-[#475569]/40 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      {open ? (
        <div className="space-y-8 border-t border-[#E2E8F0] bg-white/35 px-5 py-6">
          {answerText ? (
            <div>
              <p className="text-[12px] tracking-[0.08em] font-bold text-[#475569]/40 mb-3">Your answer</p>
              <blockquote className="m-0 border-l-[3px] border-slate-200/90 pl-4">
                <p className="text-[15px] leading-[1.65] text-[#334155] font-normal not-italic">{answerText}</p>
              </blockquote>
            </div>
          ) : null}

          <div>
            <p className="text-[12px] tracking-[0.08em] font-bold text-[#475569]/40 mb-4">Areas for improvement</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
              {q.improve.map((imp) => (
                <div key={imp.heading} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-[7px] shrink-0" />
                  <p className="text-[13px] text-[#475569] leading-relaxed">
                    <strong className="text-[#1E293B]">{imp.heading}</strong> — {imp.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DriverPillarCard({ d }: { d: DriverDef }) {
  const [open, setOpen] = useState(false);
  const Icon = DRIVER_ICONS[d.id];
  const sc = getScoreColor(d.score);
  const det = COMPETENCY_DETAILS[d.id];

  return (
    <div
      className={`${glassCardMd} relative flex flex-col gap-4 p-6 transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]`}
    >
      <span aria-hidden className={cardInset} />
      <div className="relative z-[1] flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `${d.accent}10` }}>
          <Icon size={20} style={{ color: d.accent }} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-medium tabular-nums leading-none tracking-normal" style={{ color: sc }}>
            {d.score.toFixed(1)}
          </span>
          <span className="text-[16px] font-medium text-[#475569]/30">/5</span>
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-[16px] font-medium text-[#1E293B]">{d.title}</h3>
        <p className="text-[11px] text-[#475569]/55 font-semibold tracking-wide">
          {det.pillar} · {det.subtitle}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <StatusBadge score={d.score} />
      </div>

      <div className="h-[6px] w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${d.pct}%`, background: d.accent }} />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white/50 text-[12px] font-semibold text-[#0A89A9] transition-colors hover:bg-white/80"
        aria-expanded={open}
      >
        {open ? "Hide breakdown" : "See the breakdown"}
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="-mb-1 space-y-3 border-t border-[#E2E8F0] pt-4">
          <p className="text-[11px] font-bold tracking-[0.12em] text-[#475569]/45">Competency breakdown</p>
          <ul className="space-y-2.5">
            {det.skills.map((s, si) => {
              const sub = mockSubSkillScore(d.score, si);
              const ssc = getScoreColor(sub);
              return (
                <li
                  key={s}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-white/60 px-3 py-2 text-[13px] text-[#475569]"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.accent }} />
                    <span className="font-medium text-[#1E293B]">{s}</span>
                  </span>
                  <span className="font-bold tabular-nums text-[13px] shrink-0" style={{ color: ssc }}>
                    {sub.toFixed(1)}/5
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams<{ id?: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const { user } = useUser();
  const mounted = useIsClient();
  /** Wraps overall score card + driver grid — sticky bar only after this block scrolls past the top nav */
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  const overall = getOverallScore(MOCK_DRIVERS);
  const stickyB = stickyBadge(overall);

  const dynamicSession = {
    ...MOCK_SESSION_META,
    role: mounted && user.role ? user.role : MOCK_SESSION_META.role,
  };

  const summaryBody =
    mounted && user.name
      ? `You demonstrate strong interpersonal ability and execution instinct, but you can sharpen how you quantify outcomes and state individual contribution. Your biggest opportunities are in the Action and Mastery drivers — add specificity and measurable results. Your People driver is a real strength to lead with.`
      : `The candidate demonstrates strong interpersonal ability and execution instinct, but consistently struggles to quantify outcomes and state individual contribution clearly. The biggest gaps are in the Action and Mastery drivers — both lack specificity and measurable results. People driver is a real strength worth leading with.`;

  /** Match AppShell `TopNav` h-14 — show compact bar only once hero (glass + drivers) has scrolled above this line */
  const NAV_HEIGHT = 56;

  useLayoutEffect(() => {
    const el = heroSectionRef.current;
    if (!el || typeof window === "undefined") return;

    const update = () => {
      const bottom = el.getBoundingClientRect().bottom;
      setShowSticky(bottom < NAV_HEIGHT);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const suggestedTrainings = TRAININGS.filter((t) =>
    (SUGGESTED_TRAINING_SLUGS as readonly string[]).includes(t.slug)
  );

  const coachingSpotlight = MOCK_QUESTIONS[MOCK_SESSION_AI_COACHING.questionIndex];
  const coachingAi = coachingSpotlight?.youSaid && coachingSpotlight?.aiSaid ? coachingSpotlight : null;
  const spotlightQuestionNumber = MOCK_SESSION_AI_COACHING.questionIndex + 1;

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-x-hidden`}>
      {/* Fixed bar below app nav (h-14) */}
      <div
        className={`fixed left-0 right-0 z-40 px-6 pt-2 transition-all duration-300 ease-out md:px-8 ${
          showSticky ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        style={{ top: "3.5rem" }}
        aria-hidden={!showSticky}
      >
        <div className="mx-auto max-w-[1440px]">
          <div className={`${stickyBar} border-[0.5px]`}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1] flex flex-wrap items-center gap-4 px-5 py-3 md:gap-6 md:px-6">
            <div className="flex items-end gap-1.5">
              <span className="text-[26px] font-bold tabular-nums text-[#1E293B]">{overall.toFixed(1)}</span>
              <span className="pb-0.5 text-[12px] text-[#64748B]">/5.0</span>
            </div>
            <div className="hidden h-7 w-px bg-[#E2E8F0] sm:block" />
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: stickyB.dot }} />
              <span
                className="rounded-md px-2.5 py-1 text-[12px] font-semibold tracking-wide"
                style={{ background: stickyB.bg, color: stickyB.text }}
              >
                {stickyB.label}
              </span>
            </div>
            <div className="hidden h-7 w-px bg-[#E2E8F0] md:block" />
            <div className="hidden items-center gap-4 text-[11px] text-[#64748B] md:flex">
              <span className="flex items-center gap-1.5">
                <Mic size={11} /> Audio
              </span>
              <span className="flex items-center gap-1.5">
                <Video size={11} /> Video
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3 text-[11px] text-[#64748B]">
              <span>
                {dynamicSession.questionCount} questions · {dynamicSession.duration}
              </span>
              <Link href="#recording" className="font-semibold text-[#0A89A9] hover:opacity-80">
                Recording
              </Link>
            </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6">
        <div
          className="pointer-events-none invisible absolute left-[-251px] top-[66px] z-[1] h-[1127px] w-[1127px] opacity-45"
          aria-hidden
        >
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        <div className="relative z-[1] space-y-10 pb-16 md:space-y-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="space-y-4">
            <Link
              href="/mock"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
            >
              <ArrowLeft size={16} strokeWidth={2} /> Back to sessions
            </Link>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200/80 bg-white/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  V1.2
                </span>
                <span className="text-[12px] text-[#94A3B8]">#{id}</span>
              </div>
              <h1 className="max-w-[min(100%,960px)] text-[28px] font-normal leading-snug tracking-tight text-[#334155] md:text-[34px]">
                <span className="text-[#0A89A9]">Session report</span>
                <span> — analytics &amp; coaching for </span>
                <span className="text-[#0A89A9]">{dynamicSession.role}</span>
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[#64748B]">
                <span>{dynamicSession.interviewName}</span>
                <span className="text-[#CBD5E1]" aria-hidden>
                  ·
                </span>
                <span>{dynamicSession.date}</span>
                <span className="text-[#CBD5E1]" aria-hidden>
                  ·
                </span>
                <span>{dynamicSession.duration}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              className="h-11 rounded-full border border-slate-200/90 bg-white/70 px-6 text-[14px] font-medium text-[#475569] shadow-sm transition-colors hover:bg-white"
            >
              Download PDF
            </button>
            <Link
              href="/mock/setup"
              className="flex h-11 items-center gap-2 rounded-full bg-[#0A89A9] px-8 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(10,137,169,0.25)] transition-opacity hover:opacity-95"
            >
              Retake session <ChevronRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        <div ref={heroSectionRef} className="space-y-8 md:space-y-10">
        <div
          data-journey-id="report-overall"
          className={`${glassCard} relative flex flex-col items-center gap-10 overflow-hidden border-[0.5px] p-8 md:flex-row md:gap-16 md:p-12`}
        >
          <span aria-hidden className={cardInset} />
          <div className="relative z-[1] flex w-full shrink-0 flex-col items-center gap-10 md:flex-row md:gap-16">
          <div className="shrink-0 text-center md:text-left">
            <p
              className="text-[56px] font-medium leading-none tabular-nums tracking-normal md:text-[64px]"
              style={{ color: getScoreColor(overall) }}
            >
              {overall.toFixed(1)}
            </p>
            <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.12em] text-[#64748B]">Out of 5.0</p>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <StatusBadge score={overall} />
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">Overall verdict</span>
            </div>
            <h2 className="max-w-xl text-[22px] font-medium leading-tight text-[#1E293B] md:text-[24px]">
              Strong in People — Action and Mastery are holding your score back.
            </h2>
            <p className="max-w-2xl text-[14px] leading-relaxed text-[#64748B]">
              Your People answers showed real evidence of influence and collaboration. Where you&apos;re losing points is Action — your answers described what happened but not what you specifically decided and why. Fix that and your score moves from 3.4 to 4.0+.
            </p>
          </div>

          <div className="w-full shrink-0 rounded-[16px] border border-[#E2E8F0] bg-white/45 p-6 backdrop-blur-sm md:w-auto">
            <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-[#64748B]">Your profile</p>
            <div className="space-y-4">
              <div>
                <p className="text-[16px] font-semibold text-[#1E293B]">{dynamicSession.role}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {dynamicSession.pillars.map((p) => (
                  <ChipStatic key={p} className="font-bold text-[#475569]">
                    {p}
                  </ChipStatic>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>

        <div data-journey-id="report-pillars" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_DRIVERS.map((d) => (
            <DriverPillarCard key={d.id} d={d} />
          ))}
        </div>

        <div className="flex justify-center">
          <details
            className={`${glassCardMd} group relative w-full max-w-3xl overflow-hidden border-[0.5px] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)] [&>summary::-webkit-details-marker]:hidden`}
          >
            <summary className="relative z-[1] flex h-11 cursor-pointer list-none items-center justify-center gap-2 px-6 text-[13px] font-medium text-[#1E293B] transition-colors hover:bg-white/40">
              <ChevronDown
                size={16}
                className="shrink-0 text-[#0A89A9] transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
              View all competency areas
            </summary>
            <div className="relative z-[1] space-y-5 border-t border-[#E2E8F0] px-5 pb-6 pt-2 md:px-6">
              <p className="text-center text-[12px] text-[#64748B] md:text-left">
                Power dimensions and sub-skills measured in this session — each pillar has an overall score; expand driver cards above for per–sub-skill scores.
              </p>
              {MOCK_DRIVERS.map((d) => {
                const det = COMPETENCY_DETAILS[d.id];
                return (
                  <div key={d.id} className="rounded-[14px] border border-[#E2E8F0] bg-white/55 p-5">
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-[15px] font-semibold text-[#1E293B]">
                        {det.pillar}{" "}
                        <span className="text-[#475569]/60 font-semibold text-[13px]">({det.subtitle})</span>
                      </h3>
                      <span className="text-[14px] font-bold tabular-nums" style={{ color: getScoreColor(d.score) }}>
                        {d.score.toFixed(1)} / 5
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {det.skills.map((s, si) => {
                        const sub = mockSubSkillScore(d.score, si);
                        return (
                          <li key={s} className="text-[13px] text-[#475569] flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="w-1 h-1 rounded-full shrink-0" style={{ background: d.accent }} />
                              {s}
                            </span>
                            <span className="font-bold tabular-nums text-[12px] shrink-0" style={{ color: getScoreColor(sub) }}>
                              {sub.toFixed(1)}/5
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </details>
        </div>
        </div>

        <section data-journey-id="report-summary" className="space-y-6">
          <div>
            <h2 className="text-[24px] font-medium text-[#1E293B]">What Proofy saw in your session</h2>
            <p className="mt-1 text-[12px] text-[#64748B]">Summary of strengths, gaps, and how you showed up.</p>
          </div>
          <div className={`${glassCard} relative space-y-6 border-[0.5px] p-8`}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1] space-y-6">
            <p className="text-[16px] text-[#475569] leading-relaxed">{summaryBody}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#10B981]/10 border border-[#10B981]/20">
                <CheckCircle size={13} className="text-[#10B981] shrink-0" />
                <span className="text-[12px] font-semibold text-[#059669]">
                  {MOCK_SUMMARY_CHIPS.strongest.label} ({MOCK_SUMMARY_CHIPS.strongest.score})
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#F87171]/10 border border-[#F87171]/20">
                <AlertTriangle size={13} className="text-[#F87171] shrink-0" />
                <span className="text-[12px] font-semibold text-[#DC2626]">
                  {MOCK_SUMMARY_CHIPS.gap.label} ({MOCK_SUMMARY_CHIPS.gap.score})
                </span>
              </div>
            </div>
          </div>
          </div>
        </section>

        <div data-journey-id="report-questions" className="pt-4">
          <div className="mb-8">
            <h2 className="text-[24px] font-medium text-[#1E293B]">Your answers — question by question</h2>
            <p className="mt-1 text-[12px] text-[#64748B]">Expand each row for competency analysis and improvements.</p>
          </div>
          <div className="flex flex-col">
            {MOCK_QUESTIONS.map((q, qi) => (
              <QuestionRow key={qi} q={q} qi={qi} />
            ))}
          </div>
        </div>

        <section id="recording" data-journey-id="report-recording" className="scroll-mt-32 space-y-4">
          <div>
            <h2 className="text-[24px] font-medium text-[#1E293B]">Recording &amp; transcript</h2>
            <p className="mt-1 text-[14px] text-[#64748B]">Replay your session and review the full conversation.</p>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_360px]">
            <div className={`${glassCardMd} relative overflow-hidden border-[0.5px]`}>
              <span aria-hidden className={cardInset} />
              <div className="relative z-[1] overflow-hidden rounded-[inherit]">
              <div
                className="relative flex items-center justify-center"
                style={{ aspectRatio: "16/9", background: "var(--bg-gradient)" }}
              >
                <button
                  type="button"
                  className="flex items-center justify-center hover:scale-105 transition-transform"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.15)",
                    border: "2px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <Play size={24} style={{ color: "#FFF", marginLeft: 3 }} />
                </button>
                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-md" style={{ background: "rgba(0,0,0,0.55)" }}>
                  <span className="text-[11px] font-semibold text-white">{dynamicSession.duration}</span>
                </div>
                <div
                  className="absolute bottom-3 left-3 flex items-center justify-center rounded-lg border border-white/15"
                  style={{ width: 80, height: 54, background: "rgba(0,0,0,0.45)" }}
                >
                  <span className="text-[12px] font-semibold text-white/50">You</span>
                </div>
              </div>
              <div style={{ padding: "14px 20px", borderBottom: IB }}>
                <div className="h-1 rounded-full cursor-pointer" style={{ background: "rgba(0,0,0,0.08)" }}>
                  <div className="h-full rounded-full w-[38%]" style={{ background: TEAL }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-[#475569]/40">11:42</span>
                  <span className="text-[12px] text-[#475569]/40">{dynamicSession.duration}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 py-3 px-5">
                <button
                  type="button"
                  className="text-[11px] font-semibold px-4 py-2 rounded-lg border border-black/10 text-[#475569]/70 hover:bg-black/[0.03]"
                >
                  ← 10s
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ background: TEAL }}
                >
                  <Play size={15} style={{ color: "#FFF", marginLeft: 2 }} />
                </button>
                <button
                  type="button"
                  className="text-[11px] font-semibold px-4 py-2 rounded-lg border border-black/10 text-[#475569]/70 hover:bg-black/[0.03]"
                >
                  10s →
                </button>
                <div className="ml-auto">
                  <select
                    className="text-[11px] font-semibold px-3 py-2 rounded-lg border border-black/10 bg-transparent text-[#475569]/70 outline-none"
                    aria-label="Playback speed"
                  >
                    <option>1× speed</option>
                    <option>1.5× speed</option>
                    <option>2× speed</option>
                  </select>
                </div>
              </div>
              </div>
            </div>

            <div
              className={`${glassCardMd} relative flex max-h-[430px] flex-col overflow-hidden border-[0.5px]`}
            >
              <span aria-hidden className={cardInset} />
              <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
              <div className="flex-shrink-0 border-b px-[18px] py-2.5" style={{ borderColor: "#E2E8F0", background: "rgba(255,255,255,0.45)" }}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Full transcript</p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto py-1">
                {MOCK_TRANSCRIPT.map((t, i) => (
                  <div key={i} style={{ padding: "10px 18px", borderBottom: i < MOCK_TRANSCRIPT.length - 1 ? IB : undefined }}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-[12px] font-bold tracking-wide"
                        style={{ color: t.role === "interviewer" ? TEAL : "rgba(15,15,15,0.40)" }}
                      >
                        {t.speaker}
                      </span>
                      <span className="text-[9px] text-[#475569]/40">{t.time}</span>
                      {t.flag && (
                        <span className="text-[12px] font-semibold px-1.5 py-0.5 ml-auto rounded bg-amber-100 text-amber-900">
                          {t.flag}
                        </span>
                      )}
                    </div>
                    <p className={`text-[16px] leading-relaxed ${t.role === "interviewer" ? "text-[#1E293B]" : "text-[#475569]"}`}>
                      {t.text}
                    </p>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="space-y-6 pt-4 scroll-mt-32"
          id="ai-coaching"
          data-journey-id="report-ai-coaching"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#0A89A9]/10 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-[#0A89A9]" />
            </div>
            <div>
              <h2 className="text-[24px] font-medium text-[#1E293B]">How to improve your weakest answer</h2>
              <p className="mt-0.5 text-[14px] text-[#64748B]">
                Delivery, language, and a sharper version of your highest-priority gap answer.
              </p>
            </div>
          </div>

          <div className={`${glassCardLg} relative overflow-hidden border-[0.5px] p-0`}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1] overflow-hidden rounded-[inherit]">
            {coachingAi ? (
              <div className="border-b border-[#E2E8F0]">
                <div className="bg-slate-50/50 px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                    <span
                      className="inline-flex items-center justify-center min-w-[2.75rem] h-9 px-2.5 rounded-[10px] bg-[#0A89A9] text-white text-[13px] font-bold tabular-nums shadow-sm"
                      title={`Question ${spotlightQuestionNumber}`}
                    >
                      Q{spotlightQuestionNumber}
                    </span>
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#475569]"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: coachingAi.driverAccent }}
                        aria-hidden
                      />
                      {coachingAi.driver}
                    </span>
                    <span className="text-[12px] font-semibold text-[#475569]/55 w-full sm:w-auto sm:ml-1">
                      Spotlight · highest-priority gap
                    </span>
                  </div>
                  <p className="text-[11px] font-bold tracking-[0.1em] text-[#475569]/45 mb-2">Interview question</p>
                  <p className="text-[17px] sm:text-[19px] font-semibold text-[#1E293B] leading-[1.45] max-w-3xl">
                    {coachingAi.q}
                  </p>
                </div>

                <div className="grid grid-cols-1 divide-[#E2E8F0] lg:grid-cols-2 lg:divide-x">
                  <div className="p-5 sm:p-8 sm:pt-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100/90">
                        <Mic size={16} className="text-[#64748B]" aria-hidden />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1E293B]">Your answer</p>
                        <p className="text-[11px] text-[#94A3B8]">What you said</p>
                      </div>
                    </div>
                    <blockquote className="m-0 border-l-[3px] border-slate-200/90 pl-4">
                      <p className="text-[15px] leading-[1.7] text-[#334155] font-normal not-italic">
                        {stripOuterQuotes(coachingAi.youSaid ?? "")}
                      </p>
                    </blockquote>
                  </div>
                  <div className="bg-[#0A89A9]/[0.05] p-5 sm:p-8 sm:pt-6 lg:bg-[#0A89A9]/[0.07]">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A89A9]/15">
                        <Sparkles size={16} className="text-[#0A89A9]" aria-hidden />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1E293B]">Coach rewrite</p>
                        <p className="text-[11px] text-[#64748B]">How it should sound</p>
                      </div>
                    </div>
                    <blockquote className="pl-4 border-l-[3px] border-[#0A89A9] m-0">
                      <p className="text-[15px] leading-[1.7] text-[#1E293B] font-normal not-italic">
                        {stripOuterQuotes(coachingAi.aiSaid ?? "")}
                      </p>
                    </blockquote>
                  </div>
                </div>

                {coachingAi.aiTips && coachingAi.aiTips.length > 0 ? (
                  <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0">
                    <div className="rounded-[14px] border border-[#0A89A9]/20 bg-[#0A89A9]/[0.06] px-4 py-4 sm:px-5 sm:py-5">
                      <p className="text-[11px] font-bold tracking-[0.1em] text-[#0A89A9] mb-3">Why this version is stronger</p>
                      <ul className="space-y-2.5">
                        {coachingAi.aiTips.map((tip) => (
                          <li key={tip} className="flex gap-3 text-[14px] text-[#334155] leading-snug">
                            <CheckCircle size={16} className="text-[#0A89A9] shrink-0 mt-0.5" aria-hidden />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
              <p className="text-[11px] font-bold tracking-[0.1em] text-[#475569]/45">Delivery &amp; language</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="rounded-[14px] border border-[#E2E8F0] bg-white/55 p-5">
                  <p className="mb-3 text-[12px] font-semibold text-[#1E293B]">Body language</p>
                  <ul className="space-y-3">
                    {MOCK_SESSION_AI_COACHING.bodyLanguage.map((line) => (
                      <li key={line} className="text-[14px] text-[#475569] leading-[1.6] pl-3 border-l-2 border-[#0A89A9]/25">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[14px] border border-[#E2E8F0] bg-white/55 p-5">
                  <p className="mb-3 text-[12px] font-semibold text-[#1E293B]">Grammar &amp; phrasing</p>
                  <ul className="space-y-3">
                    {MOCK_SESSION_AI_COACHING.grammar.map((line) => (
                      <li key={line} className="text-[14px] text-[#475569] leading-[1.6] pl-3 border-l-2 border-[#0A89A9]/25">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[14px] border border-[#E2E8F0] bg-white/55 p-5">
                  <p className="mb-3 text-[12px] font-semibold text-[#1E293B]">Gestures &amp; interview presence</p>
                  <ul className="space-y-3">
                    {MOCK_SESSION_AI_COACHING.deliveryEthics.map((line) => (
                      <li key={line} className="text-[14px] text-[#475569] leading-[1.6] pl-3 border-l-2 border-[#0A89A9]/25">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[14px] border border-[#E2E8F0] bg-white/55 p-5">
                  <p className="mb-3 text-[12px] font-semibold text-[#1E293B]">Filler words &amp; pacing</p>
                  <p className="mb-6 text-[14px] leading-[1.65] text-[#475569]">{MOCK_SESSION_AI_COACHING.fillerWords}</p>
                  <p className="mb-3 text-[12px] font-semibold text-[#1E293B]">On-camera presence</p>
                  <p className="text-[14px] text-[#475569] leading-[1.65]">{MOCK_SESSION_AI_COACHING.appearanceTip}</p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        <section className="space-y-8 pt-4">
          <div>
            <h2 className="text-[24px] font-medium text-[#1E293B]">What to work on next</h2>
            <p className="mt-1 text-[14px] text-[#64748B]">
              Based on your session — Proofy&apos;s picks for your next training.
            </p>
          </div>

          <div className={`${glassCard} relative border-[0.5px] p-8`}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1]">
            <div className="flex flex-col md:flex-row md:items-stretch gap-8 group">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-[#0A89A9]" fill="#0A89A9" />
                  <span className="text-[12px] font-semibold tracking-[0.08em] text-[#044859]/80">Featured</span>
                </div>
                <h3 className="text-[24px] font-semibold leading-tight text-[#044757] mb-3">
                  {REC_TRAINING_FEATURED.title}
                </h3>
                <p className="text-[14px] text-[#334155] leading-relaxed mb-6 max-w-xl">
                  {REC_TRAINING_FEATURED.desc}
                </p>
                <Link
                  href={REC_TRAINING_FEATURED.href}
                  className="relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full px-8 text-[14px] font-semibold text-[#0A89A9] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A89A9]"
                >
                  <span aria-hidden className="absolute inset-0 rounded-[inherit] bg-white/90 backdrop-blur-[21px]" />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]"
                  />
                  <span className="relative">Start training module</span>
                </Link>
              </div>
              <div className="relative w-full md:w-[min(100%,380px)] aspect-video rounded-2xl overflow-hidden border border-[#00303b]/12 shadow-[0_4px_20px_rgba(0,0,0,0.06)] shrink-0">
                <img
                  src={`https://images.unsplash.com/photo-${REC_TRAINING_FEATURED.thumbUnsplash}?auto=format&fit=crop&q=80&w=600`}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-slate-900/25" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-[21px] flex items-center justify-center border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-[#0A89A9]">
                    <Play fill="#0A89A9" size={20} className="ml-1" />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {suggestedTrainings.map((t) => {
              const pillarColor = PILLAR_COLORS[t.pillar as Pillar];
              return (
                <Link
                  key={t.slug}
                  href={`/trainings/${t.slug}`}
                  className={`${glassCardMd} group relative block overflow-hidden border-[0.5px] transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]`}
                >
                  <div className="relative overflow-hidden rounded-t-[16px] aspect-[2/1]">
                    <img
                      src={`https://images.unsplash.com/photo-${t.unsplashId}?auto=format&fit=crop&w=600&q=80`}
                      alt={t.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-bold tracking-wide px-2 py-1 rounded-full text-white" style={{ background: pillarColor }}>
                        {t.pillar}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold tracking-wide text-[#475569]/50">{t.difficulty}</span>
                      <span className="text-[12px] flex items-center gap-1 text-[#475569]/50">
                        <BookOpen size={9} /> {t.duration}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold leading-snug text-[#1E293B]">{t.title}</h3>
                    <p className="text-[12px] leading-snug line-clamp-2 text-[#475569]/80">{t.description}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-[#0A89A9]">Start training</span>
                      <ArrowRight size={11} className="text-[#0A89A9] transition-transform group-hover:translate-x-1 duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <ProofyChatDock layout="inline" />
        <div className="h-12" />
        </div>
      </div>
    </div>
  );
}
