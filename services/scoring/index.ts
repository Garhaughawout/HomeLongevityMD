// ─────────────────────────────────────────────────────────────────────────────
// Risk Scoring Engine — version 1.0
//
// Converts a submitted ClientIntakeRow into domain scores (0–100 each) and
// an aggregate risk score + category.  Higher scores = greater risk.
//
// Domain weights (sum = 1.0):
//   home_safety 15 % | mobility 20 % | adls_iadls 20 %
//   cognition   20 % | fall_risk 15 % | caregiver_support 10 %
//
// Physician review (physician_review.physician_overall_risk) can only
// ELEVATE the computed category — it is never used to reduce it.
// ─────────────────────────────────────────────────────────────────────────────

import type { ClientIntakeRow } from "@/types/supabase";
import type {
	HomeSafetyData,
	MobilityData,
	AdlsIadlsData,
	CognitionData,
	FallRiskData,
	CaregiverSupportData,
	PhysicianReviewData,
} from "@/types/intake";

// ── Public constants ──────────────────────────────────────────────────────────

export const SCORING_VERSION = "1.0";

export type RiskCategory =
	| "low"
	| "moderate"
	| "high"
	| "very_high"
	| "unsafe_independent";

export interface ScoringResult {
	home_safety_score: number;
	mobility_score: number;
	adls_iadls_score: number;
	cognition_score: number;
	fall_risk_score: number;
	caregiver_support_score: number;
	aggregate_score: number;
	risk_category: RiskCategory;
	score_details: Record<string, unknown>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
	return Math.round(Math.min(max, Math.max(min, value)));
}

const CATEGORY_ORDER: RiskCategory[] = [
	"low",
	"moderate",
	"high",
	"very_high",
	"unsafe_independent",
];

// ── Domain scorers ────────────────────────────────────────────────────────────

function scoreHomeSafety(d: HomeSafetyData | null | undefined): number {
	if (!d || Object.keys(d).length === 0) return 50;
	let pts = 0;

	// Exterior
	if (d.exterior_steps_present && d.exterior_handrails !== "yes") pts += 8;
	if (d.entry_threshold_hazard) pts += 5;

	// Flooring
	if (d.loose_rugs_or_mats) pts += 8;
	if (d.clutter_in_walkways) pts += 8;
	if (d.carpet_fraying) pts += 5;
	if (d.uneven_flooring) pts += 8;

	// Lighting
	if (d.adequate_lighting === "no") pts += 8;
	if (d.stair_lighting_adequate === "no") pts += 5;

	// Stairs
	if (d.home_has_stairs && d.interior_stair_handrails !== "yes") pts += 10;

	// Bathroom
	if (d.grab_bars_in_bathroom === false) pts += 8;
	if (d.non_slip_surfaces_in_bath === false) pts += 5;

	// Bedroom
	if (d.bedroom_pathway_clear === false) pts += 5;

	// Kitchen
	if (d.stove_safety_concerns) pts += 10;

	// Emergency
	if (d.working_smoke_detectors === "no") pts += 12;
	if (d.accessible_exits === "no") pts += 10;

	return clamp(pts);
}

function scoreMobility(d: MobilityData | null | undefined): number {
	if (!d || Object.keys(d).length === 0) return 50;
	let pts = 0;

	if (d.transfer_independence === "no") pts += 25;
	if (d.transfer_assist_level) {
		const map: Record<number, number> = { 1: 0, 2: 5, 3: 15, 4: 25, 5: 35 };
		pts += map[d.transfer_assist_level] ?? 0;
	}

	if (d.uses_mobility_aid) {
		const aidMap: Record<string, number> = {
			wheelchair: 30,
			scooter: 30,
			rollator: 15,
			walker: 15,
			cane: 8,
			none: 0,
			other: 10,
		};
		pts += aidMap[d.mobility_aid_type ?? "other"] ?? 10;
	}

	if (d.gait_concerns_observed) pts += 15;
	if (d.able_to_climb_stairs === "no") pts += 10;

	if (d.tug_test_performed && d.tug_test_seconds !== undefined) {
		if (d.tug_test_seconds > 30) pts += 30;
		else if (d.tug_test_seconds > 20) pts += 20;
		else if (d.tug_test_seconds > 12) pts += 10;
	}

	return clamp(pts);
}

function assistToRisk(level: number): number {
	const map: Record<number, number> = { 1: 0, 2: 25, 3: 50, 4: 75, 5: 100 };
	return map[level] ?? 0;
}

function scoreAdlsIadls(d: AdlsIadlsData | null | undefined): number {
	if (!d || Object.keys(d).length === 0) return 50;

	const basicKeys = [
		"bathing",
		"dressing",
		"grooming",
		"toileting",
		"transferring",
		"continence",
		"feeding",
	] as const;
	const iadlKeys = [
		"meal_preparation",
		"medication_management",
		"housekeeping",
		"laundry",
		"transportation",
		"shopping",
		"finances",
		"telephone_use",
	] as const;

	const basicVals = basicKeys
		.map((k) => d[k])
		.filter((v): v is NonNullable<typeof v> => v !== undefined);
	const iadlVals = iadlKeys
		.map((k) => d[k])
		.filter((v): v is NonNullable<typeof v> => v !== undefined);

	if (basicVals.length === 0 && iadlVals.length === 0) return 50;

	const avg = (vals: number[]) =>
		vals.reduce((s, v) => s + assistToRisk(v), 0) / vals.length;

	if (basicVals.length > 0 && iadlVals.length > 0)
		return clamp(avg(basicVals) * 0.6 + avg(iadlVals) * 0.4);
	if (basicVals.length > 0) return clamp(avg(basicVals));
	return clamp(avg(iadlVals));
}

function scoreCognition(d: CognitionData | null | undefined): number {
	if (!d || Object.keys(d).length === 0) return 50;
	let pts = 0;

	if (d.oriented_to_person === false) pts += 25;
	if (d.oriented_to_place === false) pts += 20;
	if (d.oriented_to_time === false) pts += 15;

	if (d.short_term_memory_concern === "yes") pts += 15;
	if (d.forgets_medications) pts += 10;
	if (d.gets_lost_in_familiar_places) pts += 20;

	if (d.dementia_diagnosis) pts += 35;
	if (d.executive_function_concerns === "yes") pts += 10;

	if (d.can_call_for_help_independently === false) pts += 20;
	if (d.medication_errors_reported) pts += 10;

	return clamp(pts);
}

function scoreFallRisk(d: FallRiskData | null | undefined): number {
	if (!d || Object.keys(d).length === 0) return 50;
	let pts = 0;

	const falls = d.falls_in_past_12_months ?? 0;
	if (falls === 1) pts += 20;
	else if (falls === 2) pts += 35;
	else if (falls >= 3) pts += 50;

	if (d.fall_resulted_in_injury) pts += 15;
	if ((d.near_miss_falls_in_past_6_months ?? 0) >= 1) pts += 10;
	if (d.afraid_of_falling && d.avoids_activities_due_to_fall_fear) pts += 10;

	if (d.orthostatic_hypotension === "yes") pts += 10;
	if (d.multiple_medications) pts += 10;
	if (d.sedating_medications_present) pts += 10;

	if (d.peripheral_neuropathy === "yes") pts += 8;
	if (d.lower_extremity_weakness === "yes") pts += 10;

	if (d.balance_impairment_observed === "yes") pts += 15;
	if (d.gait_abnormality_observed === "yes") pts += 10;

	if (d.tug_test_seconds !== undefined) {
		if (d.tug_test_seconds > 30) pts += 20;
		else if (d.tug_test_seconds > 20) pts += 15;
		else if (d.tug_test_seconds > 12) pts += 8;
	}
	if (d.berg_balance_score !== undefined && d.berg_balance_score < 45)
		pts += 15;

	return clamp(pts);
}

function scoreCaregiverSupport(
	d: CaregiverSupportData | null | undefined
): number {
	if (!d || Object.keys(d).length === 0) return 50;
	let pts = 0;

	if (d.has_informal_caregiver === false) pts += 30;
	if (!d.caregiver_lives_with_client && !d.daily_check_in_available)
		pts += 15;
	if (d.has_home_health_aide === false) pts += 10;
	if (d.caregiver_reports_burnout === "yes") pts += 20;
	if (d.caregiver_health_limitations) pts += 10;
	if (d.transportation_support_available === "no") pts += 10;
	if (
		d.caregiver_hours_per_week !== undefined &&
		d.caregiver_hours_per_week < 7
	)
		pts += 10;

	return clamp(pts);
}

// ── Category derivation ───────────────────────────────────────────────────────

function deriveCategory(
	aggregate: number,
	physicianOverride: string | null | undefined
): RiskCategory {
	// Force override if physician explicitly marked unsafe
	if (physicianOverride === "unsafe_independent") return "unsafe_independent";

	let category: RiskCategory;
	if (aggregate < 25) category = "low";
	else if (aggregate < 45) category = "moderate";
	else if (aggregate < 65) category = "high";
	else if (aggregate < 85) category = "very_high";
	else category = "unsafe_independent";

	// Physician override can only elevate, never reduce
	if (physicianOverride) {
		const computed = CATEGORY_ORDER.indexOf(category);
		const override = CATEGORY_ORDER.indexOf(
			physicianOverride as RiskCategory
		);
		if (override > computed) category = physicianOverride as RiskCategory;
	}

	return category;
}

// ── Public entry point ────────────────────────────────────────────────────────

export function scoreIntake(intake: ClientIntakeRow): ScoringResult {
	const hs = scoreHomeSafety(intake.home_safety as HomeSafetyData | null);
	const mob = scoreMobility(intake.mobility as MobilityData | null);
	const adl = scoreAdlsIadls(intake.adls_iadls as AdlsIadlsData | null);
	const cog = scoreCognition(intake.cognition as CognitionData | null);
	const fr = scoreFallRisk(intake.fall_risk as FallRiskData | null);
	const cs = scoreCaregiverSupport(
		intake.caregiver_support as CaregiverSupportData | null
	);

	const physician = intake.physician_review as PhysicianReviewData | null;
	const physicianOverride = physician?.physician_overall_risk ?? null;

	const aggregate = clamp(
		hs * 0.15 + mob * 0.2 + adl * 0.2 + cog * 0.2 + fr * 0.15 + cs * 0.1
	);

	const risk_category = deriveCategory(aggregate, physicianOverride);

	return {
		home_safety_score: hs,
		mobility_score: mob,
		adls_iadls_score: adl,
		cognition_score: cog,
		fall_risk_score: fr,
		caregiver_support_score: cs,
		aggregate_score: aggregate,
		risk_category,
		score_details: {
			scoring_version: SCORING_VERSION,
			physician_override: physicianOverride,
			domain_weights: {
				home_safety: 0.15,
				mobility: 0.2,
				adls_iadls: 0.2,
				cognition: 0.2,
				fall_risk: 0.15,
				caregiver_support: 0.1,
			},
		},
	};
}
