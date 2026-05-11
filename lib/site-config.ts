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
    label: "Foundation",
    href: "#foundation",
    description: "Scaffolded shared styles, layout primitives, and route groups.",
  },
  {
    label: "Architecture",
    href: "#architecture",
    description: "Route targets for CRM, intake, quotes, and activity workflows.",
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
    "A lightweight operational platform for aging-in-place providers spanning public marketing, client workflows, intake assessment, quotes, and operational visibility.",
  url: env.appUrl,
  publicNavigation,
  dashboardNavigation,
};