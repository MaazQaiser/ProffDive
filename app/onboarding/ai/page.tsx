"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Mic, Zap } from "lucide-react";
import { JdResumeInput } from "@/components/JdResumeInput";
import { ProofyOrb } from "@/components/proofy/ProofyOrb";
import { TypewriterLine } from "@/components/proofy/TypewriterLine";
import { MicStatusBar } from "@/components/proofy/MicStatusBar";
import { VoiceTranscript } from "@/components/proofy/VoiceTranscript";
import { useUser } from "@/lib/user-context";
import {
  EXP_BRACKET_OPTIONS,
  GUIDANCE_LINES,
  INTRO_LINES,
  JOURNEY_TRACK_CHOICE_LINE,
  JOURNEY_WIDGETS,
  QUALIFICATION_OPTIONS,
  type ExpBracket,
  type ProofyPhase,
  type QualificationId,
} from "@/lib/proofy-script";
import {
  startContinuousDictation,
  startContinuousRecognition,
  type VoiceOption,
} from "@/lib/proofy-speech";
import { cancelProofySpeech, ensureVoicesLoaded, speakProofy } from "@/lib/proofy-tts";

const TEAL = "#0087A8";

/** Slower typewriter + TTS so voice and text stay aligned (ms per character). */
const SCRIPT_TYPEWRITER_MS = 92;
const SCRIPT_TTS_RATE = 0.58 as const;

/** Matches dashboard new-user action cards (`app/(app)/dashboard/page.tsx`). */
const journeyCardGlass: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
  borderRadius: 12,
};

const Q_VOICE: VoiceOption[] = QUALIFICATION_OPTIONS.map((o) => ({ id: o.id, keywords: o.voice }));
const E_VOICE: VoiceOption[] = EXP_BRACKET_OPTIONS.map((o) => ({ id: o.id, keywords: o.voice }));
/** Track picks + “continue” to save profile and open the next step (/consent). */
const JOURNEY_STEP_VOICE: VoiceOption[] = [
  ...JOURNEY_WIDGETS.map((w) => ({ id: w.id, keywords: w.voice })),
  { id: "continue_setup", keywords: ["continue", "next step", "finish setup", "next page"] },
];
const RESUME_VOICE: VoiceOption[] = [
  {
    id: "upload",
    keywords: ["upload", "attach", "add resume", "add my resume", "job description", "add jd", "pasting", "yes"],
  },
  { id: "skip", keywords: ["skip", "later", "no thanks", "not now", "no", "pass"] },
];
const YES_CONTINUE: VoiceOption[] = [
  {
    id: "next",
    keywords: ["yes", "yeah", "yep", "continue", "next", "okay", "ok", "sure", "go ahead", "proceed", "let's go", "lets go"],
  },
];

/** Flat, centered copy — no card background */
function FlatCopy({ children, showLabel = true }: { children: React.ReactNode; showLabel?: boolean }) {
  return (
    <div className="w-full max-w-2xl mx-auto px-3 text-center">
      {showLabel && (
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#0087A8] mb-5">Proofy</p>
      )}
      <div className="text-2xl sm:text-3xl md:text-[2rem] font-bold leading-snug text-[#0F172A] tracking-tight">{children}</div>
    </div>
  );
}

/** Plain layout wrapper — no panel background */
function OptionsStack({ children }: { children: React.ReactNode }) {
  return <div className="w-full space-y-3">{children}</div>;
}

function journeyTrackIcon(id: string) {
  switch (id) {
    case "practice_prep":
      return <Zap size={18} className="text-[#0087A8]" />;
    case "storyboard":
      return <BookOpen size={18} className="text-[#10B981]" />;
    case "mock":
      return <Mic size={18} className="text-[#F59E0B]" />;
    default:
      return null;
  }
}

function journeyIconWrapClass(id: string) {
  switch (id) {
    case "practice_prep":
      return "bg-[#0087A8]/10";
    case "storyboard":
      return "bg-[#10B981]/10";
    case "mock":
      return "bg-[#F59E0B]/10";
    default:
      return "bg-slate-100";
  }
}

function mapCareer(q: QualificationId): string {
  switch (q) {
    case "undergrad":
      return "undergrad";
    case "postgrad":
      return "postgraduate";
    case "graduate":
      return "graduate";
    case "diploma-holder":
      return "diploma-holder";
    case "experienced":
      return "experienced";
    default:
      return "undergrad";
  }
}

export default function ProofyOnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();

  const [phase, setPhase] = useState<ProofyPhase>("hero");
  const [introLine, setIntroLine] = useState(0);
  const [introReady, setIntroReady] = useState(false);
  const [guidanceLine, setGuidanceLine] = useState(0);
  const [guidanceReady, setGuidanceReady] = useState(false);

  const [qualification, setQualification] = useState<QualificationId | null>(null);
  const [bracket, setBracket] = useState<ExpBracket | null>(null);
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [role, setRole] = useState("");

  const [speechHint, setSpeechHint] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const roleAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onTtsStart = useCallback(() => setTtsSpeaking(true), []);
  const onTtsEnd = useCallback(() => setTtsSpeaking(false), []);

  const goPhase = useCallback((next: ProofyPhase) => {
    setVoiceTranscript("");
    setPhase(next);
  }, []);

  useEffect(() => {
    ensureVoicesLoaded(() => {});
  }, []);

  const micChoicePhase = useMemo(
    () => ["intro", "qualification", "experience_years", "resume", "journey"] as ProofyPhase[],
    [],
  );
  const micDictationPhase = phase === "target_role";
  const showMicBar = micChoicePhase.includes(phase) || micDictationPhase;
  const showVoiceTranscript = showMicBar && (phase !== "intro" || introReady);

  const ttsOpts = useMemo(
    () => ({ rate: 0.72 as const, onStart: onTtsStart, onEnd: onTtsEnd }),
    [onTtsStart, onTtsEnd],
  );

  /* TTS: intro lines — advance only when audio finishes (typewriter does not drive the line index). */
  useEffect(() => {
    if (phase !== "intro" || introReady) return;
    if (introLine === 0) cancelProofySpeech();
    speakProofy(INTRO_LINES[introLine], {
      rate: SCRIPT_TTS_RATE,
      onStart: onTtsStart,
      onEnd: () => {
        onTtsEnd();
        setIntroLine((n) => {
          if (n < INTRO_LINES.length - 1) return n + 1;
          setIntroReady(true);
          return n;
        });
      },
    });
  }, [phase, introLine, introReady, onTtsStart, onTtsEnd]);

  /* TTS: guidance lines — same chaining as intro */
  useEffect(() => {
    if (phase !== "guidance" || guidanceReady) return;
    if (guidanceLine === 0) cancelProofySpeech();
    speakProofy(GUIDANCE_LINES[guidanceLine], {
      rate: SCRIPT_TTS_RATE,
      onStart: onTtsStart,
      onEnd: () => {
        onTtsEnd();
        setGuidanceLine((n) => {
          if (n < GUIDANCE_LINES.length - 1) return n + 1;
          setGuidanceReady(true);
          return n;
        });
      },
    });
  }, [phase, guidanceLine, guidanceReady, onTtsStart, onTtsEnd]);

  /* TTS: main script per phase (not intro/guidance/hero) */
  useEffect(() => {
    if (phase === "hero" || phase === "intro" || phase === "guidance") return;
    cancelProofySpeech();
    const script: Partial<Record<ProofyPhase, string>> = {
      qualification: "Tell me where you are in your journey.",
      experience_years: "How many years of experience do you have?",
      target_role:
        "Which role are you preparing for? Say it out loud, or type it in the field below.",
      resume:
        "Would you like to add a resume or a job description? Both are optional — they help personalize your path. Say upload if you are adding one, or skip to continue.",
      journey: `You're onboarded. ${JOURNEY_TRACK_CHOICE_LINE} Tap a card to open a module, say the track name, or say continue to go to the next step.`,
    };
    const t = script[phase];
    if (t) speakProofy(t, ttsOpts);
  }, [phase, ttsOpts]);

  /* Voice: say yes to continue after intro lines */
  const handleIntroYes = useCallback(() => {
    cancelProofySpeech();
    setTtsSpeaking(false);
    goPhase("qualification");
  }, [goPhase]);

  useEffect(() => {
    if (phase !== "intro" || !introReady) return;
    return startContinuousRecognition(YES_CONTINUE, handleIntroYes, {
      cooldownMs: 1400,
      onTranscript: (t) => setVoiceTranscript(t),
      onError: (msg) => setVoiceTranscript(msg),
    });
  }, [phase, introReady, handleIntroYes]);

  const handleQualificationVoice = useCallback((id: string) => {
    setQualification(id as QualificationId);
    setSpeechHint(null);
    if (id === "experienced") goPhase("experience_years");
    else {
      setBracket(null);
      goPhase("target_role");
    }
  }, [goPhase]);

  const handleExpVoice = useCallback((id: string) => {
    setBracket(id as ExpBracket);
    goPhase("target_role");
  }, [goPhase]);

  const handleResumeVoice = useCallback((id: string) => {
    if (id === "skip") {
      setResume("");
      setJd("");
      goPhase("guidance");
      setGuidanceLine(0);
      setGuidanceReady(false);
    } else {
      setSpeechHint("Paste or upload in the boxes above, then tap Continue.");
    }
  }, [goPhase]);

  const saveOnboardingProfile = useCallback(() => {
    if (!qualification) return;
    updateUser({
      name: user.name ?? "",
      career: mapCareer(qualification),
      bracket: qualification === "experienced" ? bracket : null,
      role: role.trim(),
      industry: "",
      jd: jd.trim(),
      resume,
      onboarded: true,
    });
  }, [qualification, bracket, role, jd, resume, user.name, updateUser]);

  const persistAndGo = useCallback(
    (href: string) => {
      if (!qualification) return;
      saveOnboardingProfile();
      cancelProofySpeech();
      setTtsSpeaking(false);
      router.push(href);
    },
    [qualification, saveOnboardingProfile, router],
  );

  const goToNextPageAfterJourney = useCallback(() => {
    if (!qualification) return;
    saveOnboardingProfile();
    cancelProofySpeech();
    setTtsSpeaking(false);
    router.push("/consent");
  }, [qualification, saveOnboardingProfile, router]);

  const handleJourneyVoice = useCallback(
    (id: string) => {
      setSpeechHint(null);
      if (id === "continue_setup") {
        goToNextPageAfterJourney();
        return;
      }
      const w = JOURNEY_WIDGETS.find((x) => x.id === id);
      if (!w) return;
      persistAndGo(w.href);
    },
    [persistAndGo, goToNextPageAfterJourney],
  );

  useEffect(() => {
    if (phase !== "qualification") return;
    return startContinuousRecognition(Q_VOICE, handleQualificationVoice, {
      onTranscript: (t) => setVoiceTranscript(t),
      onError: (msg) => setVoiceTranscript(msg),
    });
  }, [phase, handleQualificationVoice]);

  useEffect(() => {
    if (phase !== "experience_years") return;
    return startContinuousRecognition(E_VOICE, handleExpVoice, {
      onTranscript: (t) => setVoiceTranscript(t),
      onError: (msg) => setVoiceTranscript(msg),
    });
  }, [phase, handleExpVoice]);

  useEffect(() => {
    if (phase !== "resume") return;
    return startContinuousRecognition(RESUME_VOICE, handleResumeVoice, {
      onTranscript: (t) => setVoiceTranscript(t),
      onError: (msg) => setVoiceTranscript(msg),
    });
  }, [phase, handleResumeVoice]);

  useEffect(() => {
    if (phase !== "journey") return;
    return startContinuousRecognition(JOURNEY_STEP_VOICE, handleJourneyVoice, {
      cooldownMs: 1300,
      onTranscript: (t) => setVoiceTranscript(t),
      onError: (msg) => setVoiceTranscript(msg),
    });
  }, [phase, handleJourneyVoice]);

  useEffect(() => {
    if (phase !== "target_role") return;
    const stop = startContinuousDictation(
      (phrase) => {
        const trimmed = phrase.trim();
        if (!trimmed) return;
        setRole((r) => {
          const next = r.trim() ? `${r.trim()} ${trimmed}` : trimmed;
          if (roleAdvanceTimerRef.current) clearTimeout(roleAdvanceTimerRef.current);
          roleAdvanceTimerRef.current = setTimeout(() => {
            roleAdvanceTimerRef.current = null;
            if (next.trim().length >= 2) goPhase("resume");
          }, 1500);
          return next;
        });
      },
      (t) => setVoiceTranscript(t),
    );
    return () => {
      if (roleAdvanceTimerRef.current) {
        clearTimeout(roleAdvanceTimerRef.current);
        roleAdvanceTimerRef.current = null;
      }
      stop();
    };
  }, [phase, goPhase]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#F0FBFD] via-[#E8F4F8] to-[#CFDCE1] font-sans">
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/40 bg-white/30 backdrop-blur-md">
        <Link href="/login" className="text-[13px] text-[#64748B] hover:text-[#0087A8]">
          ← Back
        </Link>
        <span className="text-[15px] font-semibold text-[#253D47]">ProofDive · Proofy</span>
        <span className="w-12" aria-hidden />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-36 pt-4 max-w-3xl mx-auto w-full min-h-0">
        {showVoiceTranscript && <VoiceTranscript text={voiceTranscript} />}
        {showMicBar && (
          <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 px-4 w-full max-w-lg flex justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <MicStatusBar
                active
                hint={
                  phase === "intro" && introReady
                    ? "Say “yes” to continue — or tap Continue"
                    : phase === "intro"
                      ? "Mic will listen for “yes” when the intro finishes"
                      : phase === "journey"
                        ? "Name a track, say continue for the next step, or tap a card"
                      : phase === "target_role"
                        ? "Say your role — we’ll go on after a short pause"
                        : undefined
                }
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === "hero" && (
            <motion.section
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center gap-10 py-8 w-full min-h-[min(70vh,560px)]"
            >
              <ProofyOrb size={240} entrance agentSpeaking={false} />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="max-w-md mx-auto space-y-4"
              >
                <h1 className="text-3xl md:text-5xl font-bold text-[#0F172A] tracking-tight">Meet Proofy</h1>
                <p className="text-xl md:text-2xl text-[#475569] leading-relaxed font-medium">
                  A guided onboarding for ProofDive — built to place you on the right path.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                <button
                  type="button"
                  onClick={() => {
                    cancelProofySpeech();
                    setTtsSpeaking(false);
                    goPhase("intro");
                    setIntroLine(0);
                    setIntroReady(false);
                  }}
                  className="h-14 px-12 rounded-xl text-lg font-bold text-white shadow-lg transition-colors hover:opacity-95"
                  style={{ background: TEAL, boxShadow: "0 8px 24px rgba(0,135,168,0.25)" }}
                >
                  Start experience
                </button>
              </motion.div>
            </motion.section>
          )}

          {phase === "intro" && (
            <motion.section
              key="intro"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center justify-center gap-10 min-h-[calc(100dvh-9rem)] py-6"
            >
              <ProofyOrb size={140} agentSpeaking={ttsSpeaking} listening={false} />
              {!introReady ? (
                <FlatCopy>
                  <TypewriterLine key={introLine} text={INTRO_LINES[introLine]} speed={SCRIPT_TYPEWRITER_MS} />
                </FlatCopy>
              ) : (
                <>
                  <FlatCopy>
                    <div className="space-y-8">
                      {INTRO_LINES.map((line) => (
                        <p key={line} className="text-2xl sm:text-3xl md:text-[2rem] font-bold leading-snug">
                          {line}
                        </p>
                      ))}
                    </div>
                  </FlatCopy>
                  <button
                    type="button"
                    onClick={() => {
                      cancelProofySpeech();
                      setTtsSpeaking(false);
                      goPhase("qualification");
                    }}
                    className="h-14 px-12 rounded-xl text-lg font-bold text-white"
                    style={{ background: TEAL }}
                  >
                    Continue
                  </button>
                </>
              )}
            </motion.section>
          )}

          {phase === "qualification" && (
            <motion.section key="qualification" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6">
              <FlatCopy>
                <p>Tell me where you are in your journey.</p>
              </FlatCopy>
              {speechHint && <p className="text-center text-sm text-amber-800">{speechHint}</p>}
              <OptionsStack>
                <div className="grid gap-3">
                  {QUALIFICATION_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => handleQualificationVoice(o.id)}
                      className={`w-full text-center rounded-xl border px-4 py-4 transition-all ${
                        qualification === o.id ? "border-[#0087A8] bg-[#E6F6F9]" : "border-slate-200 bg-white hover:bg-slate-100/80"
                      }`}
                    >
                      <p className="text-lg font-bold text-[#0F172A]">{o.label}</p>
                      <p className="text-sm text-slate-600 mt-1">{o.sub}</p>
                    </button>
                  ))}
                </div>
              </OptionsStack>
            </motion.section>
          )}

          {phase === "experience_years" && (
            <motion.section key="experience_years" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6">
              <FlatCopy>
                <p>How many years of experience do you have?</p>
              </FlatCopy>
              <OptionsStack>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {EXP_BRACKET_OPTIONS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleExpVoice(b.id)}
                      className="rounded-xl border border-slate-200 bg-white py-4 text-base font-bold text-[#0F172A] hover:bg-[#E6F6F9] hover:border-[#0087A8]"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </OptionsStack>
            </motion.section>
          )}

          {phase === "target_role" && (
            <motion.section key="target_role" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6">
              <FlatCopy>
                <p className="mb-4">Which role are you preparing for?</p>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Product Manager"
                  className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-white text-lg text-center outline-none focus:border-[#0087A8]"
                />
                <p className="text-sm text-slate-500 mt-3 font-normal">Mic is on — speak to fill this field.</p>
              </FlatCopy>
              <button
                type="button"
                disabled={!role.trim()}
                onClick={() => goPhase("resume")}
                className="w-full h-12 rounded-xl text-lg font-bold text-white disabled:opacity-40"
                style={{ background: TEAL }}
              >
                Continue
              </button>
            </motion.section>
          )}

          {phase === "resume" && (
            <motion.section key="resume" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6">
              <FlatCopy>
                <p>Want to add a resume or a job description? Both are optional — they help personalize your path.</p>
              </FlatCopy>
              <OptionsStack>
                <div className="space-y-6">
                  <JdResumeInput
                    label="Resume"
                    placeholder="Paste or upload your resume…"
                    value={resume}
                    onChange={setResume}
                    onRemove={() => setResume("")}
                    compact
                  />
                  <JdResumeInput
                    label="Job description"
                    placeholder="Paste a JD you are targeting (optional)…"
                    value={jd}
                    onChange={setJd}
                    onRemove={() => setJd("")}
                    compact
                  />
                </div>
              </OptionsStack>
              {speechHint && <p className="text-center text-sm text-[#0087A8]">{speechHint}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    goPhase("guidance");
                    setGuidanceLine(0);
                    setGuidanceReady(false);
                  }}
                  className="flex-1 h-12 rounded-xl text-lg font-bold text-white"
                  style={{ background: TEAL }}
                >
                  {resume.trim() ? "Continue" : "Skip for now"}
                </button>
              </div>
            </motion.section>
          )}

          {phase === "guidance" && (
            <motion.section
              key="guidance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center justify-center gap-10 min-h-[calc(100dvh-9rem)] py-6"
            >
              <ProofyOrb size={120} agentSpeaking={ttsSpeaking} />
              {!guidanceReady ? (
                <FlatCopy>
                  <TypewriterLine key={guidanceLine} text={GUIDANCE_LINES[guidanceLine]} speed={SCRIPT_TYPEWRITER_MS} />
                </FlatCopy>
              ) : (
                <>
                  <FlatCopy>
                    <div className="space-y-8">
                      {GUIDANCE_LINES.map((line) => (
                        <p key={line} className="text-2xl sm:text-3xl md:text-[2rem] font-bold leading-snug">
                          {line}
                        </p>
                      ))}
                    </div>
                  </FlatCopy>
                  <button
                    type="button"
                    onClick={() => {
                      cancelProofySpeech();
                      setTtsSpeaking(false);
                      goPhase("journey");
                    }}
                    className="h-14 px-10 rounded-xl text-lg font-bold text-white"
                    style={{ background: TEAL }}
                  >
                    Continue
                  </button>
                </>
              )}
            </motion.section>
          )}

          {phase === "journey" && (
            <motion.section key="journey" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-8 pb-8">
              <div className="text-center space-y-3 max-w-3xl mx-auto px-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#0087A8]">Proofy</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">You&apos;re onboarded</h2>
                <p className="text-base sm:text-lg text-[#475569] leading-relaxed font-medium">{JOURNEY_TRACK_CHOICE_LINE}</p>
              </div>
              {speechHint && <p className="text-center text-sm text-amber-800">{speechHint}</p>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {JOURNEY_WIDGETS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => persistAndGo(w.href)}
                    style={{ ...journeyCardGlass }}
                    className="p-5 flex flex-col items-start hover:shadow-md transition-all group text-left border border-white/40 w-full"
                  >
                    <div
                      className={`w-9 h-9 rounded-[8px] flex items-center justify-center mb-4 shrink-0 transition-transform group-hover:scale-105 ${journeyIconWrapClass(w.id)}`}
                    >
                      {journeyTrackIcon(w.id)}
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1.5">{w.title}</h3>
                    <p className="text-[12px] text-[#475569] leading-relaxed mb-5 flex-1">{w.body}</p>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0087A8] group-hover:opacity-80">
                      Open track
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={goToNextPageAfterJourney}
                className="w-full h-14 rounded-xl text-lg font-bold text-white shadow-lg"
                style={{ background: TEAL, boxShadow: "0 8px 24px rgba(0,135,168,0.2)" }}
              >
                Continue to next step
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
