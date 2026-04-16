"use client";

import Image from "next/image";
import Link from "next/link";
import { Urbanist } from "next/font/google";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download, Edit3, Info, Save } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { CarBlockStack } from "@/components/storyboard-car-block-stack";
import { StoryboardMindMap } from "@/components/storyboard/StoryboardMindMap";
import {
  buildInitialSections,
  buildInitialSectionsForRole,
  buildResumeExportText,
  hydrateCraftSectionsFromLocalStorage,
  isIntroSection,
  markExperienceCraftSaved,
  mockStoryScore,
  normalizeIntroBlock,
  PROOFY_LOW_SCORE_MESSAGE,
  type CarBlock,
  type CraftSection,
} from "@/lib/storyboard-crafting";
import {
  findExperienceContext,
  listExperienceLabelsForRole,
  resolveCraftStorageKeyForExperienceId,
} from "@/lib/storyboard-library";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const glassCard =
  "relative overflow-hidden rounded-[24px] border border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

const ACCENT = "#0A89A9";

/** Match dashboard score heat */
function scoreBandColor(v: number): string {
  if (v < 2.5) return "#EF4444";
  if (v < 3.5) return "#D97706";
  return "#059669";
}

function purposeLineFor(sectionName: string): string {
  const map: Record<string, string> = {
    "Core introduction": "Interviewers use this to decide if they want to hear more. First impressions compound.",
    "Analytical Thinking": "Interviewers ask about this to see if you diagnose before you act.",
    Prioritization: "Interviewers ask about this to see how you decide what matters when everything feels urgent.",
    "Decision-Making Agility": "Interviewers ask about this to see if you can make calls with imperfect information.",
    Ownership: "Interviewers ask about this to see if you take responsibility for outcomes, not tasks.",
    "Initiative & Follow-through": "Interviewers ask about this to see if you move without being told—and finish.",
    "Embraces Change": "Interviewers ask about this to see how you respond when the plan breaks.",
    Influence: "Interviewers ask about this to see if you can move people without authority.",
    "Collaboration & Inclusion": "Interviewers ask about this to see how you work across perspectives.",
    "Grows Capability": "Interviewers ask about this to see if others move better because of you.",
    "Functional Knowledge": "Interviewers ask about this to see if your expertise holds up under pressure.",
    Execution: "Interviewers ask about this to see if you actually ship and drive outcomes.",
    Innovation: "Interviewers ask about this to see if you can reframe problems and create leverage.",
  };
  return map[sectionName] ?? "Interviewers ask about this to see how you think and operate under pressure.";
}

export default function BackupStoryboardReadonlyPage() {
  const params = useParams<{ id: string }>();
  const { user } = useUser();
  const experienceId = params?.id ? String(params.id) : "";
  const craftKeyRef = useRef(resolveCraftStorageKeyForExperienceId(experienceId || null));
  const [sections, setSections] = useState<CraftSection[]>(buildInitialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftCar, setDraftCar] = useState<CarBlock>({ context: "", action: "", result: "" });
  const [view, setView] = useState<"mindmap" | "panel">("mindmap");

  const experienceCtx = useMemo(() => (experienceId ? findExperienceContext(experienceId) : null), [experienceId]);

  useEffect(() => {
    const id = params?.id ? String(params.id) : "";
    const key = resolveCraftStorageKeyForExperienceId(id || null);
    craftKeyRef.current = key;
    if (id) {
      markExperienceCraftSaved(id);
    }
    const ctx = id ? findExperienceContext(id) : null;
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
  }, [params?.id, user.role, user.targetRole]);

  const persistSections = useCallback((next: CraftSection[]) => {
    setSections(next);
    try {
      localStorage.setItem(craftKeyRef.current, JSON.stringify(next));
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

  const storyboardId = experienceId || "storyboard";
  const roleTitle = experienceCtx?.roleTitle ?? user.role?.trim() ?? "Your storyboard";
  const userName = user.name?.trim() || "";
  const firstName = useMemo(() => user.name?.trim().split(" ")[0] || "Maaz", [user.name]);

  const downloadStory = () => {
    const text = buildResumeExportText(sections, storyboardId);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proofdive-story-${storyboardId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const mindMapRole = useMemo(() => {
    return experienceCtx?.roleTitle || user.role?.trim() || roleTitle || "Role";
  }, [experienceCtx?.roleTitle, roleTitle, user.role]);

  return (
    <div className={`${urbanist.className} relative min-h-[calc(100vh-64px)] overflow-x-hidden animate-in fade-in duration-500`}>
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6 pb-28">
        <div className="pointer-events-none invisible absolute left-[-251px] top-[66px] z-[1] h-[1127px] w-[1127px] opacity-45" aria-hidden>
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        <header className="relative z-[1] mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <Link
              href="/storyboard/backup"
              className="proofy-dock-round-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-[80px] border border-slate-300 bg-white/60 shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)] backdrop-blur-[21px] transition-colors hover:bg-white/80"
              aria-label="Back to storyboards"
            >
              <ArrowLeft size={16} className="text-slate-600" strokeWidth={2} aria-hidden />
            </Link>
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-[14px] leading-tight">
              <Link href="/storyboard/backup" className="shrink-0 font-medium text-[#64748B] transition-colors hover:text-[#1E293B]">
                StoryBoard
              </Link>
              <span className="shrink-0 text-[#CBD5E1]" aria-hidden>
                /
              </span>
              <span className="min-w-0 truncate font-semibold text-[#1E293B]" title={`${roleTitle} story`}>
                {roleTitle} story
              </span>
              <span className="inline-flex shrink-0 items-center rounded-full border border-white/90 bg-[linear-gradient(90.31deg,rgba(177,226,255,0.35)_0%,rgba(230,248,255,0.55)_99.92%)] px-2.5 py-0.5 text-[14px] font-semibold text-[#0A89A9]">
                {sections.length} sections
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setView((v) => (v === "mindmap" ? "panel" : "mindmap"))}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/60 px-4 py-2 text-[13px] font-medium text-[#475569] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px] transition-[background-color,box-shadow] hover:bg-white/80"
            >
              {view === "mindmap" ? "Panel view" : "Bird’s-eye view"}
              <ArrowUpRight size={14} className="text-[#94A3B8]" aria-hidden />
            </button>
            <button
              type="button"
              onClick={downloadStory}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/60 px-4 py-2 text-[13px] font-medium text-[#475569] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px] transition-[background-color,box-shadow] hover:bg-white/80"
            >
              <Download size={14} strokeWidth={2} aria-hidden />
              Download story
            </button>
          </div>
        </header>

        <section className="relative z-[1] mb-6 flex flex-col items-center gap-3 px-4 text-center">
          <h1 className="max-w-[min(100%,920px)] text-[28px] font-normal leading-snug md:text-[34px]">
            <span className="text-[#334155]">{firstName}</span>
            <span className="text-[#334155]">, your </span>
            <span className="text-[#334155]">{roleTitle}</span>
            <span className="text-[#0A89A9]"> story is ready — </span>
            <span className="text-[#334155]">
              structured answers from your real experiences, built for your mock and beyond.
            </span>
          </h1>
        </section>

        {view === "mindmap" ? (
          <div className={`relative z-[1] mt-6 ${glassCard} border-[0.5px] p-3 sm:p-4`}>
            <StoryboardMindMap userName={userName} userRole={mindMapRole} sections={sections} />
          </div>
        ) : (
          <div className="relative z-[1] mx-auto mt-6 max-w-3xl space-y-4">
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
                <div key={section.id} id={`storyboard-section-${section.id}`} className={`${glassCard} overflow-hidden border-[0.5px]`}>
                  <div className="flex flex-col gap-4 p-6 md:p-8">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md text-[11px] font-semibold"
                          style={{
                            background: "linear-gradient(90.31deg, rgba(209, 250, 229, 0.5) 0%, rgba(236, 253, 245, 0.65) 99.92%)",
                            color: ACCENT,
                            border: "0.5px solid rgba(10, 137, 169, 0.2)",
                          }}
                          aria-hidden="true"
                        >
                          {idx + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <p className="min-w-0 truncate text-[15px] font-medium text-[#1E293B]" title={sectionName}>
                              {sectionName}
                            </p>
                            <span className="inline-flex shrink-0 items-center rounded-full border border-white/90 bg-[linear-gradient(90.31deg,rgba(177,226,255,0.35)_0%,rgba(230,248,255,0.55)_99.92%)] px-2.5 py-0.5 text-[10px] font-medium capitalize text-[#0A89A9]">
                              {pillarLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#64748B]">Evidence strength</span>
                          <span className="text-[18px] font-semibold tabular-nums" style={{ color: scoreBandColor(score) }}>
                            {score.toFixed(1)}
                          </span>
                          <span className="group relative inline-flex">
                            <button
                              type="button"
                              className="rounded p-1 text-[#94A3B8] transition-colors hover:text-[#64748B]"
                              aria-label="About evidence strength score"
                            >
                              <Info size={14} strokeWidth={2} />
                            </button>
                            <span
                              role="tooltip"
                              className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-[220px] translate-y-1 rounded-[12px] border border-[#E2E8F0] bg-white/95 px-3 py-2 text-[11px] font-medium text-[#475569] opacity-0 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
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
                            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-3 py-2 text-[12px] font-medium text-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-[21px] transition-colors hover:bg-white"
                          >
                            <Edit3 size={14} strokeWidth={2} aria-hidden />
                            Edit
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={closeEdit}
                            className="rounded-full border border-slate-300 bg-white/70 px-3.5 py-2 text-[12px] font-medium text-[#64748B] backdrop-blur-[21px] transition-colors hover:bg-white"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-px w-full bg-[#E2E8F0]" aria-hidden />

                    {/* Purpose line strip */}
                    <div className="flex items-start gap-2 rounded-[16px] border border-[#E2E8F0] bg-[linear-gradient(90.31deg,rgba(177,226,255,0.2)_0%,rgba(255,255,255,0.5)_99.92%)] px-4 py-2.5 text-[12px] italic text-[#64748B]">
                      <span className="mt-[1px] inline-flex shrink-0 text-[#0A89A9]" aria-hidden="true">
                        <Info size={14} strokeWidth={2} />
                      </span>
                      <span className="min-w-0">{purposeLineFor(sectionName)}</span>
                    </div>

                    {/* CAR blocks */}
                    <div className="flex flex-col gap-3 rounded-[16px] border border-[#E2E8F0]/80 bg-white/30 px-4 py-3">
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
                          <StoryboardCarField label="Context" value={draftCar.context} onChange={(v) => setDraftCar((c) => ({ ...c, context: v }))} />
                          <StoryboardCarField label="Action" value={draftCar.action} onChange={(v) => setDraftCar((c) => ({ ...c, action: v }))} />
                          <StoryboardCarField label="Result" value={draftCar.result} onChange={(v) => setDraftCar((c) => ({ ...c, result: v }))} />
                        </div>
                      )}

                      {showProofyNudge && (
                        <div
                          className="rounded-[12px] border border-[#E2E8F0] bg-[linear-gradient(90.31deg,rgba(177,226,255,0.35)_0%,rgba(255,255,255,0.65)_99.92%)] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                          role="status"
                        >
                          <div className="flex items-center gap-2">
                            <span aria-hidden="true" className="inline-flex text-[#0A89A9]">
                              <Info size={14} strokeWidth={2} />
                            </span>
                            <span className="text-[11px] font-semibold text-[#1E293B]">AI coach suggestion</span>
                          </div>

                          <div className="mt-2 flex items-start gap-2">
                            <div aria-hidden="true" className="w-[3px] shrink-0 self-stretch rounded-full bg-[#0A89A9]" />
                            <p className="text-[12px] leading-relaxed text-[#475569]">{PROOFY_LOW_SCORE_MESSAGE}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
                        <button
                          type="button"
                          onClick={closeEdit}
                          className="rounded-full border border-slate-300 bg-white/70 px-3.5 py-2 text-[12px] font-medium text-[#64748B] backdrop-blur-[21px] transition-colors hover:bg-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveSection(section.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-[#0A89A9] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-[filter] hover:brightness-105"
                        >
                          <Save size={14} strokeWidth={2} aria-hidden /> Save section
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="relative z-[1] mt-8 text-center text-[11px] text-[#94A3B8]">
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
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-none rounded-[16px] border border-[#E2E8F0] bg-white/90 p-3 text-[13px] text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0A89A9]/20"
      />
    </div>
  );
}

