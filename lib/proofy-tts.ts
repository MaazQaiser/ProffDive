"use client";

export type SpeakOpts = {
  /** Default ~0.72 — slow, easy to follow */
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
};

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const byName = (re: RegExp) => voices.find((v) => re.test(v.name));
  return (
    byName(/Samantha|Karen|Moira|Victoria|Tessa|Fiona|Allison/i) ||
    byName(/Google US English|Google UK English Female/i) ||
    voices.find((v) => v.lang === "en-US" && /Premium|Enhanced|Natural/i.test(v.name)) ||
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en-GB")) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null
  );
}

/**
 * Speak Proofy lines. Unlocks `speechSynthesis` (resume), waits for voices when needed,
 * uses a natural English voice when available. Slow default rate for readability.
 */
export function speakProofy(text: string, opts?: SpeakOpts): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const rate = opts?.rate ?? 0.72;

  let started = false;
  const run = () => {
    if (started) return;
    started = true;

    const ss = window.speechSynthesis;
    ss.cancel();
    try {
      ss.resume();
    } catch {
      /* some browsers throw if not paused */
    }

    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 1;
    u.volume = 1;
    const voice = pickVoice();
    if (voice) u.voice = voice;

    u.onstart = () => opts?.onStart?.();
    u.onend = () => opts?.onEnd?.();
    u.onerror = () => opts?.onEnd?.();

    ss.speak(u);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    run();
    return;
  }

  window.speechSynthesis.addEventListener("voiceschanged", run, { once: true });
  window.setTimeout(run, 500);
}

export function cancelProofySpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function ensureVoicesLoaded(cb: () => void): void {
  if (typeof window === "undefined") return;
  const ss = window.speechSynthesis;
  if (ss.getVoices().length) {
    cb();
    return;
  }
  ss.addEventListener("voiceschanged", () => cb(), { once: true });
}
