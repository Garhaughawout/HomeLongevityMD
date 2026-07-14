"use client";

import { useEffect } from "react";
import type { SlumsData } from "@/types/intake";
import {
	FieldGroup,
	FieldRow,
	SegmentedControl,
	ChipSelectField,
	TextareaField,
	InfoBanner,
} from "./fields";

export const SLUMS_OFFICIAL_URL =
	"https://www.slu.edu/medicine/internal-medicine/geriatric-medicine/aging-successfully/-pdf/slums-form.pdf";

type Props = {
	value: SlumsData;
	onChange: (v: SlumsData) => void;
};

// ── Answer detection & interpretation ─────────────────────────────────────────
// Exported so the wizard can distinguish a scored SLUMS from an untouched one —
// the Tier 2 cognitive trigger must never fire off an empty section.

const ITEM_KEYS = [
	"day_of_week", "year", "state",
	"math_spent", "math_left",
	"animal_score",
	"recall_apple", "recall_pen", "recall_tie", "recall_house", "recall_car",
	"digits_649", "digits_8537",
	"clock_hour_markers", "clock_time_correct",
	"x_in_triangle", "largest_figure",
	"story_name", "story_occupation", "story_work_return", "story_state",
] as const;

export function slumsHasAnswers(s: SlumsData): boolean {
	return ITEM_KEYS.some((k) => s[k] !== undefined);
}

export function slumsInterpretation(
	total: number,
	education: SlumsData["education"]
): NonNullable<SlumsData["interpretation"]> {
	if (education === "less_than_high_school") {
		if (total >= 25) return "normal";
		if (total >= 20) return "mild_neurocognitive_disorder";
		return "dementia";
	}
	if (total >= 27) return "normal";
	if (total >= 21) return "mild_neurocognitive_disorder";
	return "dementia";
}

/** True when a scored SLUMS falls below the normal range → Tier 2 trigger */
export function slumsBelowNormal(s: SlumsData): boolean {
	if (!slumsHasAnswers(s) || s.total_score === undefined) return false;
	return slumsInterpretation(s.total_score, s.education) !== "normal";
}

function set<K extends keyof SlumsData>(
	prev: SlumsData,
	key: K,
	val: SlumsData[K]
): SlumsData {
	return { ...prev, [key]: val };
}

// ── Score rows ────────────────────────────────────────────────────────────────

function ScoreItem({
	label,
	value,
	onChange,
	points = 1,
	hint,
}: {
	label: string;
	value: number | undefined;
	onChange: (v: number) => void;
	/** Points awarded for a correct answer (all-or-nothing items) */
	points?: number;
	hint?: string;
}) {
	return (
		<FieldRow label={label} hint={hint}>
			<SegmentedControl
				ariaLabel={label}
				value={value}
				onChange={onChange}
				options={[
					{ value: points, label: points === 1 ? "Correct" : `Correct (+${points})` },
					{ value: 0, label: "Incorrect" },
				]}
			/>
		</FieldRow>
	);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SectionSlums({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof SlumsData>(k: K, v: SlumsData[K]) =>
		onChange(set(s, k, v));

	const hasAnswers = slumsHasAnswers(s);

	const orientationScore = (s.day_of_week ?? 0) + (s.year ?? 0) + (s.state ?? 0);
	const mathScore = (s.math_spent ?? 0) + (s.math_left ?? 0);
	const animalScore = s.animal_score ?? 0;
	const recallScore =
		(s.recall_apple ?? 0) + (s.recall_pen ?? 0) + (s.recall_tie ?? 0) +
		(s.recall_house ?? 0) + (s.recall_car ?? 0);
	const digitScore = (s.digits_649 ?? 0) + (s.digits_8537 ?? 0);
	const clockScore = (s.clock_hour_markers ?? 0) + (s.clock_time_correct ?? 0);
	const figureScore = (s.x_in_triangle ?? 0) + (s.largest_figure ?? 0);
	const storyScore =
		(s.story_name ?? 0) + (s.story_occupation ?? 0) +
		(s.story_work_return ?? 0) + (s.story_state ?? 0);

	const totalScore =
		orientationScore + mathScore + animalScore + recallScore +
		digitScore + clockScore + figureScore + storyScore;

	const interpretation = slumsInterpretation(totalScore, s.education);
	const normalFloor = s.education === "less_than_high_school" ? 25 : 27;

	// Sync computed fields only when at least one item has been answered — an
	// untouched SLUMS must never be stored with total_score 0, or the Tier 2
	// pathway triggers prematurely.
	useEffect(() => {
		if (!hasAnswers) {
			if (s.total_score !== undefined || s.interpretation !== undefined) {
				const cleaned = { ...s };
				delete cleaned.total_score;
				delete cleaned.interpretation;
				onChange(cleaned);
			}
			return;
		}
		if (s.total_score !== totalScore || s.interpretation !== interpretation) {
			onChange({ ...s, total_score: totalScore, interpretation });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasAnswers, totalScore, interpretation]);

	return (
		<div className="space-y-5">
			<InfoBanner variant="info">
				<strong>SLUMS</strong> — 30-point cognitive screen; interpretation
				adjusts for education level.{" "}
				<strong>
					Administer from the{" "}
					<a
						href={SLUMS_OFFICIAL_URL}
						target="_blank"
						rel="noreferrer"
						className="underline"
					>
						official SLUMS form (PDF)
					</a>
				</strong>{" "}
				— it contains the scripted questions, story, and clock/figure
				graphics. Record only the scores here.
			</InfoBanner>

			<FieldGroup
				legend="Education level"
				description="Determines the interpretation bands for the total score."
			>
				<FieldRow label="Highest education completed">
					<SegmentedControl
						ariaLabel="Education level"
						value={s.education}
						onChange={(v) => u("education", v)}
						options={[
							{ value: "high_school_or_more", label: "High school or more" },
							{ value: "less_than_high_school", label: "Less than high school" },
						]}
					/>
				</FieldRow>
			</FieldGroup>

			<FieldGroup
				legend="1. Orientation"
				description="1 point per correct answer."
				badge={`${orientationScore}/3`}
			>
				<ScoreItem label="Day of the week" value={s.day_of_week} onChange={(v) => u("day_of_week", v)} />
				<ScoreItem label="Year" value={s.year} onChange={(v) => u("year", v)} />
				<ScoreItem label="State" value={s.state} onChange={(v) => u("state", v)} />
			</FieldGroup>

			<FieldGroup
				legend="2. Calculation"
				description="Administer the spending problem from the official form, and name the five objects for later recall."
				badge={`${mathScore}/3`}
			>
				<ScoreItem label="Amount spent — correct" value={s.math_spent} onChange={(v) => u("math_spent", v)} />
				<ScoreItem label="Amount remaining — correct" value={s.math_left} onChange={(v) => u("math_left", v)} points={2} />
			</FieldGroup>

			<FieldGroup
				legend="3. Animal naming"
				description="Ask the client to name as many animals as they can in one minute."
				badge={`${animalScore}/3`}
			>
				<ChipSelectField
					label="How many animals did the client name?"
					value={
						s.animal_score !== undefined ? String(s.animal_score) as "0" | "1" | "2" | "3" : undefined
					}
					onChange={(v) => u("animal_score", Number(v))}
					options={[
						{ value: "0", label: "None (0 pts)" },
						{ value: "1", label: "1–4 animals (1 pt)" },
						{ value: "2", label: "5–9 animals (2 pts)" },
						{ value: "3", label: "10 or more (3 pts)" },
					]}
				/>
			</FieldGroup>

			<FieldGroup
				legend="4. Five-object recall"
				description="The five objects named earlier (listed on the official form). 1 point per object recalled."
				badge={`${recallScore}/5`}
			>
				<ScoreItem label="Object 1 recalled" value={s.recall_apple} onChange={(v) => u("recall_apple", v)} />
				<ScoreItem label="Object 2 recalled" value={s.recall_pen} onChange={(v) => u("recall_pen", v)} />
				<ScoreItem label="Object 3 recalled" value={s.recall_tie} onChange={(v) => u("recall_tie", v)} />
				<ScoreItem label="Object 4 recalled" value={s.recall_house} onChange={(v) => u("recall_house", v)} />
				<ScoreItem label="Object 5 recalled" value={s.recall_car} onChange={(v) => u("recall_car", v)} />
			</FieldGroup>

			<FieldGroup
				legend="5. Digit span backward"
				description="Administer the number series from the official form (the practice series is not scored)."
				badge={`${digitScore}/2`}
			>
				<ScoreItem label="Three-digit series — correct" value={s.digits_649} onChange={(v) => u("digits_649", v)} />
				<ScoreItem label="Four-digit series — correct" value={s.digits_8537} onChange={(v) => u("digits_8537", v)} />
			</FieldGroup>

			<FieldGroup
				legend="6. Clock drawing"
				description="Clock-drawing task — administer per the official form."
				badge={`${clockScore}/4`}
			>
				<ScoreItem label="Hour markers placed correctly" value={s.clock_hour_markers} onChange={(v) => u("clock_hour_markers", v)} points={2} />
				<ScoreItem label="Time shown correctly" value={s.clock_time_correct} onChange={(v) => u("clock_time_correct", v)} points={2} />
			</FieldGroup>

			<FieldGroup
				legend="7. Figure recognition"
				description="Figure task — show the figures on the official form."
				badge={`${figureScore}/2`}
			>
				<ScoreItem label="Marked the correct figure" value={s.x_in_triangle} onChange={(v) => u("x_in_triangle", v)} />
				<ScoreItem label="Identified the largest figure" value={s.largest_figure} onChange={(v) => u("largest_figure", v)} />
			</FieldGroup>

			<FieldGroup
				legend="8. Story recall"
				description="Read the story from the official form, then score the four recall questions. 2 points each, all-or-nothing."
				badge={`${storyScore}/8`}
			>
				<ScoreItem label="Recalled the name" value={s.story_name} onChange={(v) => u("story_name", v)} points={2} />
				<ScoreItem label="Recalled the occupation" value={s.story_occupation} onChange={(v) => u("story_occupation", v)} points={2} />
				<ScoreItem label="Recalled when she returned to work" value={s.story_work_return} onChange={(v) => u("story_work_return", v)} points={2} />
				<ScoreItem label="Recalled the state" value={s.story_state} onChange={(v) => u("story_state", v)} points={2} />
			</FieldGroup>

			{hasAnswers ? (
				<InfoBanner variant={interpretation === "normal" ? "success" : "warning"}>
					<strong>SLUMS Total: {totalScore}/30</strong> —{" "}
					{interpretation === "normal" && `Normal (${normalFloor}–30 for this education level)`}
					{interpretation === "mild_neurocognitive_disorder" && "Mild neurocognitive disorder"}
					{interpretation === "dementia" && "Consistent with dementia"}
					{interpretation !== "normal" && (
						<>
							{" — "}
							<strong>Cognitive &amp; Safety Pathway (Tier 2) triggered.</strong>
						</>
					)}
					{s.education === undefined && (
						<> Set the education level above to confirm the interpretation band.</>
					)}
				</InfoBanner>
			) : (
				<InfoBanner variant="info">
					No items scored yet. The total and Tier 2 trigger are evaluated
					once scoring begins.
				</InfoBanner>
			)}

			<TextareaField
				label="Clinician notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional cognitive observations…"
			/>

			<p className="text-xs leading-relaxed text-[color:var(--muted)]">
				The Saint Louis University Mental Status (SLUMS) Examination is used
				courtesy of Saint Louis University and the Department of Veterans
				Affairs. Administering clinicians must view the VA-produced training
				video prior to first use and annually thereafter (available at
				SLU&rsquo;s assessment-tools page). Contact aging@slu.edu with
				questions regarding this instrument.
			</p>
		</div>
	);
}
