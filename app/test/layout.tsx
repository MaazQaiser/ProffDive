import type { ReactNode } from "react";
import Link from "next/link";

export default function TestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Subtle background — barely tinted, not rainbow */}
      <div className="fixed inset-0 -z-10" style={{
        background: "linear-gradient(150deg, #EEEEF8 0%, #F3F0FF 55%, #EDF3FF 100%)"
      }} />

      {/* Two very subtle blobs only */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", width: 700, height: 700, borderRadius: "50%",
          top: -200, left: -150,
          background: "radial-gradient(circle, rgba(0,135,168,0.10) 0%, transparent 65%)"
        }} />
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          bottom: -100, right: -100,
          background: "radial-gradient(circle, rgba(110,70,200,0.09) 0%, transparent 65%)"
        }} />
      </div>

      {/* Minimal test nav */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-5 px-6 py-2" style={{
        background: "rgba(15,15,15,0.70)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)"
      }}>
        <span className="text-[12px] tracking-[0.2em] uppercase font-mono text-white/30">TEST</span>
        {[
          { label: "Hub",        href: "/test" },
          { label: "Onboarding", href: "/test/onboarding" },
          { label: "Session",    href: "/test/session" },
          { label: "Dashboard",  href: "/test/dashboard" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="text-[11px] text-white/50 hover:text-white transition-colors">{l.label}</Link>
        ))}
        <Link href="/dashboard" className="ml-auto text-[11px] text-white/30 hover:text-white/60 transition-colors">← Exit</Link>
      </div>

      <div className="pt-9">{children}</div>
    </div>
  );
}
