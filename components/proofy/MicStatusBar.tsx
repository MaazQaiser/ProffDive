"use client";

import { Mic } from "lucide-react";

const TEAL = "#0087A8";

/** Shows that the microphone is always on for this step (no tap to enable). */
export function MicStatusBar({ active, hint }: { active: boolean; hint?: string }) {
  if (!active) return null;
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-3 text-[13px] font-medium text-[#334155] shadow-md"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2">
        <Mic size={16} style={{ color: TEAL }} className="shrink-0" />
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>Mic on</span>
      </div>
      {hint ? <span className="text-[11px] text-slate-500 font-normal text-center max-w-[240px]">{hint}</span> : null}
    </div>
  );
}
