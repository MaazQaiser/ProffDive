"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Smile, Mail, Key, Eye, EyeOff } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { StepContainer } from "@/components/step-container";

export default function SignupPage() {
  const router = useRouter();
  const { updateUser } = useUser();
  const [activeStep, setActiveStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen flex w-full font-['Inter',sans-serif]">
      {/* Left Side - Auth Panel */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#FAFEFF] to-[#CFDCE1] relative">
        <div className="flex-1 flex flex-col items-center justify-start pt-16 px-8 lg:px-[80px]">
          {/* Logo */}
          <div className="mb-20">
            <span className="text-[30px] font-normal tracking-[0.75px] text-[#253D47]">
              ProofDive
            </span>
          </div>

          <div className="w-full max-w-[480px] flex flex-col gap-3">
            {/* Google — new accounts start onboarding (same as sign-in with Google) */}
            <div className="overflow-hidden rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.06)] backdrop-blur-[21px] bg-[rgba(255,255,255,0.4)] border border-white/20 mb-2">
              <button
                type="button"
                onClick={() => router.push("/onboarding")}
                className="w-full flex flex-col items-start gap-[7px] p-[20px] hover:bg-white/10 transition-colors group text-left"
              >
                <div className="w-[28px] h-[28px] rounded-full overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
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
                <span className="text-[16px] font-medium text-[#19173D]">Sign up with Google</span>
              </button>
            </div>

            {/* Step 1: Name */}
            <StepContainer isActive={activeStep === 1} onClick={() => setActiveStep(1)}>
              {activeStep === 1 ? (
                <div className="flex flex-col gap-5">
                  <h2 className="text-center text-[22px] font-medium text-[#0087A8] mb-2">
                    Hello! {firstName || "There"}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[#253D47]">First Name</label>
                      <input 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full h-[44px] px-4 rounded-[6px] border border-[#CBD5E1] bg-transparent outline-none text-[14px] text-[#0F172A] focus:border-[#0087A8]"
                        placeholder="Enter First Name"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[#253D47]">Last Name</label>
                      <input 
                        className="w-full h-[44px] px-4 rounded-[6px] border border-[#CBD5E1] bg-transparent outline-none text-[14px] text-[#0F172A] focus:border-[#0087A8]"
                        placeholder="Enter Last Name"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      updateUser({ name: firstName });
                      setActiveStep(2);
                    }}
                    className="w-full h-[44px] mt-2 bg-[#0087A8] text-white rounded-[6px] font-medium text-[14px] hover:bg-[#006E89] transition-colors"
                  >
                    Next
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-[#475569]">
                  <Smile className="w-[18px] h-[18px]" strokeWidth={2} />
                  <span className="text-[16px] font-medium">Hello, {firstName || "Ayaan"}</span>
                </div>
              )}
            </StepContainer>

            {/* Step 2: Email */}
            <StepContainer isActive={activeStep === 2} onClick={() => setActiveStep(2)}>
              {activeStep === 2 ? (
                <div className="flex flex-col gap-5">
                  <h2 className="text-center text-[22px] font-medium text-[#0087A8] mb-2">
                    Your Email
                  </h2>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#253D47]">Email Address</label>
                    <input 
                      type="email"
                      className="w-full h-[44px] px-4 rounded-[6px] border border-[#CBD5E1] bg-transparent outline-none text-[14px] text-[#0F172A] focus:border-[#0087A8]"
                      placeholder="Enter your email"
                    />
                  </div>
                  <button 
                    onClick={() => setActiveStep(3)}
                    className="w-full h-[44px] mt-2 bg-[#0087A8] text-white rounded-[6px] font-medium text-[14px] hover:bg-[#006E89] transition-colors"
                  >
                    Next
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-[#475569]">
                  <Mail className="w-[18px] h-[18px]" strokeWidth={2} />
                  <span className="text-[16px] font-medium">Email</span>
                </div>
              )}
            </StepContainer>

            {/* Step 3: Password */}
            <StepContainer isActive={activeStep === 3} onClick={() => setActiveStep(3)}>
              {activeStep === 3 ? (
                <div className="flex flex-col gap-5">
                  <h2 className="text-center text-[22px] font-medium text-[#0087A8] mb-2">
                    Secure Account
                  </h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[#253D47]">Create Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          className="w-full h-[44px] px-4 pr-10 rounded-[6px] border border-[#CBD5E1] bg-transparent outline-none text-[14px] text-[#0F172A] focus:border-[#0087A8]"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[#253D47]">Confirm Password</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full h-[44px] px-4 pr-10 rounded-[6px] border border-[#CBD5E1] bg-transparent outline-none text-[14px] text-[#0F172A] focus:border-[#0087A8]"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      router.push("/onboarding");
                    }}
                    className="w-full h-[44px] mt-2 bg-[#0087A8] text-white rounded-[6px] font-medium text-[14px] hover:bg-[#006E89] transition-colors shadow-lg shadow-[#0087A8]/20"
                  >
                    Enter ProofDive
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-[#475569]">
                  <Key className="w-[18px] h-[18px]" strokeWidth={2} />
                  <span className="text-[16px] font-medium">Create Password</span>
                </div>
              )}
            </StepContainer>
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
      <div className="hidden lg:flex w-[460px] h-screen relative overflow-hidden">
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
