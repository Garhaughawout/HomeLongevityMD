// ─────────────────────────────────────────────────────────────────────────────
// Pricing utilities — version 1.0
//
// Maps risk assessment outputs to suggested quote inputs.
// Pure TypeScript — no DB calls. Safe to import in both server and client code.
// ─────────────────────────────────────────────────────────────────────────────

import type { RiskAssessmentRow } from "@/types/supabase";

// ── Risk → multiplier map ─────────────────────────────────────────────────────

export const RISK_MULTIPLIERS: Record<string, number> = {
	low: 1.0,
	moderate: 1.15,
	high: 1.3,
	very_high: 1.5,
	unsafe_independent: 1.75,
};

// ── Default base plan fee ($USD, one-time) ───────────────────────────────────
// Starting fee for a standard plan before risk loading.
export const DEFAULT_BASE_PLAN_FEE = 4500;

// ── Service catalog ───────────────────────────────────────────────────────────

export const SERVICE_CATALOG = [
	"Personal care assistance",
	"Medication management",
	"Fall prevention monitoring",
	"Meal preparation",
	"Transportation assistance",
	"Housekeeping",
	"Companionship services",
	"Emergency response monitoring",
	"Cognitive support",
	"Caregiver coordination",
] as const;

export type CatalogService = (typeof SERVICE_CATALOG)[number];

// ── Suggestion logic ──────────────────────────────────────────────────────────

/**
 * Returns a list of recommended services based on which domains scored high
 * (≥ 40 = elevated risk in that domain).
 */
export function suggestServices(assessment: RiskAssessmentRow): string[] {
	const services = new Set<string>([
		"Personal care assistance",
		"Emergency response monitoring",
	]);

	if (assessment.fall_risk_score >= 40)
		services.add("Fall prevention monitoring");

	if (assessment.cognition_score >= 40) services.add("Cognitive support");

	if (assessment.adls_iadls_score >= 40) {
		services.add("Medication management");
		services.add("Meal preparation");
	}

	if (assessment.caregiver_support_score >= 40) {
		services.add("Caregiver coordination");
		services.add("Companionship services");
	}

	if (assessment.mobility_score >= 40)
		services.add("Transportation assistance");

	if (assessment.home_safety_score >= 40) services.add("Housekeeping");

	return [...services];
}

// ── Public entry point ────────────────────────────────────────────────────────

export interface QuoteSuggestion {
	base_plan_fee: number;
	risk_multiplier: number;
	plan_fee: number;
	suggested_services: string[];
}

export function suggestQuote(assessment: RiskAssessmentRow): QuoteSuggestion {
	const multiplier = RISK_MULTIPLIERS[assessment.risk_category] ?? 1.0;
	const base = DEFAULT_BASE_PLAN_FEE;
	return {
		base_plan_fee: base,
		risk_multiplier: multiplier,
		plan_fee: Math.round(base * multiplier * 100) / 100,
		suggested_services: suggestServices(assessment),
	};
}
