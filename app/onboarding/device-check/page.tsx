"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DeviceCheck() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Mock the device check
    const timer = setTimeout(() => setChecking(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-12 bg-background text-foreground">
      <div className="w-full max-w-lg border border-divider p-8 md:p-16 text-center space-y-8">
        <h1 className="text-3xl font-medium tracking-tight">Checking connection</h1>
        
        <div className="space-y-4 py-8 border-t border-b border-divider flex flex-col items-center">
          <div className="w-16 h-16 border border-divider flex justify-center items-center text-xs tracking-widest uppercase mb-4">
            {checking ? "Wait" : "Ready"}
          </div>
          <div className="flex gap-4">
            {['Camera', 'Mic', 'Speaker'].map((device) => (
              <div key={device} className="border border-divider px-4 py-2 text-xs font-medium text-muted">
                {device}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => router.push("/onboarding/interview")}
          disabled={checking}
          className="w-full flex h-12 items-center justify-center bg-primary text-white transition-colors text-sm font-medium disabled:opacity-30 hover:bg-primary-hover shadow-sm"
        >
          {checking ? "Checking..." : "Continue to interview"}
        </button>
      </div>
    </div>
  );
}
