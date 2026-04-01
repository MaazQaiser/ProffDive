"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Mic, Send, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpeechRecognition,
  type WebSpeechRecognition,
  type WebSpeechResultEvent,
} from "@/lib/proofy-speech";

const TEAL = "#0087A8";
const TEAL_DEEP = "#005f77";
const TEAL_LIGHT = "#67e8f9";
const TEAL_MIST = "#a5f3fc";

export function ProofyChatDock() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported] = useState(() => !!getSpeechRecognition());
  const inputRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<WebSpeechRecognition | null>(null);
  const baseRef = useRef("");

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 280);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = dockRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  const stopListening = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    recRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  const toggleVoice = useCallback(() => {
    if (listening) {
      stopListening();
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) return;
    baseRef.current = message;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang =
      typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

    rec.onresult = (event: WebSpeechResultEvent) => {
      let interim = "";
      let finals = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const piece = r[0]?.transcript ?? "";
        if (r.isFinal) finals += piece;
        else interim += piece;
      }
      const base = baseRef.current;
      const merged = `${base}${finals}${interim}`.replace(/\s{2,}/g, " ");
      setMessage(merged);
      if (finals) baseRef.current = `${base}${finals}`.replace(/\s{2,}/g, " ");
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [listening, message, stopListening]);

  const send = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessage("");
  }, [message]);

  const glowGradient = `linear-gradient(125deg, ${TEAL_DEEP} 0%, ${TEAL} 28%, ${TEAL_LIGHT} 72%, ${TEAL_MIST} 100%)`;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Message Proofy"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-8 md:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <motion.div
              ref={dockRef}
              className="pointer-events-auto w-full max-w-[540px]"
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
              <motion.div
                className="relative rounded-full p-[11px]"
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
                <form
                  className="flex items-center gap-1 rounded-full bg-white py-3 pl-5 pr-3 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]"
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
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full outline-none transition-colors"
                      style={{
                        color: listening ? TEAL : "rgba(15, 23, 42, 0.42)",
                        background: listening ? `${TEAL}14` : "transparent",
                        boxShadow: listening ? `0 0 0 2px ${TEAL}44` : "none",
                      }}
                      whileTap={{ scale: 0.94 }}
                    >
                      <Mic
                        className="h-[22px] w-[22px]"
                        strokeWidth={listening ? 2.25 : 2}
                      />
                    </motion.button>
                  )}

                  <input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    aria-label="Message to Proofy"
                    className="min-w-0 flex-1 border-0 bg-transparent py-1 text-[16px] leading-snug outline-none placeholder:text-[#64748B]"
                    style={{ color: "#0F172A" }}
                  />

                  <div className="relative flex shrink-0 items-center justify-center pr-1">
                    <motion.span
                      className="pointer-events-none absolute -right-0.5 -top-2 flex gap-0.5"
                      aria-hidden
                      animate={{ opacity: [0.85, 1, 0.85], y: [0, -2, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                        style={{ color: TEAL, fill: `${TEAL}22` }}
                      />
                      <Sparkles
                        className="h-2.5 w-2.5 -translate-y-0.5"
                        strokeWidth={2}
                        style={{ color: TEAL_LIGHT, fill: `${TEAL_LIGHT}33` }}
                      />
                    </motion.span>
                    <motion.button
                      type="submit"
                      disabled={!message.trim()}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-[#0F172A]/55 transition-colors hover:bg-[#0F172A]/[0.05] hover:text-[#0F172A] disabled:pointer-events-none disabled:opacity-35"
                      aria-label="Send message"
                      whileTap={{ scale: 0.92 }}
                    >
                      <Send className="h-[22px] w-[22px]" strokeWidth={2} />
                    </motion.button>
                  </div>
                </form>
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
