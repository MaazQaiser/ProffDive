"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  readJourneyState,
  syncJourneyToRoute,
  getSpotlightTargetForStep,
  skipJourney,
  completeJourneyStep,
  type GuidedJourneyStepId,
} from "@/lib/guided-journey";
import { GUIDED_JOURNEY_COPY } from "@/lib/proofy-script";
import { Check } from "lucide-react";

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

  const effectiveTargetId =
    stepId === "training" && !pathname.startsWith("/trainings/interview-essentials")
      ? null
      : stepId === "training" && pathname.startsWith("/trainings/interview-essentials/")
        ? "training-step-reading"
      : stepId === "story" && pathname.startsWith("/storyboard/new")
        ? "story-next"
        : stepId === "story" && pathname.startsWith("/storyboard/crafting")
          ? "story-save"
          : stepId === "mock" && pathname.startsWith("/mock/setup")
            ? "mock-start"
            : stepId === "mock" && (pathname.startsWith("/mock/live") || pathname.startsWith("/mock/processing"))
              ? null
          : stepId === "report"
            ? reportTargets[Math.min(reportTargets.length - 1, Math.max(0, reportIdx))] ?? spotlightTargetId
            : spotlightTargetId;

  useEffect(() => {
    if (!mounted) return;
    if (!active || skipped) return;
    // When the journey is active but the user is off-track, gently bring them back.
    if (stepId === "training" && pathname.startsWith("/trainings/") && !pathname.startsWith("/trainings/interview-essentials")) {
      router.replace("/trainings/interview-essentials");
    }
  }, [mounted, active, skipped, stepId, pathname, router]);

  const shouldRender = mounted && active && !skipped && stepId !== "done";
  if (!shouldRender) return null;

  return (
    <>
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
        onGoNext={() => {
          if (stepId === "training") router.push("/trainings/interview-essentials");
          if (stepId === "story") router.push("/storyboard");
          if (stepId === "mock") router.push("/mock");
        }}
      />
      {guideOpen &&
      effectiveTargetId &&
      !(
        stepId === "story" &&
        (pathname.startsWith("/storyboard/new") || pathname.startsWith("/storyboard/crafting"))
      ) ? (
        <JourneySpotlight
          targetId={effectiveTargetId}
          stepId={stepId}
          walkthrough={
            stepId === "report"
              ? {
                  idx: reportIdx,
                  total: reportTargets.length,
                  onPrev: () => setReportIdx((i) => Math.max(0, i - 1)),
                  onNext: () => setReportIdx((i) => Math.min(reportTargets.length - 1, i + 1)),
                  onFinish: () => completeJourneyStep("report"),
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
  onGoNext: () => void;
}) {
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
    training: "You’re on Trainings. Finish Milestone 1 (Reading → Video → Quiz → Workshop).",
    story: "You’re on StoryBoard. Answer the prompts, then refine CAR blocks and Save.",
    mock: "You’re on Mock. Start Full Practice and keep answers ~1–2 minutes.",
    report: "You’re on Report. Review overall → 4 pillars → Q-by-Q → recording → AI coaching.",
  };
  return (
    <div className="fixed bottom-6 left-6 z-[110] pointer-events-auto">
      {!open ? (
        <div className="relative">
          {showPartnerTip && (
            <div className="absolute left-0 bottom-[60px] w-[260px] rounded-[14px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(2,6,23,0.18)] px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0087A8]">
                Proofy partner
              </p>
              <p className="mt-1 text-[12px] text-[#475569] leading-relaxed">
                Your guide lives here to track your journey.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open Proofy guide"
            className="w-12 h-12 rounded-full bg-[#0087A8] text-white shadow-lg shadow-[#0087A8]/30 ring-2 ring-white/60 flex items-center justify-center"
          >
            <span className="text-[14px] font-black">P</span>
          </button>
        </div>
      ) : (
        <div className="w-[320px] rounded-[18px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(2,6,23,0.18)] overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0087A8]">
                Proofy guide
              </p>
              <p className="text-[13px] font-semibold text-[#0F172A] truncate">{c.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[12px] font-bold text-[#475569] hover:text-[#0F172A] transition-colors"
              >
                Minimize
              </button>
              <button
                type="button"
                onClick={() => skipJourney()}
                className="text-[12px] font-bold text-[#475569] hover:text-[#0F172A] transition-colors"
              >
                Skip
              </button>
            </div>
          </div>

          <div className="px-4 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-[#64748B]">
                Step {idx + 1} of {order.length}
              </p>
              <p className="text-[11px] font-bold text-[#0087A8] tabular-nums">{pct}%</p>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[#0F172A]/10 overflow-hidden">
              <div className="h-full rounded-full bg-[#0087A8] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-[12px] text-[#475569] leading-relaxed">{stateLine[stepId]}</p>
          </div>

          <div className="px-4 pt-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Journey</p>
            <div className="mt-2 space-y-1.5">
              {order.map((s, i) => {
                const done = isDone(i);
                const current = s === stepId;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                        done ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : current ? "bg-[#0087A8]/10 border-[#0087A8]/20 text-[#0087A8]" : "bg-[#0F172A]/[0.03] border-black/10 text-[#94A3B8]"
                      }`}
                    >
                      {done ? <Check size={12} /> : <span className="text-[10px] font-black tabular-nums">{i + 1}</span>}
                    </div>
                    <p
                      className={`text-[12px] font-semibold ${
                        done ? "text-[#64748B] line-through" : current ? "text-[#0F172A]" : "text-[#94A3B8]"
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
            <p className="text-[12px] text-[#0F172A] leading-relaxed">
              <span className="font-bold text-[#0F172A]">Next:</span>{" "}
              <span className="text-[#475569]">{c.doNext}</span>
              <span className="text-[#475569]"> </span>
              <span className="text-[#0F172A] font-semibold">Do this to move to the next step.</span>
            </p>
          </div>

          <div className="px-4 py-3 border-t border-black/5 flex items-center justify-between gap-3">
            {stepId === "report" ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onReportPrev}
                    className="h-9 px-3 rounded-[12px] border border-black/10 bg-white text-[#0F172A] text-[12px] font-bold hover:bg-black/[0.03] transition-colors disabled:opacity-40"
                    disabled={reportIdx <= 0}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={onReportNext}
                    className="h-9 px-3 rounded-[12px] bg-[#0087A8] text-white text-[12px] font-bold hover:bg-[#007592] transition-colors disabled:opacity-40"
                    disabled={reportIdx >= reportTotal - 1}
                  >
                    Next
                  </button>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed text-right">
                  Section {Math.min(reportTotal, Math.max(1, reportIdx + 1))}/{reportTotal}
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onGoNext}
                  className="h-9 px-3 rounded-[12px] bg-[#0087A8] text-white text-[12px] font-bold hover:bg-[#007592] transition-colors"
                >
                  Take me there
                </button>
                <p className="text-[11px] text-[#64748B] leading-relaxed text-right">
                  Or click the highlighted area.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function JourneySpotlight({
  targetId,
  stepId,
  hideCallout,
  walkthrough,
}: {
  targetId: string;
  stepId: GuidedJourneyStepId;
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
          className="absolute rounded-[16px] ring-[3px] ring-[#0087A8] journey-spotlight-ring"
          style={{ top, left, width, height }}
        />
      ) : null}

      <div
        className="absolute w-[320px]"
        style={{
          top: calloutTop,
          left: calloutLeft,
        }}
      />

      {!hideCallout && !hideCalloutState ? (
        <div
          className="absolute w-[320px] rounded-[16px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(2,6,23,0.20)] px-4 py-3"
          style={{ top: calloutTop, left: calloutLeft }}
        >
          {/* Arrow (triangle) */}
          <div
            className="absolute w-0 h-0"
            style={
              arrowToTop
                ? {
                    left: arrowX,
                    top: -8,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderBottom: "8px solid white",
                    filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.08))",
                  }
                : {
                    left: arrowX,
                    bottom: -8,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid white",
                    filter: "drop-shadow(0 -1px 0 rgba(0,0,0,0.08))",
                  }
            }
          />

          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0087A8]">
            Proofy guide
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[#0F172A]">{titleFor(stepId)}</p>
          <p className="mt-1 text-[12px] text-[#475569] leading-relaxed">
            {hintFor(stepId)} <span className="font-semibold text-[#0F172A]">Click the highlighted button.</span>
          </p>

          {walkthrough ? (
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-[#64748B] tabular-nums">
                Section {Math.min(walkthrough.total, Math.max(1, walkthrough.idx + 1))}/{walkthrough.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={walkthrough.onPrev}
                  disabled={walkthrough.idx <= 0}
                  className="pointer-events-auto h-8 px-3 rounded-[12px] border border-black/10 bg-white text-[#0F172A] text-[12px] font-bold hover:bg-black/[0.03] transition-colors disabled:opacity-40"
                >
                  Prev
                </button>
                {walkthrough.idx >= walkthrough.total - 1 ? (
                  <button
                    type="button"
                    onClick={walkthrough.onFinish}
                    className="pointer-events-auto h-8 px-3 rounded-[12px] bg-[#0087A8] text-white text-[12px] font-bold hover:bg-[#007592] transition-colors"
                  >
                    End journey
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={walkthrough.onNext}
                    className="pointer-events-auto h-8 px-3 rounded-[12px] bg-[#0087A8] text-white text-[12px] font-bold hover:bg-[#007592] transition-colors"
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

function titleFor(stepId: GuidedJourneyStepId): string {
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

function hintFor(stepId: GuidedJourneyStepId): string {
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

