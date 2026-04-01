import Link from "next/link";

export default function SnapshotPage() {
  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-24 bg-background text-foreground lg:pt-32">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="space-y-4">
          <div className="flex gap-4 items-center">
            <span className="text-[12px] uppercase tracking-widest bg-status-borderline text-background px-3 py-1 font-medium">Borderline</span>
            <span className="text-sm text-muted">Baseline Preparedness</span>
          </div>
          <h1 className="text-5xl font-medium tracking-tight">Your Snapshot</h1>
          <p className="text-sm text-muted max-w-lg">Based on your intro interview, here is your baseline readiness profile.</p>

          <div className="pt-8 flex flex-col gap-2">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm uppercase tracking-widest text-muted">Readiness Score</span>
              <span className="text-4xl font-medium">2.5 <span className="text-xl text-muted">/ 4</span></span>
            </div>
            
            {/* Score Bar out of 4 */}
            <div className="w-full h-1 bg-divider flex overflow-hidden">
               <div className="h-full bg-status-borderline" style={{ width: "62.5%" }} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-divider border border-divider">
          {/* Section A: Strongest Signal */}
          <div className="bg-background p-8 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4"><span className="w-2 h-2 rounded-none inline-block bg-status-ready" /></div>
            <h2 className="text-xs tracking-widest uppercase text-muted">Strongest Signal</h2>
            <div className="text-lg font-medium">Clear communication</div>
            <p className="text-sm text-muted">Your answers were structured chronologically and easy to follow.</p>
          </div>

          {/* Section B: Needs Work */}
          <div className="bg-background p-8 space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4"><span className="w-2 h-2 rounded-none inline-block bg-status-not-ready" /></div>
            <div className="space-y-4">
              <h2 className="text-xs tracking-widest uppercase text-muted">Needs Work</h2>
              <div className="text-lg font-medium">Results need to be clearer</div>
              <p className="text-sm text-muted">Most examples ended abruptly without quantifying the final impact.</p>
            </div>
            {/* AI Training suggestion inside weakness */}
            <div className="mt-8 border-t border-divider pt-6 flex justify-between items-center">
              <span className="text-[12px] tracking-widest text-status-ready uppercase">Training recommended</span>
              <Link href="/trainings" className="text-xs text-foreground font-medium hover:underline">Start &apos;CAR Methods&apos;</Link>
            </div>
          </div>
        </div>

        {/* Section D: Direct Action Plan (Storyboard introduced) */}
        <section className="space-y-6 pt-12 border-t border-divider">
          <h2 className="text-2xl font-medium">Your Action Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-divider p-8 space-y-4 hover:border-foreground transition-colors group">
              <div className="w-8 h-8 flex items-center justify-center border border-divider text-muted uppercase text-xs">A</div>
              <h3 className="text-lg font-medium">Build your proof bank</h3>
              <p className="text-sm text-muted pb-4">Create structural CAR examples that can be reused in your simulation.</p>
              <Link href="/storyboard" className="block text-sm font-medium pt-4 border-t border-divider text-primary group-hover:text-foreground transition-colors">Launch MyStoryBoard →</Link>
            </div>
            <div className="border border-divider p-8 space-y-4 hover:border-foreground transition-colors group opacity-50">
              <div className="w-8 h-8 flex items-center justify-center border border-divider text-muted uppercase text-xs">B</div>
              <h3 className="text-lg font-medium">Simulate under pressure</h3>
              <p className="text-sm text-muted pb-4">Test your structural examples in a 30-minute high-fidelity mock.</p>
              <span className="block text-sm font-medium pt-4 border-t border-divider tracking-widest uppercase text-xs">Locked until Proof Built</span>
            </div>
          </div>
        </section>

        <Link href="/dashboard" className="flex h-12 items-center justify-center border border-divider text-sm font-medium hover:bg-neutral-50 transition-colors w-full mt-4">
          Continue to Dashboard
        </Link>
      </div>
    </div>
  );
}
