// ─────────────────────────────────────────────────────────────────────────────
// Intake section data shapes
// These interfaces type the JSONB columns on the client_intake table.
// Based on the OT Mobile Screening Template (HOME FAST + SAFER-HOME Hybrid)
// developed with physician input.
//
// The schema lives here (application layer) so it can evolve without a
// Supabase migration for every sub-field addition.  All leaf fields are
// optional/nullable — intake is captured as a draft progressively, so any
// section may be partially filled at any point.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared primitives ─────────────────────────────────────────────────────────

/** Yes / No / Unknown — used for clinical observations where "Unknown" is valid */
export type YesNoUnknown = "yes" | "no" | "unknown";

/** 1 = fully independent, 5 = fully/total assist — used for ADL/IADL scoring */
export type AssistanceLevel = 1 | 2 | 3 | 4 | 5;

/** 1–5 Likert scale used across several domains */
export type LikertScale = 1 | 2 | 3 | 4 | 5;

// ── Section 3: Home Environment (HOME FAST Derived) ──────────────────────────

export interface HomeSafetyData {
	// Exterior Access
	exterior_steps_present?: boolean;
	exterior_handrails?: YesNoUnknown;
	exterior_pathway_condition?: "good" | "fair" | "poor";
	ramp_present?: boolean;

	// Entry Safety
	entry_threshold_hazard?: boolean;
	doorway_width_adequate?: YesNoUnknown;

	// Flooring Hazards
	loose_rugs_or_mats?: boolean;
	clutter_in_walkways?: boolean;
	carpet_fraying?: boolean;
	uneven_flooring?: boolean;

	// Lighting
	adequate_lighting?: YesNoUnknown;
	night_lights_present?: boolean;
	stair_lighting_adequate?: YesNoUnknown;

	// Stairs
	home_has_stairs?: boolean;
	interior_stair_handrails?: YesNoUnknown;

	// Bathroom Safety
	grab_bars_in_bathroom?: boolean;
	non_slip_surfaces_in_bath?: boolean;
	raised_toilet_seat?: boolean;
	roll_in_shower?: boolean;
	tub_transfer_bench?: boolean;

	// Bedroom Safety
	bed_height_appropriate?: YesNoUnknown;
	bedroom_pathway_clear?: boolean;
	lamp_accessible_from_bed?: boolean;

	// Kitchen Safety
	frequently_used_items_accessible?: YesNoUnknown;
	stove_safety_concerns?: boolean;

	// Emergency / Egress
	accessible_exits?: YesNoUnknown;
	working_smoke_detectors?: YesNoUnknown;
	working_co_detectors?: YesNoUnknown;
	emergency_contact_posted?: boolean;

	notes?: string;
}

// ── Section 4: Functional Performance — Mobility (SAFER-HOME Derived) ────────

export interface MobilityData {
	// Transfers
	transfer_independence?: YesNoUnknown;
	transfer_assist_level?: AssistanceLevel;
	transfer_surfaces_managed?: string;

	// Ambulation
	ambulates_independently?: YesNoUnknown;
	uses_mobility_aid?: boolean;
	mobility_aid_type?:
		| "cane"
		| "walker"
		| "rollator"
		| "wheelchair"
		| "scooter"
		| "none"
		| "other";
	mobility_aid_other?: string;

	// Gait
	gait_concerns_observed?: boolean;
	gait_concern_description?: string;

	// Stairs
	able_to_climb_stairs?: YesNoUnknown;
	stair_rail_present?: boolean;

	// Timed Mobility Tests
	tug_test_performed?: boolean;
	tug_test_seconds?: number;
	five_times_sit_to_stand_performed?: boolean;
	five_times_sit_to_stand_seconds?: number;

	notes?: string;
}

// ── Section 4: Functional Performance — ADLs / IADLs ─────────────────────────

/** 1 = fully independent, 5 = fully dependent */

export interface AdlsIadlsData {
	// Basic ADLs (self-care)
	bathing?: AssistanceLevel;
	dressing?: AssistanceLevel;
	grooming?: AssistanceLevel;
	toileting?: AssistanceLevel;
	transferring?: AssistanceLevel;
	continence?: AssistanceLevel;
	feeding?: AssistanceLevel;

	// Instrumental ADLs
	meal_preparation?: AssistanceLevel;
	medication_management?: AssistanceLevel;
	housekeeping?: AssistanceLevel;
	laundry?: AssistanceLevel;
	transportation?: AssistanceLevel;
	shopping?: AssistanceLevel;
	finances?: AssistanceLevel;
	telephone_use?: AssistanceLevel;

	notes?: string;
}

// ── Section 5: Cognitive & Safety Screening ──────────────────────────────────

export interface CognitionData {
	// Orientation
	oriented_to_person?: boolean;
	oriented_to_place?: boolean;
	oriented_to_time?: boolean;

	// Memory
	short_term_memory_concern?: YesNoUnknown;
	long_term_memory_concern?: YesNoUnknown;
	forgets_medications?: boolean;
	gets_lost_in_familiar_places?: boolean;

	// Executive Function
	executive_function_concerns?: YesNoUnknown;
	problem_solving_difficulty?: boolean;
	task_sequencing_difficulty?: boolean;

	// Communication
	communication_difficulty?: YesNoUnknown;
	hearing_impairment?: YesNoUnknown;
	vision_impairment?: YesNoUnknown;

	// Emergency Preparedness
	knows_emergency_plan?: boolean;
	can_call_for_help_independently?: boolean;
	medical_alert_device_present?: boolean;

	// Medication Safety
	manages_medications_independently?: YesNoUnknown;
	medication_errors_reported?: boolean;
	pill_organizer_used?: boolean;

	// Diagnosis
	dementia_diagnosis?: boolean;
	dementia_type?: string;

	notes?: string;
}

// ── Section 6: Fall Risk Profile ─────────────────────────────────────────────

export interface FallRiskData {
	// Prior Falls
	falls_in_past_12_months?: number;
	fall_resulted_in_injury?: boolean;
	near_miss_falls_in_past_6_months?: number;

	// Fear of Falling
	afraid_of_falling?: boolean;
	avoids_activities_due_to_fall_fear?: boolean;

	// Orthostatic Symptoms
	orthostatic_hypotension?: YesNoUnknown;
	dizziness_on_standing?: boolean;

	// Medications
	medication_count?: number;
	multiple_medications?: boolean; // polypharmacy (≥4)
	sedating_medications_present?: boolean;

	// Neuropathy
	peripheral_neuropathy?: YesNoUnknown;
	numbness_or_tingling_in_feet?: boolean;

	// Vision
	vision_impairment?: YesNoUnknown;
	corrective_lenses_used?: boolean;
	last_eye_exam?: string; // ISO date YYYY-MM-DD

	// Vestibular
	vestibular_symptoms?: YesNoUnknown;
	vertigo_reported?: boolean;

	// Strength & Conditioning
	lower_extremity_weakness?: YesNoUnknown;
	deconditioning?: YesNoUnknown;
	foot_problems?: boolean;
	inappropriate_footwear?: boolean;

	// Clinical Observations
	balance_impairment_observed?: YesNoUnknown;
	gait_abnormality_observed?: YesNoUnknown;

	// Assessment Scores
	tug_test_seconds?: number; // <12 s = low risk; >20 s = high risk
	berg_balance_score?: number; // 0–56; <45 = elevated fall risk

	notes?: string;
}

// ── Section 7: Caregiver & Support Structure ─────────────────────────────────

export interface CaregiverSupportData {
	// Informal / Family Support
	has_informal_caregiver?: boolean;
	caregiver_relationship?:
		| "spouse"
		| "child"
		| "sibling"
		| "friend"
		| "neighbor"
		| "other";
	caregiver_relationship_other?: string;
	caregiver_hours_per_week?: number;
	caregiver_lives_with_client?: boolean;
	daily_check_in_available?: boolean;

	// Paid / Formal Caregivers
	has_home_health_aide?: boolean;
	home_health_aide_hours_per_week?: number;
	other_formal_services?: string;

	// Transportation Support
	transportation_support_available?: YesNoUnknown;
	client_drives_independently?: boolean;

	// Caregiver Wellness
	caregiver_reports_burnout?: YesNoUnknown;
	caregiver_health_limitations?: boolean;
	caregiver_burden_concerns?: string;

	notes?: string;
}

// ── Section 8: Physician Review ───────────────────────────────────────────────

export interface PhysicianReviewData {
	// Frailty Indicators
	frailty_indicators_present?: YesNoUnknown;
	frailty_details?: string;

	// Chronic Disease Burden
	chronic_disease_burden?: "low" | "moderate" | "high";
	active_chronic_conditions?: string;

	// Readmission Risk
	readmission_risk?: "low" | "moderate" | "high";
	hospitalizations_past_12_months?: number;
	er_visits_past_12_months?: number;

	// Pain Limitations
	pain_limitations_present?: boolean;
	pain_severity_nrs?: number; // NRS 0–10
	pain_affects_function?: boolean;
	pain_description?: string;

	// Progressive Neurologic Disease
	progressive_neurologic_disease?: boolean;
	neurologic_diagnosis?: string;

	// Cardiopulmonary Reserve
	cardiopulmonary_limitations?: YesNoUnknown;
	cardiopulmonary_details?: string;

	// Physician Impression
	physician_impression?: string;
	physician_overall_risk?: "low" | "moderate" | "high" | "unsafe_independent";
	physician_name?: string;
	physician_reviewed_at?: string; // ISO datetime

	notes?: string;
}

// ── Composite ─────────────────────────────────────────────────────────────────

/** All intake domain sections, matching client_intake table columns */
export interface ClientIntakeSections {
	home_safety: HomeSafetyData | null;
	mobility: MobilityData | null;
	adls_iadls: AdlsIadlsData | null;
	cognition: CognitionData | null;
	fall_risk: FallRiskData | null;
	caregiver_support: CaregiverSupportData | null;
	physician_review: PhysicianReviewData | null;
}

export type IntakeSectionData =
	| HomeSafetyData
	| MobilityData
	| AdlsIadlsData
	| CognitionData
	| FallRiskData
	| CaregiverSupportData
	| PhysicianReviewData;
