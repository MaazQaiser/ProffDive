"use client";

import { usePathname } from "next/navigation";
import { ProofyChatDock } from "./ProofyChatDock";

/** Routes where the floating Proofy entry point should not appear. */
const EXCLUDE_PATTERNS: RegExp[] = [
  /^\/report(\/|$)/,
  /^\/onboarding(\/|$)/,
  /^\/login(\/|$)/,
  /^\/signup(\/|$)/,
  /^\/verify(\/|$)/,
  /^\/consent(\/|$)/,
  /^\/forgot-password(\/|$)/,
  /^\/reset-password(\/|$)/,
  /^\/mock\/live(\/|$)/,
  /^\/storyboard\/new(\/|$)/,
  /^\/storyboard\/crafting(\/|$)/,
];

function shouldShowProofy(pathname: string | null): boolean {
  if (!pathname) return false;
  return !EXCLUDE_PATTERNS.some((re) => re.test(pathname));
}

export function ProofyChatDockGate() {
  const pathname = usePathname();
  if (!shouldShowProofy(pathname)) return null;
  return <ProofyChatDock />;
}
