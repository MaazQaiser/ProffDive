"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
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

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
  borderRadius: 20,
};

const stickyCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.75)",
  borderRadius: 12,
  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
};

const IB = "1px solid rgba(0,0,0,0.06)";
const TEAL = "#0087A8";

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
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        Ready
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[11px] font-bold">
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

const DRIVER_LABEL_TO_ID: Record<string, DriverDef["id"]> = {
  Thinking: "thinking",
  Action: "action",
  People: "people",
  Mastery: "mastery",
};

const tagBase =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wide shrink-0";

const focusFacetTagClass =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#0F172A]/10 bg-white text-[#475569] text-[11px] font-semibold tracking-normal normal-case shrink-0 max-w-[min(100%,17rem)] truncate";

function QuestionRow({ q, qi }: { q: ReportQuestion; qi: number }) {
  const [open, setOpen] = useState(false);
  const sc = getScoreColor(q.score);
  const pillarId = DRIVER_LABEL_TO_ID[q.driver];
  const pillarDetail = pillarId ? COMPETENCY_DETAILS[pillarId] : null;
  const focusFacetLabel = focusFacetLabelForQuestionIndex(qi);

  return (
    <div
      style={{ ...glassCard, borderRadius: 16 }}
      className="mb-4 overflow-hidden border border-white/40 hover:border-[#0087A8]/30 transition-all"
    >
      <div className="p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={focusFacetTagClass} title={focusFacetLabel}>
            {focusFacetLabel}
          </span>
          <span
            className={`${tagBase} border-black/[0.06] bg-white text-[#0F172A]`}
            style={{ boxShadow: `inset 0 0 0 1px ${q.driverAccent}33` }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 99, background: q.driverAccent }} />
            {q.driver}
          </span>
          <span className={`${tagBase} border-[#0F172A]/8 bg-[#0F172A]/[0.02] text-[#475569]`}>
            <Timer size={12} className="text-[#475569]/50" />
            {q.taken}
          </span>
          <span className={`${tagBase} border-[#0F172A]/10 bg-white font-mono tabular-nums`} style={{ color: sc }}>
            {q.score}
            <span className="text-[#475569]/35 font-sans">/5</span>
          </span>
          <StatusBadge score={q.score} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start gap-3 text-left rounded-xl -mx-1 px-1 py-1 hover:bg-[#0F172A]/[0.02] transition-colors"
          aria-expanded={open}
        >
          <span className="shrink-0 w-8 h-8 flex items-center justify-center text-[12px] font-bold bg-[#0F172A]/5 rounded-[10px] text-[#0F172A]/50">
            {qi + 1}
          </span>
          <p className="flex-1 min-w-0 text-[16px] font-bold text-[#0F172A] leading-snug pr-2">&ldquo;{q.q}&rdquo;</p>
          <ChevronDown
            size={20}
            className={`shrink-0 text-[#475569]/40 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      {open ? (
        <div className="border-t border-black/[0.06] bg-white/35 px-5 py-6 space-y-8">
          {pillarDetail ? (
            <div className="p-4 rounded-[14px] border border-black/[0.06] bg-white/60">
              <p className="text-[11px] font-bold tracking-[0.12em] text-[#475569]/45 mb-2">Competency area</p>
              <p className="text-[15px] font-bold text-[#0F172A]">
                {pillarDetail.pillar}{" "}
                <span className="text-[#475569]/60 font-semibold">({pillarDetail.subtitle})</span>
              </p>
              <ul className="mt-3 space-y-2">
                {pillarDetail.skills.map((s, si) => {
                  const pillarScore = pillarId ? MOCK_DRIVERS.find((d) => d.id === pillarId)?.score ?? q.score : q.score;
                  const sub = mockSubSkillScore(pillarScore, si);
                  return (
                    <li key={s} className="text-[13px] text-[#475569] flex items-center justify-between gap-3 flex-wrap">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-1 h-1 rounded-full shrink-0 bg-[#0087A8]" />
                        {s}
                      </span>
                      <span className="font-mono font-bold tabular-nums text-[#0F172A] text-[12px] shrink-0">{sub.toFixed(1)}/5</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div>
            <p className="text-[12px] tracking-[0.08em] font-bold text-[#475569]/40 mb-4">Competency analysis</p>
            <div className="flex flex-col gap-4">
              {q.car.map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5 ${
                      c.ok ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"
                    }`}
                  >
                    {c.ok ? "✓" : "✕"}
                  </div>
                  <p className="text-[13px] text-[#475569] leading-relaxed">
                    <strong className="text-[#0F172A]">{c.label}</strong> — {c.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] tracking-[0.08em] font-bold text-[#475569]/40 mb-4">Areas for improvement</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
              {q.improve.map((imp) => (
                <div key={imp.heading} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-[7px] shrink-0" />
                  <p className="text-[13px] text-[#475569] leading-relaxed">
                    <strong className="text-[#0F172A]">{imp.heading}</strong> — {imp.detail}
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
    <div style={glassCard} className="p-6 flex flex-col gap-4 border border-white/40 hover:border-[#0087A8]/20 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `${d.accent}10` }}>
          <Icon size={20} style={{ color: d.accent }} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-bold font-mono tabular-nums leading-none" style={{ color: sc }}>
            {d.score.toFixed(1)}
          </span>
          <span className="text-[12px] font-medium text-[#475569]/30">/5</span>
        </div>
      </div>

      <div>
        <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">{d.title}</h3>
        <p className="text-[11px] text-[#475569]/55 font-semibold tracking-wide">
          {det.pillar} · {det.subtitle}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <StatusBadge score={d.score} />
      </div>

      <div className="h-[6px] w-full bg-[#0F172A]/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${d.pct}%`, background: d.accent }} />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-2 h-10 rounded-[10px] border border-[#0F172A]/10 text-[12px] font-bold text-[#0087A8] hover:bg-[#0087A8]/5 transition-colors"
        aria-expanded={open}
      >
        {open ? "Hide breakdown" : "See the breakdown"}
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="border-t border-black/[0.06] pt-4 space-y-3 -mb-1">
          <p className="text-[11px] font-bold tracking-[0.12em] text-[#475569]/45">Competency breakdown</p>
          <ul className="space-y-2.5">
            {det.skills.map((s, si) => {
              const sub = mockSubSkillScore(d.score, si);
              const ssc = getScoreColor(sub);
              return (
                <li
                  key={s}
                  className="flex items-center justify-between gap-3 text-[13px] text-[#475569] rounded-lg border border-black/[0.05] bg-white/50 px-3 py-2"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.accent }} />
                    <span className="font-medium text-[#0F172A]">{s}</span>
                  </span>
                  <span className="font-mono font-bold tabular-nums text-[13px] shrink-0" style={{ color: ssc }}>
                    {sub.toFixed(1)}/5
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
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
    <div className="min-h-screen">
      {/* Fixed bar below app nav (h-14) */}
      <div
        className={`fixed left-0 right-0 z-40 px-6 md:px-10 lg:px-14 pt-2 transition-all duration-300 ease-out ${
          showSticky ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        style={{ top: "3.5rem" }}
        aria-hidden={!showSticky}
      >
        <div className="max-w-[1240px] mx-auto" style={stickyCard}>
          <div className="flex items-center gap-4 md:gap-6 flex-wrap py-3 px-5 md:px-6">
            <div className="flex items-end gap-1.5">
              <span className="text-[26px] font-bold font-mono text-[#0F172A]">{overall.toFixed(1)}</span>
              <span className="text-[12px] pb-0.5 text-[#475569]/40">/5.0</span>
            </div>
            <div className="w-px h-7 bg-black/[0.06] hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: stickyB.dot }} />
              <span
                className="text-[12px] font-bold tracking-wide px-2.5 py-1 rounded-md"
                style={{ background: stickyB.bg, color: stickyB.text }}
              >
                {stickyB.label}
              </span>
            </div>
            <div className="w-px h-7 bg-black/[0.06] hidden md:block" />
            <div className="hidden md:flex items-center gap-4 text-[11px] text-[#475569]/50">
              <span className="flex items-center gap-1.5">
                <Mic size={11} /> Audio
              </span>
              <span className="flex items-center gap-1.5">
                <Video size={11} /> Video
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3 text-[11px] text-[#475569]/50">
              <span>
                {dynamicSession.questionCount} questions · {dynamicSession.duration}
              </span>
              <Link href="#recording" className="font-bold text-[#0087A8] hover:opacity-80">
                Recording
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 py-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link href="/mock" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0087A8] hover:opacity-70 transition-opacity">
              <ArrowLeft size={16} /> Back to Sessions
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-[36px] font-bold tracking-tight text-[#0F172A] leading-tight">
                  {`Analytics & AI Coaching of your session — ${dynamicSession.role}`}
                </h1>
                <div className="px-3 py-1 rounded-full bg-[#0F172A]/5 text-[#475569] text-[11px] font-bold mt-2">V1.2</div>
                <span className="text-[12px] text-[#475569]/50 mt-2 font-mono">#{id}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[#475569]/60 text-[14px]">
                <span>{dynamicSession.interviewName}</span>
                <span>·</span>
                <span>{dynamicSession.date}</span>
                <span>·</span>
                <span>{dynamicSession.duration} Duration</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="h-11 px-6 rounded-[10px] border border-[#0F172A]/10 text-[14px] font-bold text-[#0F172A] hover:bg-[#0F172A]/5 transition-all"
            >
              Download PDF
            </button>
            <Link
              href="/mock/setup"
              className="h-11 px-8 rounded-[10px] bg-[#0087A8] text-white text-[14px] font-bold hover:opacity-90 transition-all flex items-center gap-2"
            >
              Retake Session <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        <div ref={heroSectionRef} className="space-y-12">
        <div
          data-journey-id="report-overall"
          style={glassCard}
          className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 md:gap-20 relative overflow-hidden"
        >
          <div className="text-center md:text-left shrink-0">
            <p className="text-[64px] font-black font-mono leading-none tabular-nums tracking-tighter" style={{ color: getScoreColor(overall) }}>
              {overall.toFixed(1)}
            </p>
            <p className="text-[12px] tracking-[0.12em] font-black text-[rgba(67,93,132,0.6)] mt-2">Out of 5.0</p>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <StatusBadge score={overall} />
              <span className="text-[11px] font-bold text-[#475569]/40 tracking-[0.08em]">Overall verdict</span>
            </div>
            <h2 className="text-[28px] md:text-[24px] font-bold text-[#0F172A] leading-tight max-w-xl">
              Strong in People — Action and Mastery are holding your score back.
            </h2>
            <p className="text-[14px] text-[#475569] leading-relaxed max-w-2xl">
              Your People answers showed real evidence of influence and collaboration. Where you&apos;re losing points is Action — your answers described what happened but not what you specifically decided and why. Fix that and your score moves from 3.4 to 4.0+.
            </p>
          </div>

          <div className="shrink-0 p-6 rounded-[16px] bg-[#0F172A]/[0.03] border border-black/[0.04] w-full md:w-auto">
            <p className="text-[12px] tracking-[0.12em] font-bold text-[#475569]/60 mb-3">Your profile</p>
            <div className="space-y-4">
              <div>
                <p className="text-[16px] font-bold text-[#0F172A]">{dynamicSession.role}</p>
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

        <div data-journey-id="report-pillars" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_DRIVERS.map((d) => (
            <DriverPillarCard key={d.id} d={d} />
          ))}
        </div>

        <div className="flex justify-center">
          <details
            className="group w-full max-w-3xl rounded-[16px] border border-[#0F172A]/08 overflow-hidden [&>summary::-webkit-details-marker]:hidden"
            style={glassCard}
          >
            <summary className="flex cursor-pointer list-none items-center justify-center gap-2 h-11 px-6 text-[13px] font-bold text-[#0F172A] hover:bg-[#0F172A]/[0.03] transition-colors">
              <ChevronDown
                size={16}
                className="text-[#0087A8] shrink-0 transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
              View all competency areas
            </summary>
            <div className="px-5 md:px-6 pb-6 pt-2 border-t border-black/[0.06] space-y-5">
              <p className="text-[12px] text-[#475569]/70 text-center md:text-left">
                Power dimensions and sub-skills measured in this session — each pillar has an overall score; expand driver cards above for per–sub-skill scores.
              </p>
              {MOCK_DRIVERS.map((d) => {
                const det = COMPETENCY_DETAILS[d.id];
                return (
                  <div key={d.id} className="rounded-[14px] border border-black/[0.06] bg-white/50 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                      <h3 className="text-[15px] font-bold text-[#0F172A]">
                        {det.pillar}{" "}
                        <span className="text-[#475569]/60 font-semibold text-[13px]">({det.subtitle})</span>
                      </h3>
                      <span className="text-[14px] font-mono font-bold tabular-nums" style={{ color: getScoreColor(d.score) }}>
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
                            <span className="font-mono font-bold tabular-nums text-[12px] shrink-0" style={{ color: getScoreColor(sub) }}>
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
            <h2 className="text-[24px] font-bold text-[#0F172A]">What Proofy saw in your session</h2>
          </div>
          <div style={glassCard} className="p-8 border border-white/40 space-y-6">
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
        </section>

        <div data-journey-id="report-questions" className="pt-4">
          <div className="mb-8">
            <h2 className="text-[24px] font-bold text-[#0F172A]">Your answers — question by question</h2>
          </div>
          <div className="flex flex-col">
            {MOCK_QUESTIONS.map((q, qi) => (
              <QuestionRow key={qi} q={q} qi={qi} />
            ))}
          </div>
        </div>

        <section id="recording" data-journey-id="report-recording" className="scroll-mt-32 space-y-4">
          <div>
            <h2 className="text-[24px] font-bold text-[#0F172A]">Recording &amp; transcript</h2>
            <p className="text-[14px] text-[#475569]/60 mt-1">Replay your session and review the full conversation.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
            <div style={glassCard} className="overflow-hidden border border-white/40 rounded-[16px]">
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
                  <span className="text-[11px] font-mono font-semibold text-white">{dynamicSession.duration}</span>
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
                  <span className="text-[12px] font-mono text-[#475569]/40">11:42</span>
                  <span className="text-[12px] font-mono text-[#475569]/40">{dynamicSession.duration}</span>
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

            <div
              style={{ ...glassCard, maxHeight: 430, overflow: "hidden", display: "flex", flexDirection: "column" }}
              className="border border-white/40 rounded-[16px]"
            >
              <div style={{ padding: "11px 18px", borderBottom: IB, background: "rgba(0,0,0,0.015)", flexShrink: 0 }}>
                <p className="text-[12px] tracking-[0.1em] font-bold text-[#475569]/50">Full transcript</p>
              </div>
              <div className="flex-1 overflow-y-auto py-1">
                {MOCK_TRANSCRIPT.map((t, i) => (
                  <div key={i} style={{ padding: "10px 18px", borderBottom: i < MOCK_TRANSCRIPT.length - 1 ? IB : undefined }}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-[9px] font-bold tracking-wide"
                        style={{ color: t.role === "interviewer" ? TEAL : "rgba(15,15,15,0.40)" }}
                      >
                        {t.speaker}
                      </span>
                      <span className="text-[9px] font-mono text-[#475569]/40">{t.time}</span>
                      {t.flag && (
                        <span className="text-[8px] font-semibold px-1.5 py-0.5 ml-auto rounded bg-amber-100 text-amber-900">
                          {t.flag}
                        </span>
                      )}
                    </div>
                    <p className={`text-[12px] leading-relaxed ${t.role === "interviewer" ? "text-[#0F172A]" : "text-[#475569]"}`}>
                      {t.text}
                    </p>
                  </div>
                ))}
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
            <div className="w-10 h-10 rounded-[12px] bg-[#0087A8]/10 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-[#0087A8]" />
            </div>
            <div>
              <h2 className="text-[24px] font-bold text-[#0F172A]">How to improve your weakest answer</h2>
              <p className="text-[14px] text-[#475569]/60 mt-0.5">
                Delivery, language, and a sharper version of your highest-priority gap answer.
              </p>
            </div>
          </div>

          <div style={glassCard} className="p-0 border border-white/40 overflow-hidden rounded-[20px]">
            {coachingAi ? (
              <div className="border-b border-black/[0.06]">
                <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 bg-[#0F172A]/[0.02]">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                    <span
                      className="inline-flex items-center justify-center min-w-[2.75rem] h-9 px-2.5 rounded-[10px] bg-[#0087A8] text-white text-[13px] font-bold tabular-nums shadow-sm"
                      title={`Question ${spotlightQuestionNumber}`}
                    >
                      Q{spotlightQuestionNumber}
                    </span>
                    <span
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/[0.06] bg-white/80 text-[11px] font-bold tracking-wide text-[#475569]"
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
                  <p className="text-[17px] sm:text-[19px] font-semibold text-[#0F172A] leading-[1.45] max-w-3xl">
                    {coachingAi.q}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-black/[0.06]">
                  <div className="p-5 sm:p-8 sm:pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#0F172A]/6 flex items-center justify-center shrink-0">
                        <Mic size={16} className="text-[#475569]" aria-hidden />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F172A]">Your answer</p>
                        <p className="text-[11px] text-[#475569]/55">What you said</p>
                      </div>
                    </div>
                    <blockquote className="pl-4 border-l-[3px] border-[#0F172A]/12 m-0">
                      <p className="text-[15px] leading-[1.7] text-[#334155] font-normal not-italic">
                        {stripOuterQuotes(coachingAi.youSaid ?? "")}
                      </p>
                    </blockquote>
                  </div>
                  <div className="p-5 sm:p-8 sm:pt-6 bg-[#0087A8]/[0.04] lg:bg-[#0087A8]/[0.06]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#0087A8]/15 flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-[#0087A8]" aria-hidden />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F172A]">Coach rewrite</p>
                        <p className="text-[11px] text-[#475569]/55">How it should sound</p>
                      </div>
                    </div>
                    <blockquote className="pl-4 border-l-[3px] border-[#0087A8] m-0">
                      <p className="text-[15px] leading-[1.7] text-[#0F172A] font-normal not-italic">
                        {stripOuterQuotes(coachingAi.aiSaid ?? "")}
                      </p>
                    </blockquote>
                  </div>
                </div>

                {coachingAi.aiTips && coachingAi.aiTips.length > 0 ? (
                  <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0">
                    <div className="rounded-[14px] border border-[#0087A8]/20 bg-[#0087A8]/[0.06] px-4 py-4 sm:px-5 sm:py-5">
                      <p className="text-[11px] font-bold tracking-[0.1em] text-[#0087A8] mb-3">Why this version is stronger</p>
                      <ul className="space-y-2.5">
                        {coachingAi.aiTips.map((tip) => (
                          <li key={tip} className="flex gap-3 text-[14px] text-[#334155] leading-snug">
                            <CheckCircle size={16} className="text-[#0087A8] shrink-0 mt-0.5" aria-hidden />
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
                <div className="rounded-[14px] border border-black/[0.06] bg-white/45 p-5">
                  <p className="text-[12px] font-bold text-[#0F172A] mb-3">Body language</p>
                  <ul className="space-y-3">
                    {MOCK_SESSION_AI_COACHING.bodyLanguage.map((line) => (
                      <li key={line} className="text-[14px] text-[#475569] leading-[1.6] pl-3 border-l-2 border-[#0087A8]/25">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[14px] border border-black/[0.06] bg-white/45 p-5">
                  <p className="text-[12px] font-bold text-[#0F172A] mb-3">Grammar &amp; phrasing</p>
                  <ul className="space-y-3">
                    {MOCK_SESSION_AI_COACHING.grammar.map((line) => (
                      <li key={line} className="text-[14px] text-[#475569] leading-[1.6] pl-3 border-l-2 border-[#0087A8]/25">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[14px] border border-black/[0.06] bg-white/45 p-5">
                  <p className="text-[12px] font-bold text-[#0F172A] mb-3">Gestures &amp; interview presence</p>
                  <ul className="space-y-3">
                    {MOCK_SESSION_AI_COACHING.deliveryEthics.map((line) => (
                      <li key={line} className="text-[14px] text-[#475569] leading-[1.6] pl-3 border-l-2 border-[#0087A8]/25">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[14px] border border-black/[0.06] bg-white/45 p-5">
                  <p className="text-[12px] font-bold text-[#0F172A] mb-3">Filler words &amp; pacing</p>
                  <p className="text-[14px] text-[#475569] leading-[1.65] mb-6">{MOCK_SESSION_AI_COACHING.fillerWords}</p>
                  <p className="text-[12px] font-bold text-[#0F172A] mb-3">On-camera presence</p>
                  <p className="text-[14px] text-[#475569] leading-[1.65]">{MOCK_SESSION_AI_COACHING.appearanceTip}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8 pt-4">
          <div>
            <h2 className="text-[24px] font-bold text-[#0F172A]">What to work on next</h2>
            <p className="text-[14px] text-[#475569]/60 mt-1">
              Based on your session — Proofy&apos;s picks for your next training.
            </p>
          </div>

          <div className="relative w-full overflow-hidden rounded-xl border border-[#0F172A]/10 bg-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-8">
            <div className="flex flex-col md:flex-row md:items-stretch gap-8 group">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-[#0087A8]" fill="#0087A8" />
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
                  className="relative inline-flex h-12 px-8 rounded-xl items-center justify-center overflow-hidden text-[14px] font-semibold text-[#0087A8] hover:opacity-95 transition-opacity shadow-[0_4px_20px_rgba(0,0,0,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0087A8]"
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
                <div className="absolute inset-0 bg-[#0F172A]/25" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-[21px] flex items-center justify-center border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-[#0087A8]">
                    <Play fill="#0087A8" size={20} className="ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestedTrainings.map((t) => {
              const pillarColor = PILLAR_COLORS[t.pillar as Pillar];
              return (
                <Link key={t.slug} href={`/trainings/${t.slug}`} className="group block" style={glassCard}>
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
                    <h3 className="text-[14px] font-bold leading-snug text-[#0F172A]">{t.title}</h3>
                    <p className="text-[12px] leading-snug line-clamp-2 text-[#475569]/80">{t.description}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-[#0087A8]">Start training</span>
                      <ArrowRight size={11} className="text-[#0087A8] transition-transform group-hover:translate-x-1 duration-300" />
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
  );
}
