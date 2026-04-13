export type ResetTokenRecord = {
  token: string;
  email: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  usedAt?: string; // ISO
};

const KEY = "proofdive_reset_tokens_v1";

function safeParse(raw: string | null): ResetTokenRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ResetTokenRecord[];
  } catch {
    return [];
  }
}

export function readResetTokens(): ResetTokenRecord[] {
  try {
    return safeParse(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

export function writeResetTokens(tokens: ResetTokenRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tokens));
  } catch {
    /* ignore */
  }
}

function randomToken() {
  // readable-ish token for demo URLs
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function requestPasswordReset(email: string) {
  const now = new Date();
  const token = randomToken();
  const record: ResetTokenRecord = {
    token,
    email,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 min
  };
  const existing = readResetTokens();
  writeResetTokens([record, ...existing].slice(0, 10));
  return record;
}

export function validateResetToken(token: string): ResetTokenRecord | null {
  const all = readResetTokens();
  const rec = all.find((t) => t.token === token);
  if (!rec) return null;
  if (rec.usedAt) return null;
  if (new Date(rec.expiresAt).getTime() < Date.now()) return null;
  return rec;
}

export function consumeResetToken(token: string) {
  const all = readResetTokens();
  const next = all.map((t) => (t.token === token ? { ...t, usedAt: new Date().toISOString() } : t));
  writeResetTokens(next);
}

