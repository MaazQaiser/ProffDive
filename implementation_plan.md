# ProofDive V1 — Implementation Plan

A guided interview-readiness platform.  
**Experience → Proof → Offers.**  
Design style: **Museum-Quality Brutalist** — characterized by sparse, clinical text, thin fonts, and perfect geometric forms. Follows Anthropic official brand guidelines.
Stack: **Next.js 14 App Router + Tailwind CSS + shadcn/ui + Framer Motion**

---

## User Review Required

> [!IMPORTANT]
> **Tech stack** — This plan assumes a **Next.js 14 App Router** project with **Tailwind CSS v3**. No backend/API routes or database are wired in V1 — all data flows are mocked/local state to validate the full UX. Real AI/auth integration is Phase 2.

> [!NOTE]
> **Scope** — This plan covers only the UX shell, component design, and screen flows. AI scoring logic, real audio/video capture, and payment flows are explicitly parked for V1 (as you defined).

---

## Design System (Global)

### Typography — Sparse & Clinical (Brand Guidelines)

| Token | Value |
|---|---|
| Headings | `Poppins` (fallback: Arial) |
| Body | `Lora` (fallback: Georgia) |
| Display / hero | `font-poppins font-light text-6xl md:text-8xl tracking-tight leading-none` |
| Section title | `font-poppins font-medium text-4xl md:text-5xl tracking-tight` |
| Card heading | `font-poppins font-medium text-xl` |
| Body text | `font-lora font-normal text-base text-[var(--pd-mid-gray)]` |
| Label/caption | `font-lora font-light text-sm text-[var(--pd-mid-gray)] uppercase tracking-widest` |

### Color Palette (Anthropic Brand)

| Token | Hex | Usage |
|---|---|---|
| `--pd-dark` | `#141413` | Primary text, heavy backgrounds |
| `--pd-light` | `#faf9f5` | Main page backgrounds, text on dark |
| `--pd-mid-gray` | `#b0aea5` | Secondary elements, subtle text |
| `--pd-light-gray` | `#e8e6dc` | Borders, subtle backgrounds, dividers |
| `--pd-accent-orange` | `#d97757` | Primary CTA, core highlights |
| `--pd-accent-blue` | `#6a9bcc` | Information, secondary markers |
| `--pd-accent-green` | `#788c5d` | Positive signals (Success drivers, high scores) |

### Animation Principles
- Page transitions: `fade-up` (Framer Motion, 500ms ease-out) with staggered delays.
- Brutalist hover states: sharp, high-contrast inversions (no soft shadows). Textural grain/noise overlays that appear on active states.
- Cards: strict, geometric, 1px borders. 
- Interview UI: clinical, zero-distraction — feels like a dashboard from a master craftsman. No overlap, perfect alignment.

---

## Project Structure

```
/app
  /(marketing)
    /page.tsx              ← Landing page
  /(auth)
    /login/page.tsx
    /consent/page.tsx
  /(onboarding)
    /intro/page.tsx        ← Intro interview landing
    /device-check/page.tsx
    /interview/page.tsx    ← Live intro interview
    /processing/page.tsx
    /snapshot/page.tsx     ← Starting snapshot
  /(app)
    /dashboard/page.tsx
    /mock/setup/page.tsx
    /mock/live/page.tsx
    /mock/processing/page.tsx
    /report/[id]/page.tsx
    /trainings/page.tsx
    /storyboard/page.tsx
    /profile/page.tsx
/components
  /ui                      ← shadcn primitives
  /marketing               ← Landing page sections
  /interview               ← Interview UI components
  /report                  ← Report cards + drivers
  /layout                  ← SideNav, AppShell
/lib
  /mock-data.ts            ← V1 mock answers + scores
  /ai-persona.ts           ← AI tone + question bank
```

---

## Screen-by-Screen Plan

---

### 1. Marketing Landing Page

#### Purpose
3 jobs: **Explain → Trust → Activate**

#### Sections

**Section 1 — Hero**
- Full-viewport, `#141413` background (Dark), `#faf9f5` text (Light)
- Headline: `"Turn your experience into interview-ready proof"` (Poppins, font-light, museum-style tracking)
- Subcopy: `"Practice with AI, improve your answers, and see exactly what to work on next."` (Lora)
- CTA: `[Get interview ready]` (Accent Orange fill, sharp square corners) + `[See how it works]` (ghost, thin `#b0aea5` border)
- Subtle noise texture overlay indicating depth and craftsmanship.

**Section 2 — How it works**
- Background: `#e8e6dc` (Light Gray)
- 4 numbered steps in a strict, geometric horizontal row grid (scroll on mobile).
- Each step: architectural layout — large thin number, medium Poppins title, clinical Lora description.
- Steps: Start Interview → Get Snapshot → Practice Mocks → Improve with Reports

**Section 3 — What you get**
- Grid section, 5 product cards in a strict 3+2 non-overlapping layout.
- Cards: `#faf9f5` background, 1px `#b0aea5` border.
- Card content: Sparse text, icons replaced with pure geometric representations.
- Cards: Intro Interview, Mock Studios, Training Hub, MyStoryBoard, AI Reports

**Section 4 — Product Demo**
- Split screen: perfect asymmetrical balance. Left = UI screenshot with inner grain, right = sparse clinical description.
- Tabs: Interview UI / Transcript / Snapshot / Report preview
- "This is a live preview" badge (Accent Blue `#6a9bcc`)

**Section 5 — Why it works (Trust)**
- 4 proof pillars in a 2×2 grid with rigid borders separating each cell.
- Background: `#faf9f5`. Text: `#141413`. Accent points in `#d97757`.

**Section 6 — Footer CTA**
- Big centered minimal block: `"Ready to know where you stand?"` + `[Get interview ready]`

#### Components
- `<HeroSection />`, `<HowItWorks />`, `<FeatureCards />`, `<DemoPreview />`, `<TrustPillars />`, `<CtaFooter />`

---

### 2. Auth Screen

#### Route: `/login`

#### Layout
- Centered card on muted bg
- Left panel (desktop): brand statement + value prop
- Right panel: auth options

#### Copy
- Title: `"Create your ProofDive account"`
- Sub: `"Save your interviews, reports, and progress in one place."`

#### Auth options
```
[G]  Continue with Google
[in] Continue with LinkedIn
[✉]  Continue with Email
```

#### Rules
- No extra fields at this step
- Below buttons: `"By continuing, you agree to our Terms and Privacy Policy."` (small, zinc-400)

---

### 3. Consent Screen

#### Route: `/consent`

#### Layout
- Single centered card — max-w-lg
- Clean, legal-light

#### Copy
- Title: `"Before we begin"`
- Sub: `"ProofDive uses your interview responses to personalize feedback, reports, and training."`

#### Checkboxes

**Required (must check to proceed)**
- ☐ I agree to the Privacy Policy
- ☐ I agree to my interview responses being used to generate feedback

**Optional**
- ☐ Allow interview recording for replay and review
- ☐ Enable body language feedback *(coaching use only)*

#### Helper note (important trust UX)
> `"Recording and body language feedback are only used for coaching — not included in your score."`

#### CTA
- `[Continue →]` (blue, disabled until required boxes checked)

---

### 4. Onboarding — Two Variations

After consent, users land on the onboarding entry screen which presents **two clearly distinct paths**. The product defaults to the AI-native path but provides the simple one as an explicit fallback.

---

#### Decision Gate Screen

**Route:** `/onboarding`

Layout: Two cards side by side (or stacked on mobile), equal visual weight.

```
┌──────────────────────┐   ┌────────────────────────┐
│  ⚡ Quick Setup       │   │  🎙 Intro Interview      │
│                      │   │                        │
│  3 questions.        │   │  ~15 minutes.           │
│  Under 2 minutes.    │   │  AI-guided. No pressure.│
│                      │   │                        │
│  [Get started]       │   │  [Begin interview] ★   │
└──────────────────────┘   └────────────────────────┘
              Recommended badge on right card
```

Helper copy below cards: `"The interview gives you a personalized snapshot and stronger recommendations."`

---

## ⚡ VARIATION A — Simple Quick Setup (Form-based)

**Best for:** Users who want to skip video, are in a hurry, or feel low-trust.

### A1 — Quick Setup Form

**Route:** `/onboarding/quick`

**Layout:** Centered card, max-w-md, 3 fields only.

```
Title: "Tell us a little about yourself"
Sub:   "We'll use this to personalize your workspace."

[1] What's your name?         → text input
[2] What role are you preparing for?  → text input or dropdown
[3] Career stage               → toggle: "Fresh Graduate" / "Working Professional"

[Continue →]
```

**UX Rules:**
- No resume upload. No JD. No preferences. No account settings.
- Auto-fills profile fields from these 3 answers.
- On submit → skips directly to **dashboard** (no snapshot).

**Data extracted:**
- Name
- Target role
- Career stage

**What it cannot do (vs Variation B):**
- No personalized snapshot
- No AI-detected strengths/weaknesses
- No proof examples extracted
- Dashboard recommendations are generic, not tailored

**Post-setup state:**
- Toast: `"Your workspace is ready. Let's start practicing."`
- Dashboard CTA defaults to: `"Take your first mock interview"`

---

## 🎙 VARIATION B — AI-Native Intro Interview (Recommended)

**Best for:** First-time users who want full personalization and the real product experience.

### B1 — Intro Interview Landing

**Route:** `/onboarding/intro`

**Layout:** Centered, white, generous whitespace. Above fold only.

```
Title: "Start your first ProofDive"
Sub:   "This short interview helps us understand your background and personalize your practice."

[⏱ ~15 min]  [🎙 Video or audio]  [🟢 No scoring pressure]  [✨ Personalized setup]

[Begin interview]  (primary CTA)
"Prefer the quick form instead?"  (text link fallback → routes to /onboarding/quick)
```

### B2 — Device Check

**Route:** `/onboarding/device-check`

3 panels: Camera · Microphone · Speaker — each shows checking → ready / error.
Toggle: `Video on` / `Audio only mode`
CTA: `[Continue]` (enabled when mic ready; camera optional)

### B3 — Live Intro Interview

**Route:** `/onboarding/interview`

**Layout (Desktop):**
```
┌─────────────────────────────────────────┐
│  [ProofDive Logo]          Q 1 of 5  ⏱ │
├──────────────┬──────────────────────────┤
│  AI Avatar / │    User Camera           │
│  Waveform    │    (or audio waveform)   │
├──────────────┴──────────────────────────┤
│  "Tell me a bit about yourself..."      │
├─────────────────────────────────────────┤
│  [🔇 Mute]  [📷 Camera]  [End]         │
└─────────────────────────────────────────┘
```

**5 core questions + adaptive follow-ups (per product spec)**

AI tone: calm, direct, coach-like. No praise. No "Awesome!"

Transition phrases:
- `"Thanks. Let's go a level deeper."`
- `"Walk me through your role in that."`
- `"What changed because of your work?"`

**Adaptive follow-up triggers:**

| Gap detected | Follow-up prompt |
|---|---|
| Weak context | "What was the situation at the time?" |
| Weak ownership | "What part of that did you personally own?" |
| Weak action | "What did you actually do first?" |
| Weak result | "What changed because of your work?" |
| Weak collaboration | "Who did you have to work with?" |
| Weak reflection | "What did you learn from that?" |

### B4 — Processing Screen

**Route:** `/onboarding/processing`

```
Title: "We're preparing your starting snapshot"
Sub:   "We're organizing your answers into a personalized practice plan."

Animated sequential pills:
  ✓ Transcript processed
  ✓ Profile set up
  ⟳ Recommendations loading...
```

Auto-navigates to snapshot after 3s (mocked in V1).

### B5 — Starting Snapshot ("Aha" moment)

**Route:** `/onboarding/snapshot`

**Data extracted from interview (shown here for first time):**

| Section | Example output |
|---|---|
| **Your Profile** | Career Stage · Target Role · Industry (inferred) |
| **Strongest Signal** ✅ | "Clear communication" / "Strong ownership" |
| **Needs Work** ⚠️ | "Results need to be clearer" / "Examples too vague" |
| **Suggested Next Step** | "Take your first full mock interview" |

CTAs: `[Go to dashboard →]` + `[Take full mock interview]`

**Snapshot is only available via Variation B.** Variation A users see a generic dashboard welcome instead.

---

### Variation Comparison Summary

| | ⚡ Quick Setup | 🎙 Intro Interview |
|---|---|---|
| **Time** | < 2 min | ~15 min |
| **Fields** | 3 form fields | 5 AI questions + adaptive |
| **Snapshot** | ❌ Not generated | ✅ Personalized snapshot |
| **Strengths detected** | ❌ | ✅ |
| **Weak areas detected** | ❌ | ✅ |
| **Proof examples extracted** | ❌ | ✅ |
| **Dashboard recommendations** | Generic | Tailored |
| **Activation quality** | Low | High |
| **Best for** | Skeptics / quick tries | Committed users |

> **Product recommendation:** Default to Variation B. Variation A exists as a safety valve to prevent drop-off, not as the primary experience.

---

### 5. Device Check Screen

#### Route: `/device-check`

#### Layout
- 3 check panels: Camera · Microphone · Speaker
- Each panel: icon + status indicator (checking / ready / error)
- Toggle: `Video on` / `Audio only mode`

#### CTA
- `[Continue]` (enabled when mic is ready; camera optional)

---

### 6. Live Intro Interview Screen

#### Route: `/interview`

#### Layout (Desktop)
```
┌─────────────────────────────────────────┐
│  [ProofDive Logo]          Q 1 of 5  ⏱ │
├──────────────┬──────────────────────────┤
│              │                          │
│  AI Avatar / │    User Camera           │
│  Waveform    │    (or audio waveform)   │
│              │                          │
├──────────────┴──────────────────────────┤
│  Current question (bold, large)         │
│  "Tell me a bit about yourself..."      │
├─────────────────────────────────────────┤
│  [🔇 Mute]  [📷 Camera]  [End]         │
└─────────────────────────────────────────┘
```

#### AI Behavior Rules
- Tone: calm, direct, coach-like (not "Awesome!")
- Transitions: `"Thanks. Let's go a level deeper."` / `"Walk me through your role in that."`
- No progress anxiety — question counter subtle, not prominent

#### Questions (from spec)
1. Tell me a bit about yourself and what you're currently working toward.
2. What kind of role are you preparing for right now, and what's pulling you in that direction?
3. Tell me about a project, internship, or piece of work you're genuinely proud of.
4. What was your specific role in that, and what did you personally drive?
5. When it comes to interviews, what usually feels hardest for you?

#### Adaptive follow-ups
Shown as secondary prompts when detected — context / ownership / action / result / collaboration / reflection dimensions.

---

### 7. Processing Screen

#### Route: `/processing`

#### Layout
- Full page, white, centered
- Animated icon (spinner or morphing dot)
- Title: `"We're preparing your starting snapshot"`
- Sub: `"We're organizing your answers into a personalized practice plan."`
- 3 animated status pills (appear sequentially):
  - ✓ Transcript processed
  - ✓ Profile set up
  - ⟳ Recommendations loading...

#### Auto-navigates to `/snapshot` after 3s (mocked)

---

### 8. Starting Snapshot Screen

#### Route: `/snapshot`

#### Purpose: The "aha" moment

#### Layout
- White bg, generous padding
- Section cards with subtle border

**Section A — Your Profile**
Card: Career Stage · Target Role · Industry (inferred)

**Section B — Strongest Signal** ✅ (green badge)
Dynamic label e.g. "Clear communication" / "Strong ownership"

**Section C — Needs Work** ⚠️ (amber badge)
Dynamic label e.g. "Results need to be clearer" / "Examples need better structure"

**Section D — Suggested Next Step**
Blue card: e.g. `"Take your first full mock interview"` + button

#### CTAs
- `[Go to dashboard →]` (primary)
- `[Take full mock interview]` (accent outline)

---

### 9. Dashboard (Home)

#### Route: `/dashboard`

#### Layout: App shell with left SideNav

#### SideNav
```
  ProofDive logo
  ─────────────
  Dashboard
  Mock Interviews
  Trainings
  MyStoryBoard
  Reports
  ─────────────
  Profile
  Settings
```

#### Dashboard Sections

**Section A — Hero strip**
- `"Welcome back, [Name]"` (large)
- Sub: `"You're preparing for [Target Role]"`
- `[Start mock interview]` + `[Continue training]`

**Section B — Readiness strip** (4 stat cards)
- Current readiness label (Star/Ready/Borderline/Not Yet)
- Last activity
- Story progress (e.g. 2 of 5 examples saved)
- Training progress (e.g. Module 1: 60%)

**Section C — What to do next**
- 2–3 dynamic recommendation cards
- Each: icon + title + 1-line reason + CTA link

**Section D — Core modules** (4 large cards)
- Mock Interviews · Trainings · MyStoryBoard · Reports
- Each: last activity + quick CTA

---

### 10. Mock Interview Setup

#### Route: `/mock/setup`

#### Fields
- Target role (pre-filled from profile, editable)
- Job description (optional textarea)
- Interview style (V1: default only — no toggle needed yet)
- Device check summary

#### CTA: `[Start interview →]`

---

### 11. Live Mock Interview Screen

#### Route: `/mock/live`

#### Same layout as Intro Interview, different context
- Duration indicator: 20–25 min
- 6-question structure (per spec)
- Right panel: live transcript feed (auto-scroll)
- No scoring UI shown during interview

---

### 12. Mock Processing Screen

#### Route: `/mock/processing`

- Title: `"Analyzing your interview"`
- Sub: `"Scoring your answers, extracting evidence, and preparing your feedback."`
- 4 animated pills: Transcript · Scoring · Evidence extraction · Report ready

#### Auto-navigates to `/report/[id]`

---

### 13. Report Screen

#### Route: `/report/[id]`

#### Top area
- Overall score (large, bold)
- Readiness label: `Star` / `Ready` / `Borderline` / `Not Yet` (colored badge)
- Date · Role · `[Retake interview]` CTA

#### 4 Driver Cards (2×2 grid)
Each card:
- Driver name (Power of Thinking / Action / People / Mastery)
- Score out of 10
- 2-line AI summary
- Expand for detail

#### Interview Highlights
- Strongest answer snippet (with timestamp)
- Weakest answer snippet
- Key quote pull

#### What Needs Work
- 3–4 bullet items with icon (e.g. "⚠ Weak result framing")

#### AI Rewrite Suggestion
- Before/after answer pair
- "Why it's better" explanation (1–2 lines)

#### Suggested Next Steps
- 2–3 cards: retake / module / storyboard

---

### 14. Trainings Page

#### Route: `/trainings`

#### Layout
- Grid of module cards

#### Starter modules (V1)
1. Interview Foundations
2. Answering with CAR
3. Master the Success Drivers

#### Each card
- Module title · Short benefit · Duration · Progress bar · `Recommended` badge (if AI-suggested)

#### Lesson view
- Video embed (or placeholder in V1)
- Key takeaways list
- Mini checkpoint (1–2 questions)
- `[Practice response →]` CTA

---

### 15. MyStoryBoard

#### Route: `/storyboard`

#### Layout
- 3 sections (left sidebar nav between them)

**Section 1 — Story Arc**
- "Tell me about yourself" draft editor
- Sections: Hook → Background → Experience → Where I'm heading
- `[Save draft]` `[Preview]`

**Section 2 — Proof Examples**
- Grid of saved story cards from interviews
- Each: story title · competency tag · strength signal · `[Refine]` `[Use in interview]`

**Section 3 — Versions**
- List of saved snapshots (v1, v2…)
- Date + label

---

### 16. Profile

#### Route: `/profile`

#### Fields
- Name · Email · Auth method (read-only)
- Target role · Career stage · Industry · Experience level
- Consent preferences (can update optional ones)
- Interview preferences (video/audio default)

---

## Proposed File Changes

### [NEW] Next.js Project Bootstrap

#### [NEW] `package.json`
Tailwind CSS v3, shadcn/ui, Framer Motion, next-fonts (Inter)

#### [NEW] `tailwind.config.ts`
Custom color tokens (Anthropic colors), font family (Poppins, Lora), grain textures.

#### [NEW] `app/globals.css`
CSS custom properties for design tokens, base typography resets

---

### Marketing

#### [NEW] `app/(marketing)/page.tsx`
Full landing page assembling all 6 section components

#### [NEW] `components/marketing/HeroSection.tsx`
#### [NEW] `components/marketing/HowItWorks.tsx`
#### [NEW] `components/marketing/FeatureCards.tsx`
#### [NEW] `components/marketing/DemoPreview.tsx`
#### [NEW] `components/marketing/TrustPillars.tsx`
#### [NEW] `components/marketing/CtaFooter.tsx`

---

### Auth & Consent

#### [NEW] `app/(auth)/login/page.tsx`
#### [NEW] `app/(auth)/consent/page.tsx`

---

### Onboarding

#### [NEW] `app/(onboarding)/intro/page.tsx`
#### [NEW] `app/(onboarding)/device-check/page.tsx`
#### [NEW] `app/(onboarding)/interview/page.tsx`
#### [NEW] `components/interview/InterviewLayout.tsx`
#### [NEW] `components/interview/QuestionDisplay.tsx`
#### [NEW] `components/interview/LiveTranscript.tsx`
#### [NEW] `components/interview/VideoPanel.tsx`
#### [NEW] `components/interview/InterviewControls.tsx`
#### [NEW] `app/(onboarding)/processing/page.tsx`
#### [NEW] `app/(onboarding)/snapshot/page.tsx`

---

### App Shell

#### [NEW] `components/layout/AppShell.tsx`
#### [NEW] `components/layout/SideNav.tsx`

---

### App Pages

#### [NEW] `app/(app)/dashboard/page.tsx`
#### [NEW] `app/(app)/mock/setup/page.tsx`
#### [NEW] `app/(app)/mock/live/page.tsx`
#### [NEW] `app/(app)/mock/processing/page.tsx`
#### [NEW] `app/(app)/report/[id]/page.tsx`
#### [NEW] `components/report/DriverCard.tsx`
#### [NEW] `components/report/RewriteSuggestion.tsx`
#### [NEW] `app/(app)/trainings/page.tsx`
#### [NEW] `app/(app)/storyboard/page.tsx`
#### [NEW] `app/(app)/profile/page.tsx`

---

### Mock Data & Config

#### [NEW] `lib/mock-data.ts`
Mock user profile, interview answers, snapshot data, report scores — all typed

#### [NEW] `lib/ai-persona.ts`
Question bank, AI tone rules, adaptive follow-up logic (static for V1)

---

## Verification Plan

### Browser Walkthrough (using browser subagent)

After implementation, verify each flow sequentially:

1. **Landing page** — navigate to `http://localhost:3000`, verify all 6 sections render, hero CTA visible
2. **Auth screen** — click CTA → `/login`, verify 3 auth options render
3. **Consent** — verify required checkboxes gate the CTA
4. **Intro landing** → device check → live interview → processing → snapshot
5. **Dashboard** — all 4 sections + sidenav render
6. **Mock setup** → live mock → processing → report
7. **Trainings, StoryBoard, Profile** — all pages accessible via sidenav

### Dev Server Command
```bash
cd "/Users/tk-lpt-1039/Desktop/Proof dive"
npm run dev
```

### Design QA Checklist
- [ ] Inter font loads correctly (not system fallback)
- [ ] Bold display text hits `font-black` weight at hero
- [ ] Color tokens applied consistently (no raw hex in components)
- [ ] All CTAs have hover states (scale + shadow)
- [ ] Interview screen has zero distracting UI — focused layout only
- [ ] Report driver cards are visually distinct with color-coded scores
- [ ] Mobile nav collapses sidenav to bottom bar
