"use client";

import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson } from "./storage";
import { COMPETENCY_TITLES_12 } from "./competency-engine";
import {
  SEED_MODULES,
  SEED_ORGS,
  SEED_OVERVIEW,
  SEED_PARTNERS,
  SEED_PLANS,
  SEED_COMPETENCY_ENGINES,
  SEED_SETTINGS,
} from "./seed";
import type {
  CompetencyCard,
  CompetencyEngineVersion,
  Organization,
  OverviewMetrics,
  Partner,
  Plan,
  PlatformSettings,
  TrainingModule,
} from "./types";

const K = {
  plans: "plans",
  orgs: "organizations",
  partners: "partners",
  modules: "training_modules",
  overview: "overview_metrics",
  settings: "platform_settings",
  competencyEngines: "competency_engines",
} as const;

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setPlans(readJson(K.plans, SEED_PLANS));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJson(K.plans, plans);
  }, [plans, loaded]);

  const create = useCallback((p: Omit<Plan, "id">) => {
    const id = uid("plan");
    setPlans((prev) => [...prev, { ...p, id }]);
    return id;
  }, []);

  const update = useCallback((id: string, patch: Partial<Plan>) => {
    setPlans((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const remove = useCallback((id: string) => {
    setPlans((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { plans, loaded, setPlans, create, update, remove };
}

export function useOrganizations() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setOrgs(readJson(K.orgs, SEED_ORGS));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJson(K.orgs, orgs);
  }, [orgs, loaded]);

  const create = useCallback((o: Omit<Organization, "id">) => {
    const id = uid("org");
    setOrgs((prev) => [...prev, { ...o, id }]);
    return id;
  }, []);

  const update = useCallback((id: string, patch: Partial<Organization>) => {
    setOrgs((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  return { orgs, loaded, setOrgs, create, update };
}

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setPartners(readJson(K.partners, SEED_PARTNERS));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJson(K.partners, partners);
  }, [partners, loaded]);

  const create = useCallback((p: Omit<Partner, "id" | "referrals" | "earnings" | "performance">) => {
    const id = uid("pt");
    const row: Partner = {
      ...p,
      id,
      referrals: [],
      earnings: [],
      performance: [
        { label: "Conversion rate", value: 0 },
        { label: "Avg deal", value: 0 },
      ],
    };
    setPartners((prev) => [...prev, row]);
    return id;
  }, []);

  const update = useCallback((id: string, patch: Partial<Partner>) => {
    setPartners((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  return { partners, loaded, create, update };
}

export function useTrainingModules() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setModules(readJson(K.modules, SEED_MODULES));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJson(K.modules, modules);
  }, [modules, loaded]);

  const create = useCallback((m: Omit<TrainingModule, "id">) => {
    const id = uid("tm");
    setModules((prev) => [...prev, { ...m, id }]);
    return id;
  }, []);

  const update = useCallback((id: string, patch: Partial<TrainingModule>) => {
    setModules((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  return { modules, loaded, create, update, setModules };
}

export function useOverviewMetrics() {
  const [metrics, setMetrics] = useState<OverviewMetrics>(SEED_OVERVIEW);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMetrics(readJson(K.overview, SEED_OVERVIEW));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJson(K.overview, metrics);
  }, [metrics, loaded]);

  return { metrics, loaded, setMetrics };
}

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(SEED_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setSettings(readJson(K.settings, SEED_SETTINGS));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJson(K.settings, settings);
  }, [settings, loaded]);

  const patch = useCallback((p: Partial<PlatformSettings>) => {
    setSettings((s) => ({ ...s, ...p }));
  }, []);

  return { settings, loaded, setSettings, patch };
}

function ceUid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeCompetencies(input: CompetencyCard[] | undefined): CompetencyCard[] {
  const base = (input ?? []).slice(0, 12);
  while (base.length < 12) {
    base.push({ id: ceUid("cc"), title: `Competency ${base.length + 1}`, description: "" });
  }
  return base.map((c, idx) => ({
    id: c.id || ceUid("cc"),
    title: COMPETENCY_TITLES_12[idx] ?? `Competency ${idx + 1}`,
    description: c.description ?? "",
  }));
}

export function useCompetencyEngines() {
  const [versions, setVersions] = useState<CompetencyEngineVersion[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setVersions(readJson(K.competencyEngines, SEED_COMPETENCY_ENGINES));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJson(K.competencyEngines, versions);
  }, [versions, loaded]);

  const create = useCallback((input: Omit<CompetencyEngineVersion, "id" | "createdAt">) => {
    const id = ceUid("cev");
    const row: CompetencyEngineVersion = {
      id,
      name: input.name.trim(),
      createdAt: new Date().toISOString(),
      competencies: normalizeCompetencies(input.competencies),
    };
    setVersions((prev) => [row, ...prev]);
    return id;
  }, []);

  const update = useCallback((id: string, patch: Partial<Omit<CompetencyEngineVersion, "id" | "createdAt">>) => {
    setVersions((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              ...(patch.name !== undefined ? { name: patch.name.trim() } : null),
              ...(patch.competencies !== undefined ? { competencies: normalizeCompetencies(patch.competencies) } : null),
            }
          : v
      )
    );
  }, []);

  return { versions, loaded, create, update };
}
