/**
 * Shared mock payload for Analytics & AI Coaching (/report/[id]).
 * Replace with API data when wired.
 */

export interface ReportQuestion {
  q: string;
  driver: string;
  driverAccent: string;
  score: number;
  taken: string;
  ideal: string;
  car: { label: string; ok: boolean; note: string }[];
  improve: { heading: string; detail: string }[];
  showAI?: boolean;
  youSaid?: string;
  aiSaid?: string;
  aiTips?: string[];
}

export interface TranscriptLine {
  role: "interviewer" | "user";
  speaker: string;
  time: string;
  text: string;
  flag?: string;
}

export interface CarRow {
  label: string;
  status: string;
  dot: string;
  note: string;
}

export interface DriverDef {
  id: "thinking" | "action" | "people" | "mastery";
  title: string;
  score: number;
  pct: number;
  accent: string;
}

/** Pillar labels + sub-skills shown in competency breakdown modals */
export const COMPETENCY_DETAILS: Record<
  DriverDef["id"],
  { pillar: string; subtitle: string; skills: string[] }
> = {
  thinking: {
    pillar: "Power of Thinking",
    subtitle: "Strategic",
    skills: ["Analytical Thinking", "Prioritization", "Decision-Making Agility"],
  },
  action: {
    pillar: "Power of Action",
    subtitle: "Leadership",
    skills: ["Ownership", "Initiative & Follow-through", "Embraces Change"],
  },
  people: {
    pillar: "Power of People",
    subtitle: "People",
    skills: ["Influence", "Collaboration & Inclusion", "Grows Capability"],
  },
  mastery: {
    pillar: "Power of Mastery",
    subtitle: "Technical",
    skills: ["Functional Knowledge", "Execution", "Innovation"],
  },
};

const PILLAR_IDS_FOR_FOCUS: readonly DriverDef["id"][] = ["thinking", "action", "people", "mastery"];

/** Twelve sub-skills — used as rotating “focus facet” tags on each question row */
export const SUB_SKILL_FOCUS_LABELS: readonly string[] = PILLAR_IDS_FOR_FOCUS.flatMap(
  (id) => COMPETENCY_DETAILS[id].skills
);

/**
 * Which facet label to show for question N — deterministic pseudo-shuffle (SSR-safe, no Math.random).
 * Cycles every 12 questions so facets repeat in a varied order.
 */
const FOCUS_LABEL_PERM: readonly number[] = [7, 2, 10, 0, 8, 4, 11, 1, 9, 3, 6, 5];

export function focusFacetLabelForQuestionIndex(questionIndex: number): string {
  const skillIndex = FOCUS_LABEL_PERM[questionIndex % FOCUS_LABEL_PERM.length]!;
  return SUB_SKILL_FOCUS_LABELS[skillIndex]!;
}

/** Session-level AI coaching spotlight (maps to a question in MOCK_QUESTIONS) */
export const MOCK_SESSION_AI_COACHING = {
  /** 0-based index into MOCK_QUESTIONS */
  questionIndex: 1,
  bodyLanguage: [
    "Limited open posture — shoulders were slightly closed for ~40% of the answer; square up to camera to project confidence.",
    "Eye contact drifted downward when stating results; brief upward engagement on metrics reads stronger.",
  ],
  grammar: [
    "Subject–verb agreement: “The data were inconsistent” → “The data was inconsistent” (data is singular here).",
    "Run-on: split the second sentence after “caching layer” for clarity.",
  ],
  deliveryEthics: [
    "Gesture: hands dropped out of frame during the key result — keep hands visible through the payoff line.",
    "Pace: you sped up through ownership; slow slightly on “I led…” so credit lands clearly.",
  ],
  fillerWords:
    "You leaned on “like” and “kind of” as bridges (~9 times in 90s). Swap for a half-second pause — it reads as more executive.",
  appearanceTip:
    "Pro tip: solid mid-tone top (navy, charcoal, or muted teal) with minimal pattern reads best on video and keeps focus on your face.",
} as const;

export interface SessionMeta {
  /** Hiring org / client — shown on per-question rows as the company tag */
  companyName: string;
  interviewName: string;
  role: string;
  exp: string;
  date: string;
  duration: string;
  pillars: string[];
  questionCount: number;
}

export const MOCK_SESSION_META: SessionMeta = {
  companyName: "Vertex Global",
  interviewName: "Role-Based Mock",
  role: "Business Analyst",
  exp: "3 yrs · L3+",
  date: "Oct 24, 2024",
  duration: "30 min",
  pillars: ["Thinking", "Action", "People", "Mastery"],
  questionCount: 8,
};

export const MOCK_DRIVERS: DriverDef[] = [
  { id: "thinking", title: "Thinking", score: 3.2, pct: 64, accent: "#D97706" },
  { id: "action", title: "Action", score: 2.8, pct: 56, accent: "#0087A8" },
  { id: "people", title: "People", score: 4.1, pct: 82, accent: "#16A34A" },
  { id: "mastery", title: "Mastery", score: 3.6, pct: 72, accent: "#7C3AED" },
];

export const MOCK_CAR_ROWS: CarRow[] = [
  { label: "Context", status: "Strong", dot: "#10B981", note: "Clear background and situation explained well by candidate" },
  { label: "Action", status: "Partial", dot: "#F59E0B", note: "Good detail but personal role wasn't always fully articulated" },
  { label: "Result", status: "Weak", dot: "#EF4444", note: "Outcomes were vague, non-numeric across most answers" },
];

export const MOCK_QUESTIONS: ReportQuestion[] = [
  {
    q: "Tell me about a time you solved a complex problem.",
    driver: "Thinking",
    driverAccent: "#D97706",
    score: 3.6,
    taken: "2m 14s",
    ideal: "3–4 min",
    car: [
      { label: "Context", ok: true, note: "Situation clearly framed" },
      { label: "Action", ok: true, note: "Steps were specific" },
      { label: "Result", ok: false, note: "No measurable outcome given" },
    ],
    improve: [
      { heading: "Missing analysis layer", detail: "Walk through your reasoning before stating the action." },
      { heading: "No quantified outcome", detail: "Add one metric: time saved, % improvement, or cost impact." },
    ],
  },
  {
    q: "Describe a time you took initiative on something no one asked you to do.",
    driver: "Action",
    driverAccent: "#0087A8",
    score: 2.8,
    taken: "1m 42s",
    ideal: "3–4 min",
    showAI: true,
    car: [
      { label: "Context", ok: true, note: "Background given briefly" },
      { label: "Action", ok: false, note: "Your specific role unclear" },
      { label: "Result", ok: false, note: "Outcome was vague, no metrics" },
    ],
    improve: [
      { heading: "Ownership not stated", detail: "Say explicitly 'I decided to…' not 'we decided to…'" },
      { heading: "Result too vague", detail: "'It went well' → 'delivery improved by X%'" },
      { heading: "Answer too short", detail: "You used 1m 42s. Aim for 3–4 min. Expand context and result." },
    ],
    youSaid:
      "We had a performance issue in our system. I looked into it and found the problem was in our caching layer. I fixed it and the system got faster.",
    aiSaid:
      "Our checkout service was experiencing a 3-second latency spike during peak hours — causing a 12% drop-off in conversions. I led the root cause analysis, identified our Redis caching layer was expiring keys too aggressively, redesigned the TTL strategy and added a read-through fallback. Within 48 hours, latency dropped to under 400ms — a 7× improvement — and checkout completions recovered fully.",
    aiTips: [
      "Context: Business impact stated upfront",
      "Action: Your specific role clearly defined",
      "Result: Quantified with 7× improvement metric",
    ],
  },
  {
    q: "Give me an example of how you handled a conflict with a stakeholder.",
    driver: "People",
    driverAccent: "#16A34A",
    score: 4.1,
    taken: "3m 28s",
    ideal: "3–4 min",
    car: [
      { label: "Context", ok: true, note: "Tension framed clearly" },
      { label: "Action", ok: true, note: "Empathy and steps shown" },
      { label: "Result", ok: true, note: "Outcome clearly stated" },
    ],
    improve: [
      {
        heading: "Add soft metrics",
        detail: "Stakeholder satisfaction or reduced escalation frequency would sharpen the result.",
      },
    ],
  },
  {
    q: "What's the most technically complex thing you've worked on?",
    driver: "Mastery",
    driverAccent: "#7C3AED",
    score: 3.2,
    taken: "2m 55s",
    ideal: "3–4 min",
    car: [
      { label: "Context", ok: true, note: "Domain explained adequately" },
      { label: "Action", ok: false, note: "Too surface-level on technical specifics" },
      { label: "Result", ok: false, note: "No depth on impact or what you learned" },
    ],
    improve: [
      { heading: "Lacked technical depth", detail: "Name the specific tech, pattern or principle you applied." },
      { heading: "No outcome or learning", detail: "What did this teach you? What would you do differently?" },
    ],
  },
  {
    q: "Tell me about a time you had to work with incomplete or ambiguous information.",
    driver: "Thinking",
    driverAccent: "#D97706",
    score: 3.4,
    taken: "2m 21s",
    ideal: "3–4 min",
    car: [
      { label: "Context", ok: true, note: "Ambiguity framed clearly" },
      { label: "Action", ok: true, note: "You described how you gathered signals" },
      { label: "Result", ok: false, note: "Outcome wasn’t tied to a clear metric" },
    ],
    improve: [
      { heading: "State your decision criteria", detail: "Explain how you chose a path with limited info." },
      { heading: "Quantify the outcome", detail: "Add a metric: reduced risk, time saved, or accuracy gain." },
    ],
  },
  {
    q: "Describe a time you influenced someone without formal authority.",
    driver: "People",
    driverAccent: "#16A34A",
    score: 3.9,
    taken: "3m 05s",
    ideal: "3–4 min",
    car: [
      { label: "Context", ok: true, note: "Stakeholders and stakes were clear" },
      { label: "Action", ok: true, note: "You used empathy + data to align" },
      { label: "Result", ok: true, note: "Decision landed and moved forward" },
    ],
    improve: [
      { heading: "Add one concrete artifact", detail: "Mention the doc, brief, or deck you used to align." },
    ],
  },
  {
    q: "Tell me about a time you delivered results under a tight deadline.",
    driver: "Action",
    driverAccent: "#0087A8",
    score: 3.0,
    taken: "2m 02s",
    ideal: "3–4 min",
    car: [
      { label: "Context", ok: true, note: "Deadline and constraints were stated" },
      { label: "Action", ok: false, note: "Trade-offs and prioritization were vague" },
      { label: "Result", ok: false, note: "Impact wasn’t measurable" },
    ],
    improve: [
      { heading: "Show prioritization", detail: "Name what you cut, delayed, or de-scoped and why." },
      { heading: "Measure the impact", detail: "Add one metric: time-to-launch, adoption, or revenue impact." },
    ],
  },
  {
    q: "What’s a mistake you made at work, and what did you learn from it?",
    driver: "Mastery",
    driverAccent: "#7C3AED",
    score: 3.5,
    taken: "3m 11s",
    ideal: "3–4 min",
    car: [
      { label: "Context", ok: true, note: "Mistake explained with enough detail" },
      { label: "Action", ok: true, note: "You owned the correction steps" },
      { label: "Result", ok: true, note: "Learning was explicit and forward-looking" },
    ],
    improve: [
      { heading: "Tighten the setup", detail: "Get to the mistake sooner; keep context to 1–2 sentences." },
    ],
  },
];

export const MOCK_TRANSCRIPT: TranscriptLine[] = [
  {
    role: "interviewer",
    speaker: "AI Interviewer",
    time: "0:00",
    text: "Tell me about a time you solved a complex problem.",
  },
  {
    role: "user",
    speaker: "You",
    time: "0:08",
    text: "I had to untangle a billing discrepancy that was affecting enterprise customers. I mapped the data flow, found a race in our sync job, and coordinated a fix with finance.",
  },
  {
    role: "interviewer",
    speaker: "AI Interviewer",
    time: "2:20",
    text: "Describe a time you took initiative on something no one asked you to do.",
  },
  {
    role: "user",
    speaker: "You",
    time: "2:26",
    text: "We had a performance issue in our system. I looked into the caching layer and implemented a TTL change...",
    flag: "result too vague",
  },
  {
    role: "interviewer",
    speaker: "AI Interviewer",
    time: "4:10",
    text: "Give me an example of how you handled a conflict with a stakeholder.",
  },
  {
    role: "user",
    speaker: "You",
    time: "4:15",
    text: "The product lead and I disagreed on prioritization. I ran a structured session with data on each option and we aligned on a roadmap.",
  },
  {
    role: "interviewer",
    speaker: "AI Interviewer",
    time: "7:45",
    text: "What's the most technically complex thing you've worked on?",
  },
  {
    role: "user",
    speaker: "You",
    time: "7:50",
    text: "A real-time analytics pipeline — we had to balance throughput with correctness. We shipped in stages and added fail-safes.",
    flag: "answer could go deeper",
  },
];

export const MOCK_SUMMARY_CHIPS = {
  strongest: { label: "Strongest: Q3 — Stakeholder conflict", score: "4.1" },
  gap: { label: "Gap: Q2 — Action clarity & quantified result", score: "2.8" },
};

export const REC_TRAINING_FEATURED = {
  title: "Behavioural Answer Structure (CAR Method)",
  duration: "18 min",
  desc: "Turn raw experience into sharp, memorable interview answers using a proven structured framework.",
  href: "/trainings",
  thumbUnsplash: "1552664730-d307ca884978",
};

/** Slugs from lib/trainings-data — shown as 3-card grid at bottom */
export const SUGGESTED_TRAINING_SLUGS = ["behavioral-car-method", "handling-ambiguity", "stakeholder-communication"] as const;

export function getOverallScore(drivers: DriverDef[]): number {
  return parseFloat((drivers.reduce((s, d) => s + d.score, 0) / drivers.length).toFixed(1));
}
