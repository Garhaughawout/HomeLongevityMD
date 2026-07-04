"use client";

import type { Tier2CognitiveData } from "@/types/intake";
import { YesNoNaField, YesNoField, TextareaField, FieldGroup } from "./fields";

type Props = {
	value: Tier2CognitiveData;
	onChange: (v: Tier2CognitiveData) => void;
};

function set<K extends keyof Tier2CognitiveData>(
	prev: Tier2CognitiveData,
	key: K,
	val: Tier2CognitiveData[K]
): Tier2CognitiveData {
	return { ...prev, [key]: val };
}

export function SectionTier2Cognitive({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof Tier2CognitiveData>(k: K, v: Tier2CognitiveData[K]) =>
		onChange(set(s, k, v));

	return (
		<div className="space-y-8">
			<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
				<strong>Triggered Assessment — Cognitive &amp; Safety Pathway</strong>
				<br />
				Triggered by a SLUMS score below the normal range. Complete the following assessments
				to evaluate cognitive functional safety.
			</div>

			<FieldGroup legend="SAFER-HOME (Functional Safety Items)">
				<YesNoNaField
					label="Cooking safety — can safely operate stove/microwave?"
					value={s.safer_home?.cooking_safety}
					onChange={(v) => u("safer_home", { ...s.safer_home, cooking_safety: v })}
				/>
				<YesNoNaField
					label="Medication safety — can manage own medications?"
					value={s.safer_home?.medication_safety}
					onChange={(v) => u("safer_home", { ...s.safer_home, medication_safety: v })}
				/>
				<YesNoNaField
					label="Telephone use — can use phone independently?"
					value={s.safer_home?.telephone_use_safety}
					onChange={(v) => u("safer_home", { ...s.safer_home, telephone_use_safety: v })}
				/>
				<YesNoNaField
					label="Emergency response — can respond to emergency?"
					value={s.safer_home?.emergency_response}
					onChange={(v) => u("safer_home", { ...s.safer_home, emergency_response: v })}
				/>
				<YesNoNaField
					label="Home navigation — can navigate home safely?"
					value={s.safer_home?.home_navigation}
					onChange={(v) => u("safer_home", { ...s.safer_home, home_navigation: v })}
				/>
				<YesNoNaField
					label="Appliance safety — can safely use appliances?"
					value={s.safer_home?.appliance_safety}
					onChange={(v) => u("safer_home", { ...s.safer_home, appliance_safety: v })}
				/>
			</FieldGroup>

			<FieldGroup legend="Medi-Cog (Medication Management)">
				<YesNoNaField
					label="Can identify medications by name/purpose?"
					value={s.medi_cog?.can_identify_medications}
					onChange={(v) => u("medi_cog", { ...s.medi_cog, can_identify_medications: v })}
				/>
				<YesNoNaField
					label="Knows medication dosages?"
					value={s.medi_cog?.knows_dosages}
					onChange={(v) => u("medi_cog", { ...s.medi_cog, knows_dosages: v })}
				/>
				<YesNoNaField
					label="Knows medication timing/schedule?"
					value={s.medi_cog?.knows_timing}
					onChange={(v) => u("medi_cog", { ...s.medi_cog, knows_timing: v })}
				/>
				<YesNoNaField
					label="Knows purpose of each medication?"
					value={s.medi_cog?.knows_purpose}
					onChange={(v) => u("medi_cog", { ...s.medi_cog, knows_purpose: v })}
				/>
				<YesNoNaField
					label="Can manage medication refills?"
					value={s.medi_cog?.manages_refills}
					onChange={(v) => u("medi_cog", { ...s.medi_cog, manages_refills: v })}
				/>
				<YesNoField
					label="Uses pill organizer?"
					value={s.medi_cog?.uses_pill_organizer}
					onChange={(v) => u("medi_cog", { ...s.medi_cog, uses_pill_organizer: v })}
				/>
			</FieldGroup>

			<FieldGroup legend="Executive Function Observations">
				<YesNoField
					label="Task sequencing difficulty"
					value={s.executive_function?.sequencing_difficulty}
					onChange={(v) => u("executive_function", { ...s.executive_function, sequencing_difficulty: v })}
				/>
				<YesNoField
					label="Problem-solving difficulty"
					value={s.executive_function?.problem_solving_difficulty}
					onChange={(v) => u("executive_function", { ...s.executive_function, problem_solving_difficulty: v })}
				/>
				<YesNoField
					label="Safety judgment concerns"
					value={s.executive_function?.safety_judgment_concerns}
					onChange={(v) => u("executive_function", { ...s.executive_function, safety_judgment_concerns: v })}
				/>
				<YesNoField
					label="Cooking safety concerns"
					value={s.executive_function?.cooking_safety_concerns}
					onChange={(v) => u("executive_function", { ...s.executive_function, cooking_safety_concerns: v })}
				/>
				<YesNoField
					label="Driving safety concerns"
					value={s.executive_function?.driving_safety_concerns}
					onChange={(v) => u("executive_function", { ...s.executive_function, driving_safety_concerns: v })}
				/>
				<YesNoField
					label="Wandering risk"
					value={s.executive_function?.wandering_risk}
					onChange={(v) => u("executive_function", { ...s.executive_function, wandering_risk: v })}
				/>
			</FieldGroup>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional cognitive safety observations…"
			/>
		</div>
	);
}
