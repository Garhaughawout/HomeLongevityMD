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
import type { QuoteRow, RiskAssessmentRow } from "@/types/supabase";
import {
	suggestQuote,
	DEFAULT_BASE_PLAN_FEE,
	DECLINE_REASONS,
	ADJUSTMENT_REASONS,
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

function formatCurrency(n: number | string | null) {
	if (n == null) return "—";
	return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
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
						{isDecline ? "Record Decline" : "Record Acceptance"} — Quote v{quote.version}
					</h3>
					<button onClick={onClose} className="text-sm" style={{ color: "var(--muted)" }}>
						✕
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
								<option value="">Select a reason…</option>
								{Object.entries(DECLINE_REASONS).map(([value, label]) => (
									<option key={value} value={value}>
										{label}
									</option>
								))}
							</select>
						</div>
					)}

					{isDecline && (
						<>
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
						</>
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
			{pending ? "Saving…" : isDecline ? "Record Decline" : "Record Acceptance"}
		</button>
	);
}

// -- Edit Quote Form (with adjustment reason) ----------------------------------

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

	const [baseRate, setBaseRate] = useState(
		Number(quote.base_plan_fee).toFixed(2)
	);
	const [multiplier, setMultiplier] = useState(
		Number(quote.risk_multiplier).toFixed(2)
	);
	const [services, setServices] = useState(
		Array.isArray(quote.services_included)
			? (quote.services_included as string[]).join("\n")
			: ""
	);

	// Show adjustment reason fields only when values differ from suggestion
	const hasSuggestion = quote.suggested_base_fee !== null;
	const changedFromSuggestion =
		hasSuggestion &&
		(Number(baseRate) !== Number(quote.suggested_base_fee) ||
		 Number(multiplier) !== Number(quote.suggested_multiplier));

	useEffect(() => {
		if (state.success) onClose();
	}, [state.success, onClose]);

	const finalRate =
		Math.round(
			parseFloat(baseRate || "0") * parseFloat(multiplier || "1") * 100
		) / 100;

	return (
		<form action={formAction} className="mt-4 space-y-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
			<p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Edit Quote</p>

			{/* Show suggestion comparison if available */}
			{hasSuggestion && (
				<div className="rounded-lg p-3 text-xs" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
					<p style={{ color: "var(--muted)" }} className="mb-2">
						Engine suggestion: <strong>{formatCurrency(quote.suggested_base_fee)}</strong> ×{" "}
						<strong>{Number(quote.suggested_multiplier).toFixed(2)}x</strong> ={" "}
						<strong>{formatCurrency(quote.suggested_plan_fee)}</strong>
					</p>
					{changedFromSuggestion && (
						<p style={{ color: "#9b7424" }}>
							⚠ You&apos;ve adjusted from the suggestion — please select a reason below.
						</p>
					)}
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
						Base Plan Fee ($)
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

			{/* Adjustment reason (shown when changed from suggestion or always if no suggestion) */}
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
							<option value="">Select a reason…</option>
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
			{pending ? "Saving…" : "Save Changes"}
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

	const handleStatus = async (
		status: "sent" | "expired"
	) => {
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
						<span
							className="text-sm font-semibold"
							style={{ color: "var(--foreground)" }}
						>
							Quote v{quote.version}
						</span>
						<span
							className="px-2 py-0.5 rounded-full text-xs font-medium"
							style={{
								backgroundColor: colors.bg,
								color: colors.text,
							}}
						>
							{STATUS_LABELS[quote.status] ?? quote.status}
						</span>
						{/* Show adjustment badge if human changed from suggestion */}
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
					<p
						className="text-2xl font-bold tracking-tight"
						style={{ color: "var(--ink)" }}
					>
						{formatCurrency(quote.plan_fee)}
					</p>
					<p className="text-xs" style={{ color: "var(--muted)" }}>
						Base {formatCurrency(quote.base_plan_fee)} · Multiplier{" "}
						{Number(quote.risk_multiplier).toFixed(2)}x · Valid until{" "}
						{formatDate(quote.valid_until)}
					</p>
					{/* Show suggestion comparison */}
					{quote.suggested_plan_fee !== null && Number(quote.suggested_plan_fee) !== Number(quote.plan_fee) && (
						<p className="text-xs" style={{ color: "var(--muted)" }}>
							<span style={{ color: "#9b7424" }}>
								Engine suggested {formatCurrency(quote.suggested_plan_fee)}
							</span>{" "}
							· Δ {formatCurrency(Number(quote.plan_fee) - Number(quote.suggested_plan_fee))}
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

// -- Create Quote Form (with suggestion tracking) -------------------------------

function CreateQuoteForm({
	clientId,
	assessments,
	defaultAssessmentId,
	onClose,
}: {
	clientId: string;
	assessments: RiskAssessmentRow[];
	defaultAssessmentId?: string;
	onClose: () => void;
}) {
	const boundAction = createQuoteAction.bind(null, clientId);
	const [state, formAction] = useFormState<CreateQuoteFormState, FormData>(
		boundAction,
		{}
	);

	const [selectedAssessmentId, setSelectedAssessmentId] = useState(
		defaultAssessmentId ?? ""
	);
	const [baseRate, setBaseRate] = useState(DEFAULT_BASE_PLAN_FEE.toString());
	const [multiplier, setMultiplier] = useState("1.00");
	const [services, setServices] = useState("");
	const [currentSuggestion, setCurrentSuggestion] = useState<{
		base: string;
		mult: string;
		fee: string;
		services: string;
	} | null>(null);

	useEffect(() => {
		if (defaultAssessmentId) {
			const a = assessments.find((a) => a.id === defaultAssessmentId);
			if (a) applyAssessmentSuggestion(a);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (state.success) onClose();
	}, [state.success, onClose]);

	function applyAssessmentSuggestion(a: RiskAssessmentRow) {
		const s = suggestQuote(a);
		setBaseRate(s.base_plan_fee.toFixed(2));
		setMultiplier(s.risk_multiplier.toFixed(2));
		setServices(s.suggested_services.join("\n"));
		setCurrentSuggestion({
			base: s.base_plan_fee.toFixed(2),
			mult: s.risk_multiplier.toFixed(2),
			fee: s.plan_fee.toFixed(2),
			services: s.suggested_services.join("\n"),
		});
	}

	function handleAssessmentChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const id = e.target.value;
		setSelectedAssessmentId(id);
		const a = assessments.find((a) => a.id === id);
		if (a) {
			applyAssessmentSuggestion(a);
		} else {
			setBaseRate(DEFAULT_BASE_PLAN_FEE.toString());
			setMultiplier("1.00");
			setServices("");
			setCurrentSuggestion(null);
		}
	}

	const defaultValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.slice(0, 10);

	const finalRate =
		Math.round(
			parseFloat(baseRate || "0") * parseFloat(multiplier || "1") * 100
		) / 100;

	const adjustedFromSuggestion =
		currentSuggestion &&
		(baseRate !== currentSuggestion.base ||
		 multiplier !== currentSuggestion.mult);

	return (
		<div
			className="rounded-2xl p-6 space-y-4"
			style={{
				background: "var(--surface)",
				border: "1px solid var(--border)",
			}}
		>
			<h2
				className="text-sm font-semibold"
				style={{ color: "var(--foreground)" }}
			>
				New Quote
			</h2>
			<form action={formAction} className="space-y-4">
				{assessments.length > 0 && (
					<div>
						<label
							className="block text-xs font-medium mb-1"
							style={{ color: "var(--muted-strong)" }}
						>
							Link Assessment
						</label>
						<select
							name="assessment_id"
							value={selectedAssessmentId}
							onChange={handleAssessmentChange}
							className="w-full rounded-lg border px-3 py-2 text-sm"
							style={{
								borderColor: "var(--border-strong)",
								color: "var(--foreground)",
								backgroundColor: "var(--surface-strong)",
							}}
						>
							<option value="">None</option>
							{assessments.map((a) => (
								<option key={a.id} value={a.id}>
									{a.risk_category.replace(/_/g, " ")} — score{" "}
									{a.aggregate_score} —{" "}
									{new Date(a.created_at).toLocaleDateString()}
								</option>
							))}
						</select>
						{selectedAssessmentId && (
							<p className="mt-1 text-xs" style={{ color: "var(--accent)" }}>
								Plan fee and services auto-filled from selected assessment.
							</p>
						)}
					</div>
				)}

				{/* Suggestion comparison banner */}
				{currentSuggestion && adjustedFromSuggestion && (
					<div className="rounded-lg p-3 text-xs" style={{ backgroundColor: "rgba(199,157,67,0.08)", border: "1px solid rgba(199,157,67,0.2)" }}>
						<p style={{ color: "#9b7424" }}>
							⚠ You&apos;ve adjusted from the engine suggestion. The original suggestion and your changes will both be saved for training.
						</p>
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
							style={{
								borderColor: "var(--border-strong)",
								color: "var(--foreground)",
								backgroundColor: "var(--surface-strong)",
							}}
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
							style={{
								borderColor: "var(--border-strong)",
								color: "var(--foreground)",
								backgroundColor: "var(--surface-strong)",
							}}
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
							defaultValue={defaultValidUntil}
							className="w-full rounded-lg border px-3 py-2 text-sm"
							style={{
								borderColor: "var(--border-strong)",
								color: "var(--foreground)",
								backgroundColor: "var(--surface-strong)",
							}}
						/>
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
						placeholder={"Personal care assistance\nMedication management\nFall prevention monitoring"}
						className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
						style={{
							borderColor: "var(--border-strong)",
							color: "var(--foreground)",
							backgroundColor: "var(--surface-strong)",
						}}
					/>
				</div>

				{/* Hidden fields to store the engine suggestion for training */}
				{currentSuggestion && (
					<>
						<input type="hidden" name="suggested_base_fee" value={currentSuggestion.base} />
						<input type="hidden" name="suggested_multiplier" value={currentSuggestion.mult} />
						<input type="hidden" name="suggested_plan_fee" value={currentSuggestion.fee} />
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
						style={{
							borderColor: "var(--border-strong)",
							color: "var(--muted-strong)",
						}}
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
			{pending ? "Creating…" : "Create Quote"}
		</button>
	);
}

// -- QuotesList ---------------------------------------------------------------

type QuotesListProps = {
	clientId: string;
	initialQuotes: QuoteRow[];
	assessments: RiskAssessmentRow[];
	defaultAssessmentId?: string;
};

export function QuotesList({
	clientId,
	initialQuotes,
	assessments,
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
