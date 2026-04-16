"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Urbanist } from "next/font/google";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Brain,
  ChevronDown,
  Edit3,
  Info,
  Loader2,
  Lock,
  Plus,
  Save,
  Target,
  Unlock,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { StoryGenerationLoadingScreen } from "@/components/StoryGenerationLoadingScreen";
import { Chip } from "@/components/Chip";
import {
  TEAL,
  averageMockStoryStrength,
  buildInitialSections,
  buildInitialSectionsForRole,
  craftStorageKeyForExperience,
  hydrateCraftSectionsFromLocalStorage,
  isIntroSection,
  markExperienceCraftSaved,
  mockStoryScore,
  normalizeIntroBlock,
  pillarMockScoreBreakdown,
  type CarBlock,
  type CraftSection,
} from "@/lib/storyboard-crafting";
import {
  findExperienceContext,
  listExperienceLabelsForRole,
  resolveCraftStorageKeyForExperienceId,
} from "@/lib/storyboard-library";
import { readJourneyState, completeJourneyStep } from "@/lib/guided-journey";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const MAX_REGENS_PER_SECTION = 3;
const BORDER_HALF = "0.5px solid var(--color-border-tertiary)";
const CARD_RADIUS = 10;
const BTN_RADIUS = 8;
const CONTENT_MAX_W = 840;

const glassScoreStrip =
  "relative overflow-hidden rounded-[24px] border-[0.5px] border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

const CRAFT_PILLAR_ICONS: Record<string, LucideIcon> = {
  "Power of Thinking": Brain,
  "Power of Action": Zap,
  "Power of People": Users,
  "Power of Mastery": Target,
};

function scoreBandColor(v: number): string {
  if (v < 2.5) return "#EF4444";
  if (v < 3.5) return "#D97706";
  return "#059669";
}

function readinessBand(v: number): {
  label: string;
  chipClass: string;
  labelStrongClass: string;
} {
  if (v < 2.5) {
    return {
      label: "Not ready",
      chipClass:
        "border-white/90 bg-[linear-gradient(90.31deg,rgba(254,226,226,0.65)_0%,rgba(254,242,242,0.65)_99.92%)] text-[#B91C1C]",
      labelStrongClass: "text-[#B91C1C]",
    };
  }
  if (v < 3.5) {
    return {
      label: "Borderline",
      chipClass:
        "border-white/90 bg-[linear-gradient(90.31deg,rgba(255,233,197,0.6)_0%,rgba(255,242,221,0.6)_99.92%)] text-[#B45309]",
      labelStrongClass: "text-[#B45309]",
    };
  }
  return {
    label: "Competent",
    chipClass:
      "border-white/90 bg-[linear-gradient(90.31deg,rgba(209,250,229,0.65)_0%,rgba(236,253,245,0.7)_99.92%)] text-[#047857]",
    labelStrongClass: "text-[#047857]",
  };
}

/** Storyboard hub / dashboard — top tool row */
const CRAFT_TOPBAR_ROW =
  "relative flex w-full items-center justify-between gap-3 rounded-[16px] bg-transparent p-0";
const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.60)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.88)",
};

/** Mock “AI” regen: single paragraph for Core Introduction. */
function mockRegenerateIntro(prompt: string): CarBlock {
  const hint = prompt.trim() || "Sharpen clarity and interview impact";
  return {
    context: `[Core Introduction — ${hint}] One concise paragraph: your role, the scope you operate in, and how the stories ahead showcase your strengths—ready for a behavioral interview.`,
    action: "",
    result: "",
  };
}

/** Mock “AI” regen: rewrites all three CAR fields using the prompt hint. */
function mockRegenerateCar(section: CraftSection, prompt: string): CarBlock {
  const hint = prompt.trim() || "Sharpen clarity and interview impact";
  const t = section.title;
  return {
    context: `[${t}] Context — ${hint}. Situation reframed with clearer stakes and scope; who was affected and why it mattered.`,
    action: `[${t}] Action — Your specific moves: analysis, alignment, and execution steps you owned (not the team generically).`,
    result: `[${t}] Result — Quantify where possible; otherwise name the decision, adoption, or risk reduced. Tie to ${hint.toLowerCase()}.`,
  };
}

const PROMPT_CHIPS: { label: string; text: string }[] = [
  {
    label: "More dramatic",
    text: "Rewrite with higher narrative tension: sharpen stakes, conflict, and the turning point—while staying credible and interview-appropriate.",
  },
  {
    label: "Richer context",
    text: "Expand context with org setting, constraints, timelines, and why this mattered to the business before any action is described.",
  },
  {
    label: "Executive polish",
    text: "Elevate tone for a senior panel: concise, confident language; clear accountability; no jargon without purpose.",
  },
  {
    label: "Stakeholder arc",
    text: "Make the human thread explicit: who was involved, resistance or alignment, and how you moved decisions forward.",
  },
  {
    label: "Measurable impact",
    text: "Strengthen outcomes with numbers where possible (%, $, time, adoption); if none exist, state the clearest qualitative business effect.",
  },
];

function strengthColor(score: number): string {
  return scoreBandColor(score);
}

function purposeLineFor(sectionName: string): string {
  const map: Record<string, string> = {
    "Core introduction": "Interviewers use this to decide if they want to hear more. First impressions compound.",
    "Analytical Thinking": "Interviewers ask about this to see if you diagnose before you act.",
    Prioritization:
      "Interviewers ask about this to see how you decide what matters when everything feels urgent.",
    "Decision-Making Agility": "Interviewers ask about this to see if you can make calls with imperfect information.",
    Ownership: "Interviewers ask about this to see if you move without being told.",
    "Initiative & Follow-through": "Interviewers ask about this to see if you actually finish what you start.",
    "Embraces Change": "Interviewers ask about this to see how you respond when things go wrong.",
    Influence: "Interviewers ask about this to see if you can move people without authority.",
    "Collaboration & Inclusion": "Interviewers ask about this to see if you understand the people around you.",
    "Grows Capability": "Interviewers ask about this to see if others move better because of you.",
    "Functional Knowledge": "Interviewers ask about this to see if your knowledge holds up under pressure.",
    Execution: "Interviewers ask about this to see if you hold a high bar for your own work.",
    Innovation: "Interviewers ask about this to see if you improve fast when the situation demands it.",
  };
  return map[sectionName] ?? "Interviewers ask about this to see how you think and operate under pressure.";
}

function proofySuggestion(sectionName: string): string {
  const map: Record<string, string> = {
    "Analytical Thinking":
      "Your action is strong but your context has no stakes. What would have gone wrong if this problem wasn't solved? Add that one line and this answer moves to a 3.5.",
    Ownership:
      "There's no moment here where you started something without being asked. Can you add one line that shows you spotted the gap before anyone told you to?",
  };
  return (
    map[sectionName] ??
    "One quick upgrade: add a single concrete stake (what breaks if you don't act) and a measurable outcome (time, cost, adoption, risk reduced)."
  );
}

export default function BackupCraftingPage() {
  const router = useRouter();
  const { user } = useUser();
  const craftKeyRef = useRef<string>(resolveCraftStorageKeyForExperienceId(null));
  const experienceIdRef = useRef<string | null>(null);
  /** For header links: same query shape as `/storyboard/backup/new?experienceId=…&role=…`. */
  const [navExperienceId, setNavExperienceId] = useState<string | null>(null);
  const [navRoleTitle, setNavRoleTitle] = useState("");
  const [showAnalyzing, setShowAnalyzing] = useState(false);

  useEffect(() => {
    try {
      const should = window.sessionStorage.getItem("pd:crafter:showAnalyzing") === "1";
      if (!should) return;
      window.sessionStorage.removeItem("pd:crafter:showAnalyzing");
      setShowAnalyzing(true);
    } catch {
      return;
    }
  }, []);

  const [sections, setSections] = useState<CraftSection[]>(() => buildInitialSections());

   useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const exp = params.get("experienceId")?.trim() || null;
    experienceIdRef.current = exp;
    setNavExperienceId(exp);
    const key = resolveCraftStorageKeyForExperienceId(exp);
    craftKeyRef.current = key;
    const ctx = exp ? findExperienceContext(exp) : null;
    setNavRoleTitle((ctx?.roleTitle ?? user.targetRole ?? user.role ?? "My role").trim());
    const roleExperienceLabels = ctx?.roleId ? listExperienceLabelsForRole(ctx.roleId) : [];
    const hydrated = hydrateCraftSectionsFromLocalStorage(key);
    setSections(
      hydrated ??
        buildInitialSectionsForRole({
          roleTitle: ctx?.roleTitle ?? user.targetRole ?? user.role ?? undefined,
          experienceLabel: ctx?.experienceLabel ?? undefined,
          experienceLabels: roleExperienceLabels,
        })
    );
  }, []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<string | null>(null);
  const regenBusyRef = useRef(false);
  const regenGenRef = useRef(0);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [pillarBreakdownOpen, setPillarBreakdownOpen] = useState(false);

  const persistAll = useCallback((updater: CraftSection[] | ((prev: CraftSection[]) => CraftSection[])) => {
    setSections((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(craftKeyRef.current, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const closeEdit = () => {
    regenGenRef.current += 1;
    regenBusyRef.current = false;
    setEditingId(null);
    setDraftPrompt("");
    setRegeneratingSectionId(null);
  };

  const openEdit = (id: string) => {
    const s = sections.find((x) => x.id === id);
    if (!s || s.locked) return;
    setEditingId(id);
    setDraftPrompt(s.prompt || "");
  };

  const toggleSectionLock = (id: string) => {
    const s = sections.find((x) => x.id === id);
    if (!s) return;
    const nextLocked = !s.locked;
    if (nextLocked && editingId === id) {
      closeEdit();
    }
    persistAll((prev) =>
      prev.map((x) => (x.id === id ? { ...x, locked: nextLocked } : x))
    );
  };

  const applyRegenerate = (id: string, promptText: string) => {
    if (regenBusyRef.current) return;
    const s = sections.find((x) => x.id === id);
    if (!s || s.locked || s.regenerationsUsed >= MAX_REGENS_PER_SECTION) return;
    regenBusyRef.current = true;
    const gen = ++regenGenRef.current;
    setRegeneratingSectionId(id);
    window.setTimeout(() => {
      if (gen !== regenGenRef.current) {
        regenBusyRef.current = false;
        return;
      }
      persistAll((prev) => {
        const sec = prev.find((x) => x.id === id);
        if (!sec || sec.regenerationsUsed >= MAX_REGENS_PER_SECTION) return prev;
        const nextCar = isIntroSection(id) ? mockRegenerateIntro(promptText) : mockRegenerateCar(sec, promptText);
        return prev.map((x) =>
          x.id === id
            ? {
                ...x,
                history: [...x.history, isIntroSection(id) ? normalizeIntroBlock(x.car) : x.car],
                car: nextCar,
                regenerationsUsed: x.regenerationsUsed + 1,
                prompt: promptText,
              }
            : x
        );
      });
      regenBusyRef.current = false;
      setRegeneratingSectionId(null);
    }, 900);
  };

  const saveStoryboard = () => {
    try {
      const payload = JSON.stringify(sections);
      localStorage.setItem(craftKeyRef.current, payload);
      const exp = experienceIdRef.current;
      if (exp) {
        try {
          localStorage.setItem(craftStorageKeyForExperience(exp), payload);
          markExperienceCraftSaved(exp);
        } catch {
          /* ignore */
        }
      }
      const st = readJourneyState();
      if (st.active && !st.skipped && st.stepId === "story") {
        completeJourneyStep("story");
        router.push("/mock");
      } else {
        setSaveToast("Storyboard saved");
        setTimeout(() => setSaveToast(null), 2500);
        router.push(exp ? `/storyboard/backup/${exp}` : "/storyboard/backup");
      }
    } catch {
      setSaveToast("Could not save");
      setTimeout(() => setSaveToast(null), 2500);
    }
  };

  const roleTitle = user.role?.trim() || "Your storyboard";
  const roleStoryLabel = `${roleTitle} story`;
  const addExperienceHref =
    navExperienceId && navRoleTitle
      ? `/storyboard/backup/new?experienceId=${encodeURIComponent(navExperienceId)}&role=${encodeURIComponent(navRoleTitle)}`
      : "/storyboard/backup";
  const firstName = useMemo(() => user.name?.trim().split(" ")[0] || "Maaz", [user.name]);

  const sectionMeta = useMemo(() => {
    const items = sections.map((s) => {
      const name = isIntroSection(s.id) ? "Core introduction" : s.title;
      const score = mockStoryScore(s.id);
      return { id: s.id, name, score };
    });
    const weakest = [...items].sort((a, b) => a.score - b.score)[0];
    const competencyItems = items.filter((x) => !isIntroSection(x.id));
    const weakestCompetency = competencyItems.length
      ? [...competencyItems].sort((a, b) => a.score - b.score)[0]
      : undefined;
    const needsAttention = items.filter((x) => x.score < 3.5).length;
    return { items, weakest, weakestCompetency, needsAttention };
  }, [sections]);

  const overallScore = useMemo(() => averageMockStoryStrength(sections), [sections]);
  const pillarScores = useMemo(() => pillarMockScoreBreakdown(sections), [sections]);
  const overallLabel =
    sectionMeta.needsAttention === 1
      ? "Borderline — 1 section needs attention"
      : `Borderline — ${sectionMeta.needsAttention} sections need attention`;

  const readiness = useMemo(() => readinessBand(overallScore), [overallScore]);

  const jumpToWeakest = () => {
    const id = sectionMeta.weakestCompetency?.id ?? sectionMeta.weakest?.id;
    if (!id) return;
    const el = sectionRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const jumpToPillarFirst = useCallback((pillar: string) => {
    const s = sections.find((sec) => !isIntroSection(sec.id) && sec.pillar === pillar);
    if (!s) return;
    sectionRefs.current[s.id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [sections]);

  if (showAnalyzing) {
    return (
      <StoryGenerationLoadingScreen
        name={user.name || "Maaz"}
        onDone={() => setShowAnalyzing(false)}
        minDurationMs={20000}
      />
    );
  }

  return (
    <div
      className={`${urbanist.className} relative min-h-[calc(100vh-64px)] overflow-x-hidden animate-in fade-in duration-500`}
      style={{ background: "var(--color-background-secondary)" }}
    >
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6">
        <div
          className="pointer-events-none invisible absolute left-[-251px] top-[66px] z-[1] h-[1127px] w-[1127px] opacity-45"
          aria-hidden
        >
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        {/* Subbar — dashboard / storyboard hub shell + glass row */}
        <div className="relative z-[1] mb-6">
          <div className={CRAFT_TOPBAR_ROW}>
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Link
                href="/storyboard/backup"
                className="inline-flex shrink-0 items-center gap-2 text-[13px] font-semibold text-[#64748B] transition-colors hover:text-[#1E293B]"
              >
                <ArrowLeft size={16} aria-hidden />
                StoryBoard
              </Link>
              <span className="shrink-0 text-[13px] font-medium text-[#94A3B8]" aria-hidden>
                /
              </span>
              <span className="min-w-0 truncate text-[14px] font-medium text-[#1E293B]" title={roleStoryLabel}>
                {roleStoryLabel}
              </span>
              <span className="inline-flex shrink-0 items-center rounded-full bg-[#E6F1FB] px-2.5 py-0.5 text-[14px] font-semibold text-[#0087A8]">
                {sections.length} sections
              </span>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Link
                href={addExperienceHref}
                className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white/80 px-4 py-2.5 text-[14px] font-medium text-[#0A89A9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-colors hover:border-[#94A3B8] hover:bg-white"
              >
                <Plus size={16} strokeWidth={2} aria-hidden />
                Add experience
              </Link>
              <button
                type="button"
                onClick={saveStoryboard}
                data-journey-id="story-save"
                className="inline-flex items-center gap-2 rounded-full bg-[#0A89A9] px-5 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              >
                <Save size={16} aria-hidden />
                Save storyboard
              </button>
            </div>
          </div>
        </div>

        {saveToast && (
          <div className="relative z-[1] mx-auto w-full" style={{ maxWidth: CONTENT_MAX_W, padding: "0 0 0.75rem" }}>
            <div
              className="text-center text-[12px] font-medium bg-white"
              style={{ border: BORDER_HALF, borderRadius: 10, padding: "10px 12px" }}
              role="status"
            >
              {saveToast}
            </div>
          </div>
        )}

        {/* Story opening — dashboard hero typography (Urbanist, slate + brand teal) */}
        <section className="relative z-[1] mx-auto flex w-full flex-col items-center py-4 text-center" style={{ maxWidth: CONTENT_MAX_W }}>
          <div className="flex w-full flex-col items-center pt-1">
            <h1 className="max-w-[min(100%,840px)] text-[28px] font-normal leading-snug md:text-[34px] md:leading-normal">
              <span className="text-[#334155]">{firstName}, your </span>
              <span className="text-[#0A89A9]">{roleTitle}</span>
              <span className="text-[#334155]">
                {" "}
                story is ready — read it, own it, then walk into your mock with it.
              </span>
            </h1>
          </div>
        </section>

        {/* Story strength — dashboard Interview readiness style */}
        <div className="relative z-[1] mx-auto w-full" style={{ maxWidth: CONTENT_MAX_W, padding: "0 0 1rem" }}>
          <section className={`${glassScoreStrip} p-6 md:p-8`} data-journey-id="story-score-strip">
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
              <div className="min-w-0 flex-1">
                <h2 className="text-[24px] font-medium leading-tight tracking-tight text-[#1E293B] md:text-[26px]">
                  Story strength
                </h2>
                <p className="mt-2 text-[15px] font-normal leading-relaxed text-[#475569] md:text-[16px]">{overallLabel}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#94A3B8] md:text-[14px]">
                  Mock scores by section — pillar balance at a glance.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPillarBreakdownOpen((o) => !o)}
                    aria-expanded={pillarBreakdownOpen}
                    className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white/70 px-4 py-2.5 text-[14px] font-semibold text-[#334155] shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[21px] transition-colors hover:border-[#0A89A9]/40 hover:text-[#0A89A9]"
                  >
                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition-transform duration-200 ${pillarBreakdownOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                    {pillarBreakdownOpen ? "Hide pillar breakdown" : "Breakdown by pillar"}
                  </button>
                  <button
                    type="button"
                    onClick={jumpToWeakest}
                    className="text-[14px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
                  >
                    Jump to weakest section →
                  </button>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-8 lg:flex-col lg:items-end">
                <p className="flex items-end tabular-nums">
                  <span
                    className="text-[42px] font-semibold leading-none md:text-[48px]"
                    style={{ color: scoreBandColor(overallScore) }}
                  >
                    {overallScore.toFixed(1)}
                  </span>
                  <span className="pb-1.5 text-[22px] font-normal leading-none text-[#64748B] md:text-[24px]">/05</span>
                </p>
                <p
                  className={[
                    "max-w-[280px] rounded-full border px-4 py-2 text-center text-[11px] font-medium shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:text-left md:text-[12px]",
                    readiness.chipClass,
                  ].join(" ")}
                >
                  You&apos;re currently on{" "}
                  <span className={["font-semibold", readiness.labelStrongClass].join(" ")}>{readiness.label}</span>
                </p>
              </div>
            </div>

            {pillarBreakdownOpen ? (
              <>
                <div className="my-8 h-px w-full bg-[#E2E8F0]" role="separator" />
                <div className="w-full" role="region" aria-label="Scores by competency pillar">
                  <p className="mb-5 text-[16px] font-medium text-[#475569] md:text-[17px]">Pillar scores</p>
                  <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-6 md:gap-y-6">
                    {pillarScores.map(({ pillar, score }) => {
                      const PillarIcon = CRAFT_PILLAR_ICONS[pillar] ?? Brain;
                      return (
                        <button
                          key={pillar}
                          type="button"
                          onClick={() => jumpToPillarFirst(pillar)}
                          className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_3.5rem_auto] items-center gap-x-2.5 text-left transition-opacity hover:opacity-90"
                          aria-label={`Go to first ${pillar} section`}
                        >
                          <PillarIcon size={18} className="shrink-0 text-[#64748B]" strokeWidth={1.8} aria-hidden />
                          <span className="min-w-0 truncate text-[16px] font-medium text-[#475569] md:text-[17px]">
                            {pillar}
                          </span>
                          <span className="h-[2px] w-[2px] shrink-0 rounded-full bg-[#1E293B]" aria-hidden />
                          <span
                            className="shrink-0 text-right text-[24px] font-semibold leading-none tabular-nums md:text-[26px]"
                            style={{ color: scoreBandColor(score) }}
                          >
                            {score.toFixed(1)}
                          </span>
                          <ArrowUpRight size={15} className="shrink-0 text-[#94A3B8]" aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </section>
        </div>

        {/* Section cards */}
        <div className="relative z-[1] mx-auto w-full" style={{ maxWidth: CONTENT_MAX_W, padding: "12px 0 2rem" }}>
          <div className="flex flex-col" style={{ gap: 12 }}>
            {sections.map((section, idx) => {
              const sectionNumber = idx + 1;
              const isEditing = editingId === section.id && !section.locked;
              const creditsLeft = MAX_REGENS_PER_SECTION - section.regenerationsUsed;
              const isRegenerating = regeneratingSectionId === section.id;
              const score = mockStoryScore(section.id);
              const scoreColor = strengthColor(score);
              const showProofy = score < 2.5;

            const sectionName = isIntroSection(section.id) ? "Core introduction" : section.title;
            const pillarLabel = String(section.pillar || "")
              .replace(/\s*\(.*?\)\s*/g, " ")
              .trim()
              .toLowerCase();
            const sectionLocked = section.locked === true;

            return (
              <div
                key={section.id}
                  ref={(el) => {
                    sectionRefs.current[section.id] = el;
                  }}
                  data-journey-id={idx === 0 ? "story-first-card" : undefined}
                  className="bg-white"
                  style={{
                    ...GLASS,
                    borderRadius: CARD_RADIUS,
                    ...(sectionLocked ? { boxShadow: "0 2px 12px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(10,137,169,0.12)" } : {}),
                  }}
                  aria-disabled={sectionLocked}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3" style={{ padding: "12px 16px" }}>
                    <div className="flex items-start gap-12 min-w-0">
                      <div className="flex items-center justify-center gap-2 min-w-0">
                        <div
                          className="shrink-0 grid place-items-center"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: "var(--color-background-secondary)",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--color-text-tertiary)",
                          }}
                        >
                          {sectionNumber}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-start justify-center gap-2 min-w-0">
                            <p
                              className="text-[20px] font-medium truncate min-w-0"
                              style={{ color: "var(--color-text-primary)" }}
                              title={sectionName}
                            >
                              {sectionName}
                            </p>
                            <span
                              className="shrink-0 inline-flex items-center px-2.5 py-0.5 text-[14px] font-medium"
                              style={{ background: "#E6F1FB", color: TEAL, borderRadius: 20 }}
                            >
                              {pillarLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <div data-journey-id={idx === 0 ? "story-evidence-score" : undefined} className="flex items-center gap-2">
                        <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                          Evidence strength
                        </span>
                        <span className="text-[24px] font-bold tabular-nums" style={{ color: scoreColor }}>
                          {score.toFixed(1)}
                        </span>
                        <span className="relative group inline-flex">
                          <button
                            type="button"
                            className="p-1 rounded"
                            aria-label="About evidence strength score"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            <Info size={14} strokeWidth={2} />
                          </button>
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-[220px] rounded-[10px] bg-white px-3 py-2 text-[11px] font-medium opacity-0 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
                            style={{ border: BORDER_HALF, color: "var(--color-text-secondary)" }}
                          >
                            A quick signal for how credible and interview-ready this section feels. Green ≥ 3.5, amber
                            2.5–3.4, red &lt; 2.5.
                          </span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSectionLock(section.id)}
                        aria-pressed={sectionLocked}
                        aria-label={sectionLocked ? "Unlock section" : "Lock section"}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium bg-white transition-colors"
                        style={{
                          border: "0.5px solid var(--color-border-secondary)",
                          borderRadius: BTN_RADIUS,
                          color: sectionLocked ? TEAL : "var(--color-text-primary)",
                        }}
                      >
                        {sectionLocked ? <Unlock size={14} aria-hidden /> : <Lock size={14} aria-hidden />}
                        {sectionLocked ? "Unlock" : "Lock"}
                      </button>

                      <button
                        type="button"
                        disabled={sectionLocked}
                        onClick={() => (isEditing ? closeEdit() : openEdit(section.id))}
                        data-journey-id={idx === 0 ? "story-edit-btn" : undefined}
                        className="inline-flex items-center gap-2 px-3 py-2 text-[12px] font-medium bg-white disabled:cursor-not-allowed disabled:opacity-45"
                        style={{
                          border: "0.5px solid var(--color-border-secondary)",
                          borderRadius: BTN_RADIUS,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        <Edit3 size={14} />
                        {isEditing ? "Close" : "Edit"}
                      </button>
                    </div>
                  </div>

                  {/* Interview purpose line */}
                  <div
                    data-journey-id={idx === 0 ? "story-purpose-line" : undefined}
                    className={["text-[12px] italic flex items-start gap-2", sectionLocked ? "pointer-events-none select-none opacity-[0.88]" : ""].join(" ")}
                    style={{
                      padding: "10px 16px",
                      borderTop: BORDER_HALF,
                      color: "var(--color-text-tertiary)",
                      background: "#E6F1FB",
                    }}
                  >
                    <span className="shrink-0 inline-flex mt-[1px]" aria-hidden="true" style={{ color: TEAL }}>
                      <Info size={14} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 text-[14px]">{purposeLineFor(sectionName)}</span>
                  </div>

                  {/* Generated content (always visible) */}
                  <div
                    data-journey-id={idx === 1 ? "story-car-blocks" : undefined}
                    className={["flex flex-col", sectionLocked ? "pointer-events-none select-none opacity-[0.92]" : ""].join(" ")}
                    style={{ padding: "12px 16px 14px", gap: 12 }}
                  >
                    {isIntroSection(section.id) ? (
                      <CarBlock label="Context" dot={TEAL} text={section.car.context} />
                    ) : (
                      <>
                        <CarBlock label="Context" dot={TEAL} text={section.car.context} />
                        <CarBlock label="Action" dot="#1D9E75" text={section.car.action} />
                        <CarBlock label="Result" dot="#BA7517" text={section.car.result} />
                      </>
                    )}

                    {/* Proofy suggestion (only when score < 3.5) */}
                    {showProofy && (
                      <div
                        className="mt-3"
                        style={{
                          background: "#E6F1FB",
                          border: "0.5px solid var(--color-border-tertiary)",
                          borderRadius: 10,
                          padding: "10px 12px",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span aria-hidden="true" className="inline-flex" style={{ color: TEAL }}>
                            <Info size={14} strokeWidth={2} />
                          </span>
                          <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            AI coach suggestion
                          </span>
                        </div>

                        <div className="mt-2 flex items-start gap-2">
                          <div
                            className="shrink-0"
                            aria-hidden="true"
                            style={{
                              width: 3,
                              alignSelf: "stretch",
                              borderRadius: 999,
                              background: TEAL,
                            }}
                          />
                          <p className="text-[16px]" style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                            {proofySuggestion(sectionName)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Edit panel (slides open; does not replace content) */}
                    <div
                      className={["overflow-hidden transition-all", isEditing ? "mt-4" : "mt-0"].join(" ")}
                      style={{
                        maxHeight: isEditing ? 420 : 0,
                        opacity: isEditing ? 1 : 0,
                      }}
                      aria-hidden={!isEditing}
                    >
                      <div className="bg-white" style={{ borderTop: BORDER_HALF, paddingTop: 12 }}>
                        <p className="text-[12px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                          How do you want to improve this?
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {PROMPT_CHIPS.map((c) => (
                            <Chip
                              key={c.label}
                              disabled={isRegenerating}
                              selected={draftPrompt === c.text}
                              onClick={() => setDraftPrompt(c.text)}
                              className="disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {c.label}
                            </Chip>
                          ))}
                        </div>

                        <textarea
                          className="mt-3 w-full bg-white text-[13px]"
                          value={draftPrompt}
                          onChange={(e) => setDraftPrompt(e.target.value)}
                          placeholder="e.g. Make the context more urgent, add the business impact of inaction..."
                          rows={3}
                          disabled={isRegenerating}
                          style={{
                            border: "1px solid var(--color-border-secondary)",
                            borderRadius: BTN_RADIUS,
                            padding: "10px 12px",
                            color: "var(--color-text-primary)",
                          }}
                        />

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                            {creditsLeft} regenerations left
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={closeEdit}
                              className="bg-white px-3.5 py-2 text-[12px] font-medium"
                              style={{
                                border: "0.5px solid var(--color-border-secondary)",
                                borderRadius: BTN_RADIUS,
                                color: "var(--color-text-tertiary)",
                              }}
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              disabled={creditsLeft <= 0 || isRegenerating}
                              onClick={() => applyRegenerate(section.id, draftPrompt)}
                              className="inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold text-white"
                              style={{
                                background: TEAL,
                                borderRadius: BTN_RADIUS,
                                opacity: creditsLeft <= 0 ? 0.45 : 1,
                                cursor: creditsLeft <= 0 ? "not-allowed" : "pointer",
                              }}
                            >
                              {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : null}
                              Regenerate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CarBlock({
  label,
  dot,
  text,
}: {
  label: string;
  dot: string;
  text: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: dot,
            display: "inline-block",
          }}
        />
        <span className="text-[14px] font-medium" style={{ color: "var(--color-text-tertiary)" }}>
          {label}
        </span>
      </div>
      <div className="text-[16px]" style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
        {text}
      </div>
    </div>
  );
}

