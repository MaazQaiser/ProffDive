"use client";
import { useState, useEffect } from "react";
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

function VideoGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[12px]" onClick={onClose} />
      <div className="relative w-full max-w-[840px] aspect-video bg-black rounded-[24px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.4)] border border-white/10 group">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 mb-6 group-hover:scale-110 transition-transform cursor-pointer">
            <Play fill="white" color="white" size={32} className="ml-1" />
          </div>
          <h3 className="text-white text-[20px] font-semibold mb-2">ProofDive Quick Guide</h3>
          <p className="text-white/50 text-[14px]">Click to start your onboarding tour</p>
        </div>
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-[110]">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

// ── Exported Page ──────────────────────────────────────────────
export default function NewUserDashboard() {
  const { user } = useUser();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenGuide");
    if (!hasSeen) {
      const timer = setTimeout(() => setShowGuide(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeGuide = () => {
    setShowGuide(false);
    localStorage.setItem("hasSeenGuide", "true");
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
                <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/60">Profile readiness</span>
                <span className="text-[11px] font-bold text-white">{PROFILE_PCT}% complete</span>
                <span className="text-[10px] text-white/50">· {user.role ? `Preparing for ${user.role}` : 'Complete your StoryBoard to improve this'}</span>
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
          <p className="text-[15px] text-[#475569] mt-4">
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
                   <h3 className="text-[15px] font-semibold text-[#0F172A] mb-1.5">Mock Interview</h3>
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
                   <h3 className="text-[15px] font-semibold text-[#0F172A] mb-1.5">StoryBoard</h3>
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
                   <h3 className="text-[15px] font-semibold text-[#0F172A] mb-1.5">Essential Trainings</h3>
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
