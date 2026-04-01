"use client";

import { useEffect, useRef, useState } from "react";

function TypewriterLineInner({
  text,
  speed = 40,
  onComplete,
  className = "",
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
        completeRef.current?.();
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return (
    <p
      className={`text-2xl sm:text-3xl md:text-[2rem] font-bold leading-snug text-[#0F172A] tracking-tight ${className}`}
    >
      {shown}
      {!done && (
        <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#0087A8]/50 animate-pulse align-middle" />
      )}
    </p>
  );
}

/** Remounts when `text` or `speed` changes so typewriter state resets without effect-driven setState. */
export function TypewriterLine(props: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) {
  return <TypewriterLineInner key={`${props.text}\0${props.speed ?? 40}`} {...props} />;
}
