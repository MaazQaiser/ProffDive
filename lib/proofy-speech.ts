"use client";

/** `SpeechRecognition` result event — aligned with DOM `SpeechRecognitionResultList`. */
export type WebSpeechResultEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

export type WebSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: WebSpeechResultEvent) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export type WebSpeechRecognitionConstructor = new () => WebSpeechRecognition;

export function getSpeechRecognition(): WebSpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & {
    SpeechRecognition?: WebSpeechRecognitionConstructor;
    webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function normalize(t: string): string {
  return t
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Prefer longest keyword match to reduce ambiguity (e.g. “10 plus” vs “5”). */
export function matchVoiceOption<T extends string>(
  transcript: string,
  options: { id: T; keywords: string[] }[],
): T | null {
  const t = normalize(transcript);
  if (!t) return null;

  let best: { id: T; score: number } | null = null;

  for (const opt of options) {
    for (const kw of opt.keywords) {
      const k = normalize(kw);
      if (k.length < 2) continue;
      if (t.includes(k)) {
        const score = k.length;
        if (!best || score > best.score) best = { id: opt.id, score };
      }
    }
  }
  return best?.id ?? null;
}

export type VoiceRecognitionOpts = {
  cooldownMs?: number;
  /** Live text shown in UI (raw, includes interim). */
  onTranscript?: (text: string, hadFinal: boolean) => void;
  /** Called on recognition error (e.g. not-allowed, no-speech). */
  onError?: (message: string) => void;
};

export type VoiceOption = { id: string; keywords: string[] };

/**
 * Continuous listening: mic stays on, restarts after silence/errors.
 * Reports transcript for display; matches strongest on final phrases + rolling buffer.
 */
export function startContinuousRecognition(
  options: VoiceOption[],
  onMatch: (id: string) => void,
  opts?: VoiceRecognitionOpts,
): () => void {
  const SR = getSpeechRecognition();
  const cooldownMs = opts?.cooldownMs ?? 1100;
  const onTranscript = opts?.onTranscript;
  const onError = opts?.onError;

  if (!SR) {
    return () => {};
  }

  let buffer = "";
  let sessionFinal = "";
  let lastFire = 0;
  let stopped = false;

  const rec = new SR();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";

  const tryMatch = (snippet: string) => {
    const m = matchVoiceOption(snippet, options);
    if (m && Date.now() - lastFire > cooldownMs) {
      lastFire = Date.now();
      buffer = "";
      sessionFinal = "";
      onTranscript?.("", false);
      onMatch(m);
    }
  };

  rec.onresult = (e: WebSpeechResultEvent) => {
    let interim = "";
    let anyFinal = false;
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const line = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        anyFinal = true;
        sessionFinal += line;
        buffer += ` ${line}`;
      } else {
        interim += line;
      }
    }
    buffer = normalize(buffer).slice(-450);
    const display = `${sessionFinal}${interim}`.trim();
    onTranscript?.(display, anyFinal);
    tryMatch(display);
    tryMatch(sessionFinal);
    tryMatch(buffer);
  };

  rec.onend = () => {
    if (stopped) return;
    window.setTimeout(() => {
      if (stopped) return;
      try {
        rec.start();
      } catch {
        /* InvalidStateError: already started */
      }
    }, 120);
  };

  rec.onerror = (ev: Event) => {
    const err = (ev as { error?: string }).error ?? "unknown";
    if (err === "aborted") return;
    if (err === "not-allowed") {
      onError?.("Microphone blocked — allow mic for this site in your browser.");
      return;
    }
    // Silence / empty input — clear live transcript only.
    if (err === "no-speech") {
      onTranscript?.("", false);
      // fall through to restart
    } else if (
      // Chrome fires "network" for transient cloud-recognition issues; do not show as "You said" text.
      err === "network" ||
      err === "bad-grammar"
    ) {
      onTranscript?.("", false);
    } else {
      onError?.(`Voice: ${err}`);
    }
    if (stopped) return;
    window.setTimeout(() => {
      if (stopped) return;
      try {
        rec.start();
      } catch {
        /* */
      }
    }, 280);
  };

  try {
    rec.start();
  } catch {
    /* */
  }

  return () => {
    stopped = true;
    try {
      rec.abort();
    } catch {
      try {
        rec.stop();
      } catch {
        /* */
      }
    }
  };
}

/** Continuous dictation: append finalized phrases to a setter (role field). */
export function startContinuousDictation(
  onPhrase: (phrase: string) => void,
  onTranscript?: (text: string) => void,
): () => void {
  const SR = getSpeechRecognition();
  if (!SR) return () => {};

  let stopped = false;
  let sessionFinal = "";
  const rec = new SR();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";

  rec.onresult = (e: WebSpeechResultEvent) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const line = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        const t = line.trim();
        if (t) {
          sessionFinal += (sessionFinal ? " " : "") + t;
          onPhrase(t);
        }
      } else {
        interim += line;
      }
    }
    onTranscript?.(`${sessionFinal}${interim}`.trim());
  };

  rec.onend = () => {
    if (stopped) return;
    window.setTimeout(() => {
      if (stopped) return;
      try {
        rec.start();
      } catch {
        /* */
      }
    }, 100);
  };

  rec.onerror = () => {
    if (stopped) return;
    window.setTimeout(() => {
      if (stopped) return;
      try {
        rec.start();
      } catch {
        /* */
      }
    }, 300);
  };

  try {
    rec.start();
  } catch {
    /* */
  }

  return () => {
    stopped = true;
    try {
      rec.abort();
    } catch {
      try {
        rec.stop();
      } catch {
        /* */
      }
    }
  };
}
