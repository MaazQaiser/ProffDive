"use client";

import Link from "next/link";
import { useState } from "react";

export default function StoryBoardMockDetail() {
  const [title, setTitle] = useState("Redesigned onboarding flow");

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-background text-foreground font-sans">
      
      {/* LEFT COLUMN: CAR EDITOR (MAIN CONTENT) */}
      <div className="flex-1 flex flex-col border-r border-divider max-h-[calc(100vh-64px)] overflow-y-auto pb-24">
         <header className="px-8 lg:px-12 py-10 border-b border-divider shrink-0">
            <Link href="/storyboard" className="text-xs uppercase tracking-widest text-muted hover:text-foreground mb-8 inline-block">← Back to MyStoryBoard</Link>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[12px] uppercase tracking-widest bg-divider text-muted px-2 py-1">Manual Entry</span>
              <span className="text-[12px] uppercase tracking-widest bg-status-ready/10 text-status-ready px-2 py-1">Draft</span>
            </div>
            
            <input 
              className="text-3xl lg:text-4xl font-medium tracking-tight bg-transparent focus:outline-none w-full border-b border-transparent focus:border-divider pb-2 transition-colors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this example a name"
            />
            
            <div className="flex flex-wrap gap-2 mt-6">
              {['Problem solving', 'Ownership', 'Collaboration', 'Leadership'].map(tag => (
                <span key={tag} className="text-xs tracking-widest uppercase border border-divider px-3 py-1 text-muted hover:bg-neutral-50 cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>
         </header>

         {/* CAR INPUT BLOCKS */}
         <div className="p-8 lg:p-12 space-y-12 shrink-0">
            
            {/* CONTEXT */}
            <section className="space-y-4">
              <div className="mb-2">
                <h2 className="text-sm font-medium tracking-widest uppercase text-foreground">1. Context</h2>
                <p className="text-xs text-muted mt-1">What was the situation and why did it matter?</p>
              </div>
              <textarea 
                className="w-full h-32 bg-surface-alt border border-divider p-4 text-sm focus:outline-none focus:border-foreground resize-none leading-relaxed transition-colors"
                placeholder="The platform was losing 40% of users during onboarding..."
              />
              <div className="flex gap-4">
                <button className="text-[12px] tracking-widest uppercase text-primary hover:underline flex items-center gap-1">✨ Make clearer</button>
                <button className="text-[12px] tracking-widest uppercase text-primary hover:underline flex items-center gap-1">✨ Add missing detail</button>
              </div>
            </section>

            {/* ACTION */}
            <section className="space-y-4">
              <div className="mb-2">
                <h2 className="text-sm font-medium tracking-widest uppercase text-foreground">2. Action</h2>
                <p className="text-xs text-muted mt-1">What did you do, step by step? Focus on your role.</p>
              </div>
              <textarea 
                className="w-full h-40 bg-surface-alt border border-divider p-4 text-sm focus:outline-none focus:border-foreground resize-none leading-relaxed transition-colors"
                placeholder="I audited the UX, interviewed 10 drop-off users, and restructured the required form fields..."
              />
              <div className="flex gap-4">
                <button className="text-[12px] tracking-widest uppercase text-primary hover:underline flex items-center gap-1">✨ Focus on my role</button>
                <button className="text-[12px] tracking-widest uppercase text-primary hover:underline flex items-center gap-1">✨ Break into steps</button>
              </div>
            </section>

            {/* RESULT */}
            <section className="space-y-4">
              <div className="mb-2">
                <h2 className="text-sm font-medium tracking-widest uppercase text-foreground">3. Result</h2>
                <p className="text-xs text-muted mt-1">What changed because of your work? Include outcomes if possible.</p>
              </div>
              <textarea 
                className="w-full h-32 bg-surface-alt border-status-not-ready border border-b-[3px] p-4 text-sm focus:outline-none focus:border-foreground resize-none leading-relaxed transition-colors"
                defaultValue="We launched the new flow and people liked it a lot more."
              />
              <div className="flex gap-4">
                 <button className="text-[12px] tracking-widest uppercase text-primary hover:underline flex items-center gap-1">✨ Strengthen impact</button>
                 <button className="text-[12px] tracking-widest uppercase text-primary hover:underline flex items-center gap-1">✨ Add measurable outcome</button>
              </div>
            </section>

            {/* GLOBAL ACTIONS */}
            <div className="pt-12 border-t border-divider grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="h-10 border border-primary text-primary text-[12px] uppercase tracking-widest hover:bg-surface-alt transition-colors">✨ Improve Answer</button>
              <button className="h-10 border border-primary text-primary text-[12px] uppercase tracking-widest hover:bg-surface-alt transition-colors">✨ Make Interview-Ready</button>
              <button className="h-10 border border-primary text-primary text-[12px] uppercase tracking-widest hover:bg-surface-alt transition-colors">✨ Shorten</button>
              <button className="h-10 border border-primary text-primary text-[12px] uppercase tracking-widest hover:bg-surface-alt transition-colors">✨ Clean Structure</button>
            </div>
         </div>
      </div>

      {/* RIGHT COLUMN: AI SIDE PANEL */}
      <aside className="w-full lg:w-96 bg-surface-alt flex flex-col shrink-0 overflow-y-auto">
        <div className="p-8 border-b border-divider shrink-0">
          <h2 className="text-sm uppercase tracking-widest text-muted">Intelligence Panel</h2>
        </div>
        
        <div className="p-8 space-y-12">
          
          {/* Strength Feedback */}
          <div className="space-y-4">
             <h3 className="text-xs uppercase tracking-widest text-foreground font-medium border-b border-divider pb-2">Strength Feedback</h3>
             <ul className="space-y-3 pt-2 text-sm text-muted">
               <li className="flex items-center gap-3"><span className="text-status-ready">✔</span> Clear context</li>
               <li className="flex items-center gap-3"><span className="text-status-ready">✔</span> Strong ownership</li>
               <li className="flex items-center gap-3 font-medium text-foreground"><span className="text-status-not-ready">⚠</span> Weak result</li>
             </ul>
          </div>

          {/* Usage Hints */}
          <div className="space-y-4">
             <h3 className="text-xs uppercase tracking-widest text-foreground font-medium border-b border-divider pb-2">Usage Hints</h3>
             <p className="text-[12px] uppercase tracking-widest text-muted">This example can be used for:</p>
             <ul className="space-y-3 pt-2 text-sm text-muted list-disc pl-4 marker:text-divider">
                <li>Tell me about a challenge</li>
                <li>Describe a cross-functional project</li>
                <li>Leadership without authority</li>
             </ul>
          </div>

          {/* Improvement Tip */}
          <div className="space-y-4 bg-surface-alt border border-divider p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4"><span className="w-2 h-2 rounded-none inline-block bg-status-not-ready animate-pulse" /></div>
             <h3 className="text-xs uppercase tracking-widest text-foreground font-medium border-b border-status-not-ready/30 pb-2">Improvement Tip</h3>
             <p className="text-sm text-foreground leading-relaxed pt-2">
               Add a measurable result to strengthen the final block. Convert &ldquo;people liked it a lot more&rdquo; into specific retention metrics or conversion lift.
             </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-auto p-8 border-t border-divider space-y-4 bg-background">
          <button className="w-full h-12 flex items-center justify-center bg-foreground text-background transition-colors text-xs font-medium uppercase tracking-widest hover:bg-neutral-200">
            Save as Final
          </button>
          <div className="flex gap-4">
            <button className="flex-1 h-12 flex items-center justify-center border border-divider transition-colors text-xs font-medium uppercase tracking-widest hover:bg-neutral-50">
              Save Draft
            </button>
            <button className="flex-1 h-12 flex items-center justify-center border border-divider transition-colors text-xs font-medium uppercase tracking-widest text-muted hover:text-foreground hover:bg-neutral-50">
              History
            </button>
          </div>
        </div>
      </aside>

    </div>
  );
}
