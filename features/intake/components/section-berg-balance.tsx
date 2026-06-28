"use client";

import { useMemo } from "react";
import type { BergBalanceData } from "@/types/intake";
import { NumberField, TextareaField, InfoBanner } from "./fields";

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
	hint?: string;
}

const BERG_ITEMS: BergItem[] = [
	{ key: "sitting_to_standing", label: "Sitting to Standing" },
	{ key: "standing_to_sitting", label: "Standing to Sitting" },
	{ key: "transfers", label: "Transfers" },
	{ key: "standing_unsupported", label: "Standing Unsupported" },
	{ key: "sitting_unsupported", label: "Sitting Unsupported" },
	{ key: "eyes_closed_standing", label: "Standing with Eyes Closed" },
	{ key: "feet_together_standing", label: "Standing with Feet Together" },
	{ key: "reaching_forward", label: "Reaching Forward" },
	{ key: "retrieving_object", label: "Retrieving Object from Floor" },
	{ key: "turning_behind", label: "Turning to Look Behind" },
	{ key: "alternate_foot_stool", label: "Alternate Foot on Stool" },
	{ key: "feet_tandem", label: "Standing in Tandem Position" },
	{ key: "single_leg_stand", label: "Standing on One Leg" },
];

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

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm">
				<p className="text-[color:var(--muted)]">
					<span className="font-medium text-[color:var(--foreground)]">
						Berg Balance Scale
					</span>{" "}
					— 14-item balance assessment. Score each item 0–4:
					0 = cannot perform, 4 = independent. Maximum: 56.{" "}
					<strong>&lt; 45 = elevated fall risk.</strong>
				</p>
			</div>

			<fieldset className="space-y-4">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					14 Balance Tasks
				</legend>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{BERG_ITEMS.map((item) => (
						<NumberField
							key={item.key}
							label={item.label}
							value={s[item.key] as number | undefined}
							onChange={(v) => u(item.key, v as BergBalanceData[typeof item.key])}
							min={0}
							max={4}
							step={1}
						/>
					))}
				</div>
			</fieldset>

			<InfoBanner variant={totalScore < 45 ? "warning" : "success"}>
				<strong>Berg Balance Total: {totalScore}/56</strong> —{" "}
				{totalScore >= 45
					? "Within normal range"
					: "Elevated fall risk detected"}
			</InfoBanner>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional balance and mobility observations…"
			/>
		</div>
	);
}
