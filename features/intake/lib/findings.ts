import type { HomeFastData, Tier2EnvironmentalData } from "@/types/intake";
import type { ModificationCategory } from "@/types/modifications";

// ─────────────────────────────────────────────────────────────────────────────
// Home findings — the list of concrete issues identified during assessment.
//
// Aggregates flagged HOME FAST hazards and Tier 2 environmental findings into
// one structure. Shown on the Home Modifications step (with one-click add,
// prefilling triggered_by) and on the Review step. The triggered_by linkage
// between finding and modification is what makes quotes traceable to
// assessment evidence — the core of the pricing training data.
// ─────────────────────────────────────────────────────────────────────────────

export type HomeFinding = {
	/** Stable id, e.g. "home_fast:bathroom_1" */
	id: string;
	source: "home_fast" | "tier2_environmental";
	/** Area of the home, e.g. "Bathroom", "Stairs & Steps", or a room name */
	area: string;
	/** The issue, as flagged during assessment */
	description: string;
	/** Catalog modification type that typically remediates this finding */
	suggested_type?: string;
	/** Fallback category when there is no catalog suggestion */
	suggested_category: ModificationCategory;
	/** Value to store on the modification's triggered_by field */
	triggered_by: string;
};

// HOME FAST item id → catalog modification that typically remediates it.
// Items without an entry (behavioral/educational findings) add as custom.
const HOME_FAST_SUGGESTIONS: Record<string, string> = {
	flooring_1: "remove_throw_rugs",
	flooring_2: "secure_loose_carpets",
	flooring_3: "doorway_threshold_fix",
	flooring_4: "non_slip_flooring",
	lighting_1: "lighting_upgrade",
	lighting_2: "lighting_upgrade",
	lighting_3: "lighting_upgrade",
	bathroom_1: "grab_bars_shower",
	bathroom_2: "non_slip_flooring",
	bathroom_3: "raised_toilet",
	bathroom_4: "shower_bench",
	transfers_1: "hospital_bed",
	stairs_1: "second_handrail",
	stairs_2: "contrasting_edging",
	stairs_3: "handrails_outdoor",
	access_1: "threshold_ramp",
	access_2: "door_widening",
	access_3: "path_repair",
	kitchen_1: "pull_out_shelves",
	kitchen_2: "smart_home_safety",
	emergency_1: "smart_home_safety",
	emergency_2: "smart_home_safety",
	emergency_4: "emergency_response_system",
};

const HOME_FAST_AREA_CATEGORY: Record<string, ModificationCategory> = {
	"Flooring": "general",
	"Lighting": "hallway",
	"Bathroom": "bathroom",
	"Transfers & Mobility": "bedroom",
	"Stairs & Steps": "stairs",
	"Accessibility": "entrance",
	"Kitchen Safety": "kitchen",
	"Emergency & Egress": "general",
	"Footwear & Pets": "general",
};

function categoryFromRoomName(name: string): ModificationCategory {
	const n = name.toLowerCase();
	if (n.includes("bath")) return "bathroom";
	if (n.includes("kitchen")) return "kitchen";
	if (n.includes("bed")) return "bedroom";
	if (n.includes("stair")) return "stairs";
	if (n.includes("hall")) return "hallway";
	if (n.includes("entr") || n.includes("porch") || n.includes("door")) return "entrance";
	if (n.includes("yard") || n.includes("outdoor") || n.includes("garden")) return "outdoor";
	return "general";
}

export function extractHomeFindings(
	homeFast: HomeFastData | null | undefined,
	tier2Env: Tier2EnvironmentalData | null | undefined
): HomeFinding[] {
	const findings: HomeFinding[] = [];

	// HOME FAST — every "yes" answer flags a hazard (questions are phrased
	// hazard-positively: "Are grab bars absent…?")
	for (const item of homeFast?.items ?? []) {
		if (item.response !== "yes") continue;
		findings.push({
			id: `home_fast:${item.id}`,
			source: "home_fast",
			area: item.section,
			description: item.question,
			suggested_type: HOME_FAST_SUGGESTIONS[item.id],
			suggested_category: HOME_FAST_AREA_CATEGORY[item.section] ?? "general",
			triggered_by: `HOME FAST — ${item.section}: ${item.question}`,
		});
	}

	// Tier 2 environmental — room-by-room hazards
	for (const room of tier2Env?.rooms ?? []) {
		const roomName = room.room_name?.trim() || "Room";
		for (const hazard of room.hazards ?? []) {
			const text = hazard.trim();
			if (!text) continue;
			findings.push({
				id: `tier2:${roomName}:${text}`,
				source: "tier2_environmental",
				area: roomName,
				description: text,
				suggested_category: categoryFromRoomName(roomName),
				triggered_by: `Tier 2 environmental — ${roomName}: ${text}`,
			});
		}
	}

	// Tier 2 environmental — accessibility evaluation flags
	const acc = tier2Env?.accessibility_evaluation;
	if (acc) {
		if (acc.doorway_widths === "no") {
			findings.push({
				id: "tier2:access:doorway_widths",
				source: "tier2_environmental",
				area: "Accessibility",
				description: "Doorway widths inadequate for mobility devices",
				suggested_type: "door_widening",
				suggested_category: "entrance",
				triggered_by: "Tier 2 environmental — doorway widths inadequate",
			});
		}
		if (acc.threshold_barriers === "yes") {
			findings.push({
				id: "tier2:access:threshold_barriers",
				source: "tier2_environmental",
				area: "Accessibility",
				description: "Threshold barriers creating trip hazards",
				suggested_type: "threshold_ramp",
				suggested_category: "entrance",
				triggered_by: "Tier 2 environmental — threshold barriers",
			});
		}
		if (acc.ramp_needed && !acc.ramp_present) {
			findings.push({
				id: "tier2:access:ramp",
				source: "tier2_environmental",
				area: "Accessibility",
				description: "Ramp needed but not present",
				suggested_type: "ramp",
				suggested_category: "entrance",
				triggered_by: "Tier 2 environmental — ramp needed",
			});
		}
		for (const areaNeed of acc.grab_bar_needs ?? []) {
			const text = areaNeed.trim();
			if (!text) continue;
			findings.push({
				id: `tier2:access:grab_bars:${text}`,
				source: "tier2_environmental",
				area: "Accessibility",
				description: `Grab bars needed: ${text}`,
				suggested_type: "grab_bars",
				suggested_category: "bathroom",
				triggered_by: `Tier 2 environmental — grab bars needed (${text})`,
			});
		}
		for (const concern of acc.flooring_concerns ?? []) {
			const text = concern.trim();
			if (!text) continue;
			findings.push({
				id: `tier2:access:flooring:${text}`,
				source: "tier2_environmental",
				area: "Accessibility",
				description: `Flooring concern: ${text}`,
				suggested_category: "general",
				triggered_by: `Tier 2 environmental — flooring concern (${text})`,
			});
		}
	}

	return findings;
}
