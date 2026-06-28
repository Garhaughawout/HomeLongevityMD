import Link from "next/link";
import { getClientById } from "@/services/clients";
import { getLatestIntakeByClientId } from "@/services/intake";
import { notFound } from "next/navigation";

type ClientOverviewPageProps = {
	params: { id: string };
};

function formatDate(iso: string | null) {
	if (!iso) return "—";
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
				{value ?? "—"}
			</dd>
		</div>
	);
}

export default async function ClientOverviewPage({
	params,
}: ClientOverviewPageProps) {
	const [client, intake] = await Promise.all([
		getClientById(params.id),
		getLatestIntakeByClientId(params.id),
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

	// Determine intake status
	const intakeStatus = !intake
		? "not_started"
		: intake.status === "submitted"
			? "submitted"
			: "draft";
	const intakeVersion = intake?.version ?? 0;

	return (
		<div className="space-y-6">
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
								{intakeStatus === "draft" && `Intake in progress (v${intakeVersion})`}
								{intakeStatus === "submitted" && `Intake submitted (v${intakeVersion})`}
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
						{intakeStatus === "not_started" ? "Start Intake →" : intakeStatus === "draft" ? "Continue Intake →" : "View / Revise →"}
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
						<DetailRow
							label="Date of birth"
							value={formatDate(client.date_of_birth)}
						/>
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
