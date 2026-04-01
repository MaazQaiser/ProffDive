import Link from "next/link";

// Shared glass surface
const G = {
  background: "rgba(255,255,255,0.52)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
} as const;

const D = { borderColor: "rgba(255,255,255,0.55)" } as const; // inner dividers

const screens = [
  { n: "01", label: "Onboarding",    desc: "Career bracket → Role & context",  href: "/test/onboarding" },
  { n: "02", label: "Session Setup", desc: "Configure your mock interview",      href: "/test/session" },
  { n: "03", label: "Dashboard",     desc: "Guided readiness hub & progress",    href: "/test/dashboard" },
];

export default function TestHub() {
  return (
    <div className="min-h-screen flex items-center justify-center p-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-[12px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: "rgba(15,15,15,0.35)" }}>Design System v2.1</p>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#0F0F0F" }}>ProofDive</h1>
          <p className="text-sm mt-1.5" style={{ color: "rgba(15,15,15,0.45)" }}>Select a screen to preview.</p>
        </div>

        {/* One glass surface with edge-to-edge rows */}
        <div style={{ ...G, borderRadius: 20, overflow: "hidden" }}>
          {screens.map((s, i) => (
            <Link key={s.href} href={s.href}
              className="group flex items-center gap-5 px-6 py-5 hover:bg-white/40 transition-colors"
              style={{ borderBottom: i < screens.length - 1 ? `1px solid ${D.borderColor}` : undefined }}>
              <span className="text-[12px] font-mono font-bold w-6 shrink-0" style={{ color: "rgba(15,15,15,0.25)" }}>{s.n}</span>
              <div className="flex-1">
                <p className="text-[13px] font-bold" style={{ color: "#0F0F0F" }}>{s.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(15,15,15,0.40)" }}>{s.desc}</p>
              </div>
              <span className="text-base transition-transform group-hover:translate-x-0.5" style={{ color: "rgba(15,15,15,0.20)" }}>›</span>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px]" style={{ color: "rgba(15,15,15,0.28)" }}>
          <Link href="/dashboard" className="hover:underline">← Back to production</Link>
        </p>
      </div>
    </div>
  );
}
