/**
 * Shared storyboard crafting model + localStorage hydration.
 * Used by /storyboard/crafting (edit) and /storyboard/[id] (read-only export).
 */

import type { CSSProperties } from "react";

export const STORYBOARD_CRAFTING_STORAGE_KEY = "proofdive_crafting_storyboard";

export function craftStorageKeyForExperience(experienceId: string): string {
  return `${STORYBOARD_CRAFTING_STORAGE_KEY}:${experienceId}`;
}

export function craftStorageKeyForRole(roleId: string): string {
  return `${STORYBOARD_CRAFTING_STORAGE_KEY}:role:${roleId}`;
}

/** Scoped key when building a journey; falls back to legacy global key. */
export function getCraftStorageKeyForSession(experienceId: string | null | undefined): string {
  return experienceId ? craftStorageKeyForExperience(experienceId) : STORYBOARD_CRAFTING_STORAGE_KEY;
}

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
  /** When true, crafting UI treats the section as read-only until unlocked */
  locked?: boolean;
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
  { id: "thinking-analytical", pillar: "Power of Thinking", title: "Analytical Thinking" },
  { id: "thinking-prioritization", pillar: "Power of Thinking", title: "Prioritization" },
  { id: "thinking-decision", pillar: "Power of Thinking", title: "Decision-Making Agility" },
  { id: "action-ownership", pillar: "Power of Action", title: "Ownership" },
  { id: "action-initiative", pillar: "Power of Action", title: "Initiative & Follow-through" },
  { id: "action-change", pillar: "Power of Action", title: "Embraces Change" },
  { id: "people-influence", pillar: "Power of People", title: "Influence" },
  { id: "people-collaboration", pillar: "Power of People", title: "Collaboration & Inclusion" },
  { id: "people-capability", pillar: "Power of People", title: "Grows Capability" },
  { id: "mastery-functional", pillar: "Power of Mastery", title: "Functional Knowledge" },
  { id: "mastery-execution", pillar: "Power of Mastery", title: "Execution" },
  { id: "mastery-innovation", pillar: "Power of Mastery", title: "Innovation" },
];

export type StorySeedContext = {
  /** Primary framing for the storyboard (the "role") */
  roleTitle?: string;
  /**
   * Optional: a single experience label (legacy / per-experience seed).
   * Kept for backward compatibility with older routes and saved data.
   */
  experienceLabel?: string;
  /** Optional: all experience labels for the role; preferred for role-based story framing. */
  experienceLabels?: string[];
};

function seedIntroCar(ctx?: StorySeedContext): CarBlock {
  const role = ctx?.roleTitle?.trim() || "";
  const all = (ctx?.experienceLabels ?? []).map((x) => x.trim()).filter(Boolean);
  const single = ctx?.experienceLabel?.trim() || "";

  const experienceLines =
    all.length > 0
      ? `\n\nUse these experiences as evidence (do not list them verbatim, just weave them naturally):\n- ${all.join("\n- ")}`
      : single
        ? `\n\nUse this experience as evidence (do not list it verbatim, just weave it naturally):\n- ${single}`
        : "";

  const context = role
    ? `Write one short paragraph introducing you as a "${role}": your scope, how you operate, and what kinds of outcomes you drive. Make it interview-ready (confident, specific, no fluff).${experienceLines}`
    : `Write one short paragraph: your role, scope, and a line that previews the competency stories you will cover in this storyboard.${experienceLines}`;

  return { context, action: "", result: "" };
}

function seedCar(title: string): CarBlock {
  return {
    context: `Set the scene for "${title}": situation, constraints, and stakes in 2–3 sentences.`,
    action: `Describe what you personally did—decisions, steps, and how you drove progress.`,
    result: `State measurable or qualitative outcomes, learning, and what changed for the business or team.`,
  };
}

export function buildInitialSections(journeyLabel?: string): CraftSection[] {
  // Back-compat: existing callers pass a single experience label. Prefer the new
  // object signature when available.
  const ctx: StorySeedContext | undefined =
    typeof journeyLabel === "string" ? { experienceLabel: journeyLabel } : undefined;

  return SECTION_DEFS.map((d) => ({
    ...d,
    car: isIntroSection(d.id) ? seedIntroCar(ctx) : seedCar(d.title),
    history: [],
    prompt: "",
    regenerationsUsed: 0,
    locked: false,
  }));
}

/** Preferred initializer for role-based storyboards (can include multiple experiences). */
export function buildInitialSectionsForRole(ctx?: StorySeedContext): CraftSection[] {
  return SECTION_DEFS.map((d) => ({
    ...d,
    car: isIntroSection(d.id) ? seedIntroCar(ctx) : seedCar(d.title),
    history: [],
    prompt: "",
    regenerationsUsed: 0,
    locked: false,
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

/** Pillar order for score UI — matches non-intro rows in SECTION_DEFS. */
export const CRAFT_PILLAR_ORDER: readonly string[] = SECTION_DEFS.filter((d) => !isIntroSection(d.id)).reduce<
  string[]
>((acc, d) => {
  if (!acc.includes(d.pillar)) acc.push(d.pillar);
  return acc;
}, []);

/** Mean mock strength across competency sections (excludes Core Introduction). */
export function averageMockStoryStrength(sections: CraftSection[]): number {
  const nonIntro = sections.filter((s) => !isIntroSection(s.id));
  if (nonIntro.length === 0) return 0;
  const sum = nonIntro.reduce((acc, s) => acc + mockStoryScore(s.id), 0);
  return Math.round((sum / nonIntro.length) * 10) / 10;
}

/** One row per pillar: mean of the three competency section scores (mock). */
export function pillarMockScoreBreakdown(sections: CraftSection[]): { pillar: string; score: number }[] {
  const byPillar = new Map<string, number[]>();
  for (const s of sections) {
    if (isIntroSection(s.id)) continue;
    const list = byPillar.get(s.pillar) ?? [];
    list.push(mockStoryScore(s.id));
    byPillar.set(s.pillar, list);
  }
  return CRAFT_PILLAR_ORDER.map((pillar) => {
    const scores = byPillar.get(pillar) ?? [];
    const raw = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { pillar, score: Math.round(raw * 10) / 10 };
  });
}

export const PROOFY_LOW_SCORE_MESSAGE =
  "Proofy suggests adding a more impactful story that showcases your decision-making power, clear ownership, and measurable outcomes.";

function normalizeSectionRow(s: CraftSection): CraftSection {
  const base: CraftSection = {
    ...s,
    history: Array.isArray(s.history) ? s.history : [],
    regenerationsUsed: typeof s.regenerationsUsed === "number" ? s.regenerationsUsed : 0,
    prompt: typeof s.prompt === "string" ? s.prompt : "",
    locked: s.locked === true,
  };
  if (!isIntroSection(s.id) || !s.car) return base;
  return {
    ...base,
    car: normalizeIntroBlock(s.car),
    history: base.history.map((h) => normalizeIntroBlock(h)),
  };
}

/** Returns null if missing or invalid shape. */
export function hydrateCraftSectionsFromLocalStorage(storageKey?: string): CraftSection[] | null {
  if (typeof window === "undefined") return null;
  const key = storageKey ?? STORYBOARD_CRAFTING_STORAGE_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CraftSection[];
    if (!Array.isArray(parsed) || parsed.length !== SECTION_DEFS.length) return null;
    return parsed.map((s) => normalizeSectionRow(s));
  } catch {
    return null;
  }
}

/** Hub / library UI — derived from scoped craft JSON in localStorage (client-only). */
export type ExperienceCraftUiStatus = "ready_to_craft" | "drafted" | "ready_to_practice";

const CRAFT_COMPLETE_MIN_CHARS = 40;

/** Set when the user saves from crafting — hub treats the story as created (mind map) even if CAR fields are under the draft threshold. */
const CRAFT_SAVED_MARKER_PREFIX = "proofdive_craft_saved";

export function craftSavedMarkerKeyForExperience(experienceId: string): string {
  return `${CRAFT_SAVED_MARKER_PREFIX}:${experienceId}`;
}

export function markExperienceCraftSaved(experienceId: string): void {
  if (typeof window === "undefined" || !experienceId) return;
  try {
    window.localStorage.setItem(craftSavedMarkerKeyForExperience(experienceId), String(Date.now()));
  } catch {
    /* ignore */
  }
}

function hasExperienceCraftSaved(experienceId: string): boolean {
  if (typeof window === "undefined" || !experienceId) return false;
  try {
    return Boolean(window.localStorage.getItem(craftSavedMarkerKeyForExperience(experienceId))?.trim());
  } catch {
    return false;
  }
}

export function readExperienceCraftUiStatus(experienceId: string): ExperienceCraftUiStatus {
  if (typeof window === "undefined" || !experienceId) return "ready_to_craft";
  const key = craftStorageKeyForExperience(experienceId);
  const raw = window.localStorage.getItem(key);
  if (!raw?.trim()) return "ready_to_craft";
  const sections = hydrateCraftSectionsFromLocalStorage(key);
  if (!sections) return "drafted";
  const nonIntro = sections.filter((s) => !isIntroSection(s.id));
  if (nonIntro.length === 0) return "drafted";
  if (hasExperienceCraftSaved(experienceId)) return "ready_to_practice";
  const allComplete = nonIntro.every(
    (s) =>
      s.car.context.trim().length >= CRAFT_COMPLETE_MIN_CHARS &&
      s.car.action.trim().length >= CRAFT_COMPLETE_MIN_CHARS &&
      s.car.result.trim().length >= CRAFT_COMPLETE_MIN_CHARS
  );
  return allComplete ? "ready_to_practice" : "drafted";
}

/**
 * Hub badge for a role: draft work-in-progress wins, then any completed story, else ready to start.
 * Empty roles are treated as ready_to_craft (no experiences yet).
 */
export function readRoleCraftUiStatus(role: { experiences: { id: string }[] }): ExperienceCraftUiStatus {
  if (role.experiences.length === 0) return "ready_to_craft";
  const statuses = role.experiences.map((e) => readExperienceCraftUiStatus(e.id));
  if (statuses.some((s) => s === "drafted")) return "drafted";
  if (statuses.some((s) => s === "ready_to_practice")) return "ready_to_practice";
  return "ready_to_craft";
}

export function craftStatusLabel(status: ExperienceCraftUiStatus): string {
  switch (status) {
    case "ready_to_craft":
      return "Ready to craft";
    case "drafted":
      return "Drafted";
    case "ready_to_practice":
      return "Ready to practice";
  }
}

export function craftCtaLabel(status: ExperienceCraftUiStatus): string {
  switch (status) {
    case "ready_to_craft":
      return "Craft story";
    case "drafted":
      return "Continue crafting";
    case "ready_to_practice":
      return "View story";
  }
}

/** Primary navigation for a journey from the storyboard hub. */
export function craftActionHref(experienceId: string, roleTitle: string, status: ExperienceCraftUiStatus): string {
  const roleQ = encodeURIComponent(roleTitle.trim() || "My role");
  const idQ = encodeURIComponent(experienceId);
  if (status === "ready_to_practice") return `/storyboard/${experienceId}`;
  if (status === "drafted") return `/storyboard/crafting?experienceId=${idQ}`;
  // New flow: collect/enrich experiences via the Storyboard Agent first.
  // We still carry role in the URL so the agent can align to the user’s selection.
  return `/storyboard/agent?role=${roleQ}`;
}

function sortExperiencesByCreatedAsc<T extends { createdAt: number }>(experiences: T[]): T[] {
  return [...experiences].sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Pick the experience whose craft state should drive the role-level primary CTA (matches aggregated badge).
 */
export function resolveRoleCraftAction(
  role: { experiences: { id: string; createdAt: number }[] },
  roleTitle: string
): { experienceId: string; status: ExperienceCraftUiStatus; href: string } | null {
  if (role.experiences.length === 0) return null;
  const sorted = sortExperiencesByCreatedAsc(role.experiences);
  const agg = readRoleCraftUiStatus(role);
  let target = sorted[0]!;
  if (agg === "drafted") {
    target = sorted.find((e) => readExperienceCraftUiStatus(e.id) === "drafted") ?? sorted[0];
  } else if (agg === "ready_to_practice") {
    target = sorted.find((e) => readExperienceCraftUiStatus(e.id) === "ready_to_practice") ?? sorted[0];
  } else {
    target = sorted.find((e) => readExperienceCraftUiStatus(e.id) === "ready_to_craft") ?? sorted[0];
  }
  const st = readExperienceCraftUiStatus(target.id);
  return { experienceId: target.id, status: st, href: craftActionHref(target.id, roleTitle, st) };
}

/** Progress weight for a single journey (matches `roleCraftProgressPercent`). */
export function experienceCraftProgressPercent(experienceId: string): number {
  const s = readExperienceCraftUiStatus(experienceId);
  return s === "ready_to_practice" ? 100 : s === "drafted" ? 52 : 18;
}

/** Readiness on a 0–5 scale from craft progress (UI-only, until API-backed scores exist). */
export function journeyReadinessFromCraft(experienceId: string): number {
  const pct = experienceCraftProgressPercent(experienceId);
  return Math.min(5, Math.max(0, Math.round((pct / 100) * 5 * 10) / 10));
}

/** Hub “Story strength X.X/5” — use mock section scores when craft JSON exists; else progress-derived readiness. */
export function hubStoryStrengthFromCraft(experienceId: string): number {
  if (typeof window === "undefined" || !experienceId) return 0;
  const key = craftStorageKeyForExperience(experienceId);
  const sections = hydrateCraftSectionsFromLocalStorage(key);
  if (sections && sections.length > 0) {
    return averageMockStoryStrength(sections);
  }
  return journeyReadinessFromCraft(experienceId);
}

/** 0 experiences → 10% placeholder; otherwise average of per-journey progress weights. */
export function roleCraftProgressPercent(role: { experiences: { id: string }[] }): number {
  if (role.experiences.length === 0) return 10;
  let sum = 0;
  for (const e of role.experiences) {
    sum += experienceCraftProgressPercent(e.id);
  }
  return Math.max(10, Math.min(100, Math.round(sum / role.experiences.length)));
}

export function buildResumeExportText(sections: CraftSection[], storyboardId: string): string {
  const lines: string[] = [
    `ProofDive story export`,
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
