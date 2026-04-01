export default function FeatureCards() {
  const features = [
    { title: "Intro Interview", desc: "A 15-minute diagnostic to map your experience.", colSpan: "md:col-span-2" },
    { title: "Mock Studios", desc: "Simulated environments tailored to specific roles.", colSpan: "md:col-span-1" },
    { title: "Training Hub", desc: "Targeted modules for specific competency gaps.", colSpan: "md:col-span-1" },
    { title: "MyStoryBoard", desc: "Centralized repository for your proven examples.", colSpan: "md:col-span-1" },
    { title: "AI Reports", desc: "Clinical breakdown of your performance metrics.", colSpan: "md:col-span-1" }
  ];

  return (
    <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-background border-t border-divider">
      <h2 className="text-3xl font-medium tracking-tight mb-16 text-foreground">What you get</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-divider border border-divider">
        {features.map((feature, i) => (
          <div key={i} className={`bg-background p-10 flex flex-col justify-between min-h-[240px] ${feature.colSpan}`}>
            <h3 className="text-xl font-medium text-foreground">{feature.title}</h3>
            <p className="text-sm text-muted mt-4 max-w-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
