"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Brain, Zap, Users, Target,
  Play, Clock, BookOpen, Timer, ChevronDown,
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import { useEffect, useState as useReactState } from "react";

// ── Design-system status map ──────────────────────────
// Threshold:  score >= 3.5 → Ready | score >= 3.4 → Borderline | below → Not Ready (red)
function getStatus(score: number): "ready" | "borderline" | "not-ready" {
  if (score >= 3.5) return "ready";
  if (score >= 3.4) return "borderline";
  return "not-ready";
}

const STATUS_MAP = {
  "ready":      { label: "Ready",      dot: "#6EE7B7", bg: "#ECFDF5", border: "#6EE7B7", text: "#047857" },
  "borderline": { label: "Borderline", dot: "#FCD34D", bg: "#FFFBEB", border: "#FCD34D", text: "#B45309" },
  "not-ready":  { label: "Borderline", dot: "#FCD34D", bg: "#FFFBEB", border: "#FCD34D", text: "#B45309" },
};

// Scores strictly < 3.4 show red text per design-system rule
function scoreColor(score: number): string {
  return score < 3.4 ? "#B91C1C" : "#0F172A";
}

// ── Inline border / colour tokens ────────────────────
const DIVIDER = "1px solid #E5E7EB";
const SUBTLE  = "#F1F5F9";

// ── Data ─────────────────────────────────────────────
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
  { label: "Context", status: "Strong",  dot: "#6EE7B7", note: "Clear background and situation explained well by candidate" },
  { label: "Action",  status: "Partial", dot: "#FCD34D", note: "Good detail but personal role wasn't always fully articulated" },
  { label: "Result",  status: "Weak",    dot: "#FECACA", note: "Outcomes were vague, non-numeric across most answers" },
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

const AI_SUMMARY = `Sarah demonstrates strong interpersonal ability and execution instinct, but consistently struggles to quantify outcomes and state individual contribution clearly. The biggest gaps are in the Action and Mastery drivers — both lack specificity and measurable results. People driver is a real strength worth leading with.`;

const AI_PATTERNS = [
  "Answers consistently under time (avg 2m 32s vs 3–4 min ideal) — leaving value on the table.",
  "CAR applied inconsistently — Context is strong, but Result is almost always vague.",
  "Strong empathy and clarity in People-tagged answers — use this as an opener.",
];

const COACHING = [
  { n: "01", title: "Use CAR Consistently",  tips: ["Context: what was the situation?", "Action: what did YOU specifically do?", "Result: what was the measurable outcome?"] },
  { n: "02", title: "Quantify Every Answer", tips: ["Add % improvement, time saved, revenue impact", "Avoid 'it went well' — say 'improved by X%'"] },
  { n: "03", title: "Own Your Contribution", tips: ["Use 'I' not 'we'", "State the decision you made", "Name options you ruled out"] },
];

const REC_TRAINING = {
  title:    "Behavioural Answer Structure (CAR Method)",
  driver:   "Action", dot: "#FECACA", duration: "18 min",
  desc:     "Turn raw experience into sharp, memorable interview answers using a proven structured framework.",
  href:     "/trainings",
};

// ── Status Badge (design-system pattern) ────────────
function StatusBadge({ score }: { score: number }) {
  const key   = getStatus(score);
  const token = STATUS_MAP[key];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 border rounded-sm"
      style={{ background: token.bg, borderColor: token.border, color: token.text }}
    >
      <span className="w-1.5 h-1.5 block" style={{ background: token.dot }} />
      {token.label}
    </span>
  );
}

// ── Question row (accordion) ──────────────────────────
function QuestionRow({ q, qi }: { q: Q; qi: number }) {
  const [open, setOpen] = useState(!!q.showAI);
  const sc = scoreColor(q.score);

  return (
    <div style={{ borderBottom: DIVIDER }}>
      {/* Collapsed header */}
      <div className="flex items-center gap-4" style={{ padding: "14px 20px" }}>
        {/* Index */}
        <span
          className="shrink-0 w-7 h-7 flex items-center justify-center text-[10px] font-bold"
          style={{ background: SUBTLE, borderRadius: 4, color: "#64748B" }}
        >
          {qi + 1}
        </span>

        {/* Question text */}
        <p className="flex-1 text-[13px] font-semibold leading-snug text-foreground">
          &ldquo;{q.q}&rdquo;
        </p>

        {/* Driver pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span style={{ width: 6, height: 6, borderRadius: 99, background: q.driverAccent, display: "inline-block" }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{q.driver}</span>
        </div>

        {/* Score + badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[20px] font-bold font-mono tabular-nums" style={{ color: sc }}>
            {q.score}<span className="text-[11px] font-normal text-muted">/5</span>
          </span>
          <StatusBadge score={q.score} />
        </div>

        {/* Timing */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Timer size={11} className="text-muted" />
          <span className="text-[11px] text-muted">{q.taken}</span>
          <span className="text-[10px]" style={{ color: "#94A3B8" }}>/ {q.ideal}</span>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-[11px] font-bold shrink-0 hover:opacity-80 transition-opacity"
          style={{
            borderRadius: 6,
            padding: "5px 11px",
            background: open ? "#0087A8" : SUBTLE,
            color: open ? "#FFF" : "#475569",
            border: "none",
            cursor: "pointer",
          }}
        >
          {open ? "Close" : "View Insight"}
          <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 160ms" }} />
        </button>
      </div>

      {/* Expanded panel */}
      {open && (
        <div style={{ borderTop: DIVIDER, background: "#FAFBFC" }}>
          {/* CAR */}
          <div className="flex items-start gap-6" style={{ padding: "14px 20px", borderBottom: DIVIDER }}>
            <p className="text-[9px] uppercase tracking-[0.16em] font-bold shrink-0 mt-1 text-muted">CAR</p>
            <div className="flex flex-wrap gap-5">
              {q.car.map(c => (
                <div key={c.label} className="flex items-start gap-2">
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 15, height: 15, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    fontSize: 8, fontWeight: 800,
                    background: c.ok ? "#ECFDF5" : "#FEF2F2",
                    color: c.ok ? "#047857" : "#B91C1C",
                  }}>{c.ok ? "✓" : "✕"}</span>
                  <p className="text-[11px] text-muted">
                    <strong className="text-foreground">{c.label}</strong> — {c.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Areas to improve */}
          <div style={{ padding: "14px 20px", borderBottom: q.showAI ? DIVIDER : undefined }}>
            <p className="text-[9px] uppercase tracking-[0.16em] font-bold mb-2.5 text-muted">Areas to improve</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {q.improve.map(imp => (
                <div key={imp.heading} className="flex items-start gap-2">
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: "#FCD34D", flexShrink: 0, marginTop: 5, display: "inline-block" }} />
                  <p className="text-[12px] text-muted">
                    <strong className="text-foreground">{imp.heading}</strong> — {imp.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI rewrite */}
          {q.showAI && (
            <>
              <div style={{ padding: "9px 20px", background: "rgba(0,135,168,0.04)", borderTop: DIVIDER, borderBottom: DIVIDER }}>
                <p className="text-[9px] uppercase tracking-[0.16em] font-bold" style={{ color: "#0087A8" }}>✦ AI Suggested Rewrite — lowest scoring answer</p>
              </div>
              <div className="grid grid-cols-2">
                <div style={{ padding: 24, borderRight: DIVIDER }}>
                  <p className="text-[9px] uppercase tracking-[0.16em] font-bold mb-3 text-muted">What you said</p>
                  <p className="text-[12px] leading-relaxed italic text-muted" style={{ borderLeft: "2px solid #E5E7EB", paddingLeft: 12 }}>{q.youSaid}</p>
                </div>
                <div style={{ padding: 24, background: "rgba(0,135,168,0.02)" }}>
                  <p className="text-[9px] uppercase tracking-[0.16em] font-bold mb-3" style={{ color: "#0087A8" }}>AI — A stronger version</p>
                  <p className="text-[12px] leading-relaxed italic text-foreground" style={{ borderLeft: "2px solid #0087A8", paddingLeft: 12 }}>{q.aiSaid}</p>
                  <div className="mt-4 space-y-1.5">
                    {q.aiTips?.map(t => (
                      <div key={t} className="flex items-center gap-2">
                        <span style={{ width: 5, height: 5, borderRadius: 99, background: "#6EE7B7", flexShrink: 0, display: "inline-block" }} />
                        <p className="text-[11px]" style={{ color: "#047857" }}>{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────
export default function ReportPage() {
  const { user } = useUser();
  const [mounted, setMounted] = useReactState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const overall = parseFloat(
    (DRIVERS.reduce((s, d) => s + d.score, 0) / DRIVERS.length).toFixed(1)
  );
  
  const dynamicSession = { ...SESSION, role: (mounted && user.role) ? user.role : SESSION.role };
  const dynamicSummary = AI_SUMMARY.replace("Sarah", (mounted && user.name) ? user.name : "The candidate");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 py-12 space-y-5">

        {/* ── PAGE HEADER ── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-semibold mb-0.5 text-muted">
              Your <span className="text-foreground">{dynamicSession.interviewName}</span> Report
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted">{dynamicSession.duration}</span>
              <span style={{ width: 3, height: 3, borderRadius: 99, background: "#CBD5E1", display: "inline-block" }} />
              <span className="text-[11px] text-muted">{dynamicSession.date}</span>
              <span style={{ width: 3, height: 3, borderRadius: 99, background: "#CBD5E1", display: "inline-block" }} />
              <span className="text-[11px] text-muted">{dynamicSession.questionCount} questions</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/mock"
              className="h-9 px-4 text-[12px] font-medium flex items-center transition-opacity hover:opacity-70 border border-divider bg-surface text-muted"
              style={{ borderRadius: 6 }}
            >
              All sessions
            </Link>
            <Link
              href="/mock/setup"
              className="h-9 px-4 text-[12px] font-bold text-white flex items-center gap-1.5 transition-opacity hover:opacity-85"
              style={{ borderRadius: 6, background: "#0087A8" }}
            >
              Retake interview →
            </Link>
          </div>
        </div>

        {/* ── 1. OVERALL SCORE — flat panel ── */}
        <div className="bg-surface border border-divider" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-10" style={{ padding: 28 }}>
            {/* Score */}
            <div className="shrink-0">
              <p
                className="text-[60px] font-bold font-mono leading-none tabular-nums"
                style={{ color: scoreColor(overall) }}
              >
                {overall.toFixed(1)}
              </p>
              <p className="text-[10px] uppercase tracking-widest font-semibold mt-1 text-muted">out of 5.0</p>
            </div>

            <div style={{ width: 1, height: 72, background: "#E5E7EB" }} />

            {/* Verdict */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge score={overall} />
              </div>
              <h1 className="text-[22px] font-bold text-foreground">Overall Performance</h1>
              <p className="text-[13px] mt-1.5 leading-relaxed max-w-lg text-muted">
                Strong ownership and execution. Core gaps in quantifying outcomes and articulating individual contribution — addressable with focused practice.
              </p>
            </div>

            {/* Role + pillars */}
            <div className="shrink-0 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-muted">Role assessed</p>
                <p className="text-[13px] font-bold text-foreground">{dynamicSession.role}</p>
                <p className="text-[11px] text-muted">{dynamicSession.exp}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1.5 text-muted">Pillars</p>
                <div className="flex flex-wrap gap-1.5">
                  {dynamicSession.pillars.map(p => (
                    <span
                      key={p}
                      className="text-[10px] font-semibold px-2 py-1 border border-divider text-muted bg-subtle"
                      style={{ borderRadius: 4 }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. DRIVER CARDS — flat gap-px grid ── */}
        <div className="grid grid-cols-4 gap-px bg-[#E2E8F0] border border-[#E2E8F0]">
          {DRIVERS.map(d => {
            const Icon   = d.icon;
            const st     = getStatus(d.score);
            const token  = STATUS_MAP[st];
            return (
              <div key={d.id} className="bg-surface p-6">
                {/* Pillar header */}
                <div className="flex items-center gap-2 mb-4">
                  <Icon size={14} style={{ color: d.accent }} />
                  <span className="text-[12px] font-bold flex-1 text-foreground">{d.title}</span>
                </div>

                {/* Score */}
                <p className="text-[32px] font-bold font-mono leading-none mb-0.5 tabular-nums" style={{ color: scoreColor(d.score) }}>
                  {d.score}
                </p>
                <p className="text-[10px] text-muted">out of 5.0</p>

                {/* Progress bar */}
                <div style={{ height: 3, background: SUBTLE, margin: "12px 0 8px" }}>
                  <div style={{ height: "100%", width: `${d.pct}%`, background: token.dot }} />
                </div>

                {/* Badge */}
                <StatusBadge score={d.score} />
              </div>
            );
          })}
        </div>

        {/* ── 3. CAR ANALYSIS — flat panel ── */}
        <div className="bg-surface border border-divider">
          {/* Section label */}
          <div className="border-b border-divider" style={{ padding: "12px 24px", background: SUBTLE }}>
            <p className="text-[10px] uppercase tracking-widest font-bold text-foreground">CAR Analysis</p>
            <p className="text-[10px] mt-0.5 text-muted">Context · Action · Result — consistency across all answers</p>
          </div>
          <div className="grid grid-cols-3 gap-px bg-[#E2E8F0]">
            {CAR_ROWS.map(c => (
              <div key={c.label} className="bg-surface" style={{ padding: 24 }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: c.dot, display: "inline-block" }} />
                  <span className="text-[13px] font-bold text-foreground">{c.label}</span>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-widest" style={{ color: c.dot === "#6EE7B7" ? "#047857" : c.dot === "#FCD34D" ? "#B45309" : "#B91C1C" }}>
                    {c.status}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted">{c.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. QUESTION-LEVEL INSIGHTS — accordion (no section header card) ── */}
        <div>
          {/* Section label */}
          <p className="text-[10px] uppercase tracking-widest text-muted font-bold border-b border-divider pb-3 mb-0">
            {`QUESTION-LEVEL INSIGHTS · ${dynamicSession.questionCount} ASKED · TAP "VIEW INSIGHT" TO EXPAND`}
          </p>
          <div className="bg-surface border border-t-0 border-divider">
            {QUESTIONS.map((q, qi) => (
              <QuestionRow key={qi} q={q} qi={qi} />
            ))}
          </div>
        </div>

        {/* ── 5. AI OVERALL SUMMARY ── */}
        <div className="bg-surface border border-divider">
          <div className="border-b border-divider" style={{ padding: "12px 24px", background: SUBTLE }}>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted">AI Overall Summary</p>
          </div>
          <div style={{ padding: 24, borderBottom: DIVIDER }}>
            <p className="text-[13px] leading-relaxed max-w-3xl" style={{ color: "#374151" }}>{dynamicSummary}</p>
          </div>
          <div style={{ padding: 24 }}>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-3 text-muted">Key patterns observed</p>
            <div className="grid grid-cols-3 gap-6">
              {AI_PATTERNS.map((pat, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: "#FCD34D", flexShrink: 0, marginTop: 5, display: "inline-block" }} />
                  <p className="text-[12px] leading-relaxed text-muted">{pat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6. AI COACHING ── */}
        <div className="bg-surface border border-divider">
          <div className="border-b border-divider" style={{ padding: "12px 24px", background: SUBTLE }}>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted">AI Coaching Recommendations</p>
          </div>
          <div className="grid grid-cols-3 gap-px bg-[#E2E8F0]">
            {COACHING.map(c => (
              <div key={c.n} className="bg-surface" style={{ padding: 24 }}>
                <p className="text-[24px] font-light font-mono mb-2" style={{ color: "rgba(15,15,15,0.10)" }}>{c.n}</p>
                <p className="text-[13px] font-bold mb-3 text-foreground">{c.title}</p>
                {c.tips.map(t => (
                  <div key={t} className="flex items-start gap-2 mb-1.5">
                    <span style={{ width: 4, height: 4, borderRadius: 99, background: "#CBD5E1", flexShrink: 0, marginTop: 5, display: "inline-block" }} />
                    <p className="text-[12px] text-muted">{t}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. RECOMMENDED TRAINING ── */}
        <div className="bg-surface border border-divider flex items-stretch">
          {/* Thumbnail */}
          <div
            className="relative flex items-center justify-center shrink-0"
            style={{ width: 200, background: "linear-gradient(145deg, #1C3B4A 0%, #2D5668 55%, #1E4456 100%)" }}
          >
            <BookOpen size={36} style={{ color: "rgba(255,255,255,0.18)" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div style={{
                width: 48, height: 48, borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Play size={17} style={{ color: "#FFF", marginLeft: 2 }} />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex items-center border-l border-divider" style={{ padding: 24 }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span style={{ width: 6, height: 6, borderRadius: 99, background: "#FECACA", display: "inline-block" }} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  Recommended · {REC_TRAINING.driver} Driver
                </span>
              </div>
              <p className="text-[15px] font-bold text-foreground">{REC_TRAINING.title}</p>
              <p className="text-[12px] mt-1 max-w-md leading-relaxed text-muted">{REC_TRAINING.desc}</p>
              <div className="flex items-center gap-1.5 mt-2.5">
                <Clock size={11} className="text-muted" />
                <span className="text-[11px] text-muted">{REC_TRAINING.duration}</span>
              </div>
            </div>
            <Link
              href={REC_TRAINING.href}
              className="h-10 px-5 text-[12px] font-bold text-white flex items-center gap-2 shrink-0 transition-opacity hover:opacity-85"
              style={{ borderRadius: 6, background: "#0087A8" }}
            >
              <Play size={11} /> Start module
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
