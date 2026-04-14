"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Urbanist } from "next/font/google";
import { ArrowRight, Check, ChevronDown, Mic, Plus } from "lucide-react";
import { Chip } from "@/components/Chip";
import { ROLES, SUGGESTIVE_ROLE_CHIPS } from "@/lib/role-options";
import { useUser } from "@/lib/user-context";
import {
  addExperienceToRole,
  addRoleWithExperiences,
  readLibraryWithMigration,
  setRoleExperiences,
  type StoryboardLibrary,
  type StoryRole,
} from "@/lib/storyboard-library";
import {
  getSpeechRecognition,
  type WebSpeechRecognition,
  type WebSpeechResultEvent,
} from "@/lib/proofy-speech";
import {
  craftCtaLabel,
  craftStatusLabel,
  readRoleCraftUiStatus,
  resolveRoleCraftAction,
  roleCraftProgressPercent,
} from "@/lib/storyboard-crafting";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const innerRow =
  "relative flex items-center justify-between rounded-[16px] bg-white/40 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

/** Single role card shell (header + optional accordion) */
const roleHubCard =
  "relative flex w-full flex-col overflow-hidden rounded-[16px] bg-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

const dashedCtaInner =
  "relative flex min-h-[72px] w-full cursor-pointer flex-col items-center justify-center rounded-[24px] border border-[#CBD5E1] bg-white/10 px-4 py-3 text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px] transition-[border-color,background-color] hover:border-[#94A3B8] hover:bg-white/20";

const textareaFlat =
  "w-full min-h-[100px] resize-y rounded-[16px] border border-[#CBD5E1] bg-white/50 px-4 py-3 text-[14px] leading-relaxed text-[#1E293B] shadow-[0_2px_12px_rgba(0,0,0,0.04)] outline-none placeholder:text-[#94A3B8] focus:border-[#0A89A9]/35 focus:ring-2 focus:ring-[#0A89A9]/12";

/** Insphere SaaS V2 · node `883:7420` — experience composer row */
const PLAN_EXPERIENCE_CHAR_LIMIT = 400;

type PlanPhase = "role" | "experiences";

export default function StoryBoardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [library, setLibrary] = useState<StoryboardLibrary>({ version: 1, roles: [] });
  const [mounted, setMounted] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [planPhase, setPlanPhase] = useState<PlanPhase>("role");
  const [roleConfirmPulse, setRoleConfirmPulse] = useState(false);
  const [draftRole, setDraftRole] = useState("");
  const [showRoleSugg, setShowRoleSugg] = useState(false);
  const planRoleInputRef = useRef<HTMLInputElement>(null);
  const planRolePanelRef = useRef<HTMLDivElement>(null);
  const planRoleChevronRef = useRef<HTMLButtonElement>(null);
  /** Committed lines for the open plan; current line is typed in `planComposer`. */
  const [planExperienceLines, setPlanExperienceLines] = useState<string[]>([]);
  const [planComposer, setPlanComposer] = useState("");
  const [planEditingIndex, setPlanEditingIndex] = useState<number | null>(null);
  const [planEditingText, setPlanEditingText] = useState("");
  const [planEditingRoleId, setPlanEditingRoleId] = useState<string | null>(null);
  const planExpRecognitionRef = useRef<WebSpeechRecognition | null>(null);
  const planExperienceInputRef = useRef<HTMLInputElement>(null);
  const [planExpRecording, setPlanExpRecording] = useState(false);
  const [addJourneyForRoleId, setAddJourneyForRoleId] = useState<string | null>(null);
  const [newExperienceBlocks, setNewExperienceBlocks] = useState<string[]>([""]);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

  const roleFallback = useMemo(
    () => (user.targetRole || user.role || "My role").trim(),
    [user.targetRole, user.role]
  );
  const firstName = useMemo(() => user.name?.trim().split(/\s+/)[0] || "Maaz", [user.name]);

  const filteredPlanRoles = useMemo(() => {
    const q = draftRole.trim().toLowerCase();
    if (!q) return [...ROLES].slice(0, 8);
    return [...ROLES].filter((r) => r.toLowerCase().includes(q)).slice(0, 10);
  }, [draftRole]);

  const refreshLibrary = useCallback(() => {
    setLibrary(readLibraryWithMigration(roleFallback));
  }, [roleFallback]);

  const openPlanForRoleId = useCallback(
    (roleId: string) => {
      if (!roleId) return;
      const lib = readLibraryWithMigration(roleFallback);
      const role = lib.roles.find((r) => r.id === roleId);
      if (!role) return;
      setExpandedRoleId(roleId);
      setPlanEditingRoleId(roleId);
      setDraftRole(role.title);
      setPlanExperienceLines(role.experiences.map((e) => e.label));
      setPlanComposer("");
      setPlanEditingIndex(null);
      setPlanEditingText("");
      setPlanPhase("experiences");
      setPlanOpen(true);
      setAddJourneyForRoleId(null);
      setNewExperienceBlocks([""]);
      queueMicrotask(() => planExperienceInputRef.current?.focus());
    },
    [roleFallback]
  );

  useEffect(() => {
    setMounted(true);
    refreshLibrary();
  }, [refreshLibrary]);

  useEffect(() => {
    try {
      const pre = new URLSearchParams(window.location.search).get("prefillRole")?.trim() ?? "";
      if (!pre) return;
      setDraftRole(pre);
      setPlanOpen(true);
      setPlanPhase("role");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const openRoleId = params.get("openRoleId")?.trim() ?? "";
      const openAdd = params.get("openAddExperience")?.trim() ?? "";
      const openPlan = params.get("openPlanExperiences")?.trim() ?? "";
      if (!openRoleId) return;
      // Expand the role accordion so journeys are visible.
      setExpandedRoleId(openRoleId);
      const shouldOpenPlan =
        openPlan === "1" ||
        openPlan.toLowerCase() === "true" ||
        openAdd === "1" ||
        openAdd.toLowerCase() === "true";

      if (shouldOpenPlan) {
        openPlanForRoleId(openRoleId);
      }
    } catch {
      /* ignore */
    }
  }, [openPlanForRoleId]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (planRoleInputRef.current?.closest(".storyboard-plan-role-wrap")?.contains(t)) return;
      if (planRolePanelRef.current?.contains(t)) return;
      if (planRoleChevronRef.current?.contains(t)) return;
      setShowRoleSugg(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const MIN_PLAN_EXPERIENCES = 3;
  const MAX_PLAN_EXPERIENCES = 5;

  const experienceLabelsFromDrafts = () => {
    const lines = planExperienceLines.map((j) => j.trim()).filter(Boolean);
    if (lines.length >= MAX_PLAN_EXPERIENCES) return lines.slice(0, MAX_PLAN_EXPERIENCES);
    const tail = planComposer.trim();
    if (tail) return [...lines, tail];
    return lines;
  };

  const planExperienceAtCapacity = planExperienceLines.length >= MAX_PLAN_EXPERIENCES;

  const planRoleTitle = draftRole.trim();
  const planExperienceCount = experienceLabelsFromDrafts().length;
  const canSubmitPlan =
    planRoleTitle.length > 0 &&
    planExperienceCount >= MIN_PLAN_EXPERIENCES &&
    planExperienceCount <= MAX_PLAN_EXPERIENCES;

  const startFirstJourney = (roleTitle: string, experienceId: string) => {
    const q = new URLSearchParams({
      experienceId,
      role: roleTitle.trim(),
    });
    router.push(`/storyboard/new?${q.toString()}`);
  };

  const resetPlanForm = () => {
    setPlanPhase("role");
    setRoleConfirmPulse(false);
    setDraftRole("");
    setShowRoleSugg(false);
    setPlanExperienceLines([]);
    setPlanComposer("");
    setPlanEditingIndex(null);
    setPlanEditingText("");
    setPlanEditingRoleId(null);
    try {
      planExpRecognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    planExpRecognitionRef.current = null;
    setPlanExpRecording(false);
  };

  useEffect(() => {
    return () => {
      try {
        planExpRecognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const pickPlanRole = (value: string) => {
    setDraftRole(value);
    setShowRoleSugg(false);
    planRoleInputRef.current?.focus();
  };

  const handlePlanSubmit = () => {
    if (!canSubmitPlan) return;
    const title = planRoleTitle;
    const labels = experienceLabelsFromDrafts();
    if (planEditingRoleId) {
      setRoleExperiences(planEditingRoleId, labels);
    } else {
      addRoleWithExperiences(title, labels);
    }
    refreshLibrary();
    setPlanOpen(false);
    resetPlanForm();
  };

  const commitPlanExperience = () => {
    const t = planComposer.trim();
    if (!t || planExperienceLines.length >= MAX_PLAN_EXPERIENCES) return;
    setPlanExperienceLines((rows) => [...rows, t]);
    setPlanComposer("");
  };

  const removePlanExperienceLine = (idx: number) => {
    setPlanEditingIndex(null);
    setPlanEditingText("");
    setPlanExperienceLines((rows) => rows.filter((_, i) => i !== idx));
  };

  const startPlanExperienceEdit = (idx: number) => {
    setPlanEditingIndex(idx);
    setPlanEditingText(planExperienceLines[idx] ?? "");
  };

  const savePlanExperienceEdit = () => {
    if (planEditingIndex === null) return;
    const t = planEditingText.trim().slice(0, PLAN_EXPERIENCE_CHAR_LIMIT);
    if (!t) return;
    setPlanExperienceLines((rows) => rows.map((line, i) => (i === planEditingIndex ? t : line)));
    setPlanEditingIndex(null);
    setPlanEditingText("");
  };

  const cancelPlanExperienceEdit = () => {
    setPlanEditingIndex(null);
    setPlanEditingText("");
  };

  const togglePlanExperienceVoice = () => {
    if (planExperienceAtCapacity) return;
    if (planExpRecording) {
      planExpRecognitionRef.current?.stop();
      setPlanExpRecording(false);
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) {
      window.alert("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SR() as WebSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
    const base = planComposer;
    recognition.onresult = (event: WebSpeechResultEvent) => {
      let interim = "",
        final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      const next = (base + (base ? " " : "") + final + interim).slice(0, PLAN_EXPERIENCE_CHAR_LIMIT);
      setPlanComposer(next);
    };
    recognition.onerror = () => setPlanExpRecording(false);
    recognition.onend = () => setPlanExpRecording(false);
    recognition.start();
    planExpRecognitionRef.current = recognition;
    setPlanExpRecording(true);
  };

  const openPlanNewRole = () => {
    resetPlanForm();
    setPlanOpen(true);
  };

  const handleContinueFromRole = () => {
    if (!planRoleTitle) return;
    setRoleConfirmPulse(true);
    window.setTimeout(() => {
      setPlanPhase("experiences");
      setRoleConfirmPulse(false);
    }, 520);
  };

  const handleAddJourneyToRole = (role: StoryRole) => {
    const labels = newExperienceBlocks.map((b) => b.trim()).filter(Boolean);
    if (labels.length === 0 || !addJourneyForRoleId) return;
    const first = labels[0];
    const rest = labels.slice(1);
    let firstId: string | null = null;
    const exp = addExperienceToRole(role.id, first);
    if (exp) firstId = exp.id;
    for (const label of rest) {
      addExperienceToRole(role.id, label);
    }
    setNewExperienceBlocks([""]);
    setAddJourneyForRoleId(null);
    refreshLibrary();
    if (firstId) startFirstJourney(role.title, firstId);
  };

  const hasNoRoles = mounted && library.roles.length === 0;

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-x-hidden pb-20`}>
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6">
        <div className="pointer-events-none invisible absolute left-[-251px] top-[66px] z-[1] h-[1127px] w-[1127px] opacity-45" aria-hidden>
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        {/* Match dashboard: centered column + same horizontal padding as dashboard hero */}
        <section className="relative z-[1] flex w-full flex-col items-center gap-6 px-8 py-3">
          <div className="flex w-full flex-col items-center pt-3 animate-in fade-in duration-500">
            <h1 className="mx-auto w-full max-w-[640px] text-center text-[34px] font-normal leading-normal text-[#334155]">
              {planOpen && planPhase === "experiences" ? (
                <>
                  <span className="text-[#334155]">{firstName}, </span>
                  <span className="text-[#0A89A9]">Add a journey</span>
                  <span className="text-[#334155]"> for </span>
                  <span className="text-[#0A89A9]">{planRoleTitle || "this role"}</span>
                  <span className="text-[#334155]">.</span>
                </>
              ) : planOpen ? (
                <>
                  <span className="text-[#334155]">{firstName}, </span>
                  <span className="text-[#0A89A9]">Add a role</span>
                  <span className="text-[#334155]"> for your upcoming interview prep.</span>
                </>
              ) : (
                <>
                  <span className="text-[#334155]">{firstName}, your story is </span>
                  <span className="text-[#0A89A9]">already there.</span>
                  <span className="text-[#334155]"> We just help you </span>
                  <span className="text-[#0A89A9]">find it.</span>
                </>
              )}
            </h1>
          </div>

          <div className="relative z-10 w-full">
            {!mounted ? (
              <p className="mt-8 text-center text-[14px] text-[#64748B]">Loading…</p>
            ) : hasNoRoles && !planOpen ? (
              <div className="mx-auto mt-8 flex max-w-[min(100%,920px)] flex-col items-center text-center">
                <p className="max-w-md text-[14px] leading-relaxed text-[#64748B]">
                  Add a target role to your profile to seed your first storyboard, or start by adding a role here.
                </p>
                <button
                  type="button"
                  onClick={() => setPlanOpen(true)}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#0A89A9] px-6 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Add a role
                </button>
              </div>
            ) : null}

            {mounted && (!hasNoRoles || planOpen) ? (
              <div className="mx-auto mt-6 flex w-full max-w-[684px] flex-col gap-5">
                {planOpen ? (
                  <div className="w-full">
                    {planPhase === "role" ? (
                      <div
                        className={`transition-opacity duration-500 ease-out ${roleConfirmPulse ? "pointer-events-none opacity-40" : "opacity-100"}`}
                      >
                        <div className="storyboard-plan-role-wrap relative z-10 w-full text-left">
                          <label htmlFor="storyboard-plan-role-input" className="sr-only">
                            Target role
                          </label>
                          <div className="relative flex items-stretch">
                            <input
                              id="storyboard-plan-role-input"
                              ref={planRoleInputRef}
                              value={draftRole}
                              onChange={(e) => {
                                setDraftRole(e.target.value);
                                setShowRoleSugg(true);
                              }}
                              onFocus={() => setShowRoleSugg(true)}
                              autoComplete="off"
                              className="h-[48px] w-full rounded-xl border-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.4)_100%)] py-2 pl-4 pr-12 text-[14px] text-[#0F172A] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.05)] outline-none backdrop-blur-[40px] transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-[#0087A8]/15"
                              placeholder="e.g. Product Manager, UX Designer…"
                              aria-expanded={showRoleSugg}
                              aria-controls="storyboard-plan-role-listbox"
                              aria-autocomplete="list"
                            />
                            <button
                              ref={planRoleChevronRef}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setShowRoleSugg((o) => !o);
                                requestAnimationFrame(() => planRoleInputRef.current?.focus());
                              }}
                              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-[#0F172A] focus-visible:ring-2 focus-visible:ring-[#0087A8]/30"
                              aria-label={showRoleSugg ? "Close role suggestions" : "Open role suggestions"}
                            >
                              <ChevronDown
                                size={22}
                                strokeWidth={2}
                                className={`transition-transform duration-200 ${showRoleSugg ? "rotate-180" : ""}`}
                                aria-hidden
                              />
                            </button>
                          </div>

                          {showRoleSugg ? (
                            <div
                              ref={planRolePanelRef}
                              id="storyboard-plan-role-listbox"
                              role="listbox"
                              className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl"
                            >
                              <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                                {!draftRole.trim() && (
                                  <p className="border-b border-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Popular roles
                                  </p>
                                )}
                                {draftRole.trim() && filteredPlanRoles.length === 0 ? (
                                  <p className="px-4 py-4 text-[13px] text-slate-500">
                                    No matches — try another spelling.
                                  </p>
                                ) : (
                                  filteredPlanRoles.map((s) => (
                                    <button
                                      key={s}
                                      type="button"
                                      role="option"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => pickPlanRole(s)}
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

                        <div className="mt-5 text-left">
                          <p className="mb-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Suggested roles
                          </p>
                          <div className="flex flex-wrap justify-start gap-2">
                            {SUGGESTIVE_ROLE_CHIPS.map((chip) => (
                              <Chip key={`plan-${chip}`} selected={draftRole.trim() === chip} onClick={() => pickPlanRole(chip)}>
                                {chip}
                              </Chip>
                            ))}
                          </div>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            disabled={!planRoleTitle || roleConfirmPulse}
                            onClick={handleContinueFromRole}
                            className="inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-2 rounded-full bg-[#0A89A9] px-5 text-[14px] font-medium text-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-[filter,opacity] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <span>Continue</span>
                            <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden>
                              <ArrowRight
                                size={18}
                                strokeWidth={2}
                                className={`absolute transition-all duration-300 ease-out ${
                                  roleConfirmPulse ? "scale-75 opacity-0" : "scale-100 opacity-100"
                                }`}
                              />
                              <Check
                                size={18}
                                strokeWidth={2.5}
                                className={`absolute text-white transition-all duration-300 ease-out ${
                                  roleConfirmPulse ? "scale-100 opacity-100" : "scale-75 opacity-0"
                                }`}
                              />
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPlanOpen(false);
                              resetPlanForm();
                            }}
                            className="text-[13px] font-medium text-[#64748B] hover:text-[#1E293B]"
                          >
                            {library.roles.length === 0 ? "Close" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mx-auto w-full max-w-[792px] animate-in fade-in duration-500">
                        <div className="mt-5 flex flex-col gap-4">
                          {planExperienceLines.map((line, idx) => (
                            <div
                              key={`${idx}-${line.slice(0, 24)}`}
                              className="flex flex-col gap-1.5 rounded-[14px] border border-[#E2E8F0]/90 bg-white/40 px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-[12px] font-medium text-[#64748B]">Experience {idx + 1}</p>
                                <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
                                  {planEditingIndex === idx ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={savePlanExperienceEdit}
                                        disabled={!planEditingText.trim()}
                                        className="text-[12px] font-semibold text-[#0A89A9] transition-colors hover:text-[#088299] disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={cancelPlanExperienceEdit}
                                        className="text-[12px] font-medium text-[#64748B] hover:text-[#1E293B]"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => startPlanExperienceEdit(idx)}
                                        className="text-[12px] font-semibold text-[#0A89A9] transition-colors hover:text-[#088299]"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removePlanExperienceLine(idx)}
                                        className="text-[12px] font-medium text-[#94A3B8] hover:text-[#64748B]"
                                      >
                                        Remove
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              {planEditingIndex === idx ? (
                                <textarea
                                  value={planEditingText}
                                  onChange={(e) =>
                                    setPlanEditingText(e.target.value.slice(0, PLAN_EXPERIENCE_CHAR_LIMIT))
                                  }
                                  rows={4}
                                  maxLength={PLAN_EXPERIENCE_CHAR_LIMIT}
                                  className={textareaFlat}
                                  aria-label={`Edit experience ${idx + 1}`}
                                />
                              ) : (
                                <p className="text-[14px] leading-relaxed text-[#1E293B]">{line}</p>
                              )}
                            </div>
                          ))}

                          {planExperienceAtCapacity ? (
                            <p className="text-[12px] text-[#94A3B8]">
                              Maximum {MAX_PLAN_EXPERIENCES} experiences per role.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <div className="flex w-full items-center justify-between border-b-[0.5px] border-[#0087A8] py-2 pl-[10px] pr-1.5 shadow-none">
                                <input
                                  id="storyboard-plan-experience-input"
                                  ref={planExperienceInputRef}
                                  type="text"
                                  value={planComposer}
                                  maxLength={PLAN_EXPERIENCE_CHAR_LIMIT}
                                  onChange={(e) =>
                                    setPlanComposer(e.target.value.slice(0, PLAN_EXPERIENCE_CHAR_LIMIT))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      commitPlanExperience();
                                    }
                                  }}
                                  placeholder="Share your experience"
                                  aria-label={`Experience ${planExperienceLines.length + 1}`}
                                  className="storyboard-underline-input min-h-0 min-w-0 flex-1 border-0 border-transparent bg-transparent py-1 text-[16px] font-normal leading-none text-[#1E293B] shadow-none outline-none ring-0 placeholder:text-[#475569] focus:border-transparent focus:shadow-none focus:ring-0 focus:outline-none"
                                  autoComplete="off"
                                />
                                <div className="flex shrink-0 items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={togglePlanExperienceVoice}
                                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full p-3 backdrop-blur-[21px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0087A8]/25 ${
                                      planExpRecording
                                        ? "text-red-600 hover:bg-red-50/80"
                                        : "text-[#475569] hover:bg-slate-500/10"
                                    }`}
                                    aria-label={planExpRecording ? "Stop recording" : "Voice input"}
                                    title={planExpRecording ? "Recording… tap to stop" : "Voice input"}
                                  >
                                    <Mic size={16} strokeWidth={2} aria-hidden />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={commitPlanExperience}
                                    disabled={!planComposer.trim()}
                                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full p-3 text-[#475569] backdrop-blur-[21px] transition-colors hover:bg-slate-500/10 hover:text-[#0F172A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0087A8]/25 disabled:cursor-not-allowed disabled:opacity-35"
                                    aria-label="Add this experience"
                                    title="Add this experience"
                                  >
                                    <ArrowRight size={16} strokeWidth={2} aria-hidden />
                                  </button>
                                </div>
                              </div>
                              <p className="w-full text-right text-[12px] font-normal leading-none text-[#475569]">
                                {planComposer.length}/{PLAN_EXPERIENCE_CHAR_LIMIT}
                              </p>
                              <p className="w-full text-right text-[14px] leading-snug text-[#6D7888]">
                                Add at least {MIN_PLAN_EXPERIENCES} experiences to enable Save journeys. Add as many as you
                                want (up to {MAX_PLAN_EXPERIENCES} per role).
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            disabled={!canSubmitPlan}
                            onClick={handlePlanSubmit}
                            className="inline-flex items-center justify-center rounded-full bg-[#0A89A9] px-6 py-2.5 text-[14px] font-medium text-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-[filter,opacity] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Save journeys
                          </button>
                          <button
                            type="button"
                            onClick={() => setPlanPhase("role")}
                            className="text-[13px] font-medium text-[#64748B] hover:text-[#1E293B]"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {!planOpen && library.roles.length > 0 ? (
                <div className="grid w-full gap-5 xl:grid-cols-1">
                  {library.roles.map((role, roleIdx) => {
                    const hubPct = mounted ? roleCraftProgressPercent(role) : 10;
                    const journeysOpen = expandedRoleId === role.id;
                    const roleCraftStatus = mounted ? readRoleCraftUiStatus(role) : "ready_to_craft";
                    const roleCraftAction = mounted ? resolveRoleCraftAction(role, role.title) : null;
                    const ghostAddClass =
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#0A89A9] transition-colors hover:bg-[#0A89A9]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A89A9]/25";
                    const badgeClass =
                      "rounded-full border border-blue-100/80 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium tracking-tight text-blue-800/90";

                    return (
                      <div key={role.id} className={roleHubCard}>
                        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-[18px] font-semibold text-[#1E293B]">{role.title}</p>
                            <div className="mt-3 h-1.5 w-full max-w-[280px] rounded-full bg-[#E2E8F0]">
                              <div
                                className="h-full max-w-full rounded-full bg-[#0A89A9] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                                style={{ width: `${hubPct}%` }}
                              />
                            </div>
                            <p className="mt-1.5 text-[12px] font-medium text-[#64748B]">
                              {hubPct}% done
                              {role.experiences.length > 0
                                ? ` · ${role.experiences.length} journey${role.experiences.length === 1 ? "" : "s"}`
                                : " · add your first journey"}
                            </p>
                          </div>
                          <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <span className={badgeClass}>{craftStatusLabel(roleCraftStatus)}</span>
                              {roleCraftAction ? (
                                <Link
                                  href={roleCraftAction.href}
                                  data-journey-id={
                                    roleIdx === 0 && role.experiences.length > 0 ? "story-start" : undefined
                                  }
                                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0A89A9] transition-colors hover:text-[#088299]"
                                >
                                  {craftCtaLabel(roleCraftStatus)}
                                  <ArrowRight size={14} className="opacity-70" aria-hidden />
                                </Link>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              data-journey-id={
                                role.experiences.length === 0 && roleIdx === 0 ? "story-start" : undefined
                              }
                              onClick={() => {
                                openPlanForRoleId(role.id);
                              }}
                              className={`${ghostAddClass} justify-center sm:justify-end`}
                            >
                              {role.experiences.length === 0 ? (
                                "Add experiences"
                              ) : (
                                <>
                                  <Plus size={14} strokeWidth={2} aria-hidden />
                                  Add experience
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {addJourneyForRoleId === role.id ? (
                          <div className="border-t border-[#E2E8F0]/80 px-4 py-4">
                            <p className="text-[13px] text-[#64748B]">
                              <span className="text-[#475569]">At least one experience.</span> Add more if you need
                              them.
                            </p>
                            <div className="mt-3 flex flex-col gap-3">
                              {newExperienceBlocks.map((block, idx) => (
                                <textarea
                                  key={idx}
                                  value={block}
                                  onChange={(e) =>
                                    setNewExperienceBlocks((rows) =>
                                      rows.map((x, i) => (i === idx ? e.target.value : x))
                                    )
                                  }
                                  rows={3}
                                  placeholder="Describe this experience…"
                                  className={textareaFlat}
                                />
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setNewExperienceBlocks((rows) => [...rows, ""])}
                              className="mt-2 text-[13px] font-medium text-[#64748B] hover:text-[#0A89A9]"
                            >
                              + Add another experience
                            </button>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleAddJourneyToRole(role)}
                                disabled={!newExperienceBlocks.some((b) => b.trim())}
                                className="rounded-full bg-[#0A89A9] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-40"
                              >
                                Start building
                              </button>
                              <button
                                type="button"
                                onClick={() => setAddJourneyForRoleId(null)}
                                className="rounded-full border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {role.experiences.length > 0 ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setExpandedRoleId((id) => (id === role.id ? null : role.id))}
                              className="flex w-full items-center justify-between gap-3 border-t border-[#E2E8F0]/80 px-4 py-2.5 text-left text-[13px] font-medium text-[#64748B] transition-colors hover:bg-slate-500/[0.06] motion-reduce:transition-none"
                              aria-expanded={journeysOpen}
                            >
                              <span>
                                Journeys ({role.experiences.length})
                              </span>
                              <ChevronDown
                                size={18}
                                strokeWidth={2}
                                className={`shrink-0 text-slate-500 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                                  journeysOpen ? "rotate-180" : ""
                                }`}
                                aria-hidden
                              />
                            </button>
                            <div
                              className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
                                journeysOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                              }`}
                            >
                              <div className="min-h-0 overflow-hidden">
                                <ul className="space-y-1 border-t border-[#E2E8F0]/60 px-4 pb-4 pt-2">
                                  {role.experiences.map((exp) => {
                                    const editHref = `/storyboard?openRoleId=${encodeURIComponent(role.id)}&openPlanExperiences=1`;
                                    return (
                                      <li key={exp.id}>
                                        <div className="flex flex-col gap-2 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/50 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                          <p className="min-w-0 flex-1 text-[14px] font-medium leading-snug text-[#1E293B]">
                                            {exp.label}
                                          </p>
                                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                            <Link
                                              href={editHref}
                                              onClick={(e) => {
                                                e.preventDefault();
                                                openPlanForRoleId(role.id);
                                              }}
                                              className="text-[12px] font-semibold text-[#0A89A9] transition-colors hover:text-[#088299]"
                                            >
                                              Edit journey
                                            </Link>
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                ) : null}

                {!planOpen && library.roles.length > 0 ? (
                  <button
                    type="button"
                    onClick={openPlanNewRole}
                    className={`${dashedCtaInner} w-full`}
                  >
                    <p className="text-[14px] font-medium text-[#64748B]">Add another role</p>
                    <p className="mt-1 text-[12px] text-[#64748B]">Same simple steps: role, then experiences</p>
                  </button>
                ) : null}

                <div className="pb-2" aria-hidden />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
