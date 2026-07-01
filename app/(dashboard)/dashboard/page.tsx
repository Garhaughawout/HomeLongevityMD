import Link from "next/link";
import { requireAuthenticatedUser } from "@/services/auth/session";
import { createServerSupabaseClient } from "@/services/supabase/server";
import type {
	ClientRow,
	ClientIntakeRow,
	QuoteRow,
	RiskAssessmentRow,
	ActivityLogRow,
} from "@/types/supabase";

// -- Data fetching --

type PipelineClient = {
	id: string;
	full_name: string;
	status: string | null;
	email: string | null;
	phone: string | null;
	created_at: string;
	stage: "new" | "intake" | "assessment" | "quote" | "active";
};

async function getDashboardData() {
	const supabase = createServerSupabaseClient();

	const [
		{ data: clients },
		{ data: intakes },
		{ data: assessments },
		{ data: quotes },
		{ data: recentActivity },
	] = await Promise.all([
		supabase
			.from("clients")
			.select("*")
			.order("created_at", { ascending: false })
			.limit(100),
		supabase
			.from("client_intake")
			.select("id, client_id, status, version")
			.order("version", { ascending: false }),
		supabase
			.from("risk_assessments")
			.select("id, client_id"),
		supabase
			.from("quotes")
			.select("id, client_id, status"),
		supabase
			.from("activity_log")
			.select("*")
			.order("created_at", { ascending: false })
			.limit(15),
	]);

	const clientList = (clients ?? []) as ClientRow[];

	// Build lookup maps
	const intakeMap = new Map<string, ClientIntakeRow>();
	for (const intake of (intakes ?? []) as ClientIntakeRow[]) {
		if (!intakeMap.has(intake.client_id)) {
			intakeMap.set(intake.client_id, intake);
		}
	}

	const assessmentSet = new Set<string>(
		(assessments ?? []).map((a) => (a as RiskAssessmentRow).client_id)
	);

	const quoteMap = new Map<string, QuoteRow[]>();
	for (const quote of (quotes ?? []) as QuoteRow[]) {
		const existing = quoteMap.get(quote.client_id) ?? [];
		existing.push(quote);
		quoteMap.set(quote.client_id, existing);
	}

	// Determine stage for each client
	const pipeline: PipelineClient[] = clientList.map((c): PipelineClient => {
		const intake = intakeMap.get(c.id);
		const hasAssessment = assessmentSet.has(c.id);
		const clientQuotes = quoteMap.get(c.id) ?? [];

		let stage: PipelineClient["stage"];

		if (c.status === "active") {
			stage = "active";
		} else if (clientQuotes.length > 0) {
			const hasAccepted = clientQuotes.some((q) => q.status === "accepted");
			if (hasAccepted) {
				stage = "active";
			} else {
				stage = "quote";
			}
		} else if (hasAssessment) {
			stage = "assessment";
		} else if (intake) {
			stage = "intake";
		} else {
			stage = "new";
		}

		return {
			id: c.id,
			full_name: c.full_name,
			status: c.status,
			email: c.email,
			phone: c.phone,
			created_at: c.created_at,
			stage,
		};
	});

	// Group by stage
	const byStage = new Map<PipelineClient["stage"], PipelineClient[]>();
	for (const stage of ["new", "intake", "assessment", "quote", "active"] as const) {
		byStage.set(stage, pipeline.filter((c) => c.stage === stage));
	}

	return {
		pipeline,
		byStage,
		recentActivity: (recentActivity ?? []) as ActivityLogRow[],
	};
}

// -- Stage config --

const STAGES: Array<{
	key: PipelineClient["stage"];
	label: string;
	description: string;
	color: string;
}> = [
	{ key: "new", label: "New", description: "No intake started", color: "var(--muted)" },
	{ key: "intake", label: "Intake", description: "Assessment in progress", color: "#c79d43" },
	{ key: "assessment", label: "Assessment", description: "Risk scored, no quote yet", color: "#3b82f6" },
	{ key: "quote", label: "Quote", description: "Pricing sent, awaiting response", color: "#8b5cf6" },
	{ key: "active", label: "Active", description: "Client engaged", color: "#059669" },
];

// -- Activity event labels --

const EVENT_LABELS: Record<string, string> = {
	client_created: "Client created",
	client_updated: "Client updated",
	client_status_changed: "Status changed",
	intake_saved: "Intake saved",
	intake_submitted: "Intake submitted",
	assessment_persisted: "Assessment recorded",
	quote_generated: "Quote generated",
	quote_sent: "Quote sent",
	quote_accepted: "Quote accepted",
	quote_declined: "Quote declined",
	quote_deleted: "Quote deleted",
	note_created: "Note added",
	note_deleted: "Note deleted",
};

const EVENT_COLORS: Record<string, string> = {
	client_created: "#059669",
	client_updated: "#3b82f6",
	intake_saved: "#c79d43",
	intake_submitted: "#c79d43",
	assessment_persisted: "#3b82f6",
	quote_generated: "#8b5cf6",
	quote_sent: "#8b5cf6",
	quote_accepted: "#059669",
	quote_declined: "#ef4444",
	quote_deleted: "#ef4444",
	note_created: "#6b7280",
	note_deleted: "#6b7280",
};

function formatTimeAgo(dateStr: string): string {
	const now = Date.now();
	const then = new Date(dateStr).getTime();
	const diffMin = Math.floor((now - then) / 60000);
	const diffHr = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHr / 24);

	if (diffMin < 1) return "just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHr < 24) return `${diffHr}h ago`;
	if (diffDay < 7) return `${diffDay}d ago`;
	return new Date(dateStr).toLocaleDateString();
}

// -- Page --

export default async function DashboardPage() {
	const [, data] = await Promise.all([
		requireAuthenticatedUser(),
		getDashboardData(),
	]);

	const { pipeline, byStage, recentActivity } = data;
	const totalClients = pipeline.length;
	const needsAttention =
		(byStage.get("new") ?? []).length + (byStage.get("intake") ?? []).length;

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-[color:var(--foreground)]">
						Dashboard
					</h1>
					<p className="mt-1 text-sm text-[color:var(--muted)]">
						{totalClients} client{totalClients !== 1 ? "s" : ""} total
						{needsAttention > 0 && (
							<span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
								{needsAttention} need{needsAttention !== 1 ? "s" : ""} attention
							</span>
						)}
					</p>
				</div>
				<Link
					href="/clients"
					className="rounded-lg border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--surface)]"
				>
					Manage Clients
				</Link>
			</div>

			{/* Pipeline board -- full width */}
			<div>
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					Pipeline
				</h2>
				{totalClients === 0 ? (
					<div
						className="rounded-2xl p-12 text-center"
						style={{
							background: "var(--surface)",
							border: "1px solid var(--border)",
						}}
					>
						<p className="text-sm text-[color:var(--muted)]">
							No clients yet.{" "}
							<Link
								href="/clients"
								className="underline"
								style={{ color: "var(--navy)" }}
							>
								Add your first client
							</Link>
							{" "}to get started.
						</p>
					</div>
				) : (
					<div className="flex gap-4 overflow-x-auto pb-4">
						{STAGES.map((stage) => {
							const clients = byStage.get(stage.key) ?? [];
							return (
								<div
									key={stage.key}
									className="flex w-72 shrink-0 flex-col rounded-2xl"
									style={{
										background: "var(--surface)",
										border: "1px solid var(--border)",
									}}
								>
									{/* Column header */}
									<div
										className="px-4 py-3"
										style={{ borderBottom: "1px solid var(--border)" }}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<span
													className="h-2.5 w-2.5 rounded-full"
													style={{ backgroundColor: stage.color }}
												/>
												<span
													className="text-sm font-semibold"
													style={{ color: "var(--foreground)" }}
												>
													{stage.label}
												</span>
											</div>
											<span
												className="text-xs font-medium tabular-nums"
												style={{ color: "var(--muted)" }}
											>
												{clients.length}
											</span>
										</div>
										<p
											className="mt-0.5 text-xs"
											style={{ color: "var(--muted)" }}
										>
											{stage.description}
										</p>
									</div>

									{/* Client cards */}
									<div className="flex-1 space-y-2 p-2">
										{clients.length === 0 ? (
											<p
												className="px-2 py-4 text-center text-xs"
												style={{ color: "var(--muted)" }}
											>
												Empty
											</p>
										) : (
											clients.map((c) => (
												<Link
													key={c.id}
													href={`/clients/${c.id}`}
													className="block rounded-xl border border-[color:var(--border)] bg-white p-3 transition hover:border-[color:var(--accent)] hover:shadow-sm"
												>
													<p
														className="text-sm font-medium"
														style={{ color: "var(--foreground)" }}
													>
														{c.full_name}
													</p>
													<p
														className="mt-0.5 text-xs"
														style={{ color: "var(--muted)" }}
													>
														{c.email ?? c.phone ?? "No contact info"}
													</p>
												</Link>
											))
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Recent activity -- full width, bottom */}
			<div>
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					Recent Activity
				</h2>
				{recentActivity.length === 0 ? (
					<div
						className="rounded-2xl p-8 text-center"
						style={{
							background: "var(--surface)",
							border: "1px solid var(--border)",
						}}
					>
						<p className="text-sm text-[color:var(--muted)]">
							No activity recorded yet.
						</p>
					</div>
				) : (
					<div
						className="rounded-2xl"
						style={{
							background: "var(--surface)",
							border: "1px solid var(--border)",
						}}
					>
						{recentActivity.map((event, idx) => {
							const label = EVENT_LABELS[event.event_type] ?? event.event_type;
							const dotColor = EVENT_COLORS[event.event_type] ?? "#6b7280";
							return (
								<div
									key={event.id ?? idx}
									className="flex items-center gap-4 border-b border-[color:var(--border)] px-4 py-3 last:border-b-0"
								>
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: dotColor }}
									/>
									<p
										className="flex-1 text-sm font-medium"
										style={{ color: "var(--foreground)" }}
									>
										{label}
									</p>
									{event.client_id && (
										<Link
											href={`/clients/${event.client_id}`}
											className="text-xs hover:underline"
											style={{ color: "var(--muted)" }}
										>
											View client
										</Link>
									)}
									<span
										className="shrink-0 text-xs tabular-nums"
										style={{ color: "var(--muted)" }}
									>
										{formatTimeAgo(event.created_at)}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
