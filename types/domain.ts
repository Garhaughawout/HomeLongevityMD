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

export type IntakeSectionKey =
	| "home_safety"
	| "mobility"
	| "adls_iadls"
	| "cognition"
	| "fall_risk"
	| "caregiver_support"
	| "physician_review";

export const INTAKE_SECTIONS = [
	"home_safety",
	"mobility",
	"adls_iadls",
	"cognition",
	"fall_risk",
	"caregiver_support",
	"physician_review",
] as const satisfies ReadonlyArray<IntakeSectionKey>;

export const INTAKE_SECTION_LABELS: Record<IntakeSectionKey, string> = {
	home_safety: "Home Environment",
	mobility: "Mobility & Function",
	adls_iadls: "ADLs & IADLs",
	cognition: "Cognitive & Safety",
	fall_risk: "Fall Risk",
	caregiver_support: "Caregiver Support",
	physician_review: "Physician Review",
};

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
