"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Urbanist } from "next/font/google";
import { ArrowLeft, ArrowRight, Brain, Clock, Target, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const glassPanel =
  "relative overflow-hidden border-[0.5px] border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

const glassCard = `${glassPanel} rounded-[24px]`;
const glassCardMd = `${glassPanel} rounded-[16px]`;

const cardInset =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]";

type DriverId = "think" | "act" | "people" | "mastery";

const DRIVER_START_SLUG: Record<DriverId, string> = {
  think: "handling-ambiguity",
  act: "behavioral-car-method",
  people: "stakeholder-communication",
  mastery: "success-drivers-deep-dive",
};

const DRIVER_META: Record<
  DriverId,
  {
    idx: number;
    breadcrumb: string;
    eyebrow: string;
    title: string;
    definition: string;
    badgeBg: string;
    badgeText: string;
    courses: Array<{
      badge: string;
      title: string;
      outcome: string;
      duration: string;
      active?: boolean;
    }>;
  }
> = {
  think: {
    idx: 1,
    breadcrumb: "How you think",
    eyebrow: "Pillar 1 of 4 · Power of Thinking",
    title: "How you think",
    definition:
      "Interviewers are always watching how you break down problems, structure your reasoning and make decisions under pressure — even when the question doesn't sound like a thinking question.",
    badgeBg: "#E6F1FB",
    badgeText: "#0C447C",
    courses: [
      {
        badge: "Analytical thinking",
        title: "Breaking down any problem — the CAR way",
        outcome:
          "After this you'll know how to structure any answer so your reasoning is clear, traceable, and impossible to argue with.",
        duration: "~12 min",
        active: true,
      },
      {
        badge: "Strategic thinking",
        title: "How to think ahead — spotting second-order effects",
        outcome:
          "After this you'll be able to show interviewers you think beyond the obvious — which is exactly what separates strong candidates.",
        duration: "~10 min",
      },
      {
        badge: "Creative thinking",
        title: "Finding the angle no one else sees",
        outcome:
          "After this you'll know how to reframe a question in a way that makes your answer memorable — not just correct.",
        duration: "~9 min",
      },
    ],
  },
  act: {
    idx: 2,
    breadcrumb: "How you act",
    eyebrow: "Pillar 2 of 4 · Power of Action",
    title: "How you act",
    definition:
      "Interviewers watch how you move from intention to outcome: how you take initiative, keep momentum under pressure, and deliver real results — not just activity.",
    badgeBg: "#E1F5EE",
    badgeText: "#085041",
    courses: [
      {
        badge: "Drive & initiative",
        title: "Starting without permission — creating momentum",
        outcome:
          "After this you'll know how to show ownership and initiative without sounding reckless — the exact signal interviewers reward.",
        duration: "~11 min",
        active: true,
      },
      {
        badge: "Resilience",
        title: "Staying sharp under pressure and setbacks",
        outcome:
          "After this you'll be able to describe setbacks in a way that highlights composure, learning, and forward progress.",
        duration: "~10 min",
      },
      {
        badge: "Delivery",
        title: "Turning effort into outcomes interviewers believe",
        outcome:
          "After this you'll know how to present execution with clarity — scope, trade-offs, and results — so it feels undeniable.",
        duration: "~9 min",
      },
    ],
  },
  people: {
    idx: 3,
    breadcrumb: "How you work with people",
    eyebrow: "Pillar 3 of 4 · Power of People",
    title: "How you work with people",
    definition:
      "Interviewers look for how you influence outcomes through others: communication, empathy, and leadership — especially when alignment is hard.",
    badgeBg: "#FBEAF0",
    badgeText: "#72243E",
    courses: [
      {
        badge: "Influence",
        title: "Getting buy‑in without authority",
        outcome:
          "After this you'll know how to explain persuasion and alignment in a way that signals trust, clarity, and impact.",
        duration: "~11 min",
        active: true,
      },
      {
        badge: "Empathy",
        title: "Reading the room — and adapting in real time",
        outcome:
          "After this you'll be able to show empathy as a performance skill: sharper decisions, better collaboration, fewer rework loops.",
        duration: "~10 min",
      },
      {
        badge: "Leadership",
        title: "Leading without the title",
        outcome:
          "After this you'll know how to frame leadership as lifting team performance — not just managing people.",
        duration: "~9 min",
      },
    ],
  },
  mastery: {
    idx: 4,
    breadcrumb: "How you master your craft",
    eyebrow: "Pillar 4 of 4 · Power of Mastery",
    title: "How you master your craft",
    definition:
      "Interviewers evaluate whether you have depth: technical fluency, quality standards, and learning agility — the signals that you’ll grow fast once hired.",
    badgeBg: "#FAEEDA",
    badgeText: "#633806",
    courses: [
      {
        badge: "Technical expertise",
        title: "Showing depth without drowning in details",
        outcome:
          "After this you'll know how to explain expertise with precision and clarity — without rambling or over-technical jargon.",
        duration: "~11 min",
        active: true,
      },
      {
        badge: "Craft & quality",
        title: "Your bar — how great work actually gets shipped",
        outcome:
          "After this you'll be able to describe quality as a system: decisions, trade-offs, and standards that lead to reliable outcomes.",
        duration: "~10 min",
      },
      {
        badge: "Learning agility",
        title: "Learning fast — and applying it under constraints",
        outcome:
          "After this you'll know how to frame learning as speed-to-impact — not just curiosity.",
        duration: "~9 min",
      },
    ],
  },
};

const DRIVER_ICONS: Record<DriverId, LucideIcon> = {
  think: Brain,
  act: Zap,
  people: Users,
  mastery: Target,
};

function driverPillColors(driver: DriverId) {
  switch (driver) {
    case "think":
      return { bg: "#E6F1FB", text: "#0C447C" };
    case "act":
      return { bg: "#E1F5EE", text: "#085041" };
    case "people":
      return { bg: "#FBEAF0", text: "#72243E" };
    case "mastery":
      return { bg: "#FAEEDA", text: "#633806" };
  }
}

function normalizeDriver(raw: string | undefined): DriverId {
  const s = (raw ?? "think").toLowerCase();
  if (s === "think" || s === "act" || s === "people" || s === "mastery") return s;
  return "think";
}

export default function DriverCoursesPage() {
  const params = useParams<{ driver?: string }>();
  const driver = normalizeDriver(params?.driver);
  const meta = DRIVER_META[driver];
  const tagColors = driverPillColors(driver);
  const PillarIcon = DRIVER_ICONS[driver];
  const startCourseHref = `/trainings/${DRIVER_START_SLUG[driver]}`;

  const courseThumbs: Record<DriverId, string[]> = {
    think: [
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=800&auto=format&fit=crop",
    ],
    act: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
    ],
    people: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975693416-35a98f1f6a8b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    ],
    mastery: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    ],
  };

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-x-hidden`}>
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6">
        <div
          className="pointer-events-none invisible absolute left-[-251px] top-[66px] z-[1] h-[1127px] w-[1127px] opacity-45"
          aria-hidden
        >
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        <div className="relative z-[1] space-y-8 pb-16 md:space-y-10">
          <Link
            href="/trainings"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Trainings
          </Link>

          {/* Hero — glass panel aligned with dashboard / trainings hub */}
          <section className={`${glassCard} relative border-[0.5px] p-6 md:p-10`}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1] grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
              <div className="min-w-0 space-y-4">
                <p className="text-[12px] text-[#64748B]">
                  <Link href="/trainings" className="text-[#94A3B8] transition-colors hover:text-[#0A89A9]">
                    Trainings
                  </Link>
                  <span className="text-[#CBD5E1]" aria-hidden>
                    {" "}
                    /{" "}
                  </span>
                  <span className="text-[#475569]">{meta.breadcrumb}</span>
                </p>

                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                  Pillar {meta.idx} of 4
                  <span className="text-[#1E293B]"> · {meta.eyebrow.split("·")[1]?.trim() ?? meta.eyebrow}</span>
                </p>

                <h1 className="max-w-[min(100%,640px)] text-[28px] font-medium leading-tight text-[#1E293B] md:text-[34px]">
                  {meta.title}
                </h1>

                <p className="max-w-[min(100%,520px)] text-[14px] leading-relaxed text-[#64748B]">{meta.definition}</p>
              </div>

              <div
                className="relative mx-auto flex h-[140px] w-[140px] shrink-0 items-center justify-center rounded-[24px] border border-[#0A89A9]/15 bg-[linear-gradient(145deg,rgba(10,137,169,0.12)_0%,rgba(255,255,255,0.65)_100%)] shadow-[0_4px_20px_rgba(10,137,169,0.08)] md:mx-0 md:h-[168px] md:w-[168px]"
                aria-hidden
              >
                <span className="absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_80px_0px_rgba(255,255,255,0.35)]" />
                <PillarIcon size={72} className="relative text-[#0A89A9]/35 md:size-[84px]" strokeWidth={1.5} />
              </div>
            </div>
          </section>

          {/* Start nudge */}
          <div className={`${glassCardMd} relative flex items-start gap-3 border-[0.5px] p-4 md:p-5`}>
            <span aria-hidden className={cardInset} />
            <span className="relative z-[1] mt-1.5 block h-2 w-2 shrink-0 rounded-full bg-[#0A89A9]" />
            <p className="relative z-[1] text-[13px] leading-relaxed text-[#475569]">
              <span className="font-semibold text-[#1E293B]">Start with course 1 — each course builds on the last.</span>{" "}
              Work through them in order for the best result.
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="text-[20px] font-medium text-[#1E293B]">3 courses · one per skill</h2>
            <p className="max-w-2xl text-[14px] leading-relaxed text-[#64748B]">
              Each course focuses on one specific thing interviewers evaluate. Short, focused, and directly tied to how
              your mock interview answers get scored.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {meta.courses.map((c, idx) => (
              <div
                key={c.title}
                className={[
                  glassCardMd,
                  "relative overflow-hidden border-[0.5px] transition-shadow",
                  c.active
                    ? "ring-1 ring-[#0A89A9]/25 shadow-[0_8px_28px_rgba(10,137,169,0.08)]"
                    : "hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]",
                ].join(" ")}
              >
                <span aria-hidden className={cardInset} />
                <div className="relative z-[1] grid grid-cols-1 sm:grid-cols-[minmax(0,148px)_1fr]">
                  <div className="relative aspect-[16/10] min-h-[120px] sm:aspect-auto sm:h-full sm:min-h-[168px]">
                    <img
                      src={courseThumbs[driver]?.[idx] ?? courseThumbs.think[0]}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-slate-900/15" />
                  </div>

                  <div className="flex flex-col justify-between gap-3 p-4 sm:p-5">
                    <div>
                      <span
                        className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                        style={{ background: tagColors.bg, color: tagColors.text }}
                      >
                        {c.badge}
                      </span>
                      <p className="mt-2 text-[16px] font-semibold leading-snug text-[#1E293B]">{c.title}</p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748B]">{c.outcome}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0]/80 pt-3">
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-[#94A3B8]">
                        <Clock size={14} className="shrink-0" aria-hidden />
                        {c.duration}
                      </span>
                      {idx === 0 ? (
                        <Link
                          href={startCourseHref}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
                        >
                          Start course
                          <ArrowRight size={16} strokeWidth={2} aria-hidden />
                        </Link>
                      ) : (
                        <span className="text-[12px] font-medium text-[#CBD5E1]">Coming up</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
