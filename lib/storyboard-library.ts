/**
 * Client-side library: roles → experiences → each experience has its own craft payload key.
 */

import {
  STORYBOARD_CRAFTING_STORAGE_KEY,
  craftStorageKeyForExperience,
} from "@/lib/storyboard-crafting";

export const STORYBOARD_LIBRARY_STORAGE_KEY = "proofdive_storyboard_library_v1";

export type StoryExperience = {
  id: string;
  label: string;
  createdAt: number;
};

export type StoryRole = {
  id: string;
  title: string;
  experiences: StoryExperience[];
  createdAt: number;
};

export type StoryboardLibrary = {
  version: 1;
  roles: StoryRole[];
};

export function generateStoryboardId(): string {
  return `pd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function defaultLibrary(): StoryboardLibrary {
  return { version: 1, roles: [] };
}

function parseLibrary(raw: string | null): StoryboardLibrary {
  if (!raw) return defaultLibrary();
  try {
    const p = JSON.parse(raw) as Partial<StoryboardLibrary>;
    if (!p || p.version !== 1 || !Array.isArray(p.roles)) return defaultLibrary();
    return { version: 1, roles: p.roles.filter(Boolean) as StoryRole[] };
  } catch {
    return defaultLibrary();
  }
}

/** Copy legacy global craft blob into a scoped key when the library was empty. */
function migrateLegacyCraftIntoLibrary(lib: StoryboardLibrary, roleTitleFallback: string): StoryboardLibrary {
  if (lib.roles.length > 0) return lib;
  if (typeof window === "undefined") return lib;
  try {
    const legacy = window.localStorage.getItem(STORYBOARD_CRAFTING_STORAGE_KEY);
    if (!legacy?.trim()) return lib;
    const roleId = generateStoryboardId();
    const expId = generateStoryboardId();
    const now = Date.now();
    const next: StoryboardLibrary = {
      version: 1,
      roles: [
        {
          id: roleId,
          title: roleTitleFallback.trim() || "My role",
          createdAt: now,
          experiences: [{ id: expId, label: "My journey", createdAt: now }],
        },
      ],
    };
    window.localStorage.setItem(STORYBOARD_LIBRARY_STORAGE_KEY, JSON.stringify(next));
    const scoped = craftStorageKeyForExperience(expId);
    if (!window.localStorage.getItem(scoped)) {
      window.localStorage.setItem(scoped, legacy);
    }
    return next;
  } catch {
    return lib;
  }
}

export function readLibrary(): StoryboardLibrary {
  if (typeof window === "undefined") return defaultLibrary();
  try {
    const raw = window.localStorage.getItem(STORYBOARD_LIBRARY_STORAGE_KEY);
    return parseLibrary(raw);
  } catch {
    return defaultLibrary();
  }
}

function ensureOnboardingDefaultRole(lib: StoryboardLibrary, roleTitle: string): StoryboardLibrary {
  if (lib.roles.length > 0) return lib;
  const t = roleTitle.trim();
  if (!t) return lib;
  if (typeof window === "undefined") return lib;
  const now = Date.now();
  const next: StoryboardLibrary = {
    version: 1,
    roles: [{ id: generateStoryboardId(), title: t, experiences: [], createdAt: now }],
  };
  writeLibrary(next);
  return next;
}

export function readLibraryWithMigration(roleTitleFallback: string): StoryboardLibrary {
  const base = readLibrary();
  const migrated = migrateLegacyCraftIntoLibrary(base, roleTitleFallback);
  if (migrated !== base) return migrated;
  return ensureOnboardingDefaultRole(migrated, roleTitleFallback);
}

export function writeLibrary(lib: StoryboardLibrary): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORYBOARD_LIBRARY_STORAGE_KEY, JSON.stringify(lib));
  } catch {
    /* ignore */
  }
}

export function addRoleWithExperiences(
  title: string,
  experienceLabels: string[]
): { library: StoryboardLibrary; roleId: string; firstExperienceId: string } {
  const lib = readLibrary();
  const now = Date.now();
  const roleId = generateStoryboardId();
  const experiences: StoryExperience[] = experienceLabels.map((label) => ({
    id: generateStoryboardId(),
    label: label.trim(),
    createdAt: now,
  }));
  const next: StoryboardLibrary = {
    version: 1,
    roles: [...lib.roles, { id: roleId, title: title.trim(), experiences, createdAt: now }],
  };
  writeLibrary(next);
  return { library: next, roleId, firstExperienceId: experiences[0]?.id ?? "" };
}

export function addExperienceToRole(roleId: string, label: string): StoryExperience | null {
  const lib = readLibrary();
  const role = lib.roles.find((r) => r.id === roleId);
  if (!role) return null;
  const now = Date.now();
  const exp: StoryExperience = { id: generateStoryboardId(), label: label.trim(), createdAt: now };
  const next: StoryboardLibrary = {
    version: 1,
    roles: lib.roles.map((r) => (r.id === roleId ? { ...r, experiences: [...r.experiences, exp] } : r)),
  };
  writeLibrary(next);
  return exp;
}

export function findExperienceContext(
  experienceId: string
): { roleTitle: string; experienceLabel: string; roleId: string } | null {
  const lib = readLibrary();
  for (const r of lib.roles) {
    const e = r.experiences.find((x) => x.id === experienceId);
    if (e) return { roleTitle: r.title, experienceLabel: e.label, roleId: r.id };
  }
  return null;
}

/** Read/write key for craft JSON: library experiences use scoped keys; legacy `/storyboard/1` uses global key. */
export function resolveCraftStorageKeyForExperienceId(experienceId: string | null): string {
  if (!experienceId) return STORYBOARD_CRAFTING_STORAGE_KEY;
  if (findExperienceContext(experienceId)) return craftStorageKeyForExperience(experienceId);
  if (experienceId === "1") return STORYBOARD_CRAFTING_STORAGE_KEY;
  return craftStorageKeyForExperience(experienceId);
}
