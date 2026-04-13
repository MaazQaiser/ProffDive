"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Heart,
  SendHorizontal,
  Target,
  X,
  Zap,
} from "lucide-react";

const TEAL = "#0087A8";
const BTN_RADIUS = 8;
const CARD_RADIUS = 10;
const COURSE_RADIUS = 12;
const BORDER = "rgba(15,23,42,0.12)";
const BORDER_HALF: React.CSSProperties = { borderWidth: 0.5 };
const CONTENT_MAX_W = 860;
const CONTENT_PAD: React.CSSProperties = { padding: "1.75rem 2rem" };

type DriverId = "think" | "act" | "people" | "mastery";

const DRIVER_META: Record<
  DriverId,
  {
    idx: number;
    breadcrumb: string;
    eyebrow: string;
    title: string;
    definition: string;
    rightBg: string;
    badgeBg: string;
    badgeText: string;
    courses: Array<{
      badge: string;
      title: string;
      outcome: string;
      duration: string;
      active?: boolean;
      visualBg: string;
    }>;
    proofyPrompt: string;
  }
> = {
  think: {
    idx: 1,
    breadcrumb: "How you think",
    eyebrow: "Pillar 1 of 4 · Power of Thinking",
    title: "How you think",
    definition:
      "Interviewers are always watching how you break down problems, structure your reasoning and make decisions under pressure — even when the question doesn't sound like a thinking question.",
    rightBg: "#006A87",
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
        visualBg: "#005F7A",
      },
      {
        badge: "Strategic thinking",
        title: "How to think ahead — spotting second-order effects",
        outcome:
          "After this you'll be able to show interviewers you think beyond the obvious — which is exactly what separates strong candidates.",
        duration: "~10 min",
        visualBg: "#004D63",
      },
      {
        badge: "Creative thinking",
        title: "Finding the angle no one else sees",
        outcome:
          "After this you'll know how to reframe a question in a way that makes your answer memorable — not just correct.",
        duration: "~9 min",
        visualBg: "#004D63",
      },
    ],
    proofyPrompt: "Ask Proofy — what does analytical thinking actually mean in an interview?",
  },
  act: {
    idx: 2,
    breadcrumb: "How you act",
    eyebrow: "Pillar 2 of 4 · Power of Action",
    title: "How you act",
    definition:
      "Interviewers watch how you move from intention to outcome: how you take initiative, keep momentum under pressure, and deliver real results — not just activity.",
    rightBg: "#006A87",
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
        visualBg: "#005F7A",
      },
      {
        badge: "Resilience",
        title: "Staying sharp under pressure and setbacks",
        outcome:
          "After this you'll be able to describe setbacks in a way that highlights composure, learning, and forward progress.",
        duration: "~10 min",
        visualBg: "#004D63",
      },
      {
        badge: "Delivery",
        title: "Turning effort into outcomes interviewers believe",
        outcome:
          "After this you'll know how to present execution with clarity — scope, trade-offs, and results — so it feels undeniable.",
        duration: "~9 min",
        visualBg: "#004D63",
      },
    ],
    proofyPrompt: "Ask Proofy — how do I show drive without sounding arrogant?",
  },
  people: {
    idx: 3,
    breadcrumb: "How you work with people",
    eyebrow: "Pillar 3 of 4 · Power of People",
    title: "How you work with people",
    definition:
      "Interviewers look for how you influence outcomes through others: communication, empathy, and leadership — especially when alignment is hard.",
    rightBg: "#006A87",
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
        visualBg: "#005F7A",
      },
      {
        badge: "Empathy",
        title: "Reading the room — and adapting in real time",
        outcome:
          "After this you'll be able to show empathy as a performance skill: sharper decisions, better collaboration, fewer rework loops.",
        duration: "~10 min",
        visualBg: "#004D63",
      },
      {
        badge: "Leadership",
        title: "Leading without the title",
        outcome:
          "After this you'll know how to frame leadership as lifting team performance — not just managing people.",
        duration: "~9 min",
        visualBg: "#004D63",
      },
    ],
    proofyPrompt: "Ask Proofy — how do I talk about conflict without sounding negative?",
  },
  mastery: {
    idx: 4,
    breadcrumb: "How you master your craft",
    eyebrow: "Pillar 4 of 4 · Power of Mastery",
    title: "How you master your craft",
    definition:
      "Interviewers evaluate whether you have depth: technical fluency, quality standards, and learning agility — the signals that you’ll grow fast once hired.",
    rightBg: "#006A87",
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
        visualBg: "#005F7A",
      },
      {
        badge: "Craft & quality",
        title: "Your bar — how great work actually gets shipped",
        outcome:
          "After this you'll be able to describe quality as a system: decisions, trade-offs, and standards that lead to reliable outcomes.",
        duration: "~10 min",
        visualBg: "#004D63",
      },
      {
        badge: "Learning agility",
        title: "Learning fast — and applying it under constraints",
        outcome:
          "After this you'll know how to frame learning as speed-to-impact — not just curiosity.",
        duration: "~9 min",
        visualBg: "#004D63",
      },
    ],
    proofyPrompt: "Ask Proofy — what does “craft” mean for my role?",
  },
};

function driverLabel(driver: DriverId) {
  switch (driver) {
    case "think":
      return "THINKING";
    case "act":
      return "ACTION";
    case "people":
      return "PEOPLE";
    case "mastery":
      return "MASTERY";
  }
}

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

function PillarIllustration({ driver }: { driver: DriverId }) {
  const iconProps = { size: 96, className: "text-white/25" } as const;
  const Icon =
    driver === "think"
      ? BookOpen
      : driver === "act"
        ? Zap
        : driver === "people"
          ? Heart
          : Target;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div aria-hidden className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 blur-[0px]" />
      <div aria-hidden className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10" />
      <Icon {...iconProps} />
    </div>
  );
}

function StartNudgeCard() {
  return (
    <div
      className="bg-white border flex items-start gap-3"
      style={{ borderRadius: CARD_RADIUS, borderColor: BORDER, ...BORDER_HALF, padding: "1rem 1.25rem" }}
    >
      <span className="mt-1.5 block h-2 w-2 rounded-full" style={{ background: TEAL }} aria-hidden />
      <p className="text-[13px] text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-900">
          Start with course 1 — each course builds on the last.
        </span>{" "}
        Work through them in order for the best result.
      </p>
    </div>
  );
}

export default function DriverCoursesPage() {
  const params = useParams<{ driver?: string }>();
  const driver = (params?.driver ?? "think") as DriverId;
  const meta = DRIVER_META[driver] ?? DRIVER_META.think;
  const tagColors = driverPillColors(driver);

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
    <div className="w-full">
      {/* Banner */}
      <div className="relative overflow-hidden" style={{ background: TEAL }}>
        <div className="relative grid grid-cols-1 md:grid-cols-2">
          <div
            className="text-white"
            style={{ padding: "1.75rem 0" }}
          >
            <div style={{ maxWidth: CONTENT_MAX_W, margin: "0 auto", padding: "0 2rem" }}>
              <div className="text-[12px] flex items-center gap-2">
                <Link href="/trainings" className="hover:opacity-80 transition-opacity" style={{ color: "rgba(255,255,255,0.6)" }}>
                  ← Trainings
                </Link>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>/</span>
                <span className="text-white">{meta.breadcrumb}</span>
              </div>

              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] font-semibold">
                <span style={{ color: "rgba(255,255,255,0.60)" }}>
                  Pillar {meta.idx} of 4 ·{" "}
                </span>
                <span style={{ color: "#FFFFFF", fontWeight: 900, letterSpacing: "0.22em" }}>
                  {meta.eyebrow.split("·")[1]?.trim() ?? meta.eyebrow}
                </span>
              </p>

              <h1 className="mt-2 text-[26px] font-medium leading-tight">{meta.title}</h1>

              <p className="mt-3 text-[13px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.78)", maxWidth: 400 }}>
                {meta.definition}
              </p>
            </div>
          </div>

          <div className="min-h-[180px] md:min-h-[220px]" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto" style={{ maxWidth: CONTENT_MAX_W, ...CONTENT_PAD }}>
        <StartNudgeCard />

        <div className="mt-6 space-y-1">
          <p className="text-[15px] font-medium text-slate-900">3 courses · one per skill</p>
          <p className="text-[13px] text-slate-500 leading-relaxed">
            Each course focuses on one specific thing interviewers evaluate. Short, focused, and directly tied to how your mock interview answers get scored.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {meta.courses.map((c, idx) => (
            <div
              key={c.title}
              className="bg-white border overflow-hidden transition-colors"
              style={{
                borderRadius: COURSE_RADIUS,
                borderColor: c.active ? TEAL : BORDER,
                borderWidth: c.active ? 1.5 : 0.5,
                ...(c.active ? null : BORDER_HALF),
              }}
            >
              <div className="grid grid-cols-[148px_1fr]">
                <div className="relative">
                  <img
                    src={courseThumbs[driver]?.[idx] ?? courseThumbs.think[0]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-slate-900/10" />
                </div>

                <div className="flex flex-col justify-between" style={{ padding: "1rem 1.25rem" }}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.14em] px-2 py-0.5"
                        style={{ borderRadius: 999, background: tagColors.bg, color: tagColors.text }}
                      >
                        {c.badge}
                      </span>
                    </div>

                    <p className="mt-2 text-[14px] font-medium text-slate-900 leading-snug">
                      {c.title}
                    </p>
                    <p className="mt-1.5 text-[12px] text-slate-600 leading-relaxed">
                      {c.outcome}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} />
                        {c.duration}
                      </span>
                    </div>
                    {idx === 0 ? (
                      <Link
                        href="/trainings/interview-essentials"
                        className="text-[12px] font-medium inline-flex items-center gap-1"
                        style={{ color: TEAL }}
                      >
                        Start course <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <span className="text-[12px]" style={{ color: "rgba(15,23,42,0.32)" }}>
                        Coming up
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Proofy bar */}
        <div
          className="w-full border bg-white flex items-center gap-3"
          style={{ marginTop: "1.5rem", borderRadius: CARD_RADIUS, borderColor: BORDER, ...BORDER_HALF, padding: "10px 14px" }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center shrink-0 text-white font-semibold"
            style={{ background: TEAL, borderRadius: 999 }}
          >
            P
          </div>
          <div className="flex-1 text-[12px] text-slate-500">{meta.proofyPrompt}</div>
          <SendHorizontal size={16} style={{ color: TEAL }} />
        </div>
      </div>
    </div>
  );
}

