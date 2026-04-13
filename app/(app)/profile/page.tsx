"use client";

import type { ReactNode } from "react";

const BRAND = "#0087A8";
const BORDER = "0.5px solid var(--color-border-tertiary)";

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "block" }}>
      <path
        d="M12.2 6.2L17.8 11.8"
        stroke="rgba(15,23,42,0.65)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.1 16.9L6.3 18.9L8.3 18.1L18.2 8.2C18.9 7.5 18.9 6.4 18.2 5.7L18.3 5.8C17.6 5.1 16.5 5.1 15.8 5.8L7.1 14.5V16.9Z"
        stroke="rgba(15,23,42,0.65)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "block" }}>
      <path
        d="M9 6.5L15 12L9 17.5"
        stroke="var(--color-text-tertiary)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        background: "#fff",
        border: BORDER,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0.9rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: BORDER,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</div>
        {action ? <div style={{ fontSize: 12, fontWeight: 500, color: BRAND }}>{action}</div> : <div />}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 13,
          color: muted ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
          fontStyle: muted ? "italic" : "normal",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div style={{ background: "var(--color-background-secondary)", minHeight: "calc(100vh - 56px)" }}>
      {/* Profile header */}
      <div style={{ background: "#fff", borderBottom: BORDER }}>
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            padding: "1.75rem 2rem",
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
            <div
              aria-hidden
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                background: BRAND,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              MQ
            </div>
            <button
              type="button"
              aria-label="Edit avatar"
              style={{
                position: "absolute",
                right: -2,
                bottom: -2,
                width: 20,
                height: 20,
                borderRadius: 999,
                background: "#fff",
                border: BORDER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <PencilIcon />
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>Maaz Qaiser</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
              Still studying · Product Manager
            </div>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Readiness score</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: "var(--color-text-tertiary)", marginTop: 2 }}>--</div>
          </div>
        </div>
      </div>

      {/* Content layout */}
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "1.75rem 2rem",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 260px",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Card 1 */}
          <Card title="Personal information" action={<button type="button" style={{ border: 0, background: "transparent", color: BRAND, cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 500 }}>Edit</button>}>
            <div style={{ padding: "1rem 1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Field label="Full name" value="Maaz Qaiser" />
                <Field label="Email" value="maaz@email.com" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Field label="Career stage" value="Still studying" />
                <Field label="University" value="Not added" muted />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Graduation year" value="Not added" muted />
                <Field label="Member since" value="April 2026" />
              </div>
            </div>
          </Card>

          {/* Card 2 */}
          <Card title="Target roles" action={<button type="button" style={{ border: 0, background: "transparent", color: BRAND, cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 500 }}>Manage</button>}>
            <div style={{ padding: "0.5rem 1.25rem 0.8rem" }}>
              {[
                { name: "Product Manager", active: true },
                { name: "UX Designer", active: false },
              ].map((r, idx) => (
                <div
                  key={r.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: idx === 1 ? "none" : "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: r.active ? BRAND : "var(--color-border-tertiary)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ fontSize: 13, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.name}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    {r.active ? (
                      <span
                        style={{
                          background: "#E6F1FB",
                          color: BRAND,
                          fontSize: 10,
                          borderRadius: 20,
                          padding: "2px 8px",
                        }}
                      >
                        Active
                      </span>
                    ) : null}
                    <button
                      type="button"
                      style={{
                        border: 0,
                        background: "transparent",
                        padding: 0,
                        cursor: "pointer",
                        fontSize: 11,
                        color: "var(--color-text-tertiary)",
                      }}
                      onMouseEnter={(e) => {
                        if (!r.active) return;
                        (e.currentTarget as HTMLButtonElement).style.color = "#E24B4A";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-tertiary)";
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                style={{
                  paddingTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: 0,
                  background: "transparent",
                  color: BRAND,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
                  +
                </span>
                <span>Add another role</span>
              </button>
            </div>
          </Card>

          {/* Card 3 */}
          <section
            style={{
              background: "#fff",
              border: BORDER,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {(
              [
                { label: "Password", sub: "Change your password", value: "" },
                { label: "Notifications", sub: "Practice reminders and score updates", value: "On" },
                { label: "Language", sub: "Interface and interview language", value: "English" },
                { label: "Data & privacy", sub: "Manage your data and delete your account", value: "" },
              ] as const
            ).map((row, idx, arr) => (
              <button
                key={row.label}
                type="button"
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto auto",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                  border: 0,
                  borderBottom: idx === arr.length - 1 ? "none" : BORDER,
                  background: "transparent",
                  padding: "12px 1.25rem",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--color-background-secondary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{row.label}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>{row.sub}</div>
                </div>
                {row.value ? (
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{row.value}</div>
                ) : (
                  <div />
                )}
                <div style={{ color: "var(--color-text-tertiary)" }}>
                  <ChevronRightIcon />
                </div>
              </button>
            ))}
          </section>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Card title="Prep progress">
            <div style={{ padding: "0.5rem 1.25rem" }}>
              {(
                [
                  { label: "Trainings", value: "In progress", valueColor: BRAND },
                  { label: "StoryBoard", value: "Not started", valueColor: "var(--color-text-tertiary)" },
                  { label: "Mock interviews", value: "0 sessions", valueColor: "var(--color-text-primary)" },
                  { label: "Best score", value: "--", valueColor: "var(--color-text-primary)" },
                ] as const
              ).map((s, idx, arr) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: idx === arr.length - 1 ? "none" : "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: s.valueColor }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Readiness by driver">
            <div style={{ padding: "0.5rem 1.25rem" }}>
              {(["Thinking", "Action", "People", "Mastery"] as const).map((p, idx, arr) => (
                <div
                  key={p}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 0",
                    borderBottom: idx === arr.length - 1 ? "none" : "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", flex: 1 }}>{p}</div>
                  <div
                    aria-hidden
                    style={{
                      flex: 2,
                      height: 3,
                      background: "var(--color-border-tertiary)",
                      borderRadius: 3,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--color-text-tertiary)",
                      minWidth: 24,
                      textAlign: "right",
                    }}
                  >
                    --
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <button
            type="button"
            style={{
              width: "100%",
              background: "none",
              border: "0.5px solid #E24B4A",
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
              color: "#E24B4A",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#FCEBEB";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
