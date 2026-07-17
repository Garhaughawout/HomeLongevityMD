"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
	requestPasswordReset,
	type ResetRequestState,
} from "@/features/auth/actions";

const initialState: ResetRequestState = { status: "idle" };

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<button
			type="submit"
			disabled={pending}
			className="w-full rounded-2xl bg-[color:var(--navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--ink)] disabled:opacity-60"
		>
			{pending ? "Sending…" : "Send reset link"}
		</button>
	);
}

export function ForgotPasswordForm() {
	const [state, formAction] = useFormState(requestPasswordReset, initialState);

	if (state.status === "sent") {
		return (
			<div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
				{state.message}
			</div>
		);
	}

	return (
		<form action={formAction} className="space-y-5">
			<div className="space-y-2">
				<label className="text-sm font-medium" htmlFor="email">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
					placeholder="name@company.com"
					required
				/>
			</div>

			{state.status === "error" && state.message && (
				<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{state.message}
				</div>
			)}

			<SubmitButton />
		</form>
	);
}
