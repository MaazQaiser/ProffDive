/**
 * Local enrichment answers for storyboard experiences (client-side).
 *
 * Shape:
 * - roleId is optional metadata (helpful for debugging / cleanup)
 * - answers are per experience, per questionId (1..6)
 */
export const STORYBOARD_ENRICHMENT_STORAGE_KEY = "proofdive_storyboard_enrichment_v1";

export type EnrichmentQuestionId = 1 | 2 | 3 | 4 | 5 | 6;

export type EnrichmentAnswersByQuestion = Partial<Record<EnrichmentQuestionId, string>>;

export type StoryboardEnrichmentV1 = {
  version: 1;
  byExperienceId: Record<string, EnrichmentAnswersByQuestion>;
  metaByExperienceId?: Record<string, { roleId?: string; updatedAt: number }>;
};

function defaultState(): StoryboardEnrichmentV1 {
  return { version: 1, byExperienceId: {} };
}

function parseState(raw: string | null): StoryboardEnrichmentV1 {
  if (!raw?.trim()) return defaultState();
  try {
    const p = JSON.parse(raw) as Partial<StoryboardEnrichmentV1>;
    if (!p || p.version !== 1 || typeof p.byExperienceId !== "object" || !p.byExperienceId) return defaultState();
    return {
      version: 1,
      byExperienceId: (p.byExperienceId ?? {}) as Record<string, EnrichmentAnswersByQuestion>,
      metaByExperienceId: (p.metaByExperienceId ?? undefined) as StoryboardEnrichmentV1["metaByExperienceId"],
    };
  } catch {
    return defaultState();
  }
}

export function readStoryboardEnrichment(): StoryboardEnrichmentV1 {
  if (typeof window === "undefined") return defaultState();
  try {
    return parseState(window.localStorage.getItem(STORYBOARD_ENRICHMENT_STORAGE_KEY));
  } catch {
    return defaultState();
  }
}

export function writeStoryboardEnrichment(state: StoryboardEnrichmentV1): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORYBOARD_ENRICHMENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function readEnrichmentAnswers(experienceId: string): EnrichmentAnswersByQuestion {
  const st = readStoryboardEnrichment();
  return st.byExperienceId[experienceId] ?? {};
}

export function setEnrichmentAnswer(opts: {
  experienceId: string;
  questionId: EnrichmentQuestionId;
  answer: string;
  roleId?: string;
}): void {
  if (typeof window === "undefined") return;
  const { experienceId, questionId, answer, roleId } = opts;
  const now = Date.now();
  const st = readStoryboardEnrichment();
  const prev = st.byExperienceId[experienceId] ?? {};
  const next: StoryboardEnrichmentV1 = {
    version: 1,
    byExperienceId: {
      ...st.byExperienceId,
      [experienceId]: { ...prev, [questionId]: answer },
    },
    metaByExperienceId: {
      ...(st.metaByExperienceId ?? {}),
      [experienceId]: { roleId, updatedAt: now },
    },
  };
  writeStoryboardEnrichment(next);
}

export function countAnsweredQuestions(experienceId: string): number {
  const a = readEnrichmentAnswers(experienceId);
  const ids: EnrichmentQuestionId[] = [1, 2, 3, 4, 5, 6];
  let n = 0;
  for (const id of ids) {
    if ((a[id] ?? "").trim().length > 0) n += 1;
  }
  return n;
}

export function isExperienceEnriched(experienceId: string): boolean {
  return countAnsweredQuestions(experienceId) >= 6;
}

