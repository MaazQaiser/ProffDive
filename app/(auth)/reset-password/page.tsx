"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { consumeResetToken, validateResetToken } from "@/lib/password-reset";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  const record = useMemo(() => (token ? validateResetToken(token) : null), [token]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  return (
    <div className="flex min-h-screen w-full font-sans">
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#FAFEFF] to-[#CFDCE1] relative">
        <div className="flex-1 flex flex-col items-start justify-center px-8 lg:px-[172px]">
          {done ? (
            <div className="w-full max-w-[636px] flex flex-col items-start text-left gap-4">
              <div className="w-[88px] h-[88px] rounded-full bg-[#22C55E] shadow-[0px_10px_30px_rgba(34,197,94,0.25)] flex items-center justify-center ring-2 ring-white/70">
                <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden className="text-white">
                  <path
                    d="M20 6L9 17l-5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-[28px] font-semibold text-[#0F172A] leading-tight">Password reset successfully</div>
              <div className="text-[14px] text-[#475569] max-w-[60ch]">
                Your password has been updated. You can sign in now.
              </div>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="h-11 px-5 rounded-[10px] bg-[#0087A8] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                Sign in now
              </button>
            </div>
          ) : (
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
              {!record ? (
                <div className="space-y-3">
                  <div className="text-[14px] font-semibold text-[#0F172A]">This reset link isn’t valid</div>
                  <div className="text-[13px] text-[#475569] max-w-[60ch]">
                    It may have expired, been used already, or been copied incorrectly.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/forgot-password"
                      className="h-10 px-4 inline-flex items-center justify-center rounded-[10px] bg-[#0087A8] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
                    >
                      Generate a new link
                    </Link>
                    <Link
                      href="/login"
                      className="h-10 px-4 inline-flex items-center justify-center rounded-[10px] border border-[#0F172A]/10 text-[13px] font-semibold text-[#0F172A] hover:bg-[#0F172A]/5 transition-colors"
                    >
                      Back to sign in
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <label className="block space-y-2">
                    <span className="text-[12px] tracking-normal text-[#64748B]">New password</span>
                    <div className="relative">
                      <input
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                        }}
                        type={showPassword ? "text" : "password"}
                        className="w-full h-11 px-4 pr-11 rounded-[10px] border border-[#0F172A]/10 bg-white/60 focus:outline-none focus:border-[#0087A8]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                            <path
                              d="M2 2l20 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9.88 5.09A10.94 10.94 0 0112 5c7 0 10 7 10 7a17.76 17.76 0 01-4.02 5.11"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M6.23 6.23A17.64 17.64 0 002 12s3 7 10 7a10.74 10.74 0 005.27-1.38"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                            <path
                              d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-[12px] tracking-normal text-[#64748B]">Confirm password</span>
                    <div className="relative">
                      <input
                        value={confirm}
                        onChange={(e) => {
                          setConfirm(e.target.value);
                          setError(null);
                        }}
                        type={showConfirm ? "text" : "password"}
                        className="w-full h-11 px-4 pr-11 rounded-[10px] border border-[#0F172A]/10 bg-white/60 focus:outline-none focus:border-[#0087A8]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                            <path
                              d="M2 2l20 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9.88 5.09A10.94 10.94 0 0112 5c7 0 10 7 10 7a17.76 17.76 0 01-4.02 5.11"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M6.23 6.23A17.64 17.64 0 002 12s3 7 10 7a10.74 10.74 0 005.27-1.38"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                            <path
                              d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </label>
                  {error ? <div className="text-[12px] text-[#B91C1C]">{error}</div> : null}
                  <button
                    type="button"
                    onClick={() => {
                      if (password.length < 8) {
                        setError("Use at least 8 characters.");
                        return;
                      }
                      if (password !== confirm) {
                        setError("Passwords don’t match.");
                        return;
                      }
                      consumeResetToken(record.token);
                      setDone(true);
                    }}
                    className="w-full h-11 rounded-[10px] bg-[#0087A8] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    Update password
                  </button>
                </>
              )}
            </div>
          )}
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

