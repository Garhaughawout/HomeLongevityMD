import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<h2 className="text-3xl font-semibold">Reset your password</h2>
				<p className="text-sm leading-7 text-[color:var(--muted)]">
					Enter the email you sign in with and we&rsquo;ll send a link
					to choose a new password.
				</p>
			</div>
			<ForgotPasswordForm />
			<p className="text-sm text-[color:var(--muted)]">
				Remembered it?{" "}
				<Link
					href="/login"
					className="font-medium text-[color:var(--navy)] underline"
				>
					Back to sign in
				</Link>
			</p>
		</div>
	);
}
