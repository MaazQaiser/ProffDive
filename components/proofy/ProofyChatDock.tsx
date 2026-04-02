"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, Mic, Send, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 280);
    return () => window.clearTimeout(t);
  }, [open]);

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
    setMessages([]);
  }, [stopListening]);

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
          applyFlowStep(step);
          await sleep(step.type === "assistant_text" ? 520 : 360);
        }
      } finally {
        setFlowRunning(false);
      }
    },
    [applyFlowStep, router]
  );

  const submitUserText = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed || flowRunning) return;
      setMessages((m) => [...m, { id: uid(), role: "user", kind: "text", text: trimmed }]);
      const intent = classifyIntent(trimmed);
      const steps = buildFlowForIntent(intent);
      await runFlow(steps);
    },
    [runFlow, flowRunning]
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
            aria-modal="true"
            aria-label="Message Proofy"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-6 md:px-8 md:pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <motion.div
              ref={dockRef}
              className="pointer-events-auto flex w-full max-w-[540px] flex-col gap-3"
              initial={{ y: "130%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "50%", opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 28,
                mass: 0.88,
              }}
            >
              {/* Connected chat widget (transcript + input in one card) */}
              <motion.div
                className="relative rounded-[28px] p-[10px]"
                style={{
                  background: glowGradient,
                  boxShadow: `
                    0 22px 56px rgba(0, 95, 119, 0.28),
                    0 8px 24px rgba(0, 135, 168, 0.22),
                    inset 0 1px 0 rgba(255, 255, 255, 0.45),
                    inset 0 -1px 0 rgba(0, 60, 80, 0.12)
                  `,
                }}
                animate={{
                  boxShadow: [
                    `0 22px 56px rgba(0, 95, 119, 0.28), 0 8px 24px rgba(0, 135, 168, 0.22), 0 0 40px rgba(0, 135, 168, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 0 rgba(0, 60, 80, 0.12)`,
                    `0 26px 64px rgba(0, 95, 119, 0.34), 0 10px 32px rgba(0, 135, 168, 0.3), 0 0 52px rgba(103, 232, 249, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 60, 80, 0.12)`,
                    `0 22px 56px rgba(0, 95, 119, 0.28), 0 8px 24px rgba(0, 135, 168, 0.22), 0 0 40px rgba(0, 135, 168, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 0 rgba(0, 60, 80, 0.12)`,
                  ],
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="overflow-hidden rounded-[22px] border border-white/60 bg-white/[0.96] shadow-[0_8px_40px_rgba(15,23,42,0.10)] backdrop-blur-md">
                  <div
                    ref={transcriptRef}
                    aria-label="Proofy conversation"
                    className="max-h-[min(46vh,400px)] overflow-y-auto overscroll-contain px-4 py-3"
                  >
                    {messages.length === 0 && (
                      <div className="mb-2 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                        <p className="w-full text-[12px] font-medium text-[#64748B]">
                          Try one of these
                        </p>
                        {EMPTY_STATE_CHIPS.map((c) => (
                          <button
                            key={c.label}
                            type="button"
                            disabled={flowRunning}
                            onClick={() => void submitUserText(c.sendText)}
                            className="rounded-full border border-[#0087A8]/25 bg-[#0087A8]/[0.06] px-3 py-1.5 text-left text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#0087A8]/10 disabled:opacity-50"
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {messages.map((msg) => {
                    if (msg.role === "user" && msg.kind === "text") {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div
                            className="max-w-[92%] rounded-2xl rounded-br-md px-3.5 py-2 text-[15px] leading-snug text-white"
                            style={{ background: TEAL }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    }
                    if (msg.role === "assistant" && msg.kind === "text") {
                      return (
                        <div key={msg.id} className="flex justify-start">
                          <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-slate-100 bg-slate-50/90 px-3.5 py-2 text-[15px] leading-relaxed text-[#0F172A]">
                            {msg.text}
                          </div>
                        </div>
                      );
                    }
                    if (msg.role === "assistant" && msg.kind === "performance_summary") {
                      return (
                        <div key={msg.id} className="flex justify-start">
                          <div
                            className="max-w-[92%] space-y-2 rounded-2xl border border-[#0087A8]/20 bg-gradient-to-br from-[#f0fdfa]/90 to-white px-3.5 py-3 text-[14px]"
                            style={{ color: "#0F172A" }}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0087A8]">
                              Latest session
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[13px]">
                              <div>
                                <p className="text-[11px] text-[#64748B]">Overall</p>
                                <p className="text-[18px] font-semibold tabular-nums">{msg.overall}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-[#64748B]">Strongest</p>
                                <p className="font-medium">
                                  {msg.strongest.title}{" "}
                                  <span className="tabular-nums text-[#64748B]">
                                    ({msg.strongest.score})
                                  </span>
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[11px] text-[#64748B]">Needs work</p>
                                <p className="font-medium">
                                  {msg.needsWork.title}{" "}
                                  <span className="tabular-nums text-[#64748B]">
                                    ({msg.needsWork.score})
                                  </span>
                                </p>
                              </div>
                            </div>
                            <p className="border-t border-[#0087A8]/10 pt-2 text-[13px] leading-snug text-[#334155]">
                              {msg.focusLine}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    if (msg.role === "assistant" && msg.kind === "training_cards") {
                      return (
                        <div key={msg.id} className="flex flex-col gap-2">
                          {msg.slugs.map((slug) => {
                            const meta = trainingCardMeta(slug);
                            if (!meta) return null;
                            return (
                              <Link
                                key={slug}
                                href={meta.href}
                                className="block rounded-xl border border-[#0087A8]/25 bg-white px-3.5 py-3 text-left shadow-sm transition-colors hover:bg-[#0087A8]/[0.04]"
                              >
                                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#0087A8]">
                                  Training
                                </p>
                                <p className="text-[15px] font-semibold text-[#0F172A]">{meta.title}</p>
                                <p className="mt-1 text-[12px] text-[#64748B]">Open module →</p>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    }
                    if (msg.role === "assistant" && msg.kind === "mock_options") {
                      return (
                        <div key={msg.id} className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => router.push("/mock/setup?mode=full")}
                            className="rounded-xl border border-[#0087A8]/25 bg-white px-3.5 py-3 text-left shadow-sm transition-colors hover:bg-[#0087A8]/[0.04]"
                          >
                            <p className="text-[15px] font-semibold text-[#0F172A]">
                              Full Session Interview
                            </p>
                            <p className="mt-1 text-[13px] text-[#64748B]">
                              Complete mock across all focus areas
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push("/mock/setup?mode=specific")}
                            className="rounded-xl border border-[#0087A8]/25 bg-white px-3.5 py-3 text-left shadow-sm transition-colors hover:bg-[#0087A8]/[0.04]"
                          >
                            <p className="text-[15px] font-semibold text-[#0F172A]">
                              Specific Practice
                            </p>
                            <p className="mt-1 text-[13px] text-[#64748B]">
                              Targeted prep on selected pillars
                            </p>
                          </button>
                        </div>
                      );
                    }
                    return null;
                      })}
                    </div>
                  </div>

                  <form
                    className="flex items-center gap-2 border-t border-slate-100 bg-white/90 px-4 py-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      send();
                    }}
                  >
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

                    <div className="relative min-w-0 flex-1">
                      <input
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        readOnly={listening || flowRunning}
                        placeholder="Ask Proofy what to do next…"
                        aria-label="Message to Proofy"
                        className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-[15px] outline-none placeholder:text-[#94A3B8] focus:border-[#0087A8]/50 focus:ring-2 focus:ring-[#0087A8]/10 read-only:opacity-95"
                        style={{ color: "#0F172A" }}
                      />
                      <motion.span
                        className="pointer-events-none absolute right-3 top-1.5 flex gap-0.5"
                        aria-hidden
                        animate={{ opacity: [0.75, 1, 0.75], y: [0, -1, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles
                          className="h-3.5 w-3.5"
                          strokeWidth={2}
                          style={{ color: TEAL, fill: `${TEAL}22` }}
                        />
                      </motion.span>
                    </div>

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
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.div
            className="fixed bottom-6 right-6 z-[100]"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2.5 rounded-full px-5 py-3 text-[14px] font-semibold text-white shadow-lg outline-none ring-2 ring-white/30"
              style={{
                background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
                boxShadow: `0 12px 40px ${TEAL}66, 0 0 0 1px rgba(255,255,255,0.15) inset`,
              }}
              whileHover={{ scale: 1.03, boxShadow: `0 16px 48px ${TEAL}77` }}
              whileTap={{ scale: 0.97 }}
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              <motion.span
                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2} />
              </motion.span>
              Talk to Proofy
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
