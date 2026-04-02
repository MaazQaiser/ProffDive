"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Download, Edit3, ChevronDown, Save } from "lucide-react";

// --- Tokens ---
const TEAL = "#0087A8";
const G: React.CSSProperties = {
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.88)",
};

const INITIAL_STORY = {
  meta: "Mastery Pillar • Updated 2 days ago",
  sections: [
    {
      id: "intro",
      title: "Core Introduction",
      content: "As the Lead Backend Engineer at FintechX, I was the primary technical owner for the core payment processing pipeline, handling over $5M in daily transactions.",
      car: {
        context: "The system was stable but struggling under new load, causing intermittent 502 errors.",
        action: "I proposed a complete overhaul of our caching layer.",
        result: "Reduced average request latency by 45% and eliminated timeouts."
      }
    },
    {
      id: "thinking",
      title: "Problem Diagnosis & Thinking",
      content: "During Q2, our transaction volume spiked by 3x. Instead of immediately scaling up our database instances, I ran a week-long profiling audit using Datadog. I discovered that 80% of our slow queries were redundant reads on merchant configuration profiles, which rarely changed but were being queried on every single transaction.",
      car: {
        context: "Sudden 3x volume spike led to DB bottlenecks and high costs.",
        action: "Profiled the system for 1 week and identified redundant read patterns on config data.",
        result: "Pinpointed the exact bottleneck, saving $2k/mo in unnecessary database scaling."
      }
    },
    {
      id: "action",
      title: "Execution & Action",
      content: "I designed and implemented a distributed Redis caching layer. I had to ensure cache invalidation was perfect, so I built an event-driven pub/sub mechanism that listened to merchant update events to clear stale cache. I led a 2-person squad to deploy this behind a feature flag, migrating 10% of traffic initially to monitor error rates.",
      car: {
        context: "Needed to implement caching without risking stale financial data.",
        action: "Built a Redis layer with an event-driven pub/sub invalidation strategy and rolled out via feature flags.",
        result: "Successfully deployed to 10% traffic with 0 errors before full rollout."
      }
    },
    {
      id: "people",
      title: "People & Collaboration",
      content: "The main challenge was convincing the risk team, who were deeply fearful of caching financial metadata. I created a sandbox environment and demonstrated the invalidation logic live. By showing them how a configuration change immediately propagated and cleared the cache, I won their approval to proceed.",
      car: {
        context: "Risk team actively blocked the rollout due to stale data concerns.",
        action: "Built a live sandbox demo to prove the robustness of the pub/sub invalidation.",
        result: "Got formal sign-off from Risk within 48 hours."
      }
    },
    {
      id: "result",
      title: "Outcome & Mastery",
      content: "Following the full rollout, our P99 latency dropped from 800ms to 120ms. We survived the Q4 holiday spike with zero downtime. From a technical standpoint, this project became the gold standard for how we handle high-throughput reads, and I later documented the architecture into a guild presentation for the broader engineering org.",
      car: {
        context: "Approaching the critical Q4 holiday traffic spike.",
        action: "Scaled the solution to 100% traffic and documented the architecture for the team.",
        result: "P99 latency down 85% (800ms -> 120ms) and established a new architectural standard."
      }
    }
  ]
};

export default function FinalStoryboardView() {
  const params = useParams<{ id: string }>();
  const [openInsightId, setOpenInsightId] = useState<string | null>(null);
  const [story, setStory] = useState(INITIAL_STORY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  const toggleInsight = (id: string) => {
    setOpenInsightId(openInsightId === id ? null : id);
  };

  const startEdit = (sectionId: string, content: string) => {
    setEditingId(sectionId);
    setEditContent(content);
  };

  const saveEdit = (sectionId: string) => {
    setStory(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, content: editContent } : s
      )
    }));
    setEditingId(null);
  };

  const downloadResume = () => {
    const storyboardId = params?.id ? String(params.id) : "storyboard";
    const content = [
      `ProofDive Resume Export`,
      `Storyboard ID: ${storyboardId}`,
      ``,
      ...story.sections.flatMap((s) => [
        `## ${s.title}`,
        s.content,
        ``,
        `CAR Breakdown`,
        `- Context: ${s.car.context}`,
        `- Action: ${s.car.action}`,
        `- Result: ${s.car.result}`,
        ``,
      ]),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proofdive-resume-storyboard-${storyboardId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[760px] mx-auto px-6 py-10 pb-24 animate-in fade-in duration-500">
      
      {/* Navbar / Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/storyboard" className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-60 text-slate-400">
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <button
          type="button"
          onClick={downloadResume}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-[12px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Download size={14} />
          Download resume
        </button>
      </div>

      {/* Title Block */}
      <div className="text-center max-w-[700px] mx-auto mb-10 mt-6 flex flex-col items-center">
        <h1 className="text-4xl md:text-[44px] font-bold tracking-tight text-slate-900 mb-6 leading-[1.15]">
           Senior Software Engineer
        </h1>

        <p className="text-[17px] text-slate-500 max-w-[500px]">
           Review your completed story and the underlying CAR framework breakdown.
        </p>
      </div>

      {/* Sections List */}
      <div className="space-y-6 mt-12">
        {story.sections.map((section, idx) => {
          const isInsightOpen = openInsightId === section.id;

          return (
            <div key={section.id} style={G} className="overflow-hidden transition-all duration-300 group">
              
              {/* Reading Card */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: "rgba(0,135,168,0.1)", color: TEAL }}>
                    0{idx + 1}
                  </div>
                  <h3 className="text-[14px] font-bold uppercase tracking-widest text-slate-800 flex-1">
                    {section.title}
                  </h3>
                  {editingId !== section.id && (
                    <button 
                      onClick={() => startEdit(section.id, section.content)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors shadow-sm">
                      <Edit3 size={12} /> Edit
                    </button>
                  )}
                </div>
                
                {editingId === section.id ? (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <textarea 
                      value={editContent} 
                      onChange={e => setEditContent(e.target.value)} 
                      rows={4}
                      autoFocus
                      className="w-full p-4 text-[14px] bg-white border border-[#0087A8]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0087A8]/20 focus:border-[#0087A8] resize-none shadow-inner leading-relaxed text-slate-800"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingId(null)} 
                        className="px-4 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-700 transition-colors bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                        Cancel
                      </button>
                      <button 
                        onClick={() => saveEdit(section.id)} 
                        className="px-4 py-2 text-[12px] font-bold text-white bg-[#0087A8] rounded-lg shadow-md hover:bg-[#006E89] transition-all flex items-center gap-1.5">
                        <Save size={14} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[16px] leading-relaxed text-slate-600">
                    {section.content}
                  </p>
                )}
              </div>

              {/* View Insight Toggle */}
              <button 
                onClick={() => toggleInsight(section.id)}
                className="w-full flex items-center justify-between px-6 md:px-8 py-3.5 transition-colors hover:bg-black/5"
                style={{ borderTop: "1px dashed rgba(0,0,0,0.06)", background: isInsightOpen ? "rgba(0,0,0,0.02)" : "transparent" }}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={14} style={{ color: TEAL }} />
                  <span className="text-[12px] font-bold" style={{ color: TEAL }}>View CAR Insight Breakdown</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isInsightOpen ? "rotate-180" : ""}`} style={{ color: TEAL }} />
              </button>

              {/* Expanded Insight Area */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isInsightOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
                style={{ background: "rgba(0,0,0,0.02)" }}
              >
                <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
                  
                  {/* Context */}
                  <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Context</p>
                     </div>
                    <p className="text-[13px] leading-relaxed text-slate-600">{section.car.context}</p>
                  </div>

                  {/* Action */}
                  <div className="space-y-3 md:border-l md:pl-8 border-slate-200">
                     <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0087A8]" />
                        <p className="text-[12px] font-bold uppercase tracking-widest text-[#0087A8]">Action</p>
                     </div>
                    <p className="text-[13px] leading-relaxed text-slate-600">{section.car.action}</p>
                  </div>

                  {/* Result */}
                  <div className="space-y-3 md:border-l md:pl-8 border-slate-200">
                     <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className="text-[12px] font-bold uppercase tracking-widest text-emerald-600">Result</p>
                     </div>
                    <p className="text-[13px] leading-relaxed font-medium text-emerald-700">{section.car.result}</p>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
