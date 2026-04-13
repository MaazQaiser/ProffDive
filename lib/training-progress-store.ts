export type TrainingProgressRecord = {
  slug: string;
  completedMilestones: string[];
  updatedAt: string; // ISO
};

const KEY = "proofdive_training_progress_v1";

function safeParse(raw: string | null): TrainingProgressRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as TrainingProgressRecord[];
  } catch {
    return [];
  }
}

export function readTrainingProgress(): TrainingProgressRecord[] {
  try {
    return safeParse(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

export function writeTrainingProgress(rows: TrainingProgressRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export function seedTrainingProgressLight(nowIso: string) {
  writeTrainingProgress([
    {
      slug: "interview-essentials",
      completedMilestones: ["basics"],
      updatedAt: nowIso,
    },
  ]);
}

