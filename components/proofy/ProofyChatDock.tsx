"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BookOpen, Maximize2, Mic, Sparkles, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { readJourneyState } from "@/lib/guided-journey";
import {
  buildFlowForIntent,
  classifyIntent,
  EMPTY_STATE_CHIPS,
  trainingCardMeta,
  type FlowStep,
} from "@/lib/proofy-central-intents";
import {
  getSpeechRecognition,
  type WebSpeechRecognition,
  type WebSpeechResultEvent,
} from "@/lib/proofy-speech";

const TEAL = "#0087A8";
const TEAL_DEEP = "#005f77";
const TEAL_LIGHT = "#67e8f9";
const TEAL_MIST = "#a5f3fc";

/** Insphere glass bar — Figma 866-5433 / 866-5448 */
const GLASS_BAR_GRADIENT =
  "linear-gradient(90.2deg, rgba(255,255,255,0.24) 0%, rgba(163, 237, 255, 0.6) 99.92%)";
const SPARKLE_ORB_GRADIENT =
  "linear-gradient(153.8deg, rgb(80, 177, 242) 10.4%, rgb(0, 102, 128) 89.66%)";
const GLASS_SHADOW_OUT = "0px 4px 20px 0px rgba(0,0,0,0.06)";
const GLASS_INSET_HIGHLIGHT = "inset -5px -5px 250px 0px rgba(255,255,255,0.02)";

function GlassChrome({ roundedClass }: { roundedClass: string }) {
  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${roundedClass} backdrop-blur-[21px]`}
        style={{ backgroundImage: GLASS_BAR_GRADIENT }}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-[-0.5px] ${roundedClass}`}
        style={{ boxShadow: GLASS_INSET_HIGHLIGHT }}
      />
    </>
  );
}

function SparkleOrb({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      aria-hidden
    >
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

const CHIP_GLASS =
  "linear-gradient(90.4deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.6) 99.92%)";

function SuggestionChip({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="relative inline-flex h-5 max-w-full items-center gap-0.5 overflow-hidden rounded-full border-[0.5px] border-white px-3 py-0.5 text-left shadow-[0px_4px_20px_0px_rgba(0,0,0,0.06)] outline-none transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full backdrop-blur-[21px]"
        style={{ backgroundImage: CHIP_GLASS }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[-0.5px] rounded-[inherit]"
        style={{ boxShadow: GLASS_INSET_HIGHLIGHT }}
      />
      <span className="relative z-[1] truncate text-[10px] font-medium leading-none text-slate-500">
        {label}
      </span>
      <ArrowUpRight className="relative z-[1] h-3 w-3 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
    </button>
  );
}

type ChatMsg =
  | { id: string; role: "user"; kind: "text"; text: string }
  | { id: string; role: "assistant"; kind: "text"; text: string }
  | { id: string; role: "assistant"; kind: "story_role_card"; roleName: string }
  | {
      id: string;
      role: "assistant";
      kind: "performance_summary";
      overall: number;
      strongest: { title: string; score: number };
      needsWork: { title: string; score: number };
      focusLine: string;
    }
  | { id: string; role: "assistant"; kind: "training_cards"; slugs: [string, string] }
  | { id: string; role: "assistant"; kind: "mock_options" };

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}

type ProofyChatDockProps = {
  /**
   * Default floating bar fixed to the viewport bottom. Use `inline` on long pages (e.g. session report)
   * so the dock sits in normal document flow and does not overlap content.
   */
  layout?: "floating" | "inline";
};

export function ProofyChatDock({ layout = "floating" }: ProofyChatDockProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [listening, setListening] = useState(false);
  const [speechSupported] = useState(() => !!getSpeechRecognition());
  const inputRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<WebSpeechRecognition | null>(null);
  const dictationPrefixRef = useRef("");
  const dictationCommittedRef = useRef("");
  const listeningRef = useRef(false);
  const [flowRunning, setFlowRunning] = useState(false);
  const [awaitingRole, setAwaitingRole] = useState(false);
  const [fabRaised, setFabRaised] = useState<boolean>(() => readJourneyState().active);
  const toggleVoiceRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 280);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const sync = () => setFabRaised(readJourneyState().active);
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
  }, []);

  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    try {
      recRef.current?.abort();
    } catch {
      try {
        recRef.current?.stop();
      } catch {
        /* noop */
      }
    }
    recRef.current = null;
    setListening(false);
  }, []);

  const buildDictationMessage = useCallback((interim: string) => {
    const prefix = dictationPrefixRef.current;
    const committed = dictationCommittedRef.current;
    const tail = `${committed}${interim}`;
    if (!prefix) return tail.trimStart();
    if (!tail) return prefix;
    const gap = prefix.endsWith(" ") || tail.startsWith(" ") ? "" : " ";
    return `${prefix}${gap}${tail}`;
  }, []);

  const closeDock = useCallback(() => {
    stopListening();
    setOpen(false);
    setAwaitingRole(false);
  }, [stopListening]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{
        open?: boolean;
        messages?: string[];
        prefill?: string;
        startVoice?: boolean;
      }>).detail;
      if (!detail) return;
      if (detail.open) setOpen(true);
      if (typeof detail.prefill === "string") {
        setMessage(detail.prefill);
      }
      const incoming = detail.messages ?? [];
      if (incoming.length > 0) {
        setMessages((m) => [
          ...m,
          ...incoming.map((text) => ({ id: uid(), role: "assistant", kind: "text", text }) as ChatMsg),
        ]);
      }
      if (detail.startVoice) {
        window.setTimeout(() => toggleVoiceRef.current(), 300);
      }
    };
    window.addEventListener("proofy:open", onOpen);
    return () => window.removeEventListener("proofy:open", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDock();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeDock]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = dockRef.current;
      if (el && !el.contains(e.target as Node)) closeDock();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, closeDock]);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  const applyFlowStep = useCallback((step: FlowStep) => {
    switch (step.type) {
      case "assistant_text":
        setMessages((m) => [...m, { id: uid(), role: "assistant", kind: "text", text: step.text }]);
        break;
      case "await_role":
        setAwaitingRole(true);
        break;
      case "performance_summary":
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: "assistant",
            kind: "performance_summary",
            overall: step.overall,
            strongest: step.strongest,
            needsWork: step.needsWork,
            focusLine: step.focusLine,
          },
        ]);
        break;
      case "training_cards":
        setMessages((m) => [
          ...m,
          { id: uid(), role: "assistant", kind: "training_cards", slugs: step.slugs },
        ]);
        break;
      case "mock_options":
        setMessages((m) => [...m, { id: uid(), role: "assistant", kind: "mock_options" }]);
        break;
      default:
        break;
    }
  }, []);

  const runFlow = useCallback(
    async (steps: FlowStep[]) => {
      setFlowRunning(true);
      try {
        for (const step of steps) {
          if (step.type === "navigate") {
            await sleep(1100);
            router.push(step.href);
            break;
          }
          if (step.type === "await_role") {
            applyFlowStep(step);
            break;
          }
          applyFlowStep(step);
          await sleep(step.type === "assistant_text" ? 520 : 360);
        }
      } finally {
        setFlowRunning(false);
      }
    },
    [applyFlowStep, router]
  );

  const handleRoleCaptured = useCallback(
    async (rawRole: string) => {
      const roleName = rawRole.trim();
      if (!roleName) return;
      setAwaitingRole(false);
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", kind: "text", text: "Perfect — let’s build something for that role." },
        { id: uid(), role: "assistant", kind: "story_role_card", roleName },
      ]);
      await sleep(850);
      router.push(`/storyboard/agent?role=${encodeURIComponent(roleName)}`);
    },
    [router]
  );

  const submitUserText = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed || flowRunning) return;
      setMessages((m) => [...m, { id: uid(), role: "user", kind: "text", text: trimmed }]);
      if (awaitingRole) {
        await handleRoleCaptured(trimmed);
        return;
      }
      const intent = classifyIntent(trimmed);
      const steps = buildFlowForIntent(intent);
      await runFlow(steps);
    },
    [runFlow, flowRunning, awaitingRole, handleRoleCaptured]
  );

  const toggleVoice = useCallback(() => {
    if (listeningRef.current) {
      stopListening();
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) return;

    dictationPrefixRef.current = message;
    dictationCommittedRef.current = "";

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang =
      typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

    rec.onresult = (event: WebSpeechResultEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const piece = r[0]?.transcript ?? "";
        if (r.isFinal) dictationCommittedRef.current += piece;
        else interim += piece;
      }
      setMessage(buildDictationMessage(interim));
    };

    rec.onerror = (ev: Event) => {
      const err = (ev as { error?: string }).error ?? "unknown";
      if (err === "aborted") return;
      if (err === "not-allowed") {
        listeningRef.current = false;
        setListening(false);
        recRef.current = null;
        return;
      }
      if (err === "no-speech" && listeningRef.current) {
        try {
          rec.start();
        } catch {
          /* already running */
        }
      }
    };

    rec.onend = () => {
      if (!listeningRef.current || recRef.current !== rec) return;
      window.setTimeout(() => {
        if (!listeningRef.current || recRef.current !== rec) return;
        try {
          rec.start();
        } catch {
          /* InvalidStateError */
        }
      }, 120);
    };

    try {
      rec.start();
      recRef.current = rec;
      listeningRef.current = true;
      setListening(true);
    } catch {
      listeningRef.current = false;
      setListening(false);
    }
  }, [message, stopListening, buildDictationMessage]);
  toggleVoiceRef.current = toggleVoice;

  const send = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessage("");
    void submitUserText(trimmed);
  }, [message, submitUserText]);

  const msgMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.38, ease: "easeOut" },
  } as const;

  function renderMessage(msg: ChatMsg) {
    if (msg.kind === "text") {
      const isUser = msg.role === "user";
      return (
        <motion.div
          key={msg.id}
          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          {...msgMotion}
        >
          <div
            className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-[1.55] ${
              isUser
                ? "rounded-br-sm text-white"
                : "rounded-bl-sm border border-slate-100 bg-white text-[#0F172A] shadow-sm"
            }`}
            style={isUser ? { background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)` } : undefined}
          >
            {msg.text}
          </div>
        </motion.div>
      );
    }

    if (msg.kind === "performance_summary") {
      return (
        <motion.div key={msg.id} className="flex justify-start" {...msgMotion}>
          <div className="w-full max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-100 bg-white p-3.5 shadow-sm">
            <div className="mb-2.5 flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-white text-[13px] font-bold tabular-nums"
                style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)` }}
              >
                {msg.overall}
              </span>
              <div>
                <p className="text-[12px] font-semibold text-[#0F172A]">Overall Score</p>
                <p className="text-[11px] text-slate-400">out of 10</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[12px] font-medium text-emerald-700">
                  Strongest: {msg.strongest.title}
                </span>
                <span className="ml-auto text-[11px] font-semibold text-emerald-600 tabular-nums">
                  {msg.strongest.score}/10
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[12px] font-medium text-amber-700">
                  Needs work: {msg.needsWork.title}
                </span>
                <span className="ml-auto text-[11px] font-semibold text-amber-600 tabular-nums">
                  {msg.needsWork.score}/10
                </span>
              </div>
            </div>
            <p className="mt-2.5 text-[11.5px] leading-[1.5] text-slate-500">{msg.focusLine}</p>
          </div>
        </motion.div>
      );
    }

    if (msg.kind === "training_cards") {
      const cards = msg.slugs.map((s) => trainingCardMeta(s)).filter(Boolean);
      return (
        <motion.div key={msg.id} className="flex justify-start" {...msgMotion}>
          <div className="flex flex-col gap-2 w-full max-w-[92%]">
            {cards.map((card) => (
              <button
                key={card!.href}
                type="button"
                onClick={() => { closeDock(); router.push(card!.href); }}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 text-left shadow-sm transition-colors hover:bg-slate-50"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${TEAL}14` }}
                >
                  <BookOpen className="h-3.5 w-3.5" style={{ color: TEAL }} strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#0F172A]">
                  {card!.title}
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
              </button>
            ))}
          </div>
        </motion.div>
      );
    }

    if (msg.kind === "mock_options") {
      const opts = [
        {
          id: "quick",
          label: "Quick: Action Pillar",
          duration: "12 min",
          href: "/mock/setup?pillar=action",
          icon: Zap,
          color: "#F59E0B",
        },
        {
          id: "full",
          label: "Full Practice",
          duration: "30 min",
          href: "/mock/setup",
          icon: Mic,
          color: TEAL,
        },
      ] as const;
      return (
        <motion.div key={msg.id} className="flex justify-start" {...msgMotion}>
          <div className="flex flex-col gap-2 w-full max-w-[92%]">
            {opts.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { closeDock(); router.push(opt.href); }}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 text-left shadow-sm transition-colors hover:bg-slate-50"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${opt.color}18` }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: opt.color }} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-[#0F172A]">{opt.label}</span>
                    <span className="text-[11px] text-slate-400">{opt.duration}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </motion.div>
      );
    }

    if (msg.kind === "story_role_card") {
      return (
        <motion.div key={msg.id} className="flex justify-start" {...msgMotion}>
          <div
            className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium shadow-sm"
            style={{
              background: `${TEAL}10`,
              borderColor: `${TEAL}30`,
              color: TEAL_DEEP,
            }}
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {msg.roleName}
          </div>
        </motion.div>
      );
    }

    return null;
  }

  const dockPositionClass =
    layout === "inline"
      ? "pointer-events-none relative z-auto w-full flex justify-center px-0 pb-0 pt-8"
      : "pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-4 md:pb-6";

  const closedBarClass =
    layout === "inline"
      ? "relative z-auto w-full flex justify-center rounded-[15px] px-0 pb-0 pt-8"
      : "fixed inset-x-0 bottom-0 z-[100] flex justify-center rounded-[15px] px-4 pb-4 md:pb-6 pointer-events-none";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label="Message Proofy"
            className={dockPositionClass}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <motion.div
              ref={dockRef}
              className="pointer-events-auto w-full max-w-3xl"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.99 }}
              transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.88 }}
            >
              <div
                className="relative overflow-hidden rounded-[24px] border-[0.5px] border-white"
                style={{ boxShadow: GLASS_SHADOW_OUT }}
              >
                <GlassChrome roundedClass="rounded-[24px]" />

                <div className="relative z-[1] flex flex-col gap-3 px-2 pb-2 pt-2">
                  <div className="flex items-start justify-between gap-2 px-1 pt-0.5">
                    <AnimatePresence mode="popLayout">
                      {messages.length === 0 ? (
                        <motion.div
                          key="chips"
                          className="flex min-w-0 flex-col gap-1.5 items-start"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.18 }}
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {EMPTY_STATE_CHIPS.slice(0, 2).map((c) => (
                              <SuggestionChip
                                key={c.label}
                                label={c.label}
                                disabled={flowRunning}
                                onClick={() => void submitUserText(c.sendText)}
                              />
                            ))}
                          </div>
                          {EMPTY_STATE_CHIPS[2] ? (
                            <SuggestionChip
                              key={EMPTY_STATE_CHIPS[2].label}
                              label={EMPTY_STATE_CHIPS[2].label}
                              disabled={flowRunning}
                              onClick={() => void submitUserText(EMPTY_STATE_CHIPS[2]!.sendText)}
                            />
                          ) : null}
                        </motion.div>
                      ) : (
                        <motion.span
                          key="title"
                          className="pl-0.5 text-[13px] font-semibold text-slate-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Proofy
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={closeDock}
                      className="proofy-dock-round-btn relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full outline-none transition-opacity hover:opacity-90"
                      aria-label="Close chat"
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-full bg-white/90 backdrop-blur-[17px]"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-[inherit]"
                        style={{ boxShadow: "inset -4px -4px 200px 0px rgba(255,255,255,0.02)" }}
                      />
                      <Maximize2 className="relative z-[1] h-4 w-4 text-slate-600" strokeWidth={2} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {messages.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ type: "spring", stiffness: 360, damping: 28 }}
                        className="overflow-hidden rounded-2xl border border-white/70 bg-white/35 shadow-sm backdrop-blur-md"
                      >
                        <div
                          ref={transcriptRef}
                          className="flex max-h-[280px] flex-col gap-3 overflow-y-auto px-3 py-3"
                          style={{ scrollbarWidth: "none" }}
                        >
                          {messages.map((msg) => renderMessage(msg))}
                          {flowRunning && (
                            <motion.div
                              className="flex justify-start"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                              <div className="flex items-center gap-[5px] rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-3.5 py-3 shadow-sm">
                                {[0, 0.32, 0.64].map((delay) => (
                                  <motion.span
                                    key={delay}
                                    className="h-2 w-2 rounded-full"
                                    style={{ background: TEAL_MIST }}
                                    animate={{
                                      backgroundColor: [TEAL_MIST, TEAL, TEAL_MIST],
                                      y: [0, -4, 0],
                                    }}
                                    transition={{
                                      duration: 1.6,
                                      repeat: Infinity,
                                      delay,
                                      ease: "easeInOut",
                                    }}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form
                    className="relative flex w-full items-center justify-between gap-3 py-1 pl-2 pr-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      send();
                    }}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <SparkleOrb />
                      <input
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        readOnly={listening || flowRunning}
                        placeholder={
                          awaitingRole
                            ? "Type the role (e.g. Product Manager)..."
                            : "Ask AI Coach"
                        }
                        aria-label="Message to Proofy"
                        className="h-11 min-w-0 flex-1 border-0 bg-transparent text-[16px] font-normal leading-none text-slate-600 outline-none placeholder:text-slate-500 read-only:opacity-95"
                      />
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {speechSupported ? (
                        <motion.button
                          type="button"
                          onClick={toggleVoice}
                          aria-label={listening ? "Stop voice input" : "Voice input"}
                          aria-pressed={listening}
                          className="proofy-dock-round-btn relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full outline-none transition-opacity"
                          style={{
                            color: listening ? TEAL : "#64748B",
                            boxShadow: listening ? `0 0 0 2px ${TEAL}33` : "none",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {!listening ? (
                            <span
                              aria-hidden
                              className="pointer-events-none absolute inset-0 rounded-full backdrop-blur-[17px]"
                            />
                          ) : null}
                          <Mic className="relative z-[1] h-4 w-4" strokeWidth={listening ? 2.25 : 2} />
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-[inherit]"
                            style={{ boxShadow: "inset -4px -4px 200px 0px rgba(255,255,255,0.02)" }}
                          />
                        </motion.button>
                      ) : null}

                      <motion.button
                        type="submit"
                        disabled={!message.trim() || flowRunning}
                        className="proofy-dock-round-btn relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-white/95 outline-none transition-opacity disabled:pointer-events-none disabled:opacity-40"
                        aria-label="Send message"
                        whileTap={{ scale: 0.94 }}
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-full backdrop-blur-[17px]"
                        />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-[-0.5px] rounded-[inherit]"
                          style={{ boxShadow: GLASS_INSET_HIGHLIGHT }}
                        />
                        <ArrowRight className="relative z-[1] h-4 w-4 text-slate-600" strokeWidth={2} />
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.div
            className={closedBarClass}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <div
              className={`relative mx-auto w-full overflow-hidden rounded-[122px] border-[0.5px] border-white ${layout === "floating" ? "max-w-[524px] pointer-events-auto" : ""}`}
              style={{ boxShadow: GLASS_SHADOW_OUT }}
            >
              <GlassChrome roundedClass="rounded-[122px]" />
              <div className="relative z-[1] flex items-center justify-between gap-2 py-2 pl-2.5 pr-1.5">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={open}
                  aria-label="Ask AI Coach"
                  className="flex min-w-0 flex-1 items-center gap-4 text-left outline-none"
                >
                  <SparkleOrb />
                  <span className="truncate font-sans text-[16px] font-normal leading-none text-slate-600">
                    Ask AI Coach
                  </span>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  {speechSupported ? (
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen(true);
                        window.setTimeout(() => toggleVoice(), 300);
                      }}
                      aria-label="Voice input"
                      className="proofy-dock-round-btn relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full outline-none transition-opacity hover:opacity-90"
                      whileTap={{ scale: 0.95 }}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-full backdrop-blur-[21px]"
                      />
                      <Mic className="relative z-[1] h-4 w-4 text-slate-600" strokeWidth={2} />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-[inherit]"
                        style={{ boxShadow: GLASS_INSET_HIGHLIGHT }}
                      />
                    </motion.button>
                  ) : null}

                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpen(true);
                    }}
                    aria-label="Open chat"
                    className="proofy-dock-round-btn relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-white/95 outline-none transition-opacity hover:opacity-95"
                    whileTap={{ scale: 0.95 }}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full backdrop-blur-[21px]"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-[-0.5px] rounded-[inherit]"
                      style={{ boxShadow: GLASS_INSET_HIGHLIGHT }}
                    />
                    <ArrowRight className="relative z-[1] h-4 w-4 text-slate-600" strokeWidth={2} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
