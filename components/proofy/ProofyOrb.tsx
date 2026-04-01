"use client";

import { motion } from "framer-motion";
import { ProofyOrbSvg } from "./ProofyOrbSvg";

const TEAL = "#0087A8";

export function ProofyOrb({
  size = 220,
  listening = false,
  speaking = false,
  agentSpeaking = false,
  /** First paint: blob “forms” from blur + scale */
  entrance = false,
  className = "",
}: {
  size?: number;
  listening?: boolean;
  speaking?: boolean;
  agentSpeaking?: boolean;
  entrance?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      <motion.div
        aria-hidden
        className="absolute rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{
          width: size * 0.95,
          height: size * 0.95,
          background: `radial-gradient(circle at 30% 30%, rgba(0,135,168,0.45), transparent 55%), radial-gradient(circle at 70% 60%, rgba(167,243,208,0.35), transparent 50%)`,
        }}
        animate={{
          scale: listening ? [1, 1.15, 1.08] : agentSpeaking ? [1, 1.08, 1] : speaking ? [1, 1.06, 1] : [1, 1.05, 1],
          opacity: listening ? 0.55 : agentSpeaking ? 0.48 : 0.4,
        }}
        transition={{
          duration: listening ? 1.2 : agentSpeaking ? 2 : 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="relative z-[1] flex items-center justify-center" style={{ width: size * 0.92, height: size * 0.92 }}>
        <ProofyOrbSvg
          size={size * 0.92}
          listening={listening}
          speaking={speaking}
          agentSpeaking={agentSpeaking}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 rounded-full z-0"
        style={{
          boxShadow: `0 0 0 1px rgba(255,255,255,0.5) inset, 0 0 60px ${TEAL}22`,
        }}
      />
    </>
  );

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {entrance ? (
        <motion.div
          className="relative flex items-center justify-center w-full h-full"
          initial={{ scale: 0.15, opacity: 0, filter: "blur(28px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {inner}
        </motion.div>
      ) : (
        inner
      )}
    </div>
  );
}
