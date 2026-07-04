import type { SteadiData, Tier2EnvironmentalData } from "@/types/intake";
import type { ModificationCategory } from "@/types/modifications";

// ─────────────────────────────────────────────────────────────────────────────
// Home findings — the list of concrete issues identified during assessment.
//
// Aggregates flagged STEADI hazards and Tier 2 environmental findings into
// one structure. Shown on the Home Modifications step (with one-click add,
// prefilling triggered_by) and on the Review step. The triggered_by linkage
// between finding and modification is what makes quotes traceable to
// assessment evidence — the core of the pricing training data.
// ─────────────────────────────────────────────────────────────────────────────

export type HomeFinding = {
	/** Stable id, e.g. "steadi:bath_support" */
	id: string;
	source: "steadi" | "tier2_environmental";
	/** Area of the home, e.g. "Bathrooms", "Stairs & Steps", or a room name */
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

// STEADI item id → catalog modification that typically remediates it.
// Items without an entry (behavioral/habit findings) add as custom.
const STEADI_SUGGESTIONS: Record<string, string> = {
	floors_throw_rugs: "remove_throw_rugs",
	floors_cords: "secure_loose_carpets",
	stairs_broken: "step_repair",
	stairs_no_light: "lighting_upgrade",
	stairs_one_switch: "lighting_upgrade",
	stairs_handrails: "second_handrail",
	stairs_carpet: "secure_loose_carpets",
	kitchen_high_shelves: "pull_out_shelves",
	bedroom_light_reach: "lighting_upgrade",
	bedroom_dark_path: "lighting_upgrade",
	bath_slippery: "non_slip_flooring",
	bath_support: "grab_bars_shower",
};

const STEADI_AREA_CATEGORY: Record<string, ModificationCategory> = {
	"Floors": "general",
	"Stairs & Steps": "stairs",
	"Kitchen": "kitchen",
	"Bedrooms": "bedroom",
	"Bathrooms": "bathroom",
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
	steadi: SteadiData | null | undefined,
	tier2Env: Tier2EnvironmentalData | null | undefined
): HomeFinding[] {
	const findings: HomeFinding[] = [];

	// STEADI — every "yes" answer flags a hazard
	for (const item of steadi?.items ?? []) {
		if (item.response !== "yes") continue;
		findings.push({
			id: `steadi:${item.id}`,
			source: "steadi",
			area: item.section,
			description: item.question,
			suggested_type: STEADI_SUGGESTIONS[item.id],
			suggested_category: STEADI_AREA_CATEGORY[item.section] ?? "general",
			triggered_by: `STEADI — ${item.section}: ${item.question}`,
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
