"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { completeJourneyStep } from "@/lib/guided-journey";
import { writeReports, readReports } from "@/lib/report-store";

export default function MockProcessingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Transcribing key moments", desc: "Pulling the most important parts of your answers." },
    { title: "Scoring against Success Drivers", desc: "Turning performance into clear, comparable signals." },
    { title: "Generating coaching notes", desc: "Writing specific next steps you can act on." },
  ];

  useEffect(() => {
    const stepTimer = window.setInterval(() => {
      setStep((s) => Math.min(steps.length - 1, s + 1));
    }, 1100);

    const id = `rep_${Date.now().toString(36)}`;
    const timer = window.setTimeout(() => {
      const createdAt = new Date().toISOString();
      const reports = readReports();
      writeReports([
        { id, sessionId: "sess_demo_001", title: "Mock interview — Coaching report", role: "Product Manager", createdAt },
        ...reports,
      ]);
      completeJourneyStep("mock");
      router.push(`/report/${id}`);
    }, 3800);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(stepTimer);
    };
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
          <h1 className="text-xl font-medium tracking-tight">{steps[step]?.title ?? "Analyzing your interview"}</h1>
          <p className="text-sm text-muted">{steps[step]?.desc ?? "This usually takes a moment."}</p>
        </div>
      </div>
    </div>
  );
}
