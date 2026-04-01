"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Zap, Info, Lightbulb, Brain, Users, Target, Mic } from "lucide-react";

// ── Tokens ───────────────────────────────────────────────────────────
const TEAL = "#0087A8";
const CHAR_LIMIT = 800;

// ── Pillar definitions ───────────────────────────────────────────────
const PILLAR_META: Record<string, { icon: typeof Brain; color: string; signal: string }> = {
  Thinking: {
    icon: Brain,
    color: "#0087A8",
    signal: "Hiring managers probe this area to see if you diagnose before prescribing. They want evidence you use data, not instinct, to frame problems and identify root causes.",
  },
  Action: {
    icon: Zap,
    color: "#F59E0B",
    signal: "This tests whether you drive results or wait for instructions. Interviewers want to see initiative, prioritization under constraints, and follow-through to delivery.",
  },
  People: {
    icon: Users,
    color: "#8B5CF6",
    signal: "Tests your ability to influence without authority. Can you get buy-in from skeptics? Do you handle conflict with poise? Interviewers assess emotional intelligence here.",
  },
  Mastery: {
    icon: Target,
    color: "#10B981",
    signal: "Proves you go deep. Interviewers want to see technical credibility, measurable outcomes, and the self-awareness to reflect on what you'd improve next time.",
  },
};

const PILLAR_ORDER = ["Thinking", "Action", "People", "Mastery"];

// ── Questions ────────────────────────────────────────────────────────
const QUESTIONS = [
  // Thinking (3)
  { id: 1, pillar: "Thinking", question: "What was your specific role and the core mandate of your team?", why: "Interviewers need to understand your scope of ownership and what you were hired to achieve before hearing the specifics of a project.", sample: "I was the Lead PM for the Core Experience team. Our mandate was to reduce user churn in the first 30 days of sign-up." },
  { id: 2, pillar: "Thinking", question: "What was the specific problem or opportunity you faced?", why: "A strong context explains what was broken or what could be gained. It sets the stakes and shows you understand the business impact.", sample: "We noticed a 40% drop-off at the final billing step. If we didn't fix it, we'd miss our Q3 revenue targets by $2M." },
  { id: 3, pillar: "Thinking", question: "How did you analyze the root cause of this problem?", why: "Shows your analytical depth. Did you guess, or did you use data and user research to arrive at a diagnosis?", sample: "I ran a funnel analysis in Mixpanel and set up 5 user interviews. I discovered the pricing layout was confusing on mobile." },
  // Action (3)
  { id: 4, pillar: "Action", question: "What was the very first step YOU took to solve it?", why: "Interviewers look for initiative. What did *you* do without being told? This reveals ownership.", sample: "I immediately drafted a 1-pager outlining the drop-off data and proposed a simplified, mobile-first checkout flow." },
  { id: 5, pillar: "Action", question: "How did you prioritize what to build or do?", why: "Shows you understand trade-offs. You can't build everything — how do you decide what matters most?", sample: "We had three ideas. I scored them by ICE (Impact, Confidence, Ease) and chose to redesign the billing toggle first because it was a 2-day engineering lift." },
  { id: 6, pillar: "Action", question: "How did you execute and launch the solution?", why: "Shows your ability to drive a project across the finish line under real constraints.", sample: "I broke the work into two 1-week sprints, ran daily standups to clear blockers, and launched an A/B test to 10% of users." },
  // People (2)
  { id: 7, pillar: "People", question: "Who did you need to align or convince, and how did you do it?", why: "Tests your ability to influence without authority. Can you bring others along?", sample: "The design lead was hesitant to change the layout. I showed her a session recording of a user failing to checkout, which immediately got her onboard." },
  { id: 8, pillar: "People", question: "Was there any conflict or pushback? How was it resolved?", why: "Demonstrates emotional intelligence and conflict resolution skills under pressure.", sample: "Engineering pushed back saying the new flow would break legacy APIs. I organized a 30-min whiteboarding session and we found a workaround using existing endpoints." },
  // Mastery (4)
  { id: 9, pillar: "Mastery", question: "What technical or domain-specific challenges did you overcome?", why: "Proves you go deep into the details and understand the mechanics of your work.", sample: "We had to ensure the new checkout flow stayed PCI-compliant while removing two required form fields, requiring a custom tokenization approach." },
  { id: 10, pillar: "Mastery", question: "What was the quantitative impact of your work?", why: "If you can't measure it, it didn't happen. Results must be quantified to be credible.", sample: "The new flow increased checkout conversion by 22%, resulting in $1.5M absolute new ARR over the quarter." },
  { id: 11, pillar: "Mastery", question: "What was the qualitative impact on the team or product?", why: "Shows you care about the broader ecosystem, including team morale and operational improvements.", sample: "The engineering team adopted my 1-pager format for all future proposals, making our cross-functional alignment much faster." },
  { id: 12, pillar: "Mastery", question: "What did you learn, or what would you do differently next time?", why: "The strongest candidates show self-awareness and a growth mindset. This is a senior-level differentiator.", sample: "I learned that I should involve engineering during the discovery phase, not just solutioning, so we catch legacy API constraints earlier." },
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

// ── Component ────────────────────────────────────────────────────────
export default function NewStoryBoardFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSample, setShowSample] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const q = QUESTIONS[currentStep];
  const isLast = currentStep === QUESTIONS.length - 1;
  const currentLen = (answers[q.id] || "").length;
  const pqi = pillarQuestionIndex(currentStep);
  const meta = PILLAR_META[q.pillar];
  const PillarIcon = meta.icon;
  const isLastInPillar = pqi.current === pqi.total;

  const handleNext = () => {
    if (isLast) { router.push("/storyboard/crafting"); return; }
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

  // Stepper groups
  const stepperGroups = PILLAR_ORDER.map((pillar) => {
    const qs = questionsForPillar(pillar);
    return { pillar, startIdx: QUESTIONS.indexOf(qs[0]), count: qs.length };
  });

  return (
    <div className="min-h-[calc(100vh-64px)] animate-in fade-in duration-500 pb-24">
      <div className="max-w-[1100px] mx-auto px-6 py-8 md:py-12">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={handlePrev} className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.08em]">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
            Question {currentStep + 1} of 12
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">

          {/* ══════════════ LEFT — Editor (65%) ══════════════ */}
          <div className="w-full md:w-[65%]">

            {/* Grouped stepper */}
            <div className="flex items-center gap-[3px] mb-8 w-full" aria-label="Progress">
              {stepperGroups.map((group, gi) => (
                <div key={group.pillar} className="flex items-center gap-[4px] flex-1" style={{ marginRight: gi < stepperGroups.length - 1 ? 6 : 0 }}>
                  {Array.from({ length: group.count }).map((_, i) => {
                    const gIdx = group.startIdx + i;
                    const isDone = gIdx < currentStep;
                    const isCurrent = gIdx === currentStep;
                    return (
                      <div key={gIdx} className="h-1.5 rounded-full flex-1 relative overflow-hidden transition-all duration-300"
                        style={{ background: isDone || isCurrent ? `${TEAL}20` : "rgba(0,0,0,0.06)" }}>
                        {(isDone || isCurrent) && (
                          <div className="absolute inset-0 rounded-full" style={{ background: TEAL, opacity: isCurrent ? 0.6 : 1 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Pillar badge */}
            <div className="mb-4" key={q.pillar + currentStep}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-bold"
                style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}20` }}>
                <PillarIcon size={14} />
                <span className="uppercase tracking-wider">{q.pillar}</span>
                <span className="w-px h-3 bg-current opacity-20" />
                <span className="font-medium opacity-70">Question {pqi.current} of {pqi.total}</span>
              </div>
            </div>

            {/* Question title */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-[34px] font-bold tracking-tight text-slate-900 leading-[1.2]">{q.question}</h1>
            </div>

            {/* Textarea card */}
            <div className="overflow-hidden mb-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm focus-within:ring-2 focus-within:ring-[#0087A8]/20 focus-within:border-[#0087A8]/30 transition-all">
              <textarea
                autoFocus
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                maxLength={CHAR_LIMIT + 50}
                placeholder="Start typing your experience here..."
                className="w-full min-h-[200px] px-6 pt-5 pb-3 text-[15px] leading-relaxed bg-transparent outline-none resize-none placeholder:text-slate-400"
                style={{ color: "#0F172A" }}
              />
              {/* Footer: mic + count */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <button type="button"
                  onClick={() => {
                    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
                    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                    if (!SR) { alert("Voice input is not supported in this browser."); return; }
                    const recognition = new SR();
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    recognition.lang = "en-US";
                    const base = answers[q.id] || "";
                    recognition.onresult = (event: any) => {
                      let interim = "", final = "";
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                    isRecording ? "bg-red-50 text-red-600 border border-red-200" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                  }`}>
                  {isRecording ? (
                    <><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>Recording… tap to stop</>
                  ) : (
                    <><Mic size={14} />Voice input</>
                  )}
                </button>
                <span className={`text-[12px] font-bold tabular-nums ${currentLen > CHAR_LIMIT ? "text-red-500" : currentLen > CHAR_LIMIT - 50 ? "text-amber-500" : "text-slate-400"}`}>
                  {currentLen} / {CHAR_LIMIT}
                </span>
              </div>
            </div>

            {/* Why + Sample */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <div className="p-5 rounded-2xl bg-white/50 border border-white/50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={14} style={{ color: "rgba(15,15,15,0.4)" }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Why it matters</span>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-600">{q.why}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/50 border border-white/50 shadow-sm hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={14} className={showSample ? "text-amber-500" : "text-slate-400"} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Pro Tip / Sample</span>
                  </div>
                  {!showSample && <button onClick={() => setShowSample(true)} className="text-[11px] font-bold text-[#0087A8] hover:underline">Reveal</button>}
                </div>
                {showSample
                  ? <p className="text-[13px] leading-relaxed italic text-slate-700">&ldquo;{q.sample}&rdquo;</p>
                  : <p className="text-[13px] leading-relaxed text-slate-400">Click to reveal a structural example of a strong answer.</p>
                }
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200/50">
              <button onClick={handlePrev} className="h-11 px-6 flex items-center gap-2 text-[14px] font-bold text-slate-500 hover:bg-white/60 hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-white">
                Previous
              </button>
              <button onClick={handleNext}
                className="h-11 px-8 flex items-center gap-2 text-[14px] font-bold text-white rounded-xl shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: isLast ? "#10B981" : TEAL }}>
                {isLast
                  ? <><span>Craft Storyboard</span><Zap size={16} fill="white" /></>
                  : isLastInPillar
                  ? <><span>Complete {q.pillar}</span><ChevronRight size={16} /></>
                  : <><span>Next Step</span><ChevronRight size={16} /></>
                }
              </button>
            </div>
          </div>

          {/* ══════════════ RIGHT — Single Progress Card (35%) ══════════════ */}
          <div className="w-full md:w-[35%] md:sticky md:top-24">
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">

              {/* Card header */}
              <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">Storyboard Progress</h2>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {PILLAR_ORDER.filter(p => isPillarDone(p)).length}/{PILLAR_ORDER.length} pillars
                </span>
              </div>

              {/* Pillar list */}
              <div className="px-6 py-5 space-y-5">
                {PILLAR_ORDER.map((pillar) => {
                  const qs = questionsForPillar(pillar);
                  const active = isPillarActive(pillar);
                  const done = isPillarDone(pillar);

                  return (
                    <div key={pillar}>
                      {/* Pillar row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {done ? (
                            <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0" style={{ background: TEAL }}>
                              <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                          ) : active ? (
                            <div className="w-[18px] h-[18px] rounded-full border-[2px] flex items-center justify-center shrink-0" style={{ borderColor: TEAL }}>
                              <div className="w-[6px] h-[6px] rounded-full" style={{ background: TEAL }} />
                            </div>
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-200 shrink-0" />
                          )}
                          <span className={`text-[14px] font-bold ${done || active ? "text-slate-900" : "text-slate-400"}`}>{pillar}</span>
                        </div>
                        {active && <span className="text-[11px] font-medium text-[#0087A8]">In Progress</span>}
                        {done && <span className="text-[11px] font-medium text-emerald-600">Done</span>}
                      </div>

                      {/* Questions sub-list — only for active or done pillar */}
                      {(active || done) && (
                        <div className="pl-[30px] flex flex-col gap-2.5 mb-1">
                          {qs.map((qu) => {
                            const answered = (answers[qu.id] || "").trim().length > 0;
                            const isQActive = qu.id === q.id;
                            return (
                              <div key={qu.id} className="flex items-start justify-between gap-2">
                                <span className={`text-[12.5px] leading-snug ${isQActive ? "text-slate-800 font-medium" : answered ? "text-slate-400 line-through decoration-slate-300" : "text-slate-500"}`}>
                                  {qu.question}
                                </span>
                                {answered && !isQActive && (
                                  <div className="w-[14px] h-[14px] rounded-full bg-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 mx-6" />

              {/* What interviewers test — merged into same card */}
              <div className="px-6 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">What Interviewers Test</p>
                <div className="flex items-center gap-2 mb-2">
                  <PillarIcon size={14} style={{ color: meta.color }} />
                  <span className="text-[13px] font-bold text-slate-900">{q.pillar}</span>
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
