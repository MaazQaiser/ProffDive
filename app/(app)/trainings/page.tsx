"use client";

import Link from "next/link";
import { Urbanist } from "next/font/google";
import { Brain, Play, Users, Wrench, Zap } from "lucide-react";
import { ChipStatic } from "@/components/Chip";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

/** Glass panel — same token as NewUserDashboard `glassCard` */
const glassCard =
  "relative overflow-hidden rounded-[24px] border border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

type DriverKey = "Thinking" | "Action" | "People" | "Mastery";

/** Matches `app/(app)/trainings/driver/[driver]/page.tsx` slugs */
const DRIVER_SLUG: Record<DriverKey, string> = {
  Thinking: "think",
  Action: "act",
  People: "people",
  Mastery: "mastery",
};

const DRIVERS: {
  key: DriverKey;
  iconBg: string;
  pillBg: string;
  pillText: string;
  pillLabel: string;
  title: string;
  desc: string;
  competencies: string[];
  Icon: typeof Brain;
}[] = [
  {
    key: "Thinking",
    iconBg: "#E6F1FB",
    pillBg: "#E6F1FB",
    pillText: "#0C447C",
    pillLabel: "Power of Thinking",
    title: "How you think",
    desc: "Structure, logic and decisions under pressure",
    competencies: ["Analytical Thinking", "Prioritization", "Decision-Making Agility"],
    Icon: Brain,
  },
  {
    key: "Action",
    iconBg: "#E1F5EE",
    pillBg: "#E1F5EE",
    pillText: "#085041",
    pillLabel: "Power of Action",
    title: "How you act",
    desc: "Drive, resilience and getting things done",
    competencies: ["Ownership", "Initiative & Follow-through", "Embraces Change"],
    Icon: Zap,
  },
  {
    key: "People",
    iconBg: "#FBEAF0",
    pillBg: "#FBEAF0",
    pillText: "#72243E",
    pillLabel: "Power of People",
    title: "How you work with people",
    desc: "Influence, empathy and leading others",
    competencies: ["Influence", "Collaboration & Inclusion", "Grows Capability"],
    Icon: Users,
  },
  {
    key: "Mastery",
    iconBg: "#FAEEDA",
    pillBg: "#FAEEDA",
    pillText: "#633806",
    pillLabel: "Power of Mastery",
    title: "How you master your craft",
    desc: "Domain knowledge, expertise and growth",
    competencies: ["Functional Knowledge", "Execution", "Innovation"],
    Icon: Wrench,
  },
];

function CompTag({ children }: { children: string }) {
  return (
    <ChipStatic
      className="!min-h-[22px] !px-2 !py-0.5 !text-[10px] !font-medium !shadow-none"
      style={{
        background: "rgba(255,255,255,0.75)",
        color: "#475569",
        border: "0.5px solid #E2E8F0",
      }}
    >
      {children}
    </ChipStatic>
  );
}

export default function TrainingsPage() {
  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-x-clip pb-28 sm:pb-32`}>
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6">
        <section className="relative z-[1] flex flex-col items-center gap-6 px-4 py-2 sm:px-8 sm:py-3">
          {/* Hero + featured course — same stack as dashboard (centered title, card below) */}
          <div className="mb-2 flex w-full flex-col items-center gap-6 lg:mb-4">
            <div className="flex flex-col items-center pt-3">
              <h1 className="max-w-[540px] text-center text-[34px] font-normal leading-normal text-[#334155]">
                Hi Maaz, ready to learn{" "}
                <span className="text-[#0A89A9]">what interviewers actually want?</span>
              </h1>
            </div>

            <div className={`relative w-full max-w-[664px] ${glassCard} p-6`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(10,137,169,0.25)] bg-[rgba(10,137,169,0.08)] px-3 py-1 text-[12px] font-semibold text-[#0A89A9]">
                  Start here
                </span>
                <span className="text-[14px] text-[#94A3B8]">Free · ~45 min</span>
              </div>
              <h2 className="text-[20px] font-medium leading-snug text-[#1E293B]">Interview Essentials</h2>
              <p className="mt-2 text-[14px] leading-[1.55] text-[#64748B]">
                The foundation every candidate needs. Learn how interviews are scored, what CAR means, and what a
                great answer actually sounds like — before your first mock.
              </p>
              <div className="mt-5 flex flex-wrap gap-[18px]">
                <Link
                  href="/trainings/interview-essentials"
                  className="inline-flex h-[36px] min-w-[80px] items-center justify-center gap-2 rounded-full bg-[#0A89A9] px-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Play size={16} fill="currentColor" className="opacity-95" />
                  Start learning
                </Link>
                <button
                  type="button"
                  className="inline-flex h-[36px] min-w-[80px] items-center justify-center rounded-full border border-white bg-white/40 px-4 text-[14px] font-medium text-[#64748B] backdrop-blur-[21px] transition-colors hover:bg-white/60"
                >
                  Watch overview
                </button>
              </div>
            </div>
          </div>

          <div className="w-full">
          {/* Driver section */}
          <div className="mb-3">
            <p className="text-[14px] text-[#1E293B]">The 4 things every interviewer is silently scoring you on</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">
              Most candidates never see the rubric. You&apos;re about to. Each area below has dedicated courses —
              tap to explore.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {DRIVERS.map((d) => {
              const Icon = d.Icon;
              return (
                <Link
                  key={d.key}
                  href={`/trainings/driver/${DRIVER_SLUG[d.key]}`}
                  className={`${glassCard} block p-5 text-left no-underline transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] active:translate-y-0 active:shadow-[0_4px_20px_rgba(0,0,0,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A89A9] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]`}
                  style={{ color: "inherit" }}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: d.iconBg }}
                    >
                      <Icon size={18} style={{ color: d.pillText }} strokeWidth={1.75} />
                    </div>
                    <span
                      className="mt-0.5 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold"
                      style={{ background: d.pillBg, color: d.pillText }}
                    >
                      {d.pillLabel}
                    </span>
                  </div>
                  <p className="text-[18px] font-semibold leading-snug text-[#1E293B]">{d.title}</p>
                  <p className="mt-1 text-[12px] leading-[1.45] text-[#64748B]">{d.desc}</p>
                  <div className="mb-3 mt-2 flex flex-wrap gap-1.5">
                    {d.competencies.map((c) => (
                      <CompTag key={c}>{c}</CompTag>
                    ))}
                  </div>
                  <span className="text-[12px] font-semibold text-[#0A89A9]">3 courses →</span>
                </Link>
              );
            })}
          </div>
          </div>
        </section>
      </div>
    </div>
  );
}
