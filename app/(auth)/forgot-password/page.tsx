"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { requestPasswordReset } from "@/lib/password-reset";
import { useUser } from "@/lib/user-context";

export default function ForgotPasswordPage() {
  const { user, updateUser } = useUser();
  const [email, setEmail] = useState(user.email ?? "");
  const [submitted, setSubmitted] = useState<null | { resetUrl: string }>(null);
  const [error, setError] = useState<string | null>(null);

  const helper = useMemo(() => {
    if (!submitted) return "";
    return submitted.resetUrl;
  }, [submitted]);

  return (
    <div className="min-h-screen flex w-full font-['Inter',sans-serif]">
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#FAFEFF] to-[#CFDCE1] relative">
        <div className="flex-1 flex flex-col items-start justify-center px-8 lg:px-[172px]">
          <div className="w-full max-w-[636px] overflow-hidden rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.06)] backdrop-blur-[21px] bg-[rgba(255,255,255,0.4)] border border-white/20 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="opacity-70">
                  <path
                    d="M15 18l-6-6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back to sign in
              </Link>
            </div>
            {!submitted ? (
              <>
                <label className="block space-y-2">
                  <span className="text-[12px] tracking-normal text-[#64748B]">Email</span>
                  <input
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    type="email"
                    placeholder="you@domain.com"
                    className="w-full h-11 px-4 rounded-[10px] border border-[#0F172A]/10 bg-white/60 focus:outline-none focus:border-[#0087A8]/50"
                  />
                </label>
                {error ? <div className="text-[12px] text-[#B91C1C]">{error}</div> : null}
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = email.trim();
                    if (!trimmed || !trimmed.includes("@")) {
                      setError("Enter a valid email address.");
                      return;
                    }
                    const rec = requestPasswordReset(trimmed);
                    updateUser({
                      email: trimmed,
                      accountStatus: { ...(user.accountStatus ?? {}), passwordResetLastRequestedAt: rec.createdAt },
                    });
                    const resetUrl = `/reset-password?token=${encodeURIComponent(rec.token)}`;
                    setSubmitted({ resetUrl });
                  }}
                  className="w-full h-11 rounded-[10px] bg-[#0087A8] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                >
                  Generate reset link
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-[14px] font-semibold text-[#0F172A]">Reset link sent</div>
                <div className="text-[13px] text-[#475569] max-w-[60ch]">
                  Check your email for a secure link to reset your password.
                </div>
                <Link
                  href={helper || "/reset-password"}
                  className="h-11 px-4 inline-flex items-center justify-center rounded-[10px] bg-[#0087A8] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                >
                  Reset password
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

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

