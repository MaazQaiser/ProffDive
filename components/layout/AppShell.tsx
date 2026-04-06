"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";

const NAV = [
  { label: "Dashboard",  href: "/dashboard" },
  { label: "Trainings",  href: "/trainings" },
  { label: "StoryBoard", href: "/storyboard" },
  { label: "Practice",   href: "/mock" },
];

// Shared glass token used by all page cards
export const G: React.CSSProperties = {
  background: "rgba(255,255,255,0.52)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 20,
  boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
};

function TopNav() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 flex items-center justify-between px-8 lg:px-14 h-14 transition-all duration-300 ${
        scrolled 
          ? "bg-white/70 backdrop-blur-[24px] border-b border-[#0F172A]/5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]" 
          : "bg-transparent border-b border-transparent shadow-none"
      }`}
    >
      <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
        <span className="w-1.5 h-5 inline-block transition-colors group-hover:bg-[#0087A8]" style={{ background: "#0F172A", borderRadius: 2 }} />
        <span className="text-[16px] font-bold tracking-tight" style={{ color: "#0F172A" }}>ProofDive</span>
      </Link>

      <nav className="hidden md:flex items-center gap-0.5">
        {NAV.map((l) => {
          const active = path === l.href || path.startsWith(`${l.href}/`);
          return (
            <Link key={l.label} href={l.href}
              className="px-3.5 py-1.5 text-[13px] transition-all"
              style={{
                borderRadius: 8,
                fontWeight: active ? 600 : 450,
                color: active ? "#0F172A" : "rgba(15,23,42,0.45)",
                background: active ? "rgba(255,255,255,0.72)" : "transparent",
                boxShadow: active ? "0 1px 4px rgba(0,0,0,0.05)" : "none",
              }}>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/profile" className="text-[13px] transition-colors hover:text-[#0F172A]" style={{ color: "rgba(15,23,42,0.40)" }}>Profile</Link>
        <div className="w-7 h-7 flex items-center justify-center text-[11px] font-bold shadow-sm" style={{ borderRadius: 999, background: "#0087A8", color: "#FFF" }}>A</div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <TopNav />
      {/* Consistent top offset and horizontal padding container */}
      <main className="flex-1 pt-14 selection:bg-[#0087A8]/10 selection:text-[#0087A8]">
        {children}
      </main>
    </div>
  );
}
