export type CompetencyPillarDef = {
  id: "thinking" | "action" | "people" | "mastery";
  label: string;
  competencyTitles: readonly [string, string, string];
};

export const COMPETENCY_PILLARS: readonly CompetencyPillarDef[] = [
  {
    id: "thinking",
    label: "Power of Thinking",
    competencyTitles: ["Analytical Thinking", "Prioritization", "Decision-Making Agility"],
  },
  {
    id: "action",
    label: "Power of Action",
    competencyTitles: ["Ownership", "Initiative & Follow-through", "Embraces Change"],
  },
  {
    id: "people",
    label: "Power of People",
    competencyTitles: ["Influence", "Collaboration & Inclusion", "Grows Capability"],
  },
  {
    id: "mastery",
    label: "Power of Mastery",
    competencyTitles: ["Functional Knowledge", "Execution", "Innovation"],
  },
] as const;

export const COMPETENCY_TITLES_12: readonly string[] = COMPETENCY_PILLARS.flatMap((p) => p.competencyTitles);

