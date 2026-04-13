"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Urbanist } from "next/font/google";
import { getTraining, unsplashUrl, type Step } from "@/lib/trainings-data";
import { completeJourneyStep } from "@/lib/guided-journey";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  Play,
  BookOpen,
  HelpCircle,
  Code2,
  ArrowLeft,
  Target,
  Trophy,
  Menu,
  X,
  ArrowRight,
  PlayCircle,
} from "lucide-react";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

// ─── Tokens (aligned with dashboard / trainings hub) ─────────────────────────
const glassPanel =
  "relative overflow-hidden border-[0.5px] border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

const glassCard = `${glassPanel} rounded-[24px]`;
const glassCardMd = `${glassPanel} rounded-[16px]`;

const cardInset =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]";

type StepKey = "reading" | "video" | "quiz" | "exercise";
const STEP_ORDER: StepKey[] = ["reading", "video", "quiz", "exercise"];

const STEP_META: Record<StepKey, { label: string; icon: LucideIcon }> = {
  reading:  { label: "Reading", icon: BookOpen },
  video:    { label: "Video", icon: PlayCircle },
  quiz:     { label: "Quiz", icon: HelpCircle },
  exercise: { label: "Workshop", icon: Code2 },
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

function ReadingStep({ step }: { step: Step }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
          <BookOpen size={14} className="text-[#0A89A9]" aria-hidden />
          <span>
            <span className="text-[#0A89A9]">Reading</span>
            <span className="mx-1.5 text-[#CBD5E1]">·</span>
            {step.duration}
          </span>
        </div>
        <h1 className="text-[26px] font-medium leading-tight tracking-tight text-[#1E293B] md:text-[30px]">{step.title}</h1>
      </div>

      {step.pullQuote && (
        <div className="relative py-2 pl-8">
          <div className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-[#0A89A9]/35" aria-hidden />
          <p className="text-[18px] font-normal italic leading-relaxed text-[#475569]">
            <span aria-hidden>&ldquo;</span>
            {step.pullQuote}
            <span aria-hidden>&rdquo;</span>
          </p>
        </div>
      )}

      <div className="prose prose-slate max-w-none prose-p:text-[15px] prose-p:leading-[1.75] prose-p:text-[#64748B]">
        {step.body?.split("\n\n").map((p: string, i: number) => (
          <p key={i}>{p.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
        ))}
      </div>

      {step.keyTakeaway && (
        <div className={`${glassCardMd} relative flex gap-5 border-[0.5px] p-6 ring-1 ring-[#0A89A9]/10`}>
          <span aria-hidden className={cardInset} />
          <div className="relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A89A9] text-white shadow-[0_4px_20px_rgba(10,137,169,0.25)]">
            <Target size={22} aria-hidden />
          </div>
          <div className="relative z-[1] min-w-0">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A89A9]">The bottom line</p>
            <p className="text-[15px] font-medium leading-relaxed text-[#1E293B]">{step.keyTakeaway}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoStep({ step, trainingUnsplashId }: { step: Step; trainingUnsplashId: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
          <PlayCircle size={14} className="text-[#0A89A9]" aria-hidden />
          <span>
            <span className="text-[#0A89A9]">Video</span>
            <span className="mx-1.5 text-[#CBD5E1]">·</span>
            {step.duration}
          </span>
        </div>
        <h1 className="text-[26px] font-medium leading-tight tracking-tight text-[#1E293B] md:text-[30px]">{step.title}</h1>
      </div>

      <div
        onClick={() => setPlaying(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPlaying(true);
          }
        }}
        role="button"
        tabIndex={0}
        className="group relative aspect-video cursor-pointer overflow-hidden rounded-[24px] border border-white/90 shadow-[0_8px_28px_rgba(0,0,0,0.08)] ring-1 ring-[#E2E8F0]/80"
      >
        <Image
          src={unsplashUrl(trainingUnsplashId, 1200)}
          alt="Thumbnail"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          unoptimized
        />
        <div className="absolute inset-0 bg-slate-900/25 transition-colors group-hover:bg-slate-900/15" />

        {!playing ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#F8FAFC]/40 bg-white/15 backdrop-blur-[8px] transition-transform group-hover:scale-105">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#0A89A9] text-white shadow-[0_4px_20px_rgba(10,137,169,0.35)]">
                <Play size={22} fill="currentColor" className="ml-0.5" aria-hidden />
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-900 text-white">
            <PlayCircle size={48} className="opacity-20" aria-hidden />
            <p className="text-[14px] font-medium text-white/60">Initializing high-fidelity player…</p>
          </div>
        )}
      </div>

      {step.bulletPoints && (
        <div className={`${glassCardMd} relative space-y-4 border-[0.5px] p-6`}>
          <span aria-hidden className={cardInset} />
          <p className="relative z-[1] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">Key themes</p>
          <ul className="relative z-[1] grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {step.bulletPoints.map((b: string, i: number) => (
              <li key={i} className="flex gap-3 text-[14px] leading-snug text-[#64748B]">
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#0A89A9]" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MilestonePage() {
  const params = useParams<{ slug?: string; milestone?: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const milestone = typeof params?.milestone === "string" ? params.milestone : "";
  if (!slug || !milestone) notFound();
  const training = getTraining(slug);
  if (!training) notFound();

  const milestoneData = training.milestones.find(m => m.id === milestone);
  if (!milestoneData) notFound();

  const milestoneIdx = training.milestones.findIndex(m => m.id === milestone);
  const nextMilestone = training.milestones[milestoneIdx + 1];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [complete, setComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [quizQIdx, setQuizQIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [workshopStarted, setWorkshopStarted] = useState(false);
  const [workshopDone, setWorkshopDone] = useState(false);
  const [workshopResponse, setWorkshopResponse] = useState("");

  const currentKey = STEP_ORDER[currentStepIdx];
  const currentStep = milestoneData.steps.find(s => s.type === currentKey) ?? milestoneData.steps[currentStepIdx];
  const quizStep = milestoneData.steps.find(s => s.type === "quiz");
  const quizQuestions = quizStep?.questions ?? [];
  const workshopIdx = STEP_ORDER.indexOf("exercise");

  // Auto-scroll to top on step change
  useEffect(() => {
    const main = document.getElementById('zen-scroll');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStepIdx]);

  // Reset quiz UI if you leave quiz step
  useEffect(() => {
    if (currentKey !== "quiz") return;
    // when entering quiz step, keep state as-is (so refresh doesn't lose progress)
  }, [currentKey]);

  if (complete) {
    return (
      <div
        className={`${urbanist.className} fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8FAFC]/75 p-8 text-center backdrop-blur-sm animate-in fade-in duration-700`}
      >
        <div className={`${glassCard} relative max-w-[min(100%,420px)] border-[0.5px] p-8`}>
          <span aria-hidden className={cardInset} />
          <div className="relative z-[1] flex flex-col items-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 text-[40px] shadow-[0_4px_20px_rgba(5,150,105,0.12)]">
              🎉
            </div>
            <div className="space-y-2">
              <h1 className="text-[26px] font-medium text-[#1E293B]">Milestone complete</h1>
              <p className="mx-auto max-w-sm text-[14px] leading-relaxed text-[#64748B]">
                You&apos;ve finished <span className="font-semibold text-[#1E293B]">{milestoneData.title}</span>. Ready for
                what&apos;s next?
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
              {nextMilestone ? (
                <Link
                  href={`/trainings/${slug}/${nextMilestone.id}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0A89A9] px-7 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(10,137,169,0.25)] transition-opacity hover:opacity-95"
                >
                  Next milestone
                  <ArrowRight size={18} aria-hidden />
                </Link>
              ) : (
                <Link
                  href={`/trainings/${slug}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(5,150,105,0.2)] transition-opacity hover:opacity-95"
                >
                  <Trophy size={18} aria-hidden />
                  Finish course
                </Link>
              )}
              <Link
                href={`/trainings/${slug}`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#CBD5E1] bg-white/60 px-7 text-[14px] font-semibold text-[#475569] shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-colors hover:bg-white/90"
              >
                Return to syllabus
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${urbanist.className} relative flex min-h-0 w-full flex-1 flex-col overflow-hidden`}>
      <div className="relative z-[2] mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col gap-4 px-4 py-4 sm:flex-row sm:gap-5 sm:px-6 sm:py-6">
        <div
          className="pointer-events-none invisible absolute left-[-251px] top-[20px] z-0 h-[900px] w-[900px] opacity-40 sm:visible"
          aria-hidden
        >
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        {/* Sidebar */}
        <aside
          className={[
            "relative z-[1] flex min-h-0 flex-col overflow-hidden transition-[width,transform,opacity] duration-300 ease-out",
            sidebarOpen ? "w-full shrink-0 sm:w-[300px]" : "pointer-events-none w-0 max-w-0 shrink-0 -translate-x-2 opacity-0",
          ].join(" ")}
        >
          <div className={`${glassCard} flex min-h-0 min-w-0 flex-1 flex-col border-[0.5px] sm:max-h-[calc(100dvh-7rem)]`}>
            <span aria-hidden className={cardInset} />
            <div className="custom-scrollbar relative z-[1] flex-1 space-y-8 overflow-y-auto p-6 sm:p-7">
              <div className="space-y-3">
                <Link
                  href={`/trainings/${slug}`}
                  className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
                >
                  <ArrowLeft size={14} strokeWidth={2} aria-hidden />
                  {training.title}
                </Link>
                <h3 className="text-[18px] font-medium leading-snug text-[#1E293B]">{milestoneData.title}</h3>
              </div>

              <div className="space-y-2" data-journey-id="training-milestone-progress">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">Milestone progress</p>
                {STEP_ORDER.map((key, i) => {
                  const Icon = STEP_META[key].icon;
                  const isActive = currentStepIdx === i;
                  const isPast = currentStepIdx > i;
                  const isLocked = key === "exercise" && !quizDone;
                  const isReading = key === "reading";
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (isLocked) return;
                        setCurrentStepIdx(i);
                      }}
                      disabled={isLocked}
                      data-journey-id={isReading ? "training-step-reading" : undefined}
                      className={[
                        "group flex w-full items-center gap-3 rounded-[16px] border border-transparent p-3.5 text-left transition-all",
                        "disabled:cursor-not-allowed disabled:opacity-45",
                        isActive
                          ? "border-[#0A89A9]/20 bg-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.06)] ring-1 ring-[#0A89A9]/15"
                          : "hover:border-white/80 hover:bg-white/40",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors",
                          isActive ? "bg-[#0A89A9] text-white" : isPast ? "bg-emerald-500/12 text-emerald-600" : "bg-slate-100/90 text-[#94A3B8]",
                        ].join(" ")}
                      >
                        {isPast ? <CheckCircle size={15} aria-hidden /> : <Icon size={15} aria-hidden />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-semibold ${isActive ? "text-[#1E293B]" : "text-[#64748B]"}`}>
                          {STEP_META[key].label}
                        </p>
                        {key === "exercise" && !quizDone ? (
                          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                            Locked · finish quiz
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[11px] font-medium text-[#94A3B8]">Step {i + 1}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={`relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${glassCard} border-[0.5px] sm:max-h-[calc(100dvh-7rem)]`}>
          <span aria-hidden className={cardInset} />

          <div className="relative z-[1] flex h-14 shrink-0 items-center justify-between border-b border-[#E2E8F0]/90 bg-white/30 px-4 backdrop-blur-md sm:px-6">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/50 text-[#64748B] transition-colors hover:bg-white/80"
              aria-label={sidebarOpen ? "Hide lesson outline" : "Show lesson outline"}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex gap-1.5">
              {STEP_ORDER.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-7 rounded-full transition-all duration-500 sm:w-8 ${currentStepIdx >= i ? "bg-[#0A89A9]" : "bg-[#E2E8F0]"}`}
                />
              ))}
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
              {currentStepIdx + 1} / {STEP_ORDER.length}
            </p>
          </div>

          <div id="zen-scroll" className="relative z-[1] min-h-0 flex-1 overflow-y-auto scroll-smooth">
            <div className="mx-auto max-w-[760px] px-5 py-12 pb-32 sm:px-10 sm:py-16 sm:pb-40">
               {currentKey === "reading" && <ReadingStep step={currentStep} />}
               {currentKey === "video" && <VideoStep step={currentStep} trainingUnsplashId={training.unsplashId} />}
               {currentKey === "quiz" && (
                 <div className="flex flex-col items-center py-20 text-center space-y-6">
                    {!quizStarted ? (
                      <>
                        <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                          <HelpCircle size={32} />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Quick Check-in</h2>
                          <p className="text-slate-500 text-[14px]">Let&apos;s verify your understanding before the workshop.</p>
                        </div>
                        <button
                          onClick={() => {
                            setQuizStarted(true);
                            setQuizDone(false);
                            setQuizQIdx(0);
                            setQuizSelected(null);
                            setQuizCorrect(0);
                          }}
                          className="px-8 py-3 bg-[#0A89A9] text-white rounded-full text-[13px] font-bold hover:opacity-95 transition-all shadow-lg shadow-teal-900/20"
                        >
                          Start quiz
                        </button>
                      </>
                    ) : quizDone ? (
                      <>
                        <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                          <CheckCircle size={32} />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Quiz complete</h2>
                          <p className="text-slate-500 text-[14px]">
                            You got <span className="font-bold text-[#0F172A]">{quizCorrect}</span> /{" "}
                            <span className="font-bold text-[#0F172A]">{quizQuestions.length}</span> correct.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setCurrentStepIdx(workshopIdx);
                            setWorkshopStarted(false);
                            setWorkshopDone(false);
                            setWorkshopResponse("");
                          }}
                          className="px-10 py-4 bg-emerald-600 text-white rounded-full text-[14px] font-bold shadow-xl shadow-emerald-900/20 hover:scale-105 transition-all"
                        >
                          Let&apos;s jump to workshop
                        </button>
                      </>
                    ) : quizQuestions.length === 0 ? (
                      <>
                        <div className="w-16 h-16 rounded-[24px] bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                          <HelpCircle size={32} />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Quiz coming soon</h2>
                          <p className="text-slate-500 text-[14px]">No quiz questions are configured for this milestone yet.</p>
                        </div>
                      </>
                    ) : (
                      (() => {
                        const q = quizQuestions[quizQIdx]!;
                        const showFeedback = quizSelected !== null;
                        const isCorrect = showFeedback && quizSelected === q.correctIndex;
                        return (
                          <div className="w-full max-w-[640px] text-left space-y-6">
                            <div className="text-center space-y-2">
                              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                Question {quizQIdx + 1} / {quizQuestions.length}
                              </p>
                              <h2 className="text-[22px] font-bold text-[#0F172A] leading-snug">{q.question}</h2>
                            </div>

                            <div className="space-y-3">
                              {q.options.map((opt, idx) => {
                                const selected = quizSelected === idx;
                                const correct = idx === q.correctIndex;
                                const stateClass = !showFeedback
                                  ? "border-slate-200 hover:border-[#0A89A9]/40 hover:bg-white"
                                  : correct
                                    ? "border-emerald-300 bg-emerald-50"
                                    : selected
                                      ? "border-rose-300 bg-rose-50"
                                      : "border-slate-200 bg-white/50";
                                return (
                                  <button
                                    key={opt}
                                    onClick={() => {
                                      if (showFeedback) return;
                                      setQuizSelected(idx);
                                      if (idx === q.correctIndex) setQuizCorrect((c) => c + 1);
                                    }}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all ${stateClass}`}
                                  >
                                    <p className="text-[14px] font-medium text-[#0F172A]">{opt}</p>
                                  </button>
                                );
                              })}
                            </div>

                            {showFeedback && (
                              <div className={`p-4 rounded-2xl border ${isCorrect ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}`}>
                                <p className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: isCorrect ? "#059669" : "#B45309" }}>
                                  {isCorrect ? "Correct" : "Not quite"}
                                </p>
                                <p className="text-[13px] text-slate-600 leading-relaxed">{q.explanation}</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <button
                                onClick={() => {
                                  setQuizStarted(false);
                                  setQuizDone(false);
                                  setQuizQIdx(0);
                                  setQuizSelected(null);
                                  setQuizCorrect(0);
                                }}
                                className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                Restart
                              </button>

                              <button
                                onClick={() => {
                                  if (!showFeedback) return;
                                  const nextIdx = quizQIdx + 1;
                                  if (nextIdx >= quizQuestions.length) {
                                    setQuizDone(true);
                                  } else {
                                    setQuizQIdx(nextIdx);
                                  }
                                  setQuizSelected(null);
                                }}
                                disabled={!showFeedback}
                                className="px-6 h-11 bg-[#0A89A9] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full text-[13px] font-bold flex items-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-teal-900/20 disabled:shadow-none"
                              >
                                {quizQIdx + 1 >= quizQuestions.length ? "Finish quiz" : "Next"}
                                <ArrowRight size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    )}
                 </div>
               )}
               {currentKey === "exercise" && (
                 <div className="flex flex-col items-center py-20 text-center space-y-6">
                   {!workshopStarted ? (
                     <>
                       <div className="w-16 h-16 rounded-[24px] bg-[#0A89A9]/10 flex items-center justify-center text-[#0A89A9] border border-[#0A89A9]/20 ring-4 ring-[#0A89A9]/5">
                         <Code2 size={32} />
                       </div>
                       <div className="space-y-2">
                         <h2 className="text-2xl font-bold">Interactive Workshop</h2>
                         <p className="text-slate-500 text-[14px]">You&apos;ll practice the concept in a short scenario, then submit your response.</p>
                       </div>
                       <button
                         onClick={() => setWorkshopStarted(true)}
                         className="px-8 py-3 bg-[#0A89A9] text-white rounded-full text-[13px] font-bold hover:opacity-95 transition-all shadow-lg shadow-teal-900/20"
                       >
                         Start workshop
                       </button>
                     </>
                   ) : (
                     <div className="w-full max-w-[680px] text-left space-y-6">
                       <div className="text-center space-y-2">
                         <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Workshop</p>
                         <h2 className="text-[22px] font-bold text-[#0F172A] leading-snug">Apply it once, cleanly</h2>
                         <p className="text-[13px] text-slate-500">
                           Write a 4–6 sentence answer using the framework you just learned. Keep it tight and specific.
                         </p>
                       </div>

                       <div className="p-5 rounded-[24px] bg-white/70 border border-slate-200 shadow-sm">
                         <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-2">Prompt</p>
                         <p className="text-[14px] text-[#0F172A] leading-relaxed">
                           Describe a time you took ownership of a messy situation. Structure it clearly and include a measurable result.
                         </p>
                       </div>

                       <div className="p-5 rounded-[24px] bg-white border border-slate-200 shadow-sm">
                         <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-2">Your answer</p>
                         <textarea
                           value={workshopResponse}
                           onChange={(e) => setWorkshopResponse(e.target.value)}
                           className="w-full min-h-[140px] resize-y rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-[14px] text-[#0F172A] outline-none focus:border-[#0A89A9]/50 focus:ring-4 focus:ring-[#0A89A9]/10 transition"
                           placeholder="Write 4–6 sentences here..."
                         />
                         <p className="mt-2 text-[12px] text-slate-400">
                           Tip: aim for one sentence each for context, action, and result.
                         </p>
                       </div>

                       <div className="flex items-center justify-between pt-2">
                         <button
                           onClick={() => {
                             setWorkshopStarted(false);
                             setWorkshopDone(false);
                           setWorkshopResponse("");
                           }}
                           className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                         >
                           Back
                         </button>

                         <button
                          onClick={() => {
                            const ok = workshopResponse.trim().length >= 20;
                            if (!ok) return;
                            setWorkshopDone(true);
                            setComplete(true);
                            // Guided journey: training step completes when workshop is completed.
                            completeJourneyStep("training");
                          }}
                          disabled={workshopResponse.trim().length < 20}
                          className="px-10 py-4 bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full text-[14px] font-bold shadow-xl shadow-emerald-900/20 hover:scale-105 disabled:hover:scale-100 transition-all"
                         >
                           Complete workshop
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
               )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
