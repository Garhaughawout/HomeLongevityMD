"use client";

import type { Tier2FrailtyData } from "@/types/intake";
import { YesNoNaField, YesNoField, NumberField, TextField, TextareaField, SelectField, FieldGroup } from "./fields";

type Props = {
	value: Tier2FrailtyData;
	onChange: (v: Tier2FrailtyData) => void;
};

function set<K extends keyof Tier2FrailtyData>(
	prev: Tier2FrailtyData,
	key: K,
	val: Tier2FrailtyData[K]
): Tier2FrailtyData {
	return { ...prev, [key]: val };
}

export function SectionTier2Frailty({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof Tier2FrailtyData>(k: K, v: Tier2FrailtyData[K]) =>
		onChange(set(s, k, v));

	return (
		<div className="space-y-8">
			<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
				<strong>Triggered Assessment — Frailty &amp; Medical Pathway</strong>
				<br />
				Triggered by FRAIL score ≥ 3 (pre-frail or frail). Complete the
				following assessments to evaluate nutritional status, endurance,
				and support systems.
			</div>

			<FieldGroup legend="Nutritional Screening">
				<YesNoNaField
					label="Appetite change (decreased intake)?"
					value={s.nutrition?.appetite_change}
					onChange={(v) => u("nutrition", { ...s.nutrition, appetite_change: v })}
				/>
				<YesNoNaField
					label="Unintentional weight loss?"
					value={s.nutrition?.weight_loss_unintentional}
					onChange={(v) => u("nutrition", { ...s.nutrition, weight_loss_unintentional: v })}
				/>
				<YesNoNaField
					label="Difficulty eating or swallowing?"
					value={s.nutrition?.difficulty_eating}
					onChange={(v) => u("nutrition", { ...s.nutrition, difficulty_eating: v })}
				/>
				<YesNoNaField
					label="Skipping meals regularly?"
					value={s.nutrition?.meal_skipping}
					onChange={(v) => u("nutrition", { ...s.nutrition, meal_skipping: v })}
				/>
				<YesNoNaField
					label="Inadequate fluid intake?"
					value={s.nutrition?.fluid_intake_concern}
					onChange={(v) => u("nutrition", { ...s.nutrition, fluid_intake_concern: v })}
				/>
			</FieldGroup>

			<FieldGroup legend="Endurance Assessment">
				<SelectField
					label="Activity Tolerance"
					value={s.endurance?.activity_tolerance}
					onChange={(v) => u("endurance", { ...s.endurance, activity_tolerance: v })}
					options={[
						{ value: "good", label: "Good — sustained activity > 15 min" },
						{ value: "fair", label: "Fair — sustained activity 5–15 min" },
						{ value: "poor", label: "Poor — fatigue < 5 min" },
					]}
				/>
				<YesNoField
					label="Fatigue with minimal activity?"
					value={s.endurance?.fatigue_with_minimal_activity}
					onChange={(v) => u("endurance", { ...s.endurance, fatigue_with_minimal_activity: v })}
				/>
				<YesNoField
					label="Dyspnea on exertion?"
					value={s.endurance?.dyspnea_on_exertion}
					onChange={(v) => u("endurance", { ...s.endurance, dyspnea_on_exertion: v })}
				/>
			</FieldGroup>

			<FieldGroup legend="Caregiver Burden">
				<YesNoField
					label="Informal caregiver present?"
					value={s.caregiver_burden?.caregiver_present}
					onChange={(v) => u("caregiver_burden", { ...s.caregiver_burden, caregiver_present: v })}
				/>
				{s.caregiver_burden?.caregiver_present && (
					<>
						<TextField
							label="Caregiver Relationship"
							value={s.caregiver_burden?.caregiver_relationship}
							onChange={(v) => u("caregiver_burden", { ...s.caregiver_burden, caregiver_relationship: v })}
							placeholder="spouse, child, friend…"
						/>
						<NumberField
							label="Caregiver hours/week"
							value={s.caregiver_burden?.caregiver_hours_per_week}
							onChange={(v) => u("caregiver_burden", { ...s.caregiver_burden, caregiver_hours_per_week: v })}
							min={0}
							max={168}
						/>
						<YesNoNaField
							label="Caregiver reports burnout?"
							value={s.caregiver_burden?.caregiver_burnout_reported}
							onChange={(v) => u("caregiver_burden", { ...s.caregiver_burden, caregiver_burnout_reported: v })}
						/>
						<YesNoField
							label="Caregiver has health limitations?"
							value={s.caregiver_burden?.caregiver_health_limitations}
							onChange={(v) => u("caregiver_burden", { ...s.caregiver_burden, caregiver_health_limitations: v })}
						/>
						<YesNoField
							label="Daily check-in available?"
							value={s.caregiver_burden?.daily_check_in_available}
							onChange={(v) => u("caregiver_burden", { ...s.caregiver_burden, daily_check_in_available: v })}
						/>
					</>
				)}
			</FieldGroup>

			<FieldGroup legend="Social Support">
				<YesNoField
					label="Social isolation concern?"
					value={s.social_support?.social_isolation_concern}
					onChange={(v) => u("social_support", { ...s.social_support, social_isolation_concern: v })}
				/>
				<SelectField
					label="Community Engagement"
					value={s.social_support?.community_engagement}
					onChange={(v) => u("social_support", { ...s.social_support, community_engagement: v })}
					options={[
						{ value: "good", label: "Good — regular social contact" },
						{ value: "fair", label: "Fair — occasional contact" },
						{ value: "poor", label: "Poor — rare contact" },
						{ value: "none", label: "None — isolated" },
					]}
				/>
				<YesNoNaField
					label="Transportation support available?"
					value={s.social_support?.transportation_support}
					onChange={(v) => u("social_support", { ...s.social_support, transportation_support: v })}
				/>
			</FieldGroup>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional frailty and social support observations…"
			/>
		</div>
	);
}
