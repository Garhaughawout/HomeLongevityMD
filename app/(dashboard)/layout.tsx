import Link from "next/link";
import { LogoutForm } from "@/features/auth/components/logout-form";
import { requireAuthenticatedUser } from "@/services/auth/session";
import { DashboardNav } from "@/components/layout/dashboard-nav";

type DashboardLayoutProps = {
	children: React.ReactNode;
};

export default async function DashboardLayout({
	children,
}: DashboardLayoutProps) {
	const user = await requireAuthenticatedUser();

	return (
		<div className="flex min-h-screen bg-[color:var(--background)]">
			{/* ── Desktop sidebar ────────────────────────────────────────────────── */}
			<aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[color:var(--ink)] lg:flex">
				{/* Brand */}
				<div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
					<Link
						href="/dashboard"
						className="text-sm font-semibold tracking-wide text-white"
					>
						HomeLongevityMD
					</Link>
				</div>

				{/* Navigation + user */}
				<div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-5">
					<DashboardNav orientation="vertical" />

					<div className="space-y-3 border-t border-white/10 pt-4">
						<p className="truncate px-3 text-xs text-white/50">
							{user.email ?? "authorized user"}
						</p>
						<div className="px-1">
							<LogoutForm />
						</div>
					</div>
				</div>
			</aside>

			{/* ── Mobile header + nav ─────────────────────────────────────────────── */}
			<div className="flex min-w-0 flex-1 flex-col">
				<header className="shrink-0 bg-[color:var(--ink)] lg:hidden">
					<div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
						<Link
							href="/dashboard"
							className="text-sm font-semibold text-white"
						>
							HomeLongevityMD
						</Link>
						<LogoutForm />
					</div>
					<div className="px-3">
						<DashboardNav orientation="horizontal" />
					</div>
				</header>

				{/* ── Page content ─────────────────────────────────────────────────── */}
				<main className="flex-1 px-6 py-8 lg:px-8 lg:py-10">
					{children}
				</main>
			</div>
		</div>
	);
}
