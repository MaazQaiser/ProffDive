"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, PlusCircle, Play, X, Layers, Info } from "lucide-react";
import { useUser } from "@/lib/user-context";

// --- Design Tokens ---
const TEAL = "#0087A8";
const G: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.80)",
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(0,0,0,0.03)",
};

// --- Mock Data ---
const initialStories = [
  { 
    id: "1", 
    role: "Senior Software Engineer", 
    summary: "Architecting a high-throughput distributed caching layer using Redis and event-driven invalidation to reduce latency by 45%.", 
    status: "complete" 
  },
  { 
    id: "2", 
    role: "Technical Lead", 
    summary: "How I led a cross-functional team to reduce latency by 40% through a custom Redis implementation and cache-aside strategy.", 
    status: "complete" 
  },
  { 
    id: "3", 
    role: "Frontend Engineer", 
    summary: "Navigating a major production outage during peak traffic and the systematic approach I took to restore services in under 2 hours.", 
    status: "draft" 
  },
];

export default function StoryBoardPage() {
  const { user } = useUser();
  const [stories, setStories] = useState(initialStories); // Set to [] for zero state testing
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 py-12 space-y-12 animate-in fade-in duration-700 relative min-h-[calc(100vh-80px)]">
      
      {/* Page Header - Centered */}
      <div className="text-center space-y-3 mb-10 animate-in slide-in-from-bottom-2 fade-in duration-700">
        <p className="text-[16px] font-medium text-[#0F172A]">Hi {user.name} 👋</p>
        <h1 className="text-[36px] font-semibold tracking-tight text-[#0F172A] leading-tight">Storyboard Arsenal</h1>
        <p className="text-[14px] text-slate-500 leading-relaxed max-w-[540px] mx-auto">
          Structured stories that highlight your impact. Use the CAR framework to build high-conviction responses.
        </p>
      </div>

      {stories.length === 0 ? (
        /* ZERO STATE */
        <div style={G} className="flex flex-col items-center justify-center py-24 px-10 text-center max-w-[800px] mx-auto">
          <div className="w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 shadow-xl shadow-teal-900/5 bg-white">
            <Layers size={28} style={{ color: TEAL }} />
          </div>
          <h2 className="text-xl font-bold mb-3 text-[#0F172A]">No stories yet</h2>
          <p className="text-[14px] max-w-[400px] mb-8 leading-relaxed text-slate-500">
            We'll guide you through extracting your best professional experiences and shaping them for peak impact.
          </p>
          <Link href="/storyboard/new"
            className="h-11 px-8 text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-xl shadow-teal-900/20"
            style={{ borderRadius: 12, background: TEAL }}>
            Build my first story
          </Link>
        </div>
      ) : (
        /* HORIZONTAL STORY CARDS */
        <div className="flex flex-col gap-4 max-w-[840px] mx-auto relative z-10">
          {stories.map((s) => (
            <Link key={s.id} href={`/storyboard/${s.id}`} className="group block">
              <div style={G} className="p-7 transition-all group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-200/50 group-hover:-translate-y-0.5 relative">
                 <h2 className="text-[18px] font-bold text-[#0F172A] group-hover:text-[#0087A8] transition-colors mb-2">
                    {s.role}
                 </h2>
                 <p className="text-[15px] text-slate-500 leading-relaxed line-clamp-2 pr-32">
                    {s.summary}
                 </p>
                 
                 <div className="absolute bottom-5 right-6 flex items-center text-[13px] font-bold text-[#0087A8] opacity-60 group-hover:opacity-100 transition-all">
                    View Story <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1" />
                 </div>
              </div>
            </Link>
          ))}

          {/* Bottom Action */}
          <div className="mt-8 flex justify-center pb-20">
             <Link href="/storyboard/new" className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-[13px] font-bold text-slate-500 hover:text-[#0F172A] hover:bg-white transition-colors border border-slate-200 shadow-sm border-dashed">
                <PlusCircle size={16} className="mr-2" />
                Create Story Board
             </Link>
          </div>
        </div>
      )}

      {/* Floating Info Button Container - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-2 group">
        <div className="bg-slate-800 text-white text-[11px] font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg transform translate-y-1">
          Learn the CAR Framework
        </div>
        <button 
          onClick={() => setShowGuide(true)} 
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-200 text-slate-400 hover:text-[#0087A8] hover:border-[#0087A8]/30 transition-all"
        >
          <Info size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowGuide(false)}>
          <div className="relative w-full max-w-[640px] overflow-hidden" style={{ ...G, background: "white" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowGuide(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 z-10 transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
            
            <div className="relative w-full aspect-video bg-slate-100 group-modal cursor-pointer flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200')" }} />
              <div className="absolute inset-0 bg-slate-900/20" />
              <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl z-10 bg-white/20 border border-white/40">
                <Play size={28} fill="currentColor" className="text-white ml-1" />
              </div>
            </div>

            <div className="p-10">
              <h3 className="text-2xl font-bold mb-4 text-[#0F172A]">The CAR Framework</h3>
              <p className="text-[15px] leading-relaxed mb-8 text-slate-500">
                A Story Board organizes your past experiences into structural frameworks that interviewers look for. By breaking down your experience into <strong>Context</strong>, <strong>Action</strong>, and <strong>Result</strong>, you guarantee a structured answer every time.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#0087A8]">Context</p>
                  <p className="text-[12px] text-slate-500 leading-snug">The stakes, the constraints, and the situation.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#0087A8]">Action</p>
                  <p className="text-[12px] text-slate-500 leading-snug">What <em>you</em> specifically did to solve the problem.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#0087A8]">Result</p>
                  <p className="text-[12px] text-slate-500 leading-snug">The quantified impact of your specific decision.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
