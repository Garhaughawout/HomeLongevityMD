import Link from "next/link";
import { LogoutForm } from "@/features/auth/components/logout-form";
import { requireAuthenticatedUser } from "@/services/auth/session";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await requireAuthenticatedUser();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
      <header className="surface mb-8 flex flex-col gap-4 rounded-[2rem] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
            Authenticated workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold">HomeLongevityMD Dashboard</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Signed in as {user.email ?? "authorized user"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-foreground"
          >
            Dashboard home
          </Link>
          <LogoutForm />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}