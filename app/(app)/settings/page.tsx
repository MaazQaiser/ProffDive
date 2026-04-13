"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useUser } from "@/lib/user-context";
import { readDemoPreset, resetDemoStorage, seedFirstTime, seedReturningLight } from "@/lib/demo";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-start justify-between gap-4 rounded-[14px] border border-divider bg-white/40 backdrop-blur-[14px] px-4 py-3 text-left hover:bg-white/50 transition-colors"
    >
      <div className="space-y-1">
        <div className="text-[13px] font-semibold text-[#0F172A]">{label}</div>
        {description ? <div className="text-[12px] text-[#475569]">{description}</div> : null}
      </div>
      <div
        className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
          checked ? "bg-[#0087A8]" : "bg-[#0F172A]/10"
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { user, isLoaded, updateUser, resetUser } = useUser();
  const [done, setDone] = useState<null | "saved">(null);

  const demoPreset = useMemo(() => (isLoaded ? readDemoPreset() : null), [isLoaded]);

  return (
    <div className="p-8 lg:p-12 max-w-4xl space-y-10 bg-background text-foreground">
      <div className="space-y-3 border-b border-divider pb-7">
        <h1 className="text-3xl font-medium tracking-tight">Settings</h1>
        <p className="text-sm text-muted">Simple controls for your account and preferences.</p>
      </div>

      {!isLoaded ? (
        <div className="space-y-4">
          <div className="h-10 w-full bg-divider/50 rounded" />
          <div className="h-10 w-full bg-divider/50 rounded" />
          <div className="h-10 w-3/4 bg-divider/50 rounded" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest text-muted">Notifications</div>
            <Toggle
              checked={user.notifications?.reminders ?? true}
              onChange={(next) => updateUser({ notifications: { ...user.notifications, reminders: next } })}
              label="Reminders"
              description="Light nudges to keep your practice consistent."
            />
            <Toggle
              checked={user.notifications?.productUpdates ?? true}
              onChange={(next) => updateUser({ notifications: { ...user.notifications, productUpdates: next } })}
              label="Product updates"
              description="Occasional updates about new trainings or features."
            />
          </div>

          <div className="space-y-4 md:border-l border-divider md:pl-10">
            <div className="text-xs uppercase tracking-widest text-muted">Privacy</div>
            <Toggle
              checked={user.marketingConsent ?? false}
              onChange={(next) => updateUser({ marketingConsent: next })}
              label="Allow product research emails"
              description="Used only to improve the product. Off by default."
            />

            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  updateUser({ lastActiveAt: new Date().toISOString() });
                  setDone("saved");
                  window.setTimeout(() => setDone(null), 1200);
                }}
                className="h-10 px-4 inline-flex items-center justify-center rounded-[10px] bg-[#0087A8] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
              >
                Save
              </button>
              <Link
                href="/profile"
                className="h-10 px-4 inline-flex items-center justify-center rounded-[10px] border border-[#0F172A]/10 text-[13px] font-semibold text-[#0F172A] hover:bg-[#0F172A]/5 transition-colors"
              >
                Back to profile
              </Link>
              {done ? <span className="text-[12px] text-[#475569]">Saved</span> : null}
            </div>

            <div className="pt-8">
              <div className="text-xs uppercase tracking-widest text-muted mb-2">Demo controls</div>
              <div className="rounded-[14px] border border-divider bg-white/40 backdrop-blur-[14px] p-4 space-y-3">
                <div className="text-[12px] text-[#475569]">
                  Current preset: <span className="font-semibold text-[#0F172A]">{demoPreset ?? "none"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      seedFirstTime();
                      window.location.assign("/login");
                    }}
                    className="h-9 px-3 rounded-[10px] border border-[#0F172A]/10 text-[12px] font-semibold text-[#0F172A] hover:bg-[#0F172A]/5 transition-colors"
                  >
                    Switch to first-time
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      seedReturningLight();
                      window.location.assign("/login");
                    }}
                    className="h-9 px-3 rounded-[10px] border border-[#0F172A]/10 text-[12px] font-semibold text-[#0F172A] hover:bg-[#0F172A]/5 transition-colors"
                  >
                    Switch to recurring
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetDemoStorage();
                      resetUser();
                      window.location.assign("/login");
                    }}
                    className="h-9 px-3 rounded-[10px] border border-[#0F172A]/10 text-[12px] font-semibold text-[#0F172A] hover:bg-[#0F172A]/5 transition-colors"
                  >
                    Reset all local demo data
                  </button>
                </div>
                <div className="text-[12px] text-[#64748B]">
                  Tip: press <span className="font-semibold">Cmd/Ctrl + Shift + D</span> anywhere in the app to
                  toggle personas.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

