export type SessionType = "mock-interview";

export type SessionRecord = {
  id: string;
  type: SessionType;
  role: string;
  createdAt: string; // ISO
  durationMin: number;
  status: "completed" | "in_progress";
};

const KEY = "proofdive_sessions_v1";

function safeParse(raw: string | null): SessionRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as SessionRecord[];
  } catch {
    return [];
  }
}

export function readSessions(): SessionRecord[] {
  try {
    return safeParse(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

export function writeSessions(sessions: SessionRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    /* ignore */
  }
}

export function seedSessionsLight(nowIso: string) {
  writeSessions([
    {
      id: "sess_demo_001",
      type: "mock-interview",
      role: "Product Manager",
      createdAt: nowIso,
      durationMin: 18,
      status: "completed",
    },
  ]);
}

