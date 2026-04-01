"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export default function ConsentPage() {
  const router = useRouter();
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  return (
    <div className="min-h-screen flex w-full font-['Inter',sans-serif]">
      {/* Left Side - Auth Panel */}
      <div className="flex-1 flex flex-col relative h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-8">
          
          {/* Logo */}
          <div className="absolute top-12 left-0 right-0 flex justify-center">
            <span className="text-[28px] font-normal tracking-[0.5px] text-[#253D47]">
              ProofDive
            </span>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2 mb-10 mt-10">
            <h1 className="text-[28px] font-medium text-[#253D47]">
              Terms & Policies
            </h1>
            <p className="text-[14px] text-[#475569]">
              Please review the following terms and policies.
            </p>
          </div>

          {/* Cards Container */}
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-[660px] mx-auto">
            {/* Terms of Service Card */}
            <div className="flex-1 bg-white/40 backdrop-blur-[24px] rounded-[16px] border border-white/60 flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
              
              <div className="p-5 pb-0 flex-1 flex flex-col justify-end">
                <div className="bg-[#F8FAFC] rounded-t-[14px] p-6 pb-8 border border-b-0 border-[#E2E8F0]/50 shadow-[0_-2px_12px_rgba(0,0,0,0.02)] translate-y-2">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[14.5px] font-semibold text-[#1E293B]">Term & Services</h3>
                    <ArrowUpRight className="w-[18px] h-[18px] text-[#64748B]" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-[7px] w-[85%] bg-[#E2E8F0] rounded-full"></div>
                    <div className="h-[7px] w-full bg-[#E2E8F0] rounded-full"></div>
                    <div className="h-[7px] w-full bg-[#E2E8F0] rounded-full"></div>
                    <div className="h-[7px] w-[60%] bg-[#E2E8F0] rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white px-6 h-[60px] flex items-center border-t border-[#E2E8F0]/40 relative z-10">
                <label className="flex items-center gap-3 cursor-pointer w-full">
                  <div 
                    className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${agreedTerms ? 'border-[#0087A8] bg-[#0087A8]' : 'border-[#CBD5E1]'}`}
                    onClick={() => setAgreedTerms(!agreedTerms)}
                  >
                    {agreedTerms && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-[13px] text-[#64748B] flex gap-1">
                    I agree to the <span className="font-medium text-[#1E293B]">Term & Services</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Privacy Policy Card */}
            <div className="flex-1 bg-white/40 backdrop-blur-[24px] rounded-[16px] border border-white/60 flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
              
              <div className="p-5 pb-0 flex-1 flex flex-col justify-end">
                <div className="bg-[#F8FAFC] rounded-t-[14px] p-6 pb-8 border border-b-0 border-[#E2E8F0]/50 shadow-[0_-2px_12px_rgba(0,0,0,0.02)] translate-y-2">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[14.5px] font-semibold text-[#1E293B]">Term & Services</h3>
                    <ArrowUpRight className="w-[18px] h-[18px] text-[#64748B]" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-[7px] w-[85%] bg-[#E2E8F0] rounded-full"></div>
                    <div className="h-[7px] w-full bg-[#E2E8F0] rounded-full"></div>
                    <div className="h-[7px] w-full bg-[#E2E8F0] rounded-full"></div>
                    <div className="h-[7px] w-[60%] bg-[#E2E8F0] rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white px-6 h-[60px] flex items-center border-t border-[#E2E8F0]/40 relative z-10">
                <label className="flex items-center gap-3 cursor-pointer w-full">
                  <div 
                    className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${agreedPrivacy ? 'border-[#0087A8] bg-[#0087A8]' : 'border-[#CBD5E1]'}`}
                    onClick={() => setAgreedPrivacy(!agreedPrivacy)}
                  >
                    {agreedPrivacy && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-[13px] text-[#64748B] flex gap-1">
                    I agree to the <span className="font-medium text-[#1E293B]">Privacy policy</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={() => router.push("/dashboard")}
              disabled={!(agreedTerms && agreedPrivacy)}
              className={`px-8 h-10 rounded-[8px] font-medium text-[13px] transition-colors ${agreedTerms && agreedPrivacy ? 'bg-[#0087A8] text-white hover:bg-[#006E89] shadow-[0_2px_8px_rgba(0,135,168,0.25)]' : 'bg-[#0087A8]/80 text-white/90 cursor-not-allowed'}`}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="absolute bottom-6 left-8">
          <p className="text-[12px] text-[#475569] font-medium">
            © Proofdive 2025. All Rights Reserved
          </p>
        </div>
      </div>

      {/* Right Side - Hero Panel (matches exactly with other screens) */}
      <div className="hidden lg:flex w-[460px] h-screen relative overflow-hidden flex-shrink-0">
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
