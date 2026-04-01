"use client";
import Link from "next/link";
import { Play, Clock, ChevronRight, Zap, ArrowRight, Target, Mic } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { RecommendationBanner } from "@/components/recommendation-banner";

// ── Tokens ───────────────────────────────────────────
const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.60)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.88)",
};
const GRAD = "linear-gradient(103deg, #016E89 0%, #034657 100%)";

// ── Badge ────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const c = score >= 3.5
    ? { dot:"#34D399", text:"#059669", bg:"rgba(52,211,153,0.12)", label:"Ready" }
    : score >= 2.5
    ? { dot:"#FBBF24", text:"#92400E", bg:"rgba(251,191,36,0.12)",  label:"Borderline" }
    : { dot:"#F87171", text:"#DC2626", bg:"rgba(248,113,113,0.12)", label:"Not Ready" };
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ width:6,height:6,borderRadius:99,background:c.dot,display:"inline-block" }} />
      <span className="text-[12px] font-bold uppercase tracking-wide px-2 py-0.5"
        style={{ borderRadius:6, background:c.bg, color:c.text }}>{c.label}</span>
    </div>
  );
}

// ── Session type options ─────────────────────────────
const SESSION_TYPES = [
  {
    id:"full",
    label:"Full Practice",
    duration:"30 min",
    desc:"All 4 pillars + intro. Complete interview simulation.",
    icon:Mic,
    iconColor: "#0087A8",
    href:"/mock/setup",
  },
  {
    id:"action",
    label:"Quick: Action Pillar",
    duration:"12 min",
    desc:"Focus on your weakest driver. AI-recommended based on your last report.",
    icon:Zap,
    iconColor: "#F59E0B",
    href:"/mock/setup?pillar=action",
    ai:true,
  },
];

// ── Recent sessions ──
// NOTE: Set this array to empty [] to see the Zero State banner and hide the table.
const RECENT_SESSIONS = [
  {
    id:"1", title:"Role-Based Mock", role: "Product Manager", type:"Full Practice",
    date:"Oct 24, 2024", duration:"31 min", qCount:4, score:3.4,
    feedback: "Structured thinking was solid, but action steps felt slightly vague in execution.",
  },
  {
    id:"2", title:"Behavioral Only", role: "Software Engineer", type:"Single Pillar — Action",
    date:"Oct 20, 2024", duration:"12 min", qCount:2, score:4.2,
    feedback: "Excellent concrete examples with clear impact and defined outcomes.",
  },
];

export default function PracticePage() {
  const { user } = useUser();
  const hasSessions = RECENT_SESSIONS.length > 0;

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 py-12 space-y-12">

      {/* ── Page header (Center Aligned) ── */}
      <div className="text-center space-y-3 mb-10 animate-in slide-in-from-bottom-2 fade-in duration-700">
        <p className="text-[16px] font-medium text-[#0F172A]">Welcome, {user.name} 👋</p>
        <h1 className="text-[36px] font-semibold tracking-tight text-[#0F172A] leading-tight">Practice Hub</h1>
        <p className="text-[14px] mt-2 text-[#475569] max-w-lg mx-auto leading-relaxed">
          Master your interview skills with AI-driven feedback across all success drivers.
        </p>
      </div>

      {/* ── Recommendation Banner ── */}
      <div className="animate-in slide-in-from-bottom-4 fade-in duration-1000">
        {!hasSessions ? (
          // Zero State Banner
          <div style={{ background: GRAD, borderRadius: 12 }} className="p-8 md:p-10 relative overflow-hidden shadow-sm flex flex-col items-center text-center">
             <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-5 border border-white/20 mx-auto">
                   <Target size={24} className="text-white" />
                </div>
                <h2 className="text-[22px] font-medium text-white mb-2 leading-tight">Ready for your first practice session?</h2>
                <p className="text-[16px] text-[#CBD5E1]/90 mb-8 max-w-md mx-auto leading-relaxed">
                   Take a full mock interview or focus on a specific pillar. You&apos;ll get detailed feedback and a personalized action plan.
                </p>
                <Link href="/mock/setup" className="h-10 px-6 rounded-lg inline-flex items-center justify-center bg-white text-[#0F172A] text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors shadow-sm mx-auto">
                   Start my first interview
                </Link>
             </div>
          </div>
        ) : (
          // Standard State Banner
          <RecommendationBanner 
            label="AI Recommended"
            title="Your Action driver needs attention"
            description="Based on your last report: Action scored 2.8. Your answers were consistently vague. A 12-minute focused session will move the needle."
            buttonText="Start 12-min session"
            buttonHref="/mock/setup?pillar=action"
            statusColor="#F87171" // Red for alert/weakness
          />
        )}
      </div>

      {/* ── Start a session Grid (Sleek 2-Card) ── */}
      <div className="animate-in slide-in-from-bottom-5 fade-in duration-1000">
        <h2 className="text-[16px] font-semibold text-[#0F172A] mb-4">Start a session</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SESSION_TYPES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} style={{ ...glass, borderRadius: 12 }} className="p-5 bg-white/60 flex flex-col items-start hover:shadow-md transition-all group border border-white/40 overflow-hidden relative">
                <div className="flex w-full items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center shrink-0 border border-[#0F172A]/5 transition-transform group-hover:scale-105 shadow-sm">
                    <Icon size={18} style={{ color: s.iconColor }} />
                  </div>
                  <div className="flex items-center gap-3">
                    {s.ai && (
                       <span className="text-[12px] font-bold uppercase tracking-wider px-2 py-1 bg-gradient-to-r from-[#F59E0B]/10 to-[#F59E0B]/5 text-[#D97706] rounded-[6px] border border-[#F59E0B]/20">
                         AI Pick
                       </span>
                    )}
                    <div className="flex items-center gap-1.5 text-[#475569] bg-white/50 px-2.5 py-1 rounded-[6px] border border-[#0F172A]/5">
                      <Clock size={12} />
                      <span className="text-[12px] font-medium">{s.duration}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1.5">{s.label}</h3>
                <p className="text-[12px] text-[#475569] leading-relaxed mb-6 flex-1 pr-6">
                  {s.desc}
                </p>

                <Link href={s.href} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0087A8] hover:opacity-70 transition-opacity group-hover:text-[#0087A8]">
                  Start interview
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Past Sessions Table (Sleek) ── */}
      {hasSessions && (
        <div className="animate-in slide-in-from-bottom-6 fade-in duration-1000 space-y-4">
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Past mock interviews</h2>
          
          <div style={{ ...glass, borderRadius: 12 }} className="bg-white/60 border border-white/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-[#0F172A]/5 bg-white/40">
                    <th className="py-3 px-5 text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Title</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Duration</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Role</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Rating</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Status</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Feedback</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-[#475569] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F172A]/5">
                  {RECENT_SESSIONS.map((session) => (
                    <tr key={session.id} className="hover:bg-white/50 transition-colors">
                      <td className="py-4 px-5 align-top">
                        <p className="text-[13px] font-semibold text-[#0F172A] mb-0.5">{session.title}</p>
                        <p className="text-[11px] text-[#64748B]">{session.type}</p>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-1.5 text-[12px] text-[#475569] mt-0.5">
                          <Clock size={12} className="text-[#64748B]" />
                          {session.duration}
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <span className="inline-flex items-center px-2 py-1 rounded-[6px] bg-[#0F172A]/5 border border-[#0F172A]/10 text-[11px] font-medium text-[#475569] mt-0.5 whitespace-nowrap">
                          {session.role}
                        </span>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <span className="text-[14px] font-bold text-[#0F172A] mt-0.5 block">{session.score.toFixed(1)}</span>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="mt-0.5">
                           <ScoreBadge score={session.score} />
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top group relative max-w-[180px]">
                        <p className="text-[12px] text-[#475569] leading-relaxed truncate mt-1 cursor-default">
                          {session.feedback}
                        </p>
                        {/* Tooltip on hover for full text */}
                        <div className="absolute left-5 top-full mt-1 w-64 p-3 bg-white border border-[#CBD5E1] rounded-[8px] shadow-xl text-[12px] text-[#475569] z-10 invisible group-hover:visible translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                           {session.feedback}
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center justify-end mt-0.5">
                          <Link href={`/report/${session.id}`} className="h-8 px-4 rounded-[6px] flex items-center justify-center bg-[#0087A8] text-white text-[12px] font-medium hover:bg-[#006E89] transition-colors gap-2 whitespace-nowrap shadow-sm">
                            View details
                            <ArrowRight size={14} className="opacity-80" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
