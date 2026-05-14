import { notFound } from "next/navigation";
import { getClientById } from "@/services/clients";
import { getLatestIntakeByClientId } from "@/services/intake";
import { IntakeWizard } from "@/features/intake/components/intake-wizard";
import { StartRevisionButton } from "@/features/intake/components/start-revision-button";

type Props = { params: { id: string } };

export default async function ClientIntakePage({ params }: Props) {
	const [client, intake] = await Promise.all([
		getClientById(params.id),
		getLatestIntakeByClientId(params.id),
	]);

	if (!client) notFound();

	// Submitted → read-only view with option to start a revision
	if (intake?.status === "submitted") {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold text-[color:var(--foreground)]">
							Intake Submitted
						</h2>
						<p className="text-sm text-[color:var(--muted)]">
							Version {intake.version} · Submitted{" "}
							{intake.submitted_at
								? new Date(
										intake.submitted_at
									).toLocaleDateString()
								: ""}
						</p>
					</div>
					<StartRevisionButton clientId={client.id} />
				</div>

				<div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
					This intake is locked. Start a revision to make corrections
					or update the assessment. The scoring engine will use the
					submitted record in Phase 10.
				</div>
			</div>
		);
	}

	// Draft or no intake → show wizard (creates on first save)
	return (
		<div>
			<IntakeWizard client={client} intake={intake} />
		</div>
	);
}
