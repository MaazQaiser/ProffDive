"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, Mic, Send, Sparkles, X } from "lucide-react";
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

export function ProofyChatDock() {
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
      const detail = (e as CustomEvent<{ open?: boolean; messages?: string[] }>).detail;
      if (!detail) return;
      if (detail.open) setOpen(true);
      const incoming = detail.messages ?? [];
      if (incoming.length > 0) {
        setMessages((m) => [
          ...m,
          ...incoming.map((text) => ({ id: uid(), role: "assistant", kind: "text", text }) as ChatMsg),
        ]);
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
        { id: uid(), role: "assistant", kind: "text", text: "Ok — let’s craft a story for that role." },
        { id: uid(), role: "assistant", kind: "story_role_card", roleName },
      ]);
      await sleep(850);
      router.push(`/storyboard/new?role=${encodeURIComponent(roleName)}`);
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

  const send = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessage("");
    void submitUserText(trimmed);
  }, [message, submitUserText]);

  const glowGradient = `linear-gradient(125deg, ${TEAL_DEEP} 0%, ${TEAL} 28%, ${TEAL_LIGHT} 72%, ${TEAL_MIST} 100%)`;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label="Message Proofy"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-4 md:pb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <motion.div
              ref={dockRef}
              className="pointer-events-auto flex w-full max-w-3xl flex-col gap-3"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.99 }}
              transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.88 }}
            >
              {/* Just the 3 chip badges (no header, no panel background) */}
              <div className="pointer-events-auto">
                <div className="flex flex-wrap justify-start gap-2">
                  {EMPTY_STATE_CHIPS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      disabled={flowRunning}
                      onClick={() => void submitUserText(c.sendText)}
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-[#0F172A] shadow-[0_10px_30px_rgba(15,23,42,0.10)] transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keep the bottom "input" bar visible as the composer */}
              <form
                className="flex w-full items-center gap-2 overflow-hidden rounded-[9999px] border border-slate-200 bg-white/90 px-3 py-2 shadow-[0_10px_40px_rgba(15,23,42,0.10)] backdrop-blur-md"
                style={{ borderRadius: 9999 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
                    boxShadow: `0 10px 26px ${TEAL}33`,
                  }}
                  aria-hidden
                >
                  <MessageCircle className="h-5 w-5 text-white" strokeWidth={2} />
                </span>

                <div className="relative min-w-0 flex-1">
                  <input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    readOnly={listening || flowRunning}
                    placeholder={
                      awaitingRole ? "Type the role (e.g. Product Manager)..." : "Talk to Proofy"
                    }
                    aria-label="Message to Proofy"
                    className="h-11 w-full rounded-full border border-transparent bg-transparent px-2 text-[15px] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0087A8]/10 read-only:opacity-95"
                    style={{ color: "#0F172A" }}
                  />
                  <motion.span
                    className="pointer-events-none absolute right-2 top-2 flex gap-0.5"
                    aria-hidden
                    animate={{ opacity: [0.75, 1, 0.75], y: [0, -1, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles
                      className="h-4 w-4"
                      strokeWidth={2}
                      style={{ color: TEAL, fill: `${TEAL}22` }}
                    />
                  </motion.span>
                </div>

                {speechSupported && (
                  <motion.button
                    type="button"
                    onClick={toggleVoice}
                    aria-label={listening ? "Stop voice input" : "Voice input"}
                    aria-pressed={listening}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full outline-none transition-colors"
                    style={{
                      color: listening ? TEAL : "rgba(15, 23, 42, 0.42)",
                      background: listening ? `${TEAL}14` : "transparent",
                      boxShadow: listening ? `0 0 0 2px ${TEAL}33` : "none",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic className="h-[20px] w-[20px]" strokeWidth={listening ? 2.25 : 2} />
                  </motion.button>
                )}

                <motion.button
                  type="submit"
                  disabled={!message.trim() || flowRunning}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Send message"
                  style={{ background: TEAL }}
                  whileTap={{ scale: 0.94 }}
                >
                  <Send className="h-[18px] w-[18px]" strokeWidth={2.25} />
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[100] flex justify-center rounded-[15px] px-4 pb-4 md:pb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label="Talk to Proofy"
              className="group flex w-full max-w-3xl items-center gap-3 overflow-hidden rounded-[9999px] border border-slate-200 bg-white/90 px-4 py-3 text-left shadow-[0_10px_40px_rgba(15,23,42,0.10)] backdrop-blur-md outline-none transition-colors hover:bg-white"
              style={{ borderRadius: 9999 }}
              whileTap={{ scale: 0.995 }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
                  boxShadow: `0 10px 26px ${TEAL}33`,
                }}
                aria-hidden
              >
                <MessageCircle className="h-5 w-5 text-white" strokeWidth={2} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] text-[#94A3B8]">
                  Talk to Proofy
                </span>
              </span>

              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors group-hover:bg-slate-50"
                aria-hidden
              >
                <Send className="h-4 w-4" strokeWidth={2.25} />
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
