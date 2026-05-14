import { createServerSupabaseClient } from "@/services/supabase/server";
import type { QuoteRow } from "@/types/supabase";

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

export type CreateQuoteInput = {
	clientId: string;
	assessmentId?: string;
	baseMonthlyRate: number;
	riskMultiplier?: number;
	servicesIncluded?: string[];
	validUntil?: string;
	userId: string;
};

export async function createQuote(input: CreateQuoteInput): Promise<QuoteRow> {
	const supabase = createServerSupabaseClient();
	const multiplier = input.riskMultiplier ?? 1.0;
	const finalRate =
		Math.round(input.baseMonthlyRate * multiplier * 100) / 100;

	// Get current max version for this client
	const { data: existing } = await supabase
		.from("quotes")
		.select("version")
		.eq("client_id", input.clientId)
		.order("version", { ascending: false })
		.limit(1)
		.maybeSingle();

	const version = (existing?.version ?? 0) + 1;

	const { data, error } = await supabase
		.from("quotes")
		.insert({
			client_id: input.clientId,
			assessment_id: input.assessmentId ?? null,
			version,
			status: "draft",
			base_monthly_rate: input.baseMonthlyRate,
			risk_multiplier: multiplier,
			final_monthly_rate: finalRate,
			services_included: input.servicesIncluded ?? null,
			valid_until: input.validUntil ?? null,
			created_by: input.userId,
		})
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
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

export async function regenerateQuote(
	quoteId: string,
	userId: string
): Promise<QuoteRow> {
	const supabase = createServerSupabaseClient();

	// Fetch the source quote
	const { data: source, error: fetchError } = await supabase
		.from("quotes")
		.select("*")
		.eq("id", quoteId)
		.single();
	if (fetchError || !source) throw new Error("Quote not found.");

	// Get next version number for this client
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
			base_monthly_rate: source.base_monthly_rate,
			risk_multiplier: source.risk_multiplier,
			final_monthly_rate: source.final_monthly_rate,
			services_included: source.services_included,
			pricing_details: source.pricing_details,
			valid_until: source.valid_until,
			created_by: userId,
		})
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}
