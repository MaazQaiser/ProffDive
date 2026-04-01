"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── glass tokens ──────────────────────────
const G = {
  background: "rgba(255,255,255,0.52)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
} as const;
const DIV = "rgba(255,255,255,0.55)"; // inner divider colour

const ROLES = ["Product Manager","Product Designer","Software Engineer","Data Scientist","Business Analyst","UX Designer","Marketing Manager","Frontend Engineer","Backend Engineer","ML Engineer"];

export default function TestOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<"career"|"role">("career");
  const [career, setCareer] = useState<string|null>(null);
  const [bracket, setBracket] = useState<string|null>(null);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [industry, setIndustry] = useState("");
  const [showIndustry, setShowIndustry] = useState(false);

  const sugg = ROLES.filter(r => r.toLowerCase().includes(query.toLowerCase()) && query.length > 0);
  const step1Ok = career && (career !== "experienced" || bracket);
  const step2Ok = role.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {["career","role"].map((s,i) => (
            <div key={s} className="flex-1 h-0.5 transition-all" style={{
              background: i <= ["career","role"].indexOf(step) ? "#0F0F0F" : "rgba(0,0,0,0.12)",
              borderRadius: 99
            }} />
          ))}
        </div>

        {/* One glass card — content swaps inside */}
        <div style={{ ...G, borderRadius: 24, overflow: "hidden" }}>

          {step === "career" && (
            <>
              {/* Header */}
              <div className="px-7 pt-7 pb-5" style={{ borderBottom: `1px solid ${DIV}` }}>
                <p className="text-[12px] uppercase tracking-[0.18em] font-semibold mb-1.5" style={{ color: "rgba(15,15,15,0.35)" }}>Step 1 of 2</p>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: "#0F0F0F" }}>Where are you right now?</h1>
              </div>

              {/* Options — edge-to-edge rows */}
              <div>
                {([
                  { id: "fresh-grad",  label: "Fresh Graduate", sub: "Just graduated, no full-time work yet" },
                  { id: "undergrad",   label: "Undergrad",       sub: "Currently studying, internships ahead" },
                  { id: "diploma-holder", label: "Diploma Holder", sub: "Polytechnic or technical diploma" },
                  { id: "experienced", label: "Experienced",     sub: "Working professionally" },
                ] as const).map((o, i, arr) => (
                  <button key={o.id} onClick={() => { setCareer(o.id); if(o.id !== "experienced") setBracket(null); }}
                    className="w-full flex items-center gap-4 px-7 py-4 text-left hover:bg-white/40 transition-colors"
                    style={{ borderBottom: i < arr.length - 1 ? `1px solid ${DIV}` : undefined }}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0" style={{
                      borderRadius: 99, border: `1.5px solid ${career === o.id ? "#0F0F0F" : "rgba(0,0,0,0.18)"}`,
                      background: career === o.id ? "#0F0F0F" : "transparent"
                    }}>
                      {career === o.id && <div style={{ width: 6, height: 6, borderRadius: 99, background: "#FFF" }} />}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: "#0F0F0F" }}>{o.label}</p>
                      <p className="text-[11px]" style={{ color: "rgba(15,15,15,0.40)" }}>{o.sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Experience bracket — inline if experienced selected */}
              {career === "experienced" && (
                <div className="px-7 py-4" style={{ borderTop: `1px solid ${DIV}` }}>
                  <p className="text-[12px] uppercase tracking-[0.16em] font-semibold mb-3" style={{ color: "rgba(15,15,15,0.35)" }}>Years of experience</p>
                  <div className="flex gap-2">
                    {["1–5","5–10","10+"].map((b) => (
                      <button key={b} onClick={() => setBracket(b)}
                        className="flex-1 py-2.5 text-center text-[12px] font-semibold transition-all"
                        style={{
                          borderRadius: 10,
                          background: bracket === b ? "#0F0F0F" : "rgba(0,0,0,0.04)",
                          color: bracket === b ? "#FFF" : "rgba(15,15,15,0.60)"
                        }}>
                        {b} yrs
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="px-7 pb-7 pt-5" style={{ borderTop: `1px solid ${DIV}` }}>
                <button onClick={() => setStep("role")} disabled={!step1Ok}
                  className="w-full h-11 text-[13px] font-bold text-white transition-colors"
                  style={{ borderRadius: 12, background: step1Ok ? "#0087A8" : "rgba(0,0,0,0.10)", cursor: step1Ok ? "pointer" : "not-allowed" }}>
                  Continue →
                </button>
              </div>
            </>
          )}

          {step === "role" && (
            <>
              <div className="px-7 pt-7 pb-5" style={{ borderBottom: `1px solid ${DIV}` }}>
                <p className="text-[12px] uppercase tracking-[0.18em] font-semibold mb-1.5" style={{ color: "rgba(15,15,15,0.35)" }}>Step 2 of 2</p>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: "#0F0F0F" }}>What role are you targeting?</h1>
              </div>

              <div className="px-7 py-5 relative" style={{ borderBottom: `1px solid ${DIV}` }}>
                <input
                  autoFocus value={query}
                  onChange={(e) => { setQuery(e.target.value); setRole(e.target.value); setShowSugg(true); }}
                  onFocus={() => setShowSugg(true)}
                  placeholder="e.g. Product Manager"
                  className="w-full h-11 px-4 text-[13px] outline-none"
                  style={{
                    borderRadius: 12,
                    background: "rgba(0,0,0,0.04)",
                    border: "none",
                    color: "#0F0F0F",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                  }} />

                {showSugg && sugg.length > 0 && (
                  <div className="absolute left-7 right-7 top-full -mt-1 z-20 overflow-hidden" style={{
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.90)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
                  }}>
                    {sugg.slice(0,5).map((s,i) => (
                      <button key={s} onMouseDown={() => { setRole(s); setQuery(s); setShowSugg(false); }}
                        className="w-full text-left px-4 py-3 text-[13px] hover:bg-white/60 transition-colors"
                        style={{ color: "#0F0F0F", borderBottom: i < 4 ? "1px solid rgba(0,0,0,0.05)" : undefined }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Industry — ghost row */}
              <div className="px-7 py-4" style={{ borderBottom: `1px solid ${DIV}` }}>
                {!showIndustry ? (
                  <button onClick={() => setShowIndustry(true)} className="w-full text-left text-[12px] flex items-center gap-2 transition-colors hover:opacity-60"
                    style={{ color: "rgba(15,15,15,0.35)" }}>
                    <span>+</span> Add industry vertical
                    <span className="ml-auto text-[12px]">Optional</span>
                  </button>
                ) : (
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] outline-none"
                    style={{ borderRadius: 10, background: "rgba(0,0,0,0.04)", border: "none", color: "#0F0F0F" }}>
                    <option value="">Select industry</option>
                    {["Technology","Finance","Healthcare","Retail","Consulting","Education"].map(i => <option key={i}>{i}</option>)}
                  </select>
                )}
              </div>

              {/* CTAs */}
              <div className="px-7 pb-7 pt-5 flex gap-2">
                <button onClick={() => setStep("career")}
                  className="h-11 px-5 text-[13px] font-medium transition-colors"
                  style={{ borderRadius: 12, background: "rgba(0,0,0,0.05)", color: "rgba(15,15,15,0.55)" }}>
                  Back
                </button>
                <button onClick={() => router.push("/test/dashboard")} disabled={!step2Ok}
                  className="flex-1 h-11 text-[13px] font-bold text-white transition-colors"
                  style={{ borderRadius: 12, background: step2Ok ? "#0087A8" : "rgba(0,0,0,0.10)", cursor: step2Ok ? "pointer" : "not-allowed" }}>
                  Finish setup →
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
