type AuthLayoutProps = {
	children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 sm:px-8 lg:px-10">
			<div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
				<section className="space-y-5">
					<p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
						Internal access
					</p>
					<h1 className="text-4xl font-semibold leading-tight text-balance sm:text-5xl">
						Secure staff access for client operations and assessment
						workflows.
					</h1>
					<p className="max-w-xl text-base leading-8 text-[color:var(--muted)]">
						Sign in with your Supabase-authenticated account to
						access the internal dashboard, client records,
						assessments, quotes, and activity history.
					</p>
				</section>
				<div className="surface rounded-[2rem] p-6 sm:p-8">
					{children}
				</div>
			</div>
		</div>
	);
}
