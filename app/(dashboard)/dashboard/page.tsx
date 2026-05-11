import { requireAuthenticatedUser } from "@/services/auth/session";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">
          Phase 9
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[color:var(--foreground)]">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
          Operational overview — KPI cards, high-risk alerts, recent assessments, and prioritized
          client activity will appear here once the core data workflows are in place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Auth confirmed card */}
        <article className="surface rounded-[1.5rem] p-6 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
            Auth confirmed
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
            Protected routes are enforced
          </h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            Supabase Auth, session refresh middleware, and dashboard route protection are all
            active. The shell, sidebar, and navigation are ready. Feature pages will populate
            this view in Phases 4 through 9.
          </p>
        </article>

        {/* Session card */}
        <article className="surface-strong rounded-[1.5rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
            Current session
          </p>
          <p className="mt-3 truncate text-sm font-semibold text-[color:var(--foreground)]">
            {user.email ?? "No email returned"}
          </p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">Authenticated via Supabase</p>
        </article>
      </div>
    </div>
  );
}
