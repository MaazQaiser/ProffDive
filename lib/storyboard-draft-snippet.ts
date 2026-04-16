import { readEnrichmentAnswers } from "@/lib/storyboard-enrichment";

/** Challenge–Action–Result snapshot for the in-chat initial draft (from 6 enrichment answers). */
export type StoryDraftCAR = {
  intro: string;
  challenge: string;
  action: string;
  result: string;
};

/**
 * Maps enrichment answers into CAR:
 * - Challenge: goal + how you scoped the problem (Q1–2)
 * - Action: prioritization, execution, people (Q3–5)
 * - Result: outcome & learning (Q6)
 */
export function buildInitialStorySectionDraft(opts: {
  roleTitle: string;
  experienceLabel: string;
  experienceId: string;
}): StoryDraftCAR {
  const a = readEnrichmentAnswers(opts.experienceId);
  const t = (i: 1 | 2 | 3 | 4 | 5 | 6) => a[i]?.trim() ?? "";

  const challengeLines = [
    t(1) ? `What I set out to do: ${t(1)}` : "",
    t(2) ? `How I broke it down: ${t(2)}` : "",
  ].filter(Boolean);

  const actionLines = [
    t(3) ? `How I chose what to do first: ${t(3)}` : "",
    t(4) ? `What I actually did: ${t(4)}` : "",
    t(5) ? `People & alignment: ${t(5)}` : "",
  ].filter(Boolean);

  const challenge = challengeLines.length > 0 ? challengeLines.join("\n\n") : "—";
  const action = actionLines.length > 0 ? actionLines.join("\n\n") : "—";
  const result = t(6) ? `What changed (and what I learned): ${t(6)}` : "—";

  const intro = `As someone aiming for ${opts.roleTitle}, here’s a first pass for “${opts.experienceLabel}”:`;

  return { intro, challenge, action, result };
}
