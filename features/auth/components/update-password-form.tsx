"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/services/supabase/browser";

type Status = "checking" | "ready" | "saving" | "done" | "no_session";

export function UpdatePasswordForm() {
	const router = useRouter();
	const [status, setStatus] = useState<Status>("checking");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [error, setError] = useState<string | null>(null);

	// The confirm route establishes a session before sending the user here.
	// If someone lands here without one, the link was invalid or expired.
	useEffect(() => {
		// Resilience: if an email link delivered a token_hash directly to this
		// page (mis-configured template), forward it to the confirm route,
		// which knows how to redeem it.
		const params = new URLSearchParams(window.location.search);
		const tokenHash = params.get("token_hash");
		if (tokenHash) {
			const type = params.get("type") ?? "recovery";
			window.location.replace(
				`/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}&next=/update-password`
			);
			return;
		}

		const supabase = getBrowserSupabaseClient();
		supabase.auth.getUser().then(({ data }) => {
			setStatus(data.user ? "ready" : "no_session");
		});
	}, []);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError(null);

		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		if (password !== confirm) {
			setError("Passwords don't match.");
			return;
		}

		setStatus("saving");
		const supabase = getBrowserSupabaseClient();
		const { error: updateError } = await supabase.auth.updateUser({
			password,
		});

		if (updateError) {
			setError(updateError.message);
			setStatus("ready");
			return;
		}

		setStatus("done");
		router.push("/dashboard");
		router.refresh();
	}

	if (status === "checking") {
		return (
			<p className="text-sm text-[color:var(--muted)]">Checking your link…</p>
		);
	}

	if (status === "no_session") {
		return (
			<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				This link is invalid or has expired. Request a new one from the{" "}
				<a href="/forgot-password" className="font-medium underline">
					reset password page
				</a>
				, or contact your administrator for a new invite.
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="space-y-2">
				<label className="text-sm font-medium" htmlFor="password">
					New password
				</label>
				<input
					id="password"
					type="password"
					autoComplete="new-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
					placeholder="At least 8 characters"
					required
					minLength={8}
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium" htmlFor="confirm">
					Confirm new password
				</label>
				<input
					id="confirm"
					type="password"
					autoComplete="new-password"
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
					placeholder="Repeat the password"
					required
				/>
			</div>

			{error && (
				<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			)}

			<button
				type="submit"
				disabled={status === "saving" || status === "done"}
				className="w-full rounded-2xl bg-[color:var(--navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--ink)] disabled:opacity-60"
			>
				{status === "saving"
					? "Saving…"
					: status === "done"
						? "Password set — redirecting…"
						: "Set password"}
			</button>
		</form>
	);
}
