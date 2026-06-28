import Link from "next/link";
import { createServerSupabaseClient } from "@/services/supabase/server";
import type { RiskAssessmentRow } from "@/types/supabase";

const CATEGORY_STYLES: Record<
	string,
	{ bg: string; text: string; label: string }
> = {
	low: { bg: "rgba(16,185,129,0.10)", text: "#065f46", label: "Low" },
	moderate: {
		bg: "rgba(199,157,67,0.12)",
		text: "#9b7424",
		label: "Moderate",
	},
	high: { bg: "rgba(239,68,68,0.10)", text: "#991b1b", label: "High" },
	very_high: {
		bg: "rgba(239,68,68,0.15)",
		text: "#7f1d1d",
		label: "Very High",
	},
	unsafe_independent: {
		bg: "rgba(109,40,217,0.10)",
		text: "#4c1d95",
		label: "Unsafe Independent",
	},
};

type AssessmentWithClient = RiskAssessmentRow & { client_name?: string };

async function getAllAssessments(): Promise<AssessmentWithClient[]> {
	const supabase = createServerSupabaseClient();
	const { data: assessments, error } = await supabase
		.from("risk_assessments")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(100);
	if (error) throw new Error(error.message);
	if (!assessments || assessments.length === 0) return [];

	const clientIds = Array.from(new Set(assessments.map((a) => a.client_id)));
	const { data: clients } = await supabase
		.from("clients")
		.select("id, full_name")
		.in("id", clientIds);
	const nameMap = new Map(
		(clients ?? []).map((c: { id: string; full_name: string }) => [
			c.id,
			c.full_name,
		])
	);

	return assessments.map((a) => ({
		...a,
		client_name: nameMap.get(a.client_id) ?? "Unknown",
	}));
}

export default async function AssessmentsPage() {
	const assessments = await getAllAssessments();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-[color:var(--foreground)]">
					Assessments
				</h1>
				<p className="mt-1 text-sm text-[color:var(--muted)]">
					All risk assessments across clients, newest first.
				</p>
			</div>

			{assessments.length === 0 ? (
				<div
					className="rounded-2xl p-8 text-center"
					style={{
						background: "var(--surface)",
						border: "1px solid var(--border)",
					}}
				>
					<p className="text-sm" style={{ color: "var(--muted)" }}>
						No assessments yet. Complete a client intake to generate
						one.
					</p>
				</div>
			) : (
				<div
					className="rounded-2xl overflow-hidden"
					style={{
						background: "var(--surface)",
						border: "1px solid var(--border)",
					}}
				>
					<table className="w-full text-sm">
						<thead>
							<tr
								style={{
									borderBottom: "1px solid var(--border)",
								}}
							>
								<th
									className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
									style={{ color: "var(--muted)" }}
								>
									Client
								</th>
								<th
									className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
									style={{ color: "var(--muted)" }}
								>
									Risk
								</th>
								<th
									className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider"
									style={{ color: "var(--muted)" }}
								>
									Score
								</th>
								<th
									className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider"
									style={{ color: "var(--muted)" }}
								>
									Date
								</th>
							</tr>
						</thead>
						<tbody
							className="divide-y"
							style={{ borderColor: "var(--border)" }}
						>
							{assessments.map((a) => {
								const style =
									CATEGORY_STYLES[a.risk_category] ??
									CATEGORY_STYLES.moderate;
								return (
									<tr
										key={a.id}
										className="hover:bg-black/[0.02]"
									>
										<td className="px-5 py-3">
											<Link
												href={`/clients/${a.client_id}/assessments`}
												className="font-medium hover:underline"
												style={{
													color: "var(--foreground)",
												}}
											>
												{a.client_name}
											</Link>
										</td>
										<td className="px-5 py-3">
											<span
												className="px-2 py-0.5 rounded-full text-xs font-medium"
												style={{
													backgroundColor: style.bg,
													color: style.text,
												}}
											>
												{style.label}
											</span>
										</td>
										<td
											className="px-5 py-3 text-right tabular-nums font-semibold"
											style={{ color: "var(--ink)" }}
										>
											{a.aggregate_score}
											<span
												className="text-xs font-normal"
												style={{
													color: "var(--muted)",
												}}
											>
												/100
											</span>
										</td>
										<td
											className="px-5 py-3 text-right text-xs tabular-nums"
											style={{ color: "var(--muted)" }}
										>
											{new Date(
												a.created_at
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
