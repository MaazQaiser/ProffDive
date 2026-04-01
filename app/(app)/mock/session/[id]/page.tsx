"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play, ChevronRight, Clock, Mic, Video, ChevronDown,
  CheckCircle, AlertTriangle, XCircle, Zap, ArrowRight, BookOpen
} from "lucide-react";
import { TRAININGS, unsplashUrl, PILLAR_COLORS } from "@/lib/trainings-data";

// ── Design tokens ─────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.70)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.75)",
  borderRadius: 16,
  boxShadow: "0 2px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
};
const IB = "1px solid rgba(0,0,0,0.06)";
const GRAD = "linear-gradient(145deg,#1C3B4A 0%,#2D5668 55%,#1E4456 100%)";
const TEAL = "#0087A8";

// ── Types ──────────────────────────────────────────────────────────────
type CoachingNote = { type: "strength" | "partial" | "gap"; text: string };
type ScoreAxis    = { label: string; score: number };
type TxLine       = { role: "interviewer" | "user"; speaker: string; time: string; text: string; flag?: string };

interface QuestionEntry {
  id: number;
  text: string;
  type: string;
  duration: string;
  score: number;
  answerTranscript: string;
  coaching: CoachingNote[];
  scoreBreakdown: ScoreAxis[];
  recommendedAnswer?: {
    c: string;
    a: string;
    r: string;
  };
}

// ── Mock data ──────────────────────────────────────────────────────────
const META = {
  title: "Role-Based Mock",
  type: "Full Practice",
  date: "Oct 24, 2024 · 11:04 AM",
  duration: "31 min",
  score: 3.4,
  reportId: "1",
};

const TRANSCRIPT: TxLine[] = [
  { role: "interviewer", speaker: "AI Interviewer", time: "0:00", text: "Tell me about a time you took initiative on something no one asked you to do." },
  { role: "user", speaker: "You", time: "0:05", text: "Sure. We had a performance issue in our system — the checkout was slow during peak hours. I noticed it wasn't on anyone's radar so I decided to investigate." },
  { role: "user", speaker: "You", time: "0:22", text: "I looked into the caching layer and found that Redis keys were expiring too aggressively. I proposed a fix, implemented the TTL change, and...", flag: "result too vague" },
  { role: "interviewer", speaker: "AI Interviewer", time: "1:44", text: "Describe a situation where you had to handle a conflict with a senior stakeholder." },
  { role: "user", speaker: "You", time: "1:49", text: "There was a time when the product lead and I disagreed on prioritization. I set up a structured meeting, presented data on each option, and we aligned on a roadmap that satisfied both teams." },
  { role: "interviewer", speaker: "AI Interviewer", time: "3:28", text: "What's the most technically complex thing you've worked on and what did it teach you?" },
  { role: "user", speaker: "You", time: "3:33", text: "That would be the data pipeline we built for real-time analytics...", flag: "answer too short" },
  { role: "user", speaker: "You", time: "3:55", text: "It taught me the value of fail-safes and progressive delivery. We shipped it in stages and caught issues early." },
];

const QUESTIONS: QuestionEntry[] = [
  {
    id: 1,
    text: "Tell me about a time you took initiative on something no one asked you to do.",
    type: "Behavioural", duration: "2m 15s", score: 3.8,
    answerTranscript: "Sure. We had a performance issue in our system — the checkout was slow during peak hours. I noticed it wasn't on anyone's radar so I decided to investigate. I looked into the caching layer and found that Redis keys were expiring too aggressively. I proposed a fix, implemented the TTL change, and reduced checkout latency by 40%.",
    coaching: [
      { type: "strength", text: "Strong Situation context — clearly set the stakes" },
      { type: "strength", text: "First-person Action with clear ownership" },
      { type: "partial",  text: "Result mentioned but not fully quantified — add business impact" },
      { type: "gap",      text: "Missing reflection on what you learned from the initiative" },
    ],
    scoreBreakdown: [
      { label: "Structure", score: 4.0 },
      { label: "Depth",     score: 3.5 },
      { label: "Clarity",   score: 4.0 },
      { label: "Overall",   score: 3.8 },
    ],
  },
  {
    id: 2,
    text: "Describe a situation where you had to handle a conflict with a senior stakeholder.",
    type: "Situational", duration: "1m 52s", score: 4.2,
    answerTranscript: "There was a time when the product lead and I disagreed on prioritization. I set up a structured meeting, presented data on each option, and we aligned on a roadmap that satisfied both teams.",
    coaching: [
      { type: "strength", text: "Excellent use of data to resolve conflict — shows maturity" },
      { type: "strength", text: "Outcome was clearly articulated and specific" },
      { type: "partial",  text: "Could elaborate more on the stakeholder's perspective and how you adapted" },
    ],
    scoreBreakdown: [
      { label: "Structure", score: 4.5 },
      { label: "Depth",     score: 4.0 },
      { label: "Clarity",   score: 4.5 },
      { label: "Overall",   score: 4.2 },
    ],
  },
  {
    id: 3,
    text: "What's the most technically complex thing you've worked on and what did it teach you?",
    type: "Mastery", duration: "1m 10s", score: 2.4,
    answerTranscript: "That would be the data pipeline we built for real-time analytics... It taught me the value of fail-safes and progressive delivery. We shipped it in stages and caught issues early.",
    coaching: [
      { type: "gap",     text: "Answer was significantly too short — ideal length is 2–4 minutes" },
      { type: "gap",     text: "No technical specificity stated — what was complex about it?" },
      { type: "partial", text: "Learning mentioned but needs to be tied to a measurable change in behaviour" },
      { type: "gap",     text: "Missing the 'what I'd do differently' reflection" },
    ],
    scoreBreakdown: [
      { label: "Structure", score: 2.5 },
      { label: "Depth",     score: 2.0 },
      { label: "Clarity",   score: 3.0 },
      { label: "Overall",   score: 2.4 },
    ],
  },
  {
    id: 4,
    text: "Walk me through how you'd prioritise competing features with a constrained team.",
    type: "Thinking", duration: "2m 40s", score: 3.2,
    answerTranscript: "I'd first align with stakeholders on the North Star metric, then score each feature by impact-to-effort ratio. I'd also consider risk, dependencies, and what can be sequenced to unlock the most downstream value.",
    coaching: [
      { type: "strength", text: "Correct framework — impact vs effort reasoning is strong" },
      { type: "partial",  text: "No specific example given — back this up with a real story" },
      { type: "gap",      text: "Risk and dependency analysis was mentioned but not explained" },
    ],
    scoreBreakdown: [
      { label: "Structure", score: 3.5 },
      { label: "Depth",     score: 2.8 },
      { label: "Clarity",   score: 3.5 },
      { label: "Overall",   score: 3.2 },
    ],
    recommendedAnswer: {
      c: "At my previous role, we were managing the product roadmap manually using a spread of different tools which led to fragmented data.",
      a: "I implemented a centralized RICE scoring framework and integrated it into our Jira workflow to ensure all features were evaluated by the same business impact metrics.",
      r: "This led to a 15% increase in feature delivery speed and 100% stakeholder alignment on the Q3 roadmap prioritization."
    },
  },
];

// Trainings linked to specific gaps identified
const SUGGESTED_TRAINING_SLUGS = [
  "behavioral-car-method",    // for result quantification gaps
  "handling-ambiguity",       // for Q4 thinking framework gap
  "stakeholder-communication",// for Q2 depth improvement
];

// ── Helper: score badge ────────────────────────────────────────────────
function badge(score: number) {
  if (score >= 3.5) return { dot: "#34D399", bg: "rgba(52,211,153,0.12)", text: "#059669", label: "Ready" };
  if (score >= 2.5) return { dot: "#FBBF24", bg: "rgba(251,191,36,0.12)", text: "#92400E", label: "Borderline" };
  return { dot: "#F87171", bg: "rgba(248,113,113,0.12)", text: "#DC2626", label: "Not Ready" };
}

// ── Component: score bar ───────────────────────────────────────────────
function ScoreBar({ label, score, max = 5 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  const b   = badge(score);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[rgba(15,15,15,0.45)] w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.07)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: b.dot }} />
      </div>
      <span className="text-[11px] font-bold font-mono w-7 text-right" style={{ color: b.text }}>{score.toFixed(1)}</span>
    </div>
  );
}

// ── Component: coaching note ───────────────────────────────────────────
function CoachingLine({ note }: { note: CoachingNote }) {
  const map = {
    strength: { Icon: CheckCircle,    color: "#16A34A", bg: "rgba(22,163,74,0.07)"  },
    partial:  { Icon: AlertTriangle,  color: "#D97706", bg: "rgba(217,119,6,0.07)"  },
    gap:      { Icon: XCircle,        color: "#DC2626", bg: "rgba(220,38,38,0.07)"  },
  };
  const { Icon, color, bg } = map[note.type];
  return (
    <div className="flex items-start gap-2.5 px-3 py-2 rounded-[8px]" style={{ background: bg }}>
      <Icon size={13} className="mt-0.5 shrink-0" style={{ color }} />
      <span className="text-[12px] leading-relaxed" style={{ color: "rgba(15,15,15,0.72)" }}>{note.text}</span>
    </div>
  );
}

// ── Component: Q&A accordion ───────────────────────────────────────────
function QuestionAccordion({ q, defaultOpen }: { q: QuestionEntry; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const b = badge(q.score);
  const typeColors: Record<string, string> = {
    Behavioural: "#0087A8", Situational: "#7C3AED", Mastery: "#16A34A", Thinking: "#D97706",
  };

  return (
    <div style={CARD} className="overflow-hidden transition-all duration-300">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-black/[0.015] transition-colors"
      >
        {/* Question number */}
        <span className="text-[11px] font-black font-mono shrink-0" style={{ color: "rgba(15,15,15,0.25)" }}>
          Q{q.id}
        </span>

        {/* Question text */}
        <p className="flex-1 text-[13px] font-medium leading-snug line-clamp-1" style={{ color: "#0F0F0F" }}>
          {q.text}
        </p>

        {/* Meta chips */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full" style={{ color: typeColors[q.type] ?? TEAL, background: `${typeColors[q.type] ?? TEAL}14` }}>
            {q.type}
          </span>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 6, height: 6, borderRadius: 99, background: q.score <= 3.4 ? "#EF4444" : b.dot, display: "inline-block" }} />
            <span className="text-[12px] font-bold font-mono" style={{ color: q.score <= 3.4 ? "#EF4444" : b.text }}>{q.score.toFixed(1)}</span>
          </div>
          <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} style={{ color: "rgba(15,15,15,0.30)" }} />
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: IB }} className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="px-6 py-5 space-y-6">
            {/* Your answer */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] font-bold mb-3 text-slate-400">Your Answer</p>
              <p className="text-[14px] leading-relaxed italic text-slate-600">
                &ldquo;{q.answerTranscript}&rdquo;
              </p>
            </div>

            {/* AI Recommended Answer (Only if score <= 3.4) */}
            {q.score <= 3.4 && q.recommendedAnswer && (
              <div className="p-5 rounded-xl border border-teal-100 bg-teal-50/20 space-y-4">
                <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#0087A8]">✦ Your structured answer is this (CAR Method)</p>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-teal-600 text-white font-bold text-[11px] shrink-0">C</span>
                    <p className="text-[13px] leading-relaxed text-[#0F172A]"><span className="font-bold text-teal-800">Context:</span> {q.recommendedAnswer.c}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-teal-600 text-white font-bold text-[11px] shrink-0">A</span>
                    <p className="text-[13px] leading-relaxed text-[#0F172A]"><span className="font-bold text-teal-800">Action:</span> {q.recommendedAnswer.a}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-teal-600 text-white font-bold text-[11px] shrink-0">R</span>
                    <p className="text-[13px] leading-relaxed text-[#0F172A]"><span className="font-bold text-teal-800">Result:</span> {q.recommendedAnswer.r}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────
export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const b = badge(META.score);
  const suggestedTrainings = TRAININGS.filter(t => SUGGESTED_TRAINING_SLUGS.includes(t.slug));

  return (
    <div className="max-w-[1060px] mx-auto px-6 lg:px-10 py-8 space-y-5">

      {/* ── ZONE 1: Header ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: "rgba(15,15,15,0.38)" }}>
        <Link href="/mock" className="hover:underline">Practice</Link>
        <ChevronRight size={12} />
        <span style={{ color: "#0F0F0F" }}>{META.title}</span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.20em] font-bold mb-1" style={{ color: "rgba(15,15,15,0.28)" }}>
            Session Recording
          </p>
          <h1 className="text-[24px] font-bold" style={{ color: "#0F0F0F" }}>{META.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px]" style={{ color: "rgba(15,15,15,0.40)" }}>{META.date}</span>
            <span style={{ width: 3, height: 3, borderRadius: 99, background: "rgba(15,15,15,0.18)", display: "inline-block" }} />
            <span className="text-[11px]" style={{ color: "rgba(15,15,15,0.40)" }}>{META.duration}</span>
            <span style={{ width: 3, height: 3, borderRadius: 99, background: "rgba(15,15,15,0.18)", display: "inline-block" }} />
            <span className="text-[11px]" style={{ color: "rgba(15,15,15,0.40)" }}>{QUESTIONS.length} questions</span>
          </div>
        </div>
        <Link
          href={`/report/${META.reportId}`}
          className="h-9 px-4 text-[12px] font-bold text-white flex items-center gap-1.5 hover:opacity-85 transition-opacity shrink-0"
          style={{ borderRadius: 10, background: TEAL }}
        >
          View full report <ChevronRight size={12} />
        </Link>
      </div>

      {/* ── ZONE 2: Score overview bar ──────────────────────────── */}
      <div style={{ ...CARD, borderRadius: 12 }}>
        <div className="flex items-center gap-6 flex-wrap" style={{ padding: "14px 24px" }}>
          {/* Score */}
          <div className="flex items-end gap-1.5">
            <span className="text-[28px] font-bold font-mono" style={{ color: "#0F0F0F" }}>{META.score.toFixed(1)}</span>
            <span className="text-[12px] pb-0.5" style={{ color: "rgba(15,15,15,0.28)" }}>/5.0</span>
          </div>

          <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.06)" }} />

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span style={{ width: 7, height: 7, borderRadius: 99, background: b.dot, display: "inline-block" }} />
            <span
              className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1"
              style={{ borderRadius: 6, background: b.bg, color: b.text }}
            >
              {b.label}
            </span>
          </div>

          <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.06)" }} />

          {/* Recording medium */}
          <div className="flex items-center gap-4 text-[11px]" style={{ color: "rgba(15,15,15,0.40)" }}>
            <span className="flex items-center gap-1.5"><Mic size={11} /> Audio recorded</span>
            <span className="flex items-center gap-1.5"><Video size={11} /> Video recorded</span>
          </div>

          {/* Duration — right aligned */}
          <div className="ml-auto flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(15,15,15,0.38)" }}>
            <Clock size={11} />
            {META.duration}
          </div>
        </div>
      </div>

      {/* ── ZONE 3: Player + Transcript ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">

        {/* Recording player */}
        <div style={CARD} className="overflow-hidden">
          {/* Video */}
          <div className="relative flex items-center justify-center" style={{ aspectRatio: "16/9", background: GRAD }}>
            <button
              className="flex items-center justify-center hover:scale-105 transition-transform"
              style={{ width: 64, height: 64, borderRadius: 999, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)" }}
            >
              <Play size={24} style={{ color: "#FFF", marginLeft: 3 }} />
            </button>
            <div className="absolute bottom-4 right-4" style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(0,0,0,0.55)" }}>
              <span className="text-[11px] font-mono font-semibold" style={{ color: "#FFF" }}>{META.duration}</span>
            </div>
            <div className="absolute bottom-3 left-3" style={{ width: 80, height: 54, borderRadius: 8, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.50)" }}>You</span>
            </div>
          </div>

          {/* Scrubber */}
          <div style={{ padding: "14px 20px", borderBottom: IB }}>
            <div style={{ height: 4, borderRadius: 99, background: "rgba(0,0,0,0.08)", cursor: "pointer" }}>
              <div style={{ height: "100%", borderRadius: 99, width: "38%", background: TEAL }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-mono" style={{ color: "rgba(15,15,15,0.38)" }}>11:42</span>
              <span className="text-[10px] font-mono" style={{ color: "rgba(15,15,15,0.38)" }}>{META.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4" style={{ padding: "12px 20px" }}>
            <button className="text-[11px] font-semibold px-4 py-2 hover:bg-[#F0F0F6] transition-colors" style={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", color: "rgba(15,15,15,0.55)" }}>
              ← 10s
            </button>
            <button className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 999, background: TEAL }}>
              <Play size={15} style={{ color: "#FFF", marginLeft: 2 }} />
            </button>
            <button className="text-[11px] font-semibold px-4 py-2 hover:bg-[#F0F0F6] transition-colors" style={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", color: "rgba(15,15,15,0.55)" }}>
              10s →
            </button>
            <div style={{ marginLeft: "auto" }}>
              <select className="text-[11px] font-semibold px-3 py-2 outline-none" style={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", color: "rgba(15,15,15,0.55)", background: "transparent" }}>
                <option>1× speed</option>
                <option>1.5× speed</option>
                <option>2× speed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div style={{ ...CARD, maxHeight: 430, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "11px 18px", borderBottom: IB, background: "rgba(0,0,0,0.015)", flexShrink: 0 }}>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: "rgba(15,15,15,0.30)" }}>Full Transcript</p>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
            {TRANSCRIPT.map((t, i) => (
              <div key={i} style={{ padding: "10px 18px", borderBottom: i < TRANSCRIPT.length - 1 ? IB : undefined }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: t.role === "interviewer" ? TEAL : "rgba(15,15,15,0.40)" }}>
                    {t.speaker}
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: "rgba(15,15,15,0.28)" }}>{t.time}</span>
                  {t.flag && (
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 ml-auto" style={{ borderRadius: 4, background: "rgba(251,191,36,0.15)", color: "#92400E" }}>
                      ⚠ {t.flag}
                    </span>
                  )}
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: t.role === "interviewer" ? "#0F0F0F" : "rgba(15,15,15,0.58)" }}>
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ZONE 4: Q&A Breakdown ──────────────────────────────── */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-3" style={{ color: "rgba(15,15,15,0.30)" }}>
          Question Breakdown
        </p>
        <div className="space-y-2">
          {QUESTIONS.map((q, i) => (
            <QuestionAccordion key={q.id} q={q} defaultOpen={i === 0} />
          ))}
        </div>
      </div>

      {/* ── ZONE 5: AI Summary Card ────────────────────────────── */}
      <div className="rounded-[16px] overflow-hidden" style={{ background: GRAD }}>
        <div className="p-6 md:p-8 space-y-5">
          {/* Header */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-3" style={{ color: TEAL }}>
              ✦ AI Session Summary
            </p>
            <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              Overall a <strong style={{ color: "#FFF" }}>Borderline</strong> session with genuine strengths in stakeholder communication and structured thinking. Your biggest opportunity area is answer depth — particularly in technical mastery questions where you trailed off before fully landing the result. Two of four answers had underqualified result statements. Focus your next practice on finishing strong with measurable outcomes.
            </p>
          </div>

          {/* Highlight chips */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-[10px]" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.20)" }}>
              <CheckCircle size={13} style={{ color: "#34D399" }} />
              <span className="text-[12px] font-semibold" style={{ color: "#34D399" }}>Strongest: Q2 — Stakeholder conflict (4.2)</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-[10px]" style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.20)" }}>
              <AlertTriangle size={13} style={{ color: "#F87171" }} />
              <span className="text-[12px] font-semibold" style={{ color: "#F87171" }}>Gap: Q3 — Technical depth & result quantification (2.4)</span>
            </div>
          </div>

          {/* CTA */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 20 }}>
            <Link
              href={`/report/${META.reportId}`}
              className="inline-flex items-center gap-2 h-11 px-8 text-[13px] font-bold text-[#0F0F0F] hover:opacity-90 transition-all active:scale-95"
              style={{ borderRadius: 10, background: "#FFFFFF", boxShadow: "0 4px 16px rgba(0,0,0,0.20)" }}
            >
              <Zap size={14} style={{ color: TEAL }} />
              View Full Performance Report
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── ZONE 6: Suggested Trainings ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: "rgba(15,15,15,0.30)" }}>
              Recommended for You
            </p>
            <h2 className="text-[16px] font-bold" style={{ color: "#0F0F0F" }}>
              Trainings based on this session
            </h2>
          </div>
          <Link href="/trainings" className="text-[12px] font-bold flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: TEAL }}>
            Browse all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedTrainings.map(t => {
            const pillarColor = PILLAR_COLORS[t.pillar];
            return (
              <Link key={t.slug} href={`/trainings/${t.slug}`} className="group block" style={CARD}>
                {/* Thumbnail */}
                <div className="relative overflow-hidden" style={{ borderRadius: "16px 16px 0 0", aspectRatio: "16/8" }}>
                  <img
                    src={`https://images.unsplash.com/photo-${t.unsplashId}?auto=format&fit=crop&w=600&q=80`}
                    alt={t.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />
                  {/* Pillar chip */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full text-white" style={{ background: pillarColor }}>
                      {t.pillar}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(15,15,15,0.35)" }}>{t.difficulty}</span>
                    <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(15,15,15,0.35)" }}>
                      <BookOpen size={9} /> {t.duration}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-bold leading-snug" style={{ color: "#0F0F0F" }}>{t.title}</h3>
                  <p className="text-[12px] leading-snug line-clamp-2" style={{ color: "rgba(15,15,15,0.50)" }}>{t.description}</p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold" style={{ color: TEAL }}>Start training</span>
                    <ArrowRight size={11} style={{ color: TEAL }} className="transition-transform group-hover:translate-x-1 duration-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
