import type { AppNavItem } from "@/types/navigation";
import { env } from "@/lib/env";

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  publicNavigation: ReadonlyArray<AppNavItem>;
  dashboardNavigation: ReadonlyArray<AppNavItem>;
};

export const publicNavigation: ReadonlyArray<AppNavItem> = [
  {
    label: "Services",
    href: "#services",
    description: "Functional home safety evaluations, fall risk assessments, and aging-in-place planning.",
  },
  {
    label: "Why Us",
    href: "#why-us",
    description: "The financial and human cost of waiting for a crisis — and how we help.",
  },
  {
    label: "Contact",
    href: "#contact",
    description: "Get in touch with HomeLongevityMD.",
  },
];

export const dashboardNavigation: ReadonlyArray<AppNavItem> = [
  {
    label: "Dashboard",
    href: "/dashboard",
    description: "Operational overview, KPIs, recent activity, and high-risk alerts.",
  },
  {
    label: "Clients",
    href: "/clients",
    description: "Searchable client management, onboarding, and detail workspaces.",
  },
  {
    label: "Assessments",
    href: "/assessments",
    description: "Structured intake capture, risk scoring, and assessment history.",
  },
  {
    label: "Quotes",
    href: "/quotes",
    description: "Pricing logic, service recommendations, and revision tracking.",
  },
  {
    label: "Activity",
    href: "/activity",
    description: "Audit trail for internal actions, notes, status changes, and workflows.",
  },
  {
    label: "Docs",
    href: "/dashboard/docs",
    description: "Internal reference for routes, APIs, and implementation surfaces.",
  },
];

export const siteConfig: SiteConfig = {
  name: env.appName,
  description:
    "Physician-led functional home assessments helping older adults safely age in place while giving families medically-guided housing decisions.",
  url: env.appUrl,
  publicNavigation,
  dashboardNavigation,
};