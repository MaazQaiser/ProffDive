import type { ProductModuleId } from "./product-modules";

/** Which limit fields apply when a product module is enabled — drives dynamic plan/org forms. */
export type LimitFieldDef = {
  key: string;
  label: string;
  kind: "number" | "select";
  /** Required module to be enabled for this limit to show */
  moduleId: ProductModuleId;
  options?: { value: string; label: string }[];
};

export const PLAN_LIMIT_FIELDS: LimitFieldDef[] = [
  {
    key: "mock_interviews_per_month",
    label: "Mock interviews / month",
    kind: "number",
    moduleId: "mock_interviews",
  },
  {
    key: "storyboard_generations",
    label: "Storyboard generations",
    kind: "number",
    moduleId: "mystoryboard",
  },
  {
    key: "reports_per_month",
    label: "Reports / month",
    kind: "number",
    moduleId: "reports",
  },
  {
    key: "training_access",
    label: "Training access",
    kind: "select",
    moduleId: "training",
    options: [
      { value: "full", label: "Full" },
      { value: "limited", label: "Limited" },
    ],
  },
];
