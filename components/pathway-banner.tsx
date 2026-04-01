"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

interface PathwayBannerProps {
  label: string;
  title: string;
  steps: string[];
  footerText: string;
  buttonText: string;
  buttonHref: string;
}

export function PathwayBanner({
  label,
  title,
  steps,
  footerText,
  buttonText,
  buttonHref,
}: PathwayBannerProps) {
  // Deep teal matching Figma V2.1
  const BG = "linear-gradient(135deg, #004F5E 0%, #003F4B 100%)";

  return (
    <div 
      className="relative w-full rounded-[24px] p-8 md:p-10 overflow-hidden flex flex-col gap-8 shadow-xl shadow-teal-950/20 group border border-white/5"
      style={{ background: BG }}
    >
      {/* Subtle glass glow */}
      <div className="absolute right-[-5%] top-[-10%] w-[35%] h-[110%] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-3">
        <p className="text-[13px] md:text-[14px] text-white/50 font-medium tracking-tight">
          {label}
        </p>
        <h2 className="text-[24px] md:text-[28px] font-semibold text-white leading-tight tracking-tight max-w-4xl">
          {title}
        </h2>
      </div>

      <div className="relative z-10 flex items-center gap-4 flex-wrap">
        {steps.map((step, idx) => (
          <div key={step} className="flex items-center gap-4">
            <div className="px-6 py-2 rounded-full bg-white shadow-lg border border-white/20 transition-transform cursor-default">
              <span className="text-[14px] font-bold text-[#004F5E] whitespace-nowrap">
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight size={14} className="text-white/20 shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 pt-8 border-t border-white/[0.08] mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center p-0.5">
            <CheckCircle size={12} className="text-white/60" />
          </div>
          <p className="text-[14px] text-white/80 font-medium tracking-tight">
            {footerText}
          </p>
        </div>
        
        <Link 
          href={buttonHref} 
          className="flex items-center gap-2 text-[14px] text-white font-bold transition-all hover:opacity-80 active:scale-95 group"
        >
          {buttonText}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
