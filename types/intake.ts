// ─────────────────────────────────────────────────────────────────────────────
// Intake section data shapes
// These interfaces type the six JSONB columns on the client_intake table.
// The schema lives here (application layer) so it can evolve without a
// Supabase migration for every sub-field addition.
//
// All leaf fields are optional/nullable — intake is captured as a draft
// progressively, so any section may be partially filled at any point.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared primitives ─────────────────────────────────────────────────────────

/** 1–5 Likert scale used across several domains */
export type LikertScale = 1 | 2 | 3 | 4 | 5;

/** Yes / No / Unknown */
export type YesNoUnknown = "yes" | "no" | "unknown";

// ── Home Safety ───────────────────────────────────────────────────────────────

export interface HomeSafetyData {
  // Lighting
  adequate_lighting?: YesNoUnknown;
  night_lights_present?: boolean;

  // Hazards
  loose_rugs_or_mats?: boolean;
  clutter_in_walkways?: boolean;
  unstable_furniture?: boolean;

  // Bathrooms
  grab_bars_in_bathroom?: boolean;
  non_slip_surfaces_in_bath?: boolean;
  raised_toilet_seat?: boolean;

  // Emergency egress
  accessible_exits?: YesNoUnknown;
  working_smoke_detectors?: YesNoUnknown;
  working_co_detectors?: YesNoUnknown;
  emergency_contact_posted?: boolean;

  notes?: string;
}

// ── Mobility ──────────────────────────────────────────────────────────────────

export interface MobilityData {
  // Ambulation
  uses_mobility_aid?: boolean;
  mobility_aid_type?: "cane" | "walker" | "rollator" | "wheelchair" | "scooter" | "none" | "other";
  mobility_aid_other?: string;
  independent_ambulation?: YesNoUnknown;

  // Stairs
  home_has_stairs?: boolean;
  able_to_climb_stairs?: YesNoUnknown;
  stair_rail_present?: boolean;

  // Fall history
  falls_in_past_12_months?: number;
  fall_resulted_in_injury?: boolean;
  fear_of_falling_limits_activity?: boolean;

  notes?: string;
}

// ── ADLs / IADLs ─────────────────────────────────────────────────────────────

/** 1 = fully independent, 5 = fully dependent */
export type AssistanceLevel = 1 | 2 | 3 | 4 | 5;

export interface AdlsIadlsData {
  // Basic ADLs (self-care)
  bathing?: AssistanceLevel;
  dressing?: AssistanceLevel;
  grooming?: AssistanceLevel;
  toileting?: AssistanceLevel;
  transferring?: AssistanceLevel;
  continence?: AssistanceLevel;
  feeding?: AssistanceLevel;

  // IADLs (instrumental)
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

// ── Cognition ─────────────────────────────────────────────────────────────────

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

  // Communication
  communication_difficulty?: YesNoUnknown;
  hearing_impairment?: YesNoUnknown;
  vision_impairment?: YesNoUnknown;

  // Diagnosis
  dementia_diagnosis?: boolean;
  dementia_type?: string;

  notes?: string;
}

// ── Fall Risk ─────────────────────────────────────────────────────────────────

export interface FallRiskData {
  // Subjective
  afraid_of_falling?: boolean;
  avoids_activities_due_to_fall_fear?: boolean;

  // Near-miss events
  near_miss_falls_in_past_6_months?: number;

  // Balance & gait
  balance_impairment_observed?: YesNoUnknown;
  gait_abnormality_observed?: YesNoUnknown;

  // Formal assessment
  tug_test_seconds?: number;       // Timed Up-and-Go in seconds; null = not performed
  berg_balance_score?: number;     // 0–56; null = not performed

  // Contributing factors
  multiple_medications?: boolean;  // polypharmacy (≥4 medications)
  postural_hypotension?: YesNoUnknown;
  foot_problems?: boolean;
  inappropriate_footwear?: boolean;

  notes?: string;
}

// ── Caregiver Support ─────────────────────────────────────────────────────────

export interface CaregiverSupportData {
  // Informal caregiver
  has_informal_caregiver?: boolean;
  caregiver_relationship?: "spouse" | "child" | "sibling" | "friend" | "neighbor" | "other";
  caregiver_relationship_other?: string;
  caregiver_hours_per_week?: number;
  caregiver_lives_with_client?: boolean;

  // Caregiver wellness
  caregiver_reports_burnout?: YesNoUnknown;
  caregiver_health_limitations?: boolean;

  // Formal support
  has_home_health_aide?: boolean;
  home_health_aide_hours_per_week?: number;
  other_formal_services?: string;

  notes?: string;
}

// ── Composite ─────────────────────────────────────────────────────────────────

/** The full set of intake domain columns, matching client_intake table fields */
export interface ClientIntakeSections {
  home_safety: HomeSafetyData | null;
  mobility: MobilityData | null;
  adls_iadls: AdlsIadlsData | null;
  cognition: CognitionData | null;
  fall_risk: FallRiskData | null;
  caregiver_support: CaregiverSupportData | null;
}

export type IntakeSectionData =
  | HomeSafetyData
  | MobilityData
  | AdlsIadlsData
  | CognitionData
  | FallRiskData
  | CaregiverSupportData;
