"use client";

import type { ClinicalContextData } from "@/types/intake";
import {
	FieldGroup,
	YesNoField,
	YesNoUnknownField,
	NumberField,
	TextField,
	TextareaField,
	SelectField,
	NrsSlider,
} from "./fields";

type Props = {
	value: ClinicalContextData;
	onChange: (v: ClinicalContextData) => void;
};

function set<K extends keyof ClinicalContextData>(
	prev: ClinicalContextData,
	key: K,
	val: ClinicalContextData[K]
): ClinicalContextData {
	return { ...prev, [key]: val };
}

export function SectionClinicalContext({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof ClinicalContextData>(k: K, v: ClinicalContextData[K]) =>
		onChange(set(s, k, v));

	return (
		<div className="space-y-8">
			<FieldGroup legend="Demographics">
				<NumberField
					label="Age"
					value={s.age}
					onChange={(v) => u("age", v)}
					min={0}
					max={120}
					unit="years"
				/>
				<SelectField
					label="Living Situation"
					value={s.living_situation}
					onChange={(v) => u("living_situation", v)}
					options={[
						{ value: "alone", label: "Alone" },
						{ value: "with_spouse", label: "With Spouse" },
						{ value: "with_family", label: "With Family" },
						{ value: "with_caregiver", label: "With Caregiver" },
						{ value: "assisted_living", label: "Assisted Living" },
						{ value: "other", label: "Other" },
					]}
				/>
				{s.living_situation === "other" && (
					<TextField
						label="Living situation (other)"
						value={s.living_situation_other}
						onChange={(v) => u("living_situation_other", v)}
					/>
				)}
				<SelectField
					label="Home Type"
					value={s.home_type}
					onChange={(v) => u("home_type", v)}
					options={[
						{ value: "single_family", label: "Single Family" },
						{ value: "apartment", label: "Apartment" },
						{ value: "condo", label: "Condo" },
						{ value: "townhouse", label: "Townhouse" },
						{ value: "mobile_home", label: "Mobile Home" },
						{ value: "other", label: "Other" },
					]}
				/>
				{s.home_type === "other" && (
					<TextField
						label="Home type (other)"
						value={s.home_type_other}
						onChange={(v) => u("home_type_other", v)}
					/>
				)}
				<YesNoField
					label="Home has stairs"
					value={s.home_has_stairs}
					onChange={(v) => u("home_has_stairs", v)}
				/>
				<TextField
					label="Primary Caregiver"
					value={s.primary_caregiver}
					onChange={(v) => u("primary_caregiver", v)}
					placeholder="Name & relationship"
				/>
			</FieldGroup>

			<FieldGroup legend="Medical Snapshot">
				<NumberField
					label="Hospitalizations (past 12 months)"
					value={s.recent_hospitalizations_12mo}
					onChange={(v) => u("recent_hospitalizations_12mo", v)}
					min={0}
				/>
				<NumberField
					label="ER Visits (past 12 months)"
					value={s.er_visits_12mo}
					onChange={(v) => u("er_visits_12mo", v)}
					min={0}
				/>
				<NumberField
					label="Falls (past 12 months)"
					value={s.falls_past_12mo}
					onChange={(v) => u("falls_past_12mo", v)}
					min={0}
				/>
				<YesNoField
					label="Fall resulted in injury"
					value={s.fall_resulted_in_injury}
					onChange={(v) => u("fall_resulted_in_injury", v)}
				/>
				<TextField
					label="Assistive Devices"
					value={s.assistive_devices?.join(", ")}
					onChange={(v) =>
						u("assistive_devices", v ? v.split(",").map((d) => d.trim()) : [])
					}
					placeholder="cane, walker, wheelchair…"
					hint="Comma-separated"
				/>
				<TextareaField
					label="Major Diagnoses"
					value={s.major_diagnoses}
					onChange={(v) => u("major_diagnoses", v)}
					placeholder="Primary diagnoses and relevant comorbidities"
				/>
				<YesNoUnknownField
					label="Vision Impairment"
					value={s.vision_impairment}
					onChange={(v) => u("vision_impairment", v)}
				/>
				<YesNoUnknownField
					label="Hearing Impairment"
					value={s.hearing_impairment}
					onChange={(v) => u("hearing_impairment", v)}
				/>
				<NumberField
					label="Medication Count"
					value={s.medication_count}
					onChange={(v) => u("medication_count", v)}
					min={0}
				/>
				<YesNoField
					label="Pain Present"
					value={s.pain_present}
					onChange={(v) => u("pain_present", v)}
				/>
				{s.pain_present && (
					<NrsSlider
						label="Pain Severity (NRS)"
						value={s.pain_severity_nrs}
						onChange={(v) => u("pain_severity_nrs", v)}
					/>
				)}
				<SelectField
					label="Continence Status"
					value={s.continence_status}
					onChange={(v) => u("continence_status", v)}
					options={[
						{ value: "continent", label: "Continent" },
						{ value: "occasionally_incontinent", label: "Occasionally Incontinent" },
						{ value: "frequently_incontinent", label: "Frequently Incontinent" },
						{ value: "incontinent", label: "Incontinent" },
					]}
				/>
			</FieldGroup>

			<FieldGroup legend="Occupational Profile">
				<TextField
					label="Prior Level of Function"
					value={s.prior_level_of_function}
					onChange={(v) => u("prior_level_of_function", v)}
					placeholder="Previous functional baseline"
				/>
				<TextareaField
					label="Daily Routines"
					value={s.daily_routines}
					onChange={(v) => u("daily_routines", v)}
					placeholder="Typical daily activities and routines"
				/>
				<TextareaField
					label="Meaningful Activities"
					value={s.meaningful_activities}
					onChange={(v) => u("meaningful_activities", v)}
					placeholder="Activities that matter to the client"
				/>
				<YesNoField
					label="Drives Independently"
					value={s.drives_independently}
					onChange={(v) => u("drives_independently", v)}
				/>
				<TextField
					label="Community Participation"
					value={s.community_participation}
					onChange={(v) => u("community_participation", v)}
					placeholder="Social, religious, volunteer, recreational"
				/>
			</FieldGroup>

			{/* ── Payer & Urgency Context ── */}
			<FieldGroup legend="Payer & Urgency Context (for Pricing)">
				<SelectField
					label="Payer Type"
					value={s.payer_type}
					onChange={(v) => u("payer_type", v)}
					options={[
						{ value: "self_pay", label: "Self-pay" },
						{ value: "family_pay", label: "Family pays" },
						{ value: "insurance", label: "Insurance" },
						{ value: "medicare", label: "Medicare" },
						{ value: "medicaid", label: "Medicaid" },
						{ value: "mixed", label: "Mixed" },
						{ value: "unknown", label: "Unknown" },
					]}
				/>
				<SelectField
					label="Urgency Level"
					value={s.urgency_level}
					onChange={(v) => u("urgency_level", v)}
					options={[
						{ value: "planning_ahead", label: "Planning ahead" },
						{ value: "post_discharge", label: "Post-discharge" },
						{ value: "near_crisis", label: "Near crisis" },
						{ value: "crisis", label: "Crisis" },
						{ value: "unknown", label: "Unknown" },
					]}
					hint="How urgent is the need for services?"
				/>
				<TextField
					label="Insurance Type"
					value={s.insurance_type}
					onChange={(v) => u("insurance_type", v)}
					placeholder="e.g., Medicare Advantage, Long-term care policy"
				/>
				<TextField
					label="Primary Payer Name"
					value={s.primary_payer_name}
					onChange={(v) => u("primary_payer_name", v)}
					placeholder="Who is primarily responsible for payment?"
				/>
			</FieldGroup>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional clinical context observations…"
			/>
		</div>
	);
}
