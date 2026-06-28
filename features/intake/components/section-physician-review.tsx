"use client";

import type { PhysicianReviewData } from "@/types/intake";
import { YesNoUnknownField, YesNoField, TextField, TextareaField, SelectField, FieldGroup } from "./fields";

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
	const u = <K extends keyof PhysicianReviewData>(k: K, v: PhysicianReviewData[K]) =>
		onChange(set(s, k, v));

	return (
		<div className="space-y-8">
			<div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm">
				<p className="text-[color:var(--muted)]">
					<span className="font-medium text-[color:var(--foreground)]">
						Physician Review — Tier 3
					</span>{" "}
					— Clinical synthesis of all assessment findings. The
					physician&rsquo;s overall risk can only{" "}
					<strong>elevate</strong> the computed risk category, never
					reduce it.
				</p>
			</div>

			<FieldGroup legend="Synthesis from All Tiers">
				<SelectField
					label="Frailty Level"
					value={s.frailty_level}
					onChange={(v) => u("frailty_level", v)}
					options={[
						{ value: "robust", label: "Robust" },
						{ value: "pre_frail", label: "Pre-Frail" },
						{ value: "frail", label: "Frail" },
					]}
				/>
				<SelectField
					label="Cognitive Status"
					value={s.cognitive_status}
					onChange={(v) => u("cognitive_status", v)}
					options={[
						{ value: "normal", label: "Normal" },
						{ value: "mild_impairment", label: "Mild Impairment" },
						{ value: "moderate_impairment", label: "Moderate Impairment" },
						{ value: "severe_impairment", label: "Severe Impairment" },
					]}
				/>
				<SelectField
					label="Mobility Status"
					value={s.mobility_status}
					onChange={(v) => u("mobility_status", v)}
					options={[
						{ value: "independent", label: "Independent" },
						{ value: "assisted", label: "Assisted" },
						{ value: "limited", label: "Limited" },
						{ value: "non_ambulatory", label: "Non-Ambulatory" },
					]}
				/>
			</FieldGroup>

			<FieldGroup legend="Clinical Synthesis">
				<SelectField
					label="Chronic Disease Burden"
					value={s.chronic_disease_burden}
					onChange={(v) => u("chronic_disease_burden", v)}
					options={[
						{ value: "low", label: "Low" },
						{ value: "moderate", label: "Moderate" },
						{ value: "high", label: "High" },
					]}
				/>
				<TextareaField
					label="Active Chronic Conditions"
					value={s.active_chronic_conditions}
					onChange={(v) => u("active_chronic_conditions", v)}
					placeholder="List active chronic conditions and management status"
				/>
				<SelectField
					label="Readmission Risk"
					value={s.readmission_risk}
					onChange={(v) => u("readmission_risk", v)}
					options={[
						{ value: "low", label: "Low" },
						{ value: "moderate", label: "Moderate" },
						{ value: "high", label: "High" },
					]}
				/>
			</FieldGroup>

			<FieldGroup legend="Pain & Function">
				<YesNoField
					label="Pain limitations present?"
					value={s.pain_limitations_present}
					onChange={(v) => u("pain_limitations_present", v)}
				/>
				{s.pain_limitations_present && (
					<TextField
						label="Pain Description"
						value={s.pain_description}
						onChange={(v) => u("pain_description", v)}
						placeholder="Location, character, aggravating/relieving factors"
					/>
				)}
			</FieldGroup>

			<FieldGroup legend="Neurologic">
				<YesNoField
					label="Progressive neurologic disease?"
					value={s.progressive_neurologic_disease}
					onChange={(v) => u("progressive_neurologic_disease", v)}
				/>
				{s.progressive_neurologic_disease && (
					<TextField
						label="Neurologic Diagnosis"
						value={s.neurologic_diagnosis}
						onChange={(v) => u("neurologic_diagnosis", v)}
						placeholder="Diagnosis and progression status"
					/>
				)}
			</FieldGroup>

			<FieldGroup legend="Cardiopulmonary">
				<YesNoUnknownField
					label="Cardiopulmonary limitations?"
					value={s.cardiopulmonary_limitations}
					onChange={(v) => u("cardiopulmonary_limitations", v)}
				/>
				{s.cardiopulmonary_limitations === "yes" && (
					<TextField
						label="Cardiopulmonary Details"
						value={s.cardiopulmonary_details}
						onChange={(v) => u("cardiopulmonary_details", v)}
						placeholder="Exercise tolerance, oxygen needs, dyspnea"
					/>
				)}
			</FieldGroup>

			<FieldGroup legend="Physician Impression">
				<TextareaField
					label="Physician Impression"
					value={s.physician_impression}
					onChange={(v) => u("physician_impression", v)}
					placeholder="Overall clinical impression, key findings, recommendations…"
					rows={5}
				/>
				<SelectField
					label="Physician Overall Risk"
					value={s.physician_overall_risk}
					onChange={(v) => u("physician_overall_risk", v)}
					options={[
						{ value: "low", label: "Low" },
						{ value: "moderate", label: "Moderate" },
						{ value: "high", label: "High" },
						{ value: "very_high", label: "Very High" },
						{ value: "unsafe_independent", label: "Unsafe for Independent Living" },
					]}
					hint="Can only elevate the computed risk, never reduce it."
				/>
				<TextField
					label="Physician Name"
					value={s.physician_name}
					onChange={(v) => u("physician_name", v)}
					placeholder="Dr. Name, credentials"
				/>
				<TextField
					label="Review Date"
					value={s.physician_reviewed_at}
					onChange={(v) => u("physician_reviewed_at", v)}
					placeholder="ISO datetime (auto-filled on submit)"
				/>
			</FieldGroup>

			<TextareaField
				label="Additional Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Any additional physician notes…"
			/>
		</div>
	);
}
