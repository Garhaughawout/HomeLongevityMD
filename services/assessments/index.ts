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

export async function deleteAssessment(assessmentId: string): Promise<void> {
	const supabase = createServerSupabaseClient();

	// Refuse to delete an assessment that a quote was priced against — that
	// linkage is the pricing model's training evidence.
	const { data: linkedQuote, error: quoteError } = await supabase
		.from("quotes")
		.select("id, version")
		.eq("assessment_id", assessmentId)
		.limit(1)
		.maybeSingle();

	if (quoteError) throw new Error(quoteError.message);
	if (linkedQuote) {
		throw new Error(
			`This assessment is linked to quote v${linkedQuote.version}. Delete that quote first, or keep the assessment for traceability.`
		);
	}

	const { error } = await supabase
		.from("risk_assessments")
		.delete()
		.eq("id", assessmentId);

	if (error) throw new Error(error.message);
}

export async function persistAssessment(
	clientId: string,
	intakeId: string,
	scoring: ScoringResult,
	userId: string
): Promise<RiskAssessmentRow> {
	const supabase = createServerSupabaseClient();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const insert: Record<string, any> = {
		client_id: clientId,
		intake_id: intakeId,
		scoring_version: SCORING_VERSION,
		// v2.1 domain scores (HSSAT / SLUMS per Anchor Index v2)
		hssat_score: scoring.hssat_score,
		adl_iadl_score: scoring.adl_iadl_score,
		tug_test_score: scoring.tug_test_score,
		frail_scale_score: scoring.frail_scale_score,
		slums_score: scoring.slums_score,
		ot_clinical_judgment_score: scoring.ot_clinical_judgment_score,
		// Aggregate
		aggregate_score: scoring.aggregate_score,
		risk_category: scoring.risk_category,
		score_details: scoring.score_details as Record<string, unknown>,
		created_by: userId,
	};

	// Also write legacy NOT NULL column names for backward compat
	insert.home_safety_score = scoring.hssat_score;
	insert.adls_iadls_score = scoring.adl_iadl_score;
	insert.mobility_score = scoring.tug_test_score;
	insert.cognition_score = scoring.slums_score;
	insert.fall_risk_score = scoring.frail_scale_score;
	insert.caregiver_support_score = scoring.ot_clinical_judgment_score;

	const { data, error } = await supabase
		.from("risk_assessments")
		.insert(insert)
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}
