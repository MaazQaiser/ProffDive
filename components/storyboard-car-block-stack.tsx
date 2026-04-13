"use client";

export function CarBlockStack({
  label,
  accent,
  text,
}: {
  label: string;
  accent: "slate" | "teal" | "emerald";
  text: string;
}) {
  const dot =
    accent === "teal"
      ? "bg-[#0A89A9]"
      : accent === "emerald"
        ? "bg-emerald-500"
        : "bg-slate-300";
  const labelColor =
    accent === "teal" ? "text-[#0A89A9]" : accent === "emerald" ? "text-emerald-600" : "text-slate-400";

  return (
    <div className="space-y-2 border-b border-[#E2E8F0]/80 pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <p className={`text-[12px] font-bold uppercase tracking-widest ${labelColor}`}>{label}</p>
      </div>
      <p className="border-l-2 border-[#E2E8F0] pl-3.5 text-[14px] leading-relaxed text-[#475569]">{text}</p>
    </div>
  );
}
