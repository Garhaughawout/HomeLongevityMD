"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
	createQuoteAction,
	updateQuoteAction,
	updateQuoteStatusAction,
	regenerateQuoteAction,
	deleteQuoteAction,
	recordOutcomeAction,
	type CreateQuoteFormState,
	type EditQuoteFormState,
	type OutcomeFormState,
} from "@/features/clients/actions/quotes";
import type { QuoteRow, RiskAssessmentRow, ClientIntakeRow } from "@/types/supabase";
import type { HomeModificationsData } from "@/types/modifications";
import {
	suggestQuote,
	DEFAULT_BASE_PLAN_FEE,
	DECLINE_REASONS,
	ADJUSTMENT_REASONS,
	priceFromModifications,
	DEFAULT_MARKUP_PERCENT,
	DEFAULT_ASSESSMENT_FEE,
	type ModificationLineItem,
	type ModificationPricingResult,
} from "@/services/pricing";

// -- Helpers ------------------------------------------------------------------

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
	draft: { bg: "#f3f4f6", text: "#374151" },
	sent: { bg: "rgba(199,157,67,0.12)", text: "#9b7424" },
	accepted: { bg: "rgba(16,185,129,0.12)", text: "#065f46" },
	declined: { bg: "rgba(239,68,68,0.10)", text: "#991b1b" },
	expired: { bg: "#f3f4f6", text: "#6b7280" },
};

const STATUS_LABELS: Record<string, string> = {
	draft: "Draft",
	sent: "Sent",
	accepted: "Accepted",
	declined: "Declined",
	expired: "Expired",
};

const PRIORITY_DOT: Record<string, string> = {
	safety_critical: "#dc2626",
	recommended: "#f59e0b",
	optional: "#6b7280",
};

const CATEGORY_LABELS: Record<string, string> = {
	bathroom: "Bathroom",
	entrance: "Entrance",
	stairs: "Stairs",
	kitchen: "Kitchen",
	bedroom: "Bedroom",
	hallway: "Hallway",
	general: "General",
	outdoor: "Outdoor",
};

function formatCurrency(n: number | string | null) {
	if (n == null) return "N/A";
	return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string | null) {
	if (!iso) return "N/A";
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function parseModifications(intake: ClientIntakeRow | null): HomeModificationsData | null {
	if (!intake?.home_modifications) return null;
	const raw = intake.home_modifications as unknown as HomeModificationsData;
	return Array.isArray(raw.items) ? raw : null;
}

// -- Outcome Modal ------------------------------------------------------------

function OutcomeModal({
	quote,
	clientId,
	outcomeType,
	onClose,
}: {
	quote: QuoteRow;
	clientId: string;
	outcomeType: "accepted" | "declined";
	onClose: () => void;
}) {
	const boundAction = recordOutcomeAction.bind(null, clientId, quote.id);
	const [state, formAction] = useFormState<OutcomeFormState, FormData>(
		boundAction,
		{}
	);

	useEffect(() => {
		if (state.success) onClose();
	}, [state.success, onClose]);

	const isDecline = outcomeType === "declined";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div
				className="w-full max-w-lg rounded-2xl p-6 space-y-4"
				style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
			>
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
						{isDecline ? "Record Decline" : "Record Acceptance"} - Quote v{quote.version}
					</h3>
					<button onClick={onClose} className="text-sm" style={{ color: "var(--muted)" }}>
						Close
					</button>
				</div>

				<form action={formAction} className="space-y-4">
					<input type="hidden" name="outcome" value={outcomeType} />

					{isDecline && (
						<div>
							<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
								Reason for Decline
							</label>
							<select
								name="decline_reason"
								className="w-full rounded-lg border px-3 py-2 text-sm"
								style={{
									borderColor: "var(--border-strong)",
									color: "var(--foreground)",
									backgroundColor: "var(--surface-strong)",
								}}
							>
								<option value="">Select a reason...</option>
								{Object.entries(DECLINE_REASONS).map(([value, label]) => (
									<option key={value} value={value}>
										{label}
									</option>
								))}
							</select>
						</div>
					)}

					{isDecline && (
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
									Competitor Name
								</label>
								<input
									name="competitor_name"
									type="text"
									className="w-full rounded-lg border px-3 py-2 text-sm"
									style={{
										borderColor: "var(--border-strong)",
										color: "var(--foreground)",
										backgroundColor: "var(--surface-strong)",
									}}
									placeholder="e.g., Home Instead"
								/>
							</div>
							<div>
								<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
									Competitor Price ($)
								</label>
								<input
									name="competitor_price"
									type="number"
									step="0.01"
									min="0"
									className="w-full rounded-lg border px-3 py-2 text-sm"
									style={{
										borderColor: "var(--border-strong)",
										color: "var(--foreground)",
										backgroundColor: "var(--surface-strong)",
									}}
									placeholder="0.00"
								/>
							</div>
						</div>
					)}

					<div>
						<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
							{isDecline ? "Adjusted Final Price (if negotiated)" : "Final Agreed Price ($)"}
						</label>
						<input
							name="adjusted_final_price"
							type="number"
							step="0.01"
							min="0"
							defaultValue={isDecline ? "" : quote.plan_fee}
							className="w-full rounded-lg border px-3 py-2 text-sm"
							style={{
								borderColor: "var(--border-strong)",
								color: "var(--foreground)",
								backgroundColor: "var(--surface-strong)",
							}}
							placeholder={formatCurrency(quote.plan_fee)}
						/>
					</div>

					<div>
						<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
							Client Feedback
						</label>
						<textarea
							name="client_feedback"
							rows={3}
							className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
							style={{
								borderColor: "var(--border-strong)",
								color: "var(--foreground)",
								backgroundColor: "var(--surface-strong)",
							}}
							placeholder={isDecline ? "What did the client say?" : "Any notes on the acceptance?"}
						/>
					</div>

					{state.globalError && (
						<p className="text-xs text-red-600">{state.globalError}</p>
					)}

					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-1.5 rounded-lg text-sm border"
							style={{ borderColor: "var(--border-strong)", color: "var(--muted-strong)" }}
						>
							Cancel
						</button>
						<OutcomeSubmitBtn isDecline={isDecline} />
					</div>
				</form>
			</div>
		</div>
	);
}

function OutcomeSubmitBtn({ isDecline }: { isDecline: boolean }) {
	const { pending } = useFormStatus();
	return (
		<button
			type="submit"
			disabled={pending}
			className="px-4 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
			style={{ backgroundColor: isDecline ? "#dc2626" : "#059669" }}
		>
			{pending ? "Saving..." : isDecline ? "Record Decline" : "Record Acceptance"}
		</button>
	);
}

// -- Edit Quote Form ----------------------------------------------------------

function EditQuoteForm({
	quote,
	clientId,
	onClose,
}: {
	quote: QuoteRow;
	clientId: string;
	onClose: () => void;
}) {
	const boundAction = updateQuoteAction.bind(null, clientId, quote.id);
	const [state, formAction] = useFormState<EditQuoteFormState, FormData>(
		boundAction,
		{}
	);

	const [baseRate, setBaseRate] = useState(Number(quote.base_plan_fee).toFixed(2));
	const [multiplier, setMultiplier] = useState(Number(quote.risk_multiplier).toFixed(2));
	const [services, setServices] = useState(
		Array.isArray(quote.services_included)
			? (quote.services_included as string[]).join("\n")
			: ""
	);

	const hasSuggestion = quote.suggested_base_fee !== null;
	const changedFromSuggestion =
		hasSuggestion &&
		(Number(baseRate) !== Number(quote.suggested_base_fee) ||
		 Number(multiplier) !== Number(quote.suggested_multiplier));

	useEffect(() => {
		if (state.success) onClose();
	}, [state.success, onClose]);

	const finalRate =
		Math.round(parseFloat(baseRate || "0") * parseFloat(multiplier || "1") * 100) / 100;

	return (
		<form action={formAction} className="mt-4 space-y-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
			<p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Edit Quote</p>

			{hasSuggestion && (
				<div className="rounded-lg p-3 text-xs" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
					<p style={{ color: "var(--muted)" }} className="mb-2">
						Engine suggestion: <strong>{formatCurrency(quote.suggested_base_fee)}</strong> x{" "}
						<strong>{Number(quote.suggested_multiplier).toFixed(2)}x</strong> ={" "}
						<strong>{formatCurrency(quote.suggested_plan_fee)}</strong>
					</p>
					{changedFromSuggestion && (
						<p style={{ color: "#9b7424" }}>
							You have adjusted from the suggestion - select a reason below.
						</p>
					)}
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
						Base Plan Fee ($) *
					</label>
					<input
						name="base_plan_fee"
						type="number"
						step="0.01"
						min="0"
						required
						value={baseRate}
						onChange={(e) => setBaseRate(e.target.value)}
						className="w-full rounded-lg border px-3 py-2 text-sm"
						style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
					/>
					{state.errors?.base_plan_fee && (
						<p className="mt-1 text-xs text-red-600">{state.errors.base_plan_fee[0]}</p>
					)}
				</div>
				<div>
					<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
						Risk Multiplier
					</label>
					<input
						name="risk_multiplier"
						type="number"
						step="0.01"
						min="1"
						value={multiplier}
						onChange={(e) => setMultiplier(e.target.value)}
						className="w-full rounded-lg border px-3 py-2 text-sm"
						style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
					/>
					<p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
						Plan Fee: {formatCurrency(finalRate)}
					</p>
				</div>
				<div>
					<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
						Valid Until
					</label>
					<input
						name="valid_until"
						type="date"
						defaultValue={quote.valid_until ?? ""}
						className="w-full rounded-lg border px-3 py-2 text-sm"
						style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
					/>
				</div>
			</div>
			<div>
				<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
					Services Included (one per line)
				</label>
				<textarea
					name="services_included"
					rows={4}
					value={services}
					onChange={(e) => setServices(e.target.value)}
					className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
					style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
				/>
			</div>

			{(changedFromSuggestion || !hasSuggestion) && (
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
							Reason for Adjustment
						</label>
						<select
							name="adjustment_reason"
							className="w-full rounded-lg border px-3 py-2 text-sm"
							style={{
								borderColor: "var(--border-strong)",
								color: "var(--foreground)",
								backgroundColor: "var(--surface-strong)",
							}}
						>
							<option value="">Select a reason...</option>
							{Object.entries(ADJUSTMENT_REASONS).map(([value, label]) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
							Adjustment Notes
						</label>
						<input
							name="adjustment_note"
							type="text"
							className="w-full rounded-lg border px-3 py-2 text-sm"
							style={{
								borderColor: "var(--border-strong)",
								color: "var(--foreground)",
								backgroundColor: "var(--surface-strong)",
							}}
							placeholder="Optional context"
						/>
					</div>
				</div>
			)}

			{state.globalError && (
				<p className="text-xs text-red-600">{state.globalError}</p>
			)}
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onClose}
					className="px-4 py-1.5 rounded-lg text-sm border"
					style={{ borderColor: "var(--border-strong)", color: "var(--muted-strong)" }}
				>
					Cancel
				</button>
				<EditSubmitBtn />
			</div>
		</form>
	);
}

function EditSubmitBtn() {
	const { pending } = useFormStatus();
	return (
		<button
			type="submit"
			disabled={pending}
			className="px-4 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
			style={{ backgroundColor: "var(--navy)" }}
		>
			{pending ? "Saving..." : "Save Changes"}
		</button>
	);
}

// -- Modification Line Items Table --------------------------------------------

function ModificationItemsTable({ items }: { items: ModificationLineItem[] }) {
	return (
		<div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
			<table className="w-full text-xs">
				<thead>
					<tr style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
						<th className="px-3 py-2 text-left font-medium" style={{ color: "var(--muted-strong)" }}>Modification</th>
						<th className="px-3 py-2 text-left font-medium" style={{ color: "var(--muted-strong)" }}>Category</th>
						<th className="px-3 py-2 text-left font-medium" style={{ color: "var(--muted-strong)" }}>Priority</th>
						<th className="px-3 py-2 text-right font-medium" style={{ color: "var(--muted-strong)" }}>Cost</th>
					</tr>
				</thead>
				<tbody>
					{items.map((item, i) => (
						<tr key={i} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}>
							<td className="px-3 py-2" style={{ color: "var(--foreground)" }}>{item.description}</td>
							<td className="px-3 py-2" style={{ color: "var(--muted)" }}>{CATEGORY_LABELS[item.category] ?? item.category}</td>
							<td className="px-3 py-2">
								<span className="flex items-center gap-1.5">
									<span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_DOT[item.priority] ?? "#6b7280" }} />
									<span style={{ color: "var(--muted)" }}>{item.priority.replace(/_/g, " ")}</span>
								</span>
							</td>
							<td className="px-3 py-2 text-right font-medium" style={{ color: "var(--foreground)" }}>{formatCurrency(item.estimated_cost)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

// -- Create Quote Form (modification-based) -----------------------------------

function CreateQuoteForm({
	clientId,
	assessments,
	intake,
	defaultAssessmentId,
	onClose,
}: {
	clientId: string;
	assessments: RiskAssessmentRow[];
	intake: ClientIntakeRow | null;
	defaultAssessmentId?: string;
	onClose: () => void;
}) {
	const boundAction = createQuoteAction.bind(null, clientId);
	const [state, formAction] = useFormState<CreateQuoteFormState, FormData>(
		boundAction,
		{}
	);

	const modsData = parseModifications(intake);
	const hasMods = !!modsData && modsData.items.length > 0;

	const modsPricing: ModificationPricingResult | null = hasMods && modsData
		? priceFromModifications(modsData)
		: null;

	const fallbackAssessment = assessments.find((a) => a.id === defaultAssessmentId) ?? assessments[0];
	const fallbackSuggestion = fallbackAssessment ? suggestQuote(fallbackAssessment) : null;

	const suggestedTotal = modsPricing?.total_quote ?? fallbackSuggestion?.plan_fee ?? DEFAULT_BASE_PLAN_FEE;

	const [baseFee, setBaseFee] = useState(suggestedTotal.toFixed(2));
	const [assessmentFee, setAssessmentFee] = useState(
		(modsPricing?.assessment_fee ?? DEFAULT_ASSESSMENT_FEE).toFixed(2)
	);
	const [markupPercent, setMarkupPercent] = useState(
		(modsPricing?.markup_percent ?? DEFAULT_MARKUP_PERCENT).toString()
	);
	const [services, setServices] = useState("");
	const [currentSuggestion, setCurrentSuggestion] = useState<{
		base_fee: string;
		assessment_fee: string;
		markup: string;
		total: string;
		services: string;
	} | null>(null);

	useEffect(() => {
		if (hasMods && modsPricing) {
			const servLines = modsPricing.line_items.map((li) => li.description);
			setServices(servLines.join("\n"));
			setCurrentSuggestion({
				base_fee: suggestedTotal.toFixed(2),
				assessment_fee: modsPricing.assessment_fee.toFixed(2),
				markup: modsPricing.markup_percent.toString(),
				total: suggestedTotal.toFixed(2),
				services: servLines.join("\n"),
			});
		} else if (fallbackSuggestion) {
			setServices(fallbackSuggestion.suggested_services.join("\n"));
			setCurrentSuggestion({
				base_fee: suggestedTotal.toFixed(2),
				assessment_fee: DEFAULT_ASSESSMENT_FEE.toFixed(2),
				markup: DEFAULT_MARKUP_PERCENT.toString(),
				total: suggestedTotal.toFixed(2),
				services: fallbackSuggestion.suggested_services.join("\n"),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (state.success) onClose();
	}, [state.success, onClose]);

	const defaultValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.slice(0, 10);

	const modCost = modsPricing?.total_modification_cost ?? 0;
	const markupVal = Math.round(modCost * (parseFloat(markupPercent || "0") / 100) * 100) / 100;
	const assessFee = parseFloat(assessmentFee || "0");
	const liveTotal = Math.round((modCost + markupVal + assessFee) * 100) / 100;

	const adjustedFromSuggestion =
		currentSuggestion &&
		(liveTotal.toFixed(2) !== currentSuggestion.total ||
		 markupPercent !== currentSuggestion.markup ||
		 assessmentFee !== currentSuggestion.assessment_fee);

	return (
		<div
			className="rounded-2xl p-6 space-y-4"
			style={{
				background: "var(--surface)",
				border: "1px solid var(--border)",
			}}
		>
			<h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
				New Quote
			</h2>

			{!hasMods && (
				<div className="rounded-lg p-3 text-xs" style={{ backgroundColor: "rgba(199,157,67,0.08)", border: "1px solid rgba(199,157,67,0.2)" }}>
					<p style={{ color: "#9b7424" }}>
						No home modifications found in the latest intake. Quote will use risk-based pricing fallback.
					</p>
				</div>
			)}

			{hasMods && modsPricing && (
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
							Modification Breakdown ({modsPricing.line_items.length} items)
						</h3>
						<span className="text-xs" style={{ color: "var(--muted)" }}>
							From intake v{intake?.version ?? 1}
						</span>
					</div>
					<ModificationItemsTable items={modsPricing.line_items} />

					<div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: "var(--surface-strong)", border: "1px solid var(--border)" }}>
						<div className="flex justify-between text-xs">
							<span style={{ color: "var(--muted)" }}>Modification costs subtotal</span>
							<span className="font-medium" style={{ color: "var(--foreground)" }}>{formatCurrency(modsPricing.total_modification_cost)}</span>
						</div>
						<div className="flex justify-between text-xs">
							<span style={{ color: "var(--muted)" }}>Markup ({modsPricing.markup_percent}%)</span>
							<span className="font-medium" style={{ color: "var(--foreground)" }}>+{formatCurrency(modsPricing.markup_amount)}</span>
						</div>
						<div className="flex justify-between text-xs">
							<span style={{ color: "var(--muted)" }}>Assessment fee</span>
							<span className="font-medium" style={{ color: "var(--foreground)" }}>+{formatCurrency(modsPricing.assessment_fee)}</span>
						</div>
						<div className="flex justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
							<span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Suggested total</span>
							<span className="text-sm font-bold" style={{ color: "var(--ink)" }}>{formatCurrency(modsPricing.total_quote)}</span>
						</div>
					</div>
				</div>
			)}

			<form action={formAction} className="space-y-4">
				{adjustedFromSuggestion && (
					<div className="rounded-lg p-3 text-xs" style={{ backgroundColor: "rgba(199,157,67,0.08)", border: "1px solid rgba(199,157,67,0.2)" }}>
						<p style={{ color: "#9b7424" }}>
							You have adjusted from the engine suggestion. Both the original suggestion and your changes will be saved for training.
						</p>
					</div>
				)}

				<div className="grid gap-4 sm:grid-cols-3">
					<div>
						<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
							Base Fee ($)
						</label>
						<input
							name="base_plan_fee"
							type="number"
							step="0.01"
							min="0"
							required
							value={baseFee}
							onChange={(e) => setBaseFee(e.target.value)}
							className="w-full rounded-lg border px-3 py-2 text-sm"
							style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
						/>
						{state.errors?.base_plan_fee && (
							<p className="mt-1 text-xs text-red-600">{state.errors.base_plan_fee[0]}</p>
						)}
					</div>
					<div>
						<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
							Markup (%)
						</label>
						<input
							type="number"
							step="1"
							min="0"
							value={markupPercent}
							onChange={(e) => setMarkupPercent(e.target.value)}
							className="w-full rounded-lg border px-3 py-2 text-sm"
							style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
						/>
						<p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
							+{formatCurrency(markupVal)}
						</p>
					</div>
					<div>
						<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
							Assessment Fee ($)
						</label>
						<input
							type="number"
							step="0.01"
							min="0"
							value={assessmentFee}
							onChange={(e) => setAssessmentFee(e.target.value)}
							className="w-full rounded-lg border px-3 py-2 text-sm"
							style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
						/>
					</div>
				</div>

				<div className="rounded-lg p-3" style={{ backgroundColor: "var(--surface-strong)", border: "1px solid var(--border)" }}>
					<div className="flex justify-between">
						<span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Quote Total</span>
						<span className="text-lg font-bold" style={{ color: "var(--ink)" }}>{formatCurrency(liveTotal)}</span>
					</div>
				</div>

				<div>
					<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
						Services Included (one per line)
					</label>
					<textarea
						name="services_included"
						rows={5}
						value={services}
						onChange={(e) => setServices(e.target.value)}
						placeholder={"Install grab bars\nAdd ramp to entrance\nWiden hallway doorframe"}
						className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
						style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
					/>
				</div>

				<div>
					<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
						Valid Until
					</label>
					<input
						name="valid_until"
						type="date"
						defaultValue={defaultValidUntil}
						className="w-full rounded-lg border px-3 py-2 text-sm"
						style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
					/>
				</div>

				<input type="hidden" name="risk_multiplier" value="1.00" />
				{currentSuggestion && (
					<>
						<input type="hidden" name="suggested_base_fee" value={currentSuggestion.base_fee} />
						<input type="hidden" name="suggested_multiplier" value="1.00" />
						<input type="hidden" name="suggested_plan_fee" value={currentSuggestion.total} />
						<input type="hidden" name="suggested_services" value={currentSuggestion.services} />
					</>
				)}

				{state.globalError && (
					<p className="text-xs text-red-600">{state.globalError}</p>
				)}

				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-1.5 rounded-lg text-sm border"
						style={{ borderColor: "var(--border-strong)", color: "var(--muted-strong)" }}
					>
						Cancel
					</button>
					<SubmitBtn />
				</div>
			</form>
		</div>
	);
}

function SubmitBtn() {
	const { pending } = useFormStatus();
	return (
		<button
			type="submit"
			disabled={pending}
			className="px-4 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
			style={{ backgroundColor: "var(--navy)" }}
		>
			{pending ? "Creating..." : "Create Quote"}
		</button>
	);
}

// -- Quote Row ----------------------------------------------------------------

function QuoteRow_({
	quote,
	clientId,
}: {
	quote: QuoteRow;
	clientId: string;
}) {
	const colors = STATUS_COLORS[quote.status] ?? STATUS_COLORS.draft;
	const [pending, setPending] = useState(false);
	const [editing, setEditing] = useState(false);
	const [showOutcome, setShowOutcome] = useState<null | "accepted" | "declined">(null);

	const handleStatus = async (status: "sent" | "expired") => {
		setPending(true);
		await updateQuoteStatusAction(clientId, quote.id, status);
		setPending(false);
	};

	const handleNewVersion = async () => {
		setPending(true);
		await regenerateQuoteAction(clientId, quote.id);
		setPending(false);
	};

	const handleDelete = async () => {
		if (!confirm("Delete this quote? This cannot be undone.")) return;
		setPending(true);
		await deleteQuoteAction(clientId, quote.id);
		setPending(false);
	};

	return (
		<div
			className="rounded-xl p-5 space-y-4"
			style={{
				background: "var(--cream-strong)",
				border: "1px solid var(--border)",
			}}
		>
			<div className="flex flex-wrap items-start gap-4 justify-between">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
							Quote v{quote.version}
						</span>
						<span
							className="px-2 py-0.5 rounded-full text-xs font-medium"
							style={{ backgroundColor: colors.bg, color: colors.text }}
						>
							{STATUS_LABELS[quote.status] ?? quote.status}
						</span>
						{quote.human_adjusted_at && (
							<span
								className="px-2 py-0.5 rounded-full text-xs font-medium"
								style={{ backgroundColor: "rgba(199,157,67,0.12)", color: "#9b7424" }}
								title={`Adjusted ${formatDate(quote.human_adjusted_at)}`}
							>
								Adjusted
							</span>
						)}
					</div>
					<p className="text-2xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>
						{formatCurrency(quote.plan_fee)}
					</p>
					<p className="text-xs" style={{ color: "var(--muted)" }}>
						Base {formatCurrency(quote.base_plan_fee)} · Multiplier{" "}
						{Number(quote.risk_multiplier).toFixed(2)}x · Valid until{" "}
						{formatDate(quote.valid_until)}
					</p>
					{quote.suggested_plan_fee !== null && Number(quote.suggested_plan_fee) !== Number(quote.plan_fee) && (
						<p className="text-xs" style={{ color: "var(--muted)" }}>
							<span style={{ color: "#9b7424" }}>
								Engine suggested {formatCurrency(quote.suggested_plan_fee)}
							</span>{" "}
							· Diff {formatCurrency(Number(quote.plan_fee) - Number(quote.suggested_plan_fee))}
						</p>
					)}
				</div>

				<div className="flex flex-wrap gap-2 items-center">
					{quote.status === "draft" && (
						<>
							<button
								disabled={pending}
								onClick={() => setEditing((v) => !v)}
								className="px-3 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-50"
								style={{ borderColor: "var(--border-strong)", color: "var(--foreground)" }}
							>
								{editing ? "Cancel Edit" : "Edit"}
							</button>
							<button
								disabled={pending}
								onClick={() => handleStatus("sent")}
								className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
								style={{ backgroundColor: "var(--navy)" }}
							>
								Mark Sent
							</button>
							<button
								disabled={pending}
								onClick={handleDelete}
								className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 disabled:opacity-50"
							>
								Delete
							</button>
						</>
					)}
					{quote.status === "sent" && (
						<>
							<button
								disabled={pending}
								onClick={() => setShowOutcome("accepted")}
								className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-700 disabled:opacity-50"
							>
								Accept
							</button>
							<button
								disabled={pending}
								onClick={() => setShowOutcome("declined")}
								className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 disabled:opacity-50"
							>
								Decline
							</button>
						</>
					)}
					<button
						disabled={pending}
						onClick={handleNewVersion}
						className="px-3 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-50"
						style={{
							borderColor: "var(--border-strong)",
							color: "var(--muted-strong)",
						}}
					>
						New Version
					</button>
				</div>
			</div>

			{Array.isArray(quote.services_included) &&
				(quote.services_included as string[]).length > 0 && (
					<ul className="flex flex-wrap gap-x-4 gap-y-1">
						{(quote.services_included as string[]).map((s, i) => (
							<li
								key={i}
								className="text-xs flex gap-1 items-center"
								style={{ color: "var(--muted-strong)" }}
							>
								<span style={{ color: "var(--accent)" }}>✓</span>{" "}
								{s}
							</li>
						))}
					</ul>
				)}

			{editing && quote.status === "draft" && (
				<EditQuoteForm
					quote={quote}
					clientId={clientId}
					onClose={() => setEditing(false)}
				/>
			)}

			{showOutcome && (
				<OutcomeModal
					quote={quote}
					clientId={clientId}
					outcomeType={showOutcome}
					onClose={() => setShowOutcome(null)}
				/>
			)}
		</div>
	);
}

// -- QuotesList ---------------------------------------------------------------

type QuotesListProps = {
	clientId: string;
	initialQuotes: QuoteRow[];
	assessments: RiskAssessmentRow[];
	intake: ClientIntakeRow | null;
	defaultAssessmentId?: string;
};

export function QuotesList({
	clientId,
	initialQuotes,
	assessments,
	intake,
	defaultAssessmentId,
}: QuotesListProps) {
	const [showForm, setShowForm] = useState(!!defaultAssessmentId);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
					{initialQuotes.length} Quote{initialQuotes.length !== 1 ? "s" : ""}
				</h2>
				{!showForm && (
					<button
						onClick={() => setShowForm(true)}
						className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
						style={{ backgroundColor: "var(--navy)" }}
					>
						+ New Quote
					</button>
				)}
			</div>

			{showForm && (
				<CreateQuoteForm
					clientId={clientId}
					assessments={assessments}
					intake={intake}
					defaultAssessmentId={defaultAssessmentId}
					onClose={() => setShowForm(false)}
				/>
			)}

			{initialQuotes.length === 0 && !showForm ? (
				<p className="text-sm" style={{ color: "var(--muted)" }}>
					No quotes yet. Create one above.
				</p>
			) : (
				<div className="space-y-3">
					{initialQuotes.map((q) => (
						<QuoteRow_ key={q.id} quote={q} clientId={clientId} />
					))}
				</div>
			)}
		</div>
	);
}
