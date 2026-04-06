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
      ? "bg-[#0087A8]"
      : accent === "emerald"
        ? "bg-emerald-500"
        : "bg-slate-300";
  const labelColor =
    accent === "teal" ? "text-[#0087A8]" : accent === "emerald" ? "text-emerald-600" : "text-slate-400";

  return (
    <div className="space-y-2 pb-5 border-b border-slate-100 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <p className={`text-[12px] font-bold uppercase tracking-widest ${labelColor}`}>{label}</p>
      </div>
      <p className="text-[14px] leading-relaxed text-slate-600 pl-3.5 border-l-2 border-slate-100">{text}</p>
    </div>
  );
}
