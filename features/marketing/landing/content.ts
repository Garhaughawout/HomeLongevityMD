export type Service = {
  title: string;
  description: string;
};

export const services: ReadonlyArray<Service> = [
  {
    title: "Functional Home Safety & Longevity Evaluations",
    description:
      "Thorough in-home assessments identifying hazards and barriers to safe, independent living.",
  },
  {
    title: "Aging-in-Place Planning",
    description:
      "Personalized roadmaps for modifications, equipment, and support structures that extend independence.",
  },
  {
    title: "Fall Risk & Mobility Assessments",
    description:
      "Standardized clinical screening tools identifying fall risk factors and functional mobility limitations.",
  },
  {
    title: "Transition Planning Consultations",
    description:
      "Medically-guided support for families navigating housing transitions and care-level decisions.",
  },
  {
    title: "Family Decision Support",
    description:
      "Clear, physician-level communication that helps families make confident, informed decisions together.",
  },
];

export type FinancialItem = {
  label: string;
  cost: string;
  period: string;
};

export const financialComparison: ReadonlyArray<FinancialItem> = [
  { label: "Assisted Living", cost: "$60K–$78K", period: "annually" },
  { label: "Memory Care", cost: "$85K–$120K+", period: "annually" },
  { label: "Skilled Nursing", cost: "$110K–$160K+", period: "annually" },
];

export type ReferralSource = {
  title: string;
};

export const referralSources: ReadonlyArray<ReferralSource> = [
  { title: "Primary Care Physicians" },
  { title: "Orthopedic & Neurology Practices" },
  { title: "Estate & Elder Law Attorneys" },
  { title: "Senior-Focused Realtors" },
  { title: "Care Coordinators & Case Managers" },
];