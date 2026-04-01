"use client";

/**
 * Live transcript from the Web Speech API — users see words before a match triggers.
 */
export function VoiceTranscript({ text }: { text: string }) {
  const has = text.trim().length > 0;
  return (
    <div className="w-full max-w-xl mx-auto mb-5 px-2" aria-live="polite">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5 text-center">You said</p>
      <p
        className={`text-center text-base sm:text-lg leading-snug min-h-[2.75rem] border-b border-dashed border-slate-300/90 pb-3 ${
          has ? "text-[#0F172A] font-semibold" : "text-slate-400 font-medium italic"
        }`}
      >
        {has ? (
          <>
            {text}
            <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#0087A8]/45 animate-pulse align-middle" aria-hidden />
          </>
        ) : (
          "Speak — your words will show here, then we’ll match your choice."
        )}
      </p>
    </div>
  );
}
