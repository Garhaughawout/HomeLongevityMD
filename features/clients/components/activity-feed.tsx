import type { ActivityLogRow } from "@/types/supabase";

const EVENT_LABELS: Record<string, string> = {
	client_created: "Client created",
	client_updated: "Client updated",
	client_status_changed: "Status changed",
	intake_saved: "Intake saved",
	intake_submitted: "Intake submitted",
	assessment_persisted: "Assessment recorded",
	assessment_deleted: "Assessment deleted",
	quote_generated: "Quote generated",
	quote_sent: "Quote sent",
	quote_accepted: "Quote accepted",
	quote_declined: "Quote declined",
	quote_deleted: "Quote deleted",
	note_created: "Note added",
	note_updated: "Note updated",
	note_deleted: "Note deleted",
};

const EVENT_COLORS: Record<string, { dot: string }> = {
	client_created: { dot: "#10b981" },
	client_updated: { dot: "#6b7280" },
	client_status_changed: { dot: "#c79d43" },
	intake_saved: { dot: "#6b7280" },
	intake_submitted: { dot: "#17304d" },
	assessment_persisted: { dot: "#17304d" },
	assessment_deleted: { dot: "#ef4444" },
	quote_generated: { dot: "#c79d43" },
	quote_sent: { dot: "#c79d43" },
	quote_accepted: { dot: "#10b981" },
	quote_declined: { dot: "#ef4444" },
	quote_deleted: { dot: "#ef4444" },
	note_created: { dot: "#6b7280" },
	note_updated: { dot: "#6b7280" },
	note_deleted: { dot: "#6b7280" },
};

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

type ActivityFeedProps = {
	events: ActivityLogRow[];
	emptyMessage?: string;
};

export function ActivityFeed({
	events,
	emptyMessage = "No activity yet.",
}: ActivityFeedProps) {
	if (events.length === 0) {
		return (
			<div
				className="rounded-2xl p-8 text-center"
				style={{
					background: "var(--surface)",
					border: "1px solid var(--border)",
				}}
			>
				<p className="text-sm" style={{ color: "var(--muted)" }}>
					{emptyMessage}
				</p>
			</div>
		);
	}

	return (
		<div
			className="rounded-2xl overflow-hidden"
			style={{
				background: "var(--surface)",
				border: "1px solid var(--border)",
			}}
		>
			<ul className="divide-y" style={{ borderColor: "var(--border)" }}>
				{events.map((event) => {
					const label =
						EVENT_LABELS[event.event_type] ?? event.event_type;
					const color =
						EVENT_COLORS[event.event_type]?.dot ?? "#6b7280";
					return (
						<li
							key={event.id}
							className="flex items-start gap-3 px-5 py-3.5"
						>
							<span
								className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
								style={{ backgroundColor: color }}
							/>
							<div className="min-w-0 flex-1">
								<p
									className="text-sm font-medium"
									style={{ color: "var(--foreground)" }}
								>
									{label}
								</p>
								{event.metadata &&
									typeof event.metadata === "object" &&
									!Array.isArray(event.metadata) && (
										<p
											className="mt-0.5 text-xs truncate"
											style={{ color: "var(--muted)" }}
										>
											{Object.entries(
												event.metadata as Record<
													string,
													unknown
												>
											)
												.map(([k, v]) => `${k}: ${v}`)
												.join(" · ")}
										</p>
									)}
							</div>
							<time
								className="shrink-0 text-xs tabular-nums"
								style={{ color: "var(--muted)" }}
								dateTime={event.created_at}
							>
								{formatDate(event.created_at)}
							</time>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
