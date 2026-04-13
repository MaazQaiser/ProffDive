/**
 * Proofy AI-native onboarding — scripted copy + voice keyword lists (ProofDive).
 */

export type ProofyPhase =
  | "hero"
  | "intro"
  | "qualification"
  | "experience_years"
  | "target_role"
  | "resume"
  | "guidance"
  | "journey";

export type JourneyId = "practice_prep" | "storyboard" | "mock";

export type QualificationId =
  | "undergrad"
  | "postgrad"
  | "graduate"
  | "diploma-holder"
  | "experienced";

export type ExpBracket = "1-5" | "5-10" | "10+";

export const QUALIFICATION_OPTIONS: {
  id: QualificationId;
  label: string;
  sub: string;
  voice: string[];
}[] = [
  {
    id: "undergrad",
    label: "Undergraduate",
    sub: "Currently in an undergraduate program",
    voice: [
      "undergraduate",
      "undergrad",
      "under grad",
      "college student",
      "bachelor",
      "bachelors",
      "uni student",
      "university student",
      "still in school",
    ],
  },
  {
    id: "postgrad",
    label: "Postgraduate",
    sub: "Master's, doctoral, or post-doc",
    voice: [
      "postgraduate",
      "post graduate",
      "postgrad",
      "masters",
      "master's",
      "phd",
      "doctoral",
      "doctorate",
      "grad school",
    ],
  },
  {
    id: "graduate",
    label: "Graduate",
    sub: "Completed a degree; early career",
    voice: ["graduate", "graduated", "recent grad", "new grad", "finished school"],
  },
  {
    id: "diploma-holder",
    label: "Diploma holder",
    sub: "Diploma or equivalent pathway",
    voice: ["diploma", "diploma holder", "associate", "certificate", "trade school"],
  },
  {
    id: "experienced",
    label: "Experienced professional",
    sub: "Working full-time in your field",
    voice: [
      "experienced",
      "experienced professional",
      "professional",
      "working professional",
      "working",
      "full time",
      "full-time",
      "industry",
      "years of experience",
      "i work",
      "job",
    ],
  },
];

export const EXP_BRACKET_OPTIONS: {
  id: ExpBracket;
  label: string;
  voice: string[];
}[] = [
  {
    id: "1-5",
    label: "1–5 years",
    voice: [
      "1 to 5",
      "1-5",
      "one to five",
      "one through five",
      "two years",
      "three years",
      "four years",
      "between one and five",
      "less than five",
    ],
  },
  {
    id: "5-10",
    label: "5–10 years",
    voice: [
      "5 to 10",
      "5-10",
      "five to ten",
      "six years",
      "seven years",
      "eight years",
      "nine years",
      "between five and ten",
    ],
  },
  {
    id: "10+",
    label: "10+ years",
    voice: [
      "10 plus",
      "10+",
      "ten plus",
      "more than ten",
      "fifteen",
      "twenty",
      "senior",
      "veteran",
    ],
  },
];

export const JOURNEY_WIDGETS: {
  id: JourneyId;
  title: string;
  body: string;
  href: string;
  voice: string[];
}[] = [
  {
    id: "practice_prep",
    title: "Practice & interview prep",
    body: "Build fundamentals before high-stakes sessions.",
    href: "/trainings/interview-essentials",
    voice: [
      "practice",
      "prep",
      "preparation",
      "essentials",
      "interview prep",
      "interview essentials",
      "practice interview",
      "first",
      "get started",
      "learning",
    ],
  },
  {
    id: "storyboard",
    title: "Curated storyboard",
    body: "Shape CAR stories that match your target roles.",
    href: "/storyboard",
    voice: ["storyboard", "curated", "stories", "car", "second"],
  },
  {
    id: "mock",
    title: "Mock interview",
    body: "Run a realistic session when you are ready.",
    href: "/mock/setup",
    voice: ["mock interview", "mock", "simulate", "simulation", "third", "full mock"],
  },
];

export const TRAINING_CARDS: {
  title: string;
  body: string;
  href: string;
  voice: string[];
}[] = [
  {
    title: "Interview Essentials",
    body: "Foundational preparation before practice.",
    href: "/trainings/interview-essentials",
    voice: ["interview essentials", "essentials", "first card"],
  },
  {
    title: "Competency model",
    body: "How ProofDive evaluates and develops you.",
    href: "/trainings/success-drivers-deep-dive",
    voice: ["competency", "model", "pillars", "second"],
  },
  {
    title: "Go to training module",
    body: "Browse all guided modules.",
    href: "/trainings",
    voice: ["training", "modules", "browse", "third", "all courses"],
  },
];

export const PILLAR_COPY: {
  name: "Thinking" | "Action" | "People" | "Mastery";
  title: string;
  definition: string;
  why: string;
}[] = [
  {
    name: "Thinking",
    title: "Thinking",
    definition: "How you frame problems and use evidence.",
    why: "Interviewers probe whether you diagnose before you prescribe.",
  },
  {
    name: "Action",
    title: "Action",
    definition: "What you drive and ship under constraints.",
    why: "They want ownership, prioritization, and follow-through.",
  },
  {
    name: "People",
    title: "People",
    definition: "How you align, influence, and resolve conflict.",
    why: "Influence without authority is a senior signal.",
  },
  {
    name: "Mastery",
    title: "Mastery",
    definition: "Depth, outcomes, and reflection.",
    why: "Credibility comes from measurable impact and self-awareness.",
  },
];

export const INTRO_LINES = [
  "Hi — I'm Proofy, your ProofDive onboarding agent.",
  "I'll help you get started and guide you to the right path based on where you are today.",
  "Let's begin.",
];

/** Typed + spoken after resume/JD — pillars only; track choice copy lives on the journey screen. */
export const GUIDANCE_LINES = [
  "Great — I have what I need to guide you.",
  "ProofDive is built around a competency system with four pillars: Thinking, Action, People, and Mastery. They shape how you prepare and how your readiness grows over time.",
  "Thinking is how you frame problems and use evidence. Action is what you ship under constraints. People is alignment and influence. Mastery is depth, outcomes, and reflection.",
];

/** Shown (and spoken) on the journey step with the three track cards. */
export const JOURNEY_TRACK_CHOICE_LINE =
  "Next, you'll choose a starting track — practice essentials, a curated storyboard, or a mock interview when you are ready.";

export const FOUNDATION_LINE =
  "ProofDive is built around a competency-based system — four pillars that shape how you prepare and how readiness improves over time.";

export const DEMO_OFFER_LINES = [
  "I can show a quick walkthrough so you see how the platform works before training.",
  "Would you like to watch it?",
];

export const TRANSITION_TO_TRAINING = "Perfect — let's move into your starting modules.";

export const GUIDED_JOURNEY_COPY: Record<
  "training" | "story" | "mock" | "report",
  { title: string; doNext: string; why: string }
> = {
  training: {
    title: "Trainings (step 1/4)",
    doNext: "In Milestone Progress: do Step 1 Reading → Step 2 Video → Step 3 Quiz → Step 4 Workshop.",
    why: "Milestones unlock in order; Workshop completion moves you to Storyboard.",
  },
  story: {
    title: "StoryBoard (step 2/4)",
    doNext: "Create your story → then refine CAR blocks and Save.",
    why: "This becomes your reusable answer bank (clear, structured answers).",
  },
  mock: {
    title: "Mock interview (step 3/4)",
    doNext: "Start the session. Keep answers ~1–2 minutes.",
    why: "Pressure-test delivery across all pillars.",
  },
  report: {
    title: "Report (step 4/4)",
    doNext: "Review: Overall score → 4 pillars → Overall summary → Q-by-Q → Recording → AI coaching.",
    why: "This tells you exactly what to fix next (with evidence).",
  },
};
