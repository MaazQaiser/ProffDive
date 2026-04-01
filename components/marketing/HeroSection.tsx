"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-start justify-center px-6 md:px-12 lg:px-24">
      <div className="max-w-xl z-20 space-y-8 pt-24">
        <motion.h1 
          className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Turn your experience into interview-ready proof
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-muted max-w-lg font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          Practice with AI, improve your answers, and see exactly what to work on next.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Link 
            href="/login" 
            className="flex h-12 items-center justify-center bg-primary text-white px-8 text-sm font-medium transition-colors hover:bg-primary-hover shadow-sm"
          >
            Get interview ready
          </Link>
          <button className="flex h-12 items-center justify-center border border-divider text-foreground px-8 text-sm font-medium transition-colors hover:bg-neutral-50">
            See how it works
          </button>
        </motion.div>
      </div>

      {/* Human Dashboard Interview Background */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[80vh] hidden lg:block outline-none pointer-events-none"
      >
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-surface-alt">
          <img src="/hero_human.png" alt="Candidate Interview" className="w-full h-full object-cover scale-105 transition-all duration-700 hover:scale-100" />
          {/* Subtle overlay shading to blend human image with #0A0A0A background seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
