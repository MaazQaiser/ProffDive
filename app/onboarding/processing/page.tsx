"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding/snapshot");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-xl p-8 flex flex-col items-center justify-center space-y-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border border-divider border-t-foreground"
        />
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-medium tracking-tight">We're preparing your starting snapshot</h1>
          <p className="text-sm text-muted">Organizing your answers into a personalized practice plan.</p>
        </div>
      </div>
    </div>
  );
}
