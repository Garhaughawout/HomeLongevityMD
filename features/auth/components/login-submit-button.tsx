"use client";

import { useFormStatus } from "react-dom";

export function LoginSubmitButton() {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			aria-disabled={pending}
			disabled={pending}
			className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
		>
			{pending ? "Signing in..." : "Sign in"}
		</button>
	);
}
