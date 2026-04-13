"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Urbanist } from "next/font/google";
import {
  ArrowUpRight,
  Brain,
  ChevronDown,
  Check,
  Play,
  Plus,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUser } from "@/lib/user-context";
import {
  MOCK_DRIVERS,
  getOverallScore,
  type DriverDef,
} from "@/lib/mock-report-data";
import { readJourneyState, type GuidedJourneyStepId } from "@/lib/guided-journey";
import { readReports } from "@/lib/report-store";
import {
  craftActionHref,
  craftCtaLabel,
  craftStatusLabel,
  readExperienceCraftUiStatus,
  roleCraftProgressPercent,
} from "@/lib/storyboard-crafting";
import { readLibraryWithMigration, type StoryboardLibrary } from "@/lib/storyboard-library";

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

  const { journey, journeyPct } = useMemo(() => {
    const st = journeySnap;
    const done = (id: Exclude<GuidedJourneyStepId, "done">) => st.completed.includes(id);
    const current =
      st.active &&
      !st.skipped &&
      st.stepId !== "done" &&
      JOURNEY_STEPS.includes(st.stepId as (typeof JOURNEY_STEPS)[number]) &&
      (st.stepId as Exclude<GuidedJourneyStepId, "done">);

    const rows = JOURNEY_STEPS.map((id) => {
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

    const completedCount = JOURNEY_STEPS.filter((id) => done(id)).length;
    const pct = Math.min(100, Math.round((completedCount / JOURNEY_STEPS.length) * 100));

    return { journey: rows, journeyPct: pct };
  }, [journeySnap]);

  const journeyMarkerIdx = useMemo(() => {
    if (journeyPct <= 0) return 0;
    return Math.min(3, Math.max(0, Math.ceil(journeyPct / 25) - 1));
  }, [journeyPct]);

  const currentJourneyHref = useMemo(() => {
    const step = journeySnap.stepId;
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
  }, [journeySnap.stepId]);

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

  const effectiveStoryRoleId = useMemo(() => {
    const roles = storyLib.roles;
    if (roles.length === 0) return null;
    if (selectedStoryRoleId && roles.some((r) => r.id === selectedStoryRoleId)) return selectedStoryRoleId;
    return effectivePrepareRoleId;
  }, [storyLib.roles, selectedStoryRoleId, effectivePrepareRoleId]);

  const selectedStoryRole = useMemo(() => {
    if (!effectiveStoryRoleId) return null;
    return storyLib.roles.find((r) => r.id === effectiveStoryRoleId) ?? null;
  }, [storyLib.roles, effectiveStoryRoleId]);

  const preparingTitle = prepareRole?.title ?? roleLabel;

  const selectPrepareRole = useCallback(
    (roleId: string, title: string) => {
      setExplicitPrepareRoleId(roleId);
      setSelectedStoryRoleId(roleId);
      updateUser({ targetRole: title });
      setPrepareDropdownOpen(false);
    },
    [updateUser]
  );

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-x-hidden`}>
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

          <div className="relative w-full max-w-[664px]">
            <div
              className="pointer-events-none absolute left-[42%] top-[-18px] z-0 hidden h-[240px] w-[min(100%,404px)] max-w-[404px] mix-blend-multiply sm:block lg:left-auto lg:right-[-48px] lg:w-[404px]"
              aria-hidden
            >
              <Image src="/figma-dashboard/profile-blob-exact.png" alt="" fill className="object-cover" sizes="404px" />
            </div>

            <div className="relative z-[1] w-full">
              <div className="mb-3 flex w-full items-start sm:pl-8">
                <p className="shrink-0 text-[16px] font-normal leading-none text-[#1E293B]">Your Way forward</p>
              </div>

              <div
                className="relative flex h-[52px] w-full cursor-pointer items-center justify-between gap-1 overflow-visible rounded-[122px] border-[0.5px] border-white bg-[linear-gradient(90.56deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] pl-6 pr-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px] sm:pl-6"
                role="button"
                tabIndex={0}
                aria-label="Go to current journey step"
                onClick={() => router.push(currentJourneyHref)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(currentJourneyHref);
                  }
                }}
              >
                <div className="pointer-events-none absolute -top-7 left-6 right-[50px] z-[2]" aria-hidden>
                  <div
                    className="absolute flex -translate-x-1/2 flex-col items-center"
                    style={{ left: `${(journeyMarkerIdx + 0.5) * 25}%` }}
                  >
                    <span className="text-[12.677px] font-normal tabular-nums leading-normal text-[#1E293B]">
                      {journeyPct}%
                    </span>
                    <span className="mt-0.5 h-0 w-0 border-x-[5px] border-x-transparent border-t-[7px] border-t-[#0F172A]" />
                  </div>
                </div>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[122px] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]"
                />
                <div className="relative z-[1] flex min-w-0 flex-1 items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {journey.map((step, index) => (
                    <div key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
                      {index > 0 ? <span className="mx-1 h-6 w-px shrink-0 bg-[#DBEAFE]" aria-hidden /> : null}
                      {step.icon === "done" ? (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-[inset_-2px_-2px_100px_0px_rgba(255,255,255,0.02)]">
                          <Check size={11} className="text-white" strokeWidth={2.5} aria-hidden />
                        </span>
                      ) : (
                        <span
                          className={[
                            "flex h-4 w-4 shrink-0 rounded-full border-[1.143px] border-slate-300 bg-white/40 backdrop-blur-[8.4px]",
                            step.icon === "current" ? "ring-1 ring-[#0A89A9]/30" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          aria-hidden
                        />
                      )}
                      <div className="min-w-0 max-w-[8.5rem]">
                        <p className="truncate text-[12px] font-normal leading-none text-[#1E293B]" title={step.title}>
                          {step.title}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] font-normal leading-none text-[#94A3B8]">
                          {step.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/profile"
                  className="proofy-dock-round-btn relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[80px] border border-slate-300 bg-white/60 backdrop-blur-[21px] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]"
                  aria-label="Open profile"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowUpRight size={16} className="text-slate-600" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Interview readiness + recent sections — Figma Insphere 869-7176 */}
        <section className={`${glassCard} relative z-[1] mt-3 flex flex-col gap-6 border-[0.5px] p-6 xl:flex-row xl:items-start`}>
          <article className={`${glassCard} relative w-full flex-1 border-[0.5px] p-6`}>
            <div className="flex w-full flex-col gap-3">
              <div className="flex flex-wrap items-center gap-x-[9px] gap-y-2">
                <p className="shrink-0 text-[12px] font-normal leading-none text-[#64748B]">Currently preparing for</p>
                <div ref={prepareMenuRef} className="relative inline-flex min-h-0 items-center">
                  <button
                    type="button"
                    disabled={storyLib.roles.length === 0}
                    aria-expanded={prepareDropdownOpen}
                    aria-haspopup="listbox"
                    aria-label="Choose role to prepare for"
                    onClick={() => {
                      if (storyLib.roles.length === 0) return;
                      setPrepareDropdownOpen((o) => !o);
                    }}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 outline-none ring-[#0A89A9] transition-[color,transform] hover:bg-white/40 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
                      prepareDropdownOpen ? "bg-white/50" : "",
                    ].join(" ")}
                  >
                    <span className="text-[12px] font-semibold text-[#1E293B]">{preparingTitle}</span>
                    <ChevronDown
                      size={16}
                      className={["text-[#1E293B] transition-transform", prepareDropdownOpen ? "rotate-180" : ""].join(
                        " "
                      )}
                      aria-hidden
                    />
                  </button>
                  {prepareDropdownOpen && storyLib.roles.length > 0 ? (
                    <ul
                      role="listbox"
                      aria-label="Roles"
                      className="absolute left-0 top-full z-20 mt-1 min-w-[min(100%,200px)] max-w-[min(100vw-48px,320px)] overflow-hidden rounded-[14px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.98)_100%)] py-1 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-[18px]"
                    >
                      {storyLib.roles.map((r) => {
                        const active = r.id === effectivePrepareRoleId;
                        return (
                          <li key={r.id} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={active}
                              onClick={() => selectPrepareRole(r.id, r.title)}
                              className={[
                                "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[13px] outline-none transition-colors hover:bg-[#0A89A9]/8 focus-visible:bg-[#0A89A9]/10",
                                active ? "bg-[#0A89A9]/10 font-semibold text-[#0A89A9]" : "font-medium text-[#1E293B]",
                              ].join(" ")}
                            >
                              <span className="min-w-0 truncate">{r.title}</span>
                              {active ? <Check size={14} className="shrink-0 text-[#0A89A9]" strokeWidth={2.5} aria-hidden /> : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex w-full items-center gap-1.5">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[24px] font-medium text-[#1E293B]">Interview readiness</h2>
                    <p className="text-[12px] font-normal text-[#475569]">
                      Mocks, trainings, and pillar balance at a glance.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-3">
                    <p className="flex items-end">
                      <span
                        className="text-[42px] font-semibold leading-[42px]"
                        style={{ color: scoreBandColor(overallScore) }}
                      >
                        {overallScore.toFixed(1)}
                      </span>
                      <span className="text-[24px] font-normal leading-[42px] text-[#64748B]">/05</span>
                    </p>
                    <p
                      className={[
                        "rounded-full border px-4 py-1.5 text-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.06)]",
                        readiness.chipClass,
                      ].join(" ")}
                    >
                      You&apos;re currently on{" "}
                      <span className={["font-semibold", readiness.labelStrongClass].join(" ")}>{readiness.label}</span>
                    </p>
                  </div>
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
                        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_3rem_auto] items-center gap-x-2 text-left"
                        aria-label={`Open ${driver.title} details`}
                      >
                        <PillarIcon size={16} className="shrink-0 text-[#64748B]" strokeWidth={1.8} aria-hidden />
                        <span className="min-w-0 truncate text-[16px] font-medium text-[#475569]">
                          {`Power of ${driver.title}`}
                        </span>
                        <span className="h-[2px] w-[2px] shrink-0 rounded-full bg-[#1E293B]" aria-hidden />
                        <span
                          className="shrink-0 text-right text-[24px] font-semibold leading-none tabular-nums"
                          style={{ color: scoreBandColor(driver.score) }}
                        >
                          {driver.score.toFixed(1)}
                        </span>
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
              className="mt-auto grid h-[54px] grid-cols-4 items-end gap-1 rounded-[12px]"
              role="img"
              aria-label="Recent session activity across four sessions"
            >
              {recentBarSegments.map((segmentClass, i) => (
                <div
                  key={`${effectivePrepareRoleId ?? "x"}-${i}`}
                  className={[
                    "pd-dashboard-bar-segment min-h-0 cursor-default",
                    "origin-bottom transition-[transform,filter] duration-200 ease-out",
                    "hover:scale-y-[1.08] hover:brightness-[1.08]",
                    segmentClass,
                  ].join(" ")}
                  style={{ animationDelay: `${i * 75}ms` }}
                  title={`Session ${String(i + 1).padStart(2, "0")}`}
                />
              ))}
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-1 py-0.5">
              <span className="text-center text-[10px] font-medium text-[#475569]">Session 01</span>
              <span className="h-6 w-px bg-[#E2E8F0]" aria-hidden />
              <span className="text-center text-[10px] font-medium text-[#475569]">Session 02</span>
              <span className="h-6 w-px bg-[#E2E8F0]" aria-hidden />
              <span className="text-center text-[10px] font-medium text-[#475569]">Session 03</span>
              <span className="h-6 w-px bg-[#E2E8F0]" aria-hidden />
              <span className="text-center text-[10px] font-medium text-[#475569]">Session 04</span>
            </div>
          </aside>
        </section>

        <section className="relative z-[1] mt-3 grid gap-3 xl:grid-cols-[1fr_1fr]">
          <article className={`${glassCard} p-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[20px] font-medium text-[#1E293B]">Story Boards</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/storyboard"
                  className="inline-flex items-center gap-1.5 rounded-[80px] border border-[#CBD5E1] bg-white/50 px-3 py-2 text-[13px] font-medium text-[#0A89A9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-[21px] transition-colors hover:border-[#94A3B8] hover:bg-white/70"
                >
                  <Plus size={16} strokeWidth={2} aria-hidden />
                  Add new role
                </Link>
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
                <div className="mt-3 flex flex-col gap-2">
                  {storyLib.roles.map((role) => {
                    const pct = roleCraftProgressPercent(role);
                    const score5 = Math.min(5, Math.max(0, (pct / 100) * 5));
                    const band = readinessBand(score5);
                    const selected = role.id === effectiveStoryRoleId;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => selectPrepareRole(role.id, role.title)}
                        className={[
                          "relative flex w-full items-center justify-between rounded-[16px] bg-white/40 p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px] outline-none ring-[#0A89A9] transition-[box-shadow,ring] focus-visible:ring-2",
                          selected ? "ring-2 ring-[#0A89A9]/35" : "ring-0 hover:bg-white/55",
                        ].join(" ")}
                        aria-pressed={selected}
                        aria-label={`Select ${role.title}`}
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-[18px] font-semibold text-[#1E293B]">{role.title}</p>
                          <p className="mt-1 text-[12px] text-[#64748B]">
                            Readiness {score5.toFixed(1)} / 5 · {band.label}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-medium text-[#64748B]">
                          {selected ? "Selected" : "Select"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedStoryRole ? (
                  <div className="mt-4">
                    <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#94A3B8]">
                      Journeys for {selectedStoryRole.title}
                    </p>
                    {selectedStoryRole.experiences.length === 0 ? (
                      <Link
                        href="/storyboard"
                        className="flex min-h-[88px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#CBD5E1] bg-white/20 p-4 text-center text-[13px] text-[#64748B] shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-[21px] transition-colors hover:border-[#94A3B8] hover:bg-white/35"
                      >
                        <span className="font-medium text-[#1E293B]">No journeys yet</span>
                        <span className="mt-1 text-[12px]">Open Story Boards to add journeys for this role.</span>
                      </Link>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {selectedStoryRole.experiences.map((exp) => {
                          const status = readExperienceCraftUiStatus(exp.id);
                          const href = craftActionHref(exp.id, selectedStoryRole.title, status);
                          return (
                            <Link
                              key={exp.id}
                              href={href}
                              className="flex min-h-[112px] min-w-[min(100%,220px)] max-w-[260px] shrink-0 flex-col justify-between rounded-[16px] border border-white/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.22)_100%)] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                            >
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#1E293B]">
                                  {exp.label.trim() || "Untitled journey"}
                                </p>
                                <p className="mt-1.5 text-[11px] text-[#64748B]">{craftStatusLabel(status)}</p>
                              </div>
                              <span className="mt-3 inline-flex items-center gap-0.5 text-[11px] font-medium text-[#0A89A9]">
                                {craftCtaLabel(status)}
                                <ArrowUpRight size={12} aria-hidden />
                              </span>
                            </Link>
                          );
                        })}
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
