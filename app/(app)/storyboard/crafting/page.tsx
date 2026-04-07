"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CornerDownLeft,
  Edit3,
  History,
  Info,
  Loader2,
  Save,
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import { completeJourneyStep, readJourneyState } from "@/lib/guided-journey";
import {
  STORYBOARD_CRAFTING_STORAGE_KEY,
  STORYBOARD_GLASS_CARD,
  TEAL,
  buildInitialSections,
  hydrateCraftSectionsFromLocalStorage,
  isIntroSection,
  mockStoryScore,
  normalizeIntroBlock,
  PROOFY_LOW_SCORE_MESSAGE,
  type CarBlock,
  type CraftSection,
} from "@/lib/storyboard-crafting";
import { CarBlockStack } from "@/components/storyboard-car-block-stack";

const MAX_REGENS_PER_SECTION = 3;

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

function suggestionForSection(section: CraftSection): string {
  if (isIntroSection(section.id)) {
    return "Make the introduction concise: role, scope, and one sentence on the story you will unpack.";
  }
  const map: Record<string, string> = {
    "Analytical Thinking": "Emphasize data sources, hypotheses tested, and how you separated signal from noise.",
    Prioritization: "Show the trade-off framework and what you deliberately did not do.",
    "Decision-Making Agility": "Highlight time pressure, incomplete information, and how you decided anyway.",
    Ownership: "Use first-person ownership: I decided, I drove, I was accountable for…",
    "Initiative & Follow-through": "Prove you started without being asked and closed the loop to a durable outcome.",
    "Embraces Change": "Describe resistance or ambiguity and how you adapted the plan or brought others along.",
    Influence: "Name stakeholders, objections, and the tactic that shifted their position.",
    "Collaboration & Inclusion": "Show how you brought diverse voices in and resolved conflict constructively.",
    "Grows Capability": "Show mentoring, documentation, or process that made the team stronger after you left.",
    "Functional Knowledge": "Add domain or technical depth that proves credibility.",
    Execution: "Tighten timeline, milestones, and how you unblocked delivery.",
    Innovation: "Clarify the novel approach, experiment, or creative constraint you introduced.",
  };
  return map[section.title] ?? "Add metrics, ownership language, and a sharper result line.";
}

export default function CraftingPage() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { user } = useUser();
  const [sections, setSections] = useState<CraftSection[]>(buildInitialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftCar, setDraftCar] = useState<CarBlock>({ context: "", action: "", result: "" });
  const [draftPrompt, setDraftPrompt] = useState("");
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<string | null>(null);
  const regenBusyRef = useRef(false);
  const regenGenRef = useRef(0);

  const [journeyTipsOn, setJourneyTipsOn] = useState(false);
  const [journeyTipIdx, setJourneyTipIdx] = useState(0);

  useEffect(() => {
    const hydrated = hydrateCraftSectionsFromLocalStorage();
    if (hydrated) setSections(hydrated);
  }, []);

  useEffect(() => {
    const sync = () => {
      const st = readJourneyState();
      const onJourney = Boolean(st.active && !st.skipped && st.stepId === "story");
      const onPage = pathname.startsWith("/storyboard/crafting");
      setJourneyTipsOn(onJourney && onPage);
      if (!(onJourney && onPage)) setJourneyTipIdx(0);
    };
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
  }, [pathname]);

  const Tip = ({
    title,
    body,
    stepLabel,
    onNext,
    nextLabel = "Next",
    placement = "above",
  }: {
    title: string;
    body: React.ReactNode;
    stepLabel: string;
    onNext: () => void;
    nextLabel?: string;
    placement?: "above" | "below";
  }) => (
    <div
      className={[
        "absolute left-1/2 -translate-x-1/2 w-[380px] max-w-[92vw] rounded-[16px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(2,6,23,0.20)] px-4 py-3 z-30",
        placement === "above" ? "-top-3 -translate-y-full" : "top-full mt-3",
      ].join(" ")}
    >
      <div
        className={[
          "absolute left-1/2 -translate-x-1/2 w-0 h-0",
          placement === "above" ? "-bottom-2" : "-top-2",
        ].join(" ")}
        style={{
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          ...(placement === "above"
            ? {
                borderTop: "10px solid white",
                filter: "drop-shadow(0 -1px 0 rgba(0,0,0,0.08))",
              }
            : {
                borderBottom: "10px solid white",
                filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.08))",
              }),
        }}
      />
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0087A8]">Guide</p>
      <p className="mt-1 text-[13px] font-semibold text-[#0F172A]">{title}</p>
      <div className="mt-1 text-[12px] text-[#475569] leading-relaxed">{body}</div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#64748B]">{stepLabel}</p>
        <button
          type="button"
          onClick={onNext}
          className="h-8 px-3 rounded-[12px] bg-[#0087A8] text-white text-[12px] font-bold hover:bg-[#007592] transition-colors"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );

  const persistAll = useCallback((updater: CraftSection[] | ((prev: CraftSection[]) => CraftSection[])) => {
    setSections((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(STORYBOARD_CRAFTING_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const openEdit = (id: string) => {
    const s = sections.find((x) => x.id === id);
    if (!s) return;
    setEditingId(id);
    setDraftCar(isIntroSection(id) ? normalizeIntroBlock(s.car) : { ...s.car });
    setDraftPrompt(s.prompt);
    if (journeyTipsOn && journeyTipIdx === 1) setJourneyTipIdx(2);
  };

  const closeEdit = () => {
    regenGenRef.current += 1;
    regenBusyRef.current = false;
    setEditingId(null);
    setDraftPrompt("");
    setRegeneratingSectionId(null);
  };

  const saveSectionDraft = (id: string) => {
    persistAll((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const car = isIntroSection(id)
          ? { context: draftCar.context.trim(), action: "", result: "" }
          : { ...draftCar };
        return { ...s, car, prompt: draftPrompt };
      })
    );
    closeEdit();
  };

  const applyRegenerate = (id: string, promptText: string) => {
    if (regenBusyRef.current) return;
    const s = sections.find((x) => x.id === id);
    if (!s || s.regenerationsUsed >= MAX_REGENS_PER_SECTION) return;
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
        setDraftCar(nextCar);
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

  const applySuggestion = (id: string) => {
    const s = sections.find((x) => x.id === id);
    if (!s) return;
    setDraftPrompt(suggestionForSection(s));
  };

  const revertSection = (id: string) => {
    persistAll((prev) => {
      const s = prev.find((x) => x.id === id);
      if (!s || s.history.length === 0) return prev;
      const raw = s.history[s.history.length - 1];
      const restored = isIntroSection(id) ? normalizeIntroBlock(raw) : raw;
      const history = s.history.slice(0, -1);
      if (editingId === id) setDraftCar({ ...restored });
      return prev.map((sec) => (sec.id === id ? { ...sec, car: restored, history } : sec));
    });
  };

  const saveStoryboard = () => {
    try {
      localStorage.setItem(STORYBOARD_CRAFTING_STORAGE_KEY, JSON.stringify(sections));
      setSaveToast("Storyboard saved");
      setTimeout(() => setSaveToast(null), 2500);
      // Guided journey: storyboard step completes when the user saves.
      completeJourneyStep("story");
      router.push("/storyboard/1");
    } catch {
      setSaveToast("Could not save");
      setTimeout(() => setSaveToast(null), 2500);
    }
  };

  const roleTitle = user.role?.trim() || "Your storyboard";

  return (
    <div className="max-w-[760px] mx-auto px-6 py-10 pb-28 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <Link
          href="/storyboard"
          className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-60 text-slate-400"
        >
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <div className="flex items-center gap-2 relative">
          {journeyTipsOn && journeyTipIdx === 6 ? (
            <Tip
              title="Save to complete StoryBoard"
              body={
                <>
                  Save locks in your story. Once you save, we move you to{" "}
                  <span className="font-semibold text-[#0F172A]">Mock interview</span>.
                </>
              }
              stepLabel="Tip 7/7"
              onNext={() => setJourneyTipsOn(false)}
              nextLabel="Got it"
              placement="below"
            />
          ) : null}
          <button
            type="button"
            onClick={saveStoryboard}
            data-journey-id="story-save"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[12px] font-bold shadow-sm transition-opacity hover:opacity-90"
            style={{ background: TEAL }}
          >
            <Save size={14} />
            Save storyboard
          </button>
        </div>
      </div>

      {saveToast && (
        <div
          className="mb-6 text-center text-[13px] font-semibold text-[#0F172A] py-2 px-4 rounded-xl border border-slate-200 bg-white/80"
          role="status"
        >
          {saveToast}
        </div>
      )}

      <div className="text-center max-w-[700px] mx-auto mb-10 mt-2 flex flex-col items-center">
        <h1 className="text-4xl md:text-[44px] font-bold tracking-tight text-slate-900 leading-[1.15]">
          {roleTitle}
        </h1>
      </div>

      <div className="space-y-6 mt-10">
        {sections.map((section, idx) => {
          const isEditing = editingId === section.id;
          const creditsLeft = MAX_REGENS_PER_SECTION - section.regenerationsUsed;
          const isRegenerating = regeneratingSectionId === section.id;
          const canRegen = creditsLeft > 0 && !isRegenerating;
          const canSendRegen = creditsLeft > 0;
          const canRevert = section.history.length > 0;
          const score = mockStoryScore(section.id);
          const showProofyNudge = score < 2.5;
          const regenLeftStr = String(creditsLeft).padStart(2, "0");
          const regenMaxStr = String(MAX_REGENS_PER_SECTION).padStart(2, "0");

          return (
            <div
              key={section.id}
              style={STORYBOARD_GLASS_CARD}
              className={
                journeyTipsOn && idx === 1 && journeyTipIdx >= 0 && journeyTipIdx <= 5
                  ? "overflow-visible"
                  : "overflow-hidden"
              }
            >
              <div className="p-6 md:p-8 flex flex-col gap-5">
                {/* Header: title + score + actions (regen count only in edit panel) */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{ background: "rgba(0,135,168,0.1)", color: TEAL }}
                    >
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        {section.pillar}
                      </p>
                      <h3 className="text-[14px] font-bold uppercase tracking-widest text-slate-800">
                        {section.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <div
                      className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      data-journey-id={idx === 1 ? "story-craft-score" : undefined}
                    >
                      {journeyTipsOn && journeyTipIdx === 0 && idx === 1 ? (
                        <Tip
                          title="This score is a quick signal"
                          body={
                            <>
                              Higher = clearer context + impact. We’ll use it to make your story feel{" "}
                              <span className="font-semibold text-[#0F172A]">credible</span> and{" "}
                              <span className="font-semibold text-[#0F172A]">measurable</span>.
                            </>
                          }
                          stepLabel="Tip 1/7"
                          onNext={() => setJourneyTipIdx(1)}
                        />
                      ) : null}
                      <span className="text-[20px] font-bold tabular-nums text-[#0F172A] leading-none">
                        {score.toFixed(1)}
                      </span>
                      <span className="relative group inline-flex">
                        <button
                          type="button"
                          className="p-0.5 rounded text-slate-400 hover:text-[#0087A8] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#0087A8]/30"
                          aria-label="About story context score"
                        >
                          <Info size={14} strokeWidth={2} />
                        </button>
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute right-0 top-full z-20 mt-1 w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 shadow-lg opacity-0 translate-y-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
                        >
                          This is your story context score.
                        </span>
                      </span>
                    </div>

                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => openEdit(section.id)}
                        data-journey-id={idx === 1 ? "story-craft-edit" : undefined}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-600"
                      >
                        {journeyTipsOn && journeyTipIdx === 1 && idx === 1 ? (
                          <Tip
                            title="Open the editor"
                            body={
                              <>
                                Click <span className="font-semibold text-[#0F172A]">Edit</span> to refine your story using CAR.
                              </>
                            }
                            stepLabel="Tip 2/7"
                            onNext={() => openEdit(section.id)}
                            nextLabel="Edit"
                          />
                        ) : null}
                        <Edit3 size={12} /> Edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={closeEdit}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-500"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 1: single paragraph; others: full CAR */}
                {!isEditing ? (
                  <div className="flex flex-col gap-6 border-t border-slate-100 pt-5">
                    {isIntroSection(section.id) ? (
                      <CarBlockStack label="Introduction" accent="teal" text={section.car.context} />
                    ) : (
                      <>
                        <CarBlockStack label="Context" accent="slate" text={section.car.context} />
                        <CarBlockStack label="Action" accent="teal" text={section.car.action} />
                        <CarBlockStack label="Result" accent="emerald" text={section.car.result} />
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className="relative flex flex-col gap-5 border-t border-slate-100 pt-5"
                      data-journey-id={idx === 1 ? "story-craft-car" : undefined}
                    >
                      {journeyTipsOn && journeyTipIdx === 2 && idx === 1 ? (
                        <Tip
                          title="Refine with CAR"
                          body={
                            <>
                              Keep it tight: 2–3 sentences for{" "}
                              <span className="font-semibold text-[#0F172A]">Context</span>, bullet-like{" "}
                              <span className="font-semibold text-[#0F172A]">Action</span>, and a{" "}
                              <span className="font-semibold text-[#0F172A]">Result</span> with numbers if possible.
                            </>
                          }
                          stepLabel="Tip 3/7"
                          onNext={() => setJourneyTipIdx(3)}
                        />
                      ) : null}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 tabular-nums">
                          Version {section.history.length + 1}
                        </p>
                        {canRevert ? (
                          <button
                            type="button"
                            onClick={() => revertSection(section.id)}
                            disabled={isRegenerating}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <History size={12} /> Revert
                          </button>
                        ) : null}
                      </div>
                      {isRegenerating ? (
                        isIntroSection(section.id) ? (
                          <IntroFieldSkeleton />
                        ) : (
                          <CarFieldsSkeleton />
                        )
                      ) : isIntroSection(section.id) ? (
                        <CarField
                          label="Introduction"
                          value={draftCar.context}
                          rows={8}
                          onChange={(v) => setDraftCar((c) => ({ ...c, context: v, action: "", result: "" }))}
                        />
                      ) : (
                        <>
                          <CarField
                            label="Context"
                            value={draftCar.context}
                            onChange={(v) => setDraftCar((c) => ({ ...c, context: v }))}
                          />
                          <CarField
                            label="Action"
                            value={draftCar.action}
                            onChange={(v) => setDraftCar((c) => ({ ...c, action: v }))}
                          />
                          <CarField
                            label="Result"
                            value={draftCar.result}
                            onChange={(v) => setDraftCar((c) => ({ ...c, result: v }))}
                          />
                        </>
                      )}
                    </div>

                    {showProofyNudge && (
                      <div
                        className="relative rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-[13px] leading-relaxed text-amber-950"
                        role="status"
                        data-journey-id={idx === 1 ? "story-craft-suggestion" : undefined}
                      >
                        {journeyTipsOn && journeyTipIdx === 3 && idx === 1 ? (
                          <Tip
                            title="Use suggestions to upgrade impact"
                            body={
                              <>
                                This is the shortcut: it tells you what’s missing (ownership, decision-making, measurable outcomes).
                              </>
                            }
                            stepLabel="Tip 4/7"
                            onNext={() => setJourneyTipIdx(4)}
                          />
                        ) : null}
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800/90 mb-1">
                          Proofy suggestion
                        </p>
                        {PROOFY_LOW_SCORE_MESSAGE}
                      </div>
                    )}

                    {/* Bottom: chips above prompt; send inside input */}
                    <div
                      className="relative rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 space-y-3"
                      data-journey-id={idx === 1 ? "story-craft-regenerate" : undefined}
                    >
                      {journeyTipsOn && journeyTipIdx === 4 && idx === 1 ? (
                        <Tip
                          title="Regenerate (limited)"
                          body={
                            <>
                              Use chips for quick upgrades, or write a custom prompt. Each send uses 1 regeneration—make it count.
                            </>
                          }
                          stepLabel="Tip 5/7"
                          onNext={() => setJourneyTipIdx(5)}
                        />
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {PROMPT_CHIPS.map((c) => (
                          <button
                            key={c.label}
                            type="button"
                            disabled={isRegenerating}
                            onClick={() => setDraftPrompt(c.text)}
                            className="px-2.5 py-1.5 rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:border-[#0087A8]/35 hover:text-[#0087A8] hover:shadow-sm disabled:opacity-40 transition-all"
                          >
                            {c.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={isRegenerating}
                          onClick={() => applySuggestion(section.id)}
                          className="px-2.5 py-1.5 rounded-full border border-[#0087A8]/25 bg-[#0087A8]/5 text-[11px] font-semibold text-[#0087A8] hover:bg-[#0087A8]/10 disabled:opacity-40"
                        >
                          Competency playbook
                        </button>
                      </div>

                      <label className="text-[13px] font-semibold text-slate-700 block">
                        {isIntroSection(section.id)
                          ? "Add a prompt to regenerate this paragraph"
                          : "Add a prompt to regenerate your output"}
                      </label>
                      <div className="relative">
                        <textarea
                          value={draftPrompt}
                          onChange={(e) => setDraftPrompt(e.target.value)}
                          rows={3}
                          disabled={isRegenerating}
                          placeholder="Describe how you want this section to read—then send to regenerate."
                          className="w-full pl-3 pr-12 pt-2.5 pb-10 text-[13px] rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0087A8]/20 focus:border-[#0087A8] disabled:opacity-50 resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault();
                              if (canRegen) applyRegenerate(section.id, draftPrompt);
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={!canSendRegen}
                          onClick={() => applyRegenerate(section.id, draftPrompt)}
                          className="absolute right-2 bottom-2 h-9 w-9 rounded-lg flex items-center justify-center text-white shadow-sm transition-opacity disabled:opacity-35 disabled:cursor-not-allowed hover:opacity-90"
                          style={{ background: TEAL }}
                          title="Send prompt and regenerate output"
                          aria-label="Send prompt and regenerate"
                          aria-busy={isRegenerating}
                        >
                          {isRegenerating ? (
                            <Loader2 size={18} className="animate-spin" strokeWidth={2.25} />
                          ) : (
                            <CornerDownLeft size={16} strokeWidth={2.25} />
                          )}
                        </button>
                      </div>
                      <div
                        className="relative rounded-lg bg-white/80 border border-slate-100 px-3 py-2.5 space-y-1"
                        data-journey-id={idx === 1 ? "story-craft-regens-left" : undefined}
                      >
                        {journeyTipsOn && journeyTipIdx === 5 && idx === 1 ? (
                          <Tip
                            title="Regen counter"
                            body={
                              <>
                                You get <span className="font-semibold text-[#0F172A]">3 regenerations per section</span>. Revert restores the previous version if you don’t like the output.
                              </>
                            }
                            stepLabel="Tip 6/7"
                            onNext={() => setJourneyTipIdx(6)}
                          />
                        ) : null}
                        <p className="text-[12px] font-bold text-[#0F172A] tabular-nums">
                          <span className="text-[#0087A8]">{regenLeftStr}</span>
                          <span className="text-slate-400 font-medium"> of </span>
                          <span className="text-slate-500">{regenMaxStr}</span>
                          <span className="text-slate-600 font-semibold"> regenerations left</span>
                        </p>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Each send uses one regeneration. Revert above restores the previous{" "}
                          {isIntroSection(section.id) ? "paragraph" : "version"}.
                          {canRegen && !isRegenerating ? " ⌘/Ctrl+Enter to send." : ""}
                          {isRegenerating ? " Regenerating…" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={closeEdit}
                        className="px-4 py-2 text-[12px] font-bold text-slate-500 border border-slate-200 rounded-xl bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveSectionDraft(section.id)}
                        disabled={isRegenerating}
                        className="px-4 py-2 text-[12px] font-bold text-white rounded-xl disabled:opacity-40"
                        style={{ background: TEAL }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Save size={14} /> Save section
                        </span>
                      </button>
                    </div>
                  </>
                )}

                {!isEditing && showProofyNudge && (
                  <div
                    className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-[13px] leading-relaxed text-amber-950"
                    role="status"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800/90 mb-1">
                      Proofy suggestion
                    </p>
                    {PROOFY_LOW_SCORE_MESSAGE}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dev hint: pillar counts */}
      <p className="text-center text-[11px] text-slate-400 mt-8">
        Pillars: Thinking (3) · Action (3) · People (3) · Mastery (3) · plus Core Introduction.
      </p>
    </div>
  );
}

function CarField({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full p-3 text-[13px] rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0087A8]/15 resize-none"
      />
    </div>
  );
}

function CarFieldsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-hidden>
      {(["Context", "Action", "Result"] as const).map((label) => (
        <div key={label}>
          <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
          <div className="h-[120px] w-full rounded-xl bg-gradient-to-b from-slate-100 to-slate-50 border border-slate-200/90" />
        </div>
      ))}
      <p className="text-[12px] font-medium text-slate-400 text-center pt-1">Regenerating output…</p>
    </div>
  );
}

function IntroFieldSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-hidden>
      <div>
        <div className="h-3 w-28 bg-slate-200 rounded mb-2" />
        <div className="h-[200px] w-full rounded-xl bg-gradient-to-b from-slate-100 to-slate-50 border border-slate-200/90" />
      </div>
      <p className="text-[12px] font-medium text-slate-400 text-center pt-1">Regenerating paragraph…</p>
    </div>
  );
}
