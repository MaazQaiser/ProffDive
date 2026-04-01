export default function HowItWorks() {
  const steps = [
    { num: "01", title: "Start Interview", desc: "Begin with a short, AI-guided intro interview to establish your baseline." },
    { num: "02", title: "Get Snapshot", desc: "Receive a clinical, honest assessment of your current interview readiness." },
    { num: "03", title: "Practice Mocks", desc: "Take targeted mock interviews focused entirely on eliminating weaknesses." },
    { num: "04", title: "Improve with Reports", desc: "Review actionable, step-by-step feedback and transcript breakdowns." }
  ];

  return (
    <section className="w-full border-t border-divider py-24 px-6 md:px-12 lg:px-24 bg-background">
      <h2 className="text-3xl font-medium tracking-tight mb-16 text-foreground">How it works</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
        {steps.map((step) => (
          <div key={step.num} className="flex flex-col space-y-6 pt-6 border-t border-divider">
            <span className="text-sm text-foreground">{step.num}</span>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
