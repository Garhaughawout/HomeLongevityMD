type LoadingStateProps = {
	label?: string;
};

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--border)] border-t-[color:var(--accent)]" />
			<p className="text-sm font-medium text-[color:var(--muted)]">
				{label}
			</p>
		</div>
	);
}
