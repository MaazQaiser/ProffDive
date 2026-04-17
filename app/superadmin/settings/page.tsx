"use client";

import { Field, TextInput } from "@/components/superadmin/Field";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { usePlatformSettings } from "@/lib/superadmin/hooks";

export default function SuperAdminSettingsPage() {
  const { settings, loaded, setSettings } = usePlatformSettings();

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;

  const flags = Object.entries(settings.featureFlags);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Platform configuration — security, privacy, and feature flags (stored locally)."
      />

      <section className="mb-10 max-w-xl space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Security</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.security.mfaRequired}
            onChange={(e) =>
              setSettings({
                ...settings,
                security: { ...settings.security, mfaRequired: e.target.checked },
              })
            }
            className="h-4 w-4 rounded border-[var(--border-strong)]"
          />
          Require MFA for admin actions
        </label>
        <Field label="Session max duration (hours)">
          <TextInput
            type="number"
            min={1}
            max={720}
            value={settings.security.sessionMaxHours}
            onChange={(e) =>
              setSettings({
                ...settings,
                security: {
                  ...settings.security,
                  sessionMaxHours: parseInt(e.target.value, 10) || 24,
                },
              })
            }
          />
        </Field>
      </section>

      <section className="mb-10 max-w-xl space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Privacy</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.privacy.marketingConsentDefault}
            onChange={(e) =>
              setSettings({
                ...settings,
                privacy: { ...settings.privacy, marketingConsentDefault: e.target.checked },
              })
            }
            className="h-4 w-4 rounded border-[var(--border-strong)]"
          />
          Default marketing consent for new accounts
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.privacy.dataExportEnabled}
            onChange={(e) =>
              setSettings({
                ...settings,
                privacy: { ...settings.privacy, dataExportEnabled: e.target.checked },
              })
            }
            className="h-4 w-4 rounded border-[var(--border-strong)]"
          />
          Allow self-service data export
        </label>
      </section>

      <section className="max-w-xl space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Feature flags</h2>
        <div className="space-y-3">
          {flags.map(([key, on]) => (
            <label key={key} className="flex items-center justify-between gap-4 rounded-[var(--r-inner)] border border-[var(--border)] px-3 py-2 text-sm">
              <span className="font-mono text-xs text-[var(--text-2)]">{key}</span>
              <input
                type="checkbox"
                checked={on}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    featureFlags: { ...settings.featureFlags, [key]: e.target.checked },
                  })
                }
                className="h-4 w-4 rounded border-[var(--border-strong)]"
              />
            </label>
          ))}
        </div>
      </section>
    </>
  );
}
