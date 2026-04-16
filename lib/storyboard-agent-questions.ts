export type AgentQuestion = {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  phase: string;
  question: string;
  sample: string;
};

export const STORYBOARD_AGENT_QUESTIONS: AgentQuestion[] = [
  {
    id: 1,
    phase: "Goal / Objective",
    question: "First — what were you trying to achieve, and why was it tricky?",
    sample:
      "We had to reduce first-week churn from 38% to under 20% before our next funding milestone. It was hard because the causes were spread across onboarding UX, lifecycle timing, and a paywall bug that was difficult to reproduce.",
  },
  {
    id: 2,
    phase: "Breakdown + Tools",
    question: "How did you break it down? (What did you look at first, and what tools/data did you use?)",
    sample:
      "I mapped the flow into steps, tagged drop-off in analytics, talked to 12 new users, and looked for where time-to-value spiked. That showed exits clustered around step three and the paywall, so we focused there first.",
  },
  {
    id: 3,
    phase: "Prioritization",
    question: "How did you decide what to do first? What did you consider before choosing?",
    sample:
      "I scored options on impact, effort, risk, and speed of learning. We skipped a full redesign and started with paywall fixes plus one email experiment because it tested the riskiest assumption quickly.",
  },
  {
    id: 4,
    phase: "Execution",
    question: "What did you personally do to drive it forward? (Concrete steps are perfect.)",
    sample:
      "I wrote a one-pager with acceptance criteria, broke the work into small sprints, paired with engineering on the defect, and used a lightweight launch checklist. Daily check-ins kept blockers from lingering.",
  },
  {
    id: 5,
    phase: "People",
    question: "Who else was involved, and how did you handle alignment or resistance?",
    sample:
      "Marketing wanted brand-perfect messaging, finance worried about discounting, and engineering feared scope creep. I ran a short workshop with funnel clips and numbers, agreed on guardrails, and documented trade-offs so decisions stayed clear.",
  },
  {
    id: 6,
    phase: "Outcome",
    question: "What happened in the end? Any results — and what did you learn?",
    sample:
      "Churn dropped to ~16% within six weeks, saving roughly $400K ARR. I learned to pull analytics in during discovery, and to bias toward experiments that falsify assumptions fast.",
  },
];

