"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { use, useState } from "react";
import { getTraining, unsplashUrl } from "@/lib/trainings-data";
import { ChevronDown, ChevronRight, Clock, Users, CheckCircle, Lock, PlayCircle, BookOpen, HelpCircle, Code2, ArrowRight } from "lucide-react";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const TEAL = "#0087A8";

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

export default function TrainingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const training = getTraining(slug);
  if (!training) notFound();

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

  return (
    <div className="min-h-[calc(100vh-64px)] pb-20">

      {/* ── Editorial Hero ── */}
      <div className="relative overflow-hidden bg-slate-900" style={{ minHeight: 320 }}>
        {/* Background image & deep gradients */}
        <Image
          src={unsplashUrl(training.unsplashId, 1400)}
          alt={training.title}
          fill
          className="object-cover opacity-60"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="relative z-10 max-w-[1020px] mx-auto px-8 lg:px-12 pt-8 pb-12 h-full flex flex-col items-center text-center">
          <Link href="/trainings" className="inline-flex items-center gap-2 text-[12px] font-semibold mb-10 transition-all hover:opacity-70 text-white/60">
            <ArrowRight size={14} className="rotate-180" /> Back to Training Hub
          </Link>

          <div className="flex flex-col items-center space-y-5 animate-in slide-in-from-bottom-4 duration-1000">
             <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-[0.2em] px-3 py-1 bg-[#0087A8] text-white rounded-full">
                  {training.pillar}
                </span>
                <span className="text-[12px] font-bold uppercase tracking-[0.2em] px-3 py-1 bg-white/10 backdrop-blur-md text-white/80 rounded-full border border-white/10">
                  {training.difficulty}
                </span>
             </div>
             
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white max-w-2xl">{training.title}</h1>
             <p className="text-[16px] text-white/70 max-w-xl leading-relaxed">{training.description}</p>
             
             <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-white/50 text-[13px] font-medium">
                   <Clock size={15} /> <span>{readingMins + videoMins + quizMins} min total</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-[13px] font-medium">
                   <BookOpen size={15} /> <span>{totalMilestones} milestones</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-[13px] font-medium">
                   <Users size={15} /> <span>{training.enrolled.toLocaleString()} enrolled</span>
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
                   <p className="text-[11px] text-white/50">Pick up where you left off below</p>
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
            { label: "Course Length", value: `${readingMins + videoMins + quizMins} min` },
            { label: "Total Reading", value: `${readingMins} min` },
            { label: "Video Lessons", value: `${videoMins} min` },
            { label: "Practice Quizzes", value: `${quizMins} min` },
          ].map((s) => (
            <div key={s.label} className="p-6 text-center bg-white/60">
              <p className="text-[12px] uppercase tracking-widest font-bold mb-1 text-[#64748B]">{s.label}</p>
              <p className="text-[18px] font-bold text-[#0F172A]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Syllabus */}
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
               <h2 className="text-[18px] font-bold text-[#0F172A]">Course Syllabus</h2>
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
                          <span className="text-[12px] uppercase tracking-widest font-bold text-[#94A3B8]">
                            Milestone {idx + 1}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 bg-[#0087A8]/10 text-[#0087A8] text-[9px] font-bold rounded-sm border border-[#0087A8]/10">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className={`text-[16px] font-bold ${isLocked ? 'text-[#64748B]' : 'text-[#0F172A]'}`}>
                          {milestone.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-semibold text-[#94A3B8]">
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
                                 <p className="text-[13px] font-medium text-[#0F172A]">{step.title}</p>
                                 <p className="text-[12px] text-[#94A3B8] uppercase tracking-wider font-bold mt-0.5">{step.type} · {step.duration}</p>
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

