/**
 * Repository contracts — implemented by client hooks + localStorage (`lib/superadmin/hooks.ts`).
 * Swap implementations for API-backed services without changing route components.
 */

import type {
  Organization,
  OverviewMetrics,
  Partner,
  Plan,
  PlatformSettings,
  TrainingModule,
} from "./types";

export interface PlansRepository {
  list(): Plan[];
  get(id: string): Plan | undefined;
  create(input: Omit<Plan, "id">): string;
  update(id: string, patch: Partial<Plan>): void;
  remove(id: string): void;
}

export interface OrganizationsRepository {
  list(): Organization[];
  get(id: string): Organization | undefined;
  create(input: Omit<Organization, "id">): string;
  update(id: string, patch: Partial<Organization>): void;
}

export interface PartnersRepository {
  list(): Partner[];
  get(id: string): Partner | undefined;
  create(input: Omit<Partner, "id" | "referrals" | "earnings" | "performance">): string;
  update(id: string, patch: Partial<Partner>): void;
}

export interface TrainingContentRepository {
  list(): TrainingModule[];
  get(id: string): TrainingModule | undefined;
  create(input: Omit<TrainingModule, "id">): string;
  update(id: string, patch: Partial<TrainingModule>): void;
}

export interface AnalyticsRepository {
  getOverview(): OverviewMetrics;
}

export interface SettingsRepository {
  get(): PlatformSettings;
  update(patch: Partial<PlatformSettings>): void;
}
