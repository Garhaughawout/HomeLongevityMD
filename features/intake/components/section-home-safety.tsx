"use client";

import type { HomeSafetyData } from "@/types/intake";
import {
	FieldGroup,
	YesNoUnknownField,
	YesNoField,
	SelectField,
	TextareaField,
} from "./fields";

type Props = {
	value: HomeSafetyData;
	onChange: (v: HomeSafetyData) => void;
};

function set<K extends keyof HomeSafetyData>(
	prev: HomeSafetyData,
	key: K,
	val: HomeSafetyData[K]
): HomeSafetyData {
	return { ...prev, [key]: val };
}

export function SectionHomeSafety({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof HomeSafetyData>(k: K, v: HomeSafetyData[K]) =>
		onChange(set(s, k, v));

	return (
		<div className="space-y-8">
			<FieldGroup legend="Exterior Access">
				<YesNoField
					label="Exterior steps present"
					value={s.exterior_steps_present}
					onChange={(v) => u("exterior_steps_present", v)}
				/>
				<YesNoField
					label="Ramp present"
					value={s.ramp_present}
					onChange={(v) => u("ramp_present", v)}
				/>
				<YesNoUnknownField
					label="Exterior handrails adequate"
					value={s.exterior_handrails}
					onChange={(v) => u("exterior_handrails", v)}
				/>
				<SelectField
					label="Exterior pathway condition"
					value={s.exterior_pathway_condition}
					onChange={(v) => u("exterior_pathway_condition", v)}
					options={[
						{ value: "good", label: "Good" },
						{ value: "fair", label: "Fair" },
						{ value: "poor", label: "Poor" },
					]}
				/>
			</FieldGroup>

			<FieldGroup legend="Entry Safety">
				<YesNoField
					label="Entry threshold hazard present"
					value={s.entry_threshold_hazard}
					onChange={(v) => u("entry_threshold_hazard", v)}
				/>
				<YesNoUnknownField
					label="Doorway width adequate"
					value={s.doorway_width_adequate}
					onChange={(v) => u("doorway_width_adequate", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Flooring Hazards">
				<YesNoField
					label="Loose rugs or mats"
					value={s.loose_rugs_or_mats}
					onChange={(v) => u("loose_rugs_or_mats", v)}
				/>
				<YesNoField
					label="Clutter in walkways"
					value={s.clutter_in_walkways}
					onChange={(v) => u("clutter_in_walkways", v)}
				/>
				<YesNoField
					label="Carpet fraying"
					value={s.carpet_fraying}
					onChange={(v) => u("carpet_fraying", v)}
				/>
				<YesNoField
					label="Uneven flooring"
					value={s.uneven_flooring}
					onChange={(v) => u("uneven_flooring", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Lighting">
				<YesNoUnknownField
					label="Adequate general lighting"
					value={s.adequate_lighting}
					onChange={(v) => u("adequate_lighting", v)}
				/>
				<YesNoField
					label="Night lights present"
					value={s.night_lights_present}
					onChange={(v) => u("night_lights_present", v)}
				/>
				<YesNoUnknownField
					label="Stair lighting adequate"
					value={s.stair_lighting_adequate}
					onChange={(v) => u("stair_lighting_adequate", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Stairs">
				<YesNoField
					label="Home has interior stairs"
					value={s.home_has_stairs}
					onChange={(v) => u("home_has_stairs", v)}
				/>
				<YesNoUnknownField
					label="Interior stair handrails"
					value={s.interior_stair_handrails}
					onChange={(v) => u("interior_stair_handrails", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Bathroom Safety">
				<YesNoField
					label="Grab bars present"
					value={s.grab_bars_in_bathroom}
					onChange={(v) => u("grab_bars_in_bathroom", v)}
				/>
				<YesNoField
					label="Non-slip surfaces in bath/shower"
					value={s.non_slip_surfaces_in_bath}
					onChange={(v) => u("non_slip_surfaces_in_bath", v)}
				/>
				<YesNoField
					label="Raised toilet seat"
					value={s.raised_toilet_seat}
					onChange={(v) => u("raised_toilet_seat", v)}
				/>
				<YesNoField
					label="Roll-in shower"
					value={s.roll_in_shower}
					onChange={(v) => u("roll_in_shower", v)}
				/>
				<YesNoField
					label="Tub transfer bench"
					value={s.tub_transfer_bench}
					onChange={(v) => u("tub_transfer_bench", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Bedroom Safety">
				<YesNoUnknownField
					label="Bed height appropriate"
					value={s.bed_height_appropriate}
					onChange={(v) => u("bed_height_appropriate", v)}
				/>
				<YesNoField
					label="Bedroom pathway clear"
					value={s.bedroom_pathway_clear}
					onChange={(v) => u("bedroom_pathway_clear", v)}
				/>
				<YesNoField
					label="Lamp accessible from bed"
					value={s.lamp_accessible_from_bed}
					onChange={(v) => u("lamp_accessible_from_bed", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Kitchen Safety">
				<YesNoUnknownField
					label="Frequently used items accessible"
					value={s.frequently_used_items_accessible}
					onChange={(v) => u("frequently_used_items_accessible", v)}
				/>
				<YesNoField
					label="Stove safety concerns"
					value={s.stove_safety_concerns}
					onChange={(v) => u("stove_safety_concerns", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Emergency &amp; Egress">
				<YesNoUnknownField
					label="Accessible exits"
					value={s.accessible_exits}
					onChange={(v) => u("accessible_exits", v)}
				/>
				<YesNoUnknownField
					label="Working smoke detectors"
					value={s.working_smoke_detectors}
					onChange={(v) => u("working_smoke_detectors", v)}
				/>
				<YesNoUnknownField
					label="Working CO detectors"
					value={s.working_co_detectors}
					onChange={(v) => u("working_co_detectors", v)}
				/>
				<YesNoField
					label="Emergency contact posted"
					value={s.emergency_contact_posted}
					onChange={(v) => u("emergency_contact_posted", v)}
				/>
			</FieldGroup>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional observations about the home environment…"
			/>
		</div>
	);
}
