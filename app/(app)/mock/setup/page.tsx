"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Brain, Zap, Users, Target, ClipboardList, Timer, X, ChevronDown, ChevronUp, Camera, FileText, Briefcase, ArrowRight, Settings2, Pencil, Circle } from "lucide-react";
import { JdResumeInput } from "@/components/JdResumeInput";
import { useUser } from "@/lib/user-context";

const G: React.CSSProperties = {
  background: "rgba(255,255,255,0.60)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 20,
  boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
};
const D = "1px solid rgba(0,0,0,0.06)";

const STORIES = [
  { id: "a", title: "Global expansion strategy", tag: "Strategy" },
  { id: "b", title: "Resolving Q3 server outage", tag: "Technical" },
  { id: "c", title: "Managing difficult stakeholder", tag: "People" },
];

const PILLARS = [
  { id: "thinking", icon: Brain,       label: "Thinking", desc: "Logic & structured problem solving",   time: 7 },
  { id: "action",   icon: Zap,         label: "Action",   desc: "Ownership & driving results",          time: 7 },
  { id: "people",   icon: Users,       label: "People",   desc: "Collaboration & communication",         time: 7 },
  { id: "mastery",  icon: Target,      label: "Mastery",  desc: "Technical depth & domain knowledge",   time: 6 },
] as const;
type P = typeof PILLARS[number]["id"];

// ── Consent Modal ──────────────────────────────────
function ConsentModal({ onAccept, onClose }: { onAccept: () => void; onClose: () => void }) {
  const [noRecord, setNoRecord] = useState(false);
  const [noCamera, setNoCamera] = useState(false);

  const SOLID: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 24,
    maxWidth: 460,
    width: "100%",
    overflow: "hidden",
    boxShadow: "0 24px 64px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.06)",
  };
  const SD = "1px solid #F0F0F6";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(15,15,15,0.40)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
      <div style={SOLID} className="animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5" style={{ borderBottom: SD }}>
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: "rgba(15,15,15,0.35)" }}>Before we begin</p>
            <h2 className="text-[18px] font-bold tracking-tight" style={{ color: "#0F0F0F" }}>Interview Consent</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-gray-100"
            style={{ borderRadius: 8, background: "#F4F4F8", border: "none", cursor: "pointer" }}>
            <X size={14} style={{ color: "rgba(15,15,15,0.50)" }} />
          </button>
        </div>

        {/* Consent points */}
        <div className="px-7 py-5 space-y-4" style={{ borderBottom: SD }}>
          {[
            "Your responses will be recorded and analysed by AI to generate your readiness report.",
            "No data is shared with third parties. All session data is private to your account.",
            "You can exit the interview at any time — partial sessions still generate a report.",
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "#0087A8", flexShrink: 0, marginTop: 5, display: "inline-block" }} />
              <p className="text-[13px] leading-relaxed" style={{ color: "#374151" }}>{t}</p>
            </div>
          ))}
        </div>

        {/* Optional overrides */}
        <div className="px-7 py-4 space-y-3" style={{ borderBottom: SD, background: "#FAFAFA" }}>
          <p className="text-[12px] uppercase tracking-[0.16em] font-bold" style={{ color: "rgba(15,15,15,0.30)" }}>Session options</p>

          {/* Cancel recording toggle */}
          <button onClick={() => setNoRecord(!noRecord)}
            className="w-full flex items-center gap-3 text-left transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer" }}>
            <div style={{
              width: 38, height: 22, borderRadius: 999,
              background: noRecord ? "#F87171" : "rgba(0,0,0,0.10)",
              display: "flex", alignItems: "center", padding: "0 2px",
              transition: "background 180ms", flexShrink: 0,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 999, background: "#FFF",
                transform: noRecord ? "translateX(16px)" : "translateX(0)",
                transition: "transform 180ms",
                boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
              }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "#0F0F0F" }}>Cancel recording</p>
              <p className="text-[11px]" style={{ color: "rgba(15,15,15,0.40)" }}>Session runs without audio / video capture</p>
            </div>
          </button>

          {/* Turn off camera toggle */}
          <button onClick={() => setNoCamera(!noCamera)}
            className="w-full flex items-center gap-3 text-left transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer" }}>
            <div style={{
              width: 38, height: 22, borderRadius: 999,
              background: noCamera ? "#F87171" : "rgba(0,0,0,0.10)",
              display: "flex", alignItems: "center", padding: "0 2px",
              transition: "background 180ms", flexShrink: 0,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 999, background: "#FFF",
                transform: noCamera ? "translateX(16px)" : "translateX(0)",
                transition: "transform 180ms",
                boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
              }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "#0F0F0F" }}>Turn off camera</p>
              <p className="text-[11px]" style={{ color: "rgba(15,15,15,0.40)" }}>Disables gesture & body movement analysis</p>
            </div>
          </button>
        </div>

        {/* Footer actions */}
        <div className="px-7 py-5 flex gap-3">
          <button onClick={onClose}
            className="h-11 px-5 text-[13px] font-medium transition-colors hover:bg-gray-100"
            style={{ borderRadius: 10, background: "#F4F4F8", color: "#374151", border: "none", cursor: "pointer" }}>
            Go back
          </button>
          <button onClick={onAccept}
            className="flex-1 h-11 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ borderRadius: 10, background: "#0087A8", border: "none", cursor: "pointer" }}>
            I understand — Start →
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Main page ──────────────────────────────────────
function MockSetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const { user } = useUser();

  // Default: all pillars; Proofy "specific" mode pre-selects a focused subset
  const [pillars, setPillars] = useState<Set<P>>(new Set(["thinking", "action", "people", "mastery"]));

  useEffect(() => {
    if (mode === "full") {
      setPillars(new Set(["thinking", "action", "people", "mastery"]));
    } else if (mode === "specific") {
      setPillars(new Set(["thinking", "action"]));
    }
  }, [mode]);
  const [story, setStory]     = useState<string | null>("a");
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [jd, setJd]           = useState(user.jd || "");
  const [showJD, setShowJD]   = useState(!!user.jd);
  const [camera, setCamera]   = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  const selectedStory = STORIES.find(s => s.id === story);
  const all = pillars.size === 4;
  const total = [...pillars].reduce((s, id) => s + (PILLARS.find(p => p.id === id)?.time || 0), 0) + 3; // intro fixed 3 min

  function toggleP(id: P) {
    if (pillars.has(id) && pillars.size === 1) return;
    setPillars((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <>
      {showConsent && (
        <ConsentModal
          onAccept={() => { setShowConsent(false); router.push("/mock/live"); }}
          onClose={() => setShowConsent(false)}
        />
      )}

      {/* Single centered narrow container */}
      <div className="max-w-[560px] mx-auto px-6 py-12 md:py-20">
        
        {/* ① Page Header */}
        <div className="mb-10">
          <p className="text-[12px] uppercase tracking-[0.18em] font-bold mb-2" style={{ color: "rgba(15,15,15,0.35)" }}>Practice Session</p>
          {mode === "full" && (
            <p className="mb-2 inline-block rounded-full bg-[#0087A8]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0087A8]">
              Full session
            </p>
          )}
          {mode === "specific" && (
            <p className="mb-2 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Specific practice
            </p>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-[#0F0F0F] mb-2">You&apos;re almost ready.</h1>
          <p className="text-[14px] leading-relaxed text-black/50 max-w-sm">
            {mode === "specific"
              ? "Focused prep — adjust pillars if you want, then start when you’re ready."
              : "Your storyboard is attached. Pick your focus, select optional settings, and go."}
          </p>
        </div>

        {/* ② Role pill (Inline Editing for Story) */}
        <div className="flex flex-col mb-8 transition-colors" style={{...G, borderRadius: 16}}>
          <div className="flex items-center justify-between p-4 hover:bg-white/40 rounded-[16px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0087A8]/10 flex items-center justify-center text-[#0087A8]">
                <Briefcase size={14} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#0F0F0F]">{user.role || "Target Role"}</p>
                {isEditingStory ? (
                  <p className="text-[11px] text-black/50 font-medium">Select a storyboard to practice</p>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedStory ? 'bg-[#047857]' : 'bg-[#D97706]'}`} />
                    <p className="text-[11px] text-black/60 font-medium text-left line-clamp-1 max-w-[150px] sm:max-w-xs">
                      {selectedStory ? selectedStory.title : "No attached story"}
                    </p>
                    <button 
                      onClick={() => setIsEditingStory(true)} 
                      className="ml-1 text-[#0087A8] hover:text-[#006E89] bg-[#0087A8]/10 hover:bg-[#0087A8]/20 px-2 py-0.5 rounded-[6px] text-[12px] font-bold flex items-center gap-1 transition-colors border-none cursor-pointer">
                      <Pencil size={10} /> Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
            {!isEditingStory ? (
              <Link href="/onboarding" className="text-[11px] font-semibold text-[#0087A8] hover:opacity-70 transition-opacity">
                Change Role →
              </Link>
            ) : (
              <button onClick={() => setIsEditingStory(false)} className="text-[11px] font-semibold text-black/50 hover:text-black transition-colors">
                Cancel
              </button>
            )}
          </div>
          
          {isEditingStory && (
            <div className="p-3 border-t animate-in slide-in-from-top-2 fade-in duration-200" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="space-y-1">
                {STORIES.map(s => (
                   <button key={s.id} onClick={() => { setStory(s.id); setIsEditingStory(false); }}
                     className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex flex-col gap-1 ${s.id === story ? 'bg-[#0087A8]/5 border border-[#0087A8]/20' : 'hover:bg-white/60 border border-transparent'}`}>
                     <div className="flex items-center justify-between">
                       <span className="text-[13px] font-bold text-[#0F0F0F]">{s.title}</span>
                       {s.id === story && <span className="text-[12px] font-bold text-[#0087A8]">✓ Selected</span>}
                     </div>
                     <span className="text-[12px] uppercase font-bold tracking-widest text-[#0087A8]/60 inline-block">{s.tag}</span>
                   </button>
                ))}
              </div>
              <div className="px-4 pt-3 pb-1 mt-2 border-t border-black/5">
                <Link href="/storyboard" className="text-[11px] font-bold text-black/50 hover:text-black flex items-center gap-1 transition-colors">
                   + Create new story
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ③ Interview Focus */}
        <div style={G} className="overflow-hidden mb-8">
          <div className="px-6 pt-6 pb-6">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-5">Pillar Overview</p>
            
            <div className="space-y-1">
              {PILLARS.map(p => {
                 const on = pillars.has(p.id);
                 const Icon = p.icon;
                 return (
                   <button key={p.id} onClick={() => toggleP(p.id)}
                     className={`w-full text-left px-3.5 py-2.5 transition-all flex items-center justify-between rounded-xl ${on ? "bg-[#0087A8]/[0.06]" : "bg-transparent hover:bg-slate-50"}`}
                   >
                     <div className="flex items-center gap-3">
                       {/* Custom Radio */}
                       {on ? (
                         <div className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center border-[#0087A8]`}>
                            <div className="w-[6px] h-[6px] rounded-full bg-[#0087A8]" />
                         </div>
                       ) : (
                         <Circle size={18} className="text-slate-300 shrink-0" />
                       )}

                       {/* Icon + Label */}
                       <div className="flex items-center gap-2">
                          <Icon size={14} className={on ? "text-[#0087A8]" : "text-slate-400"} />
                          <span className={`text-[13px] font-bold ${on ? "text-slate-900" : "text-slate-400"}`}>
                            {p.label}
                          </span>
                       </div>
                     </div>

                     {/* Count */}
                     <span className={`text-[12px] font-bold tabular-nums ${on ? "text-[#0087A8]" : "text-slate-300"}`}>
                        0/{p.id === 'mastery' ? '4' : '3'}
                     </span>
                   </button>
                 )
              })}
            </div>

            <div className="h-px bg-slate-900/[0.04] my-6" />

            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-4">What interviewers test here</p>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-6 max-w-[95%]">
              Hiring managers probe this area to see if you diagnose before prescribing. They want evidence you use data, not instinct, to frame problems and identify root causes.
            </p>

            <div className="space-y-3">
              <span className="text-[12px] font-bold uppercase tracking-widest text-slate-400 block">Frequently asked at</span>
              <div className="flex flex-wrap gap-2.5">
                <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Google
                </span>
                <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Apple
                </span>
                <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Netflix
                </span>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 flex items-center justify-between bg-white/40" style={{borderTop: D}}>
             <div className="flex items-center gap-2.5">
                <Timer size={14} color="#0087A8" />
                <span className="text-[13px] font-bold text-[#0F0F0F]">~{total} min total setup time</span>
             </div>
             {all ? (
                <span className="text-[12px] font-bold uppercase tracking-widest text-[#0087A8]">Full Interview</span>
             ) : (
                <button 
                  onClick={() => setPillars(new Set(PILLARS.map(p => p.id)))}
                  className="text-[11px] font-bold text-[#0087A8] hover:opacity-70 transition-opacity">
                  Select All
                </button>
             )}
          </div>
        </div>

        {/* ④ Session Options */}
        <div className="mb-10 p-6 space-y-6 text-left" style={{...G, borderRadius: 20}}>
           {/* Job Description */}
           <div>
              <div className="flex items-center gap-2.5 mb-3">
                 <FileText size={15} className="text-black/50" />
                 <p className="text-[13px] font-bold text-[#0F0F0F] flex-1">Job Description</p>
                 {!showJD && (
                   <button onClick={() => setShowJD(true)} className="text-[11px] font-semibold text-[#0087A8] hover:opacity-70">
                     + Add
                   </button>
                 )}
              </div>
              {showJD ? (
                <JdResumeInput
                  label="Job Description"
                  placeholder="Paste or upload a JD for tailored questions..."
                  value={jd}
                  onChange={setJd}
                  onRemove={() => { setShowJD(false); setJd(""); }}
                  compact
                />
              ) : (
                <p className="text-[11px] text-black/35">Paste or upload a JD to get sharper, role-specific questions.</p>
              )}
           </div>
           
           <div style={{height: 1, background: "rgba(0,0,0,0.06)"}} />
           
           {/* Camera Toggle */}
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                 <Camera size={15} className="text-black/50" />
                 <div>
                   <p className="text-[13px] font-bold text-[#0F0F0F]">{camera ? "Camera on" : "Enable camera"}</p>
                   <p className="text-[11px] text-black/40 mt-0.5">Enable camera so you can get analytics of your body gestures as well</p>
                 </div>
              </div>
              <button 
                onClick={() => setCamera(!camera)} 
                style={{ width: 44, height: 24, borderRadius: 999, background: camera ? "#0087A8" : "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", padding: "0 2px", transition: "background 200ms", flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: 999, background: "#FFF", transform: camera ? "translateX(20px)" : "translateX(0)", transition: "transform 200ms", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
              </button>
           </div>
        </div>

        {/* ⑤ CTA Block */}
        <div className="flex flex-col items-center gap-4">
           <button 
              onClick={() => setShowConsent(true)} 
              className="w-full sm:w-[320px] h-12 rounded-xl bg-[#0087A8] text-white text-[14px] font-bold hover:bg-[#006E89] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-[#0087A8]/20 flex items-center justify-center gap-2">
              Start interview <ArrowRight size={16} />
           </button>
           
           <Link href="/mock" className="text-[12px] font-semibold text-black/30 hover:text-black/60 transition-colors uppercase tracking-widest px-4 py-2">
              ← Back
           </Link>
        </div>

      </div>
    </>
  );
}

export default function MockSetup() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[560px] px-6 py-24 text-center text-[14px] text-black/40">
          Loading setup…
        </div>
      }
    >
      <MockSetupInner />
    </Suspense>
  );
}
