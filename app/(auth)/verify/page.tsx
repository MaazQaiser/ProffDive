"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const G: React.CSSProperties = {
  background: "rgba(255,255,255,0.52)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 24,
  boxShadow: "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.88)",
};
const D = "1px solid rgba(255,255,255,0.55)";

export default function VerifyEmailPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <span className="w-1.5 h-5 inline-block" style={{ background: "#0F0F0F", borderRadius: 2 }} />
          <span className="text-[16px] font-bold tracking-tight" style={{ color: "#0F0F0F" }}>ProofDive</span>
        </div>

        {/* Card */}
        <div style={G} className="overflow-hidden text-center">
          {/* Header */}
          <div className="px-7 pt-9 pb-6" style={{ borderBottom: D }}>
            <div className="w-16 h-16 bg-white/60 shadow-sm border border-white/80 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[#0087A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "#0F0F0F" }}>Verify your email</h1>
            <p className="text-[14px] leading-relaxed mx-auto max-w-[280px]" style={{ color: "rgba(15,15,15,0.6)" }}>
              We&apos;ve sent a verification link to <strong className="font-semibold text-gray-900">alex@example.com</strong>.
            </p>
          </div>

          <div className="px-7 py-6" style={{ borderBottom: D }}>
            <p className="text-[13px] leading-relaxed text-left mb-5" style={{ color: "rgba(15,15,15,0.7)" }}>
              Please check your inbox and click the secure link to verify your address. This helps us ensure the security of your account and gives you full access to ProofDive&apos;s features.
            </p>
            
            {/* Ghost Click for Demo purposes */}
            <button
              onClick={() => router.push("/onboarding")}
              className="w-full h-11 text-[13px] font-bold transition-all"
              style={{ 
                borderRadius: 10, 
                background: "rgba(0,135,168,0.08)", 
                border: "1px dashed rgba(0,135,168,0.3)",
                color: "#0087A8" 
              }}>
              (Ghost Click) Verify Email
            </button>
          </div>

          {/* Resend / Help */}
          <div className="px-7 py-5 bg-white/20">
            <p className="text-[12px]" style={{ color: "rgba(15,15,15,0.45)" }}>
              Didn&apos;t receive the email?{" "}
              <button className="font-semibold transition-colors hover:text-[#0087A8]" style={{ color: "#0F0F0F" }}>
                Click to resend
              </button>
            </p>
            <p className="text-[12px] mt-2" style={{ color: "rgba(15,15,15,0.45)" }}>
              <Link href="/login" className="hover:text-[#0F0F0F] transition-colors">&larr; Back to sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
