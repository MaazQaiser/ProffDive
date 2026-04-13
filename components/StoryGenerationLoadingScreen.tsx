"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  name?: string;
  onDone?: () => void;
  /** How long the screen stays before fading out (ms). */
  minDurationMs?: number;
};

export function StoryGenerationLoadingScreen({ name, onDone, minDurationMs = 5600 }: Props) {
  const safeName = (name || "").trim() || "Maaz";
  const [exiting, setExiting] = useState(false);
  const [barDone, setBarDone] = useState(false);

  const headline = useMemo(() => `Building your story, ${safeName}.`, [safeName]);

  useEffect(() => {
    // Only auto-exit when a caller provides `onDone`.
    // Route-level `loading.tsx` should stay visible until the route is ready.
    if (!onDone) return;
    const exitT = window.setTimeout(() => setExiting(true), Math.max(0, minDurationMs - 400));
    const doneT = window.setTimeout(() => {
      setBarDone(true);
      onDone();
    }, minDurationMs);
    return () => {
      window.clearTimeout(exitT);
      window.clearTimeout(doneT);
    };
  }, [minDurationMs, onDone]);

  return (
    <div
      className="pd-gen-screen"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        width: "100vw",
        height: "100vh",
        background: "rgba(248, 250, 252, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "grid",
        placeItems: "center",
        opacity: exiting ? 0 : 1,
        transition: "opacity 400ms ease",
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <div style={{ width: "100%", maxWidth: 520, margin: "0 auto", padding: "0 24px" }}>
        <div
          className="pd-gen-wordmark"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#0087A8",
            textAlign: "center",
            marginBottom: "3rem",
            opacity: 0,
            animation: "pdGenFadeIn 400ms ease forwards",
          }}
        >
          ProofDive
        </div>

        {/* ── Headline + bar (top) ── */}
        <div
          style={{
            opacity: 0,
            animation: "pdGenFadeIn 600ms ease forwards",
            animationDelay: "200ms",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)" }}>{headline}</div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            We&apos;re turning your experiences into 13 structured, interview-ready answers. This takes about 20 seconds.
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            placeItems: "center",
            opacity: 0,
            animation: "pdGenFadeIn 400ms ease forwards",
            animationDelay: "500ms",
          }}
        >
          <div
            className="pd-gen-bar"
            style={{
              width: 280,
              height: 3,
              borderRadius: 3,
              background: "var(--color-border-tertiary)",
              overflow: "hidden",
            }}
            aria-hidden="true"
          >
            <div
              className={barDone ? "pd-gen-barFill pd-gen-barFill--done" : "pd-gen-barFill"}
              style={{
                height: "100%",
                width: "0%",
                background: "#0087A8",
              }}
            />
          </div>
        </div>

        {/* ── Loading rows (below, centered) ── */}
        <div style={{ display: "grid", gap: 12, marginTop: 32 }}>
          <GenRow delayMs={800}  label="Reading your experiences..." pulse="once" centered />
          <GenRow delayMs={1600} label="Extracting evidence for each competency..." pulse="once" centered />
          <GenRow delayMs={2400} label="Structuring your answers in CAR format..." pulse="once" centered />
          <GenRow delayMs={3200} label="Scoring against the Success Drivers..." pulse="soft" centered />
        </div>

        <div
          style={{
            marginTop: 20,
            opacity: 0,
            animation: "pdGenFadeIn 400ms ease forwards",
            animationDelay: "4200ms",
            textAlign: "center",
            fontSize: 11,
            color: "var(--color-text-tertiary)",
          }}
        >
          No writing required — you gave us the facts. We handled the rest.
        </div>
      </div>

      <style>{`
        @keyframes pdGenFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pdGenRowIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pdGenDotOnce {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        @keyframes pdGenDotSoft {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        .pd-gen-row {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transform: translateX(-8px);
          animation: pdGenRowIn 500ms ease-out forwards;
        }
        .pd-gen-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #0087A8;
          flex: 0 0 auto;
        }
        .pd-gen-dot--once {
          animation: pdGenDotOnce 400ms ease-out both;
        }
        .pd-gen-dot--soft {
          animation: pdGenDotSoft 1500ms ease-in-out infinite;
        }
        .pd-gen-barFill {
          animation: pdGenBarTo92 18000ms linear forwards;
        }
        .pd-gen-barFill--done {
          animation: none;
          width: 100% !important;
          transition: width 260ms ease;
        }
        @keyframes pdGenBarTo92 {
          from { width: 0%; }
          to { width: 92%; }
        }
      `}</style>
    </div>
  );
}

function GenRow({
  delayMs,
  label,
  pulse,
  centered,
}: {
  delayMs: number;
  label: string;
  pulse: "once" | "soft";
  centered?: boolean;
}) {
  const dotClass = pulse === "soft" ? "pd-gen-dot pd-gen-dot--soft" : "pd-gen-dot pd-gen-dot--once";

  return (
    <div
      className="pd-gen-row"
      style={{
        animationDelay: `${delayMs}ms`,
        justifyContent: centered ? "center" : undefined,
      }}
    >
      <div className={dotClass} style={{ animationDelay: `${delayMs}ms` }} aria-hidden="true" />
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{label}</div>
    </div>
  );
}

