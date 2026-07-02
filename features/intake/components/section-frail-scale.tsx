"use client";

import { useEffect, useMemo } from "react";
import type { FrailScaleData } from "@/types/intake";
import {
	FieldGroup,
	YesNoField,
	ChipSelectField,
	CheckboxGroup,
	TextareaField,
	InfoBanner,
} from "./fields";

type Props = {
	value: FrailScaleData;
	onChange: (v: FrailScaleData) => void;
};

function set<K extends keyof FrailScaleData>(
	prev: FrailScaleData,
	key: K,
	val: FrailScaleData[K]
): FrailScaleData {
	return { ...prev, [key]: val };
}

const ILLNESS_OPTIONS = [
	{ value: "hypertension", label: "Hypertension" },
	{ value: "diabetes", label: "Diabetes" },
	{ value: "cancer", label: "Cancer" },
	{ value: "chronic_lung_disease", label: "Chronic lung disease" },
	{ value: "heart_attack", label: "Heart attack" },
	{ value: "congestive_heart_failure", label: "Congestive heart failure" },
	{ value: "angina", label: "Angina" },
	{ value: "asthma", label: "Asthma" },
	{ value: "arthritis", label: "Arthritis" },
	{ value: "stroke", label: "Stroke" },
	{ value: "kidney_disease", label: "Kidney disease" },
] as const;

type IllnessKey = (typeof ILLNESS_OPTIONS)[number]["value"];

export function SectionFrailScale({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof FrailScaleData>(k: K, v: FrailScaleData[K]) =>
		onChange(set(s, k, v));

	// Auto-compute scores
	const fatigueScore: 0 | 1 = useMemo(() => {
		if (!s.fatigue_response) return 0;
		return s.fatigue_response === "all_the_time" || s.fatigue_response === "most_of_the_time" ? 1 : 0;
	}, [s.fatigue_response]);

	const resistanceScore: 0 | 1 = useMemo(() => {
		if (!s.resistance_response) return 0;
		return s.resistance_response === "no_difficulty" ? 0 : 1;
	}, [s.resistance_response]);

	const ambulationScore: 0 | 1 = useMemo(() => {
		if (!s.ambulation_response) return 0;
		return s.ambulation_response === "no_difficulty" ? 0 : 1;
	}, [s.ambulation_response]);

	const illnessCount = useMemo(() => {
		if (!s.illnesses) return 0;
		return Object.values(s.illnesses).filter(Boolean).length;
	}, [s.illnesses]);

	const illnessScore: 0 | 1 = illnessCount >= 5 ? 1 : 0;

	const weightLossScore: 0 | 1 = s.weight_loss_response ? 1 : 0;

	const totalScore = fatigueScore + resistanceScore + ambulationScore + illnessScore + weightLossScore;

	const frailtyCategory: FrailScaleData["frailty_category"] = useMemo(() => {
		if (totalScore === 0) return "robust";
		if (totalScore <= 2) return "pre_frail";
		return "frail";
	}, [totalScore]);

	// Sync computed values
	useEffect(() => {
		onChange({
			...s,
			fatigue_score: fatigueScore,
			resistance_score: resistanceScore,
			ambulation_score: ambulationScore,
			illness_count: illnessCount,
			illness_score: illnessScore,
			weight_loss_score: weightLossScore,
			total_score: totalScore,
			frailty_category: frailtyCategory,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fatigueScore, resistanceScore, ambulationScore, illnessCount, weightLossScore, totalScore, frailtyCategory]);

	const selectedIllnesses = ILLNESS_OPTIONS
		.filter((o) => s.illnesses?.[o.value])
		.map((o) => o.value as string);

	return (
		<div className="space-y-5">
			<InfoBanner variant="info">
				<strong>FRAIL Scale</strong> — 5-item frailty screen, 1 point per
				positive item. 0 = robust, 1–2 = pre-frail, 3+ = frail.
			</InfoBanner>

			<FieldGroup legend="FRAIL screening questions" badge={`${totalScore}/5`}>
				<ChipSelectField
					label="F — How much of the time during the past 4 weeks did you feel tired?"
					hint={`All or most of the time scores 1 point · current: ${fatigueScore}`}
					value={s.fatigue_response}
					onChange={(v) => u("fatigue_response", v)}
					options={[
						{ value: "all_the_time", label: "All of the time" },
						{ value: "most_of_the_time", label: "Most of the time" },
						{ value: "some_of_the_time", label: "Some of the time" },
						{ value: "a_little_of_the_time", label: "A little of the time" },
						{ value: "none_of_the_time", label: "None of the time" },
					]}
				/>
				<ChipSelectField
					label="R — By yourself and without special equipment, how much difficulty do you have walking up 10 steps without resting?"
					hint={`Any difficulty scores 1 point · current: ${resistanceScore}`}
					value={s.resistance_response}
					onChange={(v) => u("resistance_response", v)}
					options={[
						{ value: "no_difficulty", label: "No difficulty" },
						{ value: "some_difficulty", label: "Some difficulty" },
						{ value: "much_difficulty", label: "Much difficulty" },
						{ value: "unable", label: "Unable" },
					]}
				/>
				<ChipSelectField
					label="A — By yourself and without special equipment, how much difficulty do you have walking several hundred yards without resting?"
					hint={`Any difficulty scores 1 point · current: ${ambulationScore}`}
					value={s.ambulation_response}
					onChange={(v) => u("ambulation_response", v)}
					options={[
						{ value: "no_difficulty", label: "No difficulty" },
						{ value: "some_difficulty", label: "Some difficulty" },
						{ value: "much_difficulty", label: "Much difficulty" },
						{ value: "unable", label: "Unable" },
					]}
				/>
				<CheckboxGroup
					label="I — Which of these conditions has the client been diagnosed with?"
					hint={`${illnessCount} selected · 5 or more scores 1 point · current: ${illnessScore}`}
					options={[...ILLNESS_OPTIONS]}
					values={selectedIllnesses}
					onChange={(list) =>
						u(
							"illnesses",
							Object.fromEntries(
								ILLNESS_OPTIONS.map((o) => [o.value, list.includes(o.value)])
							) as Record<IllnessKey, boolean>
						)
					}
				/>
				<YesNoField
					label="L — In the past year, have you lost 10 pounds or more without trying?"
					hint={`Yes scores 1 point · current: ${weightLossScore}`}
					value={s.weight_loss_response}
					onChange={(v) => u("weight_loss_response", v)}
				/>
			</FieldGroup>

			<InfoBanner
				variant={totalScore >= 3 ? "warning" : totalScore >= 1 ? "info" : "success"}
			>
				<strong>FRAIL Total Score: {totalScore}/5</strong> —{" "}
				{frailtyCategory === "robust" && "Robust (no frailty)"}
				{frailtyCategory === "pre_frail" && "Pre-frail (early signs)"}
				{frailtyCategory === "frail" && "Frail (significant risk)"}
				{totalScore >= 3 && (
					<>
						{" — "}
						<strong>Frailty &amp; Medical Pathway (Tier 2) triggered.</strong>
					</>
				)}
			</InfoBanner>

			<TextareaField
				label="Clinician notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional frailty observations…"
			/>
		</div>
	);
}
