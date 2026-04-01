"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain, Zap, Users, Target,
  Play, Clock, BookOpen, Timer, ChevronDown, ChevronRight, ArrowLeft
} from "lucide-react";
import { useUser } from "@/lib/user-context";

// ── V2.1 Design Tokens (Matching Dashboard/Globals) ────────
const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
  borderRadius: 20,
};

const internalDivider = "1px solid rgba(0,0,0,0.06)";

// Score logic: strictly below 3.4 = RED. Anything below 3.4 also gets "Borderline" badge.
function getScoreColor(score: number): string {
  return score < 3.4 ? "#B91C1C" : "#0F172A";
}

// ── Data ───────────────────────────────────────────────────
const SESSION = {
  interviewName: "Role-Based Mock",
  role: "Business Analyst", exp: "3 yrs · L3+",
  date: "Oct 24, 2024", duration: "31 min",
  pillars: ["Thinking", "Action", "People", "Mastery"],
  questionCount: 4,
};

const DRIVERS = [
  { id: "thinking", title: "Thinking", icon: Brain,  score: 3.2, pct: 64, accent: "#D97706" },
  { id: "action",   title: "Action",   icon: Zap,    score: 2.8, pct: 56, accent: "#0087A8" },
  { id: "people",   title: "People",   icon: Users,  score: 4.1, pct: 82, accent: "#16A34A" },
  { id: "mastery",  title: "Mastery",  icon: Target, score: 3.6, pct: 72, accent: "#7C3AED" },
];

const CAR_ROWS = [
  { label: "Context", status: "Strong",  dot: "#10B981", note: "Clear background and situation explained well by candidate" },
  { label: "Action",  status: "Partial", dot: "#F59E0B", note: "Good detail but personal role wasn't always fully articulated" },
  { label: "Result",  status: "Weak",    dot: "#EF4444", note: "Outcomes were vague, non-numeric across most answers" },
];

interface Q {
  q: string; driver: string; driverAccent: string; score: number;
  taken: string; ideal: string;
  car: { label: string; ok: boolean; note: string }[];
  improve: { heading: string; detail: string }[];
  showAI?: boolean; youSaid?: string; aiSaid?: string; aiTips?: string[];
}

const QUESTIONS: Q[] = [
  {
    q: "Tell me about a time you solved a complex problem.",
    driver: "Thinking", driverAccent: "#D97706", score: 3.6,
    taken: "2m 14s", ideal: "3–4 min",
    car: [
      { label: "Context", ok: true,  note: "Situation clearly framed" },
      { label: "Action",  ok: true,  note: "Steps were specific" },
      { label: "Result",  ok: false, note: "No measurable outcome given" },
    ],
    improve: [
      { heading: "Missing analysis layer", detail: "Walk through your reasoning before stating the action." },
      { heading: "No quantified outcome",  detail: "Add one metric: time saved, % improvement, or cost impact." },
    ],
  },
  {
    q: "Describe a time you took initiative on something no one asked you to do.",
    driver: "Action", driverAccent: "#0087A8", score: 2.8,
    taken: "1m 42s", ideal: "3–4 min", showAI: true,
    car: [
      { label: "Context", ok: true,  note: "Background given briefly" },
      { label: "Action",  ok: false, note: "Your specific role unclear" },
      { label: "Result",  ok: false, note: "Outcome was vague, no metrics" },
    ],
    improve: [
      { heading: "Ownership not stated", detail: "Say explicitly 'I decided to…' not 'we decided to…'" },
      { heading: "Result too vague",     detail: "'It went well' → 'delivery improved by X%'" },
      { heading: "Answer too short",     detail: "You used 1m 42s. Aim for 3–4 min. Expand context and result." },
    ],
    youSaid: `"We had a performance issue in our system. I looked into it and found the problem was in our caching layer. I fixed it and the system got faster."`,
    aiSaid:  `"Our checkout service was experiencing a 3-second latency spike during peak hours — causing a 12% drop-off in conversions. I led the root cause analysis, identified our Redis caching layer was expiring keys too aggressively, redesigned the TTL strategy and added a read-through fallback. Within 48 hours, latency dropped to under 400ms — a 7× improvement — and checkout completions recovered fully."`,
    aiTips: ["Context: Business impact stated upfront", "Action: Your specific role clearly defined", "Result: Quantified with 7× improvement metric"],
  },
  {
    q: "Give me an example of how you handled a conflict with a stakeholder.",
    driver: "People", driverAccent: "#16A34A", score: 4.1,
    taken: "3m 28s", ideal: "3–4 min",
    car: [
      { label: "Context", ok: true, note: "Tension framed clearly" },
      { label: "Action",  ok: true, note: "Empathy and steps shown" },
      { label: "Result",  ok: true, note: "Outcome clearly stated" },
    ],
    improve: [
      { heading: "Add soft metrics", detail: "Stakeholder satisfaction or reduced escalation frequency would sharpen the result." },
    ],
  },
  {
    q: "What's the most technically complex thing you've worked on?",
    driver: "Mastery", driverAccent: "#7C3AED", score: 3.2,
    taken: "2m 55s", ideal: "3–4 min",
    car: [
      { label: "Context", ok: true,  note: "Domain explained adequately" },
      { label: "Action",  ok: false, note: "Too surface-level on technical specifics" },
      { label: "Result",  ok: false, note: "No depth on impact or what you learned" },
    ],
    improve: [
      { heading: "Lacked technical depth",  detail: "Name the specific tech, pattern or principle you applied." },
      { heading: "No outcome or learning",  detail: "What did this teach you? What would you do differently?" },
    ],
  },
];

const COACHING = [
  { n: "01", title: "Use CAR Consistently",  tips: ["Context: what was the situation?", "Action: what did YOU specifically do?", "Result: what was the measurable outcome?"] },
  { n: "02", title: "Quantify Every Answer", tips: ["Add % improvement, time saved, revenue impact", "Avoid 'it went well' — say 'improved by X%'"] },
  { n: "03", title: "Own Your Contribution", tips: ["Use 'I' not 'we'", "State the decision you made", "Name options you ruled out"] },
];

const REC_TRAINING = {
  title:    "Behavioural Answer Structure (CAR Method)",
  driver:   "Action", dot: "#0087A8", duration: "18 min",
  desc:     "Turn raw experience into sharp, memorable interview answers using a proven structured framework.",
  href:     "/trainings",
};

// ── Components ─────────────────────────────────────────────

function StatusBadge({ score }: { score: number }) {
  const isBorderline = score < 3.5;
  const isReady = score >= 3.5;
  
  if (isReady) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        READY
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[11px] font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
      BORDERLINE
    </span>
  );
}

function QuestionRow({ q, qi }: { q: Q; qi: number }) {
  const [open, setOpen] = useState(!!q.showAI);
  const sc = getScoreColor(q.score);

  return (
    <div style={{ ...glassCard, borderRadius: 16 }} className="mb-4 overflow-hidden border border-white/40 hover:border-[#0087A8]/30 transition-all">
      {/* Collapsed Header */}
      <div 
        className="flex items-center gap-6 p-5 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="shrink-0 w-8 h-8 flex items-center justify-center text-[12px] font-bold bg-[#0F172A]/5 rounded-[10px] text-[#0F172A]/40">
          {qi + 1}
        </span>

        <p className="flex-1 text-[15px] font-bold text-[#0F172A] mb-0">
          &ldquo;{q.q}&rdquo;
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <span style={{ width: 6, height: 6, borderRadius: 99, background: q.driverAccent }} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]/60">{q.driver}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[22px] font-bold font-mono tabular-nums leading-none" style={{ color: sc }}>
            {q.score}<span className="text-[12px] font-medium text-[#475569]/30">/5</span>
          </span>
          <StatusBadge score={q.score} />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-4">
          <Timer size={14} className="text-[#475569]/30" />
          <span className="text-[12px] font-medium text-[#475569]/60">{q.taken}</span>
        </div>

        <button 
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0F172A]/5 hover:bg-[#0F172A]/10 transition-colors"
        >
          <ChevronDown size={16} className={`text-[#0F172A]/40 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Content */}
      {open && (
        <div className="border-t border-black/[0.04] bg-white/[0.02]">
          {/* CAR */}
          <div className="p-6 border-b border-black/[0.04]">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#475569]/40 mb-4">COMPETENCY ANALYSIS</p>
            <div className="flex flex-wrap gap-8 items-start">
              {q.car.map(c => (
                <div key={c.label} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5 ${c.ok ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                    {c.ok ? '✓' : '✕'}
                  </div>
                  <p className="text-[13px] text-[#475569] leading-relaxed">
                    <strong className="text-[#0F172A]">{c.label}</strong> — {c.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Improve */}
          <div className={`p-6 ${q.showAI ? 'border-b border-black/[0.04]' : ''}`}>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#475569]/40 mb-4">AREAS FOR IMPROVEMENT</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
              {q.improve.map(imp => (
                <div key={imp.heading} className="flex items-start gap-2.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-[7px] shrink-0" />
                   <p className="text-[13px] text-[#475569] leading-relaxed">
                     <strong className="text-[#0F172A]">{imp.heading}</strong> — {imp.detail}
                   </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Helper section (if present) */}
          {q.showAI && (
            <div className="p-6 bg-[#0087A8]/[0.03]">
               <div className="flex items-center gap-2 mb-6">
                 <div className="w-6 h-6 rounded-full bg-[#0087A8] flex items-center justify-center">
                    <Zap size={12} fill="white" color="white" />
                 </div>
                 <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0087A8]">AI Performance Coaching</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#475569]/40 mb-3 ml-4">YOUR ANSWER</p>
                    <div className="p-4 rounded-[12px] bg-white/40 border border-black/[0.04] italic text-[13px] text-[#475569]/80 leading-relaxed">
                      &ldquo;{q.youSaid}&rdquo;
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#0087A8] mb-3 ml-4">BETTER VERSION</p>
                    <div className="p-4 rounded-[12px] bg-[#0087A8]/5 border border-[#0087A8]/10 italic text-[13px] text-[#0F172A] leading-relaxed relative">
                       <span className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#0087A8] rounded-r-full" />
                       &ldquo;{q.aiSaid}&rdquo;
                       <div className="mt-4 flex flex-wrap gap-3">
                          {q.aiTips?.map(t => (
                            <div key={t} className="flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                               <span className="text-[11px] font-bold text-[#10B981]">{t}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Exported Page ──────────────────────────────────────────────
export default function ReportPage() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const overall = parseFloat(
    (DRIVERS.reduce((s, d) => s + d.score, 0) / DRIVERS.length).toFixed(1)
  );

  const dynamicSession = { 
    ...SESSION, 
    role: (mounted && user.role) ? user.role : SESSION.role 
  };
  const dynamicSummary = `The candidate demonstrates strong interpersonal ability and execution instinct, but consistently struggles to quantify outcomes and state individual contribution clearly. The biggest gaps are in the Action and Mastery drivers — both lack specificity and measurable results. People driver is a real strength worth leading with.`.replace("Sarah", (mounted && user.name) ? user.name : "The candidate");

  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 py-12 space-y-12">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <Link href="/mock" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0087A8] hover:opacity-70 transition-opacity">
               <ArrowLeft size={16} /> Back to Sessions
             </Link>
             <div>
               <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-[36px] font-bold tracking-tight text-[#0F172A] leading-tight">
                   Performance Report
                 </h1>
                 <div className="px-3 py-1 rounded-full bg-[#0F172A]/5 text-[#475569] text-[11px] font-bold mt-2">
                   V1.2
                 </div>
               </div>
               <div className="flex items-center gap-3 text-[#475569]/60 text-[14px]">
                 <span>{dynamicSession.interviewName}</span>
                 <span>·</span>
                 <span>{dynamicSession.date}</span>
                 <span>·</span>
                 <span>{dynamicSession.duration} Duration</span>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="h-11 px-6 rounded-[10px] border border-[#0F172A]/10 text-[14px] font-bold text-[#0F172A] hover:bg-[#0F172A]/5 transition-all">
                Download PDF
             </button>
             <Link href="/mock/setup" className="h-11 px-8 rounded-[10px] bg-[#0087A8] text-white text-[14px] font-bold hover:opacity-90 transition-all flex items-center gap-2">
                Retake Session <ChevronRight size={16} />
             </Link>
          </div>
        </div>

        {/* ── SECTION 1: OVERALL SCORE GLASS ── */}
        <div style={glassCard} className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 md:gap-20 relative overflow-hidden">
           {/* Decorative background element */}
           <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-white/50 blur-[100px] rounded-full pointer-events-none" />
           
           <div className="text-center md:text-left shrink-0">
              <p className="text-[80px] font-black font-mono leading-none tabular-nums tracking-tighter" style={{ color: getScoreColor(overall) }}>
                {overall.toFixed(1)}
              </p>
              <p className="text-[12px] uppercase tracking-[0.25em] font-black text-[#0F172A]/20 mt-2">OUT OF 5.0</p>
           </div>
           
           <div className="flex-1 space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                 <StatusBadge score={overall} />
                 <span className="text-[11px] font-bold text-[#475569]/40 uppercase tracking-[0.15em]">Overall Verdict</span>
              </div>
              <h2 className="text-[28px] md:text-[32px] font-bold text-[#0F172A] leading-tight max-w-xl">
                 You are demonstrating strong readiness in high-impact areas.
              </h2>
              <p className="text-[15px] text-[#475569] leading-relaxed max-w-2xl">
                 Your ability to navigate complex stakeholder discussions is exceptional. Focus on tightening your Action delivery and adding quantifiable outcomes to your technical Mastery answers for a Role Model performance.
              </p>
           </div>
           
           <div className="shrink-0 p-6 rounded-[16px] bg-[#0F172A]/[0.03] border border-black/[0.04] w-full md:w-auto">
              <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#475569]/60 mb-3">CONSOLIDATED PROFILE</p>
              <div className="space-y-4">
                 <div>
                    <p className="text-[15px] font-bold text-[#0F172A]">{dynamicSession.role}</p>
                    <p className="text-[12px] text-[#475569]/60">{dynamicSession.exp}</p>
                 </div>
                 <div className="flex flex-wrap gap-2 pt-1">
                    {dynamicSession.pillars.map(p => (
                      <span key={p} className="px-2.5 py-1 bg-white border border-black/[0.05] rounded-[6px] text-[10px] font-bold text-[#475569]">
                        {p}
                      </span>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* ── SECTION 2: DRIVER SCORING ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {DRIVERS.map(d => {
              const Icon = d.icon;
              const sc = getScoreColor(d.score);
              return (
                <div key={d.id} style={glassCard} className="p-6 flex flex-col gap-5 border border-white/40 hover:translate-y-[-4px] transition-transform duration-300">
                   <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `${d.accent}10` }}>
                         <Icon size={20} style={{ color: d.accent }} />
                      </div>
                      <StatusBadge score={d.score} />
                   </div>
                   
                   <div>
                      <h3 className="text-[15px] font-bold text-[#0F172A] mb-1">{d.title} Performance</h3>
                      <div className="flex items-baseline gap-2">
                         <span className="text-[32px] font-bold font-mono tabular-nums leading-none" style={{ color: sc }}>{d.score.toFixed(1)}</span>
                         <span className="text-[13px] font-medium text-[#475569]/30">/ 5.0</span>
                      </div>
                   </div>
                   
                   <div className="space-y-2 mt-auto">
                      <div className="h-[6px] w-full bg-[#0F172A]/5 rounded-full overflow-hidden">
                         <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${d.pct}%`, background: d.accent }} />
                      </div>
                      <p className="text-[11px] font-bold text-[#475569]/40 tracking-wide uppercase">
                        Efficiency: {d.pct}%
                      </p>
                   </div>
                </div>
              );
           })}
        </div>

        {/* ── SECTION 3: CAR ANALYSIS ── */}
        <div style={glassCard} className="overflow-hidden border border-white/40">
           <div className="p-6 md:px-8 border-b border-black/[0.06] bg-black/[0.02] flex items-center justify-between">
              <div>
                 <h3 className="text-[16px] font-bold text-[#0F172A]">Cross-Answer Consistency (CAR)</h3>
                 <p className="text-[12px] text-[#475569]/60">How consistently you structure your narrative across the entire session.</p>
              </div>
              <div className="hidden md:flex gap-4">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10B981]" /> <span className="text-[11px] font-bold text-[#475569]">STRONG</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#F59E0B]" /> <span className="text-[11px] font-bold text-[#475569]">PARTIAL</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#EF4444]" /> <span className="text-[11px] font-bold text-[#475569]">WEAK</span></div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/[0.06]">
              {CAR_ROWS.map(c => (
                <div key={c.label} className="p-8 space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[16px] font-black text-[#0F172A] tracking-tight italic" style={{ opacity: 0.1 }}>{c.label.toUpperCase()}</span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: `${c.dot}15`, color: c.dot }}>{c.status.toUpperCase()}</span>
                   </div>
                   <h4 className="text-[15px] font-bold text-[#0F172A]">{c.label} Quality</h4>
                   <p className="text-[13px] text-[#475569] leading-relaxed">{c.note}</p>
                </div>
              ))}
           </div>
        </div>

        {/* ── SECTION 4: DETAILED QUESTIONS ── */}
        <div className="pt-4">
           <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#0F172A]">Detailed Session Breakdown</h2>
              <p className="text-[14px] text-[#475569]/60 mt-1">AI-augmented performance analysis for each question asked.</p>
           </div>
           
           <div className="flex flex-col">
              {QUESTIONS.map((q, qi) => (
                <QuestionRow key={qi} q={q} qi={qi} />
              ))}
           </div>
        </div>

        {/* ── SECTION 5: COACHING & RECOMMENDATIONS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-10">
           
           {/* Coaching Cards */}
           <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {COACHING.map(c => (
                <div key={c.n} style={glassCard} className="p-8 border border-white/40">
                   <p className="text-[48px] font-black text-[#0F172A]/05 font-mono italic leading-none mb-4">{c.n}</p>
                   <h3 className="text-[18px] font-bold text-[#0F172A] mb-4">{c.title}</h3>
                   <ul className="space-y-3">
                      {c.tips.map(t => (
                        <li key={t} className="flex items-start gap-2.5 text-[13px] text-[#475569] leading-relaxed">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#0087A8] mt-2 shrink-0" />
                           {t}
                        </li>
                      ))}
                   </ul>
                </div>
              ))}
           </div>

           {/* Recommended Training Card */}
           <div className="lg:col-span-4">
              <div 
                style={{ background: "linear-gradient(145deg, #1C3B4A 0%, #2D5668 100%)", borderRadius: 24 }} 
                className="p-8 h-full flex flex-col justify-between border border-white/10 shadow-2xl relative overflow-hidden group"
              >
                 <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-white/5 blur-[40px] rounded-full" />
                 
                 <div>
                    <div className="flex items-center gap-2 mb-4">
                       <Zap size={14} className="text-[#0087A8]" fill="#0087A8" />
                       <span className="text-[10px] font-black tracking-[0.2em] text-[#94A3B8]">RECOMMENDED TRAINING</span>
                    </div>
                    <h3 className="text-[20px] font-bold text-white mb-3">{REC_TRAINING.title}</h3>
                    <p className="text-[13px] text-[#CBD5E1] leading-relaxed mb-8">
                       {REC_TRAINING.desc}
                    </p>
                    
                    <div className="relative w-full aspect-video rounded-[16px] overflow-hidden mb-8 border border-white/10">
                       <img 
                          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400" 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                       />
                       <div className="absolute inset-0 bg-[#0F172A]/30" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                             <Play fill="white" size={20} className="ml-1" />
                          </div>
                       </div>
                    </div>
                 </div>

                 <Link 
                    href={REC_TRAINING.href} 
                    className="h-[52px] bg-white rounded-[12px] flex items-center justify-center text-[#0087A8] font-bold text-[14px] hover:shadow-lg transition-all"
                 >
                    Start Training Module
                 </Link>
              </div>
           </div>

        </div>

        <div className="h-20" />
      </div>
    </div>
  );
}
