import { LoginForm } from "@/features/auth/components/login-form";

type LoginPageProps = {
	searchParams?: {
		next?: string;
	};
};

export default function LoginPage({ searchParams }: LoginPageProps) {
	const redirectTo = searchParams?.next || "/dashboard";

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<h2 className="text-3xl font-semibold">Sign in</h2>
				<p className="text-sm leading-7 text-[color:var(--muted)]">
					Use your staff email and password to continue into the
					protected dashboard.
				</p>
			</div>
			<LoginForm redirectTo={redirectTo} />
		</div>
	);
}
