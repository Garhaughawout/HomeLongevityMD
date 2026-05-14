"use client";

import type { CaregiverSupportData } from "@/types/intake";
import {
	FieldGroup,
	YesNoUnknownField,
	YesNoField,
	SelectField,
	NumberField,
	TextField,
	TextareaField,
} from "./fields";

type Props = {
	value: CaregiverSupportData;
	onChange: (v: CaregiverSupportData) => void;
};

function set<K extends keyof CaregiverSupportData>(
	prev: CaregiverSupportData,
	key: K,
	val: CaregiverSupportData[K]
): CaregiverSupportData {
	return { ...prev, [key]: val };
}

export function SectionCaregiverSupport({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof CaregiverSupportData>(
		k: K,
		v: CaregiverSupportData[K]
	) => onChange(set(s, k, v));

	return (
		<div className="space-y-8">
			<FieldGroup legend="Family &amp; Informal Support">
				<YesNoField
					label="Has informal caregiver"
					value={s.has_informal_caregiver}
					onChange={(v) => u("has_informal_caregiver", v)}
				/>
				<SelectField
					label="Caregiver relationship"
					value={s.caregiver_relationship}
					onChange={(v) => u("caregiver_relationship", v)}
					options={[
						{ value: "spouse", label: "Spouse / Partner" },
						{ value: "child", label: "Child" },
						{ value: "sibling", label: "Sibling" },
						{ value: "friend", label: "Friend" },
						{ value: "neighbor", label: "Neighbor" },
						{ value: "other", label: "Other" },
					]}
				/>
				{s.caregiver_relationship === "other" && (
					<TextField
						label="Describe relationship"
						value={s.caregiver_relationship_other}
						onChange={(v) => u("caregiver_relationship_other", v)}
					/>
				)}
				<NumberField
					label="Caregiver hours per week"
					value={s.caregiver_hours_per_week}
					onChange={(v) => u("caregiver_hours_per_week", v)}
					min={0}
					unit="hrs/wk"
				/>
				<YesNoField
					label="Caregiver lives with client"
					value={s.caregiver_lives_with_client}
					onChange={(v) => u("caregiver_lives_with_client", v)}
				/>
				<YesNoField
					label="Daily check-in available"
					value={s.daily_check_in_available}
					onChange={(v) => u("daily_check_in_available", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Paid &amp; Formal Caregivers">
				<YesNoField
					label="Has home health aide"
					value={s.has_home_health_aide}
					onChange={(v) => u("has_home_health_aide", v)}
				/>
				{s.has_home_health_aide && (
					<NumberField
						label="Aide hours per week"
						value={s.home_health_aide_hours_per_week}
						onChange={(v) =>
							u("home_health_aide_hours_per_week", v)
						}
						min={0}
						unit="hrs/wk"
					/>
				)}
				<TextField
					label="Other formal services"
					value={s.other_formal_services}
					onChange={(v) => u("other_formal_services", v)}
					placeholder="e.g. adult day program, visiting nurse"
					hint="List any additional professional services"
				/>
			</FieldGroup>

			<FieldGroup legend="Transportation Support">
				<YesNoField
					label="Client drives independently"
					value={s.client_drives_independently}
					onChange={(v) => u("client_drives_independently", v)}
				/>
				<YesNoUnknownField
					label="Transportation support available"
					value={s.transportation_support_available}
					onChange={(v) => u("transportation_support_available", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Caregiver Wellness">
				<YesNoUnknownField
					label="Caregiver reports burnout"
					value={s.caregiver_reports_burnout}
					onChange={(v) => u("caregiver_reports_burnout", v)}
				/>
				<YesNoField
					label="Caregiver has health limitations"
					value={s.caregiver_health_limitations}
					onChange={(v) => u("caregiver_health_limitations", v)}
				/>
				<TextField
					label="Caregiver burden concerns"
					value={s.caregiver_burden_concerns}
					onChange={(v) => u("caregiver_burden_concerns", v)}
					placeholder="Describe any identified concerns"
					hint="Financial stress, physical limitations, emotional strain, etc."
				/>
			</FieldGroup>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional observations about caregiver and support structure…"
			/>
		</div>
	);
}
