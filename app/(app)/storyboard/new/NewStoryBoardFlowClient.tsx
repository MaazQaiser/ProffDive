"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Zap, Info, HelpCircle, Brain, Users, Target, Mic, Check } from "lucide-react";
import {
  getSpeechRecognition,
  type WebSpeechRecognition,
  type WebSpeechResultEvent,
} from "@/lib/proofy-speech";
import { readJourneyState } from "@/lib/guided-journey";

// ── Tokens ───────────────────────────────────────────────────────────
const TEAL = "#0087A8";
const CHAR_LIMIT = 800;
const BORDER = "rgba(15,23,42,0.12)";

// ── Pillar definitions ───────────────────────────────────────────────
const PILLAR_META: Record<string, { icon: typeof Brain; color: string; signal: string }> = {
  Thinking: {
    icon: Brain,
    color: "#0087A8",
    signal:
      "Hiring managers probe this area to see if you diagnose before prescribing. They want evidence you use data, not instinct, to frame problems and identify root causes.",
  },
  Action: {
    icon: Zap,
    color: "#F59E0B",
    signal:
      "This tests whether you drive results or wait for instructions. Interviewers want to see initiative, prioritization under constraints, and follow-through to delivery.",
  },
  People: {
    icon: Users,
    color: "#8B5CF6",
    signal:
      "Tests your ability to influence without authority. Can you get buy-in from skeptics? Do you handle conflict with poise? Interviewers assess emotional intelligence here.",
  },
  Mastery: {
    icon: Target,
    color: "#10B981",
    signal:
      "Proves you go deep. Interviewers want to see technical credibility, measurable outcomes, and the self-awareness to reflect on what you'd improve next time.",
  },
};

const PILLAR_ORDER = ["Thinking", "Action", "People", "Mastery"];

// ── Questions ────────────────────────────────────────────────────────
const QUESTIONS = [
  // Thinking (3)
  {
    id: 1,
    pillar: "Thinking",
    question: "What was your specific role and the core mandate of your team?",
    why: "Interviewers need to understand your scope of ownership and what you were hired to achieve before hearing the specifics of a project.",
    sample: "I was the Lead PM for the Core Experience team. Our mandate was to reduce user churn in the first 30 days of sign-up.",
  },
  {
    id: 2,
    pillar: "Thinking",
    question: "What was the specific problem or opportunity you faced?",
    why: "A strong context explains what was broken or what could be gained. It sets the stakes and shows you understand the business impact.",
    sample: "We noticed a 40% drop-off at the final billing step. If we didn't fix it, we'd miss our Q3 revenue targets by $2M.",
  },
  {
    id: 3,
    pillar: "Thinking",
    question: "How did you analyze the root cause of this problem?",
    why: "Shows your analytical depth. Did you guess, or did you use data and user research to arrive at a diagnosis?",
    sample: "I ran a funnel analysis in Mixpanel and set up 5 user interviews. I discovered the pricing layout was confusing on mobile.",
  },
  // Action (3)
  {
    id: 4,
    pillar: "Action",
    question: "What was the very first step YOU took to solve it?",
    why: "Interviewers look for initiative. What did *you* do without being told? This reveals ownership.",
    sample: "I immediately drafted a 1-pager outlining the drop-off data and proposed a simplified, mobile-first checkout flow.",
  },
  {
    id: 5,
    pillar: "Action",
    question: "How did you prioritize what to build or do?",
    why: "Shows you understand trade-offs. You can't build everything — how do you decide what matters most?",
    sample:
      "We had three ideas. I scored them by ICE (Impact, Confidence, Ease) and chose to redesign the billing toggle first because it was a 2-day engineering lift.",
  },
  {
    id: 6,
    pillar: "Action",
    question: "How did you execute and launch the solution?",
    why: "Shows your ability to drive a project across the finish line under real constraints.",
    sample:
      "I broke the work into two 1-week sprints, ran daily standups to clear blockers, and launched an A/B test to 10% of users.",
  },
  // People (2)
  {
    id: 7,
    pillar: "People",
    question: "Who did you need to align or convince, and how did you do it?",
    why: "Tests your ability to influence without authority. Can you bring others along?",
    sample:
      "The design lead was hesitant to change the layout. I showed her a session recording of a user failing to checkout, which immediately got her onboard.",
  },
  {
    id: 8,
    pillar: "People",
    question: "Was there any conflict or pushback? How was it resolved?",
    why: "Demonstrates emotional intelligence and conflict resolution skills under pressure.",
    sample:
      "Engineering pushed back saying the new flow would break legacy APIs. I organized a 30-min whiteboarding session and we found a workaround using existing endpoints.",
  },
  // Mastery (4)
  {
    id: 9,
    pillar: "Mastery",
    question: "What technical or domain-specific challenges did you overcome?",
    why: "Proves you go deep into the details and understand the mechanics of your work.",
    sample:
      "We had to ensure the new checkout flow stayed PCI-compliant while removing two required form fields, requiring a custom tokenization approach.",
  },
  {
    id: 10,
    pillar: "Mastery",
    question: "What was the quantitative impact of your work?",
    why: "If you can't measure it, it didn't happen. Results must be quantified to be credible.",
    sample: "The new flow increased checkout conversion by 22%, resulting in $1.5M absolute new ARR over the quarter.",
  },
  {
    id: 11,
    pillar: "Mastery",
    question: "What was the qualitative impact on the team or product?",
    why: "Shows you care about the broader ecosystem, including team morale and operational improvements.",
    sample:
      "The engineering team adopted my 1-pager format for all future proposals, making our cross-functional alignment much faster.",
  },
  {
    id: 12,
    pillar: "Mastery",
    question: "What did you learn, or what would you do differently next time?",
    why: "The strongest candidates show self-awareness and a growth mindset. This is a senior-level differentiator.",
    sample:
      "I learned that I should involve engineering during the discovery phase, not just solutioning, so we catch legacy API constraints earlier.",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────
function questionsForPillar(pillar: string) {
  return QUESTIONS.filter((q) => q.pillar === pillar);
}

function pillarQuestionIndex(step: number) {
  const q = QUESTIONS[step];
  const pillarQs = questionsForPillar(q.pillar);
  return { current: pillarQs.indexOf(q) + 1, total: pillarQs.length };
}

function fmtFallback() {
  return (
    <div className="min-h-[calc(100vh-64px)] animate-in fade-in duration-500 pb-24">
      <div className="max-w-[1100px] mx-auto px-6 py-12 text-center text-[14px] text-slate-500">
        Loading storyboard…
      </div>
    </div>
  );
}

export default function NewStoryBoardFlowClient() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const rolePrefill = (searchParams.get("role") ?? "").trim();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    if (rolePrefill) init[1] = rolePrefill;
    return init;
  });
  const [showSample, setShowSample] = useState(false);
  const [journeyTipsOn, setJourneyTipsOn] = useState(false);
  const [journeyTipIdx, setJourneyTipIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);

  const q = QUESTIONS[currentStep];
  const isLast = currentStep === QUESTIONS.length - 1;
  const currentLen = (answers[q.id] || "").length;
  const pqi = pillarQuestionIndex(currentStep);
  const meta = PILLAR_META[q.pillar];
  const PillarIcon = meta.icon;
  const isLastInPillar = pqi.current === pqi.total;
  const meaningful = (answers[q.id] || "").trim().length >= 20;

  const handleNext = () => {
    if (isLast) {
      try {
        window.sessionStorage.setItem("pd:crafter:showAnalyzing", "1");
      } catch {
        /* ignore */
      }
      router.push("/storyboard/crafting");
      return;
    }
    setShowSample(false);
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setShowSample(false);
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/storyboard");
    }
  };

  const pillarProgress = (pillar: string) => {
    const qs = questionsForPillar(pillar);
    const answered = qs.filter((qu) => (answers[qu.id] || "").trim().length > 0).length;
    return { answered, total: qs.length };
  };

  const isPillarDone = (pillar: string) => {
    const { answered, total } = pillarProgress(pillar);
    return answered === total && total > 0 && PILLAR_ORDER.indexOf(pillar) < PILLAR_ORDER.indexOf(q.pillar);
  };

  const isPillarActive = (pillar: string) => q.pillar === pillar;

  useEffect(() => {
    const sync = () => {
      const st = readJourneyState();
      const onJourney = Boolean(st.active && !st.skipped && st.stepId === "story");
      setJourneyTipsOn(onJourney && pathname.startsWith("/storyboard/new"));
      if (!onJourney) setJourneyTipIdx(0);
    };
    sync();
    window.addEventListener("journey:start", sync);
    window.addEventListener("journey:step", sync);
    window.addEventListener("journey:skip", sync);
    window.addEventListener("journey:reset", sync);
    return () => {
      window.removeEventListener("journey:start", sync);
      window.removeEventListener("journey:step", sync);
      window.removeEventListener("journey:skip", sync);
      window.removeEventListener("journey:reset", sync);
    };
  }, [pathname]);

  // Stepper groups
  const stepperGroups = PILLAR_ORDER.map((pillar) => {
    const qs = questionsForPillar(pillar);
    return { pillar, startIdx: QUESTIONS.indexOf(qs[0]), count: qs.length };
  });

  if (!q) return fmtFallback();

  return (
    <div className="min-h-[calc(100vh-64px)] animate-in fade-in duration-500 pb-24">
      <div className="max-w-[1100px] mx-auto px-6 py-8 md:py-12">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-[12px] text-[#64748B]">
            Question {currentStep + 1} of 12
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
          {/* ══════════════ LEFT — Editor (65%) ══════════════ */}
          <div className="w-full md:w-[65%]">
            {/* Grouped stepper */}
            <div className="mb-8 w-full" aria-label="Progress">
              <div className="flex items-center w-full">
                {stepperGroups.map((group, gi) => (
                  <div
                    key={group.pillar}
                    className="flex items-center flex-1"
                    style={{ marginRight: gi < stepperGroups.length - 1 ? 8 : 0 }}
                  >
                    {Array.from({ length: group.count }).map((_, i) => {
                      const gIdx = group.startIdx + i;
                      const isDone = gIdx < currentStep;
                      const isCurrent = gIdx === currentStep;
                      return (
                        <div
                          key={gIdx}
                          className="h-1 rounded-full flex-1 relative overflow-hidden"
                          style={{
                            height: 4,
                            borderRadius: 2,
                            background: isDone || isCurrent ? TEAL : "rgba(15,23,42,0.12)",
                            opacity: isCurrent ? 0.5 : 1,
                            marginRight: i < group.count - 1 ? 2 : 0,
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-start w-full text-[11px]">
                {stepperGroups.map((g, gi) => {
                  const active = g.pillar === q.pillar;
                  return (
                    <div
                      key={g.pillar}
                      className="flex-1 text-center"
                      style={{ marginRight: gi < stepperGroups.length - 1 ? 8 : 0 }}
                    >
                      <span style={{ color: active ? TEAL : "rgba(15,23,42,0.32)", fontWeight: active ? 500 : 400 }}>
                        {g.pillar}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pillar badge */}
            <div className="mb-4" key={q.pillar + currentStep}>
              <div
                className="inline-flex items-center"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#E6F1FB",
                  color: TEAL,
                  borderRadius: 20,
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                <span>{q.pillar}</span>
                <span>·</span>
                <span>Question {pqi.current} of {pqi.total}</span>
              </div>
            </div>

            {/* Question title */}
            <div className="mb-6 relative" data-journey-id="story-question">
              {journeyTipsOn && journeyTipIdx === 0 ? (
                <div className="absolute left-0 -top-3 -translate-y-full w-[360px] max-w-[92vw] rounded-[16px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(2,6,23,0.20)] px-4 py-3">
                  <div
                    className="absolute left-8 -bottom-2 w-0 h-0"
                    style={{
                      borderLeft: "10px solid transparent",
                      borderRight: "10px solid transparent",
                      borderTop: "10px solid white",
                      filter: "drop-shadow(0 -1px 0 rgba(0,0,0,0.08))",
                    }}
                  />
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0087A8]">Proofy guide</p>
                  <p className="mt-1 text-[13px] font-semibold text-[#0F172A]">This question is your story input</p>
                  <p className="mt-1 text-[12px] text-[#475569] leading-relaxed">
                    Answer with specifics. Aim for <span className="font-semibold text-[#0F172A]">what you owned</span>,{" "}
                    <span className="font-semibold text-[#0F172A]">what you did</span>, and{" "}
                    <span className="font-semibold text-[#0F172A]">the impact</span>.
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#64748B]">Tip 1/3</p>
                    <button
                      type="button"
                      onClick={() => setJourneyTipIdx(1)}
                      className="h-8 px-3 rounded-[12px] bg-[#0087A8] text-white text-[12px] font-bold hover:bg-[#007592] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
              <h1 className="text-[20px] font-medium text-slate-900 leading-[1.4]">{q.question}</h1>
              <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                Set the scene — who you were, what the team owned, and what success looked like in that context.
              </p>
            </div>

            {/* Textarea card */}
            <div
              className="relative overflow-hidden mb-6 bg-white"
              style={{
                border: "0.5px solid rgba(15,23,42,0.12)",
                borderRadius: 8,
              }}
            >
              <textarea
                autoFocus
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                maxLength={CHAR_LIMIT + 50}
                placeholder="e.g. I was a Product Manager intern at a fintech startup. My team owned the onboarding flow and our goal was to reduce drop-off in the first 7 days..."
                className="w-full min-h-[200px] px-6 pt-5 pb-14 pr-20 text-[16px] leading-relaxed bg-transparent outline-none resize-none placeholder:text-slate-400"
                style={{ color: "#0F172A" }}
              />

              {/* In-box controls (bottom) */}
              <span
                className={`pointer-events-none absolute bottom-4 left-6 text-[12px] font-bold tabular-nums ${
                  currentLen > CHAR_LIMIT ? "text-red-500" : currentLen > CHAR_LIMIT - 50 ? "text-amber-500" : "text-slate-400"
                }`}
              >
                {currentLen} / {CHAR_LIMIT}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    recognitionRef.current?.stop();
                    setIsRecording(false);
                    return;
                  }
                  const SR = getSpeechRecognition();
                  if (!SR) {
                    alert("Voice input is not supported in this browser.");
                    return;
                  }
                  const recognition = new SR() as WebSpeechRecognition;
                  recognition.continuous = true;
                  recognition.interimResults = true;
                  recognition.lang = "en-US";
                  const base = answers[q.id] || "";
                  recognition.onresult = (event: WebSpeechResultEvent) => {
                    let interim = "",
                      final = "";
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                      if (event.results[i].isFinal) final += event.results[i][0].transcript;
                      else interim += event.results[i][0].transcript;
                    }
                    setAnswers((prev) => ({ ...prev, [q.id]: base + (base ? " " : "") + final + interim }));
                  };
                  recognition.onerror = () => setIsRecording(false);
                  recognition.onend = () => setIsRecording(false);
                  recognition.start();
                  recognitionRef.current = recognition;
                  setIsRecording(true);
                }}
                className={`absolute bottom-3.5 right-4 inline-flex items-center justify-center w-10 h-10 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0087A8]/30 ${
                  isRecording ? "bg-red-50 text-red-600 border border-red-200" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                }`}
                aria-label={isRecording ? "Stop recording" : "Start voice input"}
                title={isRecording ? "Recording… click to stop" : "Voice input"}
              >
                {isRecording ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                ) : (
                  <Mic size={16} />
                )}
              </button>
            </div>

            {/* Why strip */}
            <div
              className="bg-white flex items-start gap-3"
              style={{ border: "0.5px solid rgba(15,23,42,0.12)", borderRadius: 8, padding: "11px 14px" }}
            >
              <div className="w-7 h-7 flex items-center justify-center shrink-0" style={{ background: "#E6F1FB", borderRadius: 8 }}>
                <Info size={14} style={{ color: TEAL }} />
              </div>
              <p className="text-[12px] leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-900">Why this matters —</span> {q.why}
              </p>
            </div>

            {/* Example toggle */}
            <div className="mt-4 mb-10" data-journey-id="story-protip">
              <button
                type="button"
                onClick={() => setShowSample((v) => !v)}
                className="inline-flex items-center gap-2 text-[12px] font-medium"
                style={{ color: TEAL }}
              >
                <HelpCircle size={14} />
                {showSample ? "Hide example" : "See a strong answer example"}
              </button>
              {showSample ? (
                <div
                  className="mt-3"
                  style={{
                    background: "#F0F9FC",
                    border: "0.5px solid #B5D4F4",
                    borderRadius: 8,
                    padding: "11px 14px",
                    color: "#005F7A",
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  {q.sample}
                </div>
              ) : null}
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between pt-6" style={{ borderTop: "0.5px solid rgba(15,23,42,0.12)" }}>
              <button
                onClick={handlePrev}
                className="text-[13px] font-medium"
                style={{ color: "rgba(15,23,42,0.32)" }}
              >
                Previous
              </button>
              <button
                data-journey-id="story-next"
                onClick={handleNext}
                disabled={!meaningful}
                className="h-11 px-6 flex items-center gap-2 text-[13px] font-semibold text-white transition-opacity"
                style={{ background: TEAL, borderRadius: 8, opacity: meaningful ? 1 : 0.45 }}
              >
                <span>Next question →</span>
              </button>
            </div>
          </div>

          {/* ══════════════ RIGHT — Single Progress Card (35%) ══════════════ */}
          <div className="w-full md:w-[35%] md:sticky md:top-24">
            <div
              className={`bg-white rounded-[10px] border border-slate-200 relative ${
                journeyTipsOn && journeyTipIdx === 1 ? "overflow-visible" : "overflow-hidden"
              }`}
              data-journey-id="story-progress"
              style={{ borderWidth: 0.5, borderColor: BORDER }}
            >
              {journeyTipsOn && journeyTipIdx === 1 ? (
                <div className="absolute right-6 top-4 w-[360px] max-w-[92vw] rounded-[16px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(2,6,23,0.20)] px-4 py-3 z-10">
                  <div
                    className="absolute -left-2 top-8 w-0 h-0"
                    style={{
                      borderTop: "10px solid transparent",
                      borderBottom: "10px solid transparent",
                      borderRight: "10px solid white",
                      filter: "drop-shadow(1px 0 0 rgba(0,0,0,0.08))",
                    }}
                  />
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0087A8]">Proofy guide</p>
                  <p className="mt-1 text-[13px] font-semibold text-[#0F172A]">Storyboard progress = 4 pillars</p>
                  <p className="mt-1 text-[12px] text-[#475569] leading-relaxed">
                    You’ll fill answers for <span className="font-semibold text-[#0F172A]">Thinking</span>,{" "}
                    <span className="font-semibold text-[#0F172A]">Action</span>,{" "}
                    <span className="font-semibold text-[#0F172A]">People</span>,{" "}
                    <span className="font-semibold text-[#0F172A]">Mastery</span>. This keeps your story balanced.
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#64748B]">Tip 2/3</p>
                    <button
                      type="button"
                      onClick={() => setJourneyTipIdx(2)}
                      className="h-8 px-3 rounded-[12px] bg-[#0087A8] text-white text-[12px] font-bold hover:bg-[#007592] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
              {/* Card header */}
              <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight">Story progress</h2>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  1 of 4 pillars
                </span>
              </div>

              {/* Pillar list */}
              <div className="px-5 py-4 space-y-4">
                {PILLAR_ORDER.map((pillar) => {
                  const qs = questionsForPillar(pillar);
                  const active = isPillarActive(pillar);
                  const done = isPillarDone(pillar);

                  return (
                    <div key={pillar}>
                      {/* Pillar row */}
                      <div
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={active ? { background: "#F0F9FC" } : undefined}
                      >
                        <div className="flex items-center gap-3">
                          {active ? (
                            <div className="w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0" style={{ borderColor: TEAL }}>
                              <div className="w-[6px] h-[6px] rounded-full" style={{ background: TEAL }} />
                            </div>
                          ) : done ? (
                            <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0" style={{ background: "#E1F5EE" }}>
                              <Check size={12} className="text-emerald-600" />
                            </div>
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border border-slate-200 shrink-0" />
                          )}
                          <span className="text-[12px]" style={{ fontWeight: active ? 500 : 400, color: active ? "#0F172A" : "rgba(15,23,42,0.32)" }}>
                            {pillar}
                          </span>
                        </div>
                        {active ? (
                          <span className="text-[10px] font-medium" style={{ color: TEAL }}>
                            In progress
                          </span>
                        ) : (
                          <span className="text-[11px]" style={{ color: "rgba(15,23,42,0.32)" }}>
                            3 questions
                          </span>
                        )}
                      </div>

                      {/* Questions sub-list — only for active or done pillar */}
                      {active && (
                        <div className="pl-9 pr-3 pt-2 pb-1 flex flex-col gap-2">
                          {qs.map((qu) => {
                            const answered = (answers[qu.id] || "").trim().length > 0;
                            const isQActive = qu.id === q.id;
                            const isCompletedQ =
                              QUESTIONS.indexOf(qu) < QUESTIONS.indexOf(q) && qu.pillar === q.pillar;
                            return (
                              <div key={qu.id} className="flex items-center justify-between gap-2">
                                <span
                                  className="block h-2 w-2 rounded-full shrink-0"
                                  style={{
                                    background: isCompletedQ
                                      ? "#1D9E75"
                                      : isQActive
                                        ? TEAL
                                        : "var(--color-border-tertiary, rgba(15,23,42,0.12))",
                                  }}
                                  aria-hidden
                                />
                                <span
                                  className="text-[11px] leading-snug"
                                  style={{
                                    color: isQActive ? TEAL : "rgba(15,23,42,0.32)",
                                    fontWeight: isQActive ? 500 : 400,
                                  }}
                                >
                                  {qu.question}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What interviewers test — separate card */}
            <div
              className="mt-4 bg-white rounded-[10px] border border-slate-200 overflow-hidden"
              style={{ borderWidth: 0.5, borderColor: BORDER }}
            >
              <div className="px-5 pt-5 pb-4">
                <p className="text-[10px] font-medium tracking-[0.14em]" style={{ color: "rgba(15,23,42,0.32)" }}>
                  What interviewers test
                </p>
                <div className="flex items-center gap-2 mt-3 mb-2">
                  <PillarIcon size={14} style={{ color: meta.color }} />
                  <span className="text-[13px] font-semibold text-slate-900">{q.pillar}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-500">{meta.signal}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

