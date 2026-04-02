"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mic, BookOpen, Zap, X, Play } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { PathwayBanner } from "@/components/pathway-banner";

const PROFILE_PCT = 68;

const glassSquare: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
  borderRadius: 12,
}

function AboutProofDiveModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 sm:p-12">
      <div
        className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-[14px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[620px] rounded-[24px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] border border-white/10 bg-gradient-to-br from-[#0B1220] via-[#0F172A] to-[#0B1220]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="min-w-0">
              <p className="text-white/60 text-[12px] uppercase tracking-[0.18em] font-bold">
                About ProofDive
              </p>
              <h3 className="text-white text-[24px] sm:text-[26px] font-semibold tracking-tight mt-2">
                Practice answers. Build story. Measure readiness.
              </h3>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-white/70 text-[14px] leading-relaxed">
            ProofDive helps you prepare with structure: learn the essentials, craft interview-ready
            stories, run mock interviews, and review AI feedback so you always know what to improve
            next.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-[16px] border border-white/10 bg-white/5 p-4">
              <p className="text-white text-[12px] font-bold mb-1">Guided practice</p>
              <p className="text-white/65 text-[12px] leading-relaxed">
                A clear path that reduces decision fatigue.
              </p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/5 p-4">
              <p className="text-white text-[12px] font-bold mb-1">Better storytelling</p>
              <p className="text-white/65 text-[12px] leading-relaxed">
                Turn experience into reusable answers.
              </p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/5 p-4">
              <p className="text-white text-[12px] font-bold mb-1">Actionable feedback</p>
              <p className="text-white/65 text-[12px] leading-relaxed">
                Strengths, gaps, and next steps—fast.
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="h-10 px-4 rounded-[12px] text-[13px] font-bold text-white/75 hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              onClick={onClose}
              className="h-10 px-5 rounded-[12px] text-[13px] font-bold text-[#0B1220] bg-white hover:bg-white/90 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorksVideoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 sm:p-12">
      <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-[14px]" onClick={onClose} />
      <div className="relative w-full max-w-[920px] rounded-[24px] overflow-hidden shadow-[0_32px_90px_rgba(0,0,0,0.50)] border border-black/10 bg-white">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="min-w-0">
              <p className="text-[#64748B] text-[12px] uppercase tracking-[0.18em] font-bold">
                How it works
              </p>
              <h3 className="text-[#0F172A] text-[22px] sm:text-[24px] font-semibold tracking-tight mt-2">
                A 2‑minute walkthrough of ProofDive
              </h3>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="rounded-[18px] border border-black/10 bg-[#0B1220] overflow-hidden">
            <div className="aspect-video w-full">
              <video
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="metadata"
                src="/how-it-works.mp4"
              />
            </div>
          </div>

          <p className="mt-4 text-[#64748B] text-[12px]">
            To replace this video, add your file at <span className="font-semibold">public/how-it-works.mp4</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function VideoGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [showAbout, setShowAbout] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowAbout(false);
      setShowHowItWorks(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <div className="absolute inset-0 bg-[#0F172A]/35 backdrop-blur-[10px]" onClick={onClose} />
      <div className="relative w-full max-w-[760px] rounded-[24px] overflow-hidden shadow-[0_24px_70px_rgba(2,6,23,0.28)] border border-black/10 bg-white">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0">
              <p className="text-[#64748B] text-[12px] uppercase tracking-[0.18em] font-bold">
                Welcome to ProofDive
              </p>
              <h2 className="text-[#0F172A] text-[26px] sm:text-[30px] font-semibold tracking-tight mt-2">
                Get interview-ready with a clear guided path.
              </h2>
              <p className="text-[#475569] text-[14px] leading-relaxed mt-3 max-w-[60ch]">
                Start with practice, craft your story, test it in a mock, then review your AI analytics
                report to know exactly what to improve next.
              </p>
            </div>

            <button
              onClick={onClose}
              className="shrink-0 w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-[18px] border border-black/10 bg-[#F8FAFC] p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[#0F172A] text-[14px] font-semibold">Know about ProofDive</p>
                  <p className="text-[#475569] text-[12px] leading-relaxed mt-1">
                    Learn what we do and how the guided path helps you prepare with structure.
                  </p>
                </div>

                <button
                  onClick={() => setShowHowItWorks(true)}
                  className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-[12px] text-[12px] font-bold text-white bg-[#0087A8] hover:bg-[#007592] border border-[#007592]/20 transition-colors"
                >
                  <Play size={14} className="opacity-95" />
                  How it works
                </button>
              </div>
            </div>

            <div className="rounded-[18px] border border-black/10 bg-white p-5">
              <div className="mb-3">
                <p className="text-[#64748B] text-[12px] uppercase tracking-[0.18em] font-bold">
                  Your guided path
                </p>
                <p className="text-[#64748B] text-[12px] mt-1">
                  Follow these steps in order. No pressure—do what you can today.
                </p>
              </div>

              <div className="relative">
                <div className="absolute left-[14px] top-[14px] bottom-[14px] w-px bg-[#E2E8F0]" />
                {[
                  {
                    title: "Practice first",
                    desc: "Do a quick warm‑up to get comfortable speaking clearly and concisely.",
                  },
                  {
                    title: "Craft your story",
                    desc: "Turn your experience into a reusable, interview‑ready narrative.",
                  },
                  {
                    title: "Mock interview",
                    desc: "Answer realistic questions under pressure and build confidence.",
                  },
                  {
                    title: "Analytics Report & Ai Coaching",
                    desc: "Review strengths, gaps, and the exact next actions to improve.",
                  },
                ].map((s, idx) => (
                  <div
                    key={s.title}
                    className="relative flex items-start gap-4 py-3 pl-10"
                  >
                    <div
                      className={[
                        "absolute left-0 top-3 w-7 h-7 rounded-full flex items-center justify-center border",
                        idx === 0
                          ? "bg-[#0087A8] border-[#0087A8] text-white"
                          : "bg-white border-[#CBD5E1] text-[#0F172A]",
                      ].join(" ")}
                    >
                      <span className="text-[12px] font-bold">{idx + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#0F172A] text-[13px] font-semibold">{s.title}</p>
                      <p className="text-[#475569] text-[12px] leading-relaxed mt-1">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="h-11 px-4 rounded-[14px] text-[13px] font-bold text-[#475569] hover:text-[#0F172A] transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={onClose}
              className="h-11 px-6 rounded-[14px] text-[13px] font-bold text-white bg-[#0087A8] hover:bg-[#007592] transition-colors"
            >
              Let’s get started
            </button>
          </div>

          <p className="mt-4 text-[#94A3B8] text-[12px]">
            You can reopen this anytime from the dashboard.
          </p>
        </div>
      </div>

      <AboutProofDiveModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <HowItWorksVideoModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </div>
  );
}

// ── Exported Page ──────────────────────────────────────────────
export default function NewUserDashboard() {
  const { user } = useUser();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(true), 450);
    return () => clearTimeout(timer);
  }, []);

  const closeGuide = () => {
    setShowGuide(false);
  };

  return (
    <div>
      <VideoGuideModal isOpen={showGuide} onClose={closeGuide} />

      {/* §1 Profile Readiness Ticker — primary background */}
      <div style={{
        background: "linear-gradient(90deg, #0087A8 0%, #006E89 100%)",
        borderBottom: "1px solid rgba(0,0,0,0.10)",
      }}>
        <div className="max-w-[1280px] mx-auto px-8 lg:px-14 py-3">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[12px] uppercase tracking-[0.18em] font-bold text-white/60">Profile readiness</span>
                <span className="text-[11px] font-bold text-white">{PROFILE_PCT}% complete</span>
                <span className="text-[12px] text-white/50">· {user.role ? `Preparing for ${user.role}` : 'Complete your StoryBoard to improve this'}</span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.20)", borderRadius: 0 }}>
                <div style={{ height: "100%", width: `${PROFILE_PCT}%`, background: "rgba(255,255,255,0.90)", transition: "width 0.8s ease" }} />
              </div>
            </div>
            <Link href="/profile"
              className="shrink-0 inline-flex items-center gap-1.5 h-8 px-4 text-[11px] font-bold transition-opacity hover:opacity-80"
              style={{ borderRadius: 6, background: "rgba(255,255,255,0.18)", color: "#FFF", border: "1px solid rgba(255,255,255,0.30)" }}>
              Complete profile <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 py-12 space-y-12">
        
        {/* Top Hero */}
        <div className="text-center space-y-3 mb-10 animate-in slide-in-from-bottom-3 fade-in duration-500">
          <p className="text-[16px] font-medium text-[#0F172A]">Hi there, {user.name} 👋</p>
          <h1 className="text-[36px] font-semibold tracking-tight text-[#0F172A] leading-tight">
            Let’s get {user.name} interview-ready
          </h1>
          <p className="text-[16px] text-[#475569] mt-4">
            Start with the guided path or jump into the part you want to work on first.
          </p>
        </div>

        {/* Section 1 — Guided Path */}
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
          <PathwayBanner 
            label="Get started with coaching created for you"
            title="A clear path to help you prepare with more structure and confidence."
            steps={["Learn the essentials", "Craft your story", "Test it in a mock"]}
            footerText="Move through the right steps to build stronger interview readiness."
            buttonText="let's Get Started"
            buttonHref="/mock/setup"
          />
        </div>

        {/* Section 2 — Action Cards */}
        <div className="animate-in slide-in-from-bottom-5 fade-in duration-1000">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div style={{ ...glassSquare }} className="p-5 flex flex-col items-start hover:shadow-md transition-all group border border-white/40">
                   <div className="w-9 h-9 rounded-[8px] bg-[#F59E0B]/10 flex items-center justify-center mb-4 shrink-0 transition-transform group-hover:scale-105">
                      <Mic size={18} className="text-[#F59E0B]" />
                   </div>
                   <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1.5">Mock Interview</h3>
                   <p className="text-[12px] text-[#475569] leading-relaxed mb-5 flex-1">
                      Take a practice interview and get scored feedback on your performance under pressure.
                   </p>
                   <Link href="/mock/setup" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0087A8] hover:opacity-70 transition-opacity group">
                      Start interview
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                   </Link>
                </div>

                <div style={{ ...glassSquare }} className="p-5 flex flex-col items-start hover:shadow-md transition-all group border border-white/40">
                   <div className="w-9 h-9 rounded-[8px] bg-[#10B981]/10 flex items-center justify-center mb-4 shrink-0 transition-transform group-hover:scale-105">
                      <BookOpen size={18} className="text-[#10B981]" />
                   </div>
                   <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1.5">StoryBoard</h3>
                   <p className="text-[12px] text-[#475569] leading-relaxed mb-5 flex-1">
                      Organize your experience into stronger, more reusable interview answers.
                   </p>
                   <Link href="/storyboard" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0087A8] hover:opacity-70 transition-opacity group">
                      Open StoryBoard
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                   </Link>
                </div>

                <div style={{ ...glassSquare }} className="p-5 flex flex-col items-start hover:shadow-md transition-all group border border-white/40">
                   <div className="w-9 h-9 rounded-[8px] bg-[#0087A8]/10 flex items-center justify-center mb-4 shrink-0 transition-transform group-hover:scale-105">
                      <Zap size={18} className="text-[#0087A8]" />
                   </div>
                   <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1.5">Essential Trainings</h3>
                   <p className="text-[12px] text-[#475569] leading-relaxed mb-5 flex-1">
                      Learn the basics of strong interview structure, delivery, and response quality.
                   </p>
                   <Link href="/trainings" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0087A8] hover:opacity-70 transition-opacity group">
                      Open trainings
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                   </Link>
                </div>
             </div>
        </div>
        
        <div className="h-10" />
      </div>
    </div>
  );
}
