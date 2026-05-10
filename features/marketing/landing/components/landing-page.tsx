import Link from "next/link";
import { PageSection } from "@/components/layout/page-section";
import { SiteFrame } from "@/components/layout/site-frame";
import { foundationalTracks } from "@/features/marketing/landing/content";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

export function LandingPage() {
  return (
    <SiteFrame>
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-1 text-sm font-medium text-[color:var(--muted)]">
            Step 2 foundation in progress
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-balance sm:text-6xl">
              Operational software for aging-in-place teams that need faster,
              safer decisions.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              {siteConfig.description} The core structure is now in place for
              authentication, client operations, intake scoring, quote
              generation, and reporting.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="#foundation"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
            >
              View build foundation
            </Link>
            <Link
              href="#architecture"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-3 text-sm font-semibold text-foreground transition hover:border-[color:var(--accent)]"
            >
              Review architecture
            </Link>
          </div>
        </div>

        <div className="surface accent-ring rounded-[2rem] p-6 sm:p-8">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Runtime snapshot
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {env.appName} is configured for {env.nodeEnv}
              </h2>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="surface-strong rounded-3xl p-4">
                <dt className="text-sm text-[color:var(--muted)]">Base URL</dt>
                <dd className="mt-2 text-sm font-medium">{env.appUrl}</dd>
              </div>
              <div className="surface-strong rounded-3xl p-4">
                <dt className="text-sm text-[color:var(--muted)]">Public nav</dt>
                <dd className="mt-2 text-sm font-medium">
                  {siteConfig.publicNavigation.length} routes scaffolded
                </dd>
              </div>
            </dl>
            <p className="text-sm leading-7 text-[color:var(--muted)]">
              This page is intentionally lightweight. The detailed marketing site,
              auth flows, and dashboard shell come in the next phases without
              reworking the layout foundation.
            </p>
          </div>
        </div>
      </section>

      <PageSection
        id="foundation"
        eyebrow="Project structure"
        title="Shared application boundaries are scaffolded before feature work"
        description="The repository now separates UI composition, environment access, utility helpers, types, hooks, and service layers so later slices can stay narrow and testable."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {foundationalTracks.map((track) => (
            <article key={track.title} className="surface rounded-[1.75rem] p-6">
              <h3 className="text-xl font-semibold">{track.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                {track.description}
              </p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection
        id="architecture"
        eyebrow="Primary flows"
        title="The next slices now have stable landing zones"
        description="Each area below maps directly to the roadmap so auth, CRM, intake, scoring, quotes, and activity tracking can be added iteratively without reshaping the repository again."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {siteConfig.dashboardNavigation.map((item) => (
            <div key={item.label} className="surface-strong rounded-[1.5rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                {item.href}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{item.label}</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </PageSection>
    </SiteFrame>
  );
}