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
  { label: "Share my last session progress", sendText: "Share my last session progress" },
  { label: "Create a new role to prepare", sendText: "Create a new role to prepare" },
  { label: "Start a mock interview", sendText: "Start a mock interview" },
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
  const focusLine = `Your biggest room to grow is **${weak.title}** — a bit of focused work here will move the needle fastest before your next interview.`;
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
  "Not sure I caught that — I can pull up your last session, help set up a new role storyboard, or get a mock going. What sounds right?";

export function buildFlowForIntent(intent: ProofyIntent): FlowStep[] {
  if (intent === "unknown") {
    return [{ type: "assistant_text", text: UNKNOWN_REPLY }];
  }

  if (intent === "craft_story") {
    return [
      { type: "assistant_text", text: "Love it — what role are you building this story for?" },
      { type: "assistant_text", text: "You can type it out or just hit the mic, whatever's easier." },
      { type: "await_role" },
    ];
  }

  if (intent === "reflect") {
    const snap = getSessionPerformanceSnapshot();
    const slugs = getTrainingSlugsForWeakest(snap.weakestDriver);
    return [
      { type: "assistant_text", text: "Pulled up your last session — here's how it went." },
      {
        type: "assistant_text",
        text: "You did pretty well overall. Here's what stood out:",
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
        text: "A couple of things worth sharpening before your next interview — tap one and I'll take you there.",
      },
      { type: "training_cards", slugs },
    ];
  }

  if (intent === "new_role") {
    return [
      {
        type: "assistant_text",
        text: "Let's get a storyboard going for your target role.",
      },
      {
        type: "assistant_text",
        text: "Once it's set up, your practice, training, and mocks will all be tied to that role — so nothing's wasted.",
      },
      { type: "navigate", href: "/storyboard/new" },
    ];
  }

  // mock
  return [
    {
      type: "assistant_text",
      text: "Nice — let's find you the right kind of session. How do you want to practice?",
    },
    { type: "mock_options" },
    {
      type: "assistant_text",
      text: "Whenever you're ready, just kick it off — I'll be with you inside.",
    },
  ];
}

export function trainingCardMeta(slug: string): { title: string; href: string } | null {
  const t = getTraining(slug);
  if (!t) return null;
  return { title: t.title, href: `/trainings/${slug}` };
}
