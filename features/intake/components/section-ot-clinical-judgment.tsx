"use client";

import type { OtClinicalJudgmentData } from "@/types/intake";
import { TextareaField, SelectField, CheckboxGroup, InfoBanner } from "./fields";

type Props = {
	value: OtClinicalJudgmentData;
	onChange: (v: OtClinicalJudgmentData) => void;
};

function set<K extends keyof OtClinicalJudgmentData>(
	prev: OtClinicalJudgmentData,
	key: K,
	val: OtClinicalJudgmentData[K]
): OtClinicalJudgmentData {
	return { ...prev, [key]: val };
}

const OBSERVATION_OPTIONS = [
	{ value: "poor_insight", label: "Poor Insight" },
	{ value: "unsafe_transfers", label: "Unsafe Transfers" },
	{ value: "fatigue_during_mobility", label: "Fatigue During Mobility" },
	{ value: "poor_sequencing", label: "Poor Sequencing" },
	{ value: "hoarding_clutter", label: "Hoarding / Clutter" },
	{ value: "impulsivity", label: "Impulsivity" },
	{ value: "medication_noncompliance", label: "Medication Noncompliance" },
	{ value: "behavioral_concerns", label: "Behavioral Concerns" },
	{ value: "wandering_risk", label: "Wandering Risk" },
	{ value: "poor_judgment", label: "Poor Judgment" },
	{ value: "limited_emergency_response", label: "Limited Emergency Response" },
	{ value: "poor_safety_awareness", label: "Poor Safety Awareness" },
];

export function SectionOtClinicalJudgment({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof OtClinicalJudgmentData>(k: K, v: OtClinicalJudgmentData[K]) =>
		onChange(set(s, k, v));

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm">
				<p className="text-[color:var(--muted)]">
					<span className="font-medium text-[color:var(--foreground)]">
						OT Clinical Judgment
					</span>{" "}
					— Qualitative observations from the assessing therapist that
					can adjust the computed risk level. Select all that apply.
				</p>
			</div>

			<CheckboxGroup
				label="Clinical Observations"
				options={OBSERVATION_OPTIONS}
				values={s.observations}
				onChange={(v) => u("observations", v)}
				hint="Select all observed concerns. These can elevate the computed risk category."
			/>

			<SelectField
				label="Risk Adjustment"
				value={s.risk_adjustment}
				onChange={(v) => u("risk_adjustment", v)}
				options={[
					{ value: "none", label: "None — no adjustment" },
					{ value: "elevate", label: "Elevate — increase risk by one level" },
					{ value: "significantly_elevate", label: "Significantly Elevate — increase risk by two levels" },
				]}
				hint="Use clinical judgment to adjust the computed risk. This modifies the domain score, not a direct category override."
			/>

			{(s.observations?.length ?? 0) > 0 && (
				<InfoBanner variant="info">
					<strong>{s.observations?.length}</strong> observation(s)
					selected.{" "}
					{s.risk_adjustment && s.risk_adjustment !== "none" && (
						<>Risk adjustment: <strong>{s.risk_adjustment.replace(/_/g, " ")}</strong>.</>
					)}
				</InfoBanner>
			)}

			<TextareaField
				label="Clinical Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Detailed clinical reasoning, qualitative observations, context for risk adjustment…"
			/>
		</div>
	);
}
