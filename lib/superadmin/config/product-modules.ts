/** Product areas that can be toggled on a plan — single source of truth for checklists. */
export const PRODUCT_MODULES = [
  { id: "training", label: "Training" },
  { id: "mystoryboard", label: "MyStoryBoard" },
  { id: "mock_interviews", label: "Mock Interviews" },
  { id: "reports", label: "Reports" },
  { id: "analytics", label: "Analytics" },
] as const;

export type ProductModuleId = (typeof PRODUCT_MODULES)[number]["id"];

export function defaultModuleAccess(): Record<ProductModuleId, boolean> {
  return {
    training: false,
    mystoryboard: false,
    mock_interviews: false,
    reports: false,
    analytics: false,
  };
}
