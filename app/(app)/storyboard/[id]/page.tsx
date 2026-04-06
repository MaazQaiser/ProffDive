"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Edit3, Info, Save } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { CarBlockStack } from "@/components/storyboard-car-block-stack";
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

export default function StoryboardReadonlyPage() {
  const params = useParams<{ id: string }>();
  const { user } = useUser();
  const [sections, setSections] = useState<CraftSection[]>(buildInitialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftCar, setDraftCar] = useState<CarBlock>({ context: "", action: "", result: "" });

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

  return (
    <div className="max-w-[760px] mx-auto px-6 py-10 pb-28 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <Link
          href="/storyboard"
          className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-60 text-slate-400"
        >
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <button
          type="button"
          onClick={downloadResume}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-[12px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Download size={14} />
          Download resume
        </button>
      </div>

      <div className="text-center max-w-[700px] mx-auto mb-10 mt-2 flex flex-col items-center">
        <h1 className="text-4xl md:text-[44px] font-bold tracking-tight text-slate-900 leading-[1.15]">{roleTitle}</h1>
      </div>

      <div className="space-y-6 mt-10">
        {sections.map((section, idx) => {
          const isEditing = editingId === section.id;
          const score = mockStoryScore(section.id);
          const showProofyNudge = score < 2.5;

          return (
            <div key={section.id} style={STORYBOARD_GLASS_CARD} className="overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col gap-5">
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
                      <h3 className="text-[14px] font-bold uppercase tracking-widest text-slate-800">{section.title}</h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white">
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-600"
                      >
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

                <div className="flex flex-col gap-6 border-t border-slate-100 pt-5">
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
                </div>

                {isEditing && (
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
                      onClick={() => saveSection(section.id)}
                      className="px-4 py-2 text-[12px] font-bold text-white rounded-xl flex items-center gap-1.5"
                      style={{ background: TEAL }}
                    >
                      <Save size={14} /> Save section
                    </button>
                  </div>
                )}

                {showProofyNudge && (
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

      <p className="text-center text-[11px] text-slate-400 mt-8">
        Pillars: Thinking (3) · Action (3) · People (3) · Mastery (3) · plus Core Introduction.
      </p>
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
