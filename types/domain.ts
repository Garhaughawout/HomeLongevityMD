// ─────────────────────────────────────────────────────────────────────────────
// Domain models
// Shared string union types and constants for all application-layer
// business logic: statuses, risk categories, quote states, intake sections,
// and activity event types.  Import from here rather than repeating literals.
// ─────────────────────────────────────────────────────────────────────────────

// ── Clients ───────────────────────────────────────────────────────────────────

export type ClientStatus = "active" | "inactive" | "archived";

export const CLIENT_STATUSES = ["active", "inactive", "archived"] as const;

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
	active: "Active",
	inactive: "Inactive",
	archived: "Archived",
};

// ── Intake ────────────────────────────────────────────────────────────────────

export type IntakeStatus = "draft" | "submitted";

export const INTAKE_STATUSES = ["draft", "submitted"] as const;

export const INTAKE_STATUS_LABELS: Record<IntakeStatus, string> = {
	draft: "Draft",
	submitted: "Submitted",
};

// ── Intake sections (new 3-tier adaptive assessment) ──────────────────────────

export type IntakeSectionKey =
	| "clinical_context"
	| "steadi"
	| "adl_iadl"
	| "tug_test"
	| "frail_scale"
	| "slums"
	| "ot_clinical_judgment"
	| "berg_balance"
	| "tier2_cognitive"
	| "tier2_frailty"
	| "tier2_environmental"
	| "physician_review"
	| "home_modifications";

export const INTAKE_SECTIONS = [
	"clinical_context",
	"steadi",
	"adl_iadl",
	"tug_test",
	"frail_scale",
	"slums",
	"ot_clinical_judgment",
	"berg_balance",
	"tier2_cognitive",
	"tier2_frailty",
	"tier2_environmental",
	"physician_review",
	"home_modifications",
] as const satisfies ReadonlyArray<IntakeSectionKey>;

export const INTAKE_SECTION_LABELS: Record<IntakeSectionKey, string> = {
	clinical_context: "Clinical Context",
	steadi: "Home Safety Checklist (STEADI)",
	adl_iadl: "ADLs & IADLs",
	tug_test: "TUG Test",
	frail_scale: "FRAIL Scale",
	slums: "Cognition (SLUMS)",
	ot_clinical_judgment: "OT Clinical Judgment",
	berg_balance: "Berg Balance Scale",
	tier2_cognitive: "Cognitive & Safety Pathway",
	tier2_frailty: "Frailty & Medical Pathway",
	tier2_environmental: "Environmental Hazard Pathway",
	physician_review: "Physician Review",
	home_modifications: "Home Modifications",
};

// Tier classification for UI grouping
export type AssessmentTier = "tier0" | "tier1" | "tier1_5" | "tier2" | "tier3" | "tier3_modifications";

export const INTAKE_SECTION_TIERS: Record<IntakeSectionKey, AssessmentTier> = {
	clinical_context: "tier0",
	steadi: "tier1",
	adl_iadl: "tier1",
	tug_test: "tier1",
	frail_scale: "tier1",
	slums: "tier1",
	ot_clinical_judgment: "tier1_5",
	berg_balance: "tier2",
	tier2_cognitive: "tier2",
	tier2_frailty: "tier2",
	tier2_environmental: "tier2",
	physician_review: "tier3",
	home_modifications: "tier3_modifications",
};

// Which Tier 2 sections are triggered by which Tier 1 results
export const TIER2_TRIGGERS = {
	berg_balance: "tug_test",        // TUG >= 12 seconds
	tier2_cognitive: "slums",         // SLUMS below normal range
	tier2_frailty: "frail_scale",     // FRAIL >= 3 (pre-frail or frail)
	tier2_environmental: "steadi",    // STEADI high hazard count
} as const;

// ── Risk assessments ──────────────────────────────────────────────────────────

export type RiskCategory =
	| "low"
	| "moderate"
	| "high"
	| "very_high"
	| "unsafe_independent";

export const RISK_CATEGORIES = [
	"low",
	"moderate",
	"high",
	"very_high",
	"unsafe_independent",
] as const satisfies ReadonlyArray<RiskCategory>;

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
	low: "Low",
	moderate: "Moderate",
	high: "High",
	very_high: "Very High",
	unsafe_independent: "Unsafe for Independent Living",
};

/** Aggregate score thresholds (inclusive).  Used by the scoring engine. */
export const RISK_CATEGORY_THRESHOLDS: Record<
	RiskCategory,
	{ min: number; max: number }
> = {
	low: { min: 0, max: 24 },
	moderate: { min: 25, max: 49 },
	high: { min: 50, max: 64 },
	very_high: { min: 65, max: 79 },
	unsafe_independent: { min: 80, max: 100 },
};

export function getRiskCategory(aggregateScore: number): RiskCategory {
	for (const category of RISK_CATEGORIES) {
		const { min, max } = RISK_CATEGORY_THRESHOLDS[category];
		if (aggregateScore >= min && aggregateScore <= max) return category;
	}
	return "unsafe_independent";
}

// ── Quotes ────────────────────────────────────────────────────────────────────

export type QuoteStatus =
	| "draft"
	| "sent"
	| "accepted"
	| "declined"
	| "expired";

export const QUOTE_STATUSES = [
	"draft",
	"sent",
	"accepted",
	"declined",
	"expired",
] as const satisfies ReadonlyArray<QuoteStatus>;

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
	draft: "Draft",
	sent: "Sent",
	accepted: "Accepted",
	declined: "Declined",
	expired: "Expired",
};

// ── Activity log ──────────────────────────────────────────────────────────────

export type ActivityEventType =
	| "client_created"
	| "client_updated"
	| "client_status_changed"
	| "intake_saved"
	| "intake_submitted"
	| "assessment_persisted"
	| "quote_generated"
	| "quote_sent"
	| "quote_accepted"
	| "quote_declined"
	| "note_created"
	| "note_updated"
	| "note_deleted";

export const ACTIVITY_EVENT_TYPES = [
	"client_created",
	"client_updated",
	"client_status_changed",
	"intake_saved",
	"intake_submitted",
	"assessment_persisted",
	"quote_generated",
	"quote_sent",
	"quote_accepted",
	"quote_declined",
	"note_created",
	"note_updated",
	"note_deleted",
] as const satisfies ReadonlyArray<ActivityEventType>;

export const ACTIVITY_EVENT_LABELS: Record<ActivityEventType, string> = {
	client_created: "Client created",
	client_updated: "Client updated",
	client_status_changed: "Client status changed",
	intake_saved: "Intake saved",
	intake_submitted: "Intake submitted",
	assessment_persisted: "Assessment saved",
	quote_generated: "Quote generated",
	quote_sent: "Quote sent",
	quote_accepted: "Quote accepted",
	quote_declined: "Quote declined",
	note_created: "Note added",
	note_updated: "Note updated",
	note_deleted: "Note deleted",
};

export type ActivityEntityType =
	| "client"
	| "intake"
	| "assessment"
	| "quote"
	| "note";
