import type { ProductModuleId } from "./config/product-modules";

export type OrgStatus = "active" | "inactive";
export type PlanStatus = "active" | "archived";
export type BillingType = "monthly" | "yearly" | "custom";
export type PartnerType = "B2B" | "Influencer" | "Recruiter";
export type PartnerStatus = "active" | "inactive";
export type TrainingModuleStatus = "draft" | "published";
export type CheckpointType = "mcq" | "ai_practice";

export type OrgLimits = Record<string, number | string>;

export interface OrgInvite {
  email: string;
  sentAt: string;
  status: "sent" | "failed";
}

export interface Organization {
  id: string;
  name: string;
  planId: string;
  status: OrgStatus;
  userCount: number;
  limits: OrgLimits;
  invites?: OrgInvite[];
  subscription?: {
    status: string;
    renewsAt?: string;
  };
}

export interface Plan {
  id: string;
  name: string;
  priceCents: number;
  billingType: BillingType;
  status: PlanStatus;
  moduleAccess: Record<ProductModuleId, boolean>;
  /** Numeric limits + training_access string */
  limits: Record<string, number | string>;
  creditsPerMonth?: number;
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  revenueCents: number;
  commission: {
    model: "percent" | "flat";
    percent?: number;
    amountCents?: number;
    notes?: string;
  };
  referrals: { id: string; name: string; convertedAt: string; valueCents: number }[];
  earnings: { month: string; amountCents: number }[];
  performance: { label: string; value: number }[];
}

export interface Lesson {
  id: string;
  title: string;
  body: string;
  order: number;
}

export interface CheckpointBase {
  id: string;
  order: number;
}

export interface CheckpointMcq extends CheckpointBase {
  type: "mcq";
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CheckpointAiPractice extends CheckpointBase {
  type: "ai_practice";
  prompt: string;
  durationHint?: string;
}

export type Checkpoint = CheckpointMcq | CheckpointAiPractice;

export interface EvaluationConfig {
  aiPrompt: string;
  competencyMapping: string;
  /** Level 1–5 descriptions */
  scoringLevels: Record<1 | 2 | 3 | 4 | 5, string>;
  passCondition: string;
}

export interface TrainingModuleSettings {
  published: boolean;
  gatingRules: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  status: TrainingModuleStatus;
  lessons: Lesson[];
  checkpoints: Checkpoint[];
  evaluation: EvaluationConfig;
  settings: TrainingModuleSettings;
}

export interface OverviewMetrics {
  totalOrganizations: number;
  totalActiveUsers: number;
  interviewReadinessTrend: { date: string; value: number }[];
  mockInterviewVolume: { date: string; count: number }[];
  storyboardGenerations: { date: string; count: number }[];
  reportGenerations: { date: string; count: number }[];
  featureUsage: { feature: string; value: number }[];
}

export interface OrgUsageStats {
  mockInterviews: number;
  storyboards: number;
  reports: number;
  trainingsCompleted: number;
}

export interface FunnelStep {
  stage: string;
  count: number;
}

export interface PlatformSettings {
  security: {
    mfaRequired: boolean;
    sessionMaxHours: number;
  };
  privacy: {
    marketingConsentDefault: boolean;
    dataExportEnabled: boolean;
  };
  featureFlags: Record<string, boolean>;
}
