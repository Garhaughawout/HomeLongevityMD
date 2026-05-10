export type FoundationalTrack = {
  title: string;
  description: string;
};

export const foundationalTracks: ReadonlyArray<FoundationalTrack> = [
  {
    title: "Experience surfaces",
    description:
      "A small public landing page and a protected internal workspace share one app shell and one deployment target.",
  },
  {
    title: "Typed application boundaries",
    description:
      "Config, utilities, services, hooks, and domain types now have dedicated homes before feature work begins.",
  },
  {
    title: "Operational build path",
    description:
      "The app is structured for Supabase auth, CRM workflows, intake assessments, quotes, and activity timelines.",
  },
];