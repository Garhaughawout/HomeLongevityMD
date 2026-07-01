import Link from "next/link";
import { getClientById } from "@/services/clients";
import { getLatestIntakeByClientId } from "@/services/intake";
import { getAssessmentsByClientId } from "@/services/assessments";
import { getQuotesByClientId } from "@/services/quotes";
import { notFound } from "next/navigation";

type ClientOverviewPageProps = {
	params: { id: string };
};

function formatDate(iso: string | null) {
	if (!iso) return "--";
	return new Date(iso).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

function DetailRow({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-0.5 py-3">
			<dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
				{label}
			</dt>
			<dd className="text-sm text-[color:var(--foreground)]">
				{value ?? "--"}
			</dd>
		</div>
	);
}

// -- Workflow Step Component --

type StepStatus = "complete" | "in_progress" | "not_started" | "locked";

function WorkflowStep({
	stepNumber,
	title,
	description,
	status,
	href,
	actionLabel,
}: {
	stepNumber: number;
	title: string;
	description: string;
	status: StepStatus;
	href: string;
	actionLabel: string;
}) {
	const statusConfig: Record<StepStatus, { icon: string; bg: string; ring: string; text: string }> = {
		complete: { icon: "check", bg: "bg-emerald-100", ring: "border-emerald-300", text: "text-emerald-700" },
		in_progress: { icon: "dot", bg: "bg-amber-100", ring: "border-amber-300", text: "text-amber-700" },
		not_started: { icon: String(stepNumber), bg: "bg-[color:var(--border)]", ring: "border-[color:var(--border)]", text: "text-[color:var(--muted)]" },
		locked: { icon: "-", bg: "bg-gray-100", ring: "border-gray-200", text: "text-gray-400" },
	};

	const cfg = statusConfig[status];

	return (
		<div className={`flex items-start gap-4 rounded-xl border ${cfg.ring} p-4`}>
			<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.bg} ${cfg.text} text-sm font-semibold`}>
				{cfg.icon === "check" ? (
					<svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
						<path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
					</svg>
				) : cfg.icon === "dot" ? (
					<span className="h-2.5 w-2.5 rounded-full bg-current" />
				) : (
					cfg.icon
				)}
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-[color:var(--foreground)]">{title}</p>
				<p className="mt-0.5 text-xs text-[color:var(--muted)]">{description}</p>
				<Link
					href={href}
					className={`mt-2 inline-block text-xs font-medium ${status === "locked" ? "pointer-events-none opacity-40" : "hover:underline"}`}
					style={{ color: status === "locked" ? "var(--muted)" : "var(--accent-strong)" }}
				>
					{actionLabel}
				</Link>
			</div>
		</div>
	);
}

export default async function ClientOverviewPage({
	params,
}: ClientOverviewPageProps) {
	const [client, intake, assessments, quotes] = await Promise.all([
		getClientById(params.id),
		getLatestIntakeByClientId(params.id),
		getAssessmentsByClientId(params.id),
		getQuotesByClientId(params.id),
	]);
	if (!client) notFound();

	const address = [
		client.address_line1,
		client.address_line2,
		[client.city, client.state].filter(Boolean).join(", "),
		client.zip,
	]
		.filter(Boolean)
		.join("\n");

	const intakeStatus = !intake
		? "not_started"
		: intake.status === "submitted"
			? "submitted"
			: "draft";

	const hasAssessment = assessments.length > 0;
	const hasQuote = quotes.length > 0;

	return (
		<div className="space-y-6">
			{/* Guided Workflow */}
			<section>
				<h2 className="mb-3 text-sm font-semibold text-[color:var(--foreground)]">
					Workflow
				</h2>
				<div className="grid gap-3 sm:grid-cols-3">
					<WorkflowStep
						stepNumber={1}
						title="Intake Assessment"
						description={
							intakeStatus === "submitted"
								? `Completed v${intake?.version ?? 1}`
								: intakeStatus === "draft"
									? `In progress (v${intake?.version ?? 1})`
									: "Start the 3-tier assessment"
						}
						status={
							intakeStatus === "submitted"
								? "complete"
								: intakeStatus === "draft"
									? "in_progress"
									: "not_started"
						}
						href={`/clients/${client.id}/intake`}
						actionLabel={
							intakeStatus === "not_started"
								? "Start Intake"
								: intakeStatus === "draft"
									? "Continue"
									: "View / Revise"
						}
					/>
					<WorkflowStep
						stepNumber={2}
						title="Risk Assessment"
						description={
							hasAssessment
								? `${assessments.length} assessment${assessments.length !== 1 ? "s" : ""} generated`
								: "Auto-generated from submitted intake"
						}
						status={
							hasAssessment
								? "complete"
								: intakeStatus === "submitted"
									? "not_started"
									: "locked"
						}
						href={`/clients/${client.id}/assessments`}
						actionLabel="View Assessments"
					/>
					<WorkflowStep
						stepNumber={3}
						title="Quote & Pricing"
						description={
							hasQuote
								? `${quotes.length} quote${quotes.length !== 1 ? "s" : ""} created`
								: "Generate pricing from assessment"
						}
						status={
							hasQuote
								? "complete"
								: hasAssessment
									? "not_started"
									: "locked"
						}
						href={`/clients/${client.id}/quotes`}
						actionLabel={hasQuote ? "View Quotes" : "Create Quote"}
					/>
				</div>
			</section>

			{/* Intake status banner */}
			<section
				className={`rounded-2xl border p-5 ${
					intakeStatus === "submitted"
						? "border-emerald-200 bg-emerald-50"
						: intakeStatus === "draft"
							? "border-amber-200 bg-amber-50"
							: "border-[color:var(--border)] bg-[color:var(--surface)]"
				}`}
			>
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div
							className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
								intakeStatus === "submitted"
									? "bg-emerald-100 text-emerald-700"
									: intakeStatus === "draft"
										? "bg-amber-100 text-amber-700"
										: "bg-[color:var(--border)] text-[color:var(--muted)]"
							}`}
						>
							{intakeStatus === "submitted" ? (
								<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							) : (
								<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							)}
						</div>
						<div>
							<p className="text-sm font-semibold text-[color:var(--foreground)]">
								{intakeStatus === "not_started" && "No intake on file"}
								{intakeStatus === "draft" && `Intake in progress (v${intake?.version ?? 1})`}
								{intakeStatus === "submitted" && `Intake submitted (v${intake?.version ?? 1})`}
							</p>
							<p className="text-xs text-[color:var(--muted)]">
								{intakeStatus === "not_started" && "Begin the 3-tier assessment workflow"}
								{intakeStatus === "draft" && "Continue the assessment where you left off"}
								{intakeStatus === "submitted" && `Submitted ${formatDate(intake?.submitted_at ?? null)}`}
							</p>
						</div>
					</div>
					<Link
						href={`/clients/${client.id}/intake`}
						className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
							intakeStatus === "submitted"
								? "border border-[color:var(--border)] bg-white text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
								: "bg-[color:var(--accent)] text-white hover:opacity-90"
						}`}
					>
						{intakeStatus === "not_started" ? "Start Intake" : intakeStatus === "draft" ? "Continue Intake" : "View / Revise"}
					</Link>
				</div>
			</section>

			{/* Profile + Address */}
			<div className="grid gap-6 lg:grid-cols-2">
				<section className="surface rounded-2xl p-6">
					<h2 className="mb-2 text-sm font-semibold text-[color:var(--foreground)]">
						Profile
					</h2>
					<dl className="divide-y divide-[color:var(--border)]">
						<DetailRow label="Full name" value={client.full_name} />
						<DetailRow label="Email" value={client.email} />
						<DetailRow label="Phone" value={client.phone} />
						<DetailRow label="Status" value={client.status} />
						<DetailRow
							label="Added"
							value={formatDate(client.created_at)}
						/>
					</dl>
				</section>

				<section className="surface rounded-2xl p-6">
					<h2 className="mb-2 text-sm font-semibold text-[color:var(--foreground)]">
						Address
					</h2>
					{address ? (
						<p className="whitespace-pre-line text-sm text-[color:var(--foreground)]">
							{address}
						</p>
					) : (
						<p className="text-sm italic text-[color:var(--muted)]">
							No address on file.
						</p>
					)}
				</section>
			</div>
		</div>
	);
}
