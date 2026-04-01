"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, ChevronRight, CornerDownLeft, RefreshCw, Send, Sparkles } from "lucide-react";

// --- Tokens ---
const TEAL = "#0087A8";
const G: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.85)",
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
};

const STAGES = [
  "Analyzing context and constraints...",
  "Extracting leadership actions...",
  "Quantifying business results...",
  "Polishing narrative flow..."
];

const MOCK_STORY_PARAGRAPHS = [
  "During my time at Acme Corp, we faced a critical challenge: our mobile onboarding completion rate dropped by 25% following a major iOS update. This trend directly threatened our Q2 user acquisition targets, posing an estimated $1.2M risk in lost projected revenue if left unresolved.",
  "Instead of guessing or immediately rolling back the update—which engineering pushed for—I proposed a phased diagnostic approach. I pulled the Mixpanel logs and correlated the drop-offs with specific hardware profiles, identifying a silent memory leak that was predominantly affecting users on older devices, specifically the iPhone 8 and X models.",
  "Understanding the severity, I immediately gathered the mobile engineering lead and our principal UX designer. I reframed the problem from a 'technical failure' to a 'user continuity issue', which helped align the team on finding a rapid workaround. We prioritized a lightweight, low-memory fallback flow over a complete architectural rewrite to minimize engineering time while still unblocking the core funnel.",
  "To execute, I broke the work into a dedicated, two-week 'war room' sprint. I established daily 15-minute syncs specifically focused on unblocking QA and backend dependencies. When we encountered a bottleneck with the legacy authentication token size, I negotiated a temporary caching solution with the security team that bypassed the heavy lifting on the client side.",
  "As a result, we successfully deployed a hotfix within 48 hours of identifying the root cause. By the end of the full 2-week sprint, not only had the crash rate returned to absolute zero across all devices, but the newly streamlined fallback flow actually proved more efficient. It improved overall onboarding completion by 12% above our previous baseline.",
  "Looking back, this incident taught me the immense value of cross-functional alignment during a crisis. The team subsequently adopted this 'graceful degradation' fallback mechanism as a standard requirement for all future major iOS feature releases, securing our core funnels against similar future regressions."
];

export default function CraftingPage() {
  const router = useRouter();
  
  // Progress states
  const [activeStage, setActiveStage] = useState(0);
  const [paragraphsRevealed, setParagraphsRevealed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Review states
  const [comment, setComment] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Animate through the stages
  useEffect(() => {
    const executeSequence = async () => {
      // Very fast for dev/demo purposes, but feels sequential
      
      // Stage 0 -> 1
      await new Promise(r => setTimeout(r, 1200));
      setActiveStage(1);
      
      // Stage 1 -> 2 (reveal para 1 & 2)
      await new Promise(r => setTimeout(r, 1000));
      setParagraphsRevealed(2);
      setActiveStage(2);
      
      // Stage 2 -> 3 (reveal para 3 & 4)
      await new Promise(r => setTimeout(r, 1500));
      setParagraphsRevealed(4);
      setActiveStage(3);

      // Finish (reveal remaining paragraphs 5 & 6)
      await new Promise(r => setTimeout(r, 1500));
      setParagraphsRevealed(6);
      setIsComplete(true);
    };

    if (!isRegenerating) {
      executeSequence();
    } else {
      // If user hit regenerate, reset and run again
      setActiveStage(0);
      setParagraphsRevealed(0);
      setIsComplete(false);
      setIsRegenerating(false);
    }
  }, [isRegenerating]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#F8F9FC]">
      <div className="max-w-[760px] mx-auto w-full px-8 py-14 flex-1 flex flex-col">
        
        {/* Header Section */}
        <div className="text-center max-w-[700px] mx-auto mb-10 mt-6 flex flex-col items-center">
          <p className="text-[17px] font-medium text-slate-800 mb-3 flex items-center justify-center gap-2">
            <Sparkles size={16} className={!isComplete ? "animate-pulse" : ""} style={{ color: TEAL }} />
            {isComplete ? "Generation complete" : "Crafting in progress..."}
          </p>
          <h1 className="text-4xl md:text-[44px] font-bold tracking-tight text-slate-900 mb-4 leading-[1.15]">
            {isComplete ? "Your Story is Ready" : "Working on your narrative"}
          </h1>
          <p className="text-[18px] text-slate-600 max-w-[500px]">
             {isComplete 
              ? "Review your CAR-optimized story below and refine it if needed." 
              : "AI is turning your raw inputs into an elite, interview-ready behavioral response."}
          </p>
        </div>

        {/* Dynamic Checklist */}
        {!isComplete && (
          <div className="flex flex-col gap-3 mb-12 max-w-[400px] mx-auto w-full">
            {STAGES.map((stage, idx) => {
              const isActive = activeStage === idx;
              const isDone = activeStage > idx;
              
              let statusIcon = null;
              if (isDone) {
                statusIcon = <CheckCircle2 size={16} className="text-emerald-500 transition-all scale-100" />;
              } else if (isActive) {
                statusIcon = <RefreshCw size={14} className="animate-spin transition-all scale-100" style={{ color: TEAL }} />;
              } else {
                statusIcon = <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />;
              }

              return (
                <div key={idx} className="flex items-center gap-3 transition-opacity duration-500" style={{ opacity: isDone || isActive ? 1 : 0.3 }}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    {statusIcon}
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: isDone || isActive ? "#0F172A" : "rgba(15,23,42,0.4)" }}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        )}


        {/* Streamed Story Container */}
        <div style={G} className="w-full flex-1 p-8 md:p-10 mb-8 max-h-[600px] overflow-y-auto custom-scrollbar">
          <p className="text-[10px] uppercase font-bold tracking-widest mb-6" style={{ color: "rgba(15,23,42,0.3)" }}>
            Draft 1
          </p>
          <div className="space-y-6">
            {MOCK_STORY_PARAGRAPHS.map((text, idx) => (
              <p 
                key={idx} 
                className={`text-[15px] leading-[1.8] transition-all duration-1000 transform ${idx < paragraphsRevealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                style={{ color: "rgba(15,23,42,0.85)" }}
              >
                {text}
              </p>
            ))}
          </div>

          {/* Typewriter cursor for active generation */}
          {!isComplete && (
            <div className="mt-4 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[#0087A8]/50 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#0087A8]/50 animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="w-2 h-2 rounded-full bg-[#0087A8]/50 animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          )}
        </div>

        {/* Review Actions (Only show when complete) */}
        <div className={`transition-all duration-700 ${isComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
          
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2.5 mb-5 justify-center md:justify-start">
            {[
              { icon: "🎭", text: "Make it more dramatic" },
              { icon: "🔍", text: "Add more details" },
              { icon: "⚙️", text: "Emphasize technical depth" },
              { icon: "🚀", text: "Focus on leadership" },
            ].map((sugg, i) => (
              <button
                key={i}
                onClick={() => { setComment(sugg.text); setIsRegenerating(true); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold rounded-full border border-slate-200/60 bg-white/60 text-slate-600 hover:border-[#0087A8]/40 hover:text-[#0087A8] hover:shadow-sm transition-all shadow-[#0087A8]/5"
              >
                <span>{sugg.icon}</span> {sugg.text}
              </button>
            ))}
          </div>

          {/* Refine / Comment Input */}
          <div className="relative mb-6 group">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Give feedback to refine (e.g. 'Make the action sound more technical...')"
              className="w-full min-h-[56px] py-4 pl-4 pr-14 text-[13px] rounded-xl outline-none resize-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#0087A8]/30 text-[#0F172A]"
              style={{ border: `1px solid rgba(0,135,168,0.2)`, background: "rgba(255,255,255,0.8)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}
            />
            <button 
              onClick={() => { if(comment) { setIsRegenerating(true); setComment(""); } }}
              disabled={!comment}
              className="absolute right-3 top-[10px] w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:scale-100 hover:scale-105"
              style={{ background: comment ? TEAL : "rgba(0,0,0,0.05)", color: comment ? "#fff" : "rgba(15,23,42,0.4)" }}
            >
              <CornerDownLeft size={16} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <button 
              onClick={() => setIsRegenerating(true)}
              className="flex items-center gap-2 px-5 py-3 text-[13px] font-semibold rounded-xl border transition-colors hover:bg-black/5 w-full sm:w-auto justify-center"
              style={{ borderColor: "rgba(0,0,0,0.12)", color: "rgba(15,23,42,0.6)" }}
            >
              <RefreshCw size={14} /> Regenerate Draft
            </button>
            <button 
              onClick={() => router.push("/storyboard/1")}
              className="flex items-center gap-2 px-8 py-3 text-[13px] font-bold rounded-xl text-white transition-opacity hover:opacity-90 w-full sm:w-auto justify-center"
              style={{ background: "#0087A8", boxShadow: "0 4px 14px rgba(0, 135, 168, 0.2)" }}
            >
              <Check size={16} /> Accept & Save to Bank
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
