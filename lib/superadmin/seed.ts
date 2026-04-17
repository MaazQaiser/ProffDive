import { defaultModuleAccess } from "./config/product-modules";
import type {
  EvaluationConfig,
  FunnelStep,
  Organization,
  OrgUsageStats,
  Partner,
  Plan,
  TrainingModule,
  OverviewMetrics,
  PlatformSettings,
} from "./types";

const access = defaultModuleAccess();

export const SEED_PLANS: Plan[] = [
  {
    id: "plan_starter",
    name: "Starter",
    priceCents: 2900,
    billingType: "monthly",
    status: "active",
    moduleAccess: {
      ...access,
      training: true,
      mock_interviews: true,
    },
    limits: {
      mock_interviews_per_month: 5,
      storyboard_generations: 10,
      reports_per_month: 3,
      training_access: "limited",
    },
    creditsPerMonth: 100,
  },
  {
    id: "plan_pro",
    name: "Professional",
    priceCents: 9900,
    billingType: "monthly",
    status: "active",
    moduleAccess: {
      training: true,
      mystoryboard: true,
      mock_interviews: true,
      reports: true,
      analytics: true,
    },
    limits: {
      mock_interviews_per_month: 30,
      storyboard_generations: 100,
      reports_per_month: 50,
      training_access: "full",
    },
    creditsPerMonth: 500,
  },
];

export const SEED_ORGS: Organization[] = [
  {
    id: "org_acme",
    name: "Acme Corp",
    planId: "plan_pro",
    status: "active",
    userCount: 42,
    limits: { mock_interviews_per_month: 30 },
    invites: [{ email: "admin@acme.com", sentAt: "2026-04-10T09:00:00.000Z", status: "sent" }],
    subscription: { status: "active", renewsAt: "2026-05-01" },
  },
  {
    id: "org_beta",
    name: "Beta Labs",
    planId: "plan_starter",
    status: "active",
    userCount: 12,
    limits: {},
    invites: [],
    subscription: { status: "active", renewsAt: "2026-04-20" },
  },
];

export const DEFAULT_EVALUATION: EvaluationConfig = {
  aiPrompt: "Evaluate the candidate's answer for clarity, structure, and relevance.",
  competencyMapping: "Communication: primary; Problem solving: secondary.",
  scoringLevels: {
    1: "Needs significant improvement",
    2: "Below expectations",
    3: "Meets expectations",
    4: "Exceeds expectations",
    5: "Outstanding",
  },
  passCondition: "Average score ≥ 3 across competencies",
};

export const SEED_MODULES: TrainingModule[] = [
  {
    id: "tm_essentials",
    title: "Interview Essentials",
    description: "Foundations for strong interview performance.",
    category: "Core",
    status: "published",
    lessons: [
      { id: "l1", title: "CAR framework", body: "Context, Action, Result.", order: 0 },
      { id: "l2", title: "First impressions", body: "Opening minutes matter.", order: 1 },
    ],
    checkpoints: [
      {
        id: "c1",
        type: "mcq",
        order: 0,
        question: "What does CAR stand for?",
        options: ["Context, Action, Result", "Challenge, Answer, Review", "Care, Act, Reflect"],
        correctIndex: 0,
      },
      {
        id: "c2",
        type: "ai_practice",
        order: 1,
        prompt: "Describe a time you influenced a stakeholder.",
        durationHint: "2 min",
      },
    ],
    evaluation: DEFAULT_EVALUATION,
    settings: {
      published: true,
      gatingRules: "Complete lesson 1 before checkpoint 1.",
    },
  },
  {
    id: "tm_draft",
    title: "Advanced Negotiation",
    description: "Draft module for power skills.",
    category: "Elective",
    status: "draft",
    lessons: [],
    checkpoints: [],
    evaluation: DEFAULT_EVALUATION,
    settings: { published: false, gatingRules: "" },
  },
];

export const SEED_PARTNERS: Partner[] = [
  {
    id: "pt_1",
    name: "Talent Partners Inc",
    type: "B2B",
    status: "active",
    revenueCents: 125000_00,
    commission: { model: "percent", percent: 15, notes: "Net new ARR" },
    referrals: [
      { id: "r1", name: "Acme referral", convertedAt: "2026-03-01", valueCents: 9900_00 },
    ],
    earnings: [
      { month: "2026-03", amountCents: 12000_00 },
      { month: "2026-04", amountCents: 8500_00 },
    ],
    performance: [
      { label: "Conversion rate", value: 0.22 },
      { label: "Avg deal", value: 4500 },
    ],
  },
];

export const SEED_OVERVIEW: OverviewMetrics = {
  totalOrganizations: 2,
  totalActiveUsers: 1284,
  interviewReadinessTrend: [
    { date: "2026-04-01", value: 62 },
    { date: "2026-04-02", value: 64 },
    { date: "2026-04-03", value: 63 },
    { date: "2026-04-04", value: 67 },
    { date: "2026-04-05", value: 70 },
    { date: "2026-04-06", value: 68 },
    { date: "2026-04-07", value: 72 },
  ],
  mockInterviewVolume: [
    { date: "2026-04-01", count: 120 },
    { date: "2026-04-02", count: 132 },
    { date: "2026-04-03", count: 128 },
    { date: "2026-04-04", count: 145 },
    { date: "2026-04-05", count: 151 },
    { date: "2026-04-06", count: 138 },
    { date: "2026-04-07", count: 160 },
  ],
  storyboardGenerations: [
    { date: "2026-04-01", count: 89 },
    { date: "2026-04-02", count: 94 },
    { date: "2026-04-03", count: 91 },
    { date: "2026-04-04", count: 102 },
    { date: "2026-04-05", count: 98 },
    { date: "2026-04-06", count: 105 },
    { date: "2026-04-07", count: 110 },
  ],
  reportGenerations: [
    { date: "2026-04-01", count: 45 },
    { date: "2026-04-02", count: 52 },
    { date: "2026-04-03", count: 48 },
    { date: "2026-04-04", count: 55 },
    { date: "2026-04-05", count: 60 },
    { date: "2026-04-06", count: 58 },
    { date: "2026-04-07", count: 62 },
  ],
  featureUsage: [
    { feature: "Mock interviews", value: 420 },
    { feature: "Storyboard", value: 310 },
    { feature: "Training", value: 280 },
    { feature: "Reports", value: 190 },
  ],
};

export const SEED_SETTINGS: PlatformSettings = {
  security: { mfaRequired: false, sessionMaxHours: 24 },
  privacy: { marketingConsentDefault: false, dataExportEnabled: true },
  featureFlags: {
    beta_storyboard_v2: false,
    ai_coach_experimental: true,
  },
};

export const SEED_FUNNEL: FunnelStep[] = [
  { stage: "Build", count: 4200 },
  { stage: "Learn", count: 3100 },
  { stage: "Practice", count: 2400 },
  { stage: "Ready", count: 1800 },
];

/** Simple time series for performance insights report */
export const SEED_PERFORMANCE_SERIES = [
  { name: "p50 latency (ms)", data: [120, 118, 122, 115, 110, 108, 105] },
  { name: "Error rate %", data: [0.4, 0.35, 0.32, 0.3, 0.28, 0.27, 0.25] },
];

export const SEED_ORG_USAGE: Record<string, OrgUsageStats> = {
  org_acme: {
    mockInterviews: 128,
    storyboards: 56,
    reports: 34,
    trainingsCompleted: 22,
  },
  org_beta: {
    mockInterviews: 42,
    storyboards: 18,
    reports: 9,
    trainingsCompleted: 11,
  },
};

export function getOrgUsage(orgId: string): OrgUsageStats {
  return (
    SEED_ORG_USAGE[orgId] ?? {
      mockInterviews: 0,
      storyboards: 0,
      reports: 0,
      trainingsCompleted: 0,
    }
  );
}
