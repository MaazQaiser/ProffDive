"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** Email sign-in: existing (onboarded) users → returning dashboard; new users → onboarding. */
function postEmailSignInPath(): string {
  if (typeof window === "undefined") return "/onboarding";
  try {
    const saved = localStorage.getItem("proofdive_user");
    if (saved) {
      const parsed = JSON.parse(saved) as { onboarded?: boolean };
      if (parsed.onboarded) return "/dashboard/returning";
    }
  } catch {
    /* ignore corrupt storage */
  }
  return "/onboarding";
}

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex w-full font-['Inter',sans-serif]">
      {/* Left Side - Auth Panel */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#FAFEFF] to-[#CFDCE1] relative">
        <div className="flex-1 flex flex-col items-start justify-center px-8 lg:px-[172px]">
          {/* Logo */}
          <div className="flex items-center mb-12">
            <span className="text-[30px] font-normal tracking-[0.75px] text-[#253D47]">
              ProofDive
            </span>
          </div>

          {/* Heading */}
          <div className="mb-12 space-y-2">
            <h2 className="text-[28px] font-normal text-[#253D47] leading-relaxed">
              Practice with proof.
            </h2>
            <h1 className="text-[32px] font-medium text-[#253D47] leading-tight">
              Get clear, structured coaching feedback
            </h1>
          </div>

          {/* Auth Card */}
          <div className="w-full max-w-[636px] overflow-hidden rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.06)] backdrop-blur-[21px] bg-[rgba(255,255,255,0.4)] border border-white/20">
            {/* Google Login */}
            <button
              onClick={() => {
                router.push("/onboarding");
              }}
              className="w-full flex flex-col items-start gap-[7px] p-[20px] hover:bg-white/10 transition-colors group"
            >
              <div className="w-[28px] h-[28px] rounded-full overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <span className="text-[16px] font-medium text-[#19173D]">
                Sign In with google
              </span>
            </button>

            {/* Email Login */}
            <button
              onClick={() => {
                router.push(postEmailSignInPath());
              }}
              className="w-full flex flex-col items-start gap-[12px] p-[20px] border-t border-[#CBD5E1] hover:bg-white/10 transition-colors group"
            >
              <div className="w-[24px] h-[24px] text-[#253D47]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-mail w-full h-full"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <span className="text-[16px] font-medium text-[#19173D]">
                Sign In with Email
              </span>
            </button>
          </div>

          {/* Ghost entry — AI-native Proofy flow (does not change default sign-in) */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => router.push("/onboarding/ai")}
              className="text-[13px] text-[#64748B] hover:text-[#0087A8] transition-colors underline-offset-4 decoration-slate-300/80 hover:decoration-[#0087A8]/50 underline"
            >
              Experience AI-native onboarding with Proofy
            </button>
          </div>

          {/* Footer Link */}
          <div className="mt-8 flex gap-2 text-[16px]">
            <span className="text-[#475569]">New to ProofDive.com</span>
            <Link
              href="/signup"
              className="text-[#0F172A] font-medium underline underline-offset-4 decoration-1"
            >
              Sign up for free
            </Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="absolute bottom-0 left-0 w-full px-8 py-[18px]">
          <p className="text-[14px] text-[#475569] font-medium">
            © ProofDive 2025. All Rights Reserved
          </p>
        </div>
      </div>

      {/* Right Side - Hero Panel */}
      <div className="hidden md:flex w-[460px] h-screen relative overflow-hidden bg-white/30">
        <img
          src="/login_hero_final.png"
          alt="Turn experience into proof"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
