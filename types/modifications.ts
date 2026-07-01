import type { YesNoNa } from "@/types/intake";

// ─────────────────────────────────────────────────────────────────────────────
// Home Modification Recommendations
//
// Collected after assessment completion.  Structured data capturing which
// modifications the home needs, estimated costs, priority, and which
// assessment finding triggered the recommendation.
//
// This data feeds the future ML pricing model:
//   Input: assessment scores + clinical context + home type + hazards
//   Output: which modifications, what costs, was the quote accepted
// ─────────────────────────────────────────────────────────────────────────────

/** Modification categories matching rooms/areas of the home */
export type ModificationCategory =
	| "bathroom"
	| "entrance"
	| "kitchen"
	| "stairs"
	| "bedroom"
	| "hallway"
	| "general"
	| "outdoor";

/** Priority levels for modifications */
export type ModificationPriority =
	| "safety_critical"
	| "recommended"
	| "optional";

/** A single recommended home modification */
export interface ModificationItem {
	id: string;
	category: ModificationCategory;
	modification_type: string;
	description?: string;
	estimated_cost: number;
	priority: ModificationPriority;
	/** Which assessment finding triggered this recommendation */
	triggered_by?: string;
	/** Was this actually completed (tracked later, after quote acceptance) */
	completed?: boolean;
}

/** All home modification recommendations for an intake */
export interface HomeModificationsData {
	items: ModificationItem[];
	/** Total estimated cost of all items */
	total_estimated_cost?: number;
	/** Assessor notes on overall approach */
	notes?: string;
}

// ── Modification catalog with default costs ──────────────────────────────────

export const MODIFICATION_CATALOG: Array<{
	category: ModificationCategory;
	type: string;
	label: string;
	default_cost: number;
}> = [
	// Bathroom
	{ category: "bathroom", type: "grab_bars", label: "Grab bars (toilet)", default_cost: 200 },
	{ category: "bathroom", type: "grab_bars_shower", label: "Grab bars (shower/tub)", default_cost: 250 },
	{ category: "bathroom", type: "walk_in_tub", label: "Walk-in tub conversion", default_cost: 3000 },
	{ category: "bathroom", type: "roll_in_shower", label: "Roll-in shower conversion", default_cost: 5000 },
	{ category: "bathroom", type: "raised_toilet", label: "Raised toilet seat / ADA toilet", default_cost: 150 },
	{ category: "bathroom", type: "non_slip_flooring", label: "Non-slip flooring", default_cost: 800 },
	{ category: "bathroom", type: "handheld_showerhead", label: "Handheld showerhead", default_cost: 100 },
	{ category: "bathroom", type: "shower_bench", label: "Shower bench/seat", default_cost: 200 },
	// Entrance
	{ category: "entrance", type: "ramp", label: "Wheelchair ramp", default_cost: 1500 },
	{ category: "entrance", type: "threshold_ramp", label: "Threshold ramp", default_cost: 150 },
	{ category: "entrance", type: "door_widening", label: "Doorway widening", default_cost: 800 },
	{ category: "entrance", type: "lever_handles", label: "Lever door handles", default_cost: 100 },
	{ category: "entrance", type: "automatic_door", label: "Automatic door opener", default_cost: 1200 },
	// Stairs
	{ category: "stairs", type: "stairlift", label: "Stairlift installation", default_cost: 4000 },
	{ category: "stairs", type: "second_handrail", label: "Second handrail", default_cost: 350 },
	{ category: "stairs", type: "non_slip_treads", label: "Non-slip stair treads", default_cost: 300 },
	{ category: "stairs", type: "contrasting_edging", label: "Contrasting edge strips", default_cost: 200 },
	// Kitchen
	{ category: "kitchen", type: "lowered_counters", label: "Lowered countertops", default_cost: 2500 },
	{ category: "kitchen", type: "pull_out_shelves", label: "Pull-out shelving", default_cost: 600 },
	{ category: "kitchen", type: "lever_faucets", label: "Lever faucet handles", default_cost: 150 },
	{ category: "kitchen", type: "side_open_oven", label: "Side-opening oven", default_cost: 1800 },
	// Bedroom
	{ category: "bedroom", type: "hospital_bed", label: "Adjustable/hospital bed", default_cost: 1200 },
	{ category: "bedroom", type: "bed_rails", label: "Bed rails", default_cost: 150 },
	{ category: "bedroom", type: "transfer_pole", label: "Transfer pole", default_cost: 300 },
	// Hallway
	{ category: "hallway", type: "grab_bar_hallway", label: "Hallway grab bars", default_cost: 400 },
	{ category: "hallway", type: "lighting_upgrade", label: "Improved lighting", default_cost: 500 },
	// General
	{ category: "general", type: "remove_throw_rugs", label: "Remove throw rugs", default_cost: 50 },
	{ category: "general", type: "secure_loose_carpets", label: "Secure loose carpeting", default_cost: 300 },
	{ category: "general", type: "doorway_threshold_fix", label: "Fix doorway thresholds", default_cost: 250 },
	{ category: "general", type: "smart_home_safety", label: "Smart home safety (sensors, alerts)", default_cost: 800 },
	{ category: "general", type: "emergency_response_system", label: "Emergency response system", default_cost: 500 },
	// Outdoor
	{ category: "outdoor", type: "handrails_outdoor", label: "Outdoor handrails", default_cost: 600 },
	{ category: "outdoor", type: "path_repair", label: "Walkway/path repair", default_cost: 1000 },
	{ category: "outdoor", type: "lighting_outdoor", label: "Outdoor motion lighting", default_cost: 400 },
	{ category: "outdoor", type: "step_repair", label: "Step repair/replacement", default_cost: 500 },
];

export const MODIFICATION_CATALOG_MAP: Record<string, typeof MODIFICATION_CATALOG[number]> = Object.fromEntries(
	MODIFICATION_CATALOG.map((m) => [m.type, m])
);

export const PRIORITY_LABELS: Record<ModificationPriority, string> = {
	safety_critical: "Safety Critical",
	recommended: "Recommended",
	optional: "Optional",
};

export const PRIORITY_COLORS: Record<ModificationPriority, string> = {
	safety_critical: "#dc2626",
	recommended: "#c79d43",
	optional: "#6b7280",
};

export const CATEGORY_LABELS: Record<ModificationCategory, string> = {
	bathroom: "Bathroom",
	entrance: "Entrance",
	kitchen: "Kitchen",
	stairs: "Stairs",
	bedroom: "Bedroom",
	hallway: "Hallway",
	general: "General",
	outdoor: "Outdoor",
};
