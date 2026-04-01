"use client";

import Link from "next/link";
import { type LucideIcon, Play } from "lucide-react";

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
  // Unified "Premium" Gradient from Trainings page
  const GRAD = "linear-gradient(145deg, #1C3B4A 0%, #2D5668 55%, #1E4456 100%)";

  return (
    <div 
      style={{ background: GRAD, borderRadius: 16 }} 
      className="p-6 md:p-8 border border-white/10 relative overflow-hidden shadow-xl shadow-teal-900/5"
    >
      {/* Decorative Glow */}
      <div className="absolute right-[-5%] top-[-10%] w-[40%] h-[120%] bg-white/5 rounded-full blur-[80px]" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10">
        
        {/* Left Column - Text Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span 
                className="flex h-2 w-2 rounded-full shadow-sm" 
                style={{ 
                  background: statusColor, 
                  boxShadow: `0 0 0 4px ${statusColor}33`
                }} 
              />
              <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#94A3B8]">
                {label}
              </p>
            </div>
            <h2 className="text-[22px] md:text-[24px] font-bold text-white tracking-tight leading-tight mb-3">
              {title}
            </h2>
            <p className="text-[14px] text-[#CBD5E1] leading-relaxed max-w-md">
              {description}
            </p>
          </div>
        </div>
        
        {/* Right Column - Thumbnail and Button */}
        <div className="shrink-0 flex flex-col items-end gap-5">
          {/* Thumbnail with overlay play button */}
          <Link href={buttonHref} className="relative w-full md:w-[220px] aspect-video rounded-[10px] overflow-hidden group shadow-lg border border-white/10">
            {/* Generic hardcoded unsplash image of a person presenting/training */}
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop" 
              alt="Training Thumbnail"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#0F172A]/30 group-hover:bg-[#0F172A]/10 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.2)] group-hover:bg-white/30 transition-colors">
                  <Play size={16} fill="white" className="text-white ml-0.5" />
               </div>
            </div>
          </Link>

          {/* Moved original text button strictly to bottom right */}
          <Link 
            href={buttonHref} 
            className="h-[44px] px-6 rounded-[8px] flex items-center justify-center bg-white text-[#0087A8] text-[13px] font-bold hover:bg-[#F8FAFC] transition-transform hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] gap-2 mt-auto self-end w-full sm:w-auto"
          >
            <ButtonIcon size={14} className="fill-[#0087A8]" />
            {buttonText}
          </Link>
        </div>

      </div>
    </div>
  );
}
