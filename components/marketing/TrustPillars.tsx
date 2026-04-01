export default function TrustPillars() {
  const pillars = [
    { title: "Objective Scoring", desc: "No subjective bias. Pure structural analysis." },
    { title: "Private by Default", desc: "Your data is deleted unless you choose to save it." },
    { title: "Industry Standard", desc: "Trained on proven behavioral interview frameworks." },
    { title: "Continuous Output", desc: "Measurable progression, session by session." }
  ];

  return (
    <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-background border-t border-divider">
      <div className="max-w-4xl mx-auto space-y-16">
        <h2 className="text-3xl font-medium tracking-tight text-foreground text-center">Built on Trust</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-divider border border-divider mx-auto w-full">
          {pillars.map((pillar, i) => (
            <div key={i} className="bg-background p-10 flex flex-col justify-start h-[200px]">
              <h3 className="text-lg font-medium text-foreground mb-4">{pillar.title}</h3>
              <p className="text-sm text-muted">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
