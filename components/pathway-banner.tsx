"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PathwayBannerProps {
  label: string;
  title: string;
  steps: string[];
  footerText: string;
  buttonText: string;
  buttonHref: string;
}

/** Shared surface: radial teal wash, blur, soft outer + inset shadows (Pathway banner style). */
export function PathwayCardSurface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] ${className}`}
    >
      <div aria-hidden className="absolute inset-0 rounded-[inherit] pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.6]"
          style={{
            background:
              "radial-gradient(ellipse at 8% 5%, rgba(0, 116, 145, 0.1) 0%, rgba(255, 255, 255, 1) 42%, rgba(0, 116, 145, 0.2) 78%, rgba(0, 116, 145, 0.1) 100%)",
          }}
        />
        <div className="absolute inset-0 backdrop-blur-[21px]" />
        <div className="absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]" />
      </div>

      <div className="relative z-10">{children}</div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]"
      />
    </div>
  );
}

/** Guided-path banner — matches Figma Inshphere SaaS V2 (node 845:7217). */
export function PathwayBanner({
  label,
  title,
  steps,
  footerText,
  buttonText,
  buttonHref,
}: PathwayBannerProps) {
  return (
    <PathwayCardSurface className="px-8 py-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[18px] font-normal leading-normal text-[#044859]">
              {label}
            </p>
            <p className="text-[20px] font-semibold leading-tight text-[#044757] text-balance">
              {title}
            </p>
          </div>

          <Link
            href={buttonHref}
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-normal text-[#334155] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0087A8] sm:pt-1"
          >
            {buttonText}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {steps.map((step, idx) => (
            <div key={step} className="flex h-7 items-center justify-start gap-1.5">
              <div className="relative flex h-7 items-center rounded-full px-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-white/90 backdrop-blur-[21px]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)] pointer-events-none"
                />
                <span className="relative inline-flex h-7 items-center text-[14px] font-medium leading-none text-[#00303b] whitespace-nowrap">
                  {step}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight
                  className="relative size-4 shrink-0 text-[#00303b]/45"
                  aria-hidden
                  strokeWidth={2}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </PathwayCardSurface>
  );
}
