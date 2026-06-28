"use client";

import { useEffect } from "react";
import type { TugTestData } from "@/types/intake";
import { NumberField, TextareaField, InfoBanner, YesNoField } from "./fields";

type Props = {
	value: TugTestData;
	onChange: (v: TugTestData) => void;
};

function set<K extends keyof TugTestData>(
	prev: TugTestData,
	key: K,
	val: TugTestData[K]
): TugTestData {
	return { ...prev, [key]: val };
}

export function SectionTugTest({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof TugTestData>(k: K, v: TugTestData[K]) =>
		onChange(set(s, k, v));

	const seconds = s.seconds;
	const triggered = seconds !== undefined && seconds >= 12;

	// Auto-set interpretation and berg_balance_triggered
	useEffect(() => {
		let interpretation: TugTestData["interpretation"] | undefined;
		if (seconds !== undefined) {
			if (seconds < 12) interpretation = "normal";
			else if (seconds < 20) interpretation = "elevated_fall_risk";
			else interpretation = "significant_impairment";
		}
		onChange({
			...s,
			interpretation,
			berg_balance_triggered: triggered,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [seconds]);

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm">
				<p className="text-[color:var(--muted)]">
					<span className="font-medium text-[color:var(--foreground)]">
						Timed Up and Go (TUG) Test
					</span>{" "}
					— Client sits in a standard chair, stands on the word &ldquo;go,&rdquo;
					walks 3 meters at normal pace, turns, walks back, and sits down.
					Record total time in seconds.
				</p>
			</div>

			<YesNoField
				label="TUG test performed"
				value={s.performed}
				onChange={(v) => u("performed", v)}
			/>

			{s.performed && (
				<>
					<NumberField
						label="TUG Time"
						value={s.seconds}
						onChange={(v) => u("seconds", v)}
						min={0}
						max={120}
						step={0.1}
						unit="seconds"
						hint="< 12 sec = lower fall risk | ≥ 12 sec = elevated fall risk | ≥ 20 sec = significant impairment"
					/>

					{seconds !== undefined && seconds < 12 && (
						<InfoBanner variant="success">
							TUG time {seconds}s — within normal range. No
							additional mobility testing triggered.
						</InfoBanner>
					)}

					{triggered && seconds !== undefined && seconds < 20 && (
						<InfoBanner variant="warning">
							TUG time {seconds}s — elevated fall risk detected.
							<strong> Berg Balance Scale (Tier 2) triggered.</strong>
						</InfoBanner>
					)}

					{seconds !== undefined && seconds >= 20 && (
						<InfoBanner variant="warning">
							TUG time {seconds}s — significant mobility impairment.
							<strong> Berg Balance Scale (Tier 2) triggered.</strong>
						</InfoBanner>
					)}
				</>
			)}

			{!s.performed && (
				<InfoBanner variant="info">
					Mark the test as performed to enter the time. If the client
					cannot complete the TUG, note the reason below.
				</InfoBanner>
			)}

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Reason if not performed, observations during test, assistive device used…"
			/>
		</div>
	);
}
