import { createServerSupabaseClient } from "@/services/supabase/server";
import type { RiskAssessmentRow } from "@/types/supabase";
import { SCORING_VERSION, type ScoringResult } from "@/services/scoring";

export async function getAssessmentsByClientId(
	clientId: string
): Promise<RiskAssessmentRow[]> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("risk_assessments")
		.select("*")
		.eq("client_id", clientId)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return data ?? [];
}

export async function getLatestAssessmentByClientId(
	clientId: string
): Promise<RiskAssessmentRow | null> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("risk_assessments")
		.select("*")
		.eq("client_id", clientId)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error) throw new Error(error.message);
	return data;
}

export async function persistAssessment(
	clientId: string,
	intakeId: string,
	scoring: ScoringResult,
	userId: string
): Promise<RiskAssessmentRow> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("risk_assessments")
		.insert({
			client_id: clientId,
			intake_id: intakeId,
			scoring_version: SCORING_VERSION,
			home_safety_score: scoring.home_safety_score,
			mobility_score: scoring.mobility_score,
			adls_iadls_score: scoring.adls_iadls_score,
			cognition_score: scoring.cognition_score,
			fall_risk_score: scoring.fall_risk_score,
			caregiver_support_score: scoring.caregiver_support_score,
			aggregate_score: scoring.aggregate_score,
			risk_category: scoring.risk_category,
			score_details: scoring.score_details as Record<string, unknown>,
			created_by: userId,
		})
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}
