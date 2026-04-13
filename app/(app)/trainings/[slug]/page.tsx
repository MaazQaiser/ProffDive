"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Urbanist } from "next/font/google";
import { getTraining } from "@/lib/trainings-data";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  HelpCircle,
  Lock,
  Play,
  PlayCircle,
} from "lucide-react";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const glassPanel =
  "relative overflow-hidden border-[0.5px] border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

const glassCard = `${glassPanel} rounded-[24px]`;
const glassCardMd = `${glassPanel} rounded-[16px]`;

const cardInset =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]";

const MOCK_PROGRESS: Record<string, number> = {
  "interview-essentials": 1,
  "behavioral-car-method": 0,
};

const STEP_ICONS: Record<string, React.ReactNode> = {
  reading: <BookOpen size={13} />,
  video: <PlayCircle size={13} />,
  quiz: <HelpCircle size={13} />,
  exercise: <Code2 size={13} />,
};

function InterviewEssentialsCoursePage() {
  const milestoneTitle = "Energy & Interview Presence";
  const milestoneDefinition =
    "Most candidates focus entirely on what they say — and forget how they show up. This milestone teaches you the non-verbal signals that interviewers notice from the first second.";

  const lessons = [
    { type: "reading" as const, title: "How presence changes your score", metaLeft: "Reading", metaRight: "2 min" },
    { type: "video" as const, title: "Building interview presence", metaLeft: "Video", metaRight: "2 min" },
    { type: "quiz" as const, title: "Presence fundamentals quiz", metaLeft: "Quiz", metaRight: "5 min" },
    { type: "exercise" as const, title: "Your 30-second opening drill", metaLeft: "Exercise", metaRight: "3 min" },
  ];

  const stats = [
    { label: "Total time", value: "18 min" },
    { label: "Reading", value: "4 min" },
    { label: "Video", value: "4 min" },
    { label: "Practice", value: "10 min" },
  ];

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-x-hidden`}>
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6">
        <div
          className="pointer-events-none invisible absolute left-[-251px] top-[66px] z-[1] h-[1127px] w-[1127px] opacity-45"
          aria-hidden
        >
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        <div className="relative z-[1] mx-auto max-w-[920px] space-y-6 pb-20 md:space-y-8">
          <Link
            href="/trainings"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Trainings
          </Link>

          {/* Hero */}
          <section className={`${glassCard} relative border-[0.5px] p-6 md:p-8`}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1] grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-start">
              <div className="min-w-0 space-y-4">
                <p className="text-[12px] text-[#64748B]">
                  <Link href="/trainings" className="text-[#94A3B8] transition-colors hover:text-[#0A89A9]">
                    Trainings
                  </Link>
                  <span className="text-[#CBD5E1]" aria-hidden>
                    {" "}
                    /{" "}
                  </span>
                  <Link
                    href="/trainings/interview-essentials"
                    className="text-[#94A3B8] transition-colors hover:text-[#0A89A9]"
                  >
                    Interview Essentials
                  </Link>
                  <span className="text-[#CBD5E1]" aria-hidden>
                    {" "}
                    /{" "}
                  </span>
                  <span className="text-[#475569]">{milestoneTitle}</span>
                </p>

                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                  Interview Essentials · Milestone 2 of 2
                </p>

                <h1 className="text-[26px] font-medium leading-tight text-[#1E293B] md:text-[30px]">{milestoneTitle}</h1>

                <p className="max-w-[min(100%,560px)] text-[14px] leading-relaxed text-[#64748B]">{milestoneDefinition}</p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#64748B]">
                  <span className="inline-flex items-center gap-2">
                    <Clock size={15} className="shrink-0 text-[#94A3B8]" aria-hidden />
                    18 min total
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <BookOpen size={15} className="shrink-0 text-[#94A3B8]" aria-hidden />
                    4 lessons
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle size={15} className="shrink-0 text-[#94A3B8]" aria-hidden />
                    Practice checkpoint included
                  </span>
                </div>
              </div>

              <div
                className={`${glassCardMd} relative mx-auto w-full max-w-[200px] shrink-0 border-[0.5px] p-4 text-center md:mx-0`}
              >
                <span aria-hidden className={cardInset} />
                <div className="relative z-[1]">
                  <p className="text-[28px] font-semibold tabular-nums leading-none text-[#0A89A9]">50%</p>
                  <p className="mt-1 text-[11px] font-medium text-[#94A3B8]">Course complete</p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/90">
                    <div className="h-full rounded-full bg-[#0A89A9]" style={{ width: "50%" }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <div
            className={`${glassCardMd} relative grid grid-cols-2 gap-px overflow-hidden border-[0.5px] bg-[#E2E8F0]/60 p-px md:grid-cols-4`}
          >
            <span aria-hidden className={cardInset} />
            {stats.map((s) => (
              <div
                key={s.label}
                className="relative z-[1] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,250,252,0.88)_100%)] px-4 py-4 text-center backdrop-blur-sm md:px-5"
              >
                <p className="text-[11px] font-medium text-[#94A3B8]">{s.label}</p>
                <p className="mt-1 text-[16px] font-semibold text-[#1E293B]">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Continue nudge */}
          <div className={`${glassCardMd} relative border-[0.5px] p-4 ring-1 ring-[#0A89A9]/12 md:p-5`}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-1.5 block h-2 w-2 shrink-0 rounded-full bg-[#0A89A9]" aria-hidden />
                <div className="min-w-0 space-y-1">
                  <p className="text-[14px] font-semibold text-[#1E293B]">
                    You&apos;re halfway there — continue from Milestone 2
                  </p>
                  <p className="text-[13px] leading-relaxed text-[#64748B]">
                    Milestone 1 is complete. Pick up where you left off below.
                  </p>
                </div>
              </div>
              <Link
                href="/trainings/interview-essentials/energy-and-presence"
                data-journey-id="training-start"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0A89A9] px-6 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(10,137,169,0.25)] transition-opacity hover:opacity-95"
              >
                <Play size={16} fill="currentColor" className="text-white" aria-hidden />
                Continue
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-0.5">
            <h2 className="text-[20px] font-medium text-[#1E293B]">What&apos;s inside</h2>
            <p className="text-[13px] text-[#64748B]">2 milestones</p>
          </div>

          <div className="space-y-4">
            {/* Milestone 1 — completed */}
            <div className={`${glassCardMd} relative overflow-hidden border-[0.5px] transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]`}>
              <span aria-hidden className={cardInset} />
              <div className="relative z-[1] flex items-center gap-4 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle size={18} className="text-emerald-600" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Milestone 1</p>
                  <p className="text-[15px] font-medium leading-snug text-[#94A3B8]">What Makes a Strong Answer</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[12px] text-[#94A3B8]">
                  <span>4 lessons</span>
                  <ChevronDown size={18} aria-hidden />
                </div>
              </div>
            </div>

            {/* Milestone 2 — active expanded */}
            <div
              className={`${glassCardMd} relative overflow-hidden border-[0.5px] shadow-[0_8px_28px_rgba(10,137,169,0.08)] ring-1 ring-[#0A89A9]/20 transition-shadow hover:shadow-[0_8px_28px_rgba(10,137,169,0.1)]`}
            >
              <span aria-hidden className={cardInset} />
              <div className="relative z-[1] flex items-center gap-4 border-b border-[#E2E8F0]/80 px-5 py-4">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0A89A9]/35 bg-[rgba(10,137,169,0.08)]"
                  aria-hidden
                >
                  <span className="block h-2 w-2 rounded-full bg-[#0A89A9]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Milestone 2</span>
                    <span className="rounded-full border border-[#0A89A9]/20 bg-[rgba(10,137,169,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[#0A89A9]">
                      You&apos;re here
                    </span>
                  </div>
                  <p className="mt-0.5 text-[15px] font-semibold leading-snug text-[#1E293B]">{milestoneTitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[12px] text-[#64748B]">
                  <span>4 lessons</span>
                  <ChevronDown size={18} className="rotate-180 text-[#0A89A9]" aria-hidden />
                </div>
              </div>

              <div className="relative z-[1] divide-y divide-[#E2E8F0]/80">
                {lessons.map((l) => (
                  <button
                    key={l.title}
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/45"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-slate-100/90 text-[#64748B]">
                      <span className="opacity-90">{STEP_ICONS[l.type]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-[#1E293B]">{l.title}</p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                        <span className="text-[#0A89A9]">{l.metaLeft}</span>
                        <span className="mx-1 text-[#CBD5E1]">·</span>
                        <span>{l.metaRight}</span>
                      </p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-[#CBD5E1]" aria-hidden />
                  </button>
                ))}
              </div>

              <div className="relative z-[1] flex justify-end border-t border-[#E2E8F0]/80 bg-white/25 px-5 py-4 backdrop-blur-sm">
                <Link
                  href="/trainings/interview-essentials/energy-and-presence"
                  data-journey-id="training-start"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0A89A9] px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(10,137,169,0.25)] transition-opacity hover:opacity-95"
                >
                  Continue where you left off
                  <ArrowRight size={16} strokeWidth={2} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrainingDetailPage() {
  const params = useParams<{ slug?: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  if (!slug) notFound();
  const training = getTraining(slug);
  if (!training) notFound();

  if (slug === "interview-essentials") {
    return <InterviewEssentialsCoursePage />;
  }

  const completedMilestones = MOCK_PROGRESS[slug] ?? 0;
  const totalMilestones = training.milestones.length;
  const pct = Math.round((completedMilestones / totalMilestones) * 100);
  const started = completedMilestones > 0;
  const completed = completedMilestones >= totalMilestones;

  const readingMins = training.milestones.reduce((a, m) => a + m.steps.filter(s => s.type === "reading").length * 2, 0);
  const videoMins = training.milestones.reduce((a, m) => a + m.steps.filter(s => s.type === "video").length * 2, 0);
  const quizMins = training.milestones.reduce((a, m) => a + m.steps.filter(s => s.type === "quiz").length * 5, 0);

  const [openMilestone, setOpenMilestone] = useState<string | null>(
    training.milestones[completedMilestones]?.id ?? training.milestones[0]?.id ?? null
  );

  const nextMilestone = training.milestones[completedMilestones];

  const heroSubheadline =
    slug === "interview-essentials"
      ? `Everything you need before your first mock — how interviews are scored, what CAR means, and what great actually sounds like.`
      : training.description;

  const progressLabel =
    slug === "interview-essentials" && started && !completed
      ? "You're halfway there — continue from Milestone 2"
      : "Pick up where you left off below";

  const sentenceCase = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1);

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-x-hidden`}>
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6">
        <div
          className="pointer-events-none invisible absolute left-[-251px] top-[66px] z-[1] h-[1127px] w-[1127px] opacity-45"
          aria-hidden
        >
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        <div className="relative z-[1] mx-auto max-w-[920px] space-y-6 pb-20 md:space-y-8">
          <Link
            href="/trainings"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
          >
            <ArrowRight size={16} className="rotate-180" />
            Trainings
          </Link>

          <section className={`${glassCard} relative border-[0.5px] p-6 md:p-8`}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1] grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-start">
              <div className="min-w-0 space-y-4">
                <p className="text-[12px] text-[#64748B]">
                  <Link href="/trainings" className="text-[#94A3B8] transition-colors hover:text-[#0A89A9]">
                    Trainings
                  </Link>
                  <span className="text-[#CBD5E1]" aria-hidden>
                    {" "}
                    /{" "}
                  </span>
                  <span className="text-[#475569]">{training.title}</span>
                </p>

                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">{training.pillar} Pillar</p>

                <h1 className="text-[28px] font-medium leading-tight text-[#1E293B] md:text-[34px]">{training.title}</h1>
                <p className="max-w-[min(100%,560px)] text-[14px] leading-relaxed text-[#64748B]">{heroSubheadline}</p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#64748B]">
                  <span className="inline-flex items-center gap-2">
                    <Clock size={15} className="shrink-0 text-[#94A3B8]" aria-hidden />
                    {readingMins + videoMins + quizMins} min total
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <BookOpen size={15} className="shrink-0 text-[#94A3B8]" aria-hidden />
                    {totalMilestones} milestones
                  </span>
                </div>
              </div>

              <div className={`${glassCardMd} relative mx-auto w-full max-w-[220px] shrink-0 border-[0.5px] p-4 text-center md:mx-0`}>
                <span aria-hidden className={cardInset} />
                <div className="relative z-[1] space-y-2">
                  {completed ? (
                    <p className="text-[22px] font-semibold leading-none text-emerald-600">Completed</p>
                  ) : (
                    <p className="text-[28px] font-semibold tabular-nums leading-none text-[#0A89A9]">{pct}%</p>
                  )}
                  <p className="text-[11px] font-medium text-[#94A3B8]">
                    {completed ? "Course complete" : started ? "Course progress" : "Not started"}
                  </p>
                  {!completed ? (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/90">
                      <div className="h-full rounded-full bg-[#0A89A9]" style={{ width: `${pct}%` }} />
                    </div>
                  ) : null}
                  <div className="pt-1">
                    {completed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle size={14} aria-hidden />
                        Course completed
                      </span>
                    ) : started ? (
                      <p className="text-[11px] leading-relaxed text-[#64748B]">{progressLabel}</p>
                    ) : (
                      <Link
                        data-journey-id={slug === "interview-essentials" ? "training-start" : undefined}
                        href={`/trainings/${slug}/${training.milestones[0].id}`}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0A89A9] px-4 text-[13px] font-semibold text-white shadow-[0_4px_20px_rgba(10,137,169,0.25)] transition-opacity hover:opacity-95"
                      >
                        Start course
                        <ArrowRight size={14} aria-hidden />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div
            className={`${glassCardMd} relative grid grid-cols-2 gap-px overflow-hidden border-[0.5px] bg-[#E2E8F0]/60 p-px md:grid-cols-4`}
          >
            <span aria-hidden className={cardInset} />
            {[
              { label: "Total time", value: `${readingMins + videoMins + quizMins} min` },
              { label: "Reading", value: `${readingMins} min` },
              { label: "Video", value: `${videoMins} min` },
              { label: "Practice", value: `${quizMins} min` },
            ].map((s) => (
              <div
                key={s.label}
                className="relative z-[1] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,250,252,0.88)_100%)] px-4 py-4 text-center backdrop-blur-sm md:px-5"
              >
                <p className="text-[11px] font-medium text-[#94A3B8]">{s.label}</p>
                <p className="mt-1 text-[16px] font-semibold text-[#1E293B]">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-[20px] font-medium text-[#1E293B]">What&apos;s inside</h2>
              <p className="text-[13px] text-[#64748B]">{totalMilestones} milestones</p>
            </div>

            <div className="space-y-3">
              {training.milestones.map((milestone, idx) => {
                const isCompleted = idx < completedMilestones;
                const isActive = idx === completedMilestones;
                const isLocked = idx > completedMilestones;
                const isOpen = openMilestone === milestone.id;

                return (
                  <div
                    key={milestone.id}
                    className={[
                      glassCardMd,
                      "relative overflow-hidden border-[0.5px] transition-all",
                      isLocked ? "opacity-75" : "hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]",
                    ].join(" ")}
                  >
                    <span aria-hidden className={cardInset} />
                    <button
                      onClick={() => setOpenMilestone(isOpen ? null : milestone.id)}
                      className="relative z-[1] flex w-full items-center gap-4 px-5 py-4 text-left"
                    >
                      {isCompleted ? (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                          <CheckCircle size={16} className="text-emerald-600" />
                        </div>
                      ) : isActive ? (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0A89A9]/20 bg-[#0A89A9]/10 ring-4 ring-[#0A89A9]/5">
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0A89A9]" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300/50 bg-slate-200/50">
                          <Lock size={14} className="text-slate-400" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">Milestone {idx + 1}</span>
                          {isActive ? (
                            <span className="rounded-full border border-[#0A89A9]/20 bg-[#0A89A9]/10 px-2 py-0.5 text-[10px] font-semibold text-[#0A89A9]">
                              You&apos;re here
                            </span>
                          ) : null}
                        </div>
                        <p className={`text-[16px] font-semibold ${isLocked ? "text-[#64748B]" : "text-[#1E293B]"}`}>{milestone.title}</p>
                      </div>

                      <div className="flex items-center gap-2 text-[12px] text-[#94A3B8]">
                        <span>{milestone.steps.length} lessons</span>
                        <ChevronDown size={18} className={`transition-transform ${isOpen ? "rotate-180 text-[#0A89A9]" : ""}`} />
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="relative z-[1] border-t border-[#E2E8F0]/80 bg-white/25">
                        <div className="divide-y divide-[#E2E8F0]/80">
                          {milestone.steps.map((step, si) => (
                            <div key={si} className="flex items-center gap-4 px-6 py-3.5">
                              <div className="shrink-0 text-[#64748B] opacity-70">{STEP_ICONS[step.type]}</div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[14px] font-medium text-[#1E293B]">
                                  {slug === "interview-essentials" && step.title === "Watch: Building interview presence"
                                    ? "Building interview presence"
                                    : step.title}
                                </p>
                                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                                  {sentenceCase(step.type)} · {step.duration}
                                </p>
                              </div>
                              {isCompleted ? <CheckCircle size={13} className="text-emerald-500" /> : null}
                              {isLocked ? <Lock size={11} className="text-slate-300" /> : null}
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-[#E2E8F0]/80 bg-white/20 px-6 py-4">
                          {isLocked ? (
                            <button
                              disabled
                              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-5 text-[13px] font-semibold text-slate-400"
                            >
                              <Lock size={14} />
                              Milestone locked
                            </button>
                          ) : (
                            <Link
                              data-journey-id={slug === "interview-essentials" && isActive ? "training-start" : undefined}
                              href={`/trainings/${slug}/${milestone.id}`}
                              className={`group/btn inline-flex h-10 items-center gap-2 rounded-full px-5 text-[13px] font-semibold transition-all ${
                                isActive
                                  ? "bg-[#0A89A9] text-white shadow-[0_4px_20px_rgba(10,137,169,0.25)] hover:opacity-95"
                                  : "border border-slate-200 bg-white/80 text-[#1E293B] hover:bg-white"
                              }`}
                            >
                              {isCompleted
                                ? "Review milestone"
                                : isActive
                                  ? started
                                    ? "Continue learning"
                                    : "Start course"
                                  : "Start milestone"}
                              <ArrowRight
                                size={15}
                                className={`transition-transform group-hover/btn:translate-x-0.5 ${isActive ? "text-white" : "text-[#1E293B]"}`}
                              />
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

