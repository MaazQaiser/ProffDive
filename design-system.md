# ProofDive — Design System & Source of Truth

> Version 1.3 · Light Mode Only · Last updated 2026-03-30

---

## 1. Design Principles

| Principle | Description |
|---|---|
| **Flat & Editorial** | No decorative shadows or blurs on content panels. Sharp borders define structure. |
| **Purposeful Colour** | Colour is reserved for status, interaction state, and semantic meaning — never decoration. |
| **Hierarchy by Weight** | Text contrast and font-weight carry hierarchy, not background fills or cards. |
| **Guided Progression** | Every screen answers: *Where am I? What's next? How ready am I?* |

---

## 2. Colour Tokens

### 2.1 Brand / Primary (Cyan-Teal)

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#0087A8` | CTAs, active states, focus rings |
| `--primary-hover` | `#006E89` | Button :hover |
| `--primary-pressed` | `#00566B` | Button :active |
| `--primary-50` | `#E6F6FA` | Selected card backgrounds |

Full scale: `50 → 900` from `#E6F6FA` to `#00282F`.

### 2.2 Surfaces & Backgrounds

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| `--bg-app` | `#F8FAFC` | `bg-background` | Page backgrounds |
| `--bg-surface` | `#FFFFFF` | `bg-surface` | Cards, panels, inputs |
| `--bg-subtle` | `#F1F5F9` | `bg-subtle` | Hover states, section headers |
| `--bg-muted` | `#E2E8F0` | `bg-muted` | Dividers used as gap backgrounds |

### 2.3 Text

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| `--text-primary` | `#0F172A` | `text-foreground` | Headings, body |
| `--text-secondary` | `#475569` | — | Supporting text |
| `--text-tertiary` | `#64748B` | `text-muted` | Labels, placeholders |
| `--text-disabled` | `#94A3B8` | — | Disabled states |

### 2.4 Borders

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| `--border-default` | `#E5E7EB` | `border-divider` | Default borders |
| `--border-strong` | `#CBD5E1` | `border-border-strong` | Hover, emphasis |
| `--border-input` | `#D1D5DB` | `border-border-input` | Form fields |
| `--border-focus` | `#0087A8` | — | Focus state (auto via CSS) |

### 2.5 Readiness Status System

| Status | Label | Text | Fill | Border | Tailwind |
|---|---|---|---|---|---|
| Not Ready | `not-ready` | `#B91C1C` | `#FEF2F2` | `#FECACA` | `text-not-ready / bg-not-ready-fill / border-not-ready-border` |
| Borderline | `borderline` | `#B45309` | `#FFFBEB` | `#FCD34D` | `text-borderline / bg-borderline-fill / border-borderline-border` |
| Ready | `ready` | `#047857` | `#ECFDF5` | `#6EE7B7` | `text-ready / bg-ready-fill / border-ready-border` |
| Star | `star` | `#0891B2` | `#ECFEFF` | `#A5F3FC` | `text-star / bg-star-fill / border-star-border` |
| Role Model | `role-model` | `#00566B` | `#E6F6FA` | `#7DD3E7` | `text-role-model / bg-role-model-fill / border-role-model-border` |

### 2.6 Semantic Colours

| Type | Text | Fill | Border |
|---|---|---|---|
| Success | `#166534` | `#F0FDF4` | `#BBF7D0` |
| Warning | `#92400E` | `#FFFBEB` | `#FDE68A` |
| Error | `#B91C1C` | `#FEF2F2` | `#FECACA` |
| Info | `#0C4A6E` | `#F0F9FF` | `#BAE6FD` |

### 2.7 4-Pillar Accent Colours

| Pillar | Colour | Hex |
|---|---|---|
| 🧠 Thinking | Amber | `#D97706` |
| ⚡ Action | Cyan (Primary) | `#0087A8` |
| 🤝 People | Green | `#16A34A` |
| 🎯 Mastery | Purple | `#7C3AED` |

---

## 3. Typography

> Font family: **Inter** (Google Fonts)

| Role | Size | Weight | Class |
|---|---|---|---|
| Page Title (H1) | 28–36px | 700 | `text-3xl font-bold tracking-tight` |
| Section Heading (H2) | 20–24px | 600 | `text-xl font-semibold tracking-tight` |
| Card Title (H3) | 14–16px | 600 | `text-sm font-semibold` |
| Body | 13–14px | 400 | `text-sm` |
| Label / Meta | 10–11px | 500–700 | `text-[10px] uppercase tracking-widest font-semibold` |
| Mono / Score | 13–18px | 700 | `font-mono font-bold tabular-nums` |

---

## 4. Border Radius

| Element | Radius | Rule |
|---|---|---|
| Modals / Sheets / Popovers | **12px** | `rounded-[12px]` or `data-modal` attribute |
| Buttons (CTAs) | **6px** | Applied globally via `globals.css` |
| Input fields / Textareas / Selects | **6px** | Applied globally via `globals.css` |
| Status badges / Tags | `2–4px` | `rounded-sm` |
| Content panels / Layout sections | **0px** | Flat — no radius, sharp borders |
| Progress bars | **0px** | Flat strips |

---

## 5. Spacing & Layout

### Grid
- Max content width: `max-w-5xl` (1024px)
- Dashboard split: `70 / 30` left/right rail
- Section padding: `px-8 lg:px-16`
- Section gap: `space-y-12` between major sections

### Gap-PX Pattern (Flat Grid)
Use `gap-px bg-[#E2E8F0]` on a parent grid to create crisp cell borders without individual border declarations:
```html
<div class="grid grid-cols-2 gap-px bg-[#E2E8F0] border border-[#E2E8F0]">
  <div class="bg-white p-5">...</div>
  <div class="bg-white p-5">...</div>
</div>
```

---

## 6. Component Patterns

### Status Badge
```html
<span class="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 border border-ready-border bg-ready-fill text-ready rounded-sm">
  <span class="w-1.5 h-1.5 bg-ready block"></span>
  Ready
</span>
```

### Section Label
```html
<p class="text-[10px] uppercase tracking-widest text-muted font-bold border-b border-divider pb-3 mb-4">
  Section Title
</p>
```

### Left-Accent Strip (callout / insight)
```html
<div class="border-l-4 border-primary bg-white border border-divider px-4 py-3 text-sm text-muted">
  Insight text here.
</div>
```

### Ghost CTA (optional action)
```html
<button class="w-full h-10 px-4 border border-dashed border-divider text-sm text-muted hover:text-primary hover:border-primary transition-colors rounded-[6px] text-left flex items-center gap-2">
  ＋ Add optional context
</button>
```

---

## 7. Page Map & Navigation

```
/                          → Marketing Landing Page
├── /login                 → Auth · Sign up / Sign in + consent checkbox
├── /onboarding            → 3-step onboarding flow
│   Step 1: Career         (Fresh Grad / Undergrad / Experienced + exp. bracket)
│   Step 2: Role & Context (Suggestive input + ghost CTAs: industry, JD)
│   Step 3: Path           (Mock / Prepare / Story)
│
├── (app) — requires auth
│   ├── /dashboard         → Guided Readiness Hub (70/30 layout)
│   │     Left: Modules, Mock entry, Story library, AI Coach
│   │     Right: Success Drivers, Journey tracker, Report summary, Actions
│   │
│   ├── /mock
│   │   ├── /mock/setup    → Session setup (Role, JD, Pillars, Device)
│   │   ├── /mock/live     → Live mock interview room
│   │   └── /report/[id]   → AI performance report
│   │         Sections: Overall · Competency · CAR · Strengths/Improvements
│   │                   Question insights + AI rewrite · Suggested Trainings
│   │                   Coaching Recs · Readiness · Final Verdict
│   │
│   ├── /storyboard        → Story builder — CAR narrative library
│   ├── /trainings         → Training modules by pillar
│   ├── /progress          → Progress tracking & journey timeline
│   └── /profile           → User profile & settings
```

### Navigation Items (App Shell)

| Label | Route | Icon |
|---|---|---|
| Dashboard | `/dashboard` | Home |
| Mock Interview | `/mock/setup` | Mic |
| StoryBoard | `/storyboard` | BookOpen |
| Trainings | `/trainings` | GraduationCap |
| Progress | `/progress` | BarChart2 |

---

## 8. Onboarding Flow

```
/login  ──►  /onboarding  ──►  /mock/setup  OR  /trainings  OR  /storyboard  OR  /dashboard
              Step 1              Step 2              Step 3
              Career              Role & Context      Path choice
```

### Career Step Options
| Option | Sub-options |
|---|---|
| Fresh Graduate | — |
| Undergrad | — |
| Experienced | 1–5 yrs / 5–10 yrs / 10+ yrs (required) |

### Role & Context Step
- Free-text input with 20 role auto-suggestions
- Ghost CTA: `＋ Add industry vertical` → reveals dropdown
- Ghost CTA: `＋ Add job description` → reveals paste/upload toggle

---

## 9. Mock Interview Consent Modal

Before starting any mock interview session, a **VideoConsentModal** intercepts the flow:

- Microphone (required) and Camera (optional) device status tiles
- Recording notice strip: `border-l-4 border-borderline-border` styling
- Two mandatory consent checkboxes:
  1. Device access (microphone ± camera)
  2. AI recording & analysis
- Gate: both must be checked before "Confirm & start" enables
- Recording is used **only** to generate the performance report — never shared

---

## 10. Interview Focus Pillars

| Pillar | Colour | Description |
|---|---|---|
| 🧠 Thinking | Amber `#D97706` | Logic, prioritisation, structured problem solving |
| ⚡ Action | Cyan `#0087A8` | Ownership, initiative, driving results |
| 🤝 People | Green `#16A34A` | Collaboration, communication, influence |
| 🎯 Mastery | Purple `#7C3AED` | Technical depth, domain knowledge, expertise |

All 4 selected = 30 min full interview. Each pillar ≈ 8 min focused session.

---

## 11. Report Structure

| Section | Purpose |
|---|---|
| Overall Performance | Score (x/5.0) + readiness verdict banner |
| Competency Breakdown | 4-pillar scores with status bars |
| CAR Analysis | Context / Action / Result table + insight strip |
| Strengths & Areas for Improvement | Side-by-side flat grid |
| Question-Level Insights | Per-question feedback + AI rewrite for Q1 |
| AI Coaching Recommendations | 4 numbered coaching cards |
| Suggested Trainings | 3 training rows linked to weak drivers |
| Interview Readiness | 4-item readiness checklist |
| Final Verdict | Dark flat strip with summary statement |

---

## 12. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use `border-l-4` accent lines for callouts | Use rounded cards with shadows for content panels |
| Use `gap-px bg-[#E2E8F0]` for grid borders | Add `rounded-xl shadow-md` to content sections |
| Use token classes (`text-ready`, `bg-borderline-fill`) | Hard-code semantic hex values in JSX |
| 12px radius on modals, 6px on inputs/buttons | Mix arbitrary radius values |
| Use `text-[10px] uppercase tracking-widest` for labels | Use regular font-size for labels |
| Status badges via `statusMap` lookup pattern | Inline per-status conditionals |
