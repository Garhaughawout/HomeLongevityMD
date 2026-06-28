"use client";

import { useEffect, useMemo } from "react";
import type { FrailScaleData } from "@/types/intake";
import { YesNoField, SelectField, TextareaField, InfoBanner } from "./fields";

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

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm">
				<p className="text-[color:var(--muted)]">
					<span className="font-medium text-[color:var(--foreground)]">
						FRAIL Scale
					</span>{" "}
					— 5-item frailty screening. Score: 0 = robust, 1–2 = pre-frail,
					3+ = frail.
				</p>
			</div>

			{/* F — Fatigue */}
			<fieldset className="space-y-3">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					F — Fatigue
				</legend>
				<p className="text-sm text-[color:var(--foreground)]">
					How much of the time during the past 4 weeks did you feel
					tired?
				</p>
				<SelectField
					label="Response"
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
				<p className="text-xs text-[color:var(--muted)]">
					Score: {fatigueScore} (all/most of the time = 1)
				</p>
			</fieldset>

			{/* R — Resistance */}
			<fieldset className="space-y-3">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					R — Resistance
				</legend>
				<p className="text-sm text-[color:var(--foreground)]">
					By yourself and without using any special equipment, how much
					difficulty do you have walking 10 steps alone without
					resting?
				</p>
				<SelectField
					label="Response"
					value={s.resistance_response}
					onChange={(v) => u("resistance_response", v)}
					options={[
						{ value: "no_difficulty", label: "No difficulty" },
						{ value: "some_difficulty", label: "Some difficulty" },
						{ value: "much_difficulty", label: "Much difficulty" },
						{ value: "unable", label: "Unable" },
					]}
				/>
				<p className="text-xs text-[color:var(--muted)]">
					Score: {resistanceScore} (some/much/unable = 1)
				</p>
			</fieldset>

			{/* A — Ambulation */}
			<fieldset className="space-y-3">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					A — Ambulation
				</legend>
				<p className="text-sm text-[color:var(--foreground)]">
					By yourself and without using any special equipment, how much
					difficulty do you have walking several hundred yards alone
					without resting?
				</p>
				<SelectField
					label="Response"
					value={s.ambulation_response}
					onChange={(v) => u("ambulation_response", v)}
					options={[
						{ value: "no_difficulty", label: "No difficulty" },
						{ value: "some_difficulty", label: "Some difficulty" },
						{ value: "much_difficulty", label: "Much difficulty" },
						{ value: "unable", label: "Unable" },
					]}
				/>
				<p className="text-xs text-[color:var(--muted)]">
					Score: {ambulationScore} (some/much/unable = 1)
				</p>
			</fieldset>

			{/* I — Illnesses */}
			<fieldset className="space-y-3">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					I — Illnesses
				</legend>
				<p className="text-sm text-[color:var(--foreground)]">
					Select all conditions the client has been diagnosed with:
				</p>
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
					{([
						["hypertension", "Hypertension"],
						["diabetes", "Diabetes"],
						["cancer", "Cancer"],
						["chronic_lung_disease", "Chronic Lung Disease"],
						["heart_attack", "Heart Attack"],
						["congestive_heart_failure", "Congestive Heart Failure"],
						["angina", "Angina"],
						["asthma", "Asthma"],
						["arthritis", "Arthritis"],
						["stroke", "Stroke"],
						["kidney_disease", "Kidney Disease"],
					] as const).map(([key, label]) => (
						<label
							key={key}
							className="flex cursor-pointer items-center gap-2 text-sm"
						>
							<input
								type="checkbox"
								checked={s.illnesses?.[key] ?? false}
								onChange={(e) =>
									u("illnesses", {
										...s.illnesses,
										[key]: e.target.checked,
									})
								}
								className="accent-[color:var(--accent)]"
							/>
							{label}
						</label>
					))}
				</div>
				<p className="text-xs text-[color:var(--muted)]">
					Count: {illnessCount} | Score: {illnessScore} (≥5 illnesses = 1)
				</p>
			</fieldset>

			{/* L — Loss of Weight */}
			<fieldset className="space-y-3">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					L — Loss of Weight
				</legend>
				<p className="text-sm text-[color:var(--foreground)]">
					In the past year, have you lost 10 pounds or more without
					trying?
				</p>
				<YesNoField
					label="Unintentional weight loss ≥ 10 lbs"
					value={s.weight_loss_response}
					onChange={(v) => u("weight_loss_response", v)}
				/>
				<p className="text-xs text-[color:var(--muted)]">
					Score: {weightLossScore} (yes = 1)
				</p>
			</fieldset>

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
						<strong>
							Frailty &amp; Medical Pathway (Tier 2) triggered.
						</strong>
					</>
				)}
			</InfoBanner>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional frailty observations…"
			/>
		</div>
	);
}
