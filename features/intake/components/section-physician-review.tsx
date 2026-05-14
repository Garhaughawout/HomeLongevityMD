"use client";

import type { PhysicianReviewData } from "@/types/intake";
import {
	FieldGroup,
	YesNoUnknownField,
	YesNoField,
	SelectField,
	NumberField,
	TextField,
	TextareaField,
	NrsSlider,
} from "./fields";

type Props = {
	value: PhysicianReviewData;
	onChange: (v: PhysicianReviewData) => void;
};

function set<K extends keyof PhysicianReviewData>(
	prev: PhysicianReviewData,
	key: K,
	val: PhysicianReviewData[K]
): PhysicianReviewData {
	return { ...prev, [key]: val };
}

export function SectionPhysicianReview({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof PhysicianReviewData>(
		k: K,
		v: PhysicianReviewData[K]
	) => onChange(set(s, k, v));

	return (
		<div className="space-y-8">
			<div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--muted)]">
				This section is completed by the reviewing physician. It
				synthesizes the OT findings with medical context to produce a
				comprehensive independence risk profile.
			</div>

			<FieldGroup legend="Frailty Indicators">
				<YesNoUnknownField
					label="Frailty indicators present"
					value={s.frailty_indicators_present}
					onChange={(v) => u("frailty_indicators_present", v)}
					hint="Weight loss, exhaustion, low activity, slowness, weakness"
				/>
				<TextField
					label="Frailty details"
					value={s.frailty_details}
					onChange={(v) => u("frailty_details", v)}
					placeholder="Describe specific frailty markers observed"
				/>
			</FieldGroup>

			<FieldGroup legend="Chronic Disease Burden">
				<SelectField
					label="Overall chronic disease burden"
					value={s.chronic_disease_burden}
					onChange={(v) => u("chronic_disease_burden", v)}
					options={[
						{ value: "low", label: "Low (0–1 chronic conditions)" },
						{
							value: "moderate",
							label: "Moderate (2–3 chronic conditions)",
						},
						{
							value: "high",
							label: "High (4+ or severe/unstable conditions)",
						},
					]}
				/>
				<TextField
					label="Active chronic conditions"
					value={s.active_chronic_conditions}
					onChange={(v) => u("active_chronic_conditions", v)}
					placeholder="e.g. CHF, T2DM, CKD stage 3, COPD"
				/>
			</FieldGroup>

			<FieldGroup legend="Readmission Risk">
				<SelectField
					label="30-day readmission risk"
					value={s.readmission_risk}
					onChange={(v) => u("readmission_risk", v)}
					options={[
						{ value: "low", label: "Low" },
						{ value: "moderate", label: "Moderate" },
						{ value: "high", label: "High" },
					]}
				/>
				<NumberField
					label="Hospitalizations (past 12 months)"
					value={s.hospitalizations_past_12_months}
					onChange={(v) => u("hospitalizations_past_12_months", v)}
					min={0}
				/>
				<NumberField
					label="ER visits (past 12 months)"
					value={s.er_visits_past_12_months}
					onChange={(v) => u("er_visits_past_12_months", v)}
					min={0}
				/>
			</FieldGroup>

			<FieldGroup legend="Pain Limitations">
				<YesNoField
					label="Pain limitations present"
					value={s.pain_limitations_present}
					onChange={(v) => u("pain_limitations_present", v)}
				/>
				{s.pain_limitations_present && (
					<>
						<YesNoField
							label="Pain affects daily function"
							value={s.pain_affects_function}
							onChange={(v) => u("pain_affects_function", v)}
						/>
						<TextField
							label="Pain description / location"
							value={s.pain_description}
							onChange={(v) => u("pain_description", v)}
							placeholder="e.g. chronic low back, bilateral knee"
						/>
					</>
				)}
			</FieldGroup>

			{s.pain_limitations_present && (
				<NrsSlider
					label="Pain severity (NRS 0–10)"
					value={s.pain_severity_nrs}
					onChange={(v) => u("pain_severity_nrs", v)}
					hint="Numeric Rating Scale: 0 = no pain, 10 = worst imaginable"
				/>
			)}

			<FieldGroup legend="Progressive Neurologic Disease">
				<YesNoField
					label="Progressive neurologic disease"
					value={s.progressive_neurologic_disease}
					onChange={(v) => u("progressive_neurologic_disease", v)}
				/>
				{s.progressive_neurologic_disease && (
					<TextField
						label="Neurologic diagnosis"
						value={s.neurologic_diagnosis}
						onChange={(v) => u("neurologic_diagnosis", v)}
						placeholder="e.g. Parkinson's, ALS, MS"
					/>
				)}
			</FieldGroup>

			<FieldGroup legend="Cardiopulmonary Reserve">
				<YesNoUnknownField
					label="Cardiopulmonary limitations"
					value={s.cardiopulmonary_limitations}
					onChange={(v) => u("cardiopulmonary_limitations", v)}
				/>
				<TextField
					label="Cardiopulmonary details"
					value={s.cardiopulmonary_details}
					onChange={(v) => u("cardiopulmonary_details", v)}
					placeholder="e.g. NYHA Class III CHF, COPD GOLD 3"
				/>
			</FieldGroup>

			<FieldGroup legend="Physician Impression">
				<SelectField
					label="Physician overall independence risk"
					value={s.physician_overall_risk}
					onChange={(v) => u("physician_overall_risk", v)}
					options={[
						{ value: "low", label: "Low risk" },
						{ value: "moderate", label: "Moderate risk" },
						{ value: "high", label: "High risk" },
						{
							value: "unsafe_independent",
							label: "Unsafe for independent living",
						},
					]}
				/>
				<TextField
					label="Reviewing physician name"
					value={s.physician_name}
					onChange={(v) => u("physician_name", v)}
					placeholder="Dr. ..."
				/>
			</FieldGroup>

			<TextareaField
				label="Physician Impression &amp; Clinical Synthesis"
				value={s.physician_impression}
				onChange={(v) => u("physician_impression", v)}
				placeholder="Summarize the clinical picture and how medical factors interact with the functional findings…"
				rows={5}
			/>

			<TextareaField
				label="Additional Physician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Any additional observations or recommendations…"
			/>
		</div>
	);
}
