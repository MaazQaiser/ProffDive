import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 bg-background text-foreground">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Getting Started</h1>
            <p className="text-sm text-muted mt-2">A quick look at how ProofDive builds your interview readiness.</p>
          </div>
          <Link href="/onboarding" className="text-xs uppercase tracking-widest text-muted hover:text-foreground px-4 py-2 border border-divider hover:bg-neutral-50 transition-colors">
            Skip Video
          </Link>
        </div>

        <div className="w-full aspect-video border border-divider bg-surface-alt flex items-center justify-center relative group">
          <div className="w-16 h-16 rounded-full border border-foreground flex items-center justify-center cursor-pointer transition-transform group-hover:scale-110 bg-background text-foreground">
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent opacity-50" />
          <div className="absolute bottom-4 left-4 text-xs tracking-widest uppercase text-muted">00:30 Mock Introduction</div>
        </div>

        <div className="flex justify-end pt-8">
          <Link href="/onboarding" className="flex h-12 w-full md:w-auto items-center justify-center px-10 bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium shadow-sm">
            Continue to Setup
          </Link>
        </div>
      </div>
    </div>
  );
}
