"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  TRAININGS,
  filterByPillar,
  unsplashUrl,
  type Pillar,
  type Training,
} from "@/lib/trainings-data";
import { Users, Clock, BookOpen, Zap, Target, Heart, CheckCircle, ChevronRight, ArrowRight, Play } from "lucide-react";
import { RecommendationBanner } from "@/components/recommendation-banner";
import { useUser } from "@/lib/user-context";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const TEAL = "#0087A8";
const GRAD = "linear-gradient(145deg,#1C3B4A 0%,#2D5668 55%,#1E4456 100%)";

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.60)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.88)",
};

const DIFF_STYLE: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: "#ECFDF5", text: "#065F46" },
  Intermediate: { bg: "#FFF7ED", text: "#92400E" },
  Advanced:     { bg: "#FDF4FF", text: "#6B21A8" },
};

const PILLS: { label: string; value: PillarFilter; icon: React.ReactNode }[] = [
  { label: "All Courses",  value: "All",     icon: null },
  { label: "Thinking",     value: "Thinking", icon: <BookOpen size={11} /> },
  { label: "Action",       value: "Action",   icon: <Zap size={11} /> },
  { label: "People",       value: "People",   icon: <Heart size={11} /> },
  { label: "Mastery",      value: "Mastery",  icon: <Target size={11} /> },
];

type PillarFilter = "All" | Pillar;

const MOCK_PROGRESS: Record<string, { done: number; total: number }> = {
  "interview-essentials": { done: 1, total: 2 },
};

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── Component: RecommendedCard ──────────────────────────────────────────────
function RecommendedCard({ t }: { t: Training }) {
  const diff = DIFF_STYLE[t.difficulty];
  return (
    <Link href={`/trainings/${t.slug}`}
      className="group flex overflow-hidden rounded-2xl transition-all hover:translate-x-1"
      style={{ ...glass }}>
      {/* Image */}
      <div className="relative w-40 shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={unsplashUrl(t.unsplashId, 400)}
          alt={t.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.15))" }} />
      </div>
      {/* Content */}
      <div className="flex flex-col justify-between px-5 py-4 flex-1 min-w-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-[4px] text-white" style={{ background: TEAL }}>
              {t.pillar}
            </span>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-[4px]" style={{ background: diff.bg, color: diff.text }}>
              {t.difficulty}
            </span>
          </div>
          <p className="text-[14px] font-bold leading-snug text-[#0F172A]">{t.title}</p>
          <p className="text-[11px] leading-relaxed line-clamp-2 text-[#64748B]">{t.impact}</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1"><Clock size={11} />{t.duration}</span>
            <span className="flex items-center gap-1"><Users size={11} />{fmt(t.enrolled)} enrolled</span>
          </div>
          <span className="text-[12px] font-bold text-[#0087A8] flex items-center gap-1 transition-colors">
            Start training <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Component: OngoingCard ──────────────────────────────────────────────────
function OngoingCard({ t }: { t: Training }) {
  const prog = MOCK_PROGRESS[t.slug];
  const pct = prog ? Math.round((prog.done / prog.total) * 100) : 0;
  return (
    <Link href={`/trainings/${t.slug}`}
      className="group shrink-0 w-[420px] overflow-hidden rounded-[20px] transition-all hover:-translate-y-1 hover:shadow-lg flex items-stretch h-36 bg-white/40"
      style={{ ...glass }}>
      <div className="relative w-[140px] overflow-hidden shrink-0 border-r border-[#0F172A]/5">
        <Image src={unsplashUrl(t.unsplashId, 400)} alt={t.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
        <div className="absolute inset-0 bg-slate-900/30 transition-colors group-hover:bg-slate-900/20" />
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-[6px] text-white shadow-lg" style={{ background: TEAL }}>
          {t.pillar}
        </span>
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-black/50 backdrop-blur-md border border-white/20">
          {pct}%
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center">
        <p className="text-[15px] font-bold text-[#0F172A] line-clamp-2 leading-snug mb-3 group-hover:text-[#0087A8] transition-colors">{t.title}</p>
        <div className="mb-3">
          <div className="flex justify-between text-[11px] mb-2 text-[#64748B]">
            <span>Milestone {prog?.done} of {prog?.total} completed</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#0F172A]/10 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: TEAL }} />
          </div>
        </div>
        <div className="text-[13px] font-bold text-[#0087A8] flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          Continue <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TrainingsPage() {
  const { user } = useUser();
  const [activeFilter, setActiveFilter] = useState<PillarFilter>("All");

  const ongoing = TRAININGS.filter((t) => {
    const p = MOCK_PROGRESS[t.slug];
    return p && p.done > 0 && p.done < p.total;
  });

  const recommended = TRAININGS.slice(0, 2);
  const filtered = activeFilter === "All" ? TRAININGS : filterByPillar(activeFilter as Pillar);

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 py-12 space-y-12">

      {/* ── Page header ── */}
      <div className="text-center space-y-3 mb-10 animate-in slide-in-from-bottom-2 fade-in duration-700">
        <p className="text-[16px] font-medium text-[#0F172A]">Hi there, {user.name} 👋</p>
        <h1 className="text-[36px] font-semibold tracking-tight text-[#0F172A] leading-tight">Trainings</h1>
        <p className="text-[14px] mt-2 text-[#475569] max-w-lg mx-auto leading-relaxed">
          Unlock your full potential with specialized training modules designed to master every success driver.
        </p>
      </div>

      {/* ── AI Recommendation Banner ── */}
      <div className="animate-in slide-in-from-bottom-4 fade-in duration-1000">
          <RecommendationBanner 
            label="Next logical driver"
            title="Master the Action Driver"
            description="Your current score is 2.8. Understanding the CAR method will give you the structure needed to hit a 4.0 in your next practice."
            buttonText="Start essential course"
            buttonHref="/trainings/behavioral-car-method"
            statusColor="#34D399" // Green for progression
          />
      </div>

      {/* ── Ongoing ── */}
      {ongoing.length > 0 && (
        <section className="animate-in slide-in-from-bottom-5 fade-in duration-1000">
          <h2 className="text-[15px] font-semibold text-[#0F172A] mb-5 px-1">Continue where you left off</h2>
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
            {ongoing.map((t) => <OngoingCard key={t.slug} t={t} />)}
          </div>
        </section>
      )}

      {/* ── Recommended ── */}
      <section className="animate-in slide-in-from-bottom-6 fade-in duration-1000">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-[15px] font-semibold text-[#0F172A]">Recommended for you</h2>
          <Link href="#all" className="text-[12px] font-bold text-[#0087A8] hover:opacity-70 transition-opacity">
            View all courses →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommended.map((t) => <RecommendedCard key={t.slug} t={t} />)}
        </div>
      </section>

      {/* ── All Trainings + Pillar filter ── */}
      <section id="all" className="animate-in slide-in-from-bottom-7 fade-in duration-1000 space-y-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-1">
             <h2 className="text-[15px] font-semibold text-[#0F172A]">All trainings</h2>
             <p className="text-[11px] text-[#64748B]">Filter courses by specific success drivers.</p>
          </div>
          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap justify-start md:justify-end">
            {PILLS.map((p) => {
              const active = activeFilter === p.value;
              return (
                <button key={p.value}
                  onClick={() => setActiveFilter(p.value)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold rounded-full transition-all border shadow-sm backdrop-blur-lg"
                  style={{
                    background: active ? "#0087A8" : "rgba(255,255,255,0.70)",
                    color: active ? "#ffffff" : "#475569",
                    borderColor: active ? "#0087A8" : "rgba(15,23,42,0.10)",
                  }}>
                  {p.icon}{p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map((t) => <RecommendedCard key={t.slug} t={t} />)}
        </div>
      </section>

    </div>
  );
}
