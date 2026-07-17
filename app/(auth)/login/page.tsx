import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

type LoginPageProps = {
	searchParams?: {
		next?: string;
		auth_error?: string;
	};
};

export default function LoginPage({ searchParams }: LoginPageProps) {
	const redirectTo = searchParams?.next || "/dashboard";
	const linkInvalid = searchParams?.auth_error === "link_invalid";

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<h2 className="text-3xl font-semibold">Sign in</h2>
				<p className="text-sm leading-7 text-[color:var(--muted)]">
					Use your staff email and password to continue into the
					protected dashboard.
				</p>
			</div>
			{linkInvalid && (
				<div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
					That link is invalid or has expired. Request a new one below,
					or ask your administrator to resend the invite.
				</div>
			)}
			<LoginForm redirectTo={redirectTo} />
			<p className="text-sm text-[color:var(--muted)]">
				<Link
					href="/forgot-password"
					className="font-medium text-[color:var(--navy)] underline"
				>
					Forgot your password?
				</Link>
			</p>
		</div>
	);
}
