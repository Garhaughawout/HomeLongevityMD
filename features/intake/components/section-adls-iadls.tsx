"use client";

import type { AdlsIadlsData } from "@/types/intake";
import { FieldGroup, AssistanceLevelField, TextareaField } from "./fields";

type Props = {
	value: AdlsIadlsData;
	onChange: (v: AdlsIadlsData) => void;
};

function set<K extends keyof AdlsIadlsData>(
	prev: AdlsIadlsData,
	key: K,
	val: AdlsIadlsData[K]
): AdlsIadlsData {
	return { ...prev, [key]: val };
}

export function SectionAdlsIadls({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof AdlsIadlsData>(k: K, v: AdlsIadlsData[K]) =>
		onChange(set(s, k, v));

	return (
		<div className="space-y-8">
			<p className="text-sm text-[color:var(--muted)]">
				Rate each activity using the assistance scale:
				<strong className="text-[color:var(--foreground)]">
					{" "}
					1 = Independent
				</strong>{" "}
				through
				<strong className="text-[color:var(--foreground)]">
					{" "}
					5 = Total assist
				</strong>
				.
			</p>

			<FieldGroup legend="Basic ADLs (Self-Care)">
				<AssistanceLevelField
					label="Bathing"
					value={s.bathing}
					onChange={(v) => u("bathing", v)}
				/>
				<AssistanceLevelField
					label="Dressing"
					value={s.dressing}
					onChange={(v) => u("dressing", v)}
				/>
				<AssistanceLevelField
					label="Grooming"
					value={s.grooming}
					onChange={(v) => u("grooming", v)}
				/>
				<AssistanceLevelField
					label="Toileting"
					value={s.toileting}
					onChange={(v) => u("toileting", v)}
				/>
				<AssistanceLevelField
					label="Transferring"
					value={s.transferring}
					onChange={(v) => u("transferring", v)}
				/>
				<AssistanceLevelField
					label="Continence"
					value={s.continence}
					onChange={(v) => u("continence", v)}
				/>
				<AssistanceLevelField
					label="Feeding"
					value={s.feeding}
					onChange={(v) => u("feeding", v)}
				/>
			</FieldGroup>

			<FieldGroup legend="Instrumental ADLs">
				<AssistanceLevelField
					label="Meal preparation"
					value={s.meal_preparation}
					onChange={(v) => u("meal_preparation", v)}
				/>
				<AssistanceLevelField
					label="Medication management"
					value={s.medication_management}
					onChange={(v) => u("medication_management", v)}
				/>
				<AssistanceLevelField
					label="Housekeeping"
					value={s.housekeeping}
					onChange={(v) => u("housekeeping", v)}
				/>
				<AssistanceLevelField
					label="Laundry"
					value={s.laundry}
					onChange={(v) => u("laundry", v)}
				/>
				<AssistanceLevelField
					label="Transportation"
					value={s.transportation}
					onChange={(v) => u("transportation", v)}
				/>
				<AssistanceLevelField
					label="Shopping"
					value={s.shopping}
					onChange={(v) => u("shopping", v)}
				/>
				<AssistanceLevelField
					label="Finances"
					value={s.finances}
					onChange={(v) => u("finances", v)}
				/>
				<AssistanceLevelField
					label="Telephone use"
					value={s.telephone_use}
					onChange={(v) => u("telephone_use", v)}
				/>
			</FieldGroup>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional observations about functional independence…"
			/>
		</div>
	);
}
