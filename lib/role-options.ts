/** Canonical role picklist — shared by onboarding and storyboard hub. */

export const ROLES = [
  "Product Manager",
  "Product Designer",
  "UX Designer",
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Data Scientist",
  "Data Analyst",
  "Business Analyst",
  "Marketing Manager",
  "Growth Manager",
  "Operations Manager",
  "Strategy Consultant",
  "Machine Learning Engineer",
] as const;

export const SUGGESTIVE_ROLE_CHIPS = [
  "Product Manager",
  "UX Designer",
  "Software Engineer",
  "Data Analyst",
  "Product Designer",
  "Marketing Manager",
  "Data Scientist",
  "Business Analyst",
] as const;

export type RoleOption = (typeof ROLES)[number];
