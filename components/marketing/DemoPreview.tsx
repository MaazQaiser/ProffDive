"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DemoPreview() {
  const [activeTab, setActiveTab] = useState("Interview UI");
  const tabs = ["Interview UI", "Transcript", "Snapshot", "Report preview"];

  return (
    <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-background border-t border-divider">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        {/* Left Side: Mock UI */}
        <div className="relative border border-divider p-1 bg-surface-alt overflow-hidden">
          <div className="absolute top-4 left-4 bg-status-star/10 text-primary px-2 py-1 text-[12px] tracking-widest uppercase font-medium">
            Live Preview
          </div>
          <div className="h-[400px] md:h-[500px] w-full flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full border border-divider flex flex-col items-center justify-center text-muted relative"
              >
                <img src="/demo.png" alt="Clinical Mock UI Preview" className="w-full h-full object-cover object-center transition-opacity hover:opacity-100" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Copy & Tabs */}
        <div className="flex flex-col space-y-12 h-full justify-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-medium tracking-tight text-foreground">See it in action</h2>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              No distracting elements. No unnecessary animations. A clinical environment designed entirely for focus and performance.
            </p>
          </div>

          <div className="flex flex-col space-y-4 pt-4 border-t border-divider">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left text-sm py-2 transition-colors border-b-2 flex translate-y-[1px] ${
                  activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
