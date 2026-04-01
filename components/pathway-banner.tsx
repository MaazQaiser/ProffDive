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
  const GRAD = "linear-gradient(103deg, #016E89 0%, #034657 100%)";

  return (
    <div 
      className="relative w-full rounded-[16px] p-5 md:p-6 overflow-hidden flex flex-col gap-4 shadow-xl shadow-[#024657]/10"
      style={{ background: GRAD }}
    >
      {/* Background decoration */}
      <div className="absolute right-[-10%] top-[-10%] w-[45%] h-[120%] bg-white/5 rounded-full blur-[90px]" />

      <div className="relative z-10 space-y-1.5">
        <p className="text-[13px] md:text-[14px] text-[#CBD5E1]/90 font-light">{label}</p>
        <h2 className="text-[20px] md:text-[22px] font-medium text-white leading-tight max-w-3xl">
          {title}
        </h2>
      </div>

      <div className="relative z-10 flex items-center gap-2 md:gap-3 flex-wrap">
        {steps.map((step, idx) => (
          <div key={step} className="flex items-center gap-2 md:gap-3">
            <div className="px-4 py-1 rounded-full bg-white/95 backdrop-blur-xl shadow-sm border border-white/20">
              <span className="text-[13px] font-semibold text-[#026178] whitespace-nowrap">{step}</span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight size={14} className="text-white/40 shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between pt-4 border-t border-white/10 mt-1 gap-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle size={15} className="text-white/70" />
          <p className="text-[12px] md:text-[13px] text-white/90 font-medium">{footerText}</p>
        </div>
        <Link href={buttonHref} className="flex items-center gap-1.5 text-[12px] md:text-[13px] text-white font-bold group hover:opacity-80 transition-opacity">
          {buttonText}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
