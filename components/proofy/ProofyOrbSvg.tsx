"use client";

import { motion } from "framer-motion";

const TEAL = "#0087A8";

type ProofyOrbSvgProps = {
  size: number;
  listening?: boolean;
  speaking?: boolean;
  /** Stronger motion while Proofy TTS is playing */
  agentSpeaking?: boolean;
};

/**
 * Vector Proofy orb — iridescent sphere + rim. Motion scales up when agent is talking.
 */
export function ProofyOrbSvg({
  size,
  listening = false,
  speaking = false,
  agentSpeaking = false,
}: ProofyOrbSvgProps) {
  const vb = 200;
  const c = vb / 2;
  const breatheDuration = listening ? 2.2 : agentSpeaking ? 2.4 : speaking ? 3.2 : 4;
  const breatheScale = listening
    ? [1, 1.08, 1]
    : agentSpeaking
      ? [1, 1.06, 1.04, 1]
      : speaking
        ? [1, 1.045, 1]
        : [1, 1.035, 1];
  const rimSpeed = listening ? 14 : agentSpeaking ? 10 : speaking ? 18 : 22;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{
        scale: breatheScale,
        x: agentSpeaking ? [0, 4, -3, 0] : [0, 0, 0],
        y: agentSpeaking ? [0, -3, 2, 0] : [0, 0, 0],
      }}
      transition={{
        scale: { duration: breatheDuration, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${vb} ${vb}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Proofy"
        className="overflow-visible drop-shadow-[0_12px_40px_rgba(0,135,168,0.28)]"
      >
        <defs>
          <radialGradient id="proofySphereCore" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="18%" stopColor="#e0fbff" stopOpacity="0.88" />
            <stop offset="42%" stopColor="#7dd3fc" stopOpacity="0.55" />
            <stop offset="68%" stopColor="#22d3ee" stopOpacity="0.42" />
            <stop offset="88%" stopColor="#0891b2" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.65" />
          </radialGradient>
          <radialGradient id="proofySphereRim" cx="50%" cy="50%" r="52%">
            <stop offset="58%" stopColor="transparent" stopOpacity="0" />
            <stop offset="78%" stopColor="#a7f3d0" stopOpacity="0.45" />
            <stop offset="88%" stopColor="#fde68a" stopOpacity="0.35" />
            <stop offset="96%" stopColor="#e9d5ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id="proofyRimSweep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="25%" stopColor="#a7f3d0" />
            <stop offset="50%" stopColor="#fde68a" />
            <stop offset="75%" stopColor="#f0abfc" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <filter id="proofySoftGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="proofyHighlightBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <clipPath id="proofyClip">
            <circle cx={c} cy={c} r={82} />
          </clipPath>
        </defs>

        <circle cx={c} cy={c} r={88} fill={`${TEAL}18`} opacity={0.55} filter="url(#proofySoftGlow)" />

        <circle cx={c} cy={c} r={82} fill="url(#proofySphereCore)" />
        <circle cx={c} cy={c} r={82} fill="url(#proofySphereRim)" />

        <g clipPath="url(#proofyClip)">
          <ellipse
            cx={72}
            cy={64}
            rx={36}
            ry={22}
            fill="white"
            opacity={0.42}
            transform="rotate(-28 72 64)"
            filter="url(#proofyHighlightBlur)"
          />
          <ellipse cx={118} cy={138} rx={14} ry={10} fill="white" opacity={0.12} transform="rotate(12 118 138)" />
          <motion.circle
            cx={124}
            cy={96}
            r={3.2}
            fill="white"
            opacity={0.28}
            animate={{ opacity: [0.2, 0.38, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx={88}
            cy={118}
            r={2.2}
            fill="white"
            opacity={0.22}
            animate={{ opacity: [0.15, 0.32, 0.15] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
          <motion.circle
            cx={108}
            cy={78}
            r={1.8}
            fill="#e0f2fe"
            opacity={0.35}
            animate={{ opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </g>

        <g transform={`translate(${c} ${c})`}>
          <motion.g animate={{ rotate: 360 }} transition={{ duration: rimSpeed, repeat: Infinity, ease: "linear" }}>
            <circle
              cx={0}
              cy={0}
              r={80}
              fill="none"
              stroke="url(#proofyRimSweep)"
              strokeWidth={2.5}
              opacity={0.75}
            />
          </motion.g>
        </g>

        <circle cx={c} cy={c} r={81.5} fill="none" stroke="white" strokeWidth={0.6} opacity={0.35} />
      </svg>
    </motion.div>
  );
}
