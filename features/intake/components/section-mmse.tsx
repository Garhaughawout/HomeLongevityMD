"use client";

import { useEffect, useState } from "react";
import type { MmseData } from "@/types/intake";
import {
	FieldGroup,
	FieldRow,
	SegmentedControl,
	TextareaField,
	InfoBanner,
} from "./fields";

type Props = {
	value: MmseData;
	onChange: (v: MmseData) => void;
};

// ── Answer detection ──────────────────────────────────────────────────────────
// Exported so the wizard can distinguish a scored MMSE from an untouched one —
// the Tier 2 cognitive trigger must never fire off an empty section.

export function mmseHasAnswers(s: MmseData): boolean {
	const time = s.orientation_time ?? {};
	const place = s.orientation_place ?? {};
	const items: Array<number | undefined> = [
		time.year, time.season, time.date, time.day, time.month,
		place.state, place.county, place.town, place.facility, place.floor,
		s.registration_word1, s.registration_word2, s.registration_word3,
		s.serial7_1, s.serial7_2, s.serial7_3, s.serial7_4, s.serial7_5,
		s.world_backward,
		s.recall_word1, s.recall_word2, s.recall_word3,
		s.name_pen, s.name_watch, s.repeat_phrase, s.three_step_command,
		s.read_obey, s.write_sentence, s.copy_pentagons,
	];
	return items.some((v) => v !== undefined);
}

function set<K extends keyof MmseData>(
	prev: MmseData,
	key: K,
	val: MmseData[K]
): MmseData {
	return { ...prev, [key]: val };
}

// ── Score row: Correct/Incorrect for 1-pt items, 0..max for multi-pt ─────────

function ScoreItem({
	label,
	value,
	onChange,
	max = 1,
	hint,
}: {
	label: string;
	value: number | undefined;
	onChange: (v: number) => void;
	max?: number;
	hint?: string;
}) {
	const options =
		max === 1
			? [
					{ value: 1, label: "Correct" },
					{ value: 0, label: "Incorrect" },
				]
			: Array.from({ length: max + 1 }, (_, n) => ({
					value: n,
					label: String(n),
				}));
	return (
		<FieldRow label={label} hint={hint}>
			<SegmentedControl
				ariaLabel={label}
				value={value}
				onChange={onChange}
				options={options}
			/>
		</FieldRow>
	);
}

// ── Component ─────────────────────────────────────────────────────────────────

const SERIAL7_KEYS = ["serial7_1", "serial7_2", "serial7_3", "serial7_4", "serial7_5"] as const;

export function SectionMmse({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof MmseData>(k: K, v: MmseData[K]) =>
		onChange(set(s, k, v));

	const hasAnswers = mmseHasAnswers(s);

	// Attention & Calculation is scored by ONE of two methods. Which one is in
	// play is derived from the data on load, then driven by the toggle below.
	const serial7Answered = SERIAL7_KEYS.some((k) => s[k] !== undefined);
	const [attentionMethod, setAttentionMethod] = useState<"serial7" | "world">(
		() => (s.world_backward !== undefined && !serial7Answered ? "world" : "serial7")
	);

	function switchAttentionMethod(method: "serial7" | "world") {
		setAttentionMethod(method);
		// Clear the other method's answers so the score is unambiguous
		if (method === "serial7") {
			onChange({ ...s, world_backward: undefined });
		} else {
			onChange({
				...s,
				serial7_1: undefined,
				serial7_2: undefined,
				serial7_3: undefined,
				serial7_4: undefined,
				serial7_5: undefined,
			});
		}
	}

	// ── Subscores (always derived from raw item answers, never from previously
	//    stored computed fields — storing them back is what broke scoring before)
	const orientationScore =
		Object.values(s.orientation_time ?? {}).reduce((a, b) => a + (b ?? 0), 0) +
		Object.values(s.orientation_place ?? {}).reduce((a, b) => a + (b ?? 0), 0);

	const registrationScore =
		(s.registration_word1 ?? 0) + (s.registration_word2 ?? 0) + (s.registration_word3 ?? 0);

	const attentionScore = serial7Answered
		? SERIAL7_KEYS.reduce((sum, k) => sum + (s[k] ?? 0), 0)
		: s.world_backward ?? 0;

	const recallScore =
		(s.recall_word1 ?? 0) + (s.recall_word2 ?? 0) + (s.recall_word3 ?? 0);

	const languageScore =
		(s.name_pen ?? 0) + (s.name_watch ?? 0) + (s.repeat_phrase ?? 0) +
		(s.three_step_command ?? 0) + (s.read_obey ?? 0) + (s.write_sentence ?? 0);

	const visuospatialScore = s.copy_pentagons ?? 0;

	const totalScore =
		orientationScore + registrationScore + attentionScore +
		recallScore + languageScore + visuospatialScore;

	const interpretation: MmseData["interpretation"] =
		totalScore >= 24 ? "normal"
		: totalScore >= 18 ? "mild_impairment"
		: totalScore >= 10 ? "moderate_impairment"
		: "severe_impairment";

	// ── Sync computed fields into the section data ──────────────────────────────
	// Only when at least one item has been answered — an untouched MMSE must not
	// be stored with total_score 0, or the Tier 2 pathway triggers prematurely.
	useEffect(() => {
		if (!hasAnswers) {
			if (s.total_score !== undefined || s.interpretation !== undefined) {
				const cleaned = { ...s };
				delete cleaned.orientation_score;
				delete cleaned.registration_score;
				delete cleaned.attention_score;
				delete cleaned.recall_score;
				delete cleaned.language_score;
				delete cleaned.visuospatial_score;
				delete cleaned.total_score;
				delete cleaned.interpretation;
				onChange(cleaned);
			}
			return;
		}
		if (
			s.orientation_score !== orientationScore ||
			s.registration_score !== registrationScore ||
			s.attention_score !== attentionScore ||
			s.recall_score !== recallScore ||
			s.language_score !== languageScore ||
			s.visuospatial_score !== visuospatialScore ||
			s.total_score !== totalScore ||
			s.interpretation !== interpretation
		) {
			onChange({
				...s,
				orientation_score: orientationScore,
				registration_score: registrationScore,
				attention_score: attentionScore,
				recall_score: recallScore,
				language_score: languageScore,
				visuospatial_score: visuospatialScore,
				total_score: totalScore,
				interpretation,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasAnswers, orientationScore, registrationScore, attentionScore, recallScore, languageScore, visuospatialScore, totalScore, interpretation]);

	return (
		<div className="space-y-5">
			<InfoBanner variant="info">
				<strong>Mini-Mental State Examination (MMSE)</strong> — 30-point
				cognitive screen. Score each task as the client responds; subtotals
				and the total update automatically.
			</InfoBanner>

			<FieldGroup
				legend="1. Orientation"
				description="Ask each question in order. 1 point per correct answer."
				badge={`${orientationScore}/10`}
			>
				<ScoreItem label="What year is it?" value={s.orientation_time?.year} onChange={(v) => u("orientation_time", { ...s.orientation_time, year: v })} />
				<ScoreItem label="What season is it?" value={s.orientation_time?.season} onChange={(v) => u("orientation_time", { ...s.orientation_time, season: v })} />
				<ScoreItem label="What is today's date?" value={s.orientation_time?.date} onChange={(v) => u("orientation_time", { ...s.orientation_time, date: v })} />
				<ScoreItem label="What day of the week is it?" value={s.orientation_time?.day} onChange={(v) => u("orientation_time", { ...s.orientation_time, day: v })} />
				<ScoreItem label="What month is it?" value={s.orientation_time?.month} onChange={(v) => u("orientation_time", { ...s.orientation_time, month: v })} />
				<ScoreItem label="What state are we in?" value={s.orientation_place?.state} onChange={(v) => u("orientation_place", { ...s.orientation_place, state: v })} />
				<ScoreItem label="What county are we in?" value={s.orientation_place?.county} onChange={(v) => u("orientation_place", { ...s.orientation_place, county: v })} />
				<ScoreItem label="What town or city are we in?" value={s.orientation_place?.town} onChange={(v) => u("orientation_place", { ...s.orientation_place, town: v })} />
				<ScoreItem label="What building are we in?" value={s.orientation_place?.facility} onChange={(v) => u("orientation_place", { ...s.orientation_place, facility: v })} />
				<ScoreItem label="What floor are we on?" value={s.orientation_place?.floor} onChange={(v) => u("orientation_place", { ...s.orientation_place, floor: v })} />
			</FieldGroup>

			<FieldGroup
				legend="2. Registration"
				description={
					<>
						Name three objects — <strong>apple, penny, table</strong> — and ask
						the client to repeat them. 1 point per correct repetition.
					</>
				}
				badge={`${registrationScore}/3`}
			>
				<ScoreItem label="Repeated “apple”" value={s.registration_word1} onChange={(v) => u("registration_word1", v)} />
				<ScoreItem label="Repeated “penny”" value={s.registration_word2} onChange={(v) => u("registration_word2", v)} />
				<ScoreItem label="Repeated “table”" value={s.registration_word3} onChange={(v) => u("registration_word3", v)} />
			</FieldGroup>

			<FieldGroup
				legend="3. Attention &amp; calculation"
				description="Use one method. Switching methods clears the other's answers."
				badge={`${attentionScore}/5`}
			>
				<FieldRow label="Scoring method">
					<SegmentedControl
						ariaLabel="Attention scoring method"
						value={attentionMethod}
						onChange={switchAttentionMethod}
						options={[
							{ value: "serial7", label: "Serial 7s" },
							{ value: "world", label: "Spell WORLD backwards" },
						]}
					/>
				</FieldRow>
				{attentionMethod === "serial7" ? (
					<>
						<ScoreItem label="100 − 7 = 93" value={s.serial7_1} onChange={(v) => u("serial7_1", v)} />
						<ScoreItem label="93 − 7 = 86" value={s.serial7_2} onChange={(v) => u("serial7_2", v)} />
						<ScoreItem label="86 − 7 = 79" value={s.serial7_3} onChange={(v) => u("serial7_3", v)} />
						<ScoreItem label="79 − 7 = 72" value={s.serial7_4} onChange={(v) => u("serial7_4", v)} />
						<ScoreItem label="72 − 7 = 65" value={s.serial7_5} onChange={(v) => u("serial7_5", v)} />
					</>
				) : (
					<ScoreItem
						label="Letters in the correct position (D-L-R-O-W)"
						value={s.world_backward}
						onChange={(v) => u("world_backward", v)}
						max={5}
					/>
				)}
			</FieldGroup>

			<FieldGroup
				legend="4. Recall"
				description="Ask the client to recall the three words from Registration. 1 point per correct word."
				badge={`${recallScore}/3`}
			>
				<ScoreItem label="Recalled “apple”" value={s.recall_word1} onChange={(v) => u("recall_word1", v)} />
				<ScoreItem label="Recalled “penny”" value={s.recall_word2} onChange={(v) => u("recall_word2", v)} />
				<ScoreItem label="Recalled “table”" value={s.recall_word3} onChange={(v) => u("recall_word3", v)} />
			</FieldGroup>

			<FieldGroup legend="5. Language" badge={`${languageScore}/8`}>
				<ScoreItem label="Named a pen when shown one" value={s.name_pen} onChange={(v) => u("name_pen", v)} />
				<ScoreItem label="Named a watch when shown one" value={s.name_watch} onChange={(v) => u("name_watch", v)} />
				<ScoreItem label="Repeated “no ifs, ands, or buts”" value={s.repeat_phrase} onChange={(v) => u("repeat_phrase", v)} />
				<ScoreItem
					label="Followed the 3-step command"
					hint="Take the paper in your right hand, fold it in half, place it on the floor — 1 point per step"
					value={s.three_step_command}
					onChange={(v) => u("three_step_command", v)}
					max={3}
				/>
				<ScoreItem label="Read and obeyed “close your eyes”" value={s.read_obey} onChange={(v) => u("read_obey", v)} />
				<ScoreItem label="Wrote a complete sentence" value={s.write_sentence} onChange={(v) => u("write_sentence", v)} />
			</FieldGroup>

			<FieldGroup
				legend="6. Visuospatial"
				description="Ask the client to copy two intersecting pentagons."
				badge={`${visuospatialScore}/1`}
			>
				<ScoreItem label="Copied the pentagons" value={s.copy_pentagons} onChange={(v) => u("copy_pentagons", v)} />
			</FieldGroup>

			{hasAnswers ? (
				<InfoBanner variant={totalScore < 24 ? "warning" : "success"}>
					<strong>MMSE Total: {totalScore}/30</strong> —{" "}
					{interpretation === "normal" && "Normal cognition (24–30)"}
					{interpretation === "mild_impairment" && "Mild impairment (18–23)"}
					{interpretation === "moderate_impairment" && "Moderate impairment (10–17)"}
					{interpretation === "severe_impairment" && "Severe impairment (< 10)"}
					{totalScore < 24 && (
						<>
							{" — "}
							<strong>Cognitive &amp; Safety Pathway (Tier 2) triggered.</strong>
						</>
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
		</div>
	);
}
