"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JdResumeInput } from "@/components/JdResumeInput";

const G = {
  background: "rgba(255,255,255,0.52)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
} as const;
const DIV = "rgba(255,255,255,0.55)";

const PILLARS = [
  { id: "thinking", icon: "🧠", label: "Thinking", desc: "Logic & structured problem solving", time: "~8 min" },
  { id: "action",   icon: "⚡", label: "Action",   desc: "Ownership & driving results",          time: "~8 min" },
  { id: "people",   icon: "🤝", label: "People",   desc: "Collaboration & communication",         time: "~8 min" },
  { id: "mastery",  icon: "🎯", label: "Mastery",  desc: "Technical depth & domain knowledge",    time: "~8 min" },
] as const;
type P = typeof PILLARS[number]["id"];

const STORIES = [
  { id: "a", title: "The Caching Overhaul",   tag: "Technical" },
  { id: "b", title: "Handling the Q3 Crisis", tag: "People" },
  { id: "c", title: "Tell me about yourself", tag: "Pitch" },
];

export default function TestSession() {
  const router = useRouter();
  const [pillars, setPillars]   = useState<Set<P>>(new Set(["thinking","action","people","mastery"]));
  const [story, setStory]       = useState<string|null>(null);
  const [showStories, setStories] = useState(false);
  const [showJD, setShowJD]     = useState(false);
  const [jd, setJd]             = useState("");
  const [showResume, setShowResume] = useState(false);
  const [resume, setResume]     = useState("");
  const [camera, setCamera]     = useState(false);

  const all = pillars.size === 4;
  const total = pillars.size * 8 + 6;
  const chosen = STORIES.find(s => s.id === story);

  function toggleP(id: P) {
    if (pillars.has(id) && pillars.size === 1) return;
    setPillars(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  return (
    <div className="min-h-screen flex flex-col px-8 lg:px-16 py-10">

      {/* Page header */}
      <div className="max-w-5xl mx-auto w-full mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: "rgba(15,15,15,0.35)" }}>Mock Interview</p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0F0F0F" }}>Set up your session</h1>
      </div>

      {/* ONE glass surface — two columns, edge-to-edge */}
      <div className="max-w-5xl mx-auto w-full flex-1" style={{ ...G, borderRadius: 24, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 320px" }}>

        {/* LEFT — Pillars */}
        <div style={{ borderRight: `1px solid ${DIV}`, display: "flex", flexDirection: "column" }}>

          {/* Panel header */}
          <div className="px-8 py-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${DIV}` }}>
            <div>
              <p className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>Interview Focus</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(15,15,15,0.40)" }}>Introduction always included · select ≥ 1</p>
            </div>
            <button onClick={() => setPillars(all ? new Set(["thinking"]) : new Set(PILLARS.map(p => p.id)))}
              className="text-[11px] font-bold px-3 py-1.5 transition-all"
              style={{ borderRadius: 8, background: all ? "#0F0F0F" : "rgba(0,0,0,0.05)", color: all ? "#FFF" : "rgba(15,15,15,0.50)" }}>
              {all ? "✓ Full interview" : "Go full →"}
            </button>
          </div>

          {/* Pillar rows — edge to edge */}
          <div style={{ flex: 1 }}>
            {PILLARS.map((p, i) => {
              const on = pillars.has(p.id);
              return (
                <button key={p.id} onClick={() => toggleP(p.id)}
                  className="w-full flex items-center gap-5 px-8 py-5 text-left hover:bg-white/35 transition-colors"
                  style={{ borderBottom: `1px solid ${DIV}`, background: on ? "rgba(255,255,255,0.30)" : "transparent" }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${on ? "#0F0F0F" : "rgba(0,0,0,0.18)"}`,
                    background: on ? "#0F0F0F" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {on && <span style={{ color: "#FFF", fontSize: 9, fontWeight: 800 }}>✓</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 15 }}>{p.icon}</span>
                      <span className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>{p.label}</span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(15,15,15,0.40)" }}>{p.desc}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest shrink-0" style={{ color: "rgba(15,15,15,0.22)" }}>{p.time}</span>
                </button>
              );
            })}

            {/* Introduction — mandatory */}
            <div className="flex items-center gap-5 px-8 py-5" style={{ background: "rgba(0,0,0,0.02)", borderBottom: `1px solid ${DIV}` }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, background: "#0F0F0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#FFF", fontSize: 9, fontWeight: 800 }}>✓</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 15 }}>📋</span>
                  <span className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>Introduction</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-px" style={{ borderRadius: 4, background: "#0F0F0F", color: "#FFF" }}>Required</span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(15,15,15,0.40)" }}>Tell me about yourself — always the opening</p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest shrink-0" style={{ color: "rgba(15,15,15,0.22)" }}>~6 min</span>
            </div>
          </div>

          {/* Duration footer */}
          <div className="px-8 py-4 flex items-center gap-3" style={{ borderTop: `1px solid ${DIV}`, background: "rgba(0,0,0,0.02)" }}>
            <span style={{ color: "rgba(15,15,15,0.35)", fontSize: 14 }}>⏱</span>
            <span className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>~{total} min total</span>
            {all && <span className="ml-auto text-[10px] font-bold uppercase tracking-widest" style={{ color: "#0087A8" }}>Recommended</span>}
          </div>
        </div>

        {/* RIGHT — Config column */}
        <div style={{ display: "flex", flexDirection: "column" }}>

          {/* Role */}
          <div className="px-6 py-5" style={{ borderBottom: `1px solid ${DIV}` }}>
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: "rgba(15,15,15,0.35)" }}>Target Role</p>
            <div className="flex items-center gap-3 h-10 px-3" style={{ borderRadius: 10, background: "rgba(0,0,0,0.04)" }}>
              <span style={{ width: 6, height: 6, borderRadius: 2, background: "#0F0F0F", flexShrink: 0 }} />
              <span className="text-[13px] font-semibold flex-1" style={{ color: "#0F0F0F" }}>Product Manager</span>
              <Link href="/test/onboarding" className="text-[11px] transition-opacity hover:opacity-50" style={{ color: "rgba(15,15,15,0.40)" }}>Change</Link>
            </div>
          </div>

          {/* StoryBoard */}
          <div className="px-6 py-5" style={{ borderBottom: `1px solid ${DIV}` }}>
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: "rgba(15,15,15,0.35)" }}>
              StoryBoard <span className="normal-case font-normal" style={{ color: "rgba(15,15,15,0.22)" }}>optional</span>
            </p>
            {!chosen ? (
              <div>
                <button onClick={() => setStories(!showStories)}
                  className="w-full h-10 px-3 text-[12px] flex items-center gap-2 transition-opacity hover:opacity-60"
                  style={{ borderRadius: 10, background: "rgba(0,0,0,0.04)", color: "rgba(15,15,15,0.45)", border: "none" }}>
                  <span>📖</span> Select a story
                  <span className="ml-auto">{showStories ? "∧" : "∨"}</span>
                </button>
                {showStories && (
                  <div className="mt-2 overflow-hidden" style={{ borderRadius: 12, background: "rgba(255,255,255,0.80)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.88)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                    {STORIES.map((s,i) => (
                      <button key={s.id} onClick={() => { setStory(s.id); setStories(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/50 transition-colors"
                        style={{ borderBottom: i < STORIES.length-1 ? "1px solid rgba(0,0,0,0.05)" : undefined }}>
                        <span className="flex-1 text-[12px] font-medium" style={{ color: "#0F0F0F" }}>{s.title}</span>
                        <span className="text-[9px] uppercase px-2 py-px font-bold" style={{ borderRadius: 4, background: "rgba(0,0,0,0.06)", color: "rgba(15,15,15,0.45)" }}>{s.tag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 h-10 px-3" style={{ borderRadius: 10, background: "rgba(0,0,0,0.06)" }}>
                <span className="flex-1 text-[12px] font-semibold truncate" style={{ color: "#0F0F0F" }}>{chosen.title}</span>
                <button onClick={() => setStory(null)} style={{ color: "rgba(15,15,15,0.35)", fontSize: 14 }}>✕</button>
              </div>
            )}
          </div>

          {/* JD */}
          <div className="px-6 py-5" style={{ borderBottom: `1px solid ${DIV}` }}>
            {!showJD ? (
              <button onClick={() => setShowJD(true)}
                className="w-full text-left text-[12px] flex items-center gap-2 transition-opacity hover:opacity-60"
                style={{ color: "rgba(15,15,15,0.35)" }}>
                <span>+</span> Add job description <span className="ml-auto text-[10px]">Optional</span>
              </button>
            ) : (
              <JdResumeInput
                label="Job Description"
                placeholder="Paste or upload JD for tailored questions..."
                value={jd}
                onChange={setJd}
                onRemove={() => { setShowJD(false); setJd(""); }}
                compact
              />
            )}
          </div>

          {/* Resume */}
          <div className="px-6 py-5" style={{ borderBottom: `1px solid ${DIV}` }}>
            {!showResume ? (
              <button onClick={() => setShowResume(true)}
                className="w-full text-left text-[12px] flex items-center gap-2 transition-opacity hover:opacity-60"
                style={{ color: "rgba(15,15,15,0.35)" }}>
                <span>+</span> Add resume <span className="ml-auto text-[10px]">Optional</span>
              </button>
            ) : (
              <JdResumeInput
                label="Resume"
                placeholder="Paste or upload your resume..."
                value={resume}
                onChange={setResume}
                onRemove={() => { setShowResume(false); setResume(""); }}
                compact
              />
            )}
          </div>

          {/* Camera */}
          <div className="px-6 py-5" style={{ borderBottom: `1px solid ${DIV}` }}>
            <button onClick={() => setCamera(!camera)}
              className="w-full flex items-center gap-3 transition-colors"
              style={{ background: "none", border: "none", padding: 0 }}>
              <span style={{ fontSize: 16 }}>🎥</span>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-semibold" style={{ color: "#0F0F0F" }}>{camera ? "Camera on" : "Enable camera"}</p>
                <p className="text-[10px]" style={{ color: "rgba(15,15,15,0.38)" }}>Unlocks gesture & body analysis</p>
              </div>
              <div style={{ width: 36, height: 20, borderRadius: 99, background: camera ? "#0F0F0F" : "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", padding: "0 2px", transition: "background 200ms", flexShrink: 0 }}>
                <div style={{ width: 16, height: 16, borderRadius: 99, background: "#FFF", transform: camera ? "translateX(16px)" : "translateX(0)", transition: "transform 200ms", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
              </div>
            </button>
          </div>

          {/* CTA — fills remaining space, dark glass */}
          <div className="px-6 py-5 mt-auto" style={{ background: "linear-gradient(145deg, #1C3B4A 0%, #2D5668 55%, #1E4456 100%)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <button onClick={() => router.push("/test/dashboard")}
              className="w-full h-11 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ borderRadius: 12, background: "#0087A8" }}>
              Start mock interview →
            </button>
            <Link href="/test" className="block text-center mt-2 text-[11px] transition-opacity hover:opacity-60" style={{ color: "rgba(255,255,255,0.40)" }}>
              Go back
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
