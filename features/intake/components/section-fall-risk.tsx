"use client";

import type { FallRiskData } from "@/types/intake";
import {
	FieldGroup,
	YesNoUnknownField,
	YesNoField,
	NumberField,
	TextareaField,
} from "./fields";

type Props = {
	value: FallRiskData;
	onChange: (v: FallRiskData) => void;
};

function set<K extends keyof FallRiskData>(
	prev: FallRiskData,
	key: K,
	val: FallRiskData[K]
): FallRiskData {
	return { ...prev, [key]: val };
}

export function SectionFallRisk({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof FallRiskData>(k: K, v: FallRiskData[K]) =>
		onChange(set(s, k, v));

	return (
		<div className="space-y-8">
			<FieldGroup legend="Prior Falls">
				<NumberField
					label="Falls in past 12 months"
					value={s.falls_in_past_12_months}
					onChange={(v) => u("falls_in_past_12_months", v)}
					min={0}
				/>
				<YesNoField
					label="Fall resulted in injury"
					value={s.fall_resulted_in_injury}
					onChange={(v) => u("fall_resulted_in_injury", v)}
				/>
				<NumberField
					label="Near-miss falls (past 6 months)"
					value={s.near_miss_falls_in_past_6_months}
					onChange={(v) => u("near_miss_falls_in_past_6_months", v)}
					min={0}
				/>
			</FieldGroup>

			<FieldGroup legend="Fear of Falling">
				<YesNoField
					label="Afraid of falling"
					value={s.afraid_of_falling}
					onChange={(v) => u("afraid_of_falling", v)}
				/>
				<YesNoField
					label="Avoids activities due to fall fear"
					value={s.avoids_activities_due_to_fall_fear}
					onChange={(v) => u("avoids_activities_due_to_fall_fear", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Orthostatic Symptoms">
				<YesNoUnknownField
					label="Orthostatic hypotension"
					value={s.orthostatic_hypotension}
					onChange={(v) => u("orthostatic_hypotension", v)}
				/>
				<YesNoField
					label="Dizziness on standing"
					value={s.dizziness_on_standing}
					onChange={(v) => u("dizziness_on_standing", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Medications">
				<NumberField
					label="Total medication count"
					value={s.medication_count}
					onChange={(v) => u("medication_count", v)}
					min={0}
				/>
				<YesNoField
					label="Polypharmacy (≥4 medications)"
					value={s.multiple_medications}
					onChange={(v) => u("multiple_medications", v)}
				/>
				<YesNoField
					label="Sedating medications present"
					value={s.sedating_medications_present}
					onChange={(v) => u("sedating_medications_present", v)}
					hint="Benzodiazepines, opioids, antihistamines, sleep aids"
				/>
			</FieldGroup>

			<FieldGroup legend="Neuropathy">
				<YesNoUnknownField
					label="Peripheral neuropathy"
					value={s.peripheral_neuropathy}
					onChange={(v) => u("peripheral_neuropathy", v)}
				/>
				<YesNoField
					label="Numbness or tingling in feet"
					value={s.numbness_or_tingling_in_feet}
					onChange={(v) => u("numbness_or_tingling_in_feet", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Vision">
				<YesNoUnknownField
					label="Vision impairment"
					value={s.vision_impairment}
					onChange={(v) => u("vision_impairment", v)}
				/>
				<YesNoField
					label="Corrective lenses used"
					value={s.corrective_lenses_used}
					onChange={(v) => u("corrective_lenses_used", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Vestibular">
				<YesNoUnknownField
					label="Vestibular symptoms"
					value={s.vestibular_symptoms}
					onChange={(v) => u("vestibular_symptoms", v)}
				/>
				<YesNoField
					label="Vertigo reported"
					value={s.vertigo_reported}
					onChange={(v) => u("vertigo_reported", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Strength &amp; Conditioning">
				<YesNoUnknownField
					label="Lower extremity weakness"
					value={s.lower_extremity_weakness}
					onChange={(v) => u("lower_extremity_weakness", v)}
				/>
				<YesNoUnknownField
					label="Deconditioning"
					value={s.deconditioning}
					onChange={(v) => u("deconditioning", v)}
				/>
				<YesNoField
					label="Foot problems"
					value={s.foot_problems}
					onChange={(v) => u("foot_problems", v)}
				/>
				<YesNoField
					label="Inappropriate footwear"
					value={s.inappropriate_footwear}
					onChange={(v) => u("inappropriate_footwear", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Clinical Observations &amp; Scores">
				<YesNoUnknownField
					label="Balance impairment observed"
					value={s.balance_impairment_observed}
					onChange={(v) => u("balance_impairment_observed", v)}
				/>
				<YesNoUnknownField
					label="Gait abnormality observed"
					value={s.gait_abnormality_observed}
					onChange={(v) => u("gait_abnormality_observed", v)}
				/>
				<NumberField
					label="TUG test"
					value={s.tug_test_seconds}
					onChange={(v) => u("tug_test_seconds", v)}
					min={0}
					step={0.1}
					unit="sec"
					hint="<12 s = low risk · >20 s = high fall risk"
				/>
				<NumberField
					label="Berg Balance Scale"
					value={s.berg_balance_score}
					onChange={(v) => u("berg_balance_score", v)}
					min={0}
					max={56}
					unit="/56"
					hint="<45 = elevated fall risk"
				/>
			</FieldGroup>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional observations about fall risk factors…"
			/>
		</div>
	);
}
