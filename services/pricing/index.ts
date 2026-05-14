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
	moderate: 1.33,
	high: 1.66,
	very_high: 2.0,
	unsafe_independent: 2.5,
};

// ── Default base plan fee ($USD, one-time) ───────────────────────────────────
// Starting fee for a standard plan before risk loading.
export const DEFAULT_BASE_PLAN_FEE = 1500;

// ── Service catalog ───────────────────────────────────────────────────────────
// These are the planning and advisory deliverables HomeLongevityMD provides —
// not hands-on caregiving. Each item is a concrete output the client receives
// as part of their personalized independence plan.

export const SERVICE_CATALOG = [
	"Personalized home longevity plan",
	"Home safety assessment & modification recommendations",
	"Fall risk reduction protocol",
	"Mobility & exercise prescription",
	"Medication review & simplification guidance",
	"Nutrition & meal planning recommendations",
	"Cognitive health strategies",
	"ADL/IADL independence strategies",
	"Local resource & referral guide",
	"Annual plan review & update",
] as const;

export type CatalogService = (typeof SERVICE_CATALOG)[number];

// ── Suggestion logic ──────────────────────────────────────────────────────────

/**
 * Returns recommended plan deliverables based on which domains scored high
 * (≥ 40 = elevated risk in that domain).
 * Every client receives the core plan and resource guide.
 */
export function suggestServices(assessment: RiskAssessmentRow): string[] {
	const services = new Set<string>([
		"Personalized home longevity plan",
		"Local resource & referral guide",
	]);

	if (assessment.home_safety_score >= 40)
		services.add("Home safety assessment & modification recommendations");

	if (assessment.fall_risk_score >= 40)
		services.add("Fall risk reduction protocol");

	if (assessment.mobility_score >= 40)
		services.add("Mobility & exercise prescription");

	if (assessment.adls_iadls_score >= 40) {
		services.add("Medication review & simplification guidance");
		services.add("Nutrition & meal planning recommendations");
		services.add("ADL/IADL independence strategies");
	}

	if (assessment.cognition_score >= 40)
		services.add("Cognitive health strategies");

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
