import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";

export default function UpdatePasswordPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<h2 className="text-3xl font-semibold">Set your password</h2>
				<p className="text-sm leading-7 text-[color:var(--muted)]">
					Choose the password you&rsquo;ll use to sign in to the
					HomeLongevityMD dashboard.
				</p>
			</div>
			<UpdatePasswordForm />
		</div>
	);
}
