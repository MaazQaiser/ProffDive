/**
 * Shared storyboard crafting model + localStorage hydration.
 * Used by /storyboard/crafting (edit) and /storyboard/[id] (read-only export).
 */

import type { CSSProperties } from "react";

export const STORYBOARD_CRAFTING_STORAGE_KEY = "proofdive_crafting_storyboard";

export const TEAL = "#0087A8";

export const STORYBOARD_GLASS_CARD: CSSProperties = {
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.88)",
};

export type CarBlock = { context: string; action: string; result: string };

export type CraftSection = {
  id: string;
  pillar: string;
  title: string;
  car: CarBlock;
  history: CarBlock[];
  prompt: string;
  regenerationsUsed: number;
};

export const INTRO_SECTION_ID = "intro";

export function isIntroSection(id: string): boolean {
  return id === INTRO_SECTION_ID;
}

export function normalizeIntroBlock(car: CarBlock): CarBlock {
  const parts = [car.context, car.action, car.result].map((x) => (x ?? "").trim()).filter(Boolean);
  const context = parts.join("\n\n") || car.context || "";
  return { context, action: "", result: "" };
}

export const SECTION_DEFS: { id: string; pillar: string; title: string }[] = [
  { id: INTRO_SECTION_ID, pillar: "Introduction", title: "Core Introduction" },
  { id: "thinking-analytical", pillar: "Power of Thinking (Strategic)", title: "Analytical Thinking" },
  { id: "thinking-prioritization", pillar: "Power of Thinking (Strategic)", title: "Prioritization" },
  { id: "thinking-decision", pillar: "Power of Thinking (Strategic)", title: "Decision-Making Agility" },
  { id: "action-ownership", pillar: "Power of Action (Leadership)", title: "Ownership" },
  { id: "action-initiative", pillar: "Power of Action (Leadership)", title: "Initiative & Follow-through" },
  { id: "action-change", pillar: "Power of Action (Leadership)", title: "Embraces Change" },
  { id: "people-influence", pillar: "Power of People (People)", title: "Influence" },
  { id: "people-collaboration", pillar: "Power of People (People)", title: "Collaboration & Inclusion" },
  { id: "people-capability", pillar: "Power of People (People)", title: "Grows Capability" },
  { id: "mastery-functional", pillar: "Power of Mastery (Technical)", title: "Functional Knowledge" },
  { id: "mastery-execution", pillar: "Power of Mastery (Technical)", title: "Execution" },
  { id: "mastery-innovation", pillar: "Power of Mastery (Technical)", title: "Innovation" },
];

function seedIntroCar(): CarBlock {
  return {
    context:
      "Write one short paragraph: your role, scope, and a line that previews the competency stories you will cover in this storyboard.",
    action: "",
    result: "",
  };
}

function seedCar(title: string): CarBlock {
  return {
    context: `Set the scene for "${title}": situation, constraints, and stakes in 2–3 sentences.`,
    action: `Describe what you personally did—decisions, steps, and how you drove progress.`,
    result: `State measurable or qualitative outcomes, learning, and what changed for the business or team.`,
  };
}

export function buildInitialSections(): CraftSection[] {
  return SECTION_DEFS.map((d) => ({
    ...d,
    car: isIntroSection(d.id) ? seedIntroCar() : seedCar(d.title),
    history: [],
    prompt: "",
    regenerationsUsed: 0,
  }));
}

export function mockStoryScore(sectionId: string): number {
  const weak = new Set([
    "thinking-analytical",
    "action-initiative",
    "people-influence",
    "mastery-execution",
  ]);
  if (weak.has(sectionId)) {
    return 2.1 + (sectionId.length % 4) * 0.08;
  }
  return 3.0 + (sectionId.length % 6) * 0.12;
}

export const PROOFY_LOW_SCORE_MESSAGE =
  "Proofy suggests adding a more impactful story that showcases your decision-making power, clear ownership, and measurable outcomes.";

function normalizeSectionRow(s: CraftSection): CraftSection {
  const base: CraftSection = {
    ...s,
    history: Array.isArray(s.history) ? s.history : [],
    regenerationsUsed: typeof s.regenerationsUsed === "number" ? s.regenerationsUsed : 0,
    prompt: typeof s.prompt === "string" ? s.prompt : "",
  };
  if (!isIntroSection(s.id) || !s.car) return base;
  return {
    ...base,
    car: normalizeIntroBlock(s.car),
    history: base.history.map((h) => normalizeIntroBlock(h)),
  };
}

/** Returns null if missing or invalid shape. */
export function hydrateCraftSectionsFromLocalStorage(): CraftSection[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORYBOARD_CRAFTING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CraftSection[];
    if (!Array.isArray(parsed) || parsed.length !== SECTION_DEFS.length) return null;
    return parsed.map((s) => normalizeSectionRow(s));
  } catch {
    return null;
  }
}

export function buildResumeExportText(sections: CraftSection[], storyboardId: string): string {
  const lines: string[] = [
    `ProofDive resume export`,
    `Storyboard ID: ${storyboardId}`,
    ``,
  ];
  for (const s of sections) {
    lines.push(`## ${s.pillar} — ${s.title}`, ``);
    if (isIntroSection(s.id)) {
      lines.push(s.car.context.trim(), ``);
    } else {
      lines.push(`Context`, s.car.context.trim(), ``, `Action`, s.car.action.trim(), ``, `Result`, s.car.result.trim(), ``);
    }
  }
  return lines.join("\n");
}
