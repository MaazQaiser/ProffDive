"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function MockProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    // Generate random report ID for mock route
    const id = Math.floor(Math.random() * 1000);
    const timer = setTimeout(() => {
      router.push(`/report/${id}`);
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-lg p-8 md:p-12 border border-divider flex flex-col items-center justify-center space-y-12 bg-surface-alt">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-12 h-12 border border-divider border-t-status-ready"
        />
        <div className="text-center space-y-4">
          <h1 className="text-xl font-medium tracking-tight">Analyzing your interview</h1>
          <p className="text-sm text-muted">Scoring answers and extracting evidence...</p>
        </div>
      </div>
    </div>
  );
}
