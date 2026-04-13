export type DemoPreset = "first" | "returning-light";

import { seedSessionsLight } from "@/lib/session-store";
import { seedReportsLight } from "@/lib/report-store";
import { seedTrainingProgressLight } from "@/lib/training-progress-store";

const LS_KEYS = {
  user: "proofdive_user",
  guidedJourney: "proofdive.guidedJourney.v1",
  storyboardCrafting: "proofdive_crafting_storyboard",
  demoPreset: "proofdive_demo_preset",
  loginMethod: "proofdive_login_method",
} as const;

function nowIso() {
  return new Date().toISOString();
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function resetDemoStorage() {
  safeRemove(LS_KEYS.user);
  safeRemove(LS_KEYS.guidedJourney);
  safeRemove(LS_KEYS.storyboardCrafting);
  safeRemove(LS_KEYS.demoPreset);
  safeRemove(LS_KEYS.loginMethod);
}

export function seedFirstTime() {
  resetDemoStorage();
  safeSet(LS_KEYS.demoPreset, { preset: "first", seededAt: nowIso() });
  // First-time users arrive via social login — stamp this for demo persona toggles.
  try { localStorage.setItem(LS_KEYS.loginMethod, "google"); } catch { /* ignore */ }
  // Ensure the guided journey is active and visible right away.
  safeSet(LS_KEYS.guidedJourney, {
    active: true,
    skipped: false,
    stepId: "training",
    completed: [],
    updatedAt: Date.now(),
  });
}

export function seedReturningLight() {
  resetDemoStorage();
  // Keep this intentionally light—just enough to feel real.
  const seededAt = nowIso();
  safeSet(LS_KEYS.user, {
    name: "Avery",
    career: "Mid-level",
    bracket: "3–5 years",
    educationBackground: "B.S. Computer Science",
    role: "Product Manager",
    industry: "B2B SaaS",
    jd: "Product Manager — B2B SaaS (Growth + Platform)\n\nLooking for someone who can drive discovery, partner with eng/design, and ship measurable improvements.",
    resume:
      "• Led roadmap and shipped onboarding improvements, increasing activation by 14%.\n• Partnered with engineering to reduce key workflow time by 22%.\n• Ran weekly customer interviews to shape product priorities.",
    onboarded: true,
    email: "avery@example.com",
    targetRole: "Product Manager",
    timezone: "America/Los_Angeles",
    createdAt: seededAt,
    lastActiveAt: seededAt,
  });

  // Seed minimal “history” so dashboards/reports feel lived-in.
  seedSessionsLight(seededAt);
  seedReportsLight(seededAt);
  seedTrainingProgressLight(seededAt);

  // Seeded “returning” demo user (richer local history); home route is still `/dashboard`.
  try { localStorage.setItem(LS_KEYS.loginMethod, "email"); } catch { /* ignore */ }
  safeSet(LS_KEYS.demoPreset, { preset: "returning-light", seededAt });
}

export function applyDemoPreset(preset: DemoPreset) {
  if (preset === "first") seedFirstTime();
  if (preset === "returning-light") seedReturningLight();
}

export function readDemoPreset(): DemoPreset | null {
  try {
    const raw = localStorage.getItem(LS_KEYS.demoPreset);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { preset?: DemoPreset };
    return parsed.preset ?? null;
  } catch {
    return null;
  }
}

