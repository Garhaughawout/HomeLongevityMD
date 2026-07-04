"use client";

import { useTransition, useState } from "react";
import type { ClientRow } from "@/types/supabase";
import type { ClientIntakeSections } from "@/types/intake";
import { INTAKE_SECTION_LABELS } from "@/types/domain";
import { submitIntakeAction } from "@/features/intake/actions/submit-intake";
import { extractHomeFindings } from "@/features/intake/lib/findings";

type Props = {
	client: ClientRow;
	intakeId: string;
	sections: ClientIntakeSections;
	onSubmitSuccess: () => void;
};

const SECTION_KEYS = [
	"clinical_context",
	"steadi",
	"adl_iadl",
	"tug_test",
	"frail_scale",
	"slums",
	"ot_clinical_judgment",
	"berg_balance",
	"tier2_cognitive",
	"tier2_frailty",
	"tier2_environmental",
	"physician_review",
] as const satisfies ReadonlyArray<keyof ClientIntakeSections>;

function hasData(val: object | null | undefined): boolean {
	if (!val) return false;
	return Object.values(val).some(
		(v) => v !== null && v !== undefined && v !== ""
	);
}

export function IntakeReview({
	client,
	intakeId,
	sections,
	onSubmitSuccess,
}: Props) {
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const findings = extractHomeFindings(
		sections.steadi,
		sections.tier2_environmental
	);
	const modifications = sections.home_modifications;

	function handleSubmit() {
		setError(null);
		startTransition(async () => {
			const result = await submitIntakeAction(intakeId);
			if ("error" in result) {
				setError(result.error);
			} else {
				onSubmitSuccess();
			}
		});
	}

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
				<h3 className="mb-4 text-sm font-semibold text-[color:var(--foreground)]">
					Section Completion
				</h3>
				<ul className="space-y-2">
					{SECTION_KEYS.map((key) => {
						const complete = hasData(sections[key]);
						return (
							<li
								key={key}
								className="flex items-center gap-3 text-sm"
							>
								<span
									className={[
										"flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs",
										complete
											? "bg-emerald-100 text-emerald-700"
											: "bg-[color:var(--border)] text-[color:var(--muted)]",
									].join(" ")}
								>
									{complete ? (
										<svg
											viewBox="0 0 16 16"
											fill="currentColor"
											className="h-3 w-3"
										>
											<path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
										</svg>
									) : (
										"–"
									)}
								</span>
								<span
									className={
										complete
											? "text-[color:var(--foreground)]"
											: "text-[color:var(--muted)]"
									}
								>
									{INTAKE_SECTION_LABELS[key]}
								</span>
								{!complete && (
									<span className="text-xs text-amber-600">
										Not started
									</span>
								)}
							</li>
						);
					})}
				</ul>
			</div>

			{findings.length > 0 && (
				<div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
					<div className="mb-3 flex items-center justify-between border-b border-[color:var(--border)] pb-3">
						<h3 className="text-base font-semibold text-[color:var(--foreground)]">
							Issues identified in the home
						</h3>
						<span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-medium text-amber-800">
							{findings.length} found
						</span>
					</div>
					<ul className="divide-y divide-[color:var(--border)]">
						{findings.map((f) => {
							const addressed = (modifications?.items ?? []).some(
								(item) => item.triggered_by === f.triggered_by
							);
							return (
								<li
									key={f.id}
									className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2.5"
								>
									<div className="min-w-[14rem] flex-1">
										<p className="text-sm leading-snug text-[color:var(--foreground)]">
											{f.description}
										</p>
										<p className="mt-0.5 text-xs text-[color:var(--muted)]">
											{f.area}
											{" · "}
											{f.source === "steadi"
												? "STEADI"
												: "Tier 2 environmental"}
										</p>
									</div>
									<span
										className={[
											"shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
											addressed
												? "bg-emerald-100 text-emerald-800"
												: "bg-amber-100 text-amber-800",
										].join(" ")}
									>
										{addressed ? "Modification planned" : "Not addressed"}
									</span>
								</li>
							);
						})}
					</ul>
				</div>
			)}

			<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
				<strong>Before submitting:</strong> Review all sections above.
				Once submitted, this intake record is locked. You can start a
				new revision afterward if corrections are needed.
			</div>

			<div className="rounded-lg border border-[color:var(--border)] p-4 text-sm">
				<p className="text-[color:var(--muted)]">
					<span className="font-medium text-[color:var(--foreground)]">
						Client:
					</span>{" "}
					{client.full_name}
				</p>
			</div>

			{error && (
				<p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</p>
			)}

			<button
				onClick={handleSubmit}
				disabled={isPending}
				className="w-full rounded-lg bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
			>
				{isPending ? "Submitting…" : "Submit Intake"}
			</button>
		</div>
	);
}
