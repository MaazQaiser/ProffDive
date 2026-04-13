"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Urbanist } from "next/font/google";
import {
  readJourneyState,
  syncJourneyToRoute,
  getSpotlightTargetForStep,
  skipJourney,
  startJourney,
  completeJourneyStep,
  type GuidedJourneyStepId,
} from "@/lib/guided-journey";
import { GUIDED_JOURNEY_COPY } from "@/lib/proofy-script";
import { useUser } from "@/lib/user-context";
import { Check } from "lucide-react";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const BRAND = "#0087A8";

/** Floating AI coach + spotlight. Set `true` to restore the guided journey panel. */
const SHOW_PROOFY_GUIDE_UI = false;

/** Same glass as `glassCard` on NewUserDashboard (readiness + pillars section). No position — compose with `relative` or `absolute`. */
const DASHBOARD_GLASS_SURFACE =
  "overflow-hidden rounded-[24px] border border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

export function JourneyController() {
  const router = useRouter();
  const pathname = usePathname() || "";
  // Avoid hydration mismatches by not reading client-only storage during the initial render.
  const [mounted, setMounted] = useState(false);
  const [stepId, setStepId] = useState<GuidedJourneyStepId>("training");
  const [active, setActive] = useState<boolean>(false);
  const [skipped, setSkipped] = useState<boolean>(false);
  const [completed, setCompleted] = useState<GuidedJourneyStepId[]>([]);
  const [guideOpen, setGuideOpen] = useState(false);
  const [showPartnerTip, setShowPartnerTip] = useState(false);
  const [reportIdx, setReportIdx] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const st = syncJourneyToRoute(pathname);
    setStepId(st.stepId);
    setActive(st.active);
    setSkipped(st.skipped);
    setCompleted(st.completed);
  }, [mounted, pathname]);

  // When landing on the dashboard, always open the guide.
  useEffect(() => {
    if (!mounted) return;
    if (!active || skipped) return;
    if (pathname !== "/dashboard") return;
    setGuideOpen(true);
  }, [mounted, active, skipped, pathname]);

  // Auto-start the journey for first-time (social-login) users who arrive on
  // /dashboard without an already-active journey — covers direct navigation,
  // demo resets, and sessions where onboarding completed before this fix.
  useEffect(() => {
    if (!mounted) return;
    if (active || skipped) return;          // already running or user opted out
    if (pathname !== "/dashboard") return;  // only the first-time dashboard
    try {
      const method = window.localStorage.getItem("proofdive_login_method");
      if (method === "email") return;       // returning users never see the journey
    } catch {
      return;
    }
    startJourney("training");
  }, [mounted, active, skipped, pathname]);

  useEffect(() => {
    const sync = (e?: Event) => {
      const st = readJourneyState();
      setStepId(st.stepId);
      setActive(st.active);
      setSkipped(st.skipped);
      setCompleted(st.completed);

      if ((e as CustomEvent | undefined)?.type === "journey:start") {
        setGuideOpen(true);
        setShowPartnerTip(true);
        window.setTimeout(() => setShowPartnerTip(false), 2600);
      }
    };
    window.addEventListener("journey:start", sync as EventListener);
    window.addEventListener("journey:step", sync as EventListener);
    window.addEventListener("journey:skip", sync);
    window.addEventListener("journey:reset", sync);
    return () => {
      window.removeEventListener("journey:start", sync as EventListener);
      window.removeEventListener("journey:step", sync as EventListener);
      window.removeEventListener("journey:skip", sync);
      window.removeEventListener("journey:reset", sync);
    };
  }, []);

  useEffect(() => {
    const onStep = (e: Event) => {
      const detail = (e as CustomEvent<{ stepId?: GuidedJourneyStepId; reason?: string }>).detail;
      if (!detail?.stepId) return;
      if (detail.reason !== "manual_advance") return;
      setGuideOpen(true);
      // Auto-route to the next module on completion.
      if (detail.stepId === "story") router.push("/storyboard");
      if (detail.stepId === "mock") {
        // If user is viewing a storyboard right after saving, don't interrupt.
        const p = typeof window === "undefined" ? "" : window.location.pathname;
        if (!p.startsWith("/storyboard/")) router.push("/mock");
      }
      if (detail.stepId === "report") {
        // report is entered by route after mock processing; no forced push here
      }
    };
    window.addEventListener("journey:step", onStep);
    return () => window.removeEventListener("journey:step", onStep);
  }, [router]);

  const spotlightTargetId = useMemo(() => getSpotlightTargetForStep(stepId), [stepId]);
  const reportTargets = useMemo(
    () => [
      "report-overall",
      "report-pillars",
      "report-summary",
      "report-questions",
      "report-recording",
      "report-ai-coaching",
    ],
    []
  );
  const storyTargets = useMemo(
    () => [
      "story-score-strip",
      "story-first-card",
      "story-evidence-score",
      "story-purpose-line",
      "story-car-blocks",
      "story-edit-btn",
      "story-save",
    ],
    []
  );
  const isStoryWalkthrough = stepId === "story" && pathname.startsWith("/storyboard/crafting");

  // Reset story walkthrough index when leaving the crafting page.
  useEffect(() => {
    if (!pathname.startsWith("/storyboard/crafting")) setStoryIdx(0);
  }, [pathname]);

  const effectiveTargetId =
    stepId === "training" && !pathname.startsWith("/trainings/interview-essentials")
      ? null
      : stepId === "training" && pathname.startsWith("/trainings/interview-essentials/")
        ? "training-step-reading"
      : stepId === "story" && pathname.startsWith("/storyboard/new")
        ? "story-next"
        : isStoryWalkthrough
          ? storyTargets[Math.min(storyTargets.length - 1, Math.max(0, storyIdx))]
          : stepId === "mock" && pathname.startsWith("/mock/setup")
            ? "mock-start"
            : stepId === "mock" && (pathname.startsWith("/mock/live") || pathname.startsWith("/mock/processing"))
              ? null
          : stepId === "report"
            ? reportTargets[Math.min(reportTargets.length - 1, Math.max(0, reportIdx))] ?? spotlightTargetId
            : spotlightTargetId;

  const shouldRender = mounted && active && !skipped && stepId !== "done";
  if (!shouldRender) return null;

  return (
    <>
      {SHOW_PROOFY_GUIDE_UI ? (
        <ProofyGuideWidget
          stepId={stepId}
          open={guideOpen}
          setOpen={setGuideOpen}
          showPartnerTip={showPartnerTip}
          completed={completed}
          reportIdx={reportIdx}
          reportTotal={reportTargets.length}
          onReportPrev={() => setReportIdx((i) => Math.max(0, i - 1))}
          onReportNext={() => setReportIdx((i) => Math.min(reportTargets.length - 1, i + 1))}
          isStoryWalkthrough={isStoryWalkthrough}
          storyIdx={storyIdx}
          storyTotal={storyTargets.length}
          onStoryPrev={() => setStoryIdx((i) => Math.max(0, i - 1))}
          onStoryNext={() => setStoryIdx((i) => Math.min(storyTargets.length - 1, i + 1))}
          onGoNext={() => {
            if (stepId === "training") router.push("/trainings/interview-essentials");
            if (stepId === "story") router.push("/storyboard");
            if (stepId === "mock") router.push("/mock");
          }}
        />
      ) : null}
      {SHOW_PROOFY_GUIDE_UI &&
      guideOpen &&
      effectiveTargetId &&
      !(
        stepId === "story" &&
        pathname.startsWith("/storyboard/new")
      ) ? (
        <JourneySpotlight
          targetId={effectiveTargetId}
          stepId={stepId}
          storyIdx={isStoryWalkthrough ? storyIdx : undefined}
          walkthrough={
            stepId === "report"
              ? {
                  idx: reportIdx,
                  total: reportTargets.length,
                  onPrev: () => setReportIdx((i) => Math.max(0, i - 1)),
                  onNext: () => setReportIdx((i) => Math.min(reportTargets.length - 1, i + 1)),
                  onFinish: () => completeJourneyStep("report"),
                }
              : isStoryWalkthrough
                ? {
                    idx: storyIdx,
                    total: storyTargets.length,
                    onPrev: () => setStoryIdx((i) => Math.max(0, i - 1)),
                    onNext: () => setStoryIdx((i) => Math.min(storyTargets.length - 1, i + 1)),
                    onFinish: () => completeJourneyStep("story"),
                  }
                : undefined
          }
        />
      ) : null}
    </>
  );
}

function ProofyGuideWidget({
  stepId,
  open,
  setOpen,
  showPartnerTip,
  completed,
  reportIdx,
  reportTotal,
  onReportPrev,
  onReportNext,
  isStoryWalkthrough,
  storyIdx,
  storyTotal,
  onStoryPrev,
  onStoryNext,
  onGoNext,
}: {
  stepId: Exclude<GuidedJourneyStepId, "done">;
  open: boolean;
  setOpen: (v: boolean) => void;
  showPartnerTip: boolean;
  completed: GuidedJourneyStepId[];
  reportIdx: number;
  reportTotal: number;
  onReportPrev: () => void;
  onReportNext: () => void;
  isStoryWalkthrough: boolean;
  storyIdx: number;
  storyTotal: number;
  onStoryPrev: () => void;
  onStoryNext: () => void;
  onGoNext: () => void;
}) {
  const { user } = useUser();
  const firstName = (user.name ?? "").trim().split(/\s+/)[0] || "Maaz";
  const c = GUIDED_JOURNEY_COPY[stepId];
  const order: Exclude<GuidedJourneyStepId, "done">[] = ["training", "story", "mock", "report"];
  const idx = Math.max(0, order.indexOf(stepId));
  const pct = Math.round(((idx + 1) / order.length) * 100);
  // Common practice: treat steps before current as "done" (not based on persisted completed list,
  // which may reflect past runs).
  const isDone = (i: number) => i < idx;
  const labels: Record<Exclude<GuidedJourneyStepId, "done">, string> = {
    training: "Trainings",
    story: "StoryBoard",
    mock: "Mock",
    report: "Report",
  };
  const stateLine: Record<Exclude<GuidedJourneyStepId, "done">, string> = {
    training:
      "Start with Interview Essentials — it's the foundation everything else builds on. Finish the milestone and your StoryBoard unlocks.",
    story: "You’re on StoryBoard. Answer the prompts, then refine CAR blocks and Save.",
    mock: "You’re on Mock. Start Full Practice and keep answers ~1–2 minutes.",
    report: "You’re on Report. Review overall → 4 pillars → Q-by-Q → recording → AI coaching.",
  };
  const guideTitle =
    stepId === "training" ? `You're in the right place, ${firstName}.` : c.title;
  return (
    <div className={`fixed bottom-6 left-6 z-[110] pointer-events-auto ${urbanist.className}`}>
      {!open ? (
        <div className="relative">
          {showPartnerTip && (
            <div
              className={`absolute left-0 bottom-[60px] w-[260px] border-[0.5px] px-3 py-2.5 ${DASHBOARD_GLASS_SURFACE}`}
              style={{ borderRadius: 14 }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: BRAND,
                  margin: 0,
                }}
              >
                AI Coach
              </p>
              <p
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.55,
                  marginBottom: 0,
                }}
              >
                Your guide lives here to track your journey.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open AI Coach guide"
            className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white/70 transition-transform hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${BRAND} 0%, #006785 100%)`,
              boxShadow: "0 8px 24px rgba(0,135,168,0.35)",
            }}
          >
            <span className="text-[14px] font-bold tracking-tight">P</span>
          </button>
        </div>
      ) : (
        <div className={`relative pointer-events-auto w-[320px] border-[0.5px] ${DASHBOARD_GLASS_SURFACE}`}>
          <div className="relative z-[1] overflow-hidden rounded-[24px]">
          <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] px-4 py-3">
            <div className="min-w-0">
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: BRAND,
                  margin: 0,
                }}
              >
                AI Coach
              </p>
              <p
                className="truncate"
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {guideTitle}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[12px] font-semibold transition-colors hover:opacity-80"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Minimize
              </button>
              <button
                type="button"
                onClick={() => skipJourney()}
                className="text-[12px] font-semibold transition-colors hover:opacity-80"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="px-4 pt-3">
            <div className="flex items-center justify-between">
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", margin: 0 }}>
                Step {idx + 1} of {order.length}
              </p>
              <p className="tabular-nums" style={{ fontSize: 11, fontWeight: 600, color: BRAND, margin: 0 }}>
                {pct}%
              </p>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full"
              style={{ background: "rgba(15,23,42,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: BRAND }}
              />
            </div>
            <p
              style={{
                marginTop: 10,
                fontSize: 12,
                color: "var(--color-text-secondary)",
                lineHeight: 1.55,
                marginBottom: 0,
              }}
            >
              {stateLine[stepId]}
            </p>
          </div>

          <div className="px-4 pt-3">
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "var(--color-text-tertiary)",
                margin: 0,
              }}
            >
              Your journey
            </p>
            <div className="mt-2 space-y-1.5">
              {order.map((s, i) => {
                const done = isDone(i);
                const current = s === stepId;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        done
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600"
                          : current
                            ? "border-[rgba(0,135,168,0.25)] bg-[rgba(0,135,168,0.08)] text-[#0087A8]"
                            : "border-[var(--color-border-tertiary)] bg-[rgba(0,0,0,0.02)] text-[var(--color-text-tertiary)]"
                      }`}
                    >
                      {done ? <Check size={12} /> : <span className="text-[10px] font-bold tabular-nums">{i + 1}</span>}
                    </div>
                    <p
                      className={`text-[12px] font-semibold ${
                        done
                          ? "text-[var(--color-text-tertiary)] line-through"
                          : current
                            ? "text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-tertiary)]"
                      }`}
                    >
                      {labels[s]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-3">
            {stepId === "training" ? (
              <p style={{ fontSize: 12, lineHeight: 1.55, color: "var(--color-text-primary)", margin: 0 }}>
                Up next: complete the reading, watch the video, pass the quiz, and finish the workshop — in that
                order.
              </p>
            ) : (
              <p style={{ fontSize: 12, lineHeight: 1.55, color: "var(--color-text-primary)", margin: 0 }}>
                <span style={{ fontWeight: 700 }}>Next:</span>{" "}
                <span style={{ color: "var(--color-text-secondary)" }}>{c.doNext}</span>{" "}
                <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                  Do this to move to the next step.
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] px-4 py-3">
            {stepId === "report" ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onReportPrev}
                    className="h-9 px-3 text-[12px] font-semibold transition-colors hover:bg-black/[0.04] disabled:opacity-40"
                    style={{
                      borderRadius: 10,
                      border: "0.5px solid var(--color-border-tertiary)",
                      background: "rgba(255,255,255,0.55)",
                      color: "var(--color-text-primary)",
                    }}
                    disabled={reportIdx <= 0}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={onReportNext}
                    className="h-9 px-3 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ borderRadius: 10, background: BRAND }}
                    disabled={reportIdx >= reportTotal - 1}
                  >
                    Next
                  </button>
                </div>
                <p
                  className="text-right leading-relaxed"
                  style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: 0 }}
                >
                  Section {Math.min(reportTotal, Math.max(1, reportIdx + 1))}/{reportTotal}
                </p>
              </>
            ) : isStoryWalkthrough ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onStoryPrev}
                    className="h-9 px-3 text-[12px] font-semibold transition-colors hover:bg-black/[0.04] disabled:opacity-40"
                    style={{
                      borderRadius: 10,
                      border: "0.5px solid var(--color-border-tertiary)",
                      background: "rgba(255,255,255,0.55)",
                      color: "var(--color-text-primary)",
                    }}
                    disabled={storyIdx <= 0}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={onStoryNext}
                    className="h-9 px-3 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ borderRadius: 10, background: BRAND }}
                    disabled={storyIdx >= storyTotal - 1}
                  >
                    Next
                  </button>
                </div>
                <p
                  className="text-right leading-relaxed"
                  style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: 0 }}
                >
                  Tip {Math.min(storyTotal, Math.max(1, storyIdx + 1))}/{storyTotal}
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onGoNext}
                  className="h-9 px-3 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ borderRadius: 10, background: BRAND }}
                >
                  Take me there
                </button>
                <p
                  className="text-right leading-relaxed"
                  style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: 0 }}
                >
                  Or click the highlighted area.
                </p>
              </>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JourneySpotlight({
  targetId,
  stepId,
  storyIdx,
  hideCallout,
  walkthrough,
}: {
  targetId: string;
  stepId: GuidedJourneyStepId;
  storyIdx?: number;
  hideCallout?: boolean;
  walkthrough?: {
    idx: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    onFinish: () => void;
  };
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [found, setFound] = useState(false);
  const [hideCalloutState, setHideCalloutState] = useState(false);
  const [viewport, setViewport] = useState<{ w: number; h: number }>(() => ({
    w: typeof window === "undefined" ? 0 : window.innerWidth,
    h: typeof window === "undefined" ? 0 : window.innerHeight,
  }));

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    setHideCalloutState(false);

    const tryFindAndTrack = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(`[data-journey-id="${targetId}"]`);
      if (!el) {
        setRect(null);
        setFound(false);
        raf = window.requestAnimationFrame(tryFindAndTrack);
        return;
      }

      setFound(true);

      // Let layout settle, then scroll + measure.
      window.setTimeout(() => {
        if (cancelled) return;
        try {
          el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        } catch {
          // no-op
        }
      }, 0);

      const compute = () => {
        if (cancelled) return;
        const r = el.getBoundingClientRect();
        // Avoid "top-left" bug when rect is not ready yet.
        if (r.width > 2 && r.height > 2) setRect(r);
        setViewport({ w: window.innerWidth, h: window.innerHeight });
        raf = window.requestAnimationFrame(compute);
      };
      raf = window.requestAnimationFrame(compute);
    };

    raf = window.requestAnimationFrame(tryFindAndTrack);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [targetId]);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-journey-id="${targetId}"]`);
    if (!el) return;
    // For some steps, remove the spotlight once the user clicks the target.
    const dismissOnClick =
      targetId === "training-step-reading" || targetId === "mock-card" || targetId === "mock-start";
    if (!dismissOnClick) return;
    const onClick = () => setHideCalloutState(true);
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [targetId]);

  if (!rect || !found) return null;

  const hideSpotlight =
    hideCalloutState &&
    (targetId === "training-step-reading" || targetId === "mock-card" || targetId === "mock-start");

  const vw = (viewport.w || (typeof window !== "undefined" ? window.innerWidth : 0)) ?? 0;
  const vh = (viewport.h || (typeof window !== "undefined" ? window.innerHeight : 0)) ?? 0;

  const pad = 10;
  const top = Math.max(12, rect.top - pad);
  const left = Math.max(12, rect.left - pad);
  const width = rect.width + pad * 2;
  const height = rect.height + pad * 2;

  const maxW = 320;
  const gap = 12;

  const placeAbove = rect.top > vh * 0.55;
  const calloutTop = placeAbove
    ? Math.max(12, rect.top - gap - 84)
    : Math.min(vh - 120, rect.bottom + gap);
  const calloutLeft = Math.min(
    vw - (maxW + 12),
    Math.max(12, rect.left + rect.width / 2 - maxW / 2)
  );

  const arrowToTop = !placeAbove;
  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
  const arrowX = clamp(rect.left + rect.width / 2 - calloutLeft, 18, maxW - 18);

  return (
    <div className="fixed inset-0 z-[95] pointer-events-none">
      {!hideSpotlight ? (
        <div
          className="pointer-events-none absolute rounded-[16px] ring-[3px] ring-[#0087A8] journey-spotlight-ring"
          style={{ top, left, width, height }}
        />
      ) : null}

      {!hideCallout && !hideCalloutState ? (
        <div
          className={`card pointer-events-none absolute w-[320px] px-4 py-3 ${urbanist.className}`}
          style={{ top: calloutTop, left: calloutLeft, borderRadius: 16 }}
        >
          {/* Arrow (triangle) — match glass fill */}
          <div
            className="absolute w-0 h-0"
            style={
              arrowToTop
                ? {
                    left: arrowX,
                    top: -8,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderBottom: "8px solid rgba(255,255,255,0.92)",
                    filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.06))",
                  }
                : {
                    left: arrowX,
                    bottom: -8,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid rgba(255,255,255,0.92)",
                    filter: "drop-shadow(0 -1px 0 rgba(0,0,0,0.06))",
                  }
            }
          />

          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: BRAND,
              margin: 0,
            }}
          >
            AI Coach
          </p>
          <p
            style={{
              marginTop: 6,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: 0,
            }}
          >
            {titleFor(stepId, storyIdx)}
          </p>
          <p style={{ marginTop: 6, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: 0 }}>
            {hintFor(stepId, storyIdx)}{" "}
            {walkthrough ? (
              <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Use Prev / Next to continue.</span>
            ) : (
              <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Click the highlighted button.</span>
            )}
          </p>

          {walkthrough ? (
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="tabular-nums" style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", margin: 0 }}>
                Section {Math.min(walkthrough.total, Math.max(1, walkthrough.idx + 1))}/{walkthrough.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={walkthrough.onPrev}
                  disabled={walkthrough.idx <= 0}
                  className="pointer-events-auto h-8 px-3 text-[12px] font-semibold transition-colors hover:bg-black/[0.04] disabled:opacity-40"
                  style={{
                    borderRadius: 10,
                    border: "0.5px solid var(--color-border-tertiary)",
                    background: "rgba(255,255,255,0.55)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Prev
                </button>
                {walkthrough.idx >= walkthrough.total - 1 ? (
                  <button
                    type="button"
                    onClick={walkthrough.onFinish}
                    className="pointer-events-auto h-8 px-3 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ borderRadius: 10, background: BRAND }}
                  >
                    End journey
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={walkthrough.onNext}
                    className="pointer-events-auto h-8 px-3 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ borderRadius: 10, background: BRAND }}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const STORY_WALKTHROUGH_COPY = [
  {
    title: "Your story strength",
    hint: "This score shows how interview-ready your storyboard is overall. Aim for 3.5+ across all sections.",
  },
  {
    title: "Section cards",
    hint: "Each card maps to a behavioral competency — exactly what interviewers test in panels.",
  },
  {
    title: "Evidence strength",
    hint: "Below 2.5 means the interviewer will probe harder. Fix your lowest-scoring sections first.",
  },
  {
    title: "Interviewer purpose",
    hint: "This line tells you exactly what they're testing. Design your answer around it.",
  },
  {
    title: "CAR blocks",
    hint: "Context sets the scene. Action is what you did. Result is the measurable outcome.",
  },
  {
    title: "Edit with AI prompts",
    hint: "Hit Edit to rewrite a section using preset prompts or your own direction. 3 regenerations per section.",
  },
  {
    title: "Save your storyboard",
    hint: "When your CAR blocks feel strong, save to lock in your story bank before the mock.",
  },
] as const;

function titleFor(stepId: GuidedJourneyStepId, storyIdx?: number): string {
  if (stepId === "story" && storyIdx !== undefined) {
    return STORY_WALKTHROUGH_COPY[Math.min(STORY_WALKTHROUGH_COPY.length - 1, storyIdx)]?.title ?? "Continue your StoryBoard";
  }
  switch (stepId) {
    case "training":
      return "Start the essential training";
    case "story":
      return "Continue your StoryBoard";
    case "mock":
      return "Start your mock interview";
    case "report":
      return "Review your AI coaching";
    case "done":
      return "Done";
  }
}

function hintFor(stepId: GuidedJourneyStepId, storyIdx?: number): string {
  if (stepId === "story" && storyIdx !== undefined) {
    return STORY_WALKTHROUGH_COPY[Math.min(STORY_WALKTHROUGH_COPY.length - 1, storyIdx)]?.hint ?? "Write short, specific answers.";
  }
  switch (stepId) {
    case "training":
      return "Complete the first milestone so your answers have structure.";
    case "story":
      return "Write short, specific answers. Use measurable results.";
    case "mock":
      return "Treat it like the real thing. Keep answers 1–2 minutes.";
    case "report":
      return "Start with the lowest pillar score and the coaching rewrite.";
    case "done":
      return "";
  }
}

