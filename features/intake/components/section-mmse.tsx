"use client";

import { useEffect, useMemo } from "react";
import type { MmseData } from "@/types/intake";
import { NumberField, TextareaField, InfoBanner } from "./fields";

type Props = {
	value: MmseData;
	onChange: (v: MmseData) => void;
};

function set<K extends keyof MmseData>(
	prev: MmseData,
	key: K,
	val: MmseData[K]
): MmseData {
	return { ...prev, [key]: val };
}

// Binary scorer: 0 or 1 per item
function ScoreInput({
	label,
	value,
	onChange,
}: {
	label: string;
	value: number | undefined;
	onChange: (v: number) => void;
}) {
	return (
		<div className="flex items-center gap-3">
			<span className="text-sm text-[color:var(--foreground)]">{label}</span>
			<div className="flex gap-2">
				<label className="flex cursor-pointer items-center gap-1 text-sm">
					<input
						type="radio"
						checked={value === 1}
						onChange={() => onChange(1)}
						className="accent-[color:var(--accent)]"
					/>
					Correct (1)
				</label>
				<label className="flex cursor-pointer items-center gap-1 text-sm">
					<input
						type="radio"
						checked={value === 0}
						onChange={() => onChange(0)}
						className="accent-[color:var(--accent)]"
					/>
					Incorrect (0)
				</label>
			</div>
		</div>
	);
}

export function SectionMmse({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof MmseData>(k: K, v: MmseData[K]) =>
		onChange(set(s, k, v));

	// Auto-compute subscores and total
	const orientationScore = useMemo(() => {
		const time = s.orientation_time
			? Object.values(s.orientation_time).reduce((a, b) => a + (b ?? 0), 0)
			: 0;
		const place = s.orientation_place
			? Object.values(s.orientation_place).reduce((a, b) => a + (b ?? 0), 0)
			: 0;
		return time + place;
	}, [s.orientation_time, s.orientation_place]);

	const registrationScore = useMemo(() => {
		return (s.registration_word1 ?? 0) + (s.registration_word2 ?? 0) + (s.registration_word3 ?? 0);
	}, [s.registration_word1, s.registration_word2, s.registration_word3]);

	const attentionScore = useMemo(() => {
		if (s.attention_score !== undefined) return s.attention_score;
		// Use serial 7s if present, else WORLD backwards
		const serial7 = (s.serial7_1 ?? 0) + (s.serial7_2 ?? 0) + (s.serial7_3 ?? 0) + (s.serial7_4 ?? 0) + (s.serial7_5 ?? 0);
		if (serial7 > 0) return serial7;
		return s.world_backward ?? 0;
	}, [s.attention_score, s.serial7_1, s.serial7_2, s.serial7_3, s.serial7_4, s.serial7_5, s.world_backward]);

	const recallScore = useMemo(() => {
		return (s.recall_word1 ?? 0) + (s.recall_word2 ?? 0) + (s.recall_word3 ?? 0);
	}, [s.recall_word1, s.recall_word2, s.recall_word3]);

	const languageScore = useMemo(() => {
		return (s.name_pen ?? 0) + (s.name_watch ?? 0) + (s.repeat_phrase ?? 0) + (s.three_step_command ?? 0) + (s.read_obey ?? 0) + (s.write_sentence ?? 0);
	}, [s.name_pen, s.name_watch, s.repeat_phrase, s.three_step_command, s.read_obey, s.write_sentence]);

	const visuospatialScore = s.copy_pentagons ?? 0;

	const totalScore = orientationScore + registrationScore + attentionScore + recallScore + languageScore + visuospatialScore;

	const interpretation: MmseData["interpretation"] = useMemo(() => {
		if (totalScore >= 24) return "normal";
		if (totalScore >= 18) return "mild_impairment";
		if (totalScore >= 10) return "moderate_impairment";
		return "severe_impairment";
	}, [totalScore]);

	// Sync computed values
	useEffect(() => {
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orientationScore, registrationScore, attentionScore, recallScore, languageScore, visuospatialScore, totalScore, interpretation]);

	return (
		<div className="space-y-8">
			<div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm">
				<p className="text-[color:var(--muted)]">
					<span className="font-medium text-[color:var(--foreground)]">
						Mini-Mental Status Examination (MMSE)
					</span>{" "}
					— 30-point cognitive assessment. Score each task as Correct
					(1) or Incorrect (0).
				</p>
			</div>

			{/* 1. Orientation */}
			<fieldset className="space-y-4">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					1. Orientation (10 points)
				</legend>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="space-y-2">
						<p className="text-xs font-medium text-[color:var(--muted)]">Time (5 pts)</p>
						<ScoreInput label="Year" value={s.orientation_time?.year} onChange={(v) => u("orientation_time", { ...s.orientation_time, year: v })} />
						<ScoreInput label="Season" value={s.orientation_time?.season} onChange={(v) => u("orientation_time", { ...s.orientation_time, season: v })} />
						<ScoreInput label="Date" value={s.orientation_time?.date} onChange={(v) => u("orientation_time", { ...s.orientation_time, date: v })} />
						<ScoreInput label="Day of week" value={s.orientation_time?.day} onChange={(v) => u("orientation_time", { ...s.orientation_time, day: v })} />
						<ScoreInput label="Month" value={s.orientation_time?.month} onChange={(v) => u("orientation_time", { ...s.orientation_time, month: v })} />
					</div>
					<div className="space-y-2">
						<p className="text-xs font-medium text-[color:var(--muted)]">Place (5 pts)</p>
						<ScoreInput label="State" value={s.orientation_place?.state} onChange={(v) => u("orientation_place", { ...s.orientation_place, state: v })} />
						<ScoreInput label="County" value={s.orientation_place?.county} onChange={(v) => u("orientation_place", { ...s.orientation_place, county: v })} />
						<ScoreInput label="Town/City" value={s.orientation_place?.town} onChange={(v) => u("orientation_place", { ...s.orientation_place, town: v })} />
						<ScoreInput label="Facility name" value={s.orientation_place?.facility} onChange={(v) => u("orientation_place", { ...s.orientation_place, facility: v })} />
						<ScoreInput label="Floor" value={s.orientation_place?.floor} onChange={(v) => u("orientation_place", { ...s.orientation_place, floor: v })} />
					</div>
				</div>
				<p className="text-xs text-[color:var(--muted)]">Subtotal: {orientationScore}/10</p>
			</fieldset>

			{/* 2. Registration */}
			<fieldset className="space-y-4">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					2. Registration (3 points)
				</legend>
				<p className="text-sm text-[color:var(--foreground)]">
					Name 3 objects: <strong>apple, penny, table</strong>. Ask
					client to repeat. Score 1 point per correct repetition.
				</p>
				<div className="space-y-2">
					<ScoreInput label="Apple" value={s.registration_word1} onChange={(v) => u("registration_word1", v)} />
					<ScoreInput label="Penny" value={s.registration_word2} onChange={(v) => u("registration_word2", v)} />
					<ScoreInput label="Table" value={s.registration_word3} onChange={(v) => u("registration_word3", v)} />
				</div>
				<p className="text-xs text-[color:var(--muted)]">Subtotal: {registrationScore}/3</p>
			</fieldset>

			{/* 3. Attention & Calculation */}
			<fieldset className="space-y-4">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					3. Attention &amp; Calculation (5 points)
				</legend>
				<p className="text-sm text-[color:var(--foreground)]">
					<strong>Option A:</strong> Serial 7s — subtract 7 from 100,
					continue 5 times (93, 86, 79, 72, 65). 1 point per correct.
				</p>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
					<ScoreInput label="93" value={s.serial7_1} onChange={(v) => u("serial7_1", v)} />
					<ScoreInput label="86" value={s.serial7_2} onChange={(v) => u("serial7_2", v)} />
					<ScoreInput label="79" value={s.serial7_3} onChange={(v) => u("serial7_3", v)} />
					<ScoreInput label="72" value={s.serial7_4} onChange={(v) => u("serial7_4", v)} />
					<ScoreInput label="65" value={s.serial7_5} onChange={(v) => u("serial7_5", v)} />
				</div>
				<p className="text-sm text-[color:var(--muted)]">— or —</p>
				<p className="text-sm text-[color:var(--foreground)]">
					<strong>Option B:</strong> Spell &ldquo;WORLD&rdquo; backwards.
					1 point per correct letter.
				</p>
				<NumberField
					label="WORLD backwards score (0–5)"
					value={s.world_backward}
					onChange={(v) => u("world_backward", v)}
					min={0}
					max={5}
				/>
				<p className="text-xs text-[color:var(--muted)]">Subtotal: {attentionScore}/5</p>
			</fieldset>

			{/* 4. Recall */}
			<fieldset className="space-y-4">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					4. Recall (3 points)
				</legend>
				<p className="text-sm text-[color:var(--foreground)]">
					Ask client to recall the 3 words from Registration. 1 point
					per correct.
				</p>
				<div className="space-y-2">
					<ScoreInput label="Apple" value={s.recall_word1} onChange={(v) => u("recall_word1", v)} />
					<ScoreInput label="Penny" value={s.recall_word2} onChange={(v) => u("recall_word2", v)} />
					<ScoreInput label="Table" value={s.recall_word3} onChange={(v) => u("recall_word3", v)} />
				</div>
				<p className="text-xs text-[color:var(--muted)]">Subtotal: {recallScore}/3</p>
			</fieldset>

			{/* 5. Language */}
			<fieldset className="space-y-4">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					5. Language (8 points)
				</legend>
				<div className="space-y-2">
					<ScoreInput label="Name a pen (1 pt)" value={s.name_pen} onChange={(v) => u("name_pen", v)} />
					<ScoreInput label="Name a watch (1 pt)" value={s.name_watch} onChange={(v) => u("name_watch", v)} />
					<ScoreInput label="Repeat: &ldquo;no ifs ands or buts&rdquo; (1 pt)" value={s.repeat_phrase} onChange={(v) => u("repeat_phrase", v)} />
					<ScoreInput label="3-step command (3 pts)" value={s.three_step_command} onChange={(v) => u("three_step_command", v)} />
					<ScoreInput label="Read & obey: &ldquo;close your eyes&rdquo; (1 pt)" value={s.read_obey} onChange={(v) => u("read_obey", v)} />
					<ScoreInput label="Write a sentence (1 pt)" value={s.write_sentence} onChange={(v) => u("write_sentence", v)} />
				</div>
				<p className="text-xs text-[color:var(--muted)]">Subtotal: {languageScore}/8</p>
			</fieldset>

			{/* 6. Visuospatial */}
			<fieldset className="space-y-4">
				<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
					6. Visuospatial (1 point)
				</legend>
				<p className="text-sm text-[color:var(--foreground)]">
					Ask client to copy intersecting pentagons.
				</p>
				<ScoreInput label="Copy pentagons (1 pt)" value={s.copy_pentagons} onChange={(v) => u("copy_pentagons", v)} />
				<p className="text-xs text-[color:var(--muted)]">Subtotal: {visuospatialScore}/1</p>
			</fieldset>

			<InfoBanner
				variant={totalScore < 24 ? "warning" : "success"}
			>
				<strong>MMSE Total: {totalScore}/30</strong> —{" "}
				{interpretation === "normal" && "Normal cognition (24–30)"}
				{interpretation === "mild_impairment" && "Mild impairment (18–23)"}
				{interpretation === "moderate_impairment" && "Moderate impairment (10–17)"}
				{interpretation === "severe_impairment" && "Severe impairment (< 10)"}
				{totalScore < 24 && (
					<>
						{" — "}
						<strong>
							Cognitive &amp; Safety Pathway (Tier 2) triggered.
						</strong>
					</>
				)}
			</InfoBanner>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional cognitive observations…"
			/>
		</div>
	);
}
