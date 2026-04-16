"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Urbanist } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Sparkles } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { addExperienceToRole, ensureRoleForTitle, type StoryExperience, type StoryRole } from "@/lib/storyboard-library";
import { STORYBOARD_AGENT_QUESTIONS } from "@/lib/storyboard-agent-questions";
import { countAnsweredQuestions, setEnrichmentAnswer, type EnrichmentQuestionId } from "@/lib/storyboard-enrichment";
import { buildInitialStorySectionDraft, type StoryDraftCAR } from "@/lib/storyboard-draft-snippet";
import { getSpeechRecognition, type WebSpeechRecognition, type WebSpeechResultEvent } from "@/lib/proofy-speech";
import { StoryGenerationLoadingScreen } from "@/components/StoryGenerationLoadingScreen";

const urbanist = Urbanist({ subsets: ["latin"], display: "swap" });

type AgentMsgLayout = "welcome" | "milestone";

type Msg =
  | { id: string; who: "agent"; kind: "text"; text: string; layout?: AgentMsgLayout }
  | { id: string; who: "user"; kind: "text"; text: string };

type DraftPanelState = {
  experienceId: string;
  label: string;
  draft: StoryDraftCAR;
  footerHint: "more_experiences" | "last_one";
};

type Phase = "collect" | "gate" | "enrich" | "enrich_preview" | "done";

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const glassCard =
  "relative overflow-hidden rounded-[24px] border border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

const GLASS_INSET_HIGHLIGHT = "inset -5px -5px 250px 0px rgba(255,255,255,0.02)";
const TEAL = "#0087A8";
const SPARKLE_ORB_GRADIENT =
  "linear-gradient(153.8deg, rgb(80, 177, 242) 10.4%, rgb(0, 102, 128) 89.66%)";

function clamp14(textClass: string): string {
  // guardrail: never accidentally use <14px for new UI
  return textClass.replace(/text-\[(1[0-3])px\]/g, "text-[14px]");
}

function answeredLabel(experienceId: string): string {
  const n = countAnsweredQuestions(experienceId);
  return `${n}/6 enriched`;
}

function expPct(experienceId: string): number {
  return Math.max(0, Math.min(100, Math.round((countAnsweredQuestions(experienceId) / 6) * 100)));
}

function AgentThinkingDots() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-busy="true" role="status">
      <div className="flex items-center gap-1.5 rounded-[18px] border border-white/80 bg-white/70 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-[#0A89A9]"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -5, 0] }}
            transition={{
              duration: 0.85,
              repeat: Infinity,
              delay: i * 0.16,
              ease: "easeInOut",
            }}
          />
        ))}
        <span className="sr-only">Assistant is thinking</span>
      </div>
    </div>
  );
}

/**
 * Splits enrichment questions into headline + body for milestone layout.
 * e.g. "How did you break it down? (What did you…)" → question + newline + parenthetical.
 */
function formatAgentQuestionForMilestone(question: string): string {
  const i = question.indexOf(" (");
  if (i !== -1) {
    return `${question.slice(0, i).trim()}\n\n${question.slice(i).trim()}`;
  }
  return question;
}

/** Primary teal + slate for welcome headline (split on first em dash). */
function WelcomeHeadlineTwoTone({ headline }: { headline: string }) {
  const sep = " — ";
  const i = headline.indexOf(sep);
  if (i === -1) {
    return (
      <p className="text-[17px] font-semibold leading-snug tracking-[-0.02em] text-[#0A89A9]">{headline}</p>
    );
  }
  return (
    <p className="text-[17px] font-semibold leading-snug tracking-[-0.02em]">
      <span className="text-[#0A89A9]">{headline.slice(0, i)}</span>
      <span className="text-slate-600">{headline.slice(i)}</span>
    </p>
  );
}

function SparkleOrb() {
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full" aria-hidden>
      <span
        className="pointer-events-none absolute inset-0 rounded-full backdrop-blur-[21px]"
        style={{ backgroundImage: SPARKLE_ORB_GRADIENT }}
      />
      <Sparkles className="relative z-[1] h-[14px] w-[14px] text-white" strokeWidth={2} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ boxShadow: GLASS_INSET_HIGHLIGHT }}
      />
    </span>
  );
}

export function StoryboardAgentChat() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useUser();

  const firstName = useMemo(() => user.name?.trim().split(/\s+/)[0] || "Maaz", [user.name]);
  const roleTitle = useMemo(() => {
    const override = (params.get("role") ?? "").trim();
    return (override || user.targetRole || user.role || "My role").trim();
  }, [params, user.targetRole, user.role]);

  const resolvedRole: StoryRole | null = useMemo(() => ensureRoleForTitle(roleTitle), [roleTitle]);
  const roleId = resolvedRole?.id ?? "";

  const [phase, setPhase] = useState<Phase>("collect");
  const [messages, setMessages] = useState<Msg[]>([]);
  /** True on first paint (welcome incoming) and after each user send until the agent reply is queued */
  const [agentThinking, setAgentThinking] = useState(true);
  const replyGen = useRef(0);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported] = useState(() => !!getSpeechRecognition());
  const recRef = useRef<WebSpeechRecognition | null>(null);
  const listeningRef = useRef(false);

  const [experiences, setExperiences] = useState<StoryExperience[]>(() => resolvedRole?.experiences ?? []);

  // enrichment cursor
  const [enrichIdx, setEnrichIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  /** Index in `experiences` of the experience we just finished enriching (shown in draft column). */
  const [previewCompletedIdx, setPreviewCompletedIdx] = useState<number | null>(null);
  const [draftPanel, setDraftPanel] = useState<DraftPanelState | null>(null);
  const [craftLoading, setCraftLoading] = useState(false);

  /** Full enrichment = 6/6 questions answered for an experience (re-reads localStorage when flow state changes). */
  const fullyEnrichedExperienceCount = useMemo(() => {
    return experiences.filter((e) => countAnsweredQuestions(e.id) >= 6).length;
  }, [experiences, enrichIdx, questionIdx, phase, draftPanel]);
  const canCraftMyStory = Boolean(roleId) && fullyEnrichedExperienceCount >= 3;

  const transcriptRef = useRef<HTMLDivElement>(null);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    try {
      recRef.current?.abort();
    } catch {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
    }
    recRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => {
    if (!resolvedRole) return;
    setExperiences(resolvedRole.experiences);
  }, [resolvedRole?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, draftPanel, agentThinking]);

  useEffect(() => {
    return () => {
      replyGen.current += 1;
    };
  }, []);

  useEffect(() => {
    // Short in-thread kickoff (big welcome lives in the page header) — brief “thinking” then first bubble
    if (messages.length > 0) return;
    const prefill = (params.get("prefill") ?? "").trim();
    const welcomeText = prefill
      ? `Hey ${firstName}, welcome to your storyboard — here we’ll craft your experiences in the best way possible.\n\nIf you want a starting point, try this:\n\n“${prefill}”\n\nOr share your own experiences below. One at a time is perfect — I’ll stack them up top as we go.`
      : `Hey ${firstName}, welcome to your storyboard — here we’ll craft your experiences in the best way possible.\n\nShare a few experiences for this role when you’re ready. One at a time is perfect — I’ll stack them up top as we go.`;
    const myId = ++replyGen.current;
    const ms = 560 + Math.min(520, Math.floor(welcomeText.length * 3));
    const t = window.setTimeout(() => {
      if (replyGen.current !== myId) return;
      setMessages([{ id: uid(), who: "agent", kind: "text", text: welcomeText, layout: "welcome" }]);
      setAgentThinking(false);
    }, ms);
    return () => clearTimeout(t);
  }, [messages.length, params, firstName]);

  const addAgentText = useCallback((text: string, layout?: AgentMsgLayout) => {
    setMessages((m) => [...m, { id: uid(), who: "agent", kind: "text", text, ...(layout ? { layout } : {}) }]);
  }, []);

  const scheduleAgentReply = useCallback(
    (text: string, layout?: AgentMsgLayout) => {
      setAgentThinking(true);
      const myId = ++replyGen.current;
      const ms = 440 + Math.min(820, Math.floor(text.length * 5));
      window.setTimeout(() => {
        if (replyGen.current !== myId) return;
        addAgentText(text, layout);
        setAgentThinking(false);
      }, ms);
    },
    [addAgentText]
  );

  const addUserText = useCallback((text: string) => {
    setMessages((m) => [...m, { id: uid(), who: "user", kind: "text", text }]);
  }, []);

  const continueFromDraftPreview = useCallback(() => {
    if (previewCompletedIdx === null) return;
    const completedIdx = previewCompletedIdx;
    setPreviewCompletedIdx(null);
    setDraftPanel(null);
    const nextIdx = completedIdx + 1;
    if (nextIdx < experiences.length) {
      setEnrichIdx(nextIdx);
      setQuestionIdx(0);
      setPhase("enrich");
      const nextExp = experiences[nextIdx];
      if (nextExp) {
        scheduleAgentReply(
          `Great — let’s enrich this one next:\n\n${nextExp.label}\n\n${STORYBOARD_AGENT_QUESTIONS[0]!.question}`,
          "milestone"
        );
      }
    } else {
      setPhase("done");
      scheduleAgentReply(
        `Well done — you’ve enriched every experience we captured for ${roleTitle}.\n\nYou can still add more experiences first if you want a wider story bank. When you’re ready, open your full draft below.`,
        "milestone"
      );
    }
  }, [previewCompletedIdx, experiences, roleTitle, scheduleAgentReply]);

  const navigateToCrafting = useCallback(() => {
    if (!roleId) return;
    router.push(`/storyboard/crafting?roleId=${encodeURIComponent(roleId)}`);
  }, [router, roleId]);

  const startCraftingWithLoading = useCallback(() => {
    if (!roleId) return;
    setCraftLoading(true);
  }, [roleId]);

  const submit = useCallback(() => {
    const t = input.trim();
    if (!t || !roleId || agentThinking) return;
    setInput("");
    addUserText(t);

    if (phase === "enrich_preview") {
      const lower = t.toLowerCase();
      if (/(next|continue|go|ok|yes)/.test(lower)) {
        continueFromDraftPreview();
      } else {
        scheduleAgentReply("When you’re ready, type “next” in the chat to keep going.");
      }
      return;
    }

    if (phase === "collect") {
      const exp = addExperienceToRole(roleId, t);
      if (!exp) {
        scheduleAgentReply("That one didn’t save on my side. Can you send it again? I’ll catch it.");
        return;
      }
      setExperiences((prev) => [...prev, exp]);

      const nextCount = experiences.length + 1;
      if (nextCount < 3) {
        scheduleAgentReply(
          nextCount === 1
            ? "Great — I’ve added your first experience to the Experience bank.\n\nKeep adding more — we’re aiming for at least three for this role. Share your second experience when you’re ready."
            : "Well done — that’s two in your Experience bank.\n\nAdd one more — we’re aiming for at least three for this role, then we can shape your story better.",
          "milestone"
        );
        return;
      }

      setPhase("gate");
      scheduleAgentReply(
        `Well done — I’ve captured ${nextCount} experiences for ${roleTitle}.\n\n` +
          `You can add more now, or save additional ones for later.\n\n` +
          `Would you like to start enriching these so we can craft stronger stories for you?`,
        "milestone"
      );
      return;
    }

    if (phase === "gate") {
      const lower = t.toLowerCase();
      const wantsMore = /(more|add|another|yes)/.test(lower) && !/(continue|enrich|start)/.test(lower);
      if (wantsMore) {
        setPhase("collect");
        scheduleAgentReply("Great — send the next experience when you’re ready.");
        return;
      }
      // default to enrich
      setPhase("enrich");
      setEnrichIdx(0);
      setQuestionIdx(0);
      const first = experiences[0];
      if (!first) {
        setPhase("collect");
        scheduleAgentReply("Quick check — I don’t see an experience saved yet. Share your first one and I’ll capture it.");
        return;
      }
      const q = STORYBOARD_AGENT_QUESTIONS[0]!;
      scheduleAgentReply(
        `Great — let’s enrich your first experience so it’s interview-ready:\n\n` + `${first.label}\n\n${q.question}`,
        "milestone"
      );
      return;
    }

    if (phase === "enrich") {
      const exp = experiences[enrichIdx];
      const q = STORYBOARD_AGENT_QUESTIONS[questionIdx];
      if (!exp || !q) {
        setPhase("done");
        scheduleAgentReply("All set. Want me to craft the story now?");
        return;
      }

      setEnrichmentAnswer({
        experienceId: exp.id,
        roleId,
        questionId: q.id as EnrichmentQuestionId,
        answer: t,
      });

      const nextQIdx = questionIdx + 1;
      if (nextQIdx < STORYBOARD_AGENT_QUESTIONS.length) {
        setQuestionIdx(nextQIdx);
        const nextQ = STORYBOARD_AGENT_QUESTIONS[nextQIdx]!;
        scheduleAgentReply(formatAgentQuestionForMilestone(nextQ.question), "milestone");
        return;
      }

      // Finished all 6 questions for this experience — show in-chat initial draft, then continue.
      const draft = buildInitialStorySectionDraft({
        roleTitle,
        experienceLabel: exp.label,
        experienceId: exp.id,
      });
      const moreToEnrich = enrichIdx + 1 < experiences.length;
      setPreviewCompletedIdx(enrichIdx);
      setPhase("enrich_preview");
      setDraftPanel({
        experienceId: exp.id,
        label: exp.label,
        draft,
        footerHint: moreToEnrich ? "more_experiences" : "last_one",
      });
      scheduleAgentReply(
        "Great — I’m putting together an initial draft of your story from what you shared.\n\nCheck the Initial draft column — your Challenge / Action / Result snapshot is there.",
        "milestone"
      );
      return;
    }

    if (phase === "done") {
      const lower = t.toLowerCase();
      if (/(add|more|another)/.test(lower)) {
        setPhase("collect");
        scheduleAgentReply("Great — send the next experience when you’re ready.");
        return;
      }
      if (/(craft|draft|go)/.test(lower)) {
        startCraftingWithLoading();
        return;
      }
      scheduleAgentReply("Whenever you’re ready, hit “Create my draft”.");
    }
  }, [
    input,
    roleId,
    phase,
    addUserText,
    scheduleAgentReply,
    experiences,
    roleTitle,
    enrichIdx,
    questionIdx,
    continueFromDraftPreview,
    agentThinking,
    startCraftingWithLoading,
  ]);

  const toggleVoice = useCallback(() => {
    if (listeningRef.current) {
      stopListening();
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) return;
    listeningRef.current = true;
    const rec = new SR() as WebSpeechRecognition;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: WebSpeechResultEvent) => {
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        interim += e.results[i][0].transcript;
      }
      setInput(interim);
    };
    rec.onerror = () => {
      stopListening();
    };
    rec.onend = () => {
      stopListening();
    };
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      stopListening();
    }
  }, [stopListening]);

  if (craftLoading) {
    return (
      <StoryGenerationLoadingScreen
        name={user.name || "Maaz"}
        onDone={navigateToCrafting}
        minDurationMs={20000}
      />
    );
  }

  return (
    <div
      className={`${urbanist.className} relative flex h-[calc(100dvh-64px)] min-h-0 flex-col overflow-x-hidden pb-6`}
    >
      <div className="relative z-[2] mx-auto flex w-full max-w-[1320px] min-h-0 flex-1 flex-col px-6 py-6 lg:py-8">
        <div className="mx-auto flex min-h-0 w-full max-w-[1320px] flex-1 flex-col">
          {/* Big, friendly header copy (outside the chat card) */}
          <div className="mb-12 shrink-0">
            <h1 className="text-center text-[28px] font-normal leading-tight">
              <span className="text-[#0A89A9]">Hey {firstName}</span>
              <span className="text-slate-600">, let’s build your storyboard for </span>
              <span className="text-[#0A89A9]">{roleTitle}</span>
              <span className="text-slate-600">.</span>
            </h1>
          </div>

          {/* Fills remaining viewport below the headline; avoids a magic 140px subtract */}
          <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
            {/* Column 1: experience bank */}
            <aside
              className={`${glassCard} flex min-h-0 w-full shrink-0 flex-col px-4 py-4 lg:max-w-[340px]`}
            >
              <p className="text-[16px] font-semibold text-[#0F172A]">Experience bank</p>

              <div className="mt-4 flex min-h-0 max-h-[min(320px,42dvh)] flex-1 flex-col gap-3 overflow-y-auto lg:max-h-none">
                {[...experiences].slice(-5).reverse().map((e, idx) => (
                  <div
                    key={e.id}
                    className="rounded-[16px] border border-white/80 bg-white/60 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold leading-snug text-[#0F172A]">
                          Experience {Math.min(experiences.length, 5) - idx}
                        </p>
                        <p className="mt-0.5 text-[14px] leading-relaxed text-[#334155]">{e.label}</p>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div className="h-full rounded-full bg-[#0A89A9]" style={{ width: `${expPct(e.id)}%` }} />
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[14px] font-medium text-slate-700">
                        {answeredLabel(e.id)}
                      </span>
                    </div>
                  </div>
                ))}

                {experiences.length === 0 ? (
                  <div className="rounded-[16px] border border-white/70 bg-white/40 px-4 py-4">
                    <p className="text-[14px] font-medium text-[#334155]">
                      Start by sharing your first experience in the chat in the center. We’ll build from there.
                    </p>
                  </div>
                ) : null}
              </div>
            </aside>

            {/* Column 2: Storyboard Assistant — chat + input (messages scroll inside; card height capped) */}
            <div
              className={`${glassCard} flex min-h-[min(280px,36dvh)] min-w-0 flex-1 flex-col overflow-hidden px-4 py-4 lg:min-h-0`}
            >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <p className="mb-3 shrink-0 text-[14px] font-semibold text-[#0F172A]">Your Storyboard Assistant</p>
              <div
                ref={transcriptRef}
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 [-webkit-overflow-scrolling:touch]"
              >
                <div className="flex flex-col gap-3">
                  {messages.map((m) => {
                    if (m.kind !== "text") return null;
                    const isUser = m.who === "user";
                    const isEditorial =
                      m.who === "agent" && (m.layout === "welcome" || m.layout === "milestone");
                    if (isEditorial) {
                      const parts = m.text.split("\n\n");
                      const headline = parts[0] ?? m.text;
                      const sub = parts.slice(1).join("\n\n").trim();
                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                          className="flex w-full justify-start"
                        >
                          <div className="w-full max-w-full pr-1 pt-0.5">
                            <WelcomeHeadlineTwoTone headline={headline} />
                            {sub ? (
                              <p className="mt-3 whitespace-pre-wrap text-[14px] font-normal leading-relaxed text-[#64748B]">
                                {sub}
                              </p>
                            ) : null}
                          </div>
                        </motion.div>
                      );
                    }
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={[
                            "max-w-[92%] rounded-[18px] px-4 py-3 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-shadow duration-300",
                            isUser ? "bg-[#0A89A9] text-white" : "border border-white/80 bg-white/60 text-[#0F172A]",
                          ].join(" ")}
                        >
                          <p className={clamp14("whitespace-pre-wrap text-[14px] leading-relaxed")}>{m.text}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                  {agentThinking ? (
                    <motion.div
                      key="thinking"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <AgentThinkingDots />
                    </motion.div>
                  ) : null}
                </div>
              </div>

            </div>

            {/* Bottom input styled like the existing live-coach bar (no “AI coach” wording) */}
            <form
              className="relative mt-4 flex w-full shrink-0 items-center justify-between gap-3 border-t border-white/60 py-1 pl-2 pr-1 pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <SparkleOrb />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  readOnly={listening || agentThinking}
                  placeholder={
                    phase === "collect"
                      ? "Share your experience…"
                      : phase === "enrich_preview"
                        ? "Type “next” when you’re ready to continue…"
                        : "Type your answer…"
                  }
                  aria-label="Message"
                  className="h-11 min-w-0 flex-1 border-0 bg-transparent text-[16px] font-normal leading-none text-slate-600 outline-none placeholder:text-slate-500 read-only:opacity-95"
                />
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {speechSupported ? (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    aria-label={listening ? "Stop voice input" : "Voice input"}
                    aria-pressed={listening}
                    className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full outline-none transition-opacity hover:opacity-90"
                    style={{
                      color: listening ? TEAL : "#64748B",
                      boxShadow: listening ? `0 0 0 2px ${TEAL}33` : "none",
                    }}
                  >
                    <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full backdrop-blur-[17px]" />
                    <Mic className="relative z-[1] h-4 w-4" strokeWidth={listening ? 2.25 : 2} />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[inherit]"
                      style={{ boxShadow: GLASS_INSET_HIGHLIGHT }}
                    />
                  </button>
                ) : null}

                <button
                  type="submit"
                  disabled={!input.trim() || agentThinking}
                  className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-white/95 outline-none transition-opacity disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Send"
                >
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full backdrop-blur-[17px]" />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-[-0.5px] rounded-[inherit]"
                    style={{ boxShadow: GLASS_INSET_HIGHLIGHT }}
                  />
                  <ArrowRight className="relative z-[1] h-4 w-4 text-slate-600" strokeWidth={2} />
                </button>
              </div>
            </form>

            {phase === "done" ? (
              <div className="mt-4 shrink-0">
                <button
                  type="button"
                  onClick={startCraftingWithLoading}
                  className="w-full rounded-[18px] bg-[#0A89A9] px-5 py-4 text-[16px] font-semibold text-white shadow-[0_10px_40px_rgba(10,137,169,0.28)] transition-[filter,transform] hover:brightness-105 active:scale-[0.99]"
                >
                  Create my draft
                </button>
              </div>
            ) : null}
            </div>

            {/* Column 3: initial draft — always visible; fills in after each completed enrichment */}
            <aside
              className={`${glassCard} flex min-h-0 w-full shrink-0 flex-col overflow-x-hidden overflow-y-auto px-4 py-4 lg:max-w-[360px]`}
            >
              <p className="shrink-0 text-[16px] font-semibold text-[#0F172A]">Initial draft</p>

              <div className="flex min-h-0 flex-1 flex-col">
                {phase === "enrich_preview" && draftPanel ? (
                  <>
                    <p className="mt-1 line-clamp-2 shrink-0 text-[14px] leading-snug text-[#64748B]">{draftPanel.label}</p>

                    <div className="mt-4 min-h-0 max-h-[min(52dvh,480px)] flex-1 space-y-4 overflow-y-auto rounded-[14px] border border-white/70 bg-white/45 px-3 py-3 lg:max-h-[min(48dvh,480px)]">
                      <p className="text-[14px] leading-snug text-[#334155]">{draftPanel.draft.intro}</p>
                      {(
                        [
                          { key: "Challenge", body: draftPanel.draft.challenge },
                          { key: "Action", body: draftPanel.draft.action },
                          { key: "Result", body: draftPanel.draft.result },
                        ] as const
                      ).map(({ key, body }) => (
                        <div key={key}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A89A9]">{key}</p>
                          <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-[#334155]">{body}</p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 shrink-0 text-[14px] font-semibold leading-relaxed text-[#64748B]">
                      {draftPanel.footerHint === "more_experiences"
                        ? "Keep adding more to your other experiences so I can craft the best version of your story."
                        : "You can add more experiences to the bank anytime. When you’re ready, we’ll open your full draft with everything together."}
                    </p>
                  </>
                ) : (
                  <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-8 text-center">
                    <div
                      className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[linear-gradient(145deg,rgba(10,137,169,0.14)_0%,rgba(10,137,169,0.06)_100%)] text-[#0A89A9] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                      aria-hidden
                    >
                      <Sparkles className="h-[22px] w-[22px]" strokeWidth={2} />
                    </div>
                    <p className="max-w-[280px] text-[14px] leading-relaxed text-[#64748B]">
                      Start sharing your experiences in the chat — you’ll get a personalised story glimpse here as we build
                      your storyboard together.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 shrink-0 rounded-[18px] border border-white/70 bg-white/45 px-4 py-4">
                <p className="text-[14px] font-semibold text-[#0F172A]">Suggestions</p>
                <p className="mt-1 text-[14px] leading-relaxed text-[#64748B]">
                  Add a little more detail to strengthen your story — especially around your leadership and team management.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Leadership", "Team management"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="inline-flex items-center rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-[13px] font-medium text-[#0A89A9] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] hover:bg-white/80"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 shrink-0 border-t border-white/60 pt-4">
                <button
                  type="button"
                  disabled={!canCraftMyStory}
                  onClick={startCraftingWithLoading}
                  className="w-full rounded-[18px] bg-[#0A89A9] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_40px_rgba(10,137,169,0.28)] transition-[filter,transform,opacity] hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
                  aria-disabled={!canCraftMyStory}
                >
                  Craft my story
                </button>
                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]"
                  role="progressbar"
                  aria-valuenow={fullyEnrichedExperienceCount}
                  aria-valuemin={0}
                  aria-valuemax={3}
                  aria-label={`Fully enriched experiences: ${fullyEnrichedExperienceCount} of 3`}
                >
                  <div
                    className="h-full rounded-full bg-[#0A89A9] transition-[width] duration-300 ease-out"
                    style={{
                      width: `${Math.min(100, Math.round((fullyEnrichedExperienceCount / 3) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

