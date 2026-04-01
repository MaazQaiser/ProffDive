"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [stage, setStage] = useState("Fresh Graduate");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && role) {
      // Mock saving profile data
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-12 bg-background text-foreground">
      <div className="w-full max-w-md border border-divider p-8 md:p-12">
        <div className="space-y-4 mb-10">
          <h1 className="text-2xl font-medium tracking-tight">Tell us about yourself</h1>
          <p className="text-sm text-muted">We'll use this to personalize your workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted">What's your name?</span>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 border-b border-divider bg-transparent focus:outline-none focus:border-foreground transition-colors text-sm"
                placeholder="Jane Doe"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted">Target Role</span>
              <input
                required
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 border-b border-divider bg-transparent focus:outline-none focus:border-foreground transition-colors text-sm"
                placeholder="e.g. Product Manager"
              />
            </label>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted block mb-4">Career Stage</span>
              <div className="flex gap-4">
                {["Fresh Graduate", "Working Professional"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStage(opt)}
                    className={`flex-1 h-12 flex items-center justify-center text-xs font-medium border transition-colors ${
                      stage === opt
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted border-divider hover:text-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-divider">
            <button
              type="submit"
              disabled={!name || !role}
              className="w-full flex h-12 items-center justify-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-foreground text-background hover:bg-neutral-200"
            >
              Continue to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
