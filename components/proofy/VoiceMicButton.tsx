"use client";

import { Mic } from "lucide-react";

const TEAL = "#0087A8";

export function VoiceMicButton({
  isListening,
  disabled,
  onClick,
  label = "Speak your choice",
}: {
  isListening: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all border ${
        isListening
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-white/70 text-[#0F172A] border-white/80 hover:bg-white shadow-sm"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isListening ? (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          Listening… tap to stop
        </>
      ) : (
        <>
          <Mic size={16} style={{ color: TEAL }} />
          {label}
        </>
      )}
    </button>
  );
}
