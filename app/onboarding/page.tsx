"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Urbanist } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Files } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { Chip } from "@/components/Chip";
import { JdResumeInput } from "@/components/JdResumeInput";
import { EXP_BRACKET_OPTIONS, type ExpBracket } from "@/lib/proofy-script";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const ROLES = [
  "Product Manager",
  "Product Designer",
  "UX Designer",
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Data Scientist",
  "Data Analyst",
  "Business Analyst",
  "Marketing Manager",
  "Growth Manager",
  "Operations Manager",
  "Strategy Consultant",
  "Machine Learning Engineer",
];

const SUGGESTIVE_ROLE_CHIPS = [
  "Product Manager",
  "UX Designer",
  "Software Engineer",
  "Data Analyst",
  "Product Designer",
  "Marketing Manager",
  "Data Scientist",
  "Business Analyst",
];

const INDUSTRY_OPTIONS = [
  "Technology / software",
  "Financial services",
  "Healthcare",
  "Education",
  "Retail & e-commerce",
  "Manufacturing",
  "Consulting & professional services",
  "Media & marketing",
  "Public sector & non-profit",
  "Energy & utilities",
  "Real estate & construction",
  "Other",
] as const;

type FlowPhase = "role" | "journey";

type CareerStageId = "graduate" | "fresh-grad" | "diploma-holder" | "experienced";

const CAREER_STAGES: {
  id: CareerStageId;
  title: string;
  subtitle: string;
}[] = [
  { id: "graduate", title: "Graduate", subtitle: "Completed your degree; shaping your next step" },
  { id: "fresh-grad", title: "Fresh grad", subtitle: "Recently graduated, early in your path" },
  { id: "diploma-holder", title: "Diploma holder", subtitle: "Diploma, polytechnic, or equivalent" },
  { id: "experienced", title: "Experienced professional", subtitle: "Working full-time in your field" },
];

function mapCareerStage(id: CareerStageId): string {
  switch (id) {
    case "graduate":
      return "graduate";
    case "fresh-grad":
      return "fresh-graduate";
    case "diploma-holder":
      return "diploma-holder";
    case "experienced":
      return "experienced";
    default:
      return "graduate";
  }
}

function bracketLabel(id: ExpBracket): string {
  return EXP_BRACKET_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

type CoachTone = "role" | "journey_pick" | "journey_personalize";

function TrainingCoachPanel({ tone }: { tone: CoachTone }) {
  const copy = useMemo(() => {
    switch (tone) {
      case "journey_pick":
        return {
          label: "Your training coach",
          body: "Pick the stage that fits you best — you can always refine this later.",
        };
      case "journey_personalize":
        return {
          label: "Your training coach",
          body: "Pick an industry from the list if you like, and add a resume or job description when you are ready — it stays optional.",
        };
      default:
        return {
          label: "Your training coach",
          body: "Pick your first role above to get started. You can add more roles anytime and practice each one.",
        };
    }
  }, [tone]);

  return (
    <div
      className="pointer-events-none absolute bottom-0 right-0 z-10 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-0 sm:px-6 sm:pb-3"
      aria-live="polite"
    >
      <div className="pointer-events-none ml-auto flex max-w-[min(100%,26rem)] flex-row items-end justify-end gap-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={tone}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative mb-1 mr-0.5 max-w-[min(100vw-10rem,17rem)] -translate-y-[80px] rounded-2xl border border-slate-200/90 bg-white px-4 py-3 pr-4 shadow-[0_10px_40px_rgba(15,23,42,0.12)] sm:mb-1.5 sm:max-w-[17.5rem]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0087A8]">{copy.label}</p>
            <p className="mt-1.5 text-[13px] leading-snug text-[#0F172A]">&ldquo;{copy.body}&rdquo;</p>
            <span
              className="absolute right-[-7px] top-[46%] z-[1] h-0 w-0 -translate-y-1/2 border-y-[7px] border-l-[8px] border-y-transparent border-l-white drop-shadow-[1px_0_0_rgba(226,232,240,0.95)]"
              aria-hidden
            />
          </motion.div>
        </AnimatePresence>
        <div className="relative z-10 flex h-[min(200px,32vh)] w-[min(152px,38vw)] shrink-0 items-end justify-center sm:h-[220px] sm:w-[168px]">
          <img
            src="/avatar.png?v=2"
            alt="Your training coach"
            className="max-h-full w-auto max-w-full object-contain object-bottom"
            width={168}
            height={220}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

const springContent = { type: "spring" as const, stiffness: 320, damping: 30 };

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser, isLoaded } = useUser();

  const [flowPhase, setFlowPhase] = useState<FlowPhase>("role");
  const [role, setRole] = useState("");
  const [query, setQuery] = useState("");
  const [showSugg, setShowSugg] = useState(false);

  const [careerStage, setCareerStage] = useState<CareerStageId | null>(null);
  const [expBracket, setExpBracket] = useState<ExpBracket | null>(null);
  const [backgroundNotes, setBackgroundNotes] = useState("");
  const [industry, setIndustry] = useState("");
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [optResumeJdOpen, setOptResumeJdOpen] = useState(false);

  const roleRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);

  const filteredRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROLES.slice(0, 8);
    return ROLES.filter((r) => r.toLowerCase().includes(q)).slice(0, 10);
  }, [query]);

  const canContinueRole = role.trim().length > 0;
  const isExperienced = careerStage === "experienced";
  const canFinishJourney =
    Boolean(careerStage) && (!isExperienced || Boolean(expBracket));

  const greetingFirstName = useMemo(() => {
    const n = (user.name ?? "").trim().split(/\s+/).filter(Boolean)[0];
    return n ?? "";
  }, [user.name]);

  const coachTone: CoachTone =
    flowPhase === "role"
      ? "role"
      : careerStage
        ? "journey_personalize"
        : "journey_pick";

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (roleRef.current?.closest(".role-wrap")?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      if (chevronRef.current?.contains(t)) return;
      setShowSugg(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("provider")?.toLowerCase() ?? "";
      if ((p === "google" || p === "linkedin") && !user.name?.trim()) {
        updateUser({ name: "Maaz" });
      }
    } catch {
      /* ignore */
    }
  }, [updateUser, user.name]);

  const handleCompleteOnboarding = () => {
    if (!role.trim() || !careerStage || (careerStage === "experienced" && !expBracket)) return;
    updateUser({
      name: user.name ?? "",
      career: mapCareerStage(careerStage),
      bracket: careerStage === "experienced" && expBracket ? bracketLabel(expBracket) : null,
      educationBackground: careerStage !== "experienced" ? backgroundNotes.trim() : "",
      role: role.trim(),
      industry: industry.trim(),
      jd: jd.trim(),
      resume: resume.trim(),
      onboarded: true,
    });
    router.push("/consent");
  };

  const pickRole = (value: string) => {
    setRole(value);
    setQuery(value);
    setShowSugg(false);
    roleRef.current?.focus();
  };

  const togglePanel = () => {
    setShowSugg((open) => !open);
    requestAnimationFrame(() => roleRef.current?.focus());
  };

  const goToJourney = () => {
    if (!role.trim()) return;
    setFlowPhase("journey");
  };

  return (
    <div
      className={`onboarding-flow relative flex w-full min-h-screen font-['Inter',sans-serif] ${
        flowPhase === "journey" ? "h-[100dvh] max-h-[100dvh] overflow-hidden" : ""
      }`}
    >
      <div
        className={`relative flex min-h-0 flex-1 flex-col bg-gradient-to-b from-[#FAFEFF] to-[#CFDCE1] pt-10 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-10 ${
          flowPhase === "journey" ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <div
          className={`${urbanist.className} relative flex min-h-0 flex-1 flex-col items-center px-6 pt-0 sm:px-10 lg:px-[80px] ${
            flowPhase === "journey"
              ? "justify-start overflow-hidden pb-36 sm:pb-40 lg:pb-36"
              : "justify-center overflow-visible pb-48 sm:pb-56 lg:pb-52"
          }`}
        >
          <div className="mb-8 w-full max-w-[480px] shrink-0 text-left sm:mb-10">
            <span className="text-[28px] font-normal tracking-[0.75px] text-[#253D47] sm:text-[30px]">
              ProofDive
            </span>
          </div>

          <div
            className={`flex w-full max-w-[480px] flex-col ${
              flowPhase === "journey" ? "min-h-0 flex-1" : ""
            }`}
          >
          <AnimatePresence mode="wait">
            {flowPhase === "role" ? (
              <motion.div
                key="phase-role"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={springContent}
                className="w-full max-w-[480px]"
              >
                <div className="mb-8 w-full shrink-0 space-y-3 text-left sm:mb-10">
                  <h1 className="text-[24px] font-semibold leading-[1.2] tracking-tight text-[#0F172A] sm:text-[28px]">
                    {isLoaded && greetingFirstName ? (
                      <>
                        Let&apos;s get you interview-ready,{" "}
                        <span className="font-semibold text-[#0087A8]">{greetingFirstName}</span>
                      </>
                    ) : (
                      <>Let&apos;s get you interview-ready</>
                    )}
                  </h1>
                  <p className="max-w-[42ch] text-[15px] font-medium leading-relaxed text-[#64748B] sm:text-[16px]">
                    Add the role you&apos;re preparing for, then start practicing — we&apos;ll tailor questions and
                    feedback to it.
                  </p>
                </div>

                <div className="relative z-10 w-full shrink-0 text-left">
                  <div className="flex flex-col gap-5">
                    <div className="role-wrap relative">
                      <label className="sr-only" htmlFor="onboarding-role-input">
                        Target role
                      </label>
                      <div className="relative flex items-stretch">
                        <input
                          id="onboarding-role-input"
                          ref={roleRef}
                          value={query}
                          onChange={(e) => {
                            setQuery(e.target.value);
                            setRole(e.target.value);
                            setShowSugg(true);
                          }}
                          onFocus={() => setShowSugg(true)}
                          autoComplete="off"
                          className="h-[48px] w-full rounded-xl border-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.4)_100%)] py-2 pl-4 pr-12 text-[14px] text-[#0F172A] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.05)] outline-none backdrop-blur-[40px] transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-[#0087A8]/15"
                          placeholder="e.g. Product Manager, UX Designer…"
                          aria-expanded={showSugg}
                          aria-controls="onboarding-role-listbox"
                          aria-autocomplete="list"
                        />
                        <button
                          ref={chevronRef}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={togglePanel}
                          className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-[#0F172A] focus-visible:ring-2 focus-visible:ring-[#0087A8]/30"
                          aria-label={showSugg ? "Close role suggestions" : "Open role suggestions"}
                        >
                          <ChevronDown
                            size={22}
                            strokeWidth={2}
                            className={`transition-transform duration-200 ${showSugg ? "rotate-180" : ""}`}
                            aria-hidden
                          />
                        </button>
                      </div>

                      {showSugg ? (
                        <div
                          ref={panelRef}
                          id="onboarding-role-listbox"
                          role="listbox"
                          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl"
                        >
                          <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                            {!query.trim() && (
                              <p className="border-b border-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Popular roles
                              </p>
                            )}
                            {query.trim() && filteredRoles.length === 0 ? (
                              <p className="px-4 py-4 text-[13px] text-slate-500">No matches — try another spelling.</p>
                            ) : (
                              filteredRoles.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  role="option"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => pickRole(s)}
                                  className="w-full border-b border-slate-50 px-4 py-3 text-left text-[13px] font-medium text-[#0F172A] transition-colors last:border-b-0 hover:bg-[#F8FAFC]"
                                >
                                  {s}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <p className="mb-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                        Suggested roles
                      </p>
                      <div className="flex flex-wrap justify-start gap-2">
                        {SUGGESTIVE_ROLE_CHIPS.map((chip) => (
                          <Chip key={`inline-${chip}`} selected={role === chip} onClick={() => pickRole(chip)}>
                            {chip}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={goToJourney}
                      disabled={!canContinueRole}
                      className={`h-[46px] w-full rounded-xl text-[14px] font-bold shadow-lg transition-all ${
                        canContinueRole
                          ? "bg-[#0087A8] text-white shadow-[#0087A8]/20 hover:bg-[#006E89]"
                          : "cursor-not-allowed bg-slate-200 text-slate-400"
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="phase-journey"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={springContent}
                className="flex min-h-0 w-full flex-1 flex-col"
              >
                <div className="mb-6 w-full shrink-0 space-y-3 text-left sm:mb-8">
                  <h1 className="text-[24px] font-semibold leading-[1.2] tracking-tight text-[#0F172A] sm:text-[28px]">
                    Pick up your{" "}
                    <span className="bg-gradient-to-r from-[#0087A8] to-[#00A3C4] bg-clip-text text-transparent">
                      career journey
                    </span>{" "}
                    stage
                  </h1>
                  <p className="max-w-[46ch] text-[15px] font-medium leading-relaxed text-[#64748B] sm:text-[16px]">
                    Choose the option that fits you — then add context so practice matches where you are.
                  </p>
                </div>

                <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] custom-scrollbar">
                <div className="flex flex-col gap-6 px-2 pb-6 pt-2 text-left sm:px-3">
                  <div className="grid grid-cols-1 gap-3 px-1.5 py-1 sm:grid-cols-2">
                    {CAREER_STAGES.map((s) => {
                      const selected = careerStage === s.id;
                      const dimmed = careerStage !== null && !selected;
                      return (
                        <motion.button
                          key={s.id}
                          type="button"
                          layout
                          onClick={() => {
                            setCareerStage(s.id);
                            if (s.id !== "experienced") setExpBracket(null);
                          }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          animate={{
                            opacity: dimmed ? 0.22 : 1,
                            scale: dimmed ? 0.97 : selected ? 1.02 : 1,
                          }}
                          className={`rounded-2xl border px-4 py-4 text-left shadow-[0px_4px_15px_0px_rgba(0,0,0,0.05)] outline-none backdrop-blur-[40px] transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-[#0087A8]/25 ${
                            selected
                              ? "border-[#0087A8] bg-[linear-gradient(145deg,rgba(230,246,250,0.95)_0%,rgba(255,255,255,0.75)_100%)] ring-2 ring-[#0087A8]/20"
                              : "border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0.45)_100%)] hover:border-[#0087A8]/35"
                          }`}
                        >
                          <p className="text-[14px] font-semibold text-[#0F172A]">{s.title}</p>
                          <p className="mt-1 text-[12px] leading-snug text-slate-500">{s.subtitle}</p>
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence initial={false}>
                    {careerStage ? (
                      <motion.div
                        key="personalize"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="min-w-0 overflow-hidden px-0.5"
                      >
                        <div className="flex flex-col gap-5 pt-1">
                          {isExperienced ? (
                            <div>
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                Years of experience
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {EXP_BRACKET_OPTIONS.map((b) => (
                                  <Chip
                                    key={b.id}
                                    selected={expBracket === b.id}
                                    onClick={() => setExpBracket(b.id)}
                                    className="min-h-9 px-4 text-[13px]"
                                  >
                                    {b.label}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label
                                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400"
                                htmlFor="onboarding-background"
                              >
                                Tell us about your path
                              </label>
                              <textarea
                                id="onboarding-background"
                                value={backgroundNotes}
                                onChange={(e) => setBackgroundNotes(e.target.value)}
                                rows={3}
                                placeholder="e.g. Final-year CS major, internship at a bank, pivoting into product…"
                                className="w-full resize-none rounded-xl border-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.5)_100%)] px-4 py-3 text-[14px] text-[#0F172A] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.05)] outline-none backdrop-blur-[40px] placeholder:text-slate-400 focus:ring-2 focus:ring-[#0087A8]/15"
                              />
                            </div>
                          )}

                          <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              Make it more personalised{" "}
                              <span className="normal-case font-medium tracking-normal">(optional)</span>
                            </p>
                            <div className="flex flex-col gap-3">
                              <div className="min-w-0 w-full">
                                <label className="sr-only" htmlFor="onboarding-industry-select">
                                  Industry (optional)
                                </label>
                                <div className="relative">
                                  <select
                                    id="onboarding-industry-select"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="h-[44px] w-full cursor-pointer appearance-none rounded-xl border-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.5)_100%)] py-2 pl-4 pr-11 text-[14px] font-medium text-[#0F172A] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.05)] outline-none backdrop-blur-[40px] focus:ring-2 focus:ring-[#0087A8]/20"
                                  >
                                    <option value="">Industry (optional)</option>
                                    {INDUSTRY_OPTIONS.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={18}
                                    strokeWidth={2}
                                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                                    aria-hidden
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setOptResumeJdOpen((o) => !o)}
                                className={`group flex min-h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-xl border-0 px-4 py-2.5 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0087A8]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                                  optResumeJdOpen || resume.trim() || jd.trim()
                                    ? "bg-[#0087A8]/10 text-[#0087A8] hover:bg-[#0087A8]/14"
                                    : "bg-transparent text-[#475569] hover:bg-white/30 hover:text-[#0F172A]"
                                }`}
                              >
                                <Files size={16} strokeWidth={2} className="shrink-0 opacity-60 transition-opacity group-hover:opacity-90" aria-hidden />
                                <span className="text-center leading-tight">Add resume / job description</span>
                              </button>
                            </div>

                            <AnimatePresence initial={false}>
                              {optResumeJdOpen ? (
                                <motion.div
                                  key="opt-resume-jd"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 rounded-xl border border-slate-100/90 bg-white/60 p-3 shadow-sm backdrop-blur-md">
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Resume and job description
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => setOptResumeJdOpen(false)}
                                        className="text-[12px] font-semibold text-[#0087A8] hover:underline"
                                      >
                                        Close
                                      </button>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Resume</p>
                                        <JdResumeInput
                                          variant="stacked"
                                          compact
                                          placeholder="Paste resume text or upload a file…"
                                          value={resume}
                                          onChange={setResume}
                                          onRemove={() => setResume("")}
                                          uploadLabel="Drop resume here or browse"
                                          uploadDividerText="or paste below"
                                        />
                                      </div>
                                      <div>
                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Job description</p>
                                        <JdResumeInput
                                          variant="stacked"
                                          compact
                                          placeholder="Paste a JD you are interviewing for…"
                                          value={jd}
                                          onChange={setJd}
                                          onRemove={() => setJd("")}
                                          uploadLabel="Drop JD file here or browse"
                                          uploadDividerText="or paste below"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                </div>

                {careerStage ? (
                  <div className="shrink-0 border-t border-slate-300/30 bg-gradient-to-b from-transparent to-[#CFDCE1]/40 px-2 pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3">
                    <button
                      type="button"
                      onClick={handleCompleteOnboarding}
                      disabled={!canFinishJourney}
                      className={`h-[46px] w-full rounded-xl text-[14px] font-bold shadow-lg transition-all ${
                        canFinishJourney
                          ? "bg-[#0087A8] text-white shadow-[#0087A8]/20 hover:bg-[#006E89]"
                          : "cursor-not-allowed bg-slate-200 text-slate-400"
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
          </div>

          <TrainingCoachPanel tone={coachTone} />
        </div>
      </div>

      <div className="relative hidden h-screen w-[460px] shrink-0 overflow-hidden lg:flex">
        <img
          src="/login_hero_final.png"
          alt="Turn experience into proof"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
