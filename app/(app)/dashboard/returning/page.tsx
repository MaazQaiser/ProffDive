"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mic, BookOpen, Zap, Target, Heart } from "lucide-react";
import { TRAININGS, unsplashUrl, PILLAR_COLORS } from "@/lib/trainings-data";
import { useUser } from "@/lib/user-context";
import { RecommendationBanner } from "@/components/recommendation-banner";

// ── Mock Data for Returning User ──────────────────────────────────────
const GREETING_COPIES = [
  (name: string) => `Hey ${name || 'there'}, welcome back — keep the momentum going 🔥`,
  (name: string) => `Good to see you, ${name || 'there'} — you've made real progress`,
  (name: string) => `You're building something real, ${name || 'there'} — let's keep going 💪`,
  (name: string) => `Ready to level up today, ${name || 'there'}?`,
];

const MOCK_SESSIONS = [
  { label: "S1", Thinking: 2.5, Action: 2.0, People: 3.0, Mastery: 1.8 },
  { label: "S2", Thinking: 2.8, Action: 2.6, People: 3.2, Mastery: 2.2 },
  { label: "S3", Thinking: 3.1, Action: 3.4, People: 3.8, Mastery: 2.7 },
  { label: "S4", Thinking: 3.1, Action: 3.8, People: 4.0, Mastery: 2.9 },
];

// Demoing scenario where overall is 3.2 (Borderline) and People and Mastery are explicitly lagging (< 2.5)
const PILLARS_LATEST = [
  { label: "Thinking", score: 4.0, delta: +0.3, color: PILLAR_COLORS.Thinking, icon: <BookOpen size={16} /> },
  { label: "Action",   score: 4.4, delta: +0.4, color: PILLAR_COLORS.Action,   icon: <Zap size={16} /> },
  { label: "People",   score: 2.0, delta: +0.2, color: PILLAR_COLORS.People,   icon: <Heart size={16} /> },
  { label: "Mastery",  score: 2.4, delta: +0.2, color: PILLAR_COLORS.Mastery,  icon: <Target size={16} /> },
];

const OVERALL_SCORE = parseFloat(
  (PILLARS_LATEST.reduce((s, p) => s + p.score, 0) / PILLARS_LATEST.length).toFixed(1)
);

const IN_PROGRESS_SLUGS = [
  { slug: "interview-essentials",       done: 1, total: 2 },
  { slug: "behavioral-car-method",      done: 0, total: 3 },
  { slug: "executive-presence-mastery", done: 2, total: 4 },
];

// ── Styles ──────────────────────────────────────────────────────────
const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
};

const glassSquare: React.CSSProperties = {
  ...glass,
  borderRadius: 12,
}

// ── Helper Components ───────────────────────────────────────────────

function StatusBadge({ overall, minPillar }: { overall: number; minPillar: number }) {
  let text = "Keep Going";
  let colorVar = "var(--borderline-text)";
  let bgVar = "var(--borderline-fill)";
  
  const isPass = overall >= 3.5 && minPillar >= 2.5;

  if (isPass) {
    text = "Ready";
    colorVar = "var(--ready-text)";
    bgVar = "var(--ready-fill)";
  } else {
    if (overall >= 2.5) {
      if (overall >= 3.5) {
        text = "Needs Focus";
      } else {
        text = "Borderline";
      }
    } else {
      text = "In Progress";
      colorVar = "var(--not-ready-text)";
      bgVar = "var(--not-ready-fill)";
    }
  }

  return (
    <span className="text-[12px] font-bold px-2 py-0.5 rounded-[6px] uppercase tracking-wider" style={{ color: colorVar, backgroundColor: bgVar }}>
      {text}
    </span>
  );
}

function OngoingCard({ slug, done, total }: { slug: string; done: number; total: number }) {
  const t = TRAININGS.find(x => x.slug === slug);
  if (!t) return null;
  
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  
  return (
    <Link href={`/trainings/${t.slug}`}
      className="group w-full min-w-0 overflow-hidden rounded-[16px] transition-all hover:-translate-y-1 hover:shadow-lg flex items-stretch h-32 bg-white/40"
      style={{ ...glass }}>
      <div className="relative w-[120px] overflow-hidden shrink-0 border-r border-[#0F172A]/5">
        <Image src={unsplashUrl(t.unsplashId, 400)} alt={t.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
        <div className="absolute inset-0 bg-slate-900/20 transition-colors group-hover:bg-slate-900/10" />
        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-[4px] text-white shadow-md bg-[#0087A8]">
          {t.pillar}
        </span>
        <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-black/50 backdrop-blur-md border border-white/20">
          {pct}%
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center min-w-0">
        <p className="text-[14px] font-bold text-[#0F172A] line-clamp-2 leading-snug mb-2 group-hover:text-[#0087A8] transition-colors">{t.title}</p>
        <div className="mb-2">
          <div className="flex justify-between text-[12px] mb-1.5 text-[#64748B]">
            <span>Milestone {done} of {total} completed</span>
          </div>
          <div className="h-1 rounded-full bg-[#0F172A]/10 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 bg-[#0087A8]" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="text-[12px] font-bold text-[#0087A8] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity mt-auto">
          Continue <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

// ── Exported Page ──────────────────────────────────────
export default function ReturningUserDashboard() {
  const { user } = useUser();
  const [greetingIndex] = useState(
    () => new Date().getDay() % GREETING_COPIES.length
  );

  return (
    <div>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 py-10 space-y-10">
        
        {/* Row 1 — Centered Greeting Header */}
        <div className="flex flex-col items-center text-center space-y-1.5 mb-6 md:mb-8 mt-2 md:mt-4">
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight text-[#0F172A]">
            {GREETING_COPIES[greetingIndex](user.name)}
          </h1>
          <p className="text-[14px] md:text-[16px] font-medium text-[#64748B]">
            Preparing for {user.role || "your next role"} · 4 sessions completed
          </p>
        </div>

        {/* Row 2 — Single KPI Card (Compact) */}
        <div style={{ ...glass }} className="p-5 md:p-6 flex flex-col gap-6 w-full mb-2">
           {/* Top Section */}
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10">
             {/* Left: Overall */}
             <div className="flex flex-col gap-2 shrink-0 min-w-0 max-w-full md:max-w-lg">
               <div className="flex items-center gap-3">
                 <h2 className="text-[16px] font-semibold text-[#0F172A] tracking-tight">Readiness Progress</h2>
                 <StatusBadge overall={OVERALL_SCORE} minPillar={Math.min(...PILLARS_LATEST.map(p => p.score))} />
               </div>
               <div className="flex flex-col gap-1.5 mt-1 min-w-0">
                 <div className="flex items-baseline gap-2">
                   <span className="text-[36px] md:text-[40px] font-semibold leading-none text-[#0F172A] tracking-tighter">{OVERALL_SCORE}</span>
                   <span className="text-[13px] text-[#64748B] font-medium">/ 5</span>
                 </div>
                 {/* AI Coach Liner (Truncated with Slate 100 Stroke) */}
                 <div className="mt-1 pt-2.5 border-t border-slate-200 max-w-full overflow-hidden">
                   <p className="text-[12px] md:text-[13px] font-medium text-slate-700 truncate tracking-tight">
                     {(() => {
                        const laggingPillars = PILLARS_LATEST.filter(p => p.score < 2.5);
                        const isPass = OVERALL_SCORE >= 3.5 && laggingPillars.length === 0;
                        
                        if (isPass) return <span>✨ You are ready! Improve to get higher tiers from others and shine in the ranking.</span>;
                        
                        if (laggingPillars.length > 0) {
                          const names = laggingPillars.map(p => p.label).join(" and ");
                          return (
                            <span>
                              💡 You are on your way, but {names} {laggingPillars.length > 1 ? "are" : "is"} currently lagging behind. Focus on this area to boost your overall readiness.
                            </span>
                          );
                        }
                        
                        return <span>Keep practicing to push your overall score up to the 3.5 baseline threshold.</span>;
                     })()}
                   </p>
                 </div>
               </div>
             </div>
             
             {/* Right: Legend Stats */}
             <div className="flex flex-wrap gap-4 md:gap-8 lg:gap-12 w-full md:w-auto md:justify-end pb-1.5">
                {PILLARS_LATEST.map(p => (
                  <div key={p.label} className="flex flex-col gap-1.5 min-w-[50px] md:min-w-[60px]">
                    <span className="text-[12px] font-medium text-[#475569] tracking-tight">{p.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className={`text-[18px] md:text-[20px] font-semibold leading-none tracking-tight ${p.score < 2.5 ? 'text-[#EF4444]' : 'text-[#0F172A]'}`}>{p.score}</span>
                    </div>
                  </div>
                ))}
             </div>
           </div>

           {/* Segmented Bar */}
           <div className="flex h-1.5 gap-[2px] w-full mt-[-6px]">
             {PILLARS_LATEST.map((p, idx, arr) => {
                const totalScores = PILLARS_LATEST.reduce((acc, curr) => acc + curr.score, 0);
                const widthPct = (p.score / totalScores) * 100;
                let borderRadius = "0px";
                if (idx === 0) borderRadius = "9999px 0 0 9999px";
                else if (idx === arr.length - 1) borderRadius = "0 9999px 9999px 0";
                
                return (
                  <div 
                    key={p.label} 
                    className="h-full transition-all duration-500 hover:brightness-110" 
                    style={{ width: `${widthPct}%`, backgroundColor: p.color, borderRadius }}
                  />
                );
             })}
           </div>
        </div>

        {/* Row 3 — In-Progress Trainings */}
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A] mb-4">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {IN_PROGRESS_SLUGS.map(tr => (
              <OngoingCard key={tr.slug} slug={tr.slug} done={tr.done} total={tr.total} />
            ))}
          </div>
        </div>

        {/* Row 4 — Split Layout: Trend Chart + AI Coaching */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left ~55% */}
          <div className="lg:w-[55%] flex flex-col" style={{ ...glass, padding: 24 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">Performance Over Time</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F172A]" />
                  <span className="text-[11px] font-bold text-[#0F172A]">Overall</span>
                </div>
                {PILLARS_LATEST.map(p => (
                  <div key={p.label} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full opacity-70" style={{ backgroundColor: p.color }} />
                    <span className="text-[11px] font-medium text-[#64748B]">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SVG + CSS Line Chart */}
            <div className="flex-1 relative mt-2 min-h-[200px] flex items-end ml-6 pr-4">
              {/* Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-5">
                <div className="border-t border-[#0F172A]/5 w-full relative"><span className="absolute -left-6 -top-2 text-[12px] text-[#94A3B8]">5.0</span></div>
                <div className="border-t border-[#0F172A]/5 w-full relative"><span className="absolute -left-6 -top-2 text-[12px] text-[#94A3B8]">2.5</span></div>
                <div className="border-t border-[#0F172A]/10 w-full relative"><span className="absolute -left-6 -top-2 text-[12px] text-[#94A3B8]">0</span></div>
              </div>

              {/* Chart container */}
              <div className="relative w-full h-[180px] mb-5">
                {(() => {
                  const pointsData = MOCK_SESSIONS.map((s, i) => {
                    const x = (i / (MOCK_SESSIONS.length - 1)) * 100;
                    const overall = (s.Thinking + s.Action + s.People + s.Mastery) / 4;
                    return {
                      x,
                      overall: 100 - (overall / 5) * 100,
                      Thinking: 100 - (s.Thinking / 5) * 100,
                      Action: 100 - (s.Action / 5) * 100,
                      People: 100 - (s.People / 5) * 100,
                      Mastery: 100 - (s.Mastery / 5) * 100,
                      label: s.label,
                      rawOverall: overall,
                    };
                  });

                  const generatePath = (key: 'overall' | 'Thinking' | 'Action' | 'People' | 'Mastery') => {
                    return pointsData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p[key]}`).join(' ');
                  };

                  return (
                    <>
                      {/* SVG Lines */}
                      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d={generatePath('Thinking')} fill="none" stroke={PILLAR_COLORS.Thinking} strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                        <path d={generatePath('Action')} fill="none" stroke={PILLAR_COLORS.Action} strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                        <path d={generatePath('People')} fill="none" stroke={PILLAR_COLORS.People} strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                        <path d={generatePath('Mastery')} fill="none" stroke={PILLAR_COLORS.Mastery} strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                        <path d={generatePath('overall')} fill="none" stroke="#0F172A" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                      </svg>

                      {/* HTML Dots & Labels */}
                      {pointsData.map((p, i) => (
                        <div key={i} className="absolute inset-0 pointer-events-none">
                          <div className="absolute w-[6px] h-[6px] rounded-full -ml-[3px] -mt-[3px] opacity-70" style={{ left: `${p.x}%`, top: `${p.Thinking}%`, backgroundColor: PILLAR_COLORS.Thinking }} />
                          <div className="absolute w-[6px] h-[6px] rounded-full -ml-[3px] -mt-[3px] opacity-70" style={{ left: `${p.x}%`, top: `${p.Action}%`, backgroundColor: PILLAR_COLORS.Action }} />
                          <div className="absolute w-[6px] h-[6px] rounded-full -ml-[3px] -mt-[3px] opacity-70" style={{ left: `${p.x}%`, top: `${p.People}%`, backgroundColor: PILLAR_COLORS.People }} />
                          <div className="absolute w-[6px] h-[6px] rounded-full -ml-[3px] -mt-[3px] opacity-70" style={{ left: `${p.x}%`, top: `${p.Mastery}%`, backgroundColor: PILLAR_COLORS.Mastery }} />
                          
                          <div className="absolute w-[10px] h-[10px] rounded-full -ml-[5px] -mt-[5px] bg-[#0F172A] border-2 border-white pointer-events-auto hover:scale-125 transition-transform group" style={{ left: `${p.x}%`, top: `${p.overall}%` }}>
                            {/* Hover tooltip for overall */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[12px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                              {p.rawOverall.toFixed(2)}
                            </div>
                          </div>
                          
                          {/* X-axis label */}
                          <div className="absolute bottom-[-24px] text-[12px] font-medium text-[#64748B] uppercase tracking-wider" style={{ left: `${p.x}%`, transform: 'translateX(-50%)' }}>
                            {p.label}
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Right ~45% */}
          <div className="lg:w-[45%] flex flex-col justify-center">
            <RecommendationBanner 
              label="Next logical driver"
              title="Master the Action Driver"
              description="Your current Action score is 3.8. You're doing great, but tightening your CAR method structure will secure that 4.0 in your next practice interview."
              buttonText="Review Action courses"
              buttonHref="/trainings"
              statusColor="#F59E0B"
            />
          </div>
        </div>

        {/* Row 5 — Action Cards */}
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
        
        <div className="h-10" />
      </div>
    </div>
  );
}
