import Link from "next/link";
import { Check, Mail, ChevronRight, CheckCircle2 } from "lucide-react";

export function ProgressTasksCard() {
  return (
    <div className="w-full bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden font-['Inter',sans-serif]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-[18px] md:text-[20px] font-bold text-[#0F172A]">Interview Readiness</h2>
      </div>

      <div className="px-6 pb-2 space-y-6">
        
        {/* Section 1 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-slate-500 font-medium">Core Preparation</span>
              <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-full">1/2</span>
            </div>
            <span className="text-[12px] text-slate-400 font-medium">In Progress</span>
          </div>

          <div className="space-y-4">
            {/* Completed Item */}
            <div className="flex items-start gap-4">
              <div className="w-5 h-5 rounded-full bg-[#0087A8] flex items-center justify-center mt-0.5 shrink-0">
                <Check size={12} strokeWidth={3} className="text-white" />
              </div>
              <div className="flex-1 flex justify-between items-center">
                 <span className="text-[15px] font-bold text-[#0F172A]">Learn the essentials</span>
                 <CheckCircle2 size={16} className="text-slate-300" />
              </div>
            </div>

            {/* In-Progress Item */}
            <div className="flex items-start gap-4">
              <div className="mt-0.5 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-[spin_3s_linear_infinite] text-[#0087A8]">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-20" />
                  <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[15px] font-bold text-[#0F172A]">Craft your story</span>
                </div>
                
                {/* Sub-items */}
                <div className="space-y-3 mt-3 pr-2 border-l-2 border-slate-100 pl-4 ml-[-4px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-slate-500 font-medium">Select a core trait</span>
                    <CheckCircle2 size={15} className="text-slate-300" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-slate-500 font-medium">Structure the STAR method</span>
                    <CheckCircle2 size={15} className="text-slate-300" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-[#0087A8] font-semibold">Refine hook and impact</span>
                    <span className="text-[13px] font-bold text-[#0087A8]">38%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-slate-500 font-medium">Practice</span>
              <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-full">0/1</span>
            </div>
            <span className="text-[12px] text-slate-400 font-medium">Queued</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-5 h-5 rounded-full border-[2px] border-slate-200 mt-0.5 shrink-0" />
            <span className="text-[15px] font-bold text-[#0F172A]">Test it in a mock</span>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-slate-100 p-4 md:px-6 flex items-center justify-between bg-slate-50/50">
        <button className="flex items-center gap-2 text-[#0087A8] hover:opacity-80 transition-opacity">
          <Mail size={16} strokeWidth={2.5} />
          <span className="text-[14px] font-bold">Contact Support</span>
        </button>
        <Link href="/mock/setup" className="text-[13px] font-bold text-[#0087A8] hover:opacity-80 transition-opacity flex items-center gap-1">
          View Path <ChevronRight size={14} />
        </Link>
      </div>

    </div>
  );
}
