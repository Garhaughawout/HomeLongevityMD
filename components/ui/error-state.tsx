"use client";

import { useEffect } from "react";

type ErrorStateProps = {
	title?: string;
	description?: string;
	onRetry?: () => void;
};

export function ErrorState({
	title = "Something went wrong",
	description = "An unexpected error occurred. Please try again.",
	onRetry,
}: ErrorStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
			<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500">
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.75}
					stroke="currentColor"
					className="h-8 w-8"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
					/>
				</svg>
			</div>
			<div className="max-w-sm space-y-1.5">
				<h3 className="font-semibold text-[color:var(--foreground)]">
					{title}
				</h3>
				<p className="text-sm leading-6 text-[color:var(--muted)]">
					{description}
				</p>
			</div>
			{onRetry && (
				<button
					onClick={onRetry}
					className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
				>
					Try again
				</button>
			)}
		</div>
	);
}

// ── Next.js App Router error boundary wrapper ──────────────────────────────────

type RouteErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export function RouteError({ error, reset }: RouteErrorProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return <ErrorState onRetry={reset} />;
}
