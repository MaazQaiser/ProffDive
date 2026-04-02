"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { JdResumeInput } from "@/components/JdResumeInput";
import { StepContainer } from "@/components/step-container";
import { useUser } from "@/lib/user-context";

type Step = 1 | 2;
type CareerChoice = "fresh-grad" | "undergrad" | "experienced" | "diploma-holder" | null;
type ExpBracket = "1-5" | "5-10" | "10+" | null;

const ROLES = ["Product Manager","Product Designer","UX Designer","Software Engineer","Frontend Engineer","Backend Engineer","Data Scientist","Data Analyst","Business Analyst","Marketing Manager","Growth Manager","Operations Manager","Strategy Consultant","Machine Learning Engineer"];
const INDUSTRIES = ["Technology / Software","Finance / Banking","E-Commerce / Retail","Healthcare","Consulting","Media / Entertainment","Education","Government","Manufacturing","Other"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  
  // State
  const [activeStep, setActiveStep] = useState<Step>(1);
  const [career, setCareer] = useState<CareerChoice>(null);
  const [bracket, setBracket] = useState<ExpBracket>(null);
  const [role, setRole] = useState("");
  const [query, setQuery] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [showInd, setShowInd] = useState(false);
  const [industry, setIndustry] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  
  const roleRef = useRef<HTMLInputElement>(null);
  const sugg = ROLES.filter(r => r.toLowerCase().includes(query.toLowerCase()) && query.length > 0);

  const canContinueCareer = career !== null && (career !== "experienced" || bracket !== null);
  const canContinueRole = role.trim().length > 0;

  useEffect(() => {
    const h = (e: MouseEvent) => { 
      if (!roleRef.current?.closest(".role-wrap")?.contains(e.target as Node)) setShowSugg(false); 
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleFinish = () => {
    updateUser({
      name: user.name ?? "",
      career,
      bracket,
      role,
      industry,
      jd,
      resume,
      onboarded: true,
    });
    router.push("/consent");
  };

  const getCareerLabel = () => {
    if (career === "fresh-grad") return "Fresh Graduate";
    if (career === "undergrad") return "Undergrad";
    if (career === "diploma-holder") return "Diploma Holder";
    if (career === "experienced") return `Experienced (${bracket || ""} yrs)`;
    return "Career Stage";
  };

  return (
    <div className="min-h-screen flex w-full font-['Inter',sans-serif]">
      {/* Left Side - Auth Panel */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#FAFEFF] to-[#CFDCE1] relative h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-start pt-16 px-8 lg:px-[80px] pb-32">
          {/* Logo */}
          <div className="mb-12">
            <span className="text-[30px] font-normal tracking-[0.75px] text-[#253D47]">
              ProofDive
            </span>
          </div>

          {/* New Personalization Header */}
          <div className="w-full max-w-[520px] text-center mb-10 space-y-2">
            <h1 className="flex justify-center items-center w-full text-[24px] font-semibold text-[#0F172A] leading-tight">
              Welcome{user.name ? `, ${user.name}` : ""}! Let’s personalize your experience.
            </h1>
            <p className="text-[14px] text-[#475569] leading-relaxed max-w-[420px] mx-auto">
              Share a few details to help us tailor your coaching and identify your best career path.
            </p>
          </div>

          <div className="w-full max-w-[480px] relative">
            <div className="flex flex-col gap-8 relative z-10">
              {/* Step 1: Career */}
                <StepContainer isActive={activeStep === 1} onClick={() => setActiveStep(1)}>
                  {activeStep === 1 ? (
                    <div className="flex flex-col gap-5">
                      <div className="text-left space-y-1">
                        <h2 className="text-[17px] font-bold text-[#0F172A]">Career Stage</h2>
                        <p className="text-[12px] text-slate-500">Tailors the seniority of your mock interviews.</p>
                      </div>
                      
                      <div className="space-y-2 mt-1">
                        {([
                          { id: "fresh-grad", label: "Fresh Graduate", sub: "No full-time experience yet" },
                          { id: "undergrad",  label: "Undergrad",      sub: "Currently studying" },
                          { id: "diploma-holder", label: "Diploma Holder", sub: "Polytechnic or technical diploma" },
                          { id: "experienced",label: "Experienced",    sub: "Working professionally" },
                        ] as { id: CareerChoice; label: string; sub: string }[]).map((o) => (
                          <button key={o.id!} onClick={() => { setCareer(o.id); if (o.id !== "experienced") { setBracket(null); setResume(""); } }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-xl border transition-all ${career === o.id ? 'bg-[#E6F6F9] border-[#0087A8] shadow-sm' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                          >
                            <div className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${career === o.id ? 'border-[#0087A8]' : 'border-slate-300'}`}>
                               {career === o.id && <div className="w-1.5 h-1.5 bg-[#0087A8] rounded-full" />}
                            </div>
                            <div>
                              <p className={`text-[13px] font-bold ${career === o.id ? 'text-[#0087A8]' : 'text-[#0F172A]'}`}>{o.label}</p>
                              <p className="text-[11px] text-slate-500">{o.sub}</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {career === "experienced" && (
                        <div className="pt-3 border-t border-slate-100 space-y-4">
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Years of experience</p>
                            <div className="grid grid-cols-3 gap-2">
                              {(["1-5","5-10","10+"] as ExpBracket[]).map(b => (
                                <button key={b!} onClick={() => setBracket(b)}
                                  className={`py-2.5 text-[12px] font-bold rounded-xl border transition-all ${bracket === b ? 'bg-[#0087A8] text-white border-[#0087A8] shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-[#0087A8]/30'}`}
                                >
                                  {b} yrs
                                </button>
                              ))}
                            </div>
                          </div>

                          {bracket !== null && (
                            <div className="pt-2 border-t border-slate-100">
                              <JdResumeInput
                                label="Add Resume ( optional)"
                                placeholder="Paste or upload your resume—we use it to tailor mock interviews and feedback."
                                value={resume}
                                onChange={setResume}
                                onRemove={() => setResume("")}
                                compact
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <button 
                        onClick={() => setActiveStep(2)}
                        disabled={!canContinueCareer}
                        className={`w-full h-[46px] mt-2 rounded-xl font-bold text-[14px] transition-all shadow-lg ${canContinueCareer ? 'bg-[#0087A8] text-white hover:bg-[#006E89] shadow-[#0087A8]/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        Confirm career stage
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex items-center">
                      <span className={`text-[16px] font-semibold ${career ? 'text-[#0F172A]' : 'text-slate-400'}`}>{career ? getCareerLabel() : "Career Stage"}</span>
                    </div>
                  )}
                </StepContainer>

              {/* Step 2: Role */}
                <StepContainer isActive={activeStep === 2} onClick={() => canContinueCareer && setActiveStep(2)}>
                  {activeStep === 2 ? (
                    <div className="flex flex-col gap-4">
                      <div className="text-left space-y-1">
                        <h2 className="text-[17px] font-bold text-[#0F172A]">Target Role</h2>
                        <p className="text-[12px] text-slate-500">Pick the specific role you are interviewing for.</p>
                      </div>
                      
                      <div className="flex flex-col gap-2 role-wrap relative mt-1">
                        <input 
                          ref={roleRef}
                          value={query}
                          onChange={e => { setQuery(e.target.value); setRole(e.target.value); setShowSugg(true); }}
                          onFocus={() => setShowSugg(true)}
                          className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white/60 outline-none text-[14px] text-[#0F172A] focus:border-[#0087A8] focus:bg-white transition-all shadow-sm"
                          placeholder="e.g. Product Manager"
                        />
                        {showSugg && sugg.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-white shadow-xl rounded-xl border border-slate-100 overflow-hidden">
                            {sugg.slice(0,5).map((s) => (
                              <button key={s} onMouseDown={() => { setRole(s); setQuery(s); setShowSugg(false); }}
                                className="w-full text-left px-4 py-3.5 text-[13px] font-medium hover:bg-[#F8FAFC] text-[#0F172A] border-b border-slate-50 last:border-0 transition-colors"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Optional context */}
                      <div className="pt-2 space-y-3">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Optional context</p>
                        <div className="space-y-3">
                          {!showInd ? (
                            <button onClick={() => setShowInd(true)} className="text-[12px] text-[#0087A8] hover:underline font-bold flex items-center gap-2">
                              + Add industry vertical
                            </button>
                          ) : (
                            <select 
                              value={industry} 
                              onChange={e => setIndustry(e.target.value)}
                              className="w-full h-[42px] px-3 rounded-xl border border-slate-200 bg-white/60 outline-none text-[13px] text-[#0F172A] focus:border-[#0087A8] focus:bg-white transition-all"
                            >
                              <option value="">Select industry</option>
                              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                          )}

                          {!showJD ? (
                            <button onClick={() => setShowJD(true)} className="text-[12px] text-[#0087A8] hover:underline font-bold flex items-center gap-2">
                              + Add job description
                            </button>
                          ) : (
                            <JdResumeInput
                              label="Job Description"
                              placeholder="Paste or upload JD for tailored questions..."
                              value={jd}
                              onChange={setJd}
                              onRemove={() => { setShowJD(false); setJd(""); }}
                              compact
                            />
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={handleFinish}
                        disabled={!canContinueRole}
                        className={`w-full h-[46px] mt-2 rounded-xl font-bold text-[14px] transition-all shadow-lg ${canContinueRole ? 'bg-[#0087A8] text-white hover:bg-[#006E89] shadow-[#0087A8]/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        Complete Onboarding
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex items-center">
                      <span className={`text-[16px] font-semibold ${role ? 'text-[#0F172A]' : 'text-slate-400'}`}>{role || "Target Role"}</span>
                    </div>
                  )}
                </StepContainer>

            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Panel */}
      <div className="hidden lg:flex w-[460px] h-screen relative overflow-hidden flex-shrink-0">
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
