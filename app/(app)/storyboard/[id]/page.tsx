"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Edit3, Info, Save } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { CarBlockStack } from "@/components/storyboard-car-block-stack";
import { StoryboardMindMap } from "@/components/storyboard/StoryboardMindMap";
import {
  TEAL,
  STORYBOARD_CRAFTING_STORAGE_KEY,
  STORYBOARD_GLASS_CARD,
  buildInitialSections,
  buildResumeExportText,
  hydrateCraftSectionsFromLocalStorage,
  isIntroSection,
  mockStoryScore,
  normalizeIntroBlock,
  PROOFY_LOW_SCORE_MESSAGE,
  type CarBlock,
  type CraftSection,
} from "@/lib/storyboard-crafting";

function purposeLineFor(sectionName: string): string {
  const map: Record<string, string> = {
    "Core introduction": "Interviewers use this to decide if they want to hear more. First impressions compound.",
    "ThinkProof Labs": "Interviewers ask about this to see if you diagnose before you act.",
    ClarityCore: "Interviewers ask about this to see how you decide what matters when everything feels urgent.",
    DecisionCraft: "Interviewers ask about this to see if you can make calls with imperfect information.",
    ActionProof: "Interviewers ask about this to see if you take responsibility for outcomes, not tasks.",
    ExecuteLab: "Interviewers ask about this to see if you move without being told—and finish.",
    MomentumWorks: "Interviewers ask about this to see how you respond when the plan breaks.",
    PeopleProof: "Interviewers ask about this to see if you can move people without authority.",
    AlignWorks: "Interviewers ask about this to see how you work across perspectives.",
    InfluenceCore: "Interviewers ask about this to see if others move better because of you.",
    MasteryProof: "Interviewers ask about this to see if your expertise holds up under pressure.",
    CraftCore: "Interviewers ask about this to see if you actually ship and drive outcomes.",
    SkillForge: "Interviewers ask about this to see if you can reframe problems and create leverage.",
  };
  return map[sectionName] ?? "Interviewers ask about this to see how you think and operate under pressure.";
}

export default function StoryboardReadonlyPage() {
  const params = useParams<{ id: string }>();
  const { user } = useUser();
  const [sections, setSections] = useState<CraftSection[]>(buildInitialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftCar, setDraftCar] = useState<CarBlock>({ context: "", action: "", result: "" });
  const [view, setView] = useState<"mindmap" | "panel">("mindmap");

  useEffect(() => {
    const hydrated = hydrateCraftSectionsFromLocalStorage();
    if (hydrated) setSections(hydrated);
  }, []);

  const persistSections = useCallback((next: CraftSection[]) => {
    setSections(next);
    try {
      localStorage.setItem(STORYBOARD_CRAFTING_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const openEdit = (id: string) => {
    const s = sections.find((x) => x.id === id);
    if (!s) return;
    setEditingId(id);
    setDraftCar(isIntroSection(id) ? normalizeIntroBlock(s.car) : { ...s.car });
  };

  const closeEdit = () => {
    setEditingId(null);
  };

  const saveSection = (id: string) => {
    const car = isIntroSection(id)
      ? { context: draftCar.context.trim(), action: "", result: "" }
      : { ...draftCar };
    const next = sections.map((s) => (s.id === id ? { ...s, car } : s));
    persistSections(next);
    setEditingId(null);
  };

  const storyboardId = params?.id ? String(params.id) : "storyboard";
  const roleTitle = user.role?.trim() || "Your storyboard";
  const userName = user.name?.trim() || "";

  const downloadResume = () => {
    const text = buildResumeExportText(sections, storyboardId);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proofdive-resume-storyboard-${storyboardId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const viewWrapClass = "max-w-3xl";

  const mindMapRole = useMemo(() => {
    return user.role?.trim() || roleTitle || "Role";
  }, [roleTitle, user.role]);

  return (
    <div
      className="min-h-[calc(100vh-64px)] animate-in fade-in duration-500"
      style={{ background: "var(--color-background-secondary)" }}
    >
      <div className={`${viewWrapClass} mx-auto px-6 py-10 pb-28`}>
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <Link
            href="/storyboard"
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-60"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <ArrowLeft size={16} /> Back to Hub
          </Link>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => setView((v) => (v === "mindmap" ? "panel" : "mindmap"))}
              className="px-4 py-2 rounded-xl bg-white text-[12px] font-bold hover:opacity-90 transition-opacity"
              style={{ border: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-primary)" }}
            >
              {view === "mindmap" ? "Panel view" : "Bird’s-eye view"}
            </button>
            <button
              type="button"
              onClick={downloadResume}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[12px] font-bold hover:opacity-90 transition-opacity"
              style={{ border: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-primary)" }}
            >
              <Download size={14} />
              Download resume
            </button>
          </div>
        </div>

        <div className="text-center max-w-[700px] mx-auto mb-10 mt-2 flex flex-col items-center">
          <h1 className="text-[26px] md:text-[34px] font-medium tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            {(userName || "Maaz") + ", here's your " + roleTitle + " story."}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Read through it like an interviewer would. Each section below is a structured answer built from your real experiences — ready to use in
            your mock interview and beyond.
          </p>
        </div>

        {view === "mindmap" ? (
          <div className="mt-10">
            <StoryboardMindMap userName={userName} userRole={mindMapRole} sections={sections} />
          </div>
        ) : (
          <div className="space-y-6 mt-10">
            {sections.map((section, idx) => {
              const isEditing = editingId === section.id;
              const score = mockStoryScore(section.id);
              const showProofyNudge = score < 2.5;
              const sectionName = isIntroSection(section.id) ? "Core introduction" : section.title;
              const pillarLabel = String(section.pillar || "")
                .replace(/\s*\(.*?\)\s*/g, " ")
                .trim()
                .toLowerCase();

              return (
                <div key={section.id} style={STORYBOARD_GLASS_CARD} className="overflow-hidden">
                  <div className="p-6 md:p-8 flex flex-col" style={{ gap: 16 }}>
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="shrink-0 grid place-items-center"
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background: "#E6F1FB",
                            fontSize: 11,
                            fontWeight: 600,
                            color: TEAL,
                          }}
                          aria-hidden="true"
                        >
                          {idx + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-2 min-w-0">
                            <p
                              className="text-[13px] font-medium truncate min-w-0"
                              style={{ color: "var(--color-text-primary)" }}
                              title={sectionName}
                            >
                              {sectionName}
                            </p>
                            <span
                              className="shrink-0 inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium"
                              style={{ background: "#E6F1FB", color: TEAL, borderRadius: 20 }}
                            >
                              {pillarLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                            Evidence strength
                          </span>
                          <span className="text-[16px] font-medium tabular-nums" style={{ color: "var(--color-text-primary)" }}>
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
                              style={{ border: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)" }}
                            >
                              A quick signal for how credible and interview-ready this section feels. Green ≥ 3.5, amber
                              2.5–3.4, red &lt; 2.5.
                            </span>
                          </span>
                        </div>

                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => openEdit(section.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-[12px] font-medium bg-white"
                            style={{
                              border: "0.5px solid var(--color-border-secondary)",
                              borderRadius: 8,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={closeEdit}
                            className="bg-white px-3.5 py-2 text-[12px] font-medium"
                            style={{
                              border: "0.5px solid var(--color-border-secondary)",
                              borderRadius: 8,
                              color: "var(--color-text-tertiary)",
                            }}
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Purpose line strip */}
                    <div
                      className="text-[12px] italic flex items-start gap-2"
                      style={{
                        padding: "10px 16px",
                        borderTop: "0.5px solid var(--color-border-tertiary)",
                        color: "var(--color-text-tertiary)",
                        background: "#E6F1FB",
                      }}
                    >
                      <span className="shrink-0 inline-flex mt-[1px]" aria-hidden="true" style={{ color: TEAL }}>
                        <Info size={14} strokeWidth={2} />
                      </span>
                      <span className="min-w-0">{purposeLineFor(sectionName)}</span>
                    </div>

                    {/* CAR blocks */}
                    <div className="flex flex-col" style={{ padding: "12px 16px 14px", gap: 12 }}>
                      {!isEditing ? (
                        isIntroSection(section.id) ? (
                          <CarBlockStack label="Introduction" accent="teal" text={section.car.context} />
                        ) : (
                          <>
                            <CarBlockStack label="Context" accent="slate" text={section.car.context} />
                            <CarBlockStack label="Action" accent="teal" text={section.car.action} />
                            <CarBlockStack label="Result" accent="emerald" text={section.car.result} />
                          </>
                        )
                      ) : isIntroSection(section.id) ? (
                        <StoryboardCarField
                          label="Introduction"
                          value={draftCar.context}
                          rows={8}
                          onChange={(v) => setDraftCar((c) => ({ ...c, context: v, action: "", result: "" }))}
                        />
                      ) : (
                        <div className="flex flex-col gap-5">
                          <StoryboardCarField
                            label="Context"
                            value={draftCar.context}
                            onChange={(v) => setDraftCar((c) => ({ ...c, context: v }))}
                          />
                          <StoryboardCarField
                            label="Action"
                            value={draftCar.action}
                            onChange={(v) => setDraftCar((c) => ({ ...c, action: v }))}
                          />
                          <StoryboardCarField
                            label="Result"
                            value={draftCar.result}
                            onChange={(v) => setDraftCar((c) => ({ ...c, result: v }))}
                          />
                        </div>
                      )}

                      {showProofyNudge && (
                        <div
                          style={{
                            background: "#E6F1FB",
                            border: "0.5px solid var(--color-border-tertiary)",
                            borderRadius: 10,
                            padding: "10px 12px",
                          }}
                          role="status"
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
                              aria-hidden="true"
                              style={{
                                width: 3,
                                alignSelf: "stretch",
                                borderRadius: 999,
                                background: TEAL,
                              }}
                            />
                            <p className="text-[12px]" style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                              {PROOFY_LOW_SCORE_MESSAGE}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={closeEdit}
                          className="bg-white px-3.5 py-2 text-[12px] font-medium"
                          style={{
                            border: "0.5px solid var(--color-border-secondary)",
                            borderRadius: 8,
                            color: "var(--color-text-tertiary)",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveSection(section.id)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold text-white"
                          style={{ background: TEAL, borderRadius: 8 }}
                        >
                          <Save size={14} /> Save section
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-[11px] mt-8" style={{ color: "var(--color-text-tertiary)" }}>
          Pillars: Thinking (3) · Action (3) · People (3) · Mastery (3) · plus Core Introduction.
        </p>
      </div>
    </div>
  );
}

function StoryboardCarField({
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
