import type { HomeModificationsData } from "@/types/modifications";

// ─────────────────────────────────────────────────────────────────────────────
// Intake section data shapes
// These interfaces type the JSONB columns on the client_intake table.
// Based on the FMII Model — a 3-tier adaptive assessment workflow:
//   Tier 0  — Clinical Context (demographics, medical snapshot, occupational profile)
//   Tier 1  — Universal Baseline Screening (STEADI, ADL/IADL, TUG, FRAIL, SLUMS)
//   Tier 1.5 — OT Clinical Judgment (risk adjustment)
//   Tier 2  — Triggered Adaptive Assessments (Berg Balance, Cognitive/Safety,
//             Frailty/Medical, Environmental Hazard pathways)
//   Tier 3  — Physician Review (clinical synthesis)
//
// The schema lives here (application layer) so it can evolve without a
// Supabase migration for every sub-field addition.  All leaf fields are
// optional/nullable — intake is captured as a draft progressively, so any
// section may be partially filled at any point.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared primitives ─────────────────────────────────────────────────────────

/** Yes / No / N/A — matches paper-form YES/NO/N/A checkboxes */
export type YesNoNa = "yes" | "no" | "na";

/** Yes / No / Unknown — used for clinical observations where "Unknown" is valid */
export type YesNoUnknown = "yes" | "no" | "unknown";

/** 1 = fully independent, 5 = fully/total assist — used for ADL/IADL scoring */
export type AssistanceLevel = 1 | 2 | 3 | 4 | 5;

// ── Tier 0: Clinical Context ─────────────────────────────────────────────────

/**
 * Tier 0 — Clinical Context.
 *
 * Captured before or during the home visit.  Provides the demographic,
 * medical, and occupational background that frames all subsequent tiers.
 */
export interface ClinicalContextData {
	// ── Demographics ──
	age?: number;
	living_situation?:
		| "alone"
		| "with_spouse"
		| "with_family"
		| "with_caregiver"
		| "assisted_living"
		| "other";
	living_situation_other?: string;
	home_type?:
		| "single_family"
		| "apartment"
		| "condo"
		| "townhouse"
		| "mobile_home"
		| "other";
	home_type_other?: string;
	home_has_stairs?: boolean;
	has_caregiver?: boolean;

	// ── Medical Snapshot ──
	/** Number of hospitalisations in the past 12 months */
	recent_hospitalizations_12mo?: number;
	/** Number of ER visits in the past 12 months */
	er_visits_12mo?: number;
	/** Number of falls in the past 12 months */
	falls_past_12mo?: number;
	fall_resulted_in_injury?: boolean;
	assistive_devices?: string[];
	vision_impairment?: YesNoUnknown;
	hearing_impairment?: YesNoUnknown;
	medication_count?: number;
	pain_present?: boolean;
	/** Numeric Rating Scale 0–10 */
	pain_severity_nrs?: number;
	continence_status?:
		| "continent"
		| "occasionally_incontinent"
		| "frequently_incontinent"
		| "incontinent";

	// ── Occupational Profile ──
	prior_level_of_function?: string;
	daily_routines?: string;
	meaningful_activities?: string;
	drives_independently?: boolean;
	community_participation?: string;

	// ── Payer & Urgency Context (for pricing ML) ──
	payer_type?:
		| "self_pay"
		| "family_pay"
		| "unknown";
	urgency_level?:
		| "planning_ahead"
		| "post_discharge"
		| "near_crisis"
		| "crisis"
		| "unknown";

	notes?: string;
}

// ── Tier 1: Universal Baseline Screening ─────────────────────────────────────

// ── 1. STEADI Home Safety Checklist ──────────────────────────────────────────

/**
 * Single STEADI checklist item — one YES/NO/N/A question within a room.
 */
export interface SteadiItem {
	id: string;
	section: string;
	question: string;
	response?: YesNoNa;
}

/**
 * CDC STEADI "Check for Safety" home fall-hazard checklist (public domain).
 *
 * Replaced HOME FAST (commercially licensed) per the Anchor Index v2
 * methodology, July 2026. Structured as an array of items grouped by room.
 * Each "yes" answer flags a hazard; the total hazard count drives escalation
 * to the Tier 2 Environmental Hazard pathway.
 */
export interface SteadiData {
	items?: SteadiItem[];
	/** Count of "yes" (hazard) answers across all items */
	hazard_count?: number;
	notes?: string;
}

// ── 2. ADL / IADL Assessment (Katz ADL + Lawton IADL) ────────────────────────

/**
 * ADL/IADL Assessment.
 *
 * Katz ADL Index: 6 items, 0–6 scale (6 = fully independent).
 * Lawton IADL Scale: 8 items, 0–8 scale (8 = fully independent).
 *
 * Each item is scored as independent / needs_help / dependent.
 */
export interface AdlIadlData {
	// ── Katz ADL Index (6 items) ──
	bathing?: "independent" | "needs_help" | "dependent";
	dressing?: "independent" | "needs_help" | "dependent";
	toileting?: "independent" | "needs_help" | "dependent";
	transferring?: "independent" | "needs_help" | "dependent";
	continence?: "independent" | "needs_help" | "dependent";
	feeding?: "independent" | "needs_help" | "dependent";

	// ── Lawton IADL Scale (8 items) ──
	telephone_use?: "independent" | "needs_help" | "dependent";
	shopping?: "independent" | "needs_help" | "dependent";
	food_preparation?: "independent" | "needs_help" | "dependent";
	housekeeping?: "independent" | "needs_help" | "dependent";
	laundry?: "independent" | "needs_help" | "dependent";
	transportation?: "independent" | "needs_help" | "dependent";
	medication_management?: "independent" | "needs_help" | "dependent";
	finances?: "independent" | "needs_help" | "dependent";

	/** Katz ADL total (0–6, 6 = fully independent) */
	katz_score?: number;
	/** Lawton IADL total (0–8, 8 = fully independent) */
	lawton_score?: number;

	notes?: string;
}

// ── 3. TUG Test (Timed Up and Go) ─────────────────────────────────────────────

/**
 * Timed Up and Go test.
 *
 * A TUG time ≥ 12 seconds triggers the Berg Balance Scale (Tier 2).
 */
export interface TugTestData {
	performed?: boolean;
	/** Time in seconds */
	seconds?: number;
	interpretation?: "normal" | "elevated_fall_risk" | "significant_impairment";
	/** True when TUG ≥ 12 s — triggers Berg Balance Scale */
	berg_balance_triggered?: boolean;
	notes?: string;
}

// ── 4. FRAIL Scale ────────────────────────────────────────────────────────────

/**
 * FRAIL Scale — 5-item frailty screening tool.
 *
 * F — Fatigue, R — Resistance, A — Ambulation, I — Illnesses, L — Loss of weight.
 * Total 0–5: 0 = robust, 1–2 = pre-frail, 3+ = frail.
 */
export interface FrailScaleData {
	// ── F — Fatigue ──
	fatigue_response?:
		| "all_the_time"
		| "most_of_the_time"
		| "some_of_the_time"
		| "a_little_of_the_time"
		| "none_of_the_time";
	/** all/most = 1, else 0 */
	fatigue_score?: 0 | 1;

	// ── R — Resistance (walking 10 steps without resting) ──
	resistance_response?: "no_difficulty" | "some_difficulty" | "much_difficulty" | "unable";
	/** some/much/unable = 1 */
	resistance_score?: 0 | 1;

	// ── A — Ambulation (walking several hundred yards without resting) ──
	ambulation_response?: "no_difficulty" | "some_difficulty" | "much_difficulty" | "unable";
	/** some/much/unable = 1 */
	ambulation_score?: 0 | 1;

	// ── I — Illnesses (11 conditions, ≥5 = 1 point) ──
	illnesses?: {
		hypertension?: boolean;
		diabetes?: boolean;
		cancer?: boolean;
		chronic_lung_disease?: boolean;
		heart_attack?: boolean;
		congestive_heart_failure?: boolean;
		angina?: boolean;
		asthma?: boolean;
		arthritis?: boolean;
		stroke?: boolean;
		kidney_disease?: boolean;
	};
	/** Number of checked illnesses */
	illness_count?: number;
	/** ≥ 5 illnesses = 1 */
	illness_score?: 0 | 1;

	// ── L — Loss of weight ──
	/** Lost 10+ lbs without trying in past year */
	weight_loss_response?: boolean;
	/** yes = 1 */
	weight_loss_score?: 0 | 1;

	// ── Total ──
	/** 0–5 (0 = robust, 1–2 = pre-frail, 3+ = frail) */
	total_score?: number;
	frailty_category?: "robust" | "pre_frail" | "frail";

	notes?: string;
}

// ── 5. SLUMS (Saint Louis University Mental Status) ─────────────────────

/**
 * SLUMS — Saint Louis University Mental Status examination.
 *
 * Replaced the MMSE (exclusively licensed to PAR with per-use royalties)
 * per the Anchor Index v2 methodology, July 2026. 30-point cognitive screen,
 * freely published by Saint Louis University.
 *
 * Interpretation is education-adjusted:
 *   High-school education:  27–30 normal, 21–26 mild NCD, ≤ 20 dementia
 *   Less than high school:  25–30 normal, 20–24 mild NCD, ≤ 19 dementia
 */
export interface SlumsData {
	/** Education level — determines interpretation bands */
	education?: "high_school_or_more" | "less_than_high_school";

	// ── Orientation (3 points) ──
	day_of_week?: number; // 1 pt
	year?: number; // 1 pt
	state?: number; // 1 pt

	// ── Calculation (3 points) — $100 minus $3 apples and $20 tricycle ──
	math_spent?: number; // 1 pt — "How much did you spend?"
	math_left?: number; // 2 pts (0 or 2) — "How much do you have left?"

	// ── Animal naming (3 points) — animals named in one minute ──
	/** 0 = none, 1 = 1–4 animals, 2 = 5–9, 3 = 10+ */
	animal_score?: number;

	// ── Five-object recall (5 points) — apple, pen, tie, house, car ──
	recall_apple?: number; // 1 pt
	recall_pen?: number; // 1 pt
	recall_tie?: number; // 1 pt
	recall_house?: number; // 1 pt
	recall_car?: number; // 1 pt

	// ── Digit span backward (2 points) ──
	digits_649?: number; // 1 pt
	digits_8537?: number; // 1 pt

	// ── Clock drawing (4 points) — "ten minutes to eleven o'clock" ──
	clock_hour_markers?: number; // 2 pts (0 or 2)
	clock_time_correct?: number; // 2 pts (0 or 2)

	// ── Figure recognition (2 points) ──
	x_in_triangle?: number; // 1 pt
	largest_figure?: number; // 1 pt

	// ── Story recall (8 points) — Jill the stockbroker story ──
	story_name?: number; // 2 pts (0 or 2)
	story_occupation?: number; // 2 pts (0 or 2)
	story_work_return?: number; // 2 pts (0 or 2)
	story_state?: number; // 2 pts (0 or 2)

	// ── Total ──
	/** Max 30 */
	total_score?: number;
	interpretation?: "normal" | "mild_neurocognitive_disorder" | "dementia";

	notes?: string;
}

// ── Tier 1.5: OT Clinical Judgment ────────────────────────────────────────────

/**
 * OT Clinical Judgment — risk adjustment layer.
 *
 * The reviewing OT records qualitative observations and adjusts the
 * escalation risk based on clinical reasoning that may not be captured
 * by standardised scores alone.
 */
export interface OtClinicalJudgmentData {
	/**
	 * Observations from the home visit, e.g.:
	 * "poor_insight", "unsafe_transfers", "fatigue_during_mobility",
	 * "poor_sequencing", "hoarding_clutter", "impulsivity",
	 * "medication_noncompliance", "behavioral_concerns", "wandering_risk",
	 * "poor_judgment", "limited_emergency_response"
	 */
	observations?: string[];
	/** Risk adjustment applied to Tier 2 escalation decisions */
	risk_adjustment?: "none" | "elevate" | "significantly_elevate";
	notes?: string;
}

// ── Tier 2: Triggered Adaptive Assessments ────────────────────────────────────

// ── Berg Balance Scale (triggered by TUG ≥ 12 s) ─────────────────────────────

/**
 * Berg Balance Scale — 14-item balance assessment.
 *
 * Each item scored 0–4 (0 = cannot perform, 4 = independent).
 * Total 0–56; < 45 = elevated fall risk.
 */
export interface BergBalanceData {
	sitting_to_standing?: number;
	standing_to_sitting?: number;
	transfers?: number;
	standing_unsupported?: number;
	sitting_unsupported?: number;
	eyes_closed_standing?: number;
	feet_together_standing?: number;
	reaching_forward?: number;
	retrieving_object?: number;
	turning_behind?: number;
	turning_360?: number;
	alternate_foot_stool?: number;
	feet_tandem?: number;
	single_leg_stand?: number;

	/** 0–56 (< 45 = elevated fall risk) */
	total_score?: number;
	performed?: boolean;
	notes?: string;
}

// ── Tier 2 Cognitive / Safety Pathway (triggered by MMSE < 24) ────────────────

/**
 * Tier 2 Cognitive/Safety pathway.
 *
 * Triggered when MMSE < 24 or OT clinical judgment indicates concern.
 * Combines SAFER-HOME functional safety tasks, Medi-Cog medication
 * management, and executive function observations.
 */
export interface Tier2CognitiveData {
	// ── SAFER-HOME items (selected functional safety tasks) ──
	safer_home?: {
		cooking_safety?: YesNoNa;
		medication_safety?: YesNoNa;
		telephone_use_safety?: YesNoNa;
		emergency_response?: YesNoNa;
		home_navigation?: YesNoNa;
		appliance_safety?: YesNoNa;
	};

	// ── Medi-Cog (medication management) ──
	medi_cog?: {
		can_identify_medications?: YesNoNa;
		knows_dosages?: YesNoNa;
		knows_timing?: YesNoNa;
		knows_purpose?: YesNoNa;
		manages_refills?: YesNoNa;
		uses_pill_organizer?: boolean;
	};

	// ── Executive function observations ──
	executive_function?: {
		sequencing_difficulty?: boolean;
		problem_solving_difficulty?: boolean;
		safety_judgment_concerns?: boolean;
		cooking_safety_concerns?: boolean;
		driving_safety_concerns?: boolean;
		wandering_risk?: boolean;
	};

	notes?: string;
}

// ── Tier 2 Frailty / Medical Pathway (triggered by FRAIL ≥ 1) ─────────────────

/**
 * Tier 2 Frailty/Medical pathway.
 *
 * Triggered when FRAIL score ≥ 1 (pre-frail or frail) or OT clinical
 * judgment indicates concern.  Covers nutrition, endurance, caregiver
 * burden, and social support.
 */
export interface Tier2FrailtyData {
	// ── Nutritional screening ──
	nutrition?: {
		appetite_change?: YesNoNa;
		weight_loss_unintentional?: YesNoNa;
		difficulty_eating?: YesNoNa;
		meal_skipping?: YesNoNa;
		fluid_intake_concern?: YesNoNa;
	};

	// ── Endurance assessment ──
	endurance?: {
		activity_tolerance?: "good" | "fair" | "poor";
		fatigue_with_minimal_activity?: boolean;
		dyspnea_on_exertion?: boolean;
	};

	// ── Caregiver burden ──
	caregiver_burden?: {
		caregiver_present?: boolean;
		caregiver_relationship?: string;
		caregiver_hours_per_week?: number;
		caregiver_burnout_reported?: YesNoNa;
		caregiver_health_limitations?: boolean;
		daily_check_in_available?: boolean;
	};

	// ── Social support ──
	social_support?: {
		social_isolation_concern?: boolean;
		community_engagement?: "good" | "fair" | "poor" | "none";
		transportation_support?: YesNoNa;
	};

	notes?: string;
}

// ── Tier 2 Environmental Hazard Pathway (triggered by HOME FAST hazards) ─────

/**
 * Tier 2 Environmental Hazard pathway.
 *
 * Triggered when HOME FAST hazard count exceeds threshold or OT clinical
 * judgment indicates concern.  Provides detailed room-by-room analysis
 * and accessibility evaluation.
 */
export interface Tier2EnvironmentalData {
	// ── Detailed room-by-room analysis ──
	rooms?: {
		room_name: string;
		hazards?: string[];
		recommendations?: string[];
	}[];

	accessibility_evaluation?: {
		/** Are doorway widths adequate for mobility devices? */
		doorway_widths?: YesNoNa;
		/** Are there threshold barriers creating trip hazards? */
		threshold_barriers?: YesNoNa;
		/** Is a ramp needed? */
		ramp_needed?: boolean;
		/** Is a ramp already present? */
		ramp_present?: boolean;
		/** Rooms/areas where grab bars are needed */
		grab_bar_needs?: string[];
		/** Flooring concerns (loose rugs, uneven surfaces, etc.) */
		flooring_concerns?: string[];
	};

	notes?: string;
}

// ── Tier 3: Physician Review ─────────────────────────────────────────────────

/**
 * Physician Review — clinical synthesis from all tiers.
 *
 * Completed by the reviewing physician after all assessment tiers are done.
 * Integrates findings into an overall risk level and clinical impression.
 */
export interface PhysicianReviewData {
	// ── Synthesis from all tiers ──
	frailty_level?: "robust" | "pre_frail" | "frail";
	cognitive_status?: "normal" | "mild_impairment" | "moderate_impairment" | "severe_impairment";
	mobility_status?: "independent" | "assisted" | "limited" | "non_ambulatory";

	// ── Clinical synthesis ──
	chronic_disease_burden?: "low" | "moderate" | "high";
	active_chronic_conditions?: string;
	readmission_risk?: "low" | "moderate" | "high";

	// ── Pain & function ──
	pain_limitations_present?: boolean;
	pain_description?: string;

	// ── Neurologic ──
	progressive_neurologic_disease?: boolean;
	neurologic_diagnosis?: string;

	// ── Cardiopulmonary ──
	cardiopulmonary_limitations?: YesNoUnknown;
	cardiopulmonary_details?: string;

	// ── Physician impression ──
	physician_impression?: string;
	physician_overall_risk?: "low" | "moderate" | "high" | "very_high" | "unsafe_independent";
	physician_name?: string;
	/** ISO datetime string */
	physician_reviewed_at?: string;

	notes?: string;
}

// ── Composite ─────────────────────────────────────────────────────────────────

/** All intake section data, matching client_intake table JSONB columns */
export interface ClientIntakeSections {
	clinical_context: ClinicalContextData | null;
	steadi: SteadiData | null;
	adl_iadl: AdlIadlData | null;
	tug_test: TugTestData | null;
	frail_scale: FrailScaleData | null;
	slums: SlumsData | null;
	ot_clinical_judgment: OtClinicalJudgmentData | null;
	/** Conditional — triggered when TUG ≥ 12 s */
	berg_balance: BergBalanceData | null;
	/** Conditional — triggered when SLUMS is below the normal range */
	tier2_cognitive: Tier2CognitiveData | null;
	/** Conditional — triggered when FRAIL ≥ 1 */
	tier2_frailty: Tier2FrailtyData | null;
	/** Conditional — triggered when STEADI hazard count exceeds threshold */
	tier2_environmental: Tier2EnvironmentalData | null;
	physician_review: PhysicianReviewData | null;
	/** Post-assessment modification recommendations */
	home_modifications: HomeModificationsData | null;
}

/** Union of all intake section data types */
export type IntakeSectionData =
	| ClinicalContextData
	| SteadiData
	| AdlIadlData
	| TugTestData
	| FrailScaleData
	| SlumsData
	| OtClinicalJudgmentData
	| BergBalanceData
	| Tier2CognitiveData
	| Tier2FrailtyData
	| Tier2EnvironmentalData
	| PhysicianReviewData
	| HomeModificationsData;
