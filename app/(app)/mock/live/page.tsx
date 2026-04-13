"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useUser } from "@/lib/user-context";

// ── Session data ─────────────────────────────────────
interface Question {
  text: string;
  driver: string;
  driverDot: string;
  idealSec: number; // recommended seconds to answer
}
const QUESTIONS: Question[] = [
  { text:"Tell me about yourself and your experience as a Business Analyst.", driver:"Introduction", driverDot:"#94A3B8", idealSec:120 },
  { text:"Tell me about a time you had to solve a complex problem under pressure.", driver:"Thinking", driverDot:"#FBBF24", idealSec:180 },
  { text:"Describe a situation where you took initiative on something no one asked you to do.", driver:"Action", driverDot:"#F87171", idealSec:180 },
  { text:"Give me an example of how you handled a conflict with a senior stakeholder.", driver:"People", driverDot:"#34D399", idealSec:180 },
  { text:"What's the most technically complex work you've delivered, and what did it teach you?", driver:"Mastery", driverDot:"#FBBF24", idealSec:180 },
];
const TOTAL_SEC = 30 * 60; // 30 minutes overall

// ── Helpers ───────────────────────────────────────────
function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2,"0")}`;
}

// ── Component ─────────────────────────────────────────
export default function LiveInterviewPage() {
  const router = useRouter();
  const { user } = useUser();
  const [qIndex,   setQIndex]   = useState(0);
  const [elapsed,  setElapsed]  = useState(0);   // total session time (count up)
  const [qElapsed, setQElapsed] = useState(0);   // time on current question (count up)
  const [micOn,    setMicOn]    = useState(true);
  const [camOn,    setCamOn]    = useState(true);
  const [ending,   setEnding]   = useState(false);

  const dynamicQuestions: Question[] = useMemo(
    () => [
      {
        text: `Tell me about yourself and your experience as a ${user.role || "professional"}.`,
        driver: "Introduction",
        driverDot: "#94A3B8",
        idealSec: 120,
      },
      {
        text: "Tell me about a time you had to solve a complex problem under pressure.",
        driver: "Thinking",
        driverDot: "#FBBF24",
        idealSec: 180,
      },
      {
        text: "Describe a situation where you took initiative on something no one asked you to do.",
        driver: "Action",
        driverDot: "#F87171",
        idealSec: 180,
      },
      {
        text: "Give me an example of how you handled a conflict with a senior stakeholder.",
        driver: "People",
        driverDot: "#34D399",
        idealSec: 180,
      },
      {
        text: "What's the most technically complex work you've delivered, and what did it teach you?",
        driver: "Mastery",
        driverDot: "#FBBF24",
        idealSec: 180,
      },
    ],
    [user.role]
  );

  const q = dynamicQuestions[qIndex];
  const remaining = TOTAL_SEC - elapsed; // overall countdown

  // ── Timers ────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(c => c + 1);
      setQElapsed(c => c + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const qCount = dynamicQuestions.length;
  function nextQuestion() {
    if (qIndex < qCount - 1) {
      setQIndex((i) => i + 1);
      setQElapsed(0);
    } else {
      setEnding(true);
      setTimeout(() => router.push("/mock/processing"), 1800);
    }
  }

  // ── Progress ──────────────────────────────────────
  const qPct    = Math.min(100, (qElapsed / q.idealSec) * 100);
  const overTime = qElapsed > q.idealSec;
  const totalPct = Math.min(100, (elapsed / TOTAL_SEC) * 100);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#0C0E12] font-sans"
    >

      {/* ── TOP BAR ─────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0 z-20"
        style={{ padding:"12px 24px", background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        {/* Left: brand + session label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span style={{ width:6,height:20,background:"#FFF",borderRadius:2,display:"inline-block" }} />
            <span className="text-[14px] font-bold" style={{ color:"#FFF" }}>ProofDive</span>
          </div>
          <span style={{ width:1,height:16,background:"rgba(255,255,255,0.15)",display:"inline-block" }} />
          <span className="text-[11px] font-semibold" style={{ color:"rgba(255,255,255,0.35)" }}>Practice Session</span>
        </div>

        {/* Center: Q counter + overall time */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[12px] uppercase tracking-widest font-bold" style={{ color:"rgba(255,255,255,0.28)" }}>Question</span>
            <span className="text-[13px] font-bold" style={{ color:"#FFF" }}>{qIndex+1} / {QUESTIONS.length}</span>
          </div>
          <div style={{ width:1,height:16,background:"rgba(255,255,255,0.10)",display:"inline-block" }} />
          {/* Overall timer — counts down */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] uppercase tracking-widest font-bold" style={{ color:"rgba(255,255,255,0.28)" }}>Remaining</span>
            <span className="text-[13px] font-bold" style={{ color: remaining < 300 ? "#F87171" : "#FFF" }}>
              {fmt(Math.max(0, remaining))}
            </span>
          </div>
        </div>

        {/* Right: driver tag */}
        <div className="flex items-center gap-2">
          <span style={{ width:6,height:6,borderRadius:99,background:q.driverDot,display:"inline-block" }} />
          <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.40)" }}>{q.driver}</span>
        </div>
      </div>

      {/* ── OVERALL PROGRESS BAR ─────────────────────── */}
      <div style={{ height:2, flexShrink:0, background:"rgba(255,255,255,0.06)" }}>
        <div style={{ height:"100%", width:`${totalPct}%`, background:"#0087A8", transition:"width 1s linear" }} />
      </div>

      {/* ── Q TIMER + CURRENT QUESTION (top) ─────────── */}
      <div className="shrink-0 flex flex-col items-center z-20"
        style={{ paddingTop:8, paddingBottom:12 }}>
        {/* Question time bar */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[12px] uppercase tracking-widest font-bold" style={{ color: overTime?"#F87171":"rgba(255,255,255,0.30)" }}>
            {overTime ? "Over time —" : "Q timer"}
          </span>
          <span className="text-[13px] font-bold" style={{ color: overTime?"#F87171":"#FFF" }}>{fmt(qElapsed)}</span>
          <span className="text-[12px]" style={{ color:"rgba(255,255,255,0.22)" }}>/ {fmt(q.idealSec)} ideal</span>
          {/* mini progress */}
          <div style={{ width:80,height:2,borderRadius:99,background:"rgba(255,255,255,0.10)" }}>
            <div style={{ height:"100%",borderRadius:99,width:`${qPct}%`,background: overTime?"#F87171":"#0087A8",transition:"width 1s linear" }} />
          </div>
        </div>

        {/* Subtitle card — current question */}
        <div className="max-w-2xl w-full mx-auto px-8"
          style={{ padding:"14px 24px", borderRadius:12,
            background:"rgba(255,255,255,0.06)", backdropFilter:"blur(16px)",
            border:"1px solid rgba(255,255,255,0.10)",
            boxShadow:"0 4px 32px rgba(0,0,0,0.30)" }}>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-2 text-center" style={{ color:"rgba(255,255,255,0.30)" }}>
            Question {qIndex+1} — {q.driver}
          </p>
          <p className="text-[16px] font-semibold text-center leading-relaxed" style={{ color:"rgba(255,255,255,0.90)" }}>
            <span aria-hidden>&ldquo;</span>
            {q.text}
            <span aria-hidden>&rdquo;</span>
          </p>
        </div>
      </div>

      {/* ── MAIN AREA: Interviewer video call ────────── */}
      <div className="flex-1 relative flex items-center justify-center"
        style={{ overflow:"hidden" }}>

        {/* Background ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:"radial-gradient(ellipse at 50% 40%, rgba(0,135,168,0.05) 0%, transparent 70%)" }} />

        {/* Interviewer - main feed */}
        <div className="relative flex flex-col items-center justify-center"
          style={{ width:"100%", maxWidth:640, aspectRatio:"4/3", borderRadius:20, overflow:"hidden",
            background:"linear-gradient(145deg,#1C272E,#0E1A20)",
            border:"1px solid rgba(255,255,255,0.06)",
            boxShadow:"0 0 80px rgba(0,0,0,0.6)" }}>

          {/* Interviewer avatar */}
          <div style={{
            width:100, height:100, borderRadius:999,
            background:"linear-gradient(145deg,#1C3B4A,#2D5668)",
            border:"3px solid rgba(255,255,255,0.12)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span className="text-[32px] font-bold" style={{ color:"rgba(255,255,255,0.70)" }}>AI</span>
          </div>
          <p className="text-[13px] font-semibold mt-4" style={{ color:"rgba(255,255,255,0.55)" }}>AI Interviewer</p>
          <p className="text-[11px] mt-1" style={{ color:"rgba(255,255,255,0.25)" }}>ProofDive Practice</p>

          {/* Speaking indicator */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
            style={{ padding:"5px 12px", borderRadius:99, background:"rgba(0,135,168,0.20)", border:"1px solid rgba(0,135,168,0.30)" }}>
            {[0.4,0.7,1,0.7,0.4].map((h,i) => (
              <div key={i} style={{
                width:3, height:12*h, borderRadius:99, background:"#0087A8",
                animation:`pulse-bar ${0.5+i*0.1}s ease-in-out infinite alternate`,
              }} />
            ))}
          </div>

          {/* Name tag */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5"
            style={{ padding:"3px 10px", borderRadius:6, background:"rgba(0,0,0,0.45)" }}>
            <span style={{ width:5,height:5,borderRadius:99,background:"#34D399",display:"inline-block" }} />
            <span className="text-[12px] font-semibold" style={{ color:"#FFF" }}>AI Interviewer</span>
          </div>
        </div>

        {/* User camera PiP — bottom right */}
        <div className="absolute bottom-5 right-6"
          style={{ width:160, height:110, borderRadius:12, overflow:"hidden",
            background:"#1A1F28", border:"2px solid rgba(255,255,255,0.10)",
            boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
          {camOn ? (
            <div className="w-full h-full flex items-center justify-center relative"
              style={{ background:"linear-gradient(145deg,#1A2433,#0F1A24)" }}>
              <div style={{ width:36,height:36,borderRadius:999,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <span className="text-[13px] font-bold" style={{ color:"rgba(255,255,255,0.55)" }}>You</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background:"#12151A" }}>
              <VideoOff size={20} style={{ color:"rgba(255,255,255,0.20)" }} />
            </div>
          )}
          {/* Pip name + mic indicator */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            {micOn
              ? <span style={{ width:5,height:5,borderRadius:99,background:"#34D399",display:"inline-block" }} />
              : <MicOff size={10} style={{ color:"#F87171" }} />
            }
            <span className="text-[9px] font-semibold" style={{ color:"rgba(255,255,255,0.55)" }}>You</span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CONTROLS ─────────────────────────── */}
      <div className="shrink-0 flex items-center justify-center gap-4 z-20"
        style={{ paddingBottom:24,paddingTop:14 }}>
        {/* Mic */}
        <button onClick={()=>setMicOn(!micOn)}
          className="flex items-center justify-center transition-all hover:scale-105"
          style={{ width:48,height:48,borderRadius:999,
            background:micOn?"rgba(255,255,255,0.10)":"rgba(248,113,113,0.20)",
            border:`1px solid ${micOn?"rgba(255,255,255,0.15)":"rgba(248,113,113,0.40)"}` }}>
          {micOn
            ? <Mic size={18} style={{ color:"#FFF" }} />
            : <MicOff size={18} style={{ color:"#F87171" }} />
          }
        </button>

        {/* Camera */}
        <button onClick={()=>setCamOn(!camOn)}
          className="flex items-center justify-center transition-all hover:scale-105"
          style={{ width:48,height:48,borderRadius:999,
            background:camOn?"rgba(255,255,255,0.10)":"rgba(248,113,113,0.20)",
            border:`1px solid ${camOn?"rgba(255,255,255,0.15)":"rgba(248,113,113,0.40)"}` }}>
          {camOn
            ? <Video size={18} style={{ color:"#FFF" }} />
            : <VideoOff size={18} style={{ color:"#F87171" }} />
          }
        </button>

        {/* Next question / Finish */}
        <button onClick={nextQuestion}
          disabled={ending}
          className="h-12 px-8 text-[13px] font-bold text-white flex items-center gap-2 transition-all hover:opacity-85"
          style={{ borderRadius:99, background:"#0087A8", minWidth:160, justifyContent:"center",
            opacity:ending?0.5:1 }}>
          {ending ? "Finishing…"
            : qIndex < QUESTIONS.length - 1 ? `Next → Q${qIndex+2}`
            : "Finish session"}
        </button>

        {/* End */}
        <button onClick={()=>{ setEnding(true); setTimeout(()=>router.push("/mock/processing"),800); }}
          className="flex items-center justify-center transition-all hover:scale-105"
          style={{ width:48,height:48,borderRadius:999,
            background:"rgba(248,113,113,0.15)",
            border:"1px solid rgba(248,113,113,0.30)" }}>
          <PhoneOff size={18} style={{ color:"#F87171" }} />
        </button>
      </div>

      {/* Pulse bar animation */}
      <style>{`
        @keyframes pulse-bar {
          from { transform: scaleY(0.5); opacity:0.6; }
          to   { transform: scaleY(1);   opacity:1; }
        }
      `}</style>

    </div>
  );
}
