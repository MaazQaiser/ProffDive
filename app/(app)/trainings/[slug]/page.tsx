"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getTraining, unsplashUrl } from "@/lib/trainings-data";
import {
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

// ─── Tokens ──────────────────────────────────────────────────────────────────
const TEAL = "#0087A8";
const BORDER = "rgba(15,23,42,0.12)";
const BORDER_HALF: React.CSSProperties = { borderWidth: 0.5 };
const CONTENT_MAX_W = 860;
const CONTENT_PAD: React.CSSProperties = { padding: "1.75rem 2rem" };
const GLASS_SURFACE: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.60)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.88)",
};

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.60)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.88)",
};

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

  return (
    <div className="min-h-[calc(100vh-64px)] pb-20">
      {/* Banner */}
      <div style={{ background: TEAL }}>
        <div className="mx-auto" style={{ maxWidth: CONTENT_MAX_W, ...CONTENT_PAD }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="text-white">
              <div className="text-[12px] flex items-center gap-2 flex-wrap">
                <Link href="/trainings" className="hover:opacity-80 transition-opacity" style={{ color: "rgba(255,255,255,0.55)" }}>
                  ← Trainings
                </Link>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>/</span>
                <Link href="/trainings/interview-essentials" className="hover:opacity-80 transition-opacity" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Interview Essentials
                </Link>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>/</span>
                <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{milestoneTitle}</span>
              </div>

              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                Interview Essentials · Milestone 2 of 2
              </p>

              <h1 className="mt-2 text-[24px] font-medium leading-tight">{milestoneTitle}</h1>

              <p className="mt-3 text-[13px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.78)" }}>
                {milestoneDefinition}
              </p>

              <div className="mt-4 flex items-center gap-5 flex-wrap text-[12px]" style={{ color: "rgba(255,255,255,0.70)" }}>
                <span className="inline-flex items-center gap-2">
                  <Clock size={14} /> 18 min total
                </span>
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={14} /> 4 lessons
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle size={14} /> Practice checkpoint included
                </span>
              </div>
            </div>

            {/* Right column — progress widget */}
            <div className="flex md:justify-end">
              <div
                className="text-center"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  minWidth: 140,
                }}
              >
                <div className="text-[22px] font-medium text-white">50%</div>
                <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Course complete
                </div>
                <div className="mt-3 h-1 w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.20)", borderRadius: 4 }}>
                  <div className="h-full" style={{ width: "50%", background: "#FFFFFF", borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b" style={{ ...BORDER_HALF, borderColor: BORDER }}>
        <div className="mx-auto" style={{ maxWidth: CONTENT_MAX_W }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { label: "Total time", value: "18 min" },
              { label: "Reading", value: "4 min" },
              { label: "Video", value: "4 min" },
              { label: "Practice", value: "10 min" },
            ].map((s, idx) => (
              <div
                key={s.label}
                className="py-4 px-4 md:px-6 text-center bg-white"
                style={idx === 0 ? undefined : { borderLeft: "0.5px solid rgba(15,23,42,0.12)" }}
              >
                <div className="text-[11px] text-slate-500">{s.label}</div>
                <div className="text-[15px] font-medium text-slate-900 mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto" style={{ maxWidth: CONTENT_MAX_W, ...CONTENT_PAD }}>
        {/* Continue nudge card */}
        <div style={{ background: TEAL, borderRadius: 10, padding: "1rem 1.25rem" }} className="text-white">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
            <div className="flex items-start gap-3">
              <span className="mt-1.5 block h-2 w-2 rounded-full bg-white" aria-hidden />
              <div className="space-y-1">
                <div className="text-[13px] font-semibold">You're halfway there — continue from Milestone 2</div>
                <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Milestone 1 is complete. Pick up where you left off below.
                </div>
              </div>
            </div>
            <Link
              href="/trainings/interview-essentials/energy-and-presence"
              data-journey-id="training-start"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-white"
              style={{ borderRadius: 8, color: TEAL }}
            >
              <Play size={14} />
              <span className="text-[13px] font-medium">Continue</span>
            </Link>
          </div>
        </div>

        {/* Section header */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-[15px] font-medium text-slate-900">What's inside</div>
          <div className="text-[12px] text-slate-500">2 milestones</div>
        </div>

        <div className="mt-3 space-y-3">
          {/* Milestone 1 — completed */}
          <div
            className="overflow-hidden transition-all hover:shadow-md"
            style={{ ...GLASS_SURFACE, borderRadius: 10 }}
          >
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0" style={{ background: "#E1F5EE" }}>
                <CheckCircle size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-500">Milestone 1</div>
                <div className="text-[14px] font-medium leading-snug" style={{ color: "rgba(15,23,42,0.32)" }}>
                  What Makes a Strong Answer
                </div>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-slate-500">
                <span>4 lessons</span>
                <ChevronDown size={18} className="text-slate-400" />
              </div>
            </div>
          </div>

          {/* Milestone 2 — active expanded */}
          <div
            className="overflow-hidden transition-all hover:shadow-md"
            style={{
              ...GLASS_SURFACE,
              borderRadius: 10,
              border: `1.5px solid ${TEAL}`,
              background: "rgba(255,255,255,0.70)",
            }}
          >
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#E6F1FB", border: `1.5px solid ${TEAL}` }}>
                <span className="block h-2 w-2 rounded-full" style={{ background: TEAL }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-500">Milestone 2</span>
                  <span style={{ background: "#E6F1FB", color: TEAL, borderRadius: 20, fontSize: 10, padding: "1px 8px" }}>
                    You're here
                  </span>
                </div>
                <div className="text-[14px] font-medium text-slate-900 leading-snug">{milestoneTitle}</div>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-slate-500">
                <span>4 lessons</span>
                <ChevronDown size={18} className="rotate-180" style={{ color: TEAL }} />
              </div>
            </div>

            <div className="border-t" style={{ ...BORDER_HALF, borderColor: BORDER }}>
              {lessons.map((l) => (
                <button
                  key={l.title}
                  type="button"
                  className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors"
                  style={{ cursor: "pointer" }}
                >
                  <div className="w-7 h-7 flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.03)", borderRadius: 6 }}>
                    <span className="text-slate-600 opacity-80">{STEP_ICONS[l.type]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-slate-900">{l.title}</div>
                    <div className="mt-0.5 text-[10px] font-semibold">
                      <span className="uppercase" style={{ color: TEAL }}>
                        {l.metaLeft}
                      </span>
                      <span className="mx-1" style={{ color: "rgba(15,23,42,0.32)" }}>
                        ·
                      </span>
                      <span style={{ color: "rgba(15,23,42,0.32)" }}>{l.metaRight}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              ))}
            </div>

            <div className="border-t flex justify-end px-5 py-4" style={{ ...BORDER_HALF, borderColor: BORDER }}>
              <Link
                href="/trainings/interview-essentials/energy-and-presence"
                data-journey-id="training-start"
                className="inline-flex items-center h-10 px-5 text-white"
                style={{ background: TEAL, borderRadius: 8 }}
              >
                Continue where you left off →
              </Link>
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

  const proofyPrompt =
    slug === "interview-essentials"
      ? "Ask Proofy — what should I focus on before my first mock?"
      : "Ask Proofy — where should I start?";

  const sentenceCase = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1);

  return (
    <div className="min-h-[calc(100vh-64px)] pb-20">

      {/* ── Editorial Hero ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 320, background: TEAL }}>
        
        <div className="relative z-10 max-w-[1020px] mx-auto px-8 lg:px-12 pt-8 pb-12 h-full flex flex-col items-center text-center">
          <Link href="/trainings" className="inline-flex items-center gap-2 text-[12px] font-semibold mb-10 transition-all hover:opacity-70 text-white">
            <ArrowRight size={14} className="rotate-180" /> Back to Training Hub
          </Link>

          <div className="flex flex-col items-center space-y-5 animate-in slide-in-from-bottom-4 duration-1000">
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white max-w-2xl">{training.title}</h1>
             <p className="text-[16px] text-white/80 max-w-xl leading-relaxed">{heroSubheadline}</p>
             
             <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-white/50 text-[13px] font-medium">
                   <Clock size={15} /> <span>{readingMins + videoMins + quizMins} min total</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-[13px] font-medium">
                   <BookOpen size={15} /> <span>{totalMilestones} milestones</span>
                </div>
             </div>

             <div className="pt-8">
               {completed ? (
                 <div className="h-12 px-8 rounded-xl flex items-center gap-3 bg-emerald-500 text-white text-[14px] font-bold shadow-xl shadow-emerald-900/20">
                   <CheckCircle size={18} /> Course Completed
                 </div>
               ) : started ? (
                 <div className="flex flex-col items-center gap-2.5">
                   <div className="flex items-center gap-3 text-white">
                     <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                       <div className="h-full bg-[#0087A8] rounded-full" style={{ width: `${pct}%` }} />
                     </div>
                     <span className="text-[13px] font-bold">{pct}% completed</span>
                   </div>
                   <p className="text-[11px] text-white/70">{progressLabel}</p>
                 </div>
               ) : (
                 <Link
                   data-journey-id={slug === "interview-essentials" ? "training-start" : undefined}
                   href={`/trainings/${slug}/${training.milestones[0].id}`}
                   className="h-12 px-8 rounded-xl flex items-center gap-2 bg-[#0087A8] text-white text-[14px] font-bold shadow-lg shadow-teal-900/40 hover:bg-[#006E89] transition-all group">
                   Start course
                   <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                 </Link>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1020px] mx-auto px-8 lg:px-12 -mt-10 relative z-20 space-y-10">

        {/* Stats strip */}
        <div style={{ ...glass, borderRadius: 16 }} className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden shadow-xl shadow-slate-900/5">
          {[
            { label: "Total time", value: `${readingMins + videoMins + quizMins} min` },
            { label: "Reading", value: `${readingMins} min` },
            { label: "Video", value: `${videoMins} min` },
            { label: "Practice", value: `${quizMins} min` },
          ].map((s) => (
            <div key={s.label} className="p-6 text-center bg-white/60">
              <p className="text-[12px] font-bold mb-1 text-[#64748B]">{s.label}</p>
              <p className="text-[18px] font-bold text-[#0F172A]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Syllabus */}
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
               <h2 className="text-[18px] font-bold text-[#0F172A]">What's inside</h2>
               <p className="text-[12px] font-semibold text-[#64748B]">{totalMilestones} Milestones</p>
            </div>
            
            <div className="space-y-3">
              {training.milestones.map((milestone, idx) => {
                const isCompleted = idx < completedMilestones;
                const isActive = idx === completedMilestones;
                const isLocked = idx > completedMilestones;
                const isOpen = openMilestone === milestone.id;

                return (
                  <div key={milestone.id} style={{ ...glass, borderRadius: 12 }} className={`overflow-hidden transition-all ${isLocked ? 'opacity-70' : ''}`}>
                    <button
                      onClick={() => setOpenMilestone(isOpen ? null : milestone.id)}
                      className="w-full flex items-center gap-5 px-6 py-5 text-left hover:bg-white/40 transition-colors group">
                      
                      {/* State icon */}
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                           <CheckCircle size={14} className="text-emerald-600" />
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-full bg-[#0087A8]/10 flex items-center justify-center shrink-0 border border-[#0087A8]/20 ring-4 ring-[#0087A8]/5">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#0087A8] animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200/50 flex items-center justify-center shrink-0 border border-slate-300/50">
                           <Lock size={12} className="text-slate-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[12px] tracking-widest font-bold text-[#94A3B8]">
                            Milestone {idx + 1}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 bg-[#0087A8]/10 text-[#0087A8] text-[9px] font-bold rounded-sm border border-[#0087A8]/10">
                              You're here
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[16px] font-bold ${isLocked ? 'text-[#64748B]' : 'text-[#0F172A]'}`}
                          style={isCompleted ? { opacity: 0.6 } : undefined}
                        >
                          {milestone.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className="text-[11px] font-semibold text-[#94A3B8]"
                          style={isCompleted ? { opacity: 0.6 } : undefined}
                        >
                          {milestone.steps.length} lessons
                        </span>
                        <ChevronDown size={18} className={`text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Step peeking (enabled for all, even locked) */}
                    {isOpen && (
                      <div className="bg-white/40 border-t border-white/60">
                        <div className="divide-y divide-[#0F172A]/5">
                           {milestone.steps.map((step, si) => (
                             <div key={si} className="flex items-center gap-4 px-8 py-3.5">
                               <div className="text-[#64748B] shrink-0 opacity-60">
                                 {STEP_ICONS[step.type]}
                               </div>
                               <div className="flex-1">
                                 <p className="text-[13px] font-medium text-[#0F172A]">
                                   {slug === "interview-essentials" && step.title === "Watch: Building interview presence"
                                     ? "Building interview presence"
                                     : step.title}
                                 </p>
                                 <p className="text-[12px] text-[#94A3B8] font-bold mt-0.5">
                                   {sentenceCase(step.type)} · {step.duration}
                                 </p>
                               </div>
                               {isCompleted && <CheckCircle size={12} className="text-emerald-500" />}
                               {isLocked && <Lock size={10} className="text-slate-300" />}
                             </div>
                           ))}
                        </div>

                        <div className="px-8 py-5 border-t border-white/60 bg-white/20">
                          {isLocked ? (
                            <button disabled className="h-10 px-6 rounded-xl bg-slate-100 text-slate-400 text-[13px] font-bold flex items-center gap-2 cursor-not-allowed border border-slate-200 shadow-sm">
                               <Lock size={14} /> Milestone Locked
                            </button>
                          ) : (
                            <Link
                             data-journey-id={
                               slug === "interview-essentials" && isActive ? "training-start" : undefined
                             }
                             href={`/trainings/${slug}/${milestone.id}`}
                              className={`h-10 px-6 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all w-fit group/btn ${
                                isActive 
                                  ? "bg-[#0087A8] text-white shadow-lg shadow-[#0087A8]/20 hover:bg-[#006E89]" 
                                  : "bg-white text-[#0F172A] border border-slate-200 shadow-sm hover:bg-slate-50"
                              }`}>
                              {isCompleted
                                ? "Review Milestone"
                                : slug === "interview-essentials" && isActive
                                  ? "Continue where you left off →"
                                  : slug === "interview-essentials"
                                    ? "Start course"
                                  : isActive
                                    ? "Continue learning"
                                    : "Start Milestone"} 
                              <ArrowRight size={16} className={`transition-transform group-hover/btn:translate-x-1 ${isActive ? "text-white" : "text-[#0F172A]"}`} />
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
        </div>

      </div>
    </div>
  );
}

