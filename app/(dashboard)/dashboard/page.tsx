import { requireAuthenticatedUser } from "@/services/auth/session";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <article className="surface rounded-[1.75rem] p-6 lg:col-span-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
          Auth is live
        </p>
        <h2 className="mt-3 text-3xl font-semibold">
          Protected routes are now enforced through Supabase Auth.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
          This dashboard page is intentionally minimal. It verifies login,
          logout, and middleware protection before the larger dashboard shell,
          navigation, and KPI surfaces are introduced in the next step.
        </p>
      </article>
      <article className="surface-strong rounded-[1.75rem] p-6">
        <p className="text-sm text-[color:var(--muted)]">Current user</p>
        <p className="mt-3 text-base font-semibold">
          {user.email ?? "No email returned"}
        </p>
      </article>
    </section>
  );
}