"use client";

import { usePathname } from "next/navigation";
import { ProofyChatDock } from "./ProofyChatDock";

/** Routes where the floating Proofy entry point should not appear. */
const EXCLUDE_PATTERNS: RegExp[] = [
  /^\/onboarding(\/|$)/,
  /^\/login(\/|$)/,
  /^\/signup(\/|$)/,
  /^\/verify(\/|$)/,
  /^\/consent(\/|$)/,
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
