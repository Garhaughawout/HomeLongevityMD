// ─────────────────────────────────────────────────────────────────────────────
// Risk Scoring Engine — version 2.1
//
// Converts a submitted ClientIntakeRow into domain scores (0–100 each) and
// an aggregate risk score + category.  Higher scores = greater risk.
//
// v2.1 (July 2026): HSSAT replaces HOME FAST and SLUMS replaces the MMSE,
// per the Anchor Index v2 methodology (open-license instruments only).
//
// Domain weights (sum = 1.0):
//   hssat 20 % | adl_iadl 20 % | tug_test 15 %
//   frail_scale 15 % | slums 20 % | ot_clinical_judgment 10 %
//
// Physician review (physician_review.physician_overall_risk) can only
// ELEVATE the computed category — it is never used to reduce it.
// ─────────────────────────────────────────────────────────────────────────────

import type { ClientIntakeRow } from "@/types/supabase";
import type {
	HssatData,
	AdlIadlData,
	TugTestData,
	FrailScaleData,
	SlumsData,
	OtClinicalJudgmentData,
	PhysicianReviewData,
} from "@/types/intake";

// ── Public constants ──────────────────────────────────────────────────────────

export const SCORING_VERSION = "2.1";

export type RiskCategory =
	| "low"
	| "moderate"
	| "high"
	| "very_high"
	| "unsafe_independent";

export interface ScoringResult {
	hssat_score: number;
	adl_iadl_score: number;
	tug_test_score: number;
	frail_scale_score: number;
	slums_score: number;
	ot_clinical_judgment_score: number;
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

function scoreHssat(d: HssatData | null | undefined): number {
	if (!d || !d.areas || d.areas.length === 0) return 50;

	// Grand total of checked hazards (+ per-area "other" entries) across the
	// instrument's 10 home areas (~74 items). Recomputed from raw data.
	const total = d.areas.reduce(
		(sum, a) =>
			sum + (a.hazards?.length ?? 0) + (a.other?.trim() ? 1 : 0),
		0
	);

	if (total === 0) return 0;
	if (total <= 3) return 20;
	if (total <= 7) return 40;
	if (total <= 12) return 60;
	if (total <= 18) return 80;
	return 100;
}

function scoreAdlIadl(d: AdlIadlData | null | undefined): number {
	if (!d || Object.keys(d).length === 0) return 50;

	// If pre-computed scores exist, use them
	if (d.katz_score !== undefined && d.lawton_score !== undefined) {
		// Invert: 6/6 Katz = 0 risk, 0/6 = 100 risk
		const katzRisk = ((6 - d.katz_score) / 6) * 100;
		const lawtonRisk = ((8 - d.lawton_score) / 8) * 100;
		return clamp(katzRisk * 0.6 + lawtonRisk * 0.4);
	}

	const levelMap: Record<string, number> = {
		independent: 0,
		needs_help: 50,
		dependent: 100,
	};

	const katzKeys = [
		"bathing",
		"dressing",
		"toileting",
		"transferring",
		"continence",
		"feeding",
	] as const;
	const iadlKeys = [
		"telephone_use",
		"shopping",
		"food_preparation",
		"housekeeping",
		"laundry",
		"transportation",
		"medication_management",
		"finances",
	] as const;

	const katzVals = katzKeys
		.map((k) => d[k])
		.filter((v): v is "independent" | "needs_help" | "dependent" => v !== undefined);
	const iadlVals = iadlKeys
		.map((k) => d[k])
		.filter((v): v is "independent" | "needs_help" | "dependent" => v !== undefined);

	if (katzVals.length === 0 && iadlVals.length === 0) return 50;

	const avg = (vals: ("independent" | "needs_help" | "dependent")[]) =>
		vals.reduce((s, v) => s + (levelMap[v] ?? 50), 0) / vals.length;

	if (katzVals.length > 0 && iadlVals.length > 0)
		return clamp(avg(katzVals) * 0.6 + avg(iadlVals) * 0.4);
	if (katzVals.length > 0) return clamp(avg(katzVals));
	return clamp(avg(iadlVals));
}

function scoreTugTest(d: TugTestData | null | undefined): number {
	if (!d || !d.performed || d.seconds === undefined) return 50;

	const sec = d.seconds;
	if (sec < 10) return 5;
	if (sec < 12) return 15;
	if (sec < 20) return 40;
	if (sec < 30) return 70;
	return 90;
}

function scoreFrailScale(d: FrailScaleData | null | undefined): number {
	if (!d || Object.keys(d).length === 0) return 50;

	// Use pre-computed total if available
	if (d.total_score !== undefined) {
		const map: Record<number, number> = {
			0: 0,
			1: 20,
			2: 40,
			3: 60,
			4: 80,
			5: 100,
		};
		return map[d.total_score] ?? 50;
	}

	// Compute from individual scores
	const total =
		(d.fatigue_score ?? 0) +
		(d.resistance_score ?? 0) +
		(d.ambulation_score ?? 0) +
		(d.illness_score ?? 0) +
		(d.weight_loss_score ?? 0);

	const map: Record<number, number> = {
		0: 0,
		1: 20,
		2: 40,
		3: 60,
		4: 80,
		5: 100,
	};
	return map[total] ?? 50;
}

function scoreSlums(d: SlumsData | null | undefined): number {
	if (!d || Object.keys(d).length === 0) return 50;

	const total = d.total_score;
	if (total === undefined) return 50;

	// Education-adjusted bands (SLUMS):
	//   HS+  : 27–30 normal, 21–26 mild NCD, ≤ 20 dementia
	//   < HS : 25–30 normal, 20–24 mild NCD, ≤ 19 dementia
	const highSchool = d.education !== "less_than_high_school";
	const normalFloor = highSchool ? 27 : 25;
	const mncdFloor = highSchool ? 21 : 20;

	if (total >= normalFloor) return total >= 29 ? 0 : 10;
	if (total >= mncdFloor) return 45;
	if (total >= 10) return 80;
	return 95;
}

function scoreOtJudgment(
	d: OtClinicalJudgmentData | null | undefined
): number {
	if (!d || Object.keys(d).length === 0) return 50;

	const obsCount = d.observations?.length ?? 0;
	let pts: number;

	if (obsCount === 0) pts = 15;
	else if (obsCount <= 3) pts = 30;
	else pts = 50;

	if (d.risk_adjustment === "elevate") pts += 20;
	else if (d.risk_adjustment === "significantly_elevate") pts += 40;

	return clamp(pts);
}

// ── Category derivation ───────────────────────────────────────────────────────

function deriveCategory(
	aggregate: number,
	physicianOverride: string | null | undefined
): RiskCategory {
	// Force override if physician explicitly marked unsafe
	if (physicianOverride === "unsafe_independent")
		return "unsafe_independent";

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
	const hssat = scoreHssat(intake.hssat as HssatData | null);
	const adl = scoreAdlIadl(intake.adl_iadl as AdlIadlData | null);
	const tug = scoreTugTest(intake.tug_test as TugTestData | null);
	const frail = scoreFrailScale(intake.frail_scale as FrailScaleData | null);
	const slums = scoreSlums(intake.slums as SlumsData | null);
	const ot = scoreOtJudgment(
		intake.ot_clinical_judgment as OtClinicalJudgmentData | null
	);

	const physician = intake.physician_review as PhysicianReviewData | null;
	const physicianOverride = physician?.physician_overall_risk ?? null;

	const aggregate = clamp(
		hssat * 0.2 + adl * 0.2 + tug * 0.15 + frail * 0.15 + slums * 0.2 + ot * 0.1
	);

	const risk_category = deriveCategory(aggregate, physicianOverride);

	return {
		hssat_score: hssat,
		adl_iadl_score: adl,
		tug_test_score: tug,
		frail_scale_score: frail,
		slums_score: slums,
		ot_clinical_judgment_score: ot,
		aggregate_score: aggregate,
		risk_category,
		score_details: {
			scoring_version: SCORING_VERSION,
			physician_override: physicianOverride,
			domain_weights: {
				hssat: 0.2,
				adl_iadl: 0.2,
				tug_test: 0.15,
				frail_scale: 0.15,
				slums: 0.2,
				ot_clinical_judgment: 0.1,
			},
		},
	};
}
