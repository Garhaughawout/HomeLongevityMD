// ─────────────────────────────────────────────────────────────────────────────
// Pricing utilities — version 2.0
//
// Maps risk assessment outputs to suggested quote inputs.
// Pure TypeScript — no DB calls. Safe to import in both server and client code.
// ─────────────────────────────────────────────────────────────────────────────

import type { RiskAssessmentRow } from "@/types/supabase";
import type { HomeModificationsData, ModificationItem } from "@/types/modifications";
import { MODIFICATION_CATALOG_MAP } from "@/types/modifications";

// ── Risk → multiplier map ─────────────────────────────────────────────────────

export const RISK_MULTIPLIERS: Record<string, number> = {
	low: 1.0,
	moderate: 1.33,
	high: 1.66,
	very_high: 2.0,
	unsafe_independent: 2.5,
};

// ── Default base plan fee ($USD, one-time) ───────────────────────────────────
export const DEFAULT_BASE_PLAN_FEE = 1500;

// ── Service catalog ───────────────────────────────────────────────────────────

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

export function suggestServices(assessment: RiskAssessmentRow): string[] {
	const services = new Set<string>([
		"Personalized home longevity plan",
		"Local resource & referral guide",
	]);

	if ((assessment.steadi_score ?? 0) >= 40)
		services.add("Home safety assessment & modification recommendations");

	if ((assessment.tug_test_score ?? 0) >= 40) {
		services.add("Fall risk reduction protocol");
		services.add("Mobility & exercise prescription");
	}

	if ((assessment.adl_iadl_score ?? 0) >= 40) {
		services.add("ADL/IADL independence strategies");
		services.add("Medication review & simplification guidance");
		services.add("Nutrition & meal planning recommendations");
	}

	if ((assessment.slums_score ?? 0) >= 40)
		services.add("Cognitive health strategies");

	if ((assessment.frail_scale_score ?? 0) >= 40)
		services.add("Nutrition & meal planning recommendations");

	return Array.from(services);
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

// ── Decline reason labels (for UI) ────────────────────────────────────────────

export const DECLINE_REASONS: Record<string, string> = {
	price_too_high: "Price too high",
	price_too_low_suspicion: "Price seemed too low (suspicion)",
	chose_competitor: "Chose a competitor",
	different_services_needed: "Different services needed",
	insurance_covers_it: "Insurance covers it",
	family_decision: "Family decision",
	timing_not_right: "Timing not right",
	client_unresponsive: "Client unresponsive",
	other: "Other",
};

export const ADJUSTMENT_REASONS: Record<string, string> = {
	client_budget_constraint: "Client budget constraint",
	competitive_adjustment: "Competitive adjustment",
	service_scope_change: "Service scope change",
	family_negotiation: "Family negotiation",
	clinical_judgment_override: "Clinical judgment override",
	error_correction: "Error correction",
	other: "Other",
};

export const PAYER_TYPES: Record<string, string> = {
	self_pay: "Self-pay",
	family_pay: "Family pays",
	unknown: "Unknown",
};

export const URGENCY_LEVELS: Record<string, string> = {
	planning_ahead: "Planning ahead",
	post_discharge: "Post-discharge",
	near_crisis: "Near crisis",
	crisis: "Crisis",
	unknown: "Unknown",
};

// -- Modification-based pricing (for ML training data) -------------------------

/** Default markup percentage applied to modification costs */
export const DEFAULT_MARKUP_PERCENT = 20;

/** Default assessment/consultation fee */
export const DEFAULT_ASSESSMENT_FEE = 500;

export type ModificationLineItem = {
	category: string;
	modification_type: string;
	description: string;
	estimated_cost: number;
	priority: string;
};

export type ModificationPricingResult = {
	line_items: ModificationLineItem[];
	total_modification_cost: number;
	markup_percent: number;
	markup_amount: number;
	assessment_fee: number;
	total_quote: number;
};

export function priceFromModifications(
	mods: HomeModificationsData,
	options?: { markupPercent?: number; assessmentFee?: number }
): ModificationPricingResult {
	const markupPercent = options?.markupPercent ?? DEFAULT_MARKUP_PERCENT;
	const assessmentFee = options?.assessmentFee ?? DEFAULT_ASSESSMENT_FEE;

	const lineItems: ModificationLineItem[] = mods.items.map((item) => ({
		category: item.category,
		modification_type: item.modification_type,
		description: item.description ?? item.modification_type,
		estimated_cost: item.estimated_cost,
		priority: item.priority,
	}));

	const totalModCost = lineItems.reduce((sum, item) => sum + item.estimated_cost, 0);
	const markupAmount = Math.round(totalModCost * (markupPercent / 100) * 100) / 100;
	const totalQuote = totalModCost + markupAmount + assessmentFee;

	return {
		line_items: lineItems,
		total_modification_cost: totalModCost,
		markup_percent: markupPercent,
		markup_amount: markupAmount,
		assessment_fee: assessmentFee,
		total_quote: totalQuote,
	};
}
