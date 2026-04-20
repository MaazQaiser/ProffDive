import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Handshake,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export type SuperAdminNavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

/** Primary sidebar — config-driven, no hardcoded lists in layout components. */
export const SUPERADMIN_NAV: SuperAdminNavItem[] = [
  { href: "/superadmin/overview", label: "Overview", Icon: LayoutDashboard },
  { href: "/superadmin/organizations", label: "Organizations", Icon: Building2 },
  { href: "/superadmin/content", label: "Content (Training)", Icon: BookOpen },
  { href: "/superadmin/partners", label: "Partners", Icon: Handshake },
  { href: "/superadmin/billing/plans", label: "Billing (Plans)", Icon: CreditCard },
  { href: "/superadmin/competency-engine", label: "Competency Engine", Icon: ShieldCheck },
];
