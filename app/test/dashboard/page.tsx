import Link from "next/link";

const G = {
  background: "rgba(255,255,255,0.52)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
} as const;

const GD = {
  background: "linear-gradient(145deg, #1C3B4A 0%, #2D5668 55%, #1E4456 100%)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.20)",
} as const;

const DIV = "rgba(255,255,255,0.55)";
const DIVd = "rgba(255,255,255,0.09)";

const drivers = [
  { label: "Thinking", score: 3.1, pct: 62, dot: "#F87171" },
  { label: "Action",   score: 3.8, pct: 76, dot: "#34D399" },
  { label: "People",   score: 4.0, pct: 80, dot: "#34D399" },
  { label: "Mastery",  score: 2.9, pct: 58, dot: "#FBBF24" },
];

const modules = [
  { title: "Interview Essentials",       progress: 68, bar: "#34D399" },
  { title: "Success Drivers Framework",  progress: 32, bar: "#FBBF24" },
  { title: "Behavioral CAR Method",      progress: 0,  bar: "rgba(0,0,0,0.10)" },
];

const stories = [
  { title: "The Caching Overhaul",   tag: "Technical", updated: "2 days ago" },
  { title: "Handling the Q3 Crisis", tag: "People",    updated: "Last week" },
];

const journey = [
  { label: "Profile setup",      done: true },
  { label: "Learn fundamentals", done: true },
  { label: "Build your story",   done: false, current: true },
  { label: "Practice interview", done: false },
  { label: "Interview ready",    done: false },
];

const nav = [
  { label: "Dashboard",    href: "/test/dashboard", active: true },
  { label: "Mock Session", href: "/test/session" },
  { label: "StoryBoard",   href: "#" },
  { label: "Trainings",    href: "#" },
  { label: "Progress",     href: "#" },
];

export default function TestDashboard() {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar — glass rail */}
      <aside style={{ ...G, borderRadius: 0, border: "none", borderRight: `1px solid ${DIV}`, width: 200, flexShrink: 0, display: "flex", flexDirection: "column", paddingTop: 36 }}>
        <div className="px-5 mb-7">
          <p className="text-[16px] font-bold tracking-tight" style={{ color: "#0F0F0F" }}>ProofDive</p>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(15,15,15,0.35)" }}>Readiness Hub</p>
        </div>
        {nav.map(n => (
          <Link key={n.label} href={n.href} className="flex items-center gap-3 mx-3 px-3 py-2.5 text-[12px] transition-all mb-0.5"
            style={{
              borderRadius: 10,
              background: n.active ? "rgba(255,255,255,0.65)" : "transparent",
              backdropFilter: n.active ? "blur(16px)" : undefined,
              fontWeight: n.active ? 600 : 400,
              color: n.active ? "#0F0F0F" : "rgba(15,15,15,0.45)",
              border: n.active ? `1px solid rgba(255,255,255,0.80)` : "1px solid transparent",
              boxShadow: n.active ? "0 2px 8px rgba(0,0,0,0.05)" : undefined,
            }}>
            {n.label}
          </Link>
        ))}
        <div className="mt-auto mb-5">
          {["Settings","Account"].map(l => (
            <Link key={l} href="#" className="flex items-center gap-3 mx-3 px-3 py-2.5 text-[12px]"
              style={{ borderRadius: 10, color: "rgba(15,15,15,0.30)" }}>{l}</Link>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden p-5 gap-4">

        {/* Top bar */}
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] font-semibold" style={{ color: "rgba(15,15,15,0.35)" }}>Monday, 30 March</p>
            <h1 className="text-xl font-bold tracking-tight mt-0.5" style={{ color: "#0F0F0F" }}>Good afternoon, Alex.</h1>
          </div>
          <Link href="/test/session" className="h-9 px-5 text-[12px] font-bold text-white flex items-center"
            style={{ borderRadius: 10, background: "#0087A8" }}>
            Start mock →
          </Link>
        </div>

        {/* Row 1 — Success Drivers | Journey — ONE surface each, touching sides */}
        <div className="grid grid-cols-[1fr_240px] gap-3 flex-1 min-h-0">

          {/* Success Drivers */}
          <div style={{ ...G, borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${DIV}` }}>
              <div>
                <p className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>Success Drivers</p>
                <p className="text-[12px] mt-0.5" style={{ color: "rgba(15,15,15,0.38)" }}>4 pillars · 3 sessions</p>
              </div>
              <Link href="#" className="text-[11px]" style={{ color: "rgba(15,15,15,0.28)" }}>Report ›</Link>
            </div>
            {/* Drivers grid edge-to-edge */}
            <div className="grid grid-cols-2 flex-1" style={{ minHeight: 0 }}>
              {drivers.map((d, i) => (
                <div key={d.label} className="px-6 py-5"
                  style={{
                    borderRight: i % 2 === 0 ? `1px solid ${DIV}` : undefined,
                    borderBottom: i < 2 ? `1px solid ${DIV}` : undefined
                  }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: d.dot, flexShrink: 0 }} />
                    <span className="text-[12px] font-bold" style={{ color: "#0F0F0F" }}>{d.label}</span>
                    <span className="ml-auto text-[14px] font-bold font-mono" style={{ color: "#0F0F0F" }}>{d.score}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: "rgba(0,0,0,0.07)" }}>
                    <div style={{ height: "100%", borderRadius: 99, width: `${d.pct}%`, background: d.dot }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journey — dark glass */}
          <div style={{ ...GD, borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${DIVd}` }}>
              <p className="text-[13px] font-bold" style={{ color: "#FFF" }}>Your Journey</p>
              <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Step 3 of 5</p>
            </div>
            <div className="flex-1 flex flex-col justify-center px-5 gap-4 py-5">
              {journey.map((j, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div style={{ width: 18, height: 18, borderRadius: 99, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: j.done ? "#FFF" : "transparent", border: j.current ? "2px solid rgba(255,255,255,0.70)" : j.done ? "none" : "1.5px solid rgba(255,255,255,0.15)" }}>
                    {j.done && <span style={{ fontSize: 9, fontWeight: 800, color: "#0F0F0F" }}>✓</span>}
                    {j.current && <div style={{ width: 5, height: 5, borderRadius: 99, background: "#FFF" }} />}
                  </div>
                  <span className="text-[12px]" style={{ color: j.done ? "rgba(255,255,255,0.85)" : j.current ? "#FFF" : "rgba(255,255,255,0.22)", fontWeight: j.current ? 700 : 400 }}>
                    {j.label}
                  </span>
                  {j.current && <span className="ml-auto text-[9px] font-bold uppercase px-2 py-px" style={{ borderRadius: 4, background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}>Now</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 — Learning | Stories */}
        <div className="grid grid-cols-[1fr_260px] gap-3" style={{ flex: "0 0 auto" }}>

          {/* Learning */}
          <div style={{ ...G, borderRadius: 20, overflow: "hidden" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${DIV}` }}>
              <p className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>Learning Modules</p>
              <Link href="#" className="text-[11px]" style={{ color: "rgba(15,15,15,0.28)" }}>All ›</Link>
            </div>
            {modules.map((m, i) => (
              <div key={m.title} className="flex items-center gap-4 px-6 py-4 hover:bg-white/30 transition-colors cursor-pointer"
                style={{ borderBottom: i < modules.length - 1 ? `1px solid ${DIV}` : undefined }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold" style={{ color: "#0F0F0F" }}>{m.title}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-[12px] font-bold font-mono" style={{ color: "#0F0F0F" }}>{m.progress}%</p>
                  <div style={{ width: 64, height: 3, borderRadius: 99, background: "rgba(0,0,0,0.07)" }}>
                    <div style={{ height: "100%", borderRadius: 99, width: `${m.progress}%`, background: m.bar }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stories */}
          <div style={{ ...G, borderRadius: 20, overflow: "hidden" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${DIV}` }}>
              <p className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>StoryBoard</p>
              <Link href="#" className="text-[11px]" style={{ color: "rgba(15,15,15,0.28)" }}>All ›</Link>
            </div>
            {stories.map((s, i) => (
              <div key={s.title} className="px-5 py-4 hover:bg-white/30 transition-colors cursor-pointer"
                style={{ borderBottom: `1px solid ${DIV}` }}>
                <p className="text-[12px] font-semibold" style={{ color: "#0F0F0F" }}>{s.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] uppercase px-1.5 py-px font-bold" style={{ borderRadius: 4, background: "rgba(0,0,0,0.05)", color: "rgba(15,15,15,0.45)" }}>{s.tag}</span>
                  <span className="text-[12px]" style={{ color: "rgba(15,15,15,0.25)" }}>{s.updated}</span>
                </div>
              </div>
            ))}
            <Link href="#" className="flex items-center gap-2 px-5 py-3.5 text-[11px] hover:bg-white/30 transition-colors"
              style={{ color: "rgba(15,15,15,0.30)" }}>
              + Add new story
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
