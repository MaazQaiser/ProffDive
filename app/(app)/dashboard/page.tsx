"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Urbanist } from "next/font/google";
import {
  ArrowUpRight,
  Brain,
  Check,
  ChevronDown,
  MessageCircle,
  Play,
  Plus,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUser } from "@/lib/user-context";
import {
  COMPETENCY_DETAILS,
  MOCK_DRIVERS,
  getOverallScore,
  type DriverDef,
} from "@/lib/mock-report-data";
import { readJourneyState, type GuidedJourneyStepId } from "@/lib/guided-journey";
import { startJourney } from "@/lib/guided-journey";
import { readReports } from "@/lib/report-store";
import {
  craftCtaLabel,
  experienceCraftProgressPercent,
  hubStoryStrengthFromCraft,
  roleCraftProgressPercent,
  resolveRoleCraftAction,
} from "@/lib/storyboard-crafting";
import {
  readLibraryWithMigration,
  type StoryboardLibrary,
  type StoryExperience,
} from "@/lib/storyboard-library";

/** One row per role title — merges duplicate titles (same name, different ids) for dashboard Story Boards. */
type DashboardStoryRoleRow = {
  id: string;
  title: string;
  experiences: StoryExperience[];
  sourceRoleIds: string[];
};

const JOURNEY_STEPS: Exclude<GuidedJourneyStepId, "done">[] = ["training", "story", "mock", "report"];

/** Dashboard rail labels (match guided journey order; no step numbers). */
const JOURNEY_RAIL_TITLES: Record<Exclude<GuidedJourneyStepId, "done">, string> = {
  training: "Learn the craft",
  story: "Create the first story",
  mock: "Mock interview",
  report: "AI analytics and Coaching",
};

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const glassCard =
  "relative overflow-hidden rounded-[24px] border border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

/** Same glass as `glassCard` but allows vertical overflow for hover popovers (e.g. Recent sections). */
const glassCardSection =
  "relative overflow-x-clip overflow-y-visible rounded-[24px] border border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

/** Proofy dock bar — match `ProofyChatDock` closed chrome (Figma 866-5433) */
const PROOFY_DOCK_GLASS_GRADIENT =
  "linear-gradient(90.2deg, rgba(255,255,255,0.24) 0%, rgba(163, 237, 255, 0.6) 99.92%)";
const PROOFY_DOCK_SHADOW_OUT = "0px 4px 20px 0px rgba(0,0,0,0.06)";
const PROOFY_DOCK_INSET_HIGHLIGHT = "inset -5px -5px 250px 0px rgba(255,255,255,0.02)";
const PROOFY_SPARKLE_ORB_GRADIENT =
  "linear-gradient(153.8deg, rgb(80, 177, 242) 10.4%, rgb(0, 102, 128) 89.66%)";

/** Score heat: red below 2.5, amber from 2.5 up to (not including) 3.5, emerald at 3.5+ */
function scoreBandColor(v: number): string {
  if (v < 2.5) return "#EF4444";
  if (v < 3.5) return "#D97706";
  return "#059669";
}

const PILLAR_ROW_ICONS: Record<DriverDef["id"], LucideIcon> = {
  thinking: Brain,
  action: Zap,
  people: Users,
  mastery: Target,
};

/** Recent-sections bar chart — visual spec unchanged; classes reused for hover + stagger animation */
const RECENT_SECTION_BAR_SEGMENTS = [
  "h-[9.719px] rounded-bl-[12px] rounded-br-[2px] rounded-tl-[2px] rounded-tr-[2px] bg-[#CCD5E1]",
  "h-[17.918px] rounded-[2px] bg-[#B1E2FF]",
  "h-[23.656px] rounded-[2px] bg-[#30D7FF]",
  "h-[35.132px] rounded-bl-[2px] rounded-br-[12px] rounded-tl-[2px] rounded-tr-[2px] bg-gradient-to-b from-[#01A3CA] to-[#0087A8]",
] as const;

function readinessBand(v: number): {
  label: string;
  chipText: string;
  chipClass: string;
  labelStrongClass: string;
} {
  if (v < 2.5) {
    return {
      label: "Not ready",
      chipText: "Focus on fundamentals",
      chipClass:
        "border-white/90 bg-[linear-gradient(90.31deg,rgba(254,226,226,0.65)_0%,rgba(254,242,242,0.65)_99.92%)] text-[#B91C1C]",
      labelStrongClass: "text-[#B91C1C]",
    };
  }
  if (v < 3.5) {
    return {
      label: "Borderline",
      chipText: "Close — tighten one pillar",
      chipClass:
        "border-white/90 bg-[linear-gradient(90.31deg,rgba(255,233,197,0.6)_0%,rgba(255,242,221,0.6)_99.92%)] text-[#B45309]",
      labelStrongClass: "text-[#B45309]",
    };
  }
  return {
    label: "Competent",
    chipText: "Strong baseline — keep practicing",
    chipClass:
      "border-white/90 bg-[linear-gradient(90.31deg,rgba(209,250,229,0.65)_0%,rgba(236,253,245,0.7)_99.92%)] text-[#047857]",
    labelStrongClass: "text-[#047857]",
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic fraction in [0, 1) from role title + salt. */
function frac(roleTitle: string, salt: string): number {
  return (hashSeed(`${roleTitle}\0${salt}`) % 10_000) / 10_000;
}

/** Pillar scores + pct derived from story craft progress and role (prototype until API-backed). */
function mockDriversForPrepareRole(
  roleTitle: string,
  craftRole: { experiences: { id: string }[] } | null
): DriverDef[] {
  const craftPct = roleCraftProgressPercent(craftRole ?? { experiences: [] });
  const anchor = Math.min(
    4.9,
    Math.max(1.2, (craftPct / 100) * 5 * 0.82 + frac(roleTitle, "anchor") * 1.15)
  );
  return MOCK_DRIVERS.map((d) => {
    const j = (frac(roleTitle, d.id) - 0.5) * 0.95;
    const score = Math.min(5, Math.max(1, Math.round((anchor + j + (d.score - 3.1) * 0.1) * 10) / 10));
    const pct = Math.min(100, Math.max(8, Math.round(score * 20)));
    return { ...d, score, pct };
  });
}

/** Slight per-session score drift so Recent section columns differ like distinct mocks. */
function jitterSessionDrivers(base: DriverDef[], sessionIndex: number): DriverDef[] {
  return base.map((d) => {
    const j = ((hashSeed(`${d.id}:${sessionIndex}`) % 13) - 6) * 0.05;
    const score = Math.min(5, Math.max(1, Math.round((d.score + j) * 10) / 10));
    const pct = Math.min(100, Math.max(8, Math.round(score * 20)));
    return { ...d, score, pct };
  });
}

export default function NewUserDashboard() {
  const router = useRouter();
  const { user, updateUser } = useUser();

  const firstName = useMemo(() => user.name?.trim().split(" ")[0] || "Maaz", [user.name]);
  const roleLabel = useMemo(
    () => (user.targetRole || user.role || "Product Designer").trim(),
    [user.targetRole, user.role]
  );

  const [prepareDropdownOpen, setPrepareDropdownOpen] = useState(false);
  const [explicitPrepareRoleId, setExplicitPrepareRoleId] = useState<string | null>(null);
  const prepareMenuRef = useRef<HTMLDivElement>(null);

  const [journeySnap, setJourneySnap] = useState(() => readJourneyState());

  const [storyLib, setStoryLib] = useState<StoryboardLibrary>({ version: 1, roles: [] });
  const [selectedStoryRoleId, setSelectedStoryRoleId] = useState<string | null>(null);
  const [aiCoachPanelOpen, setAiCoachPanelOpen] = useState(false);
  const aiCoachRailRef = useRef<HTMLDivElement>(null);

  const refreshStoryLib = useCallback(() => {
    setStoryLib(readLibraryWithMigration(roleLabel));
  }, [roleLabel]);

  useEffect(() => {
    const schedule = () => queueMicrotask(() => refreshStoryLib());
    schedule();
    const onVis = () => {
      if (document.visibilityState === "visible") schedule();
    };
    window.addEventListener("focus", schedule);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", schedule);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refreshStoryLib]);

  useEffect(() => {
    if (!prepareDropdownOpen) return;
    const close = (e: MouseEvent) => {
      if (prepareMenuRef.current?.contains(e.target as Node)) return;
      setPrepareDropdownOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPrepareDropdownOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [prepareDropdownOpen]);

  useEffect(() => {
    const sync = () => setJourneySnap(readJourneyState());
    sync();
    window.addEventListener("journey:start", sync);
    window.addEventListener("journey:step", sync);
    window.addEventListener("journey:skip", sync);
    window.addEventListener("journey:reset", sync);
    window.addEventListener("journey:complete", sync);
    return () => {
      window.removeEventListener("journey:start", sync);
      window.removeEventListener("journey:step", sync);
      window.removeEventListener("journey:skip", sync);
      window.removeEventListener("journey:reset", sync);
      window.removeEventListener("journey:complete", sync);
    };
  }, []);

  const journey = useMemo(() => {
    const st = journeySnap;
    const done = (id: Exclude<GuidedJourneyStepId, "done">) => st.completed.includes(id);
    const current =
      st.active &&
      !st.skipped &&
      st.stepId !== "done" &&
      JOURNEY_STEPS.includes(st.stepId as (typeof JOURNEY_STEPS)[number]) &&
      (st.stepId as Exclude<GuidedJourneyStepId, "done">);

    return JOURNEY_STEPS.map((id) => {
      const isDone = done(id);
      const isCurrent = Boolean(current && st.stepId === id && !isDone);
      const sub = isDone ? "Completed" : isCurrent ? "In progress" : "Not started";
      return {
        id,
        title: JOURNEY_RAIL_TITLES[id],
        sub,
        icon: isDone ? ("done" as const) : isCurrent ? ("current" as const) : ("upcoming" as const),
      };
    });
  }, [journeySnap]);

  const currentJourneyHref = useMemo(() => {
    const step = journeySnap.stepId;
    const order: Exclude<GuidedJourneyStepId, "done">[] = ["training", "story", "mock", "report"];
    const allDone = order.every((id) => journeySnap.completed.includes(id));
    if (!journeySnap.active && (journeySnap.stepId === "done" || allDone)) return "/dashboard";
    if (step === "story") return "/storyboard";
    if (step === "mock") return "/mock/setup";
    if (step === "report") {
      const latest = [...readReports()].sort((a, b) => {
        const ta = Date.parse(a.createdAt || "");
        const tb = Date.parse(b.createdAt || "");
        return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
      })[0];
      return latest ? `/report/${latest.id}` : "/mock/setup";
    }
    if (step === "done") return "/dashboard";
    return "/trainings";
  }, [journeySnap]);

  const journeyIsDone = useMemo(() => {
    const order: Exclude<GuidedJourneyStepId, "done">[] = ["training", "story", "mock", "report"];
    return journeySnap.stepId === "done" || order.every((id) => journeySnap.completed.includes(id));
  }, [journeySnap.stepId, journeySnap.completed]);

  useEffect(() => {
    if (!journeyIsDone) {
      setAiCoachPanelOpen(false);
    }
  }, [journeyIsDone]);

  useEffect(() => {
    if (!aiCoachPanelOpen || !journeyIsDone) return;
    const onDoc = (e: MouseEvent) => {
      const el = aiCoachRailRef.current;
      if (!el?.contains(e.target as Node)) setAiCoachPanelOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAiCoachPanelOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [aiCoachPanelOpen, journeyIsDone]);

  /** Interview readiness scores unlock only after all four "Your Way forward" steps are complete. */
  const showInterviewReadinessScores = journeyIsDone;

  const effectivePrepareRoleId = useMemo(() => {
    const roles = storyLib.roles;
    if (roles.length === 0) return null;
    if (explicitPrepareRoleId && roles.some((r) => r.id === explicitPrepareRoleId)) {
      return explicitPrepareRoleId;
    }
    const target = (user.targetRole || user.role || "").trim();
    if (target) {
      const m = roles.find((r) => r.title.trim().toLowerCase() === target.toLowerCase());
      if (m) return m.id;
    }
    return roles[0].id;
  }, [storyLib.roles, explicitPrepareRoleId, user.targetRole, user.role]);

  const prepareRole = useMemo(() => {
    if (!effectivePrepareRoleId) return null;
    return storyLib.roles.find((r) => r.id === effectivePrepareRoleId) ?? null;
  }, [storyLib.roles, effectivePrepareRoleId]);

  const driversForPrepare = useMemo(
    () => mockDriversForPrepareRole(prepareRole?.title ?? roleLabel, prepareRole),
    [prepareRole, roleLabel]
  );

  const overallScore = useMemo(() => getOverallScore(driversForPrepare), [driversForPrepare]);
  const readiness = useMemo(() => readinessBand(overallScore), [overallScore]);

  const focusPillar = useMemo(() => {
    return driversForPrepare.reduce((a, b) => (a.score <= b.score ? a : b));
  }, [driversForPrepare]);

  const recentBarSegments = useMemo(() => {
    const seed = effectivePrepareRoleId ?? roleLabel;
    const count = RECENT_SECTION_BAR_SEGMENTS.length;
    const o = hashSeed(`${seed}:bars`) % count;
    return Array.from({ length: count }, (_, i) => RECENT_SECTION_BAR_SEGMENTS[(o + i) % count]!);
  }, [effectivePrepareRoleId, roleLabel]);

  const recentSessionsDetail = useMemo(
    () =>
      [0, 1, 2, 3].map((sessionIndex) => {
        const drivers = jitterSessionDrivers(driversForPrepare, sessionIndex);
        return { drivers, overall: getOverallScore(drivers) };
      }),
    [driversForPrepare]
  );

  const effectiveStoryRoleId = useMemo(() => {
    const roles = storyLib.roles;
    if (roles.length === 0) return null;
    if (selectedStoryRoleId && roles.some((r) => r.id === selectedStoryRoleId)) return selectedStoryRoleId;
    return effectivePrepareRoleId;
  }, [storyLib.roles, selectedStoryRoleId, effectivePrepareRoleId]);

  const dashboardStoryRoles = useMemo((): DashboardStoryRoleRow[] => {
    const roles = storyLib.roles;
    if (roles.length === 0) return [];

    const buckets = new Map<string, typeof roles>();
    for (const r of roles) {
      const key = r.title.trim().toLowerCase() || `__id_${r.id}`;
      const arr = buckets.get(key) ?? [];
      arr.push(r);
      buckets.set(key, arr);
    }

    const rows: DashboardStoryRoleRow[] = [];
    for (const group of buckets.values()) {
      const title = group[0]!.title.trim() || group[0]!.title;
      const expById = new Map<string, StoryExperience>();
      for (const r of group) {
        for (const e of r.experiences) expById.set(e.id, e);
      }
      const experiences = [...expById.values()].sort((a, b) => b.createdAt - a.createdAt);
      const sortedByCreated = [...group].sort((a, b) => b.createdAt - a.createdAt);
      const canonical =
        group.find((r) => r.id === effectivePrepareRoleId) ??
        group.find((r) => r.id === selectedStoryRoleId) ??
        sortedByCreated[0]!;
      rows.push({
        id: canonical.id,
        title,
        experiences,
        sourceRoleIds: group.map((r) => r.id),
      });
    }
    rows.sort((a, b) => a.title.localeCompare(b.title));
    return rows;
  }, [storyLib.roles, effectivePrepareRoleId, selectedStoryRoleId]);

  const dashboardSelectedRow = useMemo(() => {
    if (!effectiveStoryRoleId) return null;
    return dashboardStoryRoles.find((row) => row.sourceRoleIds.includes(effectiveStoryRoleId)) ?? null;
  }, [dashboardStoryRoles, effectiveStoryRoleId]);

  const dashboardStoryRowToShow = useMemo(() => {
    return dashboardSelectedRow ?? dashboardStoryRoles[0] ?? null;
  }, [dashboardSelectedRow, dashboardStoryRoles]);

  const preparingTitle = prepareRole?.title ?? roleLabel;

  const dashboardRolePrimaryAction = useMemo(() => {
    if (!dashboardStoryRowToShow) return null;
    const role = storyLib.roles.find((r) => r.id === dashboardStoryRowToShow.id) ?? null;
    if (!role) return null;
    return resolveRoleCraftAction(role, dashboardStoryRowToShow.title);
  }, [dashboardStoryRowToShow, storyLib.roles]);

  const selectPrepareRole = useCallback(
    (roleId: string, title: string) => {
      setExplicitPrepareRoleId(roleId);
      setSelectedStoryRoleId(roleId);
      updateUser({ targetRole: title });
      setPrepareDropdownOpen(false);
    },
    [updateUser]
  );

  const goAddRoleFromMenu = useCallback(() => {
    setPrepareDropdownOpen(false);
    router.push("/storyboard?openAddRole=1");
  }, [router]);

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-x-clip`}>
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6">
        <div className="pointer-events-none invisible absolute left-[-251px] top-[66px] z-[1] h-[1127px] w-[1127px] opacity-45" aria-hidden>
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        {/* Hero — Figma Insphere 869-5601 */}
        <section className="relative z-[1] flex flex-col items-center gap-6 px-8 py-3">
          <div className="flex flex-col items-center pt-3">
            <h1 className="max-w-[min(100%,920px)] text-center text-[34px] font-normal leading-normal">
              <span className="text-[#334155]">Welcome</span>
              <span className="text-[#0A89A9]">
                {" "}
                {firstName}👋,
              </span>
              <span className="text-[#334155]"> Let get you </span>
              <span className="text-[#0A89A9]">Interview ready!</span>
            </h1>
          </div>

          <div className="relative w-full max-w-[720px]">
            <div
              className="pointer-events-none absolute left-[42%] top-[-18px] z-0 hidden h-[240px] w-[min(100%,404px)] max-w-[404px] mix-blend-multiply sm:block lg:left-auto lg:right-[-48px] lg:w-[404px]"
              aria-hidden
            >
              <Image src="/figma-dashboard/profile-blob-exact.png" alt="" fill className="object-cover" sizes="404px" />
            </div>

            <div className="relative z-[1] w-full">
              <div className="relative z-30 mb-0 flex w-full items-center justify-center gap-3 px-2 sm:px-8">
                <p className="text-[16px] font-normal leading-none text-[#64748B]">Currently preparing for</p>

                <div className="relative isolate" ref={prepareMenuRef}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-[16px] font-semibold leading-none text-[#0F172A]"
                    aria-haspopup="menu"
                    aria-expanded={prepareDropdownOpen}
                    onClick={() => setPrepareDropdownOpen((v) => !v)}
                  >
                    <span className="max-w-[16rem] overflow-visible whitespace-nowrap">{preparingTitle}</span>
                    <ChevronDown size={18} className="text-[#0F172A]" aria-hidden />
                  </button>

                  {prepareDropdownOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+10px)] z-[20] min-w-[240px] overflow-hidden rounded-[16px] border border-slate-200/80 bg-white/90 p-1 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur-[18px]"
                    >
                      {storyLib.roles.length === 0 ? (
                        <p className="px-3 py-2 text-[12px] leading-snug text-slate-500">
                          No roles in your library yet — add one to prepare here.
                        </p>
                      ) : (
                        storyLib.roles.map((r) => {
                          const active = r.id === effectivePrepareRoleId;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              role="menuitem"
                              className={[
                                "flex w-full items-center justify-between gap-3 rounded-[12px] px-3 py-2 text-left text-[13px]",
                                active ? "bg-[#0087A8]/10 text-[#0087A8]" : "text-slate-700 hover:bg-slate-100/70",
                              ].join(" ")}
                              onClick={() => selectPrepareRole(r.id, r.title)}
                            >
                              <span className="min-w-0 flex-1 truncate">{r.title}</span>
                              {active ? <Check size={16} className="shrink-0" aria-hidden /> : null}
                            </button>
                          );
                        })
                      )}
                      <div
                        className={
                          storyLib.roles.length > 0
                            ? "mt-0.5 border-t border-slate-200/70 pt-0.5"
                            : undefined
                        }
                      >
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[13px] font-semibold text-[#0087A8] hover:bg-[#0087A8]/10"
                          onClick={goAddRoleFromMenu}
                        >
                          <Plus size={16} className="shrink-0" aria-hidden />
                          Add role
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mb-3 flex w-full items-start sm:pl-8">
                <p className="shrink-0 text-[16px] font-normal leading-none text-[#1E293B]">Your Way forward</p>
              </div>

              <div ref={aiCoachRailRef} className="relative w-full">
                {journeyIsDone ? (
                  <div
                    className={[
                      "relative w-full overflow-hidden border-[0.5px] border-white bg-[linear-gradient(90.56deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] backdrop-blur-[21px] transition-[border-radius,box-shadow] duration-300 ease-out",
                      aiCoachPanelOpen
                        ? "rounded-[24px] shadow-[0_12px_40px_rgba(15,23,42,0.1)] ring-2 ring-[#0A89A9]/20"
                        : "rounded-[122px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] ring-2 ring-[#0A89A9]/25",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]"
                    />
                    <div className="relative z-[1] flex w-full min-h-[58px] items-center justify-between gap-1.5 py-2.5 pl-7 pr-2 sm:pl-7">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 flex-col items-start justify-center py-0.5 pr-2 text-left"
                        aria-label="Open AI coach for next steps and suggestions"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("proofy:open", { detail: { open: true } }));
                        }}
                      >
                        <div className="flex w-full min-w-0 items-start gap-2">
                          <Sparkles
                            size={20}
                            className="mt-0.5 shrink-0 text-[#0A89A9]"
                            strokeWidth={2}
                            aria-hidden
                          />
                          <p className="min-w-0 text-[16px] font-medium leading-snug text-[#1E293B]">
                            AI coach is here to guide your next path
                          </p>
                        </div>
                        <p className="mt-0.5 pl-7 text-[14px] font-normal leading-snug text-[#94A3B8]">
                          Click here to talk to the AI coach and view suggestions.
                        </p>
                      </button>
                      <button
                        type="button"
                        className="proofy-dock-round-btn flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[80px] border border-slate-300 bg-white/60 backdrop-blur-[21px] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)] transition-transform hover:bg-white/75"
                        aria-label={aiCoachPanelOpen ? "Collapse suggestions" : "Expand suggestions"}
                        aria-expanded={aiCoachPanelOpen}
                        onClick={() => setAiCoachPanelOpen((v) => !v)}
                      >
                        <ChevronDown
                          size={20}
                          className={["text-slate-600 transition-transform duration-200", aiCoachPanelOpen ? "rotate-180" : ""].join(" ")}
                          strokeWidth={2}
                          aria-hidden
                        />
                      </button>
                    </div>

                    {aiCoachPanelOpen ? (
                      <div
                        className="relative z-[1] border-t border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.35)_0%,rgba(248,250,252,0.55)_100%)] px-4 pb-4 pt-3 animate-in fade-in duration-200"
                        role="region"
                        aria-label="AI coach suggestions"
                      >
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                          Suggested next steps
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="flex flex-col gap-2 rounded-[16px] border border-[#E2E8F0]/90 bg-white/60 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBEAF0] text-[#72243E]">
                              <Users size={18} strokeWidth={2} aria-hidden />
                            </span>
                            <span className="text-[14px] font-semibold text-[#1E293B]">People pillar</span>
                            <span className="text-[12px] leading-relaxed text-[#64748B]">
                              Build collaboration, influence, and stakeholder skills with focused trainings.
                            </span>
                            <Link
                              href="/trainings/driver/people"
                              onClick={() => setAiCoachPanelOpen(false)}
                              className="mt-1 inline-flex w-fit items-center rounded-full bg-[#0A89A9] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                            >
                              Go to training
                            </Link>
                          </div>

                          <div className="flex flex-col gap-2 rounded-[16px] border border-[#E2E8F0]/90 bg-white/60 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F1FB] text-[#0087A8]">
                              <Play size={18} strokeWidth={2} aria-hidden />
                            </span>
                            <span className="text-[14px] font-semibold text-[#1E293B]">People pillar mock</span>
                            <span className="text-[12px] leading-relaxed text-[#64748B]">
                              Run a practice interview weighted to People-style behavioral questions.
                            </span>
                            <Link
                              href="/mock/setup?pillar=people"
                              onClick={() => setAiCoachPanelOpen(false)}
                              className="mt-1 inline-flex w-fit items-center rounded-full bg-[#0A89A9] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                            >
                              Take mock interview
                            </Link>
                          </div>

                          <div className="flex flex-col gap-2 rounded-[16px] border border-[#E2E8F0]/90 bg-white/60 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A89A9]/10 text-[#0A89A9]">
                              <MessageCircle size={18} strokeWidth={2} aria-hidden />
                            </span>
                            <span className="text-[14px] font-semibold text-[#1E293B]">Storyboard</span>
                            <span className="text-[12px] leading-relaxed text-[#64748B]">
                              Shape roles and STAR stories so your examples are ready for interviews.
                            </span>
                            <Link
                              href="/storyboard"
                              onClick={() => setAiCoachPanelOpen(false)}
                              className="mt-1 inline-flex w-fit items-center rounded-full border border-[#CBD5E1] bg-white/70 px-3 py-1.5 text-[12px] font-semibold text-[#0F172A] transition-colors hover:border-[#94A3B8]"
                            >
                              Open storyboard
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className="relative flex h-[58px] w-full cursor-pointer items-center justify-between gap-1.5 overflow-visible rounded-[122px] border-[0.5px] border-white bg-[linear-gradient(90.56deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] pl-7 pr-2 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px] sm:pl-7"
                    role="button"
                    tabIndex={0}
                    aria-label="Go to current experience step"
                    onClick={() => {
                      if (!journeySnap.active && journeySnap.completed.length === 0) startJourney("training");
                      router.push(currentJourneyHref);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (!journeySnap.active && journeySnap.completed.length === 0) startJourney("training");
                        router.push(currentJourneyHref);
                      }
                    }}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[122px] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]"
                    />
                    <div className="relative z-[1] flex min-w-0 flex-1 items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {journey.map((step, index) => (
                        <div key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
                          {index > 0 ? <span className="mx-1.5 h-7 w-px shrink-0 bg-[#DBEAFE]" aria-hidden /> : null}
                          {step.icon === "done" ? (
                            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-[inset_-2px_-2px_100px_0px_rgba(255,255,255,0.02)]">
                              <Check size={12} className="text-white" strokeWidth={2.5} aria-hidden />
                            </span>
                          ) : (
                            <span
                              className={[
                                "flex h-[18px] w-[18px] shrink-0 rounded-full border-[1.143px] border-slate-300 bg-white/40 backdrop-blur-[8.4px]",
                                step.icon === "current" ? "ring-1 ring-[#0A89A9]/30" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              aria-hidden
                            />
                          )}
                          <div className="min-w-0 max-w-[9.5rem]">
                            <p className="truncate text-[16px] font-normal leading-snug text-[#1E293B]" title={step.title}>
                              {step.title}
                            </p>
                            <p className="mt-0.5 truncate text-[14px] font-normal leading-snug text-[#94A3B8]">
                              {step.sub}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/profile"
                      className="proofy-dock-round-btn relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[80px] border border-slate-300 bg-white/60 backdrop-blur-[21px] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]"
                      aria-label="Open profile"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowUpRight size={17} className="text-slate-600" strokeWidth={2} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Interview readiness + recent sections — Figma Insphere 869-7176 */}
        <section
          className={`${glassCardSection} relative z-[1] mx-auto mt-3 flex w-full max-w-[960px] flex-col gap-6 border-[0.5px] p-6`}
        >
          <article className={`${glassCard} relative w-full flex-1 border-[0.5px] p-6`}>
            <div className="flex w-full flex-col gap-3">
              <div className="flex w-full items-center gap-1.5">
                <div className="min-w-0 flex-1">
                  <h2 className="text-[24px] font-medium text-[#1E293B]">Interview readiness</h2>
                  <p className="text-[12px] font-normal text-[#475569]">
                    {showInterviewReadinessScores ? (
                      <>Mocks, trainings, and pillar balance at a glance.</>
                    ) : (
                      <>Take your first mock interview to get your interview readiness.</>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-3">
                  <p className="flex items-end">
                    {showInterviewReadinessScores ? (
                      <>
                        <span
                          className="text-[42px] font-semibold leading-[42px]"
                          style={{ color: scoreBandColor(overallScore) }}
                        >
                          {overallScore.toFixed(1)}
                        </span>
                        <span className="text-[24px] font-normal leading-[42px] text-[#64748B]">/05</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[42px] font-semibold leading-[42px] tracking-[0.08em] text-[#CBD5E1]">
                          —.–
                        </span>
                        <span className="text-[24px] font-normal leading-[42px] text-[#CBD5E1]">/05</span>
                      </>
                    )}
                  </p>
                  {showInterviewReadinessScores ? (
                    <p
                      className={[
                        "rounded-full border px-4 py-1.5 text-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.06)]",
                        readiness.chipClass,
                      ].join(" ")}
                    >
                      You&apos;re currently on{" "}
                      <span className={["font-semibold", readiness.labelStrongClass].join(" ")}>{readiness.label}</span>
                    </p>
                  ) : (
                    <p className="rounded-full border border-dashed border-[#CBD5E1] bg-white/40 px-4 py-1.5 text-[10px] text-[#94A3B8] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                      <span className="font-semibold tracking-[0.2em] text-[#CBD5E1]">— — —</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-[#E2E8F0]" />

              <div className="w-full py-2">
                <div className="grid grid-cols-1 gap-y-5 md:grid-cols-2 md:gap-x-4 md:gap-y-5">
                  {driversForPrepare.map((driver) => {
                    const PillarIcon = PILLAR_ROW_ICONS[driver.id];
                    return (
                      <button
                        key={driver.id}
                        type="button"
                        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_3rem_auto] items-center gap-x-2 text-left disabled:cursor-default"
                        aria-label={
                          showInterviewReadinessScores ? `Open ${driver.title} details` : "Scores unlock after your journey"
                        }
                        disabled={!showInterviewReadinessScores}
                      >
                        <PillarIcon size={16} className="shrink-0 text-[#64748B]" strokeWidth={1.8} aria-hidden />
                        <span className="min-w-0 truncate text-[16px] font-medium text-[#475569]">
                          {`Power of ${driver.title}`}
                        </span>
                        <span className="h-[2px] w-[2px] shrink-0 rounded-full bg-[#1E293B]" aria-hidden />
                        {showInterviewReadinessScores ? (
                          <span
                            className="shrink-0 text-right text-[24px] font-semibold leading-none tabular-nums"
                            style={{ color: scoreBandColor(driver.score) }}
                          >
                            {driver.score.toFixed(1)}
                          </span>
                        ) : (
                          <span className="shrink-0 text-right text-[24px] font-semibold leading-none tracking-[0.06em] text-[#CBD5E1] tabular-nums">
                            —.–
                          </span>
                        )}
                        <ArrowUpRight size={14} className="shrink-0 text-[#94A3B8]" aria-hidden />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>

          <aside className="flex min-h-[230px] w-full flex-1 flex-col gap-2 self-stretch">
            <div className="border-b border-[#E2E8F0] px-3 pb-[9px]">
              <p className="text-[16px] font-medium text-[#475569]">Recent sections</p>
            </div>
            <div
              className="mt-auto grid grid-cols-4 divide-x divide-[#E2E8F0] rounded-[12px]"
              role="group"
              aria-label="Recent session activity across four sessions; hover a column for scores"
            >
              {recentBarSegments.map((segmentClass, i) => {
                const sessionLabel = `Session ${String(i + 1).padStart(2, "0")}`;
                const { drivers: sessionDrivers, overall } = recentSessionsDetail[i]!;
                const srSummary = `${sessionLabel}. Overall ${overall.toFixed(1)} of 5. ${sessionDrivers
                  .map((d) => `${COMPETENCY_DETAILS[d.id].pillar} ${d.score.toFixed(1)}`)
                  .join(", ")}.`;
                return (
                  <div
                    key={`${effectivePrepareRoleId ?? "x"}-${i}`}
                    className="group relative flex min-w-0 flex-col items-stretch px-1 first:pl-0 last:pr-0"
                    aria-label={srSummary}
                  >
                    <div
                      className="pointer-events-none invisible absolute bottom-[calc(100%+10px)] left-1/2 z-30 w-[min(268px,calc(100vw-2rem))] -translate-x-1/2 rounded-[14px] border border-slate-200/90 bg-white/95 p-3 text-left opacity-0 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-[14px] transition duration-150 ease-out group-hover:visible group-hover:opacity-100"
                      role="tooltip"
                    >
                      <p className="text-[11px] font-semibold text-[#0F172A]">{sessionLabel}</p>
                      <p className="mt-1 text-[11px] text-[#64748B]">
                        Overall{" "}
                        <span className="font-semibold tabular-nums" style={{ color: scoreBandColor(overall) }}>
                          {overall.toFixed(1)}
                        </span>
                        <span className="font-medium text-[#94A3B8]">/5</span>
                        <span className="text-[#94A3B8]"> · pillar breakdown</span>
                      </p>
                      <ul className="mt-2 space-y-1.5 border-t border-slate-200/70 pt-2">
                        {sessionDrivers.map((d) => (
                          <li key={d.id}>
                            <div className="flex items-baseline justify-between gap-2 text-[11px]">
                              <span className="min-w-0 truncate font-medium text-[#334155]">
                                {COMPETENCY_DETAILS[d.id].pillar}
                              </span>
                              <span
                                className="shrink-0 tabular-nums text-[11px] font-semibold"
                                style={{ color: scoreBandColor(d.score) }}
                              >
                                {d.score.toFixed(1)}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid h-[54px] grid-cols-1 items-end">
                      <div
                        className={[
                          "pd-dashboard-bar-segment min-h-0 w-full cursor-default",
                          "origin-bottom transition-[transform,filter] duration-200 ease-out",
                          "group-hover:scale-y-[1.08] group-hover:brightness-[1.08]",
                          segmentClass,
                        ].join(" ")}
                        style={{ animationDelay: `${i * 75}ms` }}
                        aria-hidden
                      />
                    </div>
                    <p className="py-0.5 text-center text-[10px] font-medium text-[#475569]">{sessionLabel}</p>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="relative z-[1] mx-auto mt-3 grid w-full max-w-[960px] gap-3 xl:grid-cols-1">
          <article className={`${glassCard} p-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[20px] font-medium text-[#1E293B]">Experience bank</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/storyboard"
                  className="inline-flex items-center gap-1 rounded-[80px] px-3 py-2 text-[14px] font-medium text-[#64748B] backdrop-blur-[21px]"
                >
                  View All
                  <ArrowUpRight size={14} aria-hidden />
                </Link>
              </div>
            </div>

            {storyLib.roles.length === 0 ? (
              <p className="mt-4 text-[13px] text-[#64748B]">Loading your story library…</p>
            ) : (
              <>
                {dashboardStoryRowToShow ? (
                  <div className="mt-4 flex flex-col gap-[18px]">
                    <div className="rounded-[16px] border border-white/90 bg-white/40 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[21px]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="mt-1 truncate text-[18px] font-semibold text-[#1E293B]">
                            {dashboardStoryRowToShow.title}
                          </p>
                          {(() => {
                            const journeys = dashboardStoryRowToShow.experiences;
                            const count = journeys.length;
                            const avgPct =
                              count === 0
                                ? 0
                                : Math.round(
                                    journeys.reduce((sum, j) => sum + experienceCraftProgressPercent(j.id), 0) /
                                      count,
                                  );
                            const avgStrength =
                              count === 0
                                ? 0
                                : Math.round((journeys.reduce((sum, j) => sum + hubStoryStrengthFromCraft(j.id), 0) / count) * 10) /
                                  10;
                            return (
                              <div className="mt-1">
                                <p className="text-[12px] text-[#64748B]">
                                  {count} experiences{count > 0 ? ` • Story score ${avgStrength.toFixed(1)}/5` : ""}
                                </p>
                                <div className="mt-2 h-1 w-[220px] overflow-hidden rounded-full bg-slate-200/90">
                                  <div
                                    className="h-full rounded-full bg-[#0A89A9] transition-[width] duration-300"
                                    style={{ width: `${avgPct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <Link
                            href={
                              dashboardRolePrimaryAction?.href ??
                              `/storyboard?openRoleId=${encodeURIComponent(dashboardStoryRowToShow.id)}&openAddExperience=1`
                            }
                            className="inline-flex items-center gap-1.5 rounded-[80px] border border-[#CBD5E1] bg-white/60 px-3 py-2 text-[13px] font-semibold text-[#0A89A9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[21px] transition-colors hover:border-[#94A3B8] hover:bg-white/75"
                          >
                            {dashboardRolePrimaryAction ? craftCtaLabel(dashboardRolePrimaryAction.status) : "Craft story"}
                            <ArrowUpRight size={14} aria-hidden />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {dashboardStoryRowToShow.experiences.length === 0 ? (
                      <Link
                        href={`/storyboard/agent?role=${encodeURIComponent(dashboardStoryRowToShow.title)}`}
                        className="flex min-h-[88px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#CBD5E1] bg-white/20 p-4 text-center text-[13px] text-[#64748B] shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-[21px] transition-colors hover:border-[#94A3B8] hover:bg-white/35"
                      >
                        <span className="font-medium text-[#1E293B]">No Experience yet</span>
                        <span className="mt-1 text-[12px]">Click here to start adding experience</span>
                      </Link>
                    ) : (
                      <div className="mt-3">
                        <ul className="space-y-2">
                        {dashboardStoryRowToShow.experiences.map((exp) => {
                          const editJourneyHref = `/storyboard?openRoleId=${encodeURIComponent(dashboardStoryRowToShow.id)}&openPlanExperiences=1`;
                          return (
                            <li key={exp.id}>
                              <div className="flex flex-col gap-3 rounded-[16px] border border-[#E2E8F0]/90 bg-white/40 px-3 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[21px] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="min-w-0 flex-1 truncate text-[14px] font-semibold leading-snug text-[#1E293B]">
                                      {exp.label.trim() || "Untitled experience"}
                                    </p>
                                    <Link
                                      href={editJourneyHref}
                                      className="shrink-0 text-[12px] font-semibold text-[#0A89A9] transition-colors hover:text-[#088299]"
                                    >
                                      Edit
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                        </ul>
                        <Link
                          href={`/storyboard?openRoleId=${encodeURIComponent(dashboardStoryRowToShow.id)}&openAddExperience=1`}
                          className="mt-3 inline-flex items-center justify-center rounded-[16px] border border-dashed border-[#CBD5E1] bg-white/20 px-4 py-3 text-[13px] font-semibold text-[#0A89A9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[21px] transition-colors hover:border-[#94A3B8] hover:bg-white/35"
                        >
                          + Add an experience
                        </Link>
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </article>

          <article className={`${glassCard} relative`}>
            <section className="relative h-[239px] w-full overflow-hidden rounded-[24px]">
              <Image src="/figma-dashboard/training-video.png" alt="Training" fill className="object-cover" />
              <section className="absolute inset-0 rounded-[24px] bg-black/40" />
              <button
                type="button"
                className="absolute left-1/2 top-1/2 inline-flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#F8FAFC66] bg-white/10 text-white backdrop-blur-[2.5px]"
                aria-label="Play"
              >
                <Play size={16} fill="currentColor" className="ml-0.5" />
              </button>
            </section>

            <section className="w-full p-4">
              <div className="flex flex-col gap-3">
                <h4 className="text-[18px] font-semibold text-[#1E293B]">
                  Strengthen your {focusPillar.title} pillar
                </h4>
                <p className="text-[12px] leading-[1.45] text-[#64748B]">
                  Your last mock scored {focusPillar.score.toFixed(1)} on {focusPillar.title}. Interviewers look
                  for clear ownership and outcomes in this area — tighten one story where your personal role and
                  impact read unmistakably.
                </p>
                <Link
                  href="/mock/setup"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0A89A9] px-4 py-[6px] text-[14px] font-medium text-white"
                >
                  Start preparing
                  <ArrowUpRight size={14} aria-hidden />
                </Link>
              </div>
            </section>
          </article>
        </section>
      </div>
    </div>
  );
}
