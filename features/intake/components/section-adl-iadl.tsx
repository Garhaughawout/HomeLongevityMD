"use client";

import { useEffect, useMemo } from "react";
import type { AdlIadlData } from "@/types/intake";
import { IndependenceLevelField, TextareaField, InfoBanner, FieldGroup } from "./fields";

type Props = {
	value: AdlIadlData;
	onChange: (v: AdlIadlData) => void;
};

function set<K extends keyof AdlIadlData>(
	prev: AdlIadlData,
	key: K,
	val: AdlIadlData[K]
): AdlIadlData {
	return { ...prev, [key]: val };
}

export function SectionAdlIadl({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof AdlIadlData>(k: K, v: AdlIadlData[K]) =>
		onChange(set(s, k, v));

	// Auto-compute Katz ADL score (0–6): 1 = independent, 0 = needs help
	const katzScore = useMemo(() => {
		const items = [s.bathing, s.dressing, s.toileting, s.transferring, s.feeding, s.continence];
		return items.reduce((sum, v) => sum + (v === "independent" ? 1 : 0), 0);
	}, [s.bathing, s.dressing, s.toileting, s.transferring, s.feeding, s.continence]);

	// Auto-compute Lawton IADL score (0–8): 1 = independent, 0 = needs help
	const lawtonScore = useMemo(() => {
		const items = [
			s.telephone_use,
			s.shopping,
			s.food_preparation,
			s.housekeeping,
			s.laundry,
			s.transportation,
			s.medication_management,
			s.finances,
		];
		return items.reduce((sum, v) => sum + (v === "independent" ? 1 : 0), 0);
	}, [s.telephone_use, s.shopping, s.food_preparation, s.housekeeping, s.laundry, s.transportation, s.medication_management, s.finances]);

	// Sync computed scores
	useEffect(() => {
		onChange({ ...s, katz_score: katzScore, lawton_score: lawtonScore });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [katzScore, lawtonScore]);

	return (
		<div className="space-y-5">
			<InfoBanner variant="info">
				<strong>ADL/IADL Assessment</strong> — Katz ADL (6 items, 0–6) +
				Lawton IADL (8 items, 0–8). Higher = more independent.
			</InfoBanner>

			{/* Katz ADL */}
			<FieldGroup legend="Katz ADL — Basic Activities of Daily Living">
				<IndependenceLevelField
					label="Bathing"
					value={s.bathing}
					onChange={(v) => u("bathing", v)}
				/>
				<IndependenceLevelField
					label="Dressing"
					value={s.dressing}
					onChange={(v) => u("dressing", v)}
				/>
				<IndependenceLevelField
					label="Toileting"
					value={s.toileting}
					onChange={(v) => u("toileting", v)}
				/>
				<IndependenceLevelField
					label="Transferring"
					value={s.transferring}
					onChange={(v) => u("transferring", v)}
				/>
				<IndependenceLevelField
					label="Feeding"
					value={s.feeding}
					onChange={(v) => u("feeding", v)}
				/>
				<IndependenceLevelField
					label="Continence"
					value={s.continence}
					onChange={(v) => u("continence", v)}
				/>
			</FieldGroup>

			<InfoBanner variant={katzScore <= 2 ? "warning" : "info"}>
				<strong>Katz ADL Score: {katzScore}/6</strong> —{" "}
				{katzScore === 6 && "Independent"}
				{katzScore >= 3 && katzScore <= 5 && "Partially dependent"}
				{katzScore <= 2 && "Significant dependency"}
			</InfoBanner>

			{/* Lawton IADL */}
			<FieldGroup legend="Lawton IADL — Instrumental Activities of Daily Living">
				<IndependenceLevelField
					label="Telephone Use"
					value={s.telephone_use}
					onChange={(v) => u("telephone_use", v)}
				/>
				<IndependenceLevelField
					label="Shopping"
					value={s.shopping}
					onChange={(v) => u("shopping", v)}
				/>
				<IndependenceLevelField
					label="Food Preparation"
					value={s.food_preparation}
					onChange={(v) => u("food_preparation", v)}
				/>
				<IndependenceLevelField
					label="Housekeeping"
					value={s.housekeeping}
					onChange={(v) => u("housekeeping", v)}
				/>
				<IndependenceLevelField
					label="Laundry"
					value={s.laundry}
					onChange={(v) => u("laundry", v)}
				/>
				<IndependenceLevelField
					label="Transportation"
					value={s.transportation}
					onChange={(v) => u("transportation", v)}
				/>
				<IndependenceLevelField
					label="Medication Management"
					value={s.medication_management}
					onChange={(v) => u("medication_management", v)}
				/>
				<IndependenceLevelField
					label="Finances"
					value={s.finances}
					onChange={(v) => u("finances", v)}
				/>
			</FieldGroup>

			<InfoBanner variant={lawtonScore <= 4 ? "warning" : "info"}>
				<strong>Lawton IADL Score: {lawtonScore}/8</strong> —{" "}
				{lawtonScore >= 7 && "Independent"}
				{lawtonScore >= 4 && lawtonScore <= 6 && "Some assistance needed"}
				{lawtonScore <= 3 && "Significant assistance needed"}
			</InfoBanner>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional ADL/IADL observations…"
			/>
		</div>
	);
}
