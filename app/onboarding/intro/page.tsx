import Link from "next/link";

export default function IntroInterviewLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-12 bg-background text-foreground">
      <div className="w-full max-w-2xl border border-divider p-8 md:p-16">
        <div className="space-y-6 mb-12">
          <Link href="/onboarding" className="text-xs uppercase tracking-widest text-muted hover:text-foreground mb-8 block">
            ← Back
          </Link>
          <h1 className="text-3xl font-medium tracking-tight">Start your first ProofDive</h1>
          <p className="text-sm text-muted leading-relaxed">
            This short interview helps us understand your background and personalize your practice. 
            There are no right or wrong answers—just clarity.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-divider border border-divider mb-12">
          {[{ label: "~15 min", desc: "Diagnostic" },
            { label: "Video or audio", desc: "Your choice" },
            { label: "No baseline score", desc: "Zero pressure" },
            { label: "Personalized", desc: "Creates your Snapshot" }
          ].map((item, i) => (
            <div key={i} className="bg-background p-6 space-y-2">
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-muted">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-6">
          <Link 
            href="/onboarding/device-check"
            className="flex h-12 w-full items-center justify-center bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium shadow-sm"
          >
            Check device settings
          </Link>
          <Link href="/onboarding/quick" className="text-xs text-muted underline hover:text-foreground transition-colors">
            Prefer the quick form instead?
          </Link>
        </div>
      </div>
    </div>
  );
}
