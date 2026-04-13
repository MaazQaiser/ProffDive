"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Urbanist } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import { useUser } from "@/lib/user-context";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

export default function ConsentPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  const greetingFirstName = useMemo(() => {
    const n = (user.name ?? "").trim().split(/\s+/).filter(Boolean)[0];
    return n ?? "";
  }, [user.name]);

  const canContinue = agreedTerms && agreedPrivacy;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen w-full font-['Inter',sans-serif]">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-b from-[#FAFEFF] to-[#CFDCE1] pt-10 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-10">
        <div
          className={`${urbanist.className} relative flex min-h-0 flex-1 flex-col items-center px-6 pb-16 pt-0 sm:px-10 sm:pb-20 lg:px-[80px] lg:pb-24`}
        >
          <div className="mb-8 w-full max-w-[480px] shrink-0 text-left sm:mb-10 sm:max-w-[640px]">
            <span className="text-[28px] font-normal tracking-[0.75px] text-[#253D47] sm:text-[30px]">
              ProofDive
            </span>
          </div>

          <div className="w-full max-w-[480px] shrink-0 text-left sm:max-w-[640px]">
            <h1 className="text-[24px] font-semibold leading-[1.2] tracking-tight text-[#0F172A] sm:text-[28px]">
              {isLoaded && greetingFirstName ? (
                <>
                  You&apos;re almost in,{" "}
                  <span className="font-semibold text-[#0087A8]">{greetingFirstName}</span>
                </>
              ) : (
                <>You&apos;re almost in</>
              )}
            </h1>
            <p className="mt-3 max-w-[42ch] text-[15px] font-medium leading-relaxed text-[#64748B] sm:text-[16px]">
              Quick legal stuff — we keep it straightforward.
            </p>

            <div className="mt-8 flex w-full flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-4 lg:gap-5">
              <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0.45)_100%)] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.05)] backdrop-blur-[40px]">
                <div className="p-5 pb-0">
                  <div className="rounded-t-xl border border-b-0 border-[#E2E8F0]/50 bg-[#F8FAFC] p-5 pb-6 shadow-[0_-2px_12px_rgba(0,0,0,0.02)]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2 className="text-left text-[14px] font-semibold text-[#0F172A]">Terms of Service</h2>
                      <ArrowUpRight className="h-[18px] w-[18px] shrink-0 text-[#64748B]" aria-hidden />
                    </div>
                    <div className="space-y-2.5">
                      <div className="h-[7px] w-[85%] rounded-full bg-[#E2E8F0]" />
                      <div className="h-[7px] w-full rounded-full bg-[#E2E8F0]" />
                      <div className="h-[7px] w-full rounded-full bg-[#E2E8F0]" />
                      <div className="h-[7px] w-[60%] rounded-full bg-[#E2E8F0]" />
                    </div>
                  </div>
                </div>
                <div className="flex min-h-[56px] items-center border-t border-[#E2E8F0]/40 bg-white/80 px-5 py-3">
                  <label className="flex w-full cursor-pointer items-start gap-3 text-left">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#0087A8]"
                    />
                    <span className="text-[13px] leading-snug text-[#64748B]">
                      I&apos;ve read and agree to the{" "}
                      <span className="font-semibold text-[#0F172A]">Terms of Service</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0.45)_100%)] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.05)] backdrop-blur-[40px]">
                <div className="p-5 pb-0">
                  <div className="rounded-t-xl border border-b-0 border-[#E2E8F0]/50 bg-[#F8FAFC] p-5 pb-6 shadow-[0_-2px_12px_rgba(0,0,0,0.02)]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2 className="text-left text-[14px] font-semibold text-[#0F172A]">Privacy Policy</h2>
                      <ArrowUpRight className="h-[18px] w-[18px] shrink-0 text-[#64748B]" aria-hidden />
                    </div>
                    <div className="space-y-2.5">
                      <div className="h-[7px] w-[85%] rounded-full bg-[#E2E8F0]" />
                      <div className="h-[7px] w-full rounded-full bg-[#E2E8F0]" />
                      <div className="h-[7px] w-full rounded-full bg-[#E2E8F0]" />
                      <div className="h-[7px] w-[60%] rounded-full bg-[#E2E8F0]" />
                    </div>
                  </div>
                </div>
                <div className="flex min-h-[56px] items-center border-t border-[#E2E8F0]/40 bg-white/80 px-5 py-3">
                  <label className="flex w-full cursor-pointer items-start gap-3 text-left">
                    <input
                      type="checkbox"
                      checked={agreedPrivacy}
                      onChange={(e) => setAgreedPrivacy(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#0087A8]"
                    />
                    <span className="text-[13px] leading-snug text-[#64748B]">
                      I&apos;ve read and agree to the{" "}
                      <span className="font-semibold text-[#0F172A]">Privacy Policy</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className={`mt-10 h-[46px] w-full rounded-xl text-[14px] font-bold shadow-lg transition-all ${
                canContinue
                  ? "bg-[#0087A8] text-white shadow-[#0087A8]/20 hover:bg-[#006E89]"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              I&apos;m in — start my prep
            </button>

            <p className="mt-12 text-left text-[12px] font-medium text-[#64748B]">
              © ProofDive 2026. All rights reserved
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden h-screen w-[460px] shrink-0 overflow-hidden lg:flex">
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
