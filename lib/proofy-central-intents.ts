/**
 * Proofy central dock — intent classification and scripted flows (client-side v1).
 * Priority when multiple signals match: new_role → mock → reflect
 */

import type { DriverDef } from "@/lib/mock-report-data";
import { MOCK_DRIVERS, MOCK_SESSION_META } from "@/lib/mock-report-data";
import { getTraining } from "@/lib/trainings-data";

export type ProofyIntent = "reflect" | "new_role" | "mock" | "craft_story" | "unknown";

export type FlowStep =
  | { type: "assistant_text"; text: string }
  | {
      type: "performance_summary";
      overall: number;
      strongest: { title: string; score: number };
      needsWork: { title: string; score: number };
      focusLine: string;
    }
  | { type: "training_cards"; slugs: [string, string] }
  | { type: "mock_options" }
  | { type: "await_role" }
  | { type: "navigate"; href: string };

export const EMPTY_STATE_CHIPS: { label: string; sendText: string }[] = [
  { label: "Review my last session", sendText: "Review my last session" },
  { label: "Start a mock interview", sendText: "I want to do a quick mock interview" },
  { label: "Start with new role", sendText: "I want to craft a story" },
];

function norm(s: string): string {
  return s.toLowerCase().trim();
}

/** Documented priority: new_role → mock → reflect */
export function classifyIntent(text: string): ProofyIntent {
  const t = norm(text);
  if (!t) return "unknown";

  const craftSignals = [
    "craft a story",
    "craft story",
    "create a story",
    "new story",
    "storyboard for",
    "build a story",
    "write a story",
    "star story",
    "s t a r story",
  ];
  if (craftSignals.some((k) => t.includes(k))) return "craft_story";

  const newRoleSignals = [
    "new role",
    "different role",
    "train for a",
    "prepare for a role",
    "another role",
    "switch role",
    "career change",
    "fresh storyboard",
    "new storyboard",
    "prepare for something new",
  ];
  if (newRoleSignals.some((k) => t.includes(k))) return "new_role";

  const mockSignals = [
    "mock interview",
    "quick mock",
    "practice interview",
    "interview tomorrow",
    "interview today",
    "prep session",
    "practice for an interview",
    "do a mock",
    "start a mock",
    "mock session",
  ];
  if (mockSignals.some((k) => t.includes(k))) return "mock";

  const reflectSignals = [
    "last session",
    "recent session",
    "my score",
    "how did i do",
    "how did i perform",
    "performance",
    "feedback",
    "suggest training",
    "recommend training",
    "training for me",
    "review my",
  ];
  if (reflectSignals.some((k) => t.includes(k))) return "reflect";

  return "unknown";
}

function weakestDriver(drivers: DriverDef[]): DriverDef {
  return drivers.reduce((a, b) => (a.score <= b.score ? a : b));
}

function strongestDriver(drivers: DriverDef[]): DriverDef {
  return drivers.reduce((a, b) => (a.score >= b.score ? a : b));
}

/** Two training slugs to recommend when a pillar needs work (mock data). */
export function getTrainingSlugsForWeakest(driver: DriverDef): [string, string] {
  switch (driver.id) {
    case "thinking":
      return ["handling-ambiguity", "interview-essentials"];
    case "action":
      return ["behavioral-car-method", "interview-essentials"];
    case "people":
      return ["tell-me-about-yourself", "behavioral-car-method"];
    case "mastery":
      return ["success-drivers-deep-dive", "interview-essentials"];
  }
}

export function getSessionPerformanceSnapshot() {
  const drivers = MOCK_DRIVERS;
  const overall =
    Math.round((drivers.reduce((s, d) => s + d.score, 0) / drivers.length) * 10) / 10;
  const strong = strongestDriver(drivers);
  const weak = weakestDriver(drivers);
  const focusLine = `Sharpen **${weak.title}** — that’s where you have the most room before your next interview.`;
  return {
    overall,
    strongest: { title: strong.title, score: strong.score },
    needsWork: { title: weak.title, score: weak.score },
    focusLine,
    weakestDriver: weak,
    sessionLabel: MOCK_SESSION_META.interviewName,
  };
}

const UNKNOWN_REPLY =
  "Tell me what you’d like to do — I can review your last session, set up a new role storyboard, or start a mock interview.";

export function buildFlowForIntent(intent: ProofyIntent): FlowStep[] {
  if (intent === "unknown") {
    return [{ type: "assistant_text", text: UNKNOWN_REPLY }];
  }

  if (intent === "craft_story") {
    return [
      { type: "assistant_text", text: "Awesome — what role are you crafting this story for?" },
      { type: "assistant_text", text: "Just say it naturally (you can type or use the mic)." },
      { type: "await_role" },
    ];
  }

  if (intent === "reflect") {
    const snap = getSessionPerformanceSnapshot();
    const slugs = getTrainingSlugsForWeakest(snap.weakestDriver);
    return [
      { type: "assistant_text", text: "I reviewed your latest session." },
      {
        type: "assistant_text",
        text: "You performed well overall — here’s a quick snapshot so we know where to lean in next.",
      },
      {
        type: "performance_summary",
        overall: snap.overall,
        strongest: snap.strongest,
        needsWork: snap.needsWork,
        focusLine: snap.focusLine.replace(/\*\*/g, ""),
      },
      {
        type: "assistant_text",
        text: "Based on this session, I’d recommend focusing here next. Pick one and I’ll take you there.",
      },
      { type: "training_cards", slugs },
    ];
  }

  if (intent === "new_role") {
    return [
      { type: "assistant_text", text: "Got it." },
      {
        type: "assistant_text",
        text: "Let’s create a new storyboard for the role you want to prepare for.",
      },
      {
        type: "assistant_text",
        text: "I’ll help you set it up so your practice, training, and mock sessions stay aligned to that role.",
      },
      { type: "assistant_text", text: "Let’s begin." },
      { type: "navigate", href: "/storyboard/new" },
    ];
  }

  // mock
  return [
    { type: "assistant_text", text: "Got it." },
    {
      type: "assistant_text",
      text: "Let’s get you into a focused practice session. Choose how you want to practice.",
    },
    { type: "mock_options" },
    {
      type: "assistant_text",
      text: "When you’re ready, start the session on the next screen — I’ll take it from there.",
    },
  ];
}

export function trainingCardMeta(slug: string): { title: string; href: string } | null {
  const t = getTraining(slug);
  if (!t) return null;
  return { title: t.title, href: `/trainings/${slug}` };
}
