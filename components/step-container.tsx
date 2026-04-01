"use client";

import type { ReactNode } from "react";

export function StepContainer({
  isActive,
  children,
  onClick,
}: {
  isActive: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={!isActive ? onClick : undefined}
      className={`w-full transition-all duration-300 ${
        isActive
          ? "bg-white/70 backdrop-blur-[21px] rounded-[16px] border border-white/60 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
          : "bg-white/40 backdrop-blur-[21px] rounded-[12px] border border-white/30 px-5 py-4 cursor-pointer hover:bg-white/50"
      }`}
    >
      {children}
    </div>
  );
}
