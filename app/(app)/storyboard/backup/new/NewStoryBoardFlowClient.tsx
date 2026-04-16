"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Urbanist } from "next/font/google";
import { ArrowLeft, Keyboard, Mic } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { ensureRoleForTitle } from "@/lib/storyboard-library";
import { countAnsweredQuestions } from "@/lib/storyboard-enrichment";
import {
  getSpeechRecognition,
  type WebSpeechRecognition,
  type WebSpeechResultEvent,
} from "@/lib/proofy-speech";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const glassCard =
  "relative overflow-hidden rounded-[24px] border border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

// ── Tokens ───────────────────────────────────────────────────────────
/** Max words per Core Builder answer (UI + validation). */
const WORD_LIMIT = 200;
/** Hard character ceiling so pasted text cannot blow up the textarea. */
const CHAR_SAFETY = 2800;

/** Normalize odd spaces so counting matches how users type/paste. */
function normalizeWs(s: string): string {
  return s.replace(/\u00a0/g, " ");
}

/** Normalize line terminators so newlines count as word boundaries. */
function normalizeBreaks(s: string): string {
  return normalizeWs(s)
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029\u0085]/g, "\n");
}

/**
 * Word tokens for limit + counter. Prefers `Intl.Segmenter` (handles punctuation,
 * many locales). Falls back to splitting on whitespace and common punctuation
 * so comma-separated prose does not collapse to a single "word".
 */
function tokenizeWords(text: string): string[] {
  const raw = normalizeBreaks(text).trim();
  if (!raw) return [];

  try {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const seg = new Intl.Segmenter(undefined, { granularity: "word" });
      const out: string[] = [];
      for (const p of seg.segment(raw)) {
        if (p.isWordLike) {
          const w = p.segment.trim();
          if (w.length > 0) out.push(w);
        }
      }
      if (out.length > 0) return out;
    }
  } catch {
    /* ignore */
  }

  const rough = raw
    .replace(/\n+/g, " ")
    .replace(/[,;:]+/g, " ")
    .replace(/[!?]+/g, " ")
    .replace(/\.+(?=\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!rough) return [];
  return rough.split(" ").filter((w) => w.length > 0);
}

function countWords(s: string): number {
  return tokenizeWords(s).length;
}

function clampToWordLimit(text: string, maxWords: number): string {
  // Preserve live typing (including trailing spaces/newlines) until the word
  // limit is reached. Trimming here makes spacebar feel broken in a controlled
  // textarea because each keystroke is immediately "cleaned".
  const normalized = normalizeBreaks(text).slice(0, CHAR_SAFETY);
  const words = tokenizeWords(normalized);
  if (words.length === 0) return normalized;
  if (words.length <= maxWords) return normalized;
  return words.slice(0, maxWords).join(" ");
}

// ── Core Builder (MyStoryBoard) — 6 prompts ───────────────────────────
const QUESTIONS = [
  {
    id: 1,
    phase: "Goal / Objective",
    question: "What needed to be achieved and why was it challenging?",
    sample:
      "We needed to cut first-week churn from 38% to under 20% so our retention story held up for the next funding milestone. It was challenging because causes were split across onboarding UX, lifecycle email timing, and a paywall bug that was hard to reproduce.",
  },
  {
    id: 2,
    phase: "Problem Breakdown + Tools",
    question: "How did you break down the problem?",
    sample:
      "I mapped the experience into five steps, tagged drop-off in our analytics tool, interviewed twelve new users, and modeled where time-to-value spiked. That showed most exits clustered around step three and the paywall, so we knew where to dig first.",
  },
  {
    id: 3,
    phase: "Prioritization & Decision Criteria",
    question: "How did you prioritize what was needed? What did you consider before making your decisions?",
    sample:
      "I scored options on impact to churn, engineering effort, legal risk, and how fast we could learn. We deprioritized a full visual redesign and prioritized paywall copy plus one email experiment first because it was the smallest slice that still tested our riskiest assumption.",
  },
  {
    id: 4,
    phase: "Execution & Actions",
    question:
      "What specific actions did you take to solve the problem? Did you manage execution through any systems, processes, or tools?",
    sample:
      "I wrote a one-pager with acceptance criteria, broke work into two-day sprints in Jira, paired with engineering on the paywall defect, and used a lightweight launch checklist for the email change. Short daily syncs kept blockers from sitting longer than a day.",
  },
  {
    id: 5,
    phase: "Stakeholders & Influence",
    question: "Who was involved and how alignment or resistance was handled?",
    sample:
      "Marketing wanted brand-perfect messaging, finance worried about discounting, and engineering feared scope creep. I shared funnel clips and numbers in a workshop, agreed on a phased test with clear guardrails, and documented trade-offs in Notion so decisions stayed traceable.",
  },
  {
    id: 6,
    phase: "Outcome & Learning",
    question: "What specific results were achieved? What did you learn?",
    sample:
      "First-week churn fell to about 16% within six weeks, which modeled to roughly $400K in saved ARR. I learned to pull analytics in during discovery, not after we had a solution, and to bias toward experiments that falsify assumptions quickly.",
  },
];

function fmtFallback() {
  return (
    <div className={`${urbanist.className} min-h-[calc(100vh-64px)] animate-in fade-in duration-500 pb-24`}>
      <div className="mx-auto max-w-[684px] px-6 py-12 text-center text-[14px] text-[#64748B]">Loading storyboard…</div>
    </div>
  );
}

export default function BackupNewStoryBoardFlowClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const experienceId = (searchParams.get("experienceId") ?? "").trim();
  const roleParam = (searchParams.get("role") ?? "").trim();
  const roleTitle = (roleParam || user.targetRole || user.role || "My role").trim();
  const resolvedRole = useMemo(() => ensureRoleForTitle(roleTitle), [roleTitle]);
  const bankExperiences = resolvedRole?.experiences ?? [];

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [inputMode, setInputMode] = useState<"keyboard" | "voice">("keyboard");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const holdActiveRef = useRef(false);
  const speechBaseRef = useRef("");
  const speechQuestionIdRef = useRef(QUESTIONS[0]?.id ?? 1);

  const answerText = (id: number) => answers[id] ?? "";

  const q = QUESTIONS[currentStep];
  const isLast = currentStep === QUESTIONS.length - 1;
  const currentAnswer = answerText(q.id);
  const wordCount = countWords(currentAnswer);
  const meaningful = wordCount >= 20;
  const progressPct = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);

  const enrichmentAnsweredFor = (expId: string) => {
    if (expId === experienceId) {
      return QUESTIONS.reduce((n, q) => n + ((answers[q.id] ?? "").trim().length > 0 ? 1 : 0), 0);
    }
    return countAnsweredQuestions(expId);
  };

  const enrichmentLabelFor = (expId: string) => `${enrichmentAnsweredFor(expId)}/6 enriched`;

  const enrichmentPctFor = (expId: string) =>
    Math.max(0, Math.min(100, Math.round((enrichmentAnsweredFor(expId) / 6) * 100)));

  useEffect(() => {
    if (!experienceId) router.replace("/storyboard/backup");
  }, [experienceId, router]);

  useEffect(() => {
    recognitionRef.current?.stop();
    holdActiveRef.current = false;
    queueMicrotask(() => setIsRecording(false));
  }, [q.id]);

  useEffect(() => {
    if (inputMode === "keyboard") {
      recognitionRef.current?.stop();
      holdActiveRef.current = false;
      queueMicrotask(() => setIsRecording(false));
    }
  }, [inputMode]);

  const beginSpeechHold = () => {
    if (holdActiveRef.current) return;
    const SR = getSpeechRecognition();
    if (!SR) {
      window.alert("Voice input is not supported in this browser.");
      return;
    }
    holdActiveRef.current = true;
    speechQuestionIdRef.current = q.id;
    speechBaseRef.current = answerText(q.id);
    const recognition = new SR() as WebSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: WebSpeechResultEvent) => {
      // Rebuild the full utterance from every result in this session. Using only
      // `resultIndex..end` drops earlier finalized chunks, so the textarea and word
      // count stop updating correctly while the mic is held.
      let session = "";
      for (let i = 0; i < event.results.length; i++) {
        session += event.results[i][0].transcript;
      }
      const base = speechBaseRef.current;
      const sessionTrim = session.trimStart();
      const combined = !sessionTrim ? base : !base ? sessionTrim : `${base} ${sessionTrim}`;
      const merged = clampToWordLimit(combined.slice(0, CHAR_SAFETY), WORD_LIMIT);
      const qid = speechQuestionIdRef.current;
      setAnswers((prev) => ({ ...prev, [qid]: merged }));
    };
    recognition.onerror = () => {
      holdActiveRef.current = false;
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch {
      holdActiveRef.current = false;
      setIsRecording(false);
    }
  };

  const endSpeechHold = () => {
    if (!holdActiveRef.current) return;
    holdActiveRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setIsRecording(false);
  };

  const handleNext = () => {
    if (isLast) {
      try {
        window.sessionStorage.setItem("pd:crafter:showAnalyzing", "1");
      } catch {
        /* ignore */
      }
      router.push(`/storyboard/backup/crafting?experienceId=${encodeURIComponent(experienceId)}`);
      return;
    }
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/storyboard/backup");
    }
  };

  if (!experienceId) {
    return (
      <div className={`${urbanist.className} flex min-h-[calc(100vh-64px)] items-center justify-center pb-24`}>
        <p className="text-[14px] text-[#64748B]">Opening storyboard…</p>
      </div>
    );
  }

  if (!q) return fmtFallback();

  return (
    <div
      className={`${urbanist.className} relative flex h-[calc(100dvh-64px)] min-h-0 flex-col overflow-x-hidden pb-6`}
    >
      <div className="relative z-[2] mx-auto flex w-full max-w-[1320px] min-h-0 flex-1 flex-col px-6 py-6 lg:py-8">
        <div className="mx-auto flex min-h-0 w-full max-w-[1320px] flex-1 flex-col">
          <div className="mb-6 flex shrink-0 justify-start">
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-2 text-[13px] font-semibold text-[#64748B] transition-colors hover:text-[#1E293B]"
            >
              <ArrowLeft size={16} aria-hidden /> Back
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
            <aside
              className={`${glassCard} flex min-h-0 w-full shrink-0 flex-col px-4 py-4 lg:max-w-[340px]`}
              aria-label="Experience bank"
            >
              <p className="text-[16px] font-semibold text-[#0F172A]">Experience bank</p>
              <p className="mt-1 text-[12px] font-medium text-[#64748B]">{roleTitle}</p>

              <div className="mt-4 flex min-h-0 max-h-[min(320px,42dvh)] flex-1 flex-col gap-3 overflow-y-auto lg:max-h-none">
                {[...bankExperiences].slice(-5).reverse().map((e, idx) => {
                  const active = e.id === experienceId;
                  return (
                    <div
                      key={e.id}
                      className={[
                        "rounded-[16px] border bg-white/60 px-4 py-3",
                        active ? "border-[#0A89A9]/50 ring-2 ring-[#0A89A9]/15" : "border-white/80",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold leading-snug text-[#0F172A]">
                            Experience {Math.min(bankExperiences.length, 5) - idx}
                          </p>
                          <p className="mt-0.5 text-[14px] leading-relaxed text-[#334155]">{e.label}</p>
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                            <div
                              className="h-full rounded-full bg-[#0A89A9]"
                              style={{ width: `${enrichmentPctFor(e.id)}%` }}
                            />
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[14px] font-medium text-slate-700">
                          {enrichmentLabelFor(e.id)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {bankExperiences.length === 0 ? (
                  <div className="rounded-[16px] border border-white/70 bg-white/40 px-4 py-4">
                    <p className="text-[14px] font-medium text-[#334155]">
                      No experiences for this role yet. Add them from Story Boards, then return here to continue.
                    </p>
                  </div>
                ) : null}
              </div>
            </aside>

            <section
              className={`${glassCard} flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 py-4`}
              data-journey-id="story-core-builder"
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-[684px] flex-col gap-8 py-1">
                  <div className="w-full" data-journey-id="story-progress">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]" aria-label="Story progress">
                      <div
                        className="h-full max-w-full rounded-full bg-[#0A89A9] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="w-full text-left" data-journey-id="story-question">
                    <p className="mb-2 text-[13px] font-semibold tracking-tight text-[#0A89A9]">
                      Q{currentStep + 1} <span className="font-normal text-[#94A3B8]">—</span> {q.phase}
                    </p>
                    <h1 className="text-[26px] font-normal leading-snug text-[#334155] sm:text-[30px] sm:leading-tight">
                      {q.question}
                    </h1>
                  </div>

                  <div className="w-full" data-journey-id="story-protip">
                    <div className="flex flex-col gap-3">
                      <div className="flex w-full items-start border-b-[0.5px] border-[#0087A8] py-2 pl-[10px] pr-1.5 shadow-none">
                        <textarea
                          autoFocus={inputMode === "keyboard"}
                          readOnly={inputMode === "voice"}
                          value={currentAnswer}
                          onChange={(e) => {
                            const next = clampToWordLimit(e.target.value.slice(0, CHAR_SAFETY), WORD_LIMIT);
                            setAnswers((prev) => ({ ...prev, [q.id]: next }));
                          }}
                          rows={5}
                          placeholder="Write your answer here (up to 200 words)…"
                          className={`storyboard-underline-textarea min-h-0 w-full resize-none border-0 border-transparent bg-transparent py-1 text-[16px] font-normal leading-relaxed text-[#1E293B] shadow-none outline-none ring-0 placeholder:text-[#475569] focus:border-transparent focus:shadow-none focus:ring-0 focus:outline-none ${
                            inputMode === "voice" ? "cursor-default text-[#1E293B]/90" : ""
                          }`}
                          aria-label="Your answer"
                        />
                      </div>
                      <p className="w-full text-right text-[12px] font-normal leading-none text-[#475569]">
                        <span
                          className={`inline-block tabular-nums ${
                            wordCount > WORD_LIMIT - 15 ? "font-medium text-amber-600" : ""
                          }`}
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {wordCount} / {WORD_LIMIT} words
                        </span>
                      </p>
                      <div className="mt-2 rounded-xl border border-[#E2E8F0]/90 bg-[#F8FAFC]/90 px-3.5 py-3 text-left">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#0A89A9]">Quick tip</p>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748B]">
                          <span className="font-medium text-[#475569]">Suggestive answer: </span>
                          {q.sample}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap items-center justify-between gap-4 border-t border-[#E2E8F0]/90 pt-6">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="text-[13px] font-medium text-[#64748B] hover:text-[#1E293B]"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      data-journey-id="story-next"
                      onClick={handleNext}
                      disabled={!meaningful}
                      className="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-full bg-[#0A89A9] px-6 text-[14px] font-medium text-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-[filter,opacity] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isLast ? "Continue →" : "Next question →"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Bottom center: push-to-talk copy + press-and-hold mic (talk mode). Bottom-right: mode toggle. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 min-h-[120px] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {inputMode === "voice" ? (
          <div className="pointer-events-auto mx-auto flex max-w-[min(100%,420px)] flex-col items-center gap-2 px-4">
            <div className="pointer-events-none w-full text-center">
              <p id="push-to-talk-label" className="text-[13px] font-semibold tracking-tight text-[#334155]">
                Push to talk
              </p>
              <p id="push-to-talk-hint" className="mt-0.5 text-[11px] font-medium leading-snug text-[#64748B]">
                Press and hold the mic while you speak. Release when you are done.
              </p>
            </div>
            <button
              type="button"
              className={`flex size-[68px] shrink-0 select-none items-center justify-center rounded-full border-2 border-[#0A89A9]/25 bg-[#0A89A9] text-white shadow-[0_8px_28px_rgba(10,137,169,0.35)] transition-[transform,box-shadow] active:scale-95 motion-reduce:transition-none ${
                isRecording ? "scale-95 ring-4 ring-[#0A89A9]/30" : ""
              }`}
              aria-labelledby="push-to-talk-label"
              aria-describedby="push-to-talk-hint"
              aria-pressed={isRecording}
              title="Press and hold to talk"
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
                beginSpeechHold();
              }}
              onPointerUp={(e) => {
                if ((e.currentTarget as HTMLButtonElement).hasPointerCapture(e.pointerId)) {
                  (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
                }
                endSpeechHold();
              }}
              onPointerCancel={(e) => {
                if ((e.currentTarget as HTMLButtonElement).hasPointerCapture(e.pointerId)) {
                  (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
                }
                endSpeechHold();
              }}
              onLostPointerCapture={() => endSpeechHold()}
            >
              {isRecording ? (
                <span className="relative flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                  <Mic size={26} strokeWidth={2} className="relative drop-shadow-sm" aria-hidden />
                </span>
              ) : (
                <Mic size={26} strokeWidth={2} className="drop-shadow-sm" aria-hidden />
              )}
            </button>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setInputMode((m) => (m === "keyboard" ? "voice" : "keyboard"))}
          className="pointer-events-auto absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-4 inline-flex size-11 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#475569] shadow-[0_4px_16px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-colors hover:bg-slate-50 hover:text-[#0F172A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0087A8]/25 sm:right-6"
          aria-label={inputMode === "keyboard" ? "Switch to talk mode" : "Switch to keyboard mode"}
          title={inputMode === "keyboard" ? "Talk mode" : "Keyboard mode"}
        >
          {inputMode === "keyboard" ? <Mic size={20} strokeWidth={2} aria-hidden /> : <Keyboard size={20} strokeWidth={2} aria-hidden />}
        </button>
      </div>
    </div>
  );
}

