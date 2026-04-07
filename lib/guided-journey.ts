export type GuidedJourneyStepId = "training" | "story" | "mock" | "report" | "done";

export type GuidedJourneyEventName =
  | "journey:start"
  | "journey:step"
  | "journey:complete"
  | "journey:skip"
  | "journey:reset";

export type GuidedJourneyStepEventDetail = {
  stepId: GuidedJourneyStepId;
  reason:
    | "start"
    | "route_enter"
    | "route_advance"
    | "manual_advance"
    | "manual_skip"
    | "manual_reset";
};

export type GuidedJourneyCompleteDetail = {
  completedStepId: Exclude<GuidedJourneyStepId, "done">;
};

const STORAGE_KEY = "proofdive.guidedJourney.v1";

type GuidedJourneyState = {
  active: boolean;
  skipped: boolean;
  stepId: GuidedJourneyStepId;
  completed: GuidedJourneyStepId[];
  updatedAt: number;
};

export const GUIDED_JOURNEY_TARGETS: Record<
  Exclude<GuidedJourneyStepId, "done">,
  { routePrefix: string; spotlightTargetId: string; nextRoute?: string }
> = {
  training: {
    routePrefix: "/trainings",
    spotlightTargetId: "training-start",
    nextRoute: "/trainings/interview-essentials",
  },
  story: {
    routePrefix: "/storyboard",
    spotlightTargetId: "story-start",
    nextRoute: "/storyboard/new",
  },
  mock: {
    routePrefix: "/mock",
    spotlightTargetId: "mock-card",
    nextRoute: "/mock",
  },
  report: {
    routePrefix: "/report",
    spotlightTargetId: "report-ai-coaching",
  },
};

export function defaultJourneyState(): GuidedJourneyState {
  return {
    active: false,
    skipped: false,
    stepId: "training",
    completed: [],
    updatedAt: Date.now(),
  };
}

function safeParse(raw: string | null): GuidedJourneyState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<GuidedJourneyState>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.active !== "boolean") return null;
    if (typeof parsed.skipped !== "boolean") return null;
    if (typeof parsed.stepId !== "string") return null;
    if (!Array.isArray(parsed.completed)) return null;
    const updatedAt = typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now();
    const stepId = isStepId(parsed.stepId) ? parsed.stepId : "training";
    const completed = (parsed.completed as unknown[])
      .filter((x): x is GuidedJourneyStepId => typeof x === "string" && isStepId(x))
      .filter((x) => x !== "done");
    return { active: parsed.active, skipped: parsed.skipped, stepId, completed, updatedAt };
  } catch {
    return null;
  }
}

function isStepId(x: string): x is GuidedJourneyStepId {
  return x === "training" || x === "story" || x === "mock" || x === "report" || x === "done";
}

export function readJourneyState(): GuidedJourneyState {
  if (typeof window === "undefined") return defaultJourneyState();
  const s = safeParse(window.localStorage.getItem(STORAGE_KEY));
  return s ?? defaultJourneyState();
}

export function writeJourneyState(next: GuidedJourneyState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...next, updatedAt: Date.now() }));
}

export function resetJourneyState() {
  const next = defaultJourneyState();
  writeJourneyState(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<GuidedJourneyStepEventDetail>("journey:reset", { detail: { stepId: next.stepId, reason: "manual_reset" } }));
  }
}

export function skipJourney() {
  const st = readJourneyState();
  const next: GuidedJourneyState = { ...st, active: false, skipped: true, updatedAt: Date.now() };
  writeJourneyState(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<GuidedJourneyStepEventDetail>("journey:skip", { detail: { stepId: next.stepId, reason: "manual_skip" } }));
  }
}

export function startJourney(startAt: GuidedJourneyStepId = "training") {
  const st = readJourneyState();
  const next: GuidedJourneyState = {
    ...st,
    active: true,
    skipped: false,
    stepId: startAt,
    completed: st.completed.filter((x) => x !== "done"),
    updatedAt: Date.now(),
  };
  writeJourneyState(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<GuidedJourneyStepEventDetail>("journey:start", {
        detail: { stepId: next.stepId, reason: "start" },
      })
    );
  }
}

export function getSpotlightTargetForStep(stepId: GuidedJourneyStepId): string | null {
  if (stepId === "done") return null;
  return GUIDED_JOURNEY_TARGETS[stepId].spotlightTargetId;
}

export function advanceJourney(reason: GuidedJourneyStepEventDetail["reason"] = "manual_advance") {
  const st = readJourneyState();
  if (!st.active || st.skipped) return;

  const order: GuidedJourneyStepId[] = ["training", "story", "mock", "report", "done"];
  const idx = order.indexOf(st.stepId);
  const nextStep = order[Math.max(0, idx + 1)] ?? "done";
  const completed = st.stepId === "done" ? st.completed : [...new Set([...st.completed, st.stepId])];
  const next: GuidedJourneyState = {
    ...st,
    stepId: nextStep,
    completed,
    active: nextStep !== "done",
    updatedAt: Date.now(),
  };

  writeJourneyState(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<GuidedJourneyStepEventDetail>("journey:step", {
        detail: { stepId: next.stepId, reason },
      })
    );
  }
}

export function completeJourneyStep(completedStepId: Exclude<GuidedJourneyStepId, "done">) {
  const st = readJourneyState();
  if (!st.active || st.skipped) return;
  if (st.stepId !== completedStepId) return;
  advanceJourney("manual_advance");
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<GuidedJourneyCompleteDetail>("journey:complete", {
        detail: { completedStepId },
      })
    );
  }
}

export function syncJourneyToRoute(pathname: string): GuidedJourneyState {
  const st = readJourneyState();
  if (!st.active || st.skipped) return st;

  // Route-based transitions:
  // - training -> story when entering /storyboard/new or /storyboard/new?...
  // - story -> mock when entering /mock/setup...
  // - mock -> report when entering /report/...
  // - report -> done when entering /report/... (we treat as completion on entry)
  const p = pathname || "";
  const isStoryNew = p === "/storyboard/new" || p.startsWith("/storyboard/new?");
  const isMock = p === "/mock" || p.startsWith("/mock/");
  const isMockSetup = p === "/mock/setup" || p.startsWith("/mock/setup?");
  const isReport = p.startsWith("/report/");

  let desired: GuidedJourneyStepId = st.stepId;
  if (isStoryNew) desired = "story";
  if (isMock) desired = "mock";
  if (isReport) desired = "report";

  // Auto-advance based on where the user is.
  const order: GuidedJourneyStepId[] = ["training", "story", "mock", "report", "done"];
  const currentIdx = order.indexOf(st.stepId);
  const desiredIdx = order.indexOf(desired);

  if (desiredIdx > currentIdx) {
    const completed = [...new Set([...st.completed, ...order.slice(currentIdx, desiredIdx)])].filter(
      (x) => x !== "done"
    );
    const next: GuidedJourneyState = {
      ...st,
      stepId: desired,
      completed,
      updatedAt: Date.now(),
    };
    writeJourneyState(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<GuidedJourneyStepEventDetail>("journey:step", {
          detail: { stepId: next.stepId, reason: "route_advance" },
        })
      );
    }
    return next;
  }

  return st;
}

