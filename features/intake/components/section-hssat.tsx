"use client";

import type { HssatData, HssatAreaResult } from "@/types/intake";
import { FieldGroup, CheckboxGroup, TextField, TextareaField, InfoBanner } from "./fields";

type Props = {
	value: HssatData;
	onChange: (v: HssatData) => void;
};

// ── HSSAT v5 catalog — 10 home areas ──────────────────────────────────────────
// Home Safety Self-Assessment Tool, University at Buffalo (public domain,
// reproduced with author acknowledgement — see banner in the component).

export const HSSAT_AREAS: Array<{
	id: string;
	name: string;
	items: Array<{ id: string; label: string }>;
}> = [
	{
		id: "front_entrance",
		name: "Entrance to Front Door and Front Yard",
		items: [
			{ id: "railings", label: "Lack of railings or unstable railing" },
			{ id: "unsafe_steps", label: "Unsafe steps (too steep / cracked)" },
			{ id: "threshold", label: "Unmarked or raised threshold" },
			{ id: "lighting", label: "Lack of lighting at night" },
			{ id: "ramp", label: "Lack of a ramp for a wheelchair" },
			{ id: "pavement", label: "Uneven / cracked pavement" },
			{ id: "ice_snow", label: "Ice or snow on driveway / walkway" },
			{ id: "grab_bar", label: "Lack of an outdoor grab bar" },
		],
	},
	{
		id: "back_entrance",
		name: "Entrance to Back/Side Door",
		items: [
			{ id: "railings", label: "Lack of railings or unstable railing" },
			{ id: "unsafe_steps", label: "Unsafe steps (too steep / cracked / chipped)" },
			{ id: "threshold", label: "Unmarked or raised threshold" },
			{ id: "lighting", label: "Lack of lighting at night" },
			{ id: "ramp", label: "Lack of a ramp for a wheelchair" },
			{ id: "pavement", label: "Uneven / cracked pavement" },
			{ id: "ice_snow", label: "Ice or snow on walkway" },
			{ id: "grab_bar", label: "Lack of an outdoor grab bar" },
		],
	},
	{
		id: "hallway",
		name: "Hallway or Foyer",
		items: [
			{ id: "flooring", label: "Uneven or slippery flooring" },
			{ id: "clutter", label: "Cluttered area" },
			{ id: "lighting", label: "Dark or poor lighting" },
			{ id: "ceiling_light", label: "Lack of access to ceiling light" },
		],
	},
	{
		id: "living_room",
		name: "Living Room",
		items: [
			{ id: "throw_rug", label: "Presence of throw or scatter rug" },
			{ id: "clutter", label: "Presence of clutter" },
			{ id: "cords", label: "Electric cords across the floor" },
			{ id: "lighting", label: "Poor lighting" },
			{ id: "unstable_furniture", label: "Presence of unstable furniture" },
			{ id: "unstable_chair", label: "Presence of unstable chair" },
			{ id: "switches", label: "Difficult to access light switches" },
			{ id: "space", label: "Not enough space to move around" },
		],
	},
	{
		id: "kitchen",
		name: "Kitchen",
		items: [
			{ id: "cabinets", label: "Cabinet too high or low" },
			{ id: "counter_space", label: "Not enough counter space" },
			{ id: "stool_reaching", label: "Using a stool or chair to reach things" },
			{ id: "maneuvering", label: "Not enough room to maneuver" },
			{ id: "throw_rug", label: "Presence of throw / scatter rug" },
			{ id: "slippery_floor", label: "Presence of slippery floor" },
			{ id: "lighting", label: "Poor lighting" },
			{ id: "pet", label: "Pet underfoot when preparing meals" },
		],
	},
	{
		id: "bedroom",
		name: "Bedroom",
		items: [
			{ id: "clutter", label: "Presence of clutter" },
			{ id: "cords", label: "Electric cords across the floor" },
			{ id: "unsafe_carpet", label: "Unsafe carpet (uneven, torn, curled up)" },
			{ id: "throw_rug", label: "Presence of throw / scatter rug" },
			{ id: "bed_height", label: "Height of bed (too low / high)" },
			{ id: "phone", label: "Lack of a telephone near the bed" },
			{ id: "nightlight", label: "Lack of nightlight" },
			{ id: "arrangement", label: "Arrangement causes difficulty reaching items (TV remote, lamp)" },
			{ id: "bed_device", label: "Lack of device to get in / out of bed" },
		],
	},
	{
		id: "bathroom",
		name: "Bathroom",
		items: [
			{ id: "bath_rugs", label: "Presence of unsafe bath rugs" },
			{ id: "grab_bars_tub", label: "Lack of grab bars in the tub" },
			{ id: "grab_bars_shower", label: "Lack of grab bars in the shower area" },
			{ id: "grab_bars_toilet", label: "Lack of grab bars near the toilet" },
			{ id: "toilet_height", label: "Toilet is too high or low" },
			{ id: "slippery_tub", label: "Slippery tub (lack of bath mat, etc.)" },
			{ id: "high_tub", label: "Claw foot / tub that is high to get into" },
			{ id: "bath_chair", label: "Lack of bath chair in the shower area" },
			{ id: "clutter", label: "Clutter" },
			{ id: "grab_bar_placement", label: "Incorrect placement of grab bars" },
		],
	},
	{
		id: "staircases",
		name: "Staircases",
		items: [
			{ id: "lighting", label: "Poor or lack of lighting" },
			{ id: "railings", label: "Lack of railings" },
			{ id: "clutter", label: "Clutter" },
			{ id: "steep_steps", label: "Steps too steep" },
			{ id: "slippery_steps", label: "Slippery steps without tread / carpet" },
		],
	},
	{
		id: "laundry_basement",
		name: "Laundry Room/Basement",
		items: [
			{ id: "lighting", label: "Poor or lack of lighting" },
			{ id: "railings", label: "Lack of railings" },
			{ id: "clutter", label: "Clutter" },
			{ id: "steep_steps", label: "Steps too steep" },
			{ id: "slippery_steps", label: "Slippery steps without carpet / luminous light" },
			{ id: "cords", label: "Cords across the floor" },
			{ id: "floor_contrast", label: "Same colored floor at the bottom of stairs" },
		],
	},
	{
		id: "garage",
		name: "Garage",
		items: [
			{ id: "lighting", label: "Poor or lack of lighting" },
			{ id: "uneven_floor", label: "Uneven / cracked floor" },
			{ id: "slippery_floor", label: "Slippery floor" },
			{ id: "clutter", label: "Clutter" },
			{ id: "loose_items", label: "Unsecured / loose items" },
			{ id: "shoes", label: "Presence of shoes near the door" },
			{ id: "threshold", label: "Unmarked or raised threshold" },
		],
	},
];

export const HSSAT_OFFICIAL_URL =
	"https://housingtech.wihd.org/wp-content/uploads/2022/02/HSSAT-v.5-1-12-17.pdf";

// ── Component ─────────────────────────────────────────────────────────────────

export function SectionHssat({ value, onChange }: Props) {
	const s = value;

	function areaResult(areaId: string): HssatAreaResult | undefined {
		return s.areas?.find((a) => a.id === areaId);
	}

	function updateArea(areaId: string, patch: Partial<HssatAreaResult>) {
		const catalog = HSSAT_AREAS.find((a) => a.id === areaId);
		if (!catalog) return;
		const areas: HssatAreaResult[] = HSSAT_AREAS.map((cat) => {
			const existing = areaResult(cat.id) ?? { id: cat.id, name: cat.name };
			const merged = cat.id === areaId ? { ...existing, ...patch } : existing;
			const count =
				(merged.hazards?.length ?? 0) + (merged.other?.trim() ? 1 : 0);
			return { ...merged, name: cat.name, hazard_count: count };
		});
		const total = areas.reduce((sum, a) => sum + (a.hazard_count ?? 0), 0);
		onChange({ ...s, areas, total_hazards: total });
	}

	const totalHazards =
		s.total_hazards ??
		(s.areas ?? []).reduce((sum, a) => sum + (a.hazard_count ?? 0), 0);

	return (
		<div className="space-y-5">
			<InfoBanner variant="info">
				<strong>Home Safety Self-Assessment Tool (HSSAT v5)</strong> — walk
				each area of the home and check every hazard that is present. The
				per-area and total counts update automatically.{" "}
				<a
					href={HSSAT_OFFICIAL_URL}
					target="_blank"
					rel="noreferrer"
					className="font-medium underline"
				>
					Open the official illustrated HSSAT (PDF)
				</a>{" "}
				for the reference pictures and solutions.
			</InfoBanner>

			{totalHazards > 0 && (
				<InfoBanner variant="warning">
					<strong>{totalHazards}</strong> hazard(s) identified across the
					home.
					{totalHazards >= 8 &&
						" This will trigger the Environmental Hazard Pathway (Tier 2)."}
				</InfoBanner>
			)}

			{HSSAT_AREAS.map((area, i) => {
				const result = areaResult(area.id);
				const count =
					(result?.hazards?.length ?? 0) + (result?.other?.trim() ? 1 : 0);
				return (
					<FieldGroup
						key={area.id}
						legend={`${i + 1}. ${area.name}`}
						badge={`${count} hazard${count === 1 ? "" : "s"}`}
					>
						<CheckboxGroup
							label="Check each hazard present in this area"
							options={area.items.map((item) => ({
								value: item.id,
								label: item.label,
							}))}
							values={result?.hazards}
							onChange={(hazards) => updateArea(area.id, { hazards })}
						/>
						<TextField
							label="Other hazard in this area"
							value={result?.other}
							onChange={(other) => updateArea(area.id, { other })}
							placeholder="Anything not covered by the checklist"
						/>
					</FieldGroup>
				);
			})}

			<TextareaField
				label="Clinician notes"
				value={s.notes}
				onChange={(v) => onChange({ ...s, notes: v })}
				placeholder="Additional observations about the home environment…"
			/>

			<p className="text-xs leading-relaxed text-[color:var(--muted)]">
				The Home Safety Self-Assessment Tool (HSSAT) was developed by
				Machiko R. Tomita, Ph.D., Department of Rehabilitation Science,
				University at Buffalo, State University of New York, in partnership
				with the Health Foundation for Western and Central New York. It is
				in the public domain and used with author acknowledgement.
			</p>
		</div>
	);
}
