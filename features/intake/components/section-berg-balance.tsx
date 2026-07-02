"use client";

import { useMemo } from "react";
import type { BergBalanceData } from "@/types/intake";
import {
	FieldGroup,
	FieldRow,
	SegmentedControl,
	TextareaField,
	InfoBanner,
} from "./fields";

type Props = {
	value: BergBalanceData;
	onChange: (v: BergBalanceData) => void;
};

function set<K extends keyof BergBalanceData>(
	prev: BergBalanceData,
	key: K,
	val: BergBalanceData[K]
): BergBalanceData {
	return { ...prev, [key]: val };
}

interface BergItem {
	key: keyof BergBalanceData;
	label: string;
}

const BERG_ITEMS: BergItem[] = [
	{ key: "sitting_to_standing", label: "Sitting to standing" },
	{ key: "standing_unsupported", label: "Standing unsupported" },
	{ key: "sitting_unsupported", label: "Sitting unsupported" },
	{ key: "standing_to_sitting", label: "Standing to sitting" },
	{ key: "transfers", label: "Transfers" },
	{ key: "eyes_closed_standing", label: "Standing with eyes closed" },
	{ key: "feet_together_standing", label: "Standing with feet together" },
	{ key: "reaching_forward", label: "Reaching forward with outstretched arm" },
	{ key: "retrieving_object", label: "Retrieving object from the floor" },
	{ key: "turning_behind", label: "Turning to look behind" },
	{ key: "turning_360", label: "Turning 360 degrees" },
	{ key: "alternate_foot_stool", label: "Placing alternate foot on stool" },
	{ key: "feet_tandem", label: "Standing with one foot in front (tandem)" },
	{ key: "single_leg_stand", label: "Standing on one leg" },
];

const SCORE_OPTIONS = [0, 1, 2, 3, 4].map((n) => ({
	value: n,
	label: String(n),
}));

export function SectionBergBalance({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof BergBalanceData>(k: K, v: BergBalanceData[K]) =>
		onChange(set(s, k, v));

	const totalScore = useMemo(() => {
		return BERG_ITEMS.reduce((sum, item) => {
			const val = s[item.key] as number | undefined;
			return sum + (val ?? 0);
		}, 0);
	}, [s]);

	const answeredCount = BERG_ITEMS.filter(
		(item) => s[item.key] !== undefined
	).length;

	return (
		<div className="space-y-5">
			<InfoBanner variant="info">
				<strong>Berg Balance Scale</strong> — 14 balance tasks scored 0–4
				(0 = cannot perform, 4 = independent). Maximum 56;{" "}
				<strong>below 45 indicates elevated fall risk.</strong>
			</InfoBanner>

			<FieldGroup
				legend="Balance tasks"
				description={`${answeredCount} of ${BERG_ITEMS.length} tasks scored`}
				badge={`${totalScore}/56`}
			>
				{BERG_ITEMS.map((item) => (
					<FieldRow key={item.key} label={item.label}>
						<SegmentedControl
							ariaLabel={item.label}
							value={s[item.key] as number | undefined}
							onChange={(v) =>
								u(item.key, v as BergBalanceData[typeof item.key])
							}
							options={SCORE_OPTIONS}
						/>
					</FieldRow>
				))}
			</FieldGroup>

			<InfoBanner variant={totalScore < 45 ? "warning" : "success"}>
				<strong>Berg Balance Total: {totalScore}/56</strong> —{" "}
				{totalScore >= 45
					? "Within normal range"
					: "Elevated fall risk detected"}
			</InfoBanner>

			<TextareaField
				label="Clinician notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional balance and mobility observations…"
			/>
		</div>
	);
}
