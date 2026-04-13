"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Urbanist } from "next/font/google";
import { Brain, Zap, Users, Target, Timer, X, ChevronDown, Camera, FileText, Briefcase, ArrowLeft, ArrowRight, Circle } from "lucide-react";
import { JdResumeInput } from "@/components/JdResumeInput";
import { useUser } from "@/lib/user-context";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const glassCard =
  "relative overflow-hidden rounded-[24px] border-[0.5px] border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

const cardInset =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]";

const STORIES = [
  { id: "a", title: "Global expansion strategy", tag: "Strategy" },
  { id: "b", title: "Resolving Q3 server outage", tag: "Technical" },
  { id: "c", title: "Managing difficult stakeholder", tag: "People" },
];

const PILLARS = [
  { id: "thinking", icon: Brain,       label: "Thinking", desc: "Logic & structured problem solving",   time: 7 },
  { id: "action",   icon: Zap,         label: "Action",   desc: "Ownership & driving results",          time: 7 },
  { id: "people",   icon: Users,       label: "People",   desc: "Collaboration & communication",         time: 7 },
  { id: "mastery",  icon: Target,      label: "Mastery",  desc: "Technical depth & domain knowledge",   time: 6 },
] as const;
type P = typeof PILLARS[number]["id"];

const AVAILABLE_ROLES = [
  "Product Manager",
  "Product Designer",
  "UX Designer",
  "Software Engineer",
  "Data Analyst",
] as const;

// ── Consent Modal (dashboard-aligned glass) ───────
function ConsentModal({ onAccept, onClose }: { onAccept: () => void; onClose: () => void }) {
  const [noRecord, setNoRecord] = useState(false);
  const [noCamera, setNoCamera] = useState(false);

  const toggleTrack = (on: boolean) =>
    `flex h-[22px] w-[38px] shrink-0 items-center rounded-full p-0.5 transition-colors ${
      on ? "justify-end bg-red-400" : "justify-start bg-slate-200/90"
    }`;
  const toggleKnob = "h-[18px] w-[18px] rounded-full bg-white shadow";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm"
      role="presentation"
    >
      <div
        className="relative w-full max-w-[460px] animate-in overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.12),0_4px_16px_rgba(15,23,42,0.06)] fade-in zoom-in-95 duration-200"
      >
        <div className="relative z-[1]">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-7 pb-5 pt-6">
            <div>
              <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.14em] text-[#94A3B8]">Before we begin</p>
              <h2 className="text-[20px] font-medium tracking-tight text-[#1E293B]">Interview consent</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-[#64748B] shadow-sm transition-colors hover:bg-white"
              aria-label="Close"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-4 border-b border-[#E2E8F0] px-7 py-5">
            {[
              "Structure your answers using the CAR method (Context, Action, Result).",
              "Keep responses clear and concise (1–2 minutes max).",
              "Focus on your individual contribution, not just the team.",
              "Position yourself properly if your camera is on — sit centered, well-lit, and not too far.",
              "Ensure a clean, plain background with minimal distractions.",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#0A89A9]"
                  aria-hidden
                />
                <p className="text-[13px] leading-relaxed text-[#475569]">{t}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-b border-[#E2E8F0] bg-slate-50 px-7 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">Session options</p>

            <button
              type="button"
              onClick={() => setNoRecord(!noRecord)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-transparent text-left transition-colors hover:bg-white/50"
            >
              <span className={toggleTrack(noRecord)} aria-hidden>
                <span className={toggleKnob} />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[#1E293B]">Cancel recording</p>
                <p className="text-[11px] text-[#64748B]">Session runs without audio / video capture</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setNoCamera(!noCamera)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-transparent text-left transition-colors hover:bg-white/50"
            >
              <span className={toggleTrack(noCamera)} aria-hidden>
                <span className={toggleKnob} />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[#1E293B]">Turn off camera</p>
                <p className="text-[11px] text-[#64748B]">Disables gesture and body movement analysis</p>
              </div>
            </button>
          </div>

          <div className="flex gap-3 px-7 py-5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 shrink-0 rounded-full border border-slate-200/90 bg-white/70 px-5 text-[13px] font-medium text-[#475569] shadow-sm transition-colors hover:bg-white"
            >
              Go back
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="h-11 flex-1 rounded-full bg-[#0A89A9] text-[13px] font-semibold text-white shadow-[0_4px_20px_rgba(10,137,169,0.25)] transition-opacity hover:opacity-90"
            >
              I understand — start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Main page ──────────────────────────────────────
function MockSetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const { user, updateUser } = useUser();

  // Default: all pillars; Proofy "specific" mode pre-selects a focused subset
  const [pillars, setPillars] = useState<Set<P>>(new Set(["thinking", "action", "people", "mastery"]));

  useEffect(() => {
    if (mode === "full") {
      setPillars(new Set(["thinking", "action", "people", "mastery"]));
    } else if (mode === "specific") {
      setPillars(new Set(["thinking", "action"]));
    }
  }, [mode]);
  const [story, setStory]     = useState<string | null>("a");
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [jd, setJd]           = useState(user.jd || "");
  const [showJD, setShowJD]   = useState(!!user.jd);
  const [camera, setCamera]   = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roleMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!roleMenuRef.current?.contains(e.target as Node)) setRoleMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [roleMenuOpen]);

  const selectedStory = STORIES.find(s => s.id === story);
  const currentRole = user.role || user.targetRole || "";
  const roleOptions =
    currentRole && !(AVAILABLE_ROLES as readonly string[]).includes(currentRole)
      ? [currentRole, ...AVAILABLE_ROLES]
      : [...AVAILABLE_ROLES];
  const all = pillars.size === 4;
  const total = [...pillars].reduce((s, id) => s + (PILLARS.find(p => p.id === id)?.time || 0), 0) + 3; // intro fixed 3 min

  function toggleP(id: P) {
    if (pillars.has(id) && pillars.size === 1) return;
    setPillars((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-x-hidden`}>
      {showConsent ? (
        <ConsentModal
          onAccept={() => {
            setShowConsent(false);
            router.push("/mock/live");
          }}
          onClose={() => setShowConsent(false)}
        />
      ) : null}

      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-6">
        <div
          className="pointer-events-none invisible absolute left-[-251px] top-[66px] z-[1] h-[1127px] w-[1127px] opacity-45"
          aria-hidden
        >
          <Image src="/figma-dashboard/bg-orb.png" alt="" fill className="object-contain" />
        </div>

        <div className="relative z-[1] mx-auto w-full max-w-[720px] space-y-5 pb-16">
          <header className="relative z-[1] flex flex-col items-center space-y-4 text-center">
            <Link
              href="/mock"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
            >
              <ArrowLeft size={16} strokeWidth={2} aria-hidden />
              Back to practice
            </Link>
            <section className="flex w-full flex-col items-center">
              <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-[#94A3B8]">Practice session</p>
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
                {mode === "full" ? (
                  <span className="inline-flex rounded-full border border-[#0A89A9]/20 bg-[linear-gradient(90.31deg,rgba(209,250,229,0.45)_0%,rgba(236,253,245,0.5)_99.92%)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#047857]">
                    Full session
                  </span>
                ) : null}
                {mode === "specific" ? (
                  <span className="inline-flex rounded-full border border-amber-200/80 bg-[linear-gradient(90.31deg,rgba(255,233,197,0.45)_0%,rgba(255,242,221,0.4)_99.92%)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#B45309]">
                    Specific practice
                  </span>
                ) : null}
              </div>
              <h1 className="max-w-[min(100%,920px)] text-center text-[30px] font-normal leading-snug sm:text-[34px]">
                <span className="text-[#334155]">You&apos;re </span>
                <span className="text-[#0A89A9]">almost ready</span>
                <span className="text-[#334155]"> — configure your mock, then start.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-center text-[14px] font-normal leading-relaxed text-[#64748B]">
                {mode === "specific"
                  ? "Focused prep: adjust pillars if you want, then start when you are ready."
                  : "Your storyboard is attached. Pick your focus, add optional context, and go."}
              </p>
            </section>
          </header>
          <div className={`${glassCard} relative z-20 overflow-visible border-[0.5px]`}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1] flex flex-col rounded-[24px]">
              <div className="flex items-center justify-between p-4 transition-colors hover:bg-white/30 sm:p-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-slate-200/80 bg-white/70 text-[#0A89A9] shadow-sm">
                    <Briefcase size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-normal text-[#64748B]">Preparing as</p>
                    <p className="text-[16px] font-medium text-[#1E293B]">{user.role || user.targetRole || "Target role"}</p>
                    {isEditingStory ? (
                      <p className="mt-0.5 text-[12px] font-normal text-[#94A3B8]">Select a storyboard to practice</p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingStory(true)}
                        className="mt-1 flex w-full max-w-full cursor-pointer items-center gap-2 rounded-lg text-left transition-colors hover:bg-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A89A9]/35"
                        aria-label="Change storyboard story"
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${selectedStory ? "bg-emerald-500" : "bg-amber-500"}`}
                          aria-hidden
                        />
                        <p className="line-clamp-1 min-w-0 text-[12px] font-medium text-[#64748B]">
                          {selectedStory ? selectedStory.title : "No attached story"}
                        </p>
                      </button>
                    )}
                  </div>
                </div>
                {!isEditingStory ? (
                  <div ref={roleMenuRef} className="relative z-30 shrink-0">
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={roleMenuOpen}
                      aria-label="Choose role"
                      onClick={() => setRoleMenuOpen((o) => !o)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[12px] font-medium text-[#0A89A9] shadow-sm transition-colors hover:border-[#0A89A9]/30 hover:bg-white"
                    >
                      Role
                      <ChevronDown
                        size={14}
                        className={`text-[#64748B] transition-transform ${roleMenuOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                    {roleMenuOpen ? (
                      <div
                        role="listbox"
                        aria-label="Available roles"
                        className="absolute right-0 top-[calc(100%+8px)] z-[100] min-w-[220px] overflow-hidden rounded-[16px] border-[0.5px] border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.98)_99.92%)] py-1 shadow-[0_8px_28px_rgba(0,0,0,0.1)] backdrop-blur-[12px]"
                      >
                        {roleOptions.map((r) => {
                          const active = currentRole === r;
                          return (
                            <button
                              key={r}
                              type="button"
                              role="option"
                              aria-selected={active}
                              onClick={() => {
                                updateUser({ role: r, targetRole: r });
                                setRoleMenuOpen(false);
                              }}
                              className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
                                active ? "bg-[#0A89A9]/10 text-[#0A89A9]" : "text-[#1E293B] hover:bg-white/80"
                              }`}
                            >
                              {r}
                              {active ? <span className="text-[12px] font-semibold text-[#0A89A9]">✓</span> : null}
                            </button>
                          );
                        })}
                        <div className="my-1 h-px bg-[#E2E8F0]" />
                        <Link
                          href="/onboarding"
                          onClick={() => setRoleMenuOpen(false)}
                          className="block px-3 py-2.5 text-[12px] font-semibold text-[#0A89A9] hover:bg-white/80"
                        >
                          + Add another role
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingStory(false)}
                    className="text-[12px] font-medium text-[#64748B] transition-colors hover:text-[#1E293B]"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isEditingStory ? (
                <div className="animate-in slide-in-from-top-2 fade-in border-t border-[#E2E8F0] p-3 duration-200 sm:p-4">
                  <div className="space-y-1">
                    {STORIES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setStory(s.id);
                          setIsEditingStory(false);
                        }}
                        className={`flex w-full flex-col gap-1 rounded-[16px] border px-4 py-3 text-left transition-colors ${
                          s.id === story
                            ? "border-[#0A89A9]/25 bg-[#0A89A9]/[0.06]"
                            : "border-transparent hover:bg-white/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[14px] font-medium text-[#1E293B]">{s.title}</span>
                          {s.id === story ? (
                            <span className="shrink-0 text-[12px] font-semibold text-[#0A89A9]">Selected</span>
                          ) : null}
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0A89A9]/70">
                          {s.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-[#E2E8F0] px-2 pb-1 pt-3">
                    <Link
                      href="/storyboard"
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#64748B] transition-colors hover:text-[#0A89A9]"
                    >
                      + Create new story
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className={glassCard}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1] px-5 pb-5 pt-6 sm:px-6">
              <div className="mb-4 text-center">
                <h2 className="text-[20px] font-medium text-[#1E293B]">Pillar focus</h2>
                <p className="mt-1 text-[12px] font-normal text-[#64748B]">Choose which interview areas to include.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PILLARS.map((p) => {
                  const on = pillars.has(p.id);
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleP(p.id)}
                      className={`flex h-full min-h-[52px] w-full items-center justify-between gap-2 rounded-[14px] px-3 py-2.5 text-left transition-colors ${
                        on ? "bg-white/50 shadow-sm" : "hover:bg-white/40"
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        {on ? (
                          <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-[#0A89A9]">
                            <div className="h-[6px] w-[6px] rounded-full bg-[#0A89A9]" />
                          </div>
                        ) : (
                          <Circle size={18} className="shrink-0 text-slate-300" strokeWidth={1.75} />
                        )}
                        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                          <Icon
                            size={16}
                            className={`shrink-0 ${on ? "text-[#0A89A9]" : "text-[#94A3B8]"}`}
                            strokeWidth={1.8}
                          />
                          <span
                            className={`truncate text-[13px] font-medium sm:text-[14px] ${on ? "text-[#1E293B]" : "text-[#94A3B8]"}`}
                          >
                            {p.label}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-semibold tabular-nums sm:text-[12px] ${on ? "text-[#0A89A9]" : "text-slate-300"}`}
                      >
                        0/{p.id === "mastery" ? "4" : "3"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative z-[1] flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] bg-white/35 px-5 py-4 backdrop-blur-sm sm:px-6">
              <div className="flex items-center gap-2">
                <Timer size={16} className="shrink-0 text-[#0A89A9]" strokeWidth={2} />
                <span className="text-[13px] font-medium text-[#1E293B]">~{total} min estimated</span>
              </div>
              {all ? (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0A89A9]">Full interview</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setPillars(new Set(PILLARS.map((p) => p.id)))}
                  className="text-[12px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
                >
                  Select all
                </button>
              )}
            </div>
          </div>

          <div className={`${glassCard} space-y-6 p-5 text-left sm:p-6`}>
            <span aria-hidden className={cardInset} />
            <div className="relative z-[1] space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-2.5">
                  <FileText size={16} className="text-[#64748B]" strokeWidth={2} />
                  <p className="flex-1 text-[16px] font-medium text-[#1E293B]">Job description</p>
                  {!showJD ? (
                    <button
                      type="button"
                      onClick={() => setShowJD(true)}
                      className="text-[12px] font-semibold text-[#0A89A9] transition-opacity hover:opacity-80"
                    >
                      + Add
                    </button>
                  ) : null}
                </div>
                {showJD ? (
                  <JdResumeInput
                    label="Job Description"
                    placeholder="Paste or upload a JD for tailored questions..."
                    value={jd}
                    onChange={setJd}
                    onRemove={() => {
                      setShowJD(false);
                      setJd("");
                    }}
                    compact
                  />
                ) : (
                  <p className="text-[12px] leading-relaxed text-[#64748B]">
                    Paste or upload a JD to get sharper, role-specific questions.
                  </p>
                )}
              </div>

              <div className="h-px w-full bg-[#E2E8F0]" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-start gap-2.5">
                  <Camera size={16} className="mt-0.5 shrink-0 text-[#64748B]" strokeWidth={2} />
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[#1E293B]">{camera ? "Camera on" : "Enable camera"}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-[#64748B]">
                      Optional: capture video for gesture and presence analytics.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={camera}
                  onClick={() => setCamera(!camera)}
                  className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${
                    camera ? "bg-[#0A89A9]" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      camera ? "translate-x-5" : "translate-x-0"
                    }`}
                    aria-hidden
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              type="button"
              data-journey-id="mock-start"
              onClick={() => setShowConsent(true)}
              className="flex h-12 w-full max-w-[360px] items-center justify-center gap-2 rounded-full bg-[#0A89A9] text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(10,137,169,0.25)] transition-[transform,opacity] hover:opacity-95 active:scale-[0.99]"
            >
              Start interview
              <ArrowRight size={16} strokeWidth={2.5} aria-hidden />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function MockSetup() {
  return (
    <Suspense
      fallback={
        <div
          className={`${urbanist.className} mx-auto max-w-[1440px] px-6 py-24 text-center text-[14px] text-[#94A3B8]`}
        >
          Loading setup…
        </div>
      }
    >
      <MockSetupInner />
    </Suspense>
  );
}
