import Link from "next/link";

const G: React.CSSProperties = {
  background: "rgba(255,255,255,0.52)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 20,
  boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
};
const D = "1px solid rgba(255,255,255,0.55)";

const drivers = [
  { name: "Thinking", before: 2.8, after: 3.2, dot: "#F87171" },
  { name: "Action",   before: 2.1, after: 2.8, dot: "#FBBF24" },
  { name: "People",   before: 3.9, after: 4.1, dot: "#34D399" },
  { name: "Mastery",  before: 3.3, after: 3.6, dot: "#FBBF24" },
];
const mocks = [
  { date: "Oct 24", role: "Product Manager", score: 3.6, dot: "#FBBF24", tag: "Borderline", id: "1" },
  { date: "Oct 10", role: "Intro Interview", score: 4.1, dot: "#34D399", tag: "Ready",      id: "2" },
];

export default function ProgressPage() {
  return (
    <div className="max-w-[960px] mx-auto px-8 lg:px-14 py-10 space-y-5">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: "rgba(15,15,15,0.35)" }}>Insights</p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0F0F0F" }}>Your Progress</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(15,15,15,0.45)" }}>Performance across all mock simulations and checkpoints.</p>
        </div>
        <Link href="/mock/setup"
          className="h-10 px-5 text-[13px] font-bold text-white flex items-center gap-2 transition-opacity hover:opacity-90"
          style={{ borderRadius: 10, background: "#0087A8" }}>
          New mock →
        </Link>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">

        {/* Driver improvement */}
        <div style={G} className="overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: D }}>
            <p className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>Driver Improvement</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(15,15,15,0.38)" }}>First session → latest session</p>
          </div>
          {drivers.map((d, i) => (
            <div key={d.name} className="px-6 py-5" style={{ borderBottom: i < drivers.length - 1 ? D : undefined }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: d.dot, display: "inline-block", flexShrink: 0 }} />
                  <span className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>{d.name}</span>
                </div>
                <span className="text-[12px] font-mono" style={{ color: "rgba(15,15,15,0.50)" }}>
                  {d.before} → <strong style={{ color: "#0F0F0F" }}>{d.after}</strong> <span style={{ color: "rgba(15,15,15,0.30)" }}>/5</span>
                </span>
              </div>
              {/* Before bar */}
              <div className="mb-1.5">
                <p className="text-[10px] mb-1 uppercase tracking-widest font-semibold" style={{ color: "rgba(15,15,15,0.28)" }}>Before</p>
                <div style={{ height: 4, borderRadius: 99, background: "rgba(0,0,0,0.07)" }}>
                  <div style={{ height: "100%", borderRadius: 99, width: `${(d.before/5)*100}%`, background: "rgba(0,0,0,0.18)" }} />
                </div>
              </div>
              {/* After bar */}
              <div>
                <p className="text-[10px] mb-1 uppercase tracking-widest font-semibold" style={{ color: "rgba(15,15,15,0.28)" }}>Now</p>
                <div style={{ height: 4, borderRadius: 99, background: "rgba(0,0,0,0.07)" }}>
                  <div style={{ height: "100%", borderRadius: 99, width: `${(d.after/5)*100}%`, background: d.dot }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Session history */}
        <div style={G} className="overflow-hidden h-fit">
          <div className="px-5 py-4" style={{ borderBottom: D }}>
            <p className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>Session History</p>
          </div>
          {mocks.map((m, i) => (
            <Link href={`/report/${m.id}`} key={m.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-white/35 transition-colors"
              style={{ borderBottom: i < mocks.length - 1 ? D : undefined }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: m.dot, display: "inline-block", flexShrink: 0 }} />
                  <p className="text-[12px] font-semibold truncate" style={{ color: "#0F0F0F" }}>{m.role}</p>
                </div>
                <p className="text-[10px] pl-4" style={{ color: "rgba(15,15,15,0.30)" }}>{m.date}</p>
              </div>
              <span className="text-[15px] font-bold font-mono shrink-0" style={{ color: "#0F0F0F" }}>{m.score}<span style={{ fontSize: 10, color: "rgba(15,15,15,0.30)", fontWeight: 400 }}>/5</span></span>
            </Link>
          ))}
          <div className="px-5 py-4">
            <Link href="/mock/setup"
              className="block w-full h-9 text-center text-[12px] font-bold leading-9 transition-opacity hover:opacity-90 text-white"
              style={{ borderRadius: 10, background: "#0087A8" }}>
              Take another mock →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
