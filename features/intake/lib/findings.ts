import type { HssatData, Tier2EnvironmentalData } from "@/types/intake";
import type { ModificationCategory } from "@/types/modifications";
import { HSSAT_AREAS } from "@/features/intake/components/section-hssat";

// ─────────────────────────────────────────────────────────────────────────────
// Home findings — the list of concrete issues identified during assessment.
//
// Aggregates flagged HSSAT hazards and Tier 2 environmental findings into
// one structure. Shown on the Home Modifications step (with one-click add,
// prefilling triggered_by) and on the Review step. The triggered_by linkage
// between finding and modification is what makes quotes traceable to
// assessment evidence — the core of the pricing training data.
// ─────────────────────────────────────────────────────────────────────────────

export type HomeFinding = {
	/** Stable id, e.g. "hssat:bathroom:grab_bars_tub" */
	id: string;
	source: "hssat" | "tier2_environmental";
	/** Area of the home, e.g. "Bathroom", "Staircases", or a room name */
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

// HSSAT item id → catalog modification that typically remediates it.
// Item ids repeat across areas; "areaId:itemId" entries override the generic
// item-id entries. Items with no entry add as custom modifications.
const HSSAT_SUGGESTIONS: Record<string, string> = {
	// Area-specific overrides
	"front_entrance:railings": "handrails_outdoor",
	"back_entrance:railings": "handrails_outdoor",
	"front_entrance:lighting": "lighting_outdoor",
	"back_entrance:lighting": "lighting_outdoor",
	"front_entrance:threshold": "threshold_ramp",
	"back_entrance:threshold": "threshold_ramp",
	// Generic by item id
	railings: "second_handrail",
	unsafe_steps: "step_repair",
	threshold: "doorway_threshold_fix",
	lighting: "lighting_upgrade",
	ramp: "ramp",
	pavement: "path_repair",
	grab_bar: "handrails_outdoor",
	flooring: "non_slip_flooring",
	ceiling_light: "lighting_upgrade",
	throw_rug: "remove_throw_rugs",
	bath_rugs: "remove_throw_rugs",
	unsafe_carpet: "secure_loose_carpets",
	switches: "lighting_upgrade",
	cabinets: "pull_out_shelves",
	stool_reaching: "pull_out_shelves",
	counter_space: "lowered_counters",
	slippery_floor: "non_slip_flooring",
	bed_height: "hospital_bed",
	phone: "emergency_response_system",
	nightlight: "lighting_upgrade",
	bed_device: "transfer_pole",
	grab_bars_tub: "grab_bars_shower",
	grab_bars_shower: "grab_bars_shower",
	grab_bars_toilet: "grab_bars",
	grab_bar_placement: "grab_bars",
	toilet_height: "raised_toilet",
	slippery_tub: "non_slip_flooring",
	high_tub: "walk_in_tub",
	bath_chair: "shower_bench",
	slippery_steps: "non_slip_treads",
	floor_contrast: "contrasting_edging",
};

const HSSAT_AREA_CATEGORY: Record<string, ModificationCategory> = {
	front_entrance: "entrance",
	back_entrance: "entrance",
	hallway: "hallway",
	living_room: "general",
	kitchen: "kitchen",
	bedroom: "bedroom",
	bathroom: "bathroom",
	staircases: "stairs",
	laundry_basement: "general",
	garage: "general",
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
	hssat: HssatData | null | undefined,
	tier2Env: Tier2EnvironmentalData | null | undefined
): HomeFinding[] {
	const findings: HomeFinding[] = [];

	// HSSAT — every checked item is a hazard; per-area "Other" text too
	for (const area of hssat?.areas ?? []) {
		const catalog = HSSAT_AREAS.find((a) => a.id === area.id);
		const areaName = catalog?.name ?? area.name;
		const category = HSSAT_AREA_CATEGORY[area.id] ?? "general";

		for (const hazardId of area.hazards ?? []) {
			const label =
				catalog?.items.find((i) => i.id === hazardId)?.label ?? hazardId;
			findings.push({
				id: `hssat:${area.id}:${hazardId}`,
				source: "hssat",
				area: areaName,
				description: label,
				suggested_type:
					HSSAT_SUGGESTIONS[`${area.id}:${hazardId}`] ??
					HSSAT_SUGGESTIONS[hazardId],
				suggested_category: category,
				triggered_by: `HSSAT — ${areaName}: ${label}`,
			});
		}

		const other = area.other?.trim();
		if (other) {
			findings.push({
				id: `hssat:${area.id}:other`,
				source: "hssat",
				area: areaName,
				description: other,
				suggested_category: category,
				triggered_by: `HSSAT — ${areaName} (other): ${other}`,
			});
		}
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
