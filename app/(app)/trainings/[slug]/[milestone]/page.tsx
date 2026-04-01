"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { use, useState, useEffect } from "react";
import { getTraining, unsplashUrl } from "@/lib/trainings-data";
import {
  CheckCircle, ChevronLeft, ChevronRight, Play, BookOpen,
  HelpCircle, Code2, RotateCcw, Lock, Clock, ArrowLeft,
  Target, Trophy, Menu, X, ArrowRight, PlayCircle
} from "lucide-react";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const TEAL = "#0087A8";

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  borderRight: "1px solid rgba(255,255,255,0.80)",
  boxShadow: "10px 0 30px rgba(0,0,0,0.02)",
};

const navGlass: React.CSSProperties = {
  background: "rgba(255,255,255,0.60)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderTop: "1px solid rgba(255,255,255,0.80)",
  boxShadow: "0 -2px 20px rgba(0,0,0,0.03)",
};

type StepKey = "reading" | "video" | "quiz" | "exercise";
const STEP_ORDER: StepKey[] = ["reading", "video", "quiz", "exercise"];

const STEP_META: Record<StepKey, { label: string; icon: any }> = {
  reading:  { label: "Reading", icon: BookOpen },
  video:    { label: "Video", icon: PlayCircle },
  quiz:     { label: "Quiz", icon: HelpCircle },
  exercise: { label: "Workshop", icon: Code2 },
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

function ReadingStep({ step }: { step: any }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0087A8]">
           <BookOpen size={14} /> <span>Course Material · {step.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] leading-[1.2]">{step.title}</h1>
      </div>

      {step.pullQuote && (
        <div className="relative pl-8 py-2">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0087A8] rounded-full opacity-40" />
           <p className="text-[20px] font-medium text-[#475569] italic leading-relaxed">"{step.pullQuote}"</p>
        </div>
      )}

      <div className="prose prose-slate max-w-none prose-p:text-[17px] prose-p:leading-[1.8] prose-p:text-[#334155]">
         {step.body?.split('\n\n').map((p: string, i: number) => (
           <p key={i}>{p.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
         ))}
      </div>

      {step.keyTakeaway && (
        <div className="p-8 rounded-[24px] bg-[#0087A8]/5 border border-[#0087A8]/10 flex gap-6">
           <div className="w-12 h-12 rounded-2xl bg-[#0087A8] flex items-center justify-center shrink-0 shadow-lg shadow-teal-900/20 text-white">
              <Target size={24} />
           </div>
           <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#0087A8] mb-2">The Bottom Line</p>
              <p className="text-[16px] font-semibold text-[#0F172A] leading-relaxed">{step.keyTakeaway}</p>
           </div>
        </div>
      )}
    </div>
  );
}

function VideoStep({ step, trainingUnsplashId }: { step: any; trainingUnsplashId: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0087A8]">
           <PlayCircle size={14} /> <span>Video Lecture · {step.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] leading-[1.2]">{step.title}</h1>
      </div>

      <div 
        onClick={() => setPlaying(true)}
        className="relative aspect-video rounded-[32px] overflow-hidden group cursor-pointer shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200"
      >
        <Image src={unsplashUrl(trainingUnsplashId, 1200)} alt="Thumbnail" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" unoptimized />
        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors" />
        
        {!playing ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30 group-hover:scale-110 transition-transform">
                <div className="w-14 h-14 rounded-full bg-[#0087A8] flex items-center justify-center text-white shadow-xl">
                   <Play size={24} fill="currentColor" className="ml-1" />
                </div>
             </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
             <PlayCircle size={48} className="opacity-20" />
             <p className="text-[14px] font-medium opacity-60">Initializing high-fidelity player...</p>
          </div>
        )}
      </div>

      {step.bulletPoints && (
        <div className="p-8 rounded-[24px] bg-white border border-slate-200 shadow-sm space-y-5">
           <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Key Themes</p>
           <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {step.bulletPoints.map((b: string, i: number) => (
                <li key={i} className="flex gap-3 text-[14px] text-[#475569] leading-tight">
                   <CheckCircle size={16} className="text-[#0087A8] shrink-0 mt-0.5" />
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

export default function MilestonePage({ params }: { params: Promise<{ slug: string; milestone: string }> }) {
  const { slug, milestone } = use(params);
  const training = getTraining(slug);
  if (!training) notFound();

  const milestoneData = training.milestones.find(m => m.id === milestone);
  if (!milestoneData) notFound();

  const milestoneIdx = training.milestones.findIndex(m => m.id === milestone);
  const nextMilestone = training.milestones[milestoneIdx + 1];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [complete, setComplete] = useState(false);

  const currentKey = STEP_ORDER[currentStepIdx];
  const currentStep = milestoneData.steps.find(s => s.type === currentKey) ?? milestoneData.steps[currentStepIdx];

  // Auto-scroll to top on step change
  useEffect(() => {
    const main = document.getElementById('zen-scroll');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStepIdx]);

  if (complete) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center p-8 space-y-8 animate-in fade-in duration-1000" style={{ background: "linear-gradient(to bottom, #FAFEFF, #CFDCE1)" }}>
        <div className="w-24 h-24 rounded-[40px] bg-emerald-500/10 flex items-center justify-center text-[48px] shadow-2xl shadow-emerald-500/10 border border-emerald-500/20">
           🎉
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-[#0F172A]">Milestone Complete</h1>
          <p className="text-[16px] text-slate-500 max-w-sm mx-auto">You've mastered the concepts in <strong>{milestoneData.title}</strong>. Ready for what's next?</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
           {nextMilestone ? (
             <Link href={`/trainings/${slug}/${nextMilestone.id}`} className="h-12 px-8 rounded-full bg-[#0087A8] text-white text-[14px] font-bold shadow-xl shadow-teal-900/20 flex items-center gap-2 hover:scale-105 transition-all">
                Next Milestone <ArrowRight size={18} />
             </Link>
           ) : (
             <Link href={`/trainings/${slug}`} className="h-12 px-8 rounded-full bg-emerald-600 text-white text-[14px] font-bold shadow-xl shadow-emerald-900/20 flex items-center gap-2">
                <Trophy size={18} /> Finish Course
             </Link>
           )}
           <Link href={`/trainings/${slug}`} className="h-12 px-8 rounded-full bg-slate-100 text-slate-600 text-[14px] font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
              Return to Syllabus
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 flex overflow-hidden" style={{ background: "linear-gradient(to bottom, #FAFEFF, #CFDCE1)" }}>
      
      {/* ── Sidebar ── */}
      <aside 
        style={{ ...glass }}
        className={`relative z-30 flex flex-col transition-all duration-500 ease-in-out ${sidebarOpen ? 'w-[320px]' : 'w-0 -translate-x-full'}`}
      >
        <div className="p-8 space-y-10 overflow-y-auto flex-1 custom-scrollbar">
           <div className="space-y-2">
              <Link href={`/trainings/${slug}`} className="text-[10px] font-bold uppercase tracking-widest text-[#0087A8] flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                 <ArrowLeft size={12} /> {training.title}
              </Link>
              <h3 className="text-[18px] font-bold text-[#0F172A] leading-tight">{milestoneData.title}</h3>
           </div>

           <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Milestone Progress</p>
              {STEP_ORDER.map((key, i) => {
                const Icon = STEP_META[key].icon;
                const isActive = currentStepIdx === i;
                const isPast = currentStepIdx > i;
                return (
                  <button 
                    key={key}
                    onClick={() => setCurrentStepIdx(i)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[20px] text-left transition-all group ${isActive ? 'bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-200' : 'hover:bg-white/50'}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-[#0087A8] text-white' : isPast ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                       {isPast ? <CheckCircle size={14} /> : <Icon size={14} />}
                    </div>
                    <div>
                       <p className={`text-[13px] font-bold ${isActive ? 'text-[#0F172A]' : 'text-slate-500'}`}>{STEP_META[key].label}</p>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Step {i+1}</p>
                    </div>
                  </button>
                );
              })}
           </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white/40">
         
         {/* Top Bar */}
         <div className="h-14 px-8 border-b border-slate-200/50 flex items-center justify-between bg-white/80 backdrop-blur-md relative z-20">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
               {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex gap-1">
               {STEP_ORDER.map((_, i) => (
                 <div key={i} className={`h-1 w-8 rounded-full transition-all duration-500 ${currentStepIdx >= i ? 'bg-[#0087A8]' : 'bg-slate-200'}`} />
               ))}
            </div>

            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
               {currentStepIdx + 1} / {STEP_ORDER.length}
            </p>
         </div>

         {/* Content Viewport */}
         <div id="zen-scroll" className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-[760px] mx-auto px-10 py-20 pb-40">
               {currentKey === "reading" && <ReadingStep step={currentStep} />}
               {currentKey === "video" && <VideoStep step={currentStep} trainingUnsplashId={training.unsplashId} />}
               {currentKey === "quiz" && (
                 <div className="flex flex-col items-center py-20 text-center space-y-6">
                    <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20 animate-bounce">
                       <HelpCircle size={32} />
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-2xl font-bold">Quick Check-in</h2>
                       <p className="text-slate-500 text-[14px]">Let's verify your understanding before the workshop.</p>
                    </div>
                    <button onClick={() => setCurrentStepIdx(3)} className="px-8 py-3 bg-[#0087A8] text-white rounded-full text-[13px] font-bold hover:bg-[#006E89] transition-all shadow-lg shadow-teal-900/20">
                       Launch Quiz
                    </button>
                 </div>
               )}
               {currentKey === "exercise" && (
                 <div className="flex flex-col items-center py-20 text-center space-y-6">
                    <div className="w-16 h-16 rounded-[24px] bg-[#0087A8]/10 flex items-center justify-center text-[#0087A8] border border-[#0087A8]/20 ring-4 ring-[#0087A8]/5">
                       <Code2 size={32} />
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-2xl font-bold">Interactive Workshop</h2>
                       <p className="text-slate-500 text-[14px]">Apply these principles in a simulated scenario.</p>
                    </div>
                    <button onClick={() => setComplete(true)} className="px-10 py-4 bg-emerald-600 text-white rounded-full text-[14px] font-bold shadow-xl shadow-emerald-900/20 hover:scale-105 transition-all">
                       Begin Workshop
                    </button>
                 </div>
               )}
            </div>
         </div>

         {/* Navigation Bar */}
         <div style={{ ...navGlass }} className="absolute bottom-6 inset-x-8 h-20 rounded-[28px] ring-1 ring-slate-900/5 px-8 flex items-center justify-between z-40">
            <button 
              onClick={() => setCurrentStepIdx(Math.max(0, currentStepIdx - 1))}
              disabled={currentStepIdx === 0}
              className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-[#0087A8] disabled:opacity-0 transition-all"
            >
               <ChevronLeft size={20} /> Previous
            </button>

            <div className="hidden md:flex flex-col items-center">
               <p className="text-[10px] font-bold uppercase tracking-widest text-[#0087A8] mb-0.5">Currently Studying</p>
               <p className="text-[14px] font-black text-[#0F172A]">{currentStep?.title || "Overview"}</p>
            </div>

            <button 
              onClick={() => {
                if (currentStepIdx < STEP_ORDER.length - 1) setCurrentStepIdx(currentStepIdx + 1);
                else setComplete(true);
              }}
              className="px-6 h-12 bg-[#0087A8] text-white rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-[#006E89] transition-all shadow-lg shadow-teal-900/20"
            >
               {currentStepIdx < STEP_ORDER.length - 1 ? "Next Step" : "Complete Milestone"} <ArrowRight size={18} />
            </button>
         </div>

      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
}
