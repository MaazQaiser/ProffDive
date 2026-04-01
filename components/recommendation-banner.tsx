"use client";

import Link from "next/link";
import { type LucideIcon, Play } from "lucide-react";
import { PathwayCardSurface } from "@/components/pathway-banner";

interface RecommendationBannerProps {
  label: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  buttonIcon?: LucideIcon;
  statusColor?: string; // Hex for the status dot
  variant?: "primary" | "deep"; // different visual treatments if needed
}

export function RecommendationBanner({
  label,
  title,
  description,
  buttonText,
  buttonHref,
  buttonIcon: ButtonIcon = Play,
  statusColor = "#34D399", // Default to green
}: RecommendationBannerProps) {
  return (
    <PathwayCardSurface className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span
                className="flex h-2 w-2 rounded-full shadow-sm"
                style={{
                  background: statusColor,
                  boxShadow: `0 0 0 4px ${statusColor}33`,
                }}
              />
              <p className="text-[12px] uppercase tracking-[0.16em] font-semibold text-[#044859]/80">
                {label}
              </p>
            </div>
            <h2 className="text-[24px] font-semibold leading-tight text-[#044757] tracking-tight mb-3">
              {title}
            </h2>
            <p className="text-[14px] text-[#334155] leading-relaxed max-w-md">
              {description}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-5">
          <Link
            href={buttonHref}
            className="relative w-full md:w-[220px] aspect-video rounded-[10px] overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#00303b]/12"
          >
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop"
              alt="Training Thumbnail"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#0F172A]/25 group-hover:bg-[#0F172A]/12 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-[21px] flex items-center justify-center border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.08)] group-hover:bg-white transition-colors">
                <Play size={16} fill="#0087A8" className="text-[#0087A8] ml-0.5" />
              </div>
            </div>
          </Link>

          <Link
            href={buttonHref}
            className="relative h-[44px] px-6 rounded-lg flex items-center justify-center overflow-hidden text-[13px] font-semibold text-[#0087A8] gap-2 mt-auto self-end w-full sm:w-auto shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0087A8]"
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-[inherit] bg-white/90 backdrop-blur-[21px]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]"
            />
            <ButtonIcon size={14} className="relative fill-[#0087A8]" />
            <span className="relative">{buttonText}</span>
          </Link>
        </div>
      </div>
    </PathwayCardSurface>
  );
}
