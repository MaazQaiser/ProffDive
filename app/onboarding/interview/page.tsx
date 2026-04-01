"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  "Tell me a bit about yourself and what you're currently working toward.",
  "What kind of role are you preparing for right now, and what's pulling you in that direction?",
  "Tell me about a project, internship, or piece of work you're genuinely proud of.",
  "What was your specific role in that, and what did you personally drive?",
  "When it comes to interviews, what usually feels hardest for you?",
] as const;

function MicStatusPanel({ onCycleComplete }: { onCycleComplete: () => void }) {
  const [micState, setMicState] = useState<"Listening" | "Processing">("Listening");
  const cbRef = useRef(onCycleComplete);

  useLayoutEffect(() => {
    cbRef.current = onCycleComplete;
  });

  useEffect(() => {
    let processingTimer: ReturnType<typeof setTimeout>;
    const voiceTimer = setTimeout(() => {
      setMicState("Processing");
      processingTimer = setTimeout(() => {
        cbRef.current();
      }, 3000);
    }, 12000);
    return () => {
      clearTimeout(voiceTimer);
      if (processingTimer) clearTimeout(processingTimer);
    };
  }, []);

  return (
    <div className="w-full md:w-80 h-80 border border-divider flex items-center justify-center p-4 relative group shrink-0">
      <div className="absolute top-2 left-2 flex items-baseline gap-2">
        <span
          className={`h-2 w-2 rounded-none ${micState === "Listening" ? "bg-status-ready animate-pulse" : "bg-status-star"}`}
        />
        <span className="text-[12px] tracking-widest uppercase text-muted">{micState}...</span>
      </div>
      <div className="text-muted text-xs tracking-widest uppercase">Your Camera</div>

      {micState === "Processing" && (
        <div className="absolute bottom-0 left-0 h-1 bg-status-star animate-pulse" style={{ width: "100%" }} />
      )}
    </div>
  );
}

export default function LiveInterview() {
  const router = useRouter();
  const [time, setTime] = useState(0);
  const [qIndex, setQIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime((c) => c + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-medium overflow-hidden">
      <header className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-divider">
        <div className="text-xl font-medium tracking-tight">ProofDive</div>
        <div className="flex gap-8 items-center text-sm">
          <span className="text-muted tracking-widest uppercase">
            Q {qIndex + 1} / {QUESTIONS.length}
          </span>
          <span className="font-mono">{formatTime(time)}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-6 md:p-12 gap-8 lg:gap-16 items-center lg:items-center">
        <div className="flex-1 space-y-6 md:max-w-2xl text-left border-l-[3px] border-foreground pl-6 lg:ml-[10%] mb-12 lg:mb-0 relative">
          <p className="text-sm tracking-widest uppercase text-muted mb-4">AI Interviewer</p>
          <AnimatePresence mode="wait">
            <motion.h2
              key={qIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl md:text-4xl leading-tight font-medium w-full text-balance"
            >
              <span aria-hidden>&ldquo;</span>
              {QUESTIONS[qIndex]}
              <span aria-hidden>&rdquo;</span>
            </motion.h2>
          </AnimatePresence>
        </div>

        <MicStatusPanel
          key={qIndex}
          onCycleComplete={() => {
            if (qIndex < QUESTIONS.length - 1) setQIndex((prev) => prev + 1);
            else router.push("/onboarding/processing");
          }}
        />
      </main>

      <footer className="border-t border-divider px-6 md:px-12 py-6 flex justify-between items-center text-xs tracking-widest uppercase text-muted">
        <span>Auto-progress active. Speak naturally.</span>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => {
              if (qIndex < QUESTIONS.length - 1) setQIndex((prev) => prev + 1);
              else router.push("/onboarding/processing");
            }}
            className="uppercase tracking-widest transition-colors font-medium border border-divider px-4 py-2 hover:bg-surface-alt text-foreground"
          >
            Skip to Next (Demo) ⏭
          </button>
          <span>End Interview ⏹</span>
        </div>
      </footer>
    </div>
  );
}
