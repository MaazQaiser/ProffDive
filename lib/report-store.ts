export type ReportRecord = {
  id: string;
  sessionId?: string;
  title: string;
  role: string;
  createdAt: string; // ISO
};

const KEY = "proofdive_reports_v1";

function safeParse(raw: string | null): ReportRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ReportRecord[];
  } catch {
    return [];
  }
}

export function readReports(): ReportRecord[] {
  try {
    return safeParse(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

export function writeReports(reports: ReportRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(reports));
  } catch {
    /* ignore */
  }
}

export function seedReportsLight(nowIso: string) {
  writeReports([
    {
      id: "rep_demo_001",
      sessionId: "sess_demo_001",
      title: "Mock interview — Product Manager",
      role: "Product Manager",
      createdAt: nowIso,
    },
  ]);
}

