import { createServerSupabaseClient } from "@/services/supabase/server";
import type { QuoteRow } from "@/types/supabase";
import type { QuoteSuggestion } from "@/services/pricing";

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getQuotesByClientId(
	clientId: string
): Promise<QuoteRow[]> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("quotes")
		.select("*")
		.eq("client_id", clientId)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return data ?? [];
}

// ── Create (with suggestion tracking) ─────────────────────────────────────────

export type CreateQuoteInput = {
	clientId: string;
	assessmentId?: string;
	basePlanFee: number;
	riskMultiplier?: number;
	servicesIncluded?: string[];
	validUntil?: string;
	userId: string;
	/** Engine suggestion — stored alongside for ML training */
	suggestion?: QuoteSuggestion;
};

export async function createQuote(input: CreateQuoteInput): Promise<QuoteRow> {
	const supabase = createServerSupabaseClient();
	const multiplier = input.riskMultiplier ?? 1.0;
	const finalFee = Math.round(input.basePlanFee * multiplier * 100) / 100;

	// Get current max version for this client
	const { data: existing } = await supabase
		.from("quotes")
		.select("version")
		.eq("client_id", input.clientId)
		.order("version", { ascending: false })
		.limit(1)
		.maybeSingle();

	const version = (existing?.version ?? 0) + 1;

	// Check if human adjusted from the suggestion
	const suggestion = input.suggestion;
	const wasAdjusted =
		suggestion &&
		(suggestion.base_plan_fee !== input.basePlanFee ||
			suggestion.risk_multiplier !== multiplier ||
			JSON.stringify(suggestion.suggested_services) !==
				JSON.stringify(input.servicesIncluded ?? []));

	const { data, error } = await supabase
		.from("quotes")
		.insert({
			client_id: input.clientId,
			assessment_id: input.assessmentId ?? null,
			version,
			status: "draft",
			base_plan_fee: input.basePlanFee,
			risk_multiplier: multiplier,
			plan_fee: finalFee,
			services_included: input.servicesIncluded ?? null,
			valid_until: input.validUntil ?? null,
			created_by: input.userId,
			// Store the engine suggestion for ML training
			suggested_base_fee: suggestion?.base_plan_fee ?? null,
			suggested_multiplier: suggestion?.risk_multiplier ?? null,
			suggested_plan_fee: suggestion?.plan_fee ?? null,
			suggested_services: suggestion?.suggested_services ?? null,
			human_adjusted_at: wasAdjusted ? new Date().toISOString() : null,
		})
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}

// ── Update (with adjustment audit) ─────────────────────────────────────────────

export type UpdateQuoteInput = {
	basePlanFee: number;
	riskMultiplier?: number;
	servicesIncluded?: string[];
	validUntil?: string;
	/** Reason code for the adjustment audit trail */
	adjustmentReason?: string;
	adjustmentNote?: string;
	userId: string;
};

export async function updateQuote(
	quoteId: string,
	input: UpdateQuoteInput
): Promise<void> {
	const supabase = createServerSupabaseClient();
	const multiplier = input.riskMultiplier ?? 1.0;
	const planFee = Math.round(input.basePlanFee * multiplier * 100) / 100;

	// Fetch current values for audit trail
	if (input.adjustmentReason) {
		const { data: current } = await supabase
			.from("quotes")
			.select("base_plan_fee, risk_multiplier, plan_fee, services_included, valid_until")
			.eq("id", quoteId)
			.single();

		if (current) {
			const changes: Array<{
				field: string;
				old: unknown;
				new: unknown;
			}> = [];

			if (current.base_plan_fee !== input.basePlanFee)
				changes.push({ field: "base_plan_fee", old: current.base_plan_fee, new: input.basePlanFee });
			if (current.risk_multiplier !== multiplier)
				changes.push({ field: "risk_multiplier", old: current.risk_multiplier, new: multiplier });
			if (current.plan_fee !== planFee)
				changes.push({ field: "plan_fee", old: current.plan_fee, new: planFee });
			if (JSON.stringify(current.services_included) !== JSON.stringify(input.servicesIncluded ?? null))
				changes.push({ field: "services_included", old: current.services_included, new: input.servicesIncluded ?? null });
			if (current.valid_until !== (input.validUntil ?? null))
				changes.push({ field: "valid_until", old: current.valid_until, new: input.validUntil ?? null });

			for (const change of changes) {
				await supabase.from("quote_adjustments").insert({
					quote_id: quoteId,
					field_changed: change.field,
					old_value: change.old as never,
					new_value: change.new as never,
					reason_code: input.adjustmentReason,
					reason_note: input.adjustmentNote ?? null,
					adjusted_by: input.userId,
				});
			}
		}
	}

	const { error } = await supabase
		.from("quotes")
		.update({
			base_plan_fee: input.basePlanFee,
			risk_multiplier: multiplier,
			plan_fee: planFee,
			services_included: input.servicesIncluded ?? null,
			valid_until: input.validUntil ?? null,
			human_adjusted_at: new Date().toISOString(),
		})
		.eq("id", quoteId);

	if (error) throw new Error(error.message);
}

export async function deleteQuote(quoteId: string): Promise<void> {
	const supabase = createServerSupabaseClient();
	const { error } = await supabase
		.from("quotes")
		.delete()
		.eq("id", quoteId);

	if (error) throw new Error(error.message);
}

export async function updateQuoteStatus(
	quoteId: string,
	status: "draft" | "sent" | "accepted" | "declined" | "expired"
): Promise<void> {
	const supabase = createServerSupabaseClient();
	const extra: Record<string, unknown> = {};
	if (status === "sent") extra.sent_at = new Date().toISOString();
	if (status === "accepted") extra.accepted_at = new Date().toISOString();

	const { error } = await supabase
		.from("quotes")
		.update({ status, ...extra })
		.eq("id", quoteId);

	if (error) throw new Error(error.message);
}

// ── Quote Outcomes ────────────────────────────────────────────────────────────

export type RecordOutcomeInput = {
	quoteId: string;
	clientId: string;
	outcome: "accepted" | "declined" | "expired" | "withdrawn";
	declineReason?: string;
	competitorName?: string;
	competitorPrice?: number;
	clientFeedback?: string;
	adjustedFinalPrice?: number;
	userId: string;
};

export async function recordQuoteOutcome(input: RecordOutcomeInput): Promise<void> {
	const supabase = createServerSupabaseClient();

	// Upsert outcome (one per quote)
	const { error } = await supabase
		.from("quote_outcomes")
		.upsert(
			{
				quote_id: input.quoteId,
				client_id: input.clientId,
				outcome: input.outcome,
				outcome_at: new Date().toISOString(),
				decline_reason: input.declineReason ?? null,
				competitor_name: input.competitorName ?? null,
				competitor_price: input.competitorPrice ?? null,
				client_feedback: input.clientFeedback ?? null,
				adjusted_final_price: input.adjustedFinalPrice ?? null,
				recorded_by: input.userId,
			},
			{ onConflict: "quote_id" }
		);

	if (error) throw new Error(error.message);

	// Also update the quote status to match
	await updateQuoteStatus(input.quoteId, input.outcome === "withdrawn" ? "expired" : input.outcome);
}

export async function getQuoteOutcome(quoteId: string) {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("quote_outcomes")
		.select("*")
		.eq("quote_id", quoteId)
		.maybeSingle();

	if (error) throw new Error(error.message);
	return data;
}

// ── Regenerate ────────────────────────────────────────────────────────────────

export async function regenerateQuote(
	quoteId: string,
	userId: string
): Promise<QuoteRow> {
	const supabase = createServerSupabaseClient();

	const { data: source, error: fetchError } = await supabase
		.from("quotes")
		.select("*")
		.eq("id", quoteId)
		.single();
	if (fetchError || !source) throw new Error("Quote not found.");

	const { data: latest } = await supabase
		.from("quotes")
		.select("version")
		.eq("client_id", source.client_id)
		.order("version", { ascending: false })
		.limit(1)
		.maybeSingle();

	const nextVersion = (latest?.version ?? 0) + 1;

	const { data, error } = await supabase
		.from("quotes")
		.insert({
			client_id: source.client_id,
			assessment_id: source.assessment_id,
			version: nextVersion,
			status: "draft",
			base_plan_fee: source.base_plan_fee,
			risk_multiplier: source.risk_multiplier,
			plan_fee: source.plan_fee,
			services_included: source.services_included,
			pricing_details: source.pricing_details,
			valid_until: source.valid_until,
			created_by: userId,
			suggested_base_fee: source.suggested_base_fee,
			suggested_multiplier: source.suggested_multiplier,
			suggested_plan_fee: source.suggested_plan_fee,
			suggested_services: source.suggested_services,
		})
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}

// ── Training Data Export ───────────────────────────────────────────────────────

export async function exportTrainingDataset(limit = 500): Promise<Record<string, unknown>[]> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("training_dataset" as never)
		.select("*" as never)
		.limit(limit);

	if (error) throw new Error(error.message);
	return (data as Record<string, unknown>[]) ?? [];
}
