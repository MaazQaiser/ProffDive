"use client";
import { useState } from "react";
import Image from "next/image";
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
            © Proofdive 2025. All Rights Reserved
          </p>
        </div>
      </div>

      {/* Right Side - Hero Panel */}
      <div className="hidden lg:flex w-[460px] h-screen relative overflow-hidden">
        <Image
          src="/login_hero_final.png"
          alt="Turn experience into proof"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
