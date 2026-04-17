"use client";

import { useEffect, useState } from "react";
import { SUPERADMIN_SESSION_STORAGE_KEY } from "@/lib/superadmin/admin-session-key";

/**
 * Optional client-side session flag (in addition to middleware env gate).
 * Set session by running in console: sessionStorage.setItem(SUPERADMIN_SESSION_STORAGE_KEY, "1")
 * Only enforced when NEXT_PUBLIC_SUPERADMIN_REQUIRE_CLIENT_SESSION === "true".
 */
export function SuperAdminGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      if (process.env.NEXT_PUBLIC_SUPERADMIN_REQUIRE_CLIENT_SESSION !== "true") {
        setOk(true);
        return;
      }
      setOk(sessionStorage.getItem(SUPERADMIN_SESSION_STORAGE_KEY) === "1");
    });
  }, []);

  if (ok === null) {
    return <p className="p-6 text-sm text-[var(--text-2)]">Checking session…</p>;
  }

  if (!ok) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-[var(--text-2)]">Super Admin session required.</p>
        <button
          type="button"
          className="rounded-[var(--r-button)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
          onClick={() => {
            sessionStorage.setItem(SUPERADMIN_SESSION_STORAGE_KEY, "1");
            setOk(true);
          }}
        >
          Unlock (demo)
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
