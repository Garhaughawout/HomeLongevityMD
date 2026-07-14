"use client";

import type { Tier2EnvironmentalData } from "@/types/intake";
import { YesNoNaField, YesNoField, TextField, TextareaField, FieldGroup } from "./fields";

type Props = {
	value: Tier2EnvironmentalData;
	onChange: (v: Tier2EnvironmentalData) => void;
};

function set<K extends keyof Tier2EnvironmentalData>(
	prev: Tier2EnvironmentalData,
	key: K,
	val: Tier2EnvironmentalData[K]
): Tier2EnvironmentalData {
	return { ...prev, [key]: val };
}

export function SectionTier2Environmental({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof Tier2EnvironmentalData>(k: K, v: Tier2EnvironmentalData[K]) =>
		onChange(set(s, k, v));

	return (
		<div className="space-y-8">
			<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
				<strong>Triggered Assessment — Environmental Hazard Pathway</strong>
				<br />
				Triggered by a high HSSAT hazard count. Complete the following
				detailed room-by-room analysis and accessibility evaluation.
			</div>

			<FieldGroup legend="Accessibility Evaluation">
				<YesNoNaField
					label="Doorway widths adequate for mobility devices?"
					value={s.accessibility_evaluation?.doorway_widths}
					onChange={(v) => u("accessibility_evaluation", { ...s.accessibility_evaluation, doorway_widths: v })}
				/>
				<YesNoNaField
					label="Threshold barriers present (raised, tripping)?"
					value={s.accessibility_evaluation?.threshold_barriers}
					onChange={(v) => u("accessibility_evaluation", { ...s.accessibility_evaluation, threshold_barriers: v })}
				/>
				<YesNoField
					label="Ramp needed?"
					value={s.accessibility_evaluation?.ramp_needed}
					onChange={(v) => u("accessibility_evaluation", { ...s.accessibility_evaluation, ramp_needed: v })}
				/>
				{s.accessibility_evaluation?.ramp_needed && (
					<YesNoField
						label="Ramp present?"
						value={s.accessibility_evaluation?.ramp_present}
						onChange={(v) => u("accessibility_evaluation", { ...s.accessibility_evaluation, ramp_present: v })}
					/>
				)}
				<TextField
					label="Grab bar needs (location)"
					value={s.accessibility_evaluation?.grab_bar_needs?.join(", ")}
					onChange={(v) =>
						u("accessibility_evaluation", {
							...s.accessibility_evaluation,
							grab_bar_needs: v ? v.split(",").map((s) => s.trim()) : [],
						})
					}
					placeholder="bathroom, toilet, shower, hallway…"
					hint="Comma-separated"
				/>
				<TextField
					label="Flooring concerns"
					value={s.accessibility_evaluation?.flooring_concerns?.join(", ")}
					onChange={(v) =>
						u("accessibility_evaluation", {
							...s.accessibility_evaluation,
							flooring_concerns: v ? v.split(",").map((s) => s.trim()) : [],
						})
					}
					placeholder="loose carpet, slippery tile, uneven transitions…"
					hint="Comma-separated"
				/>
			</FieldGroup>

			<div className="space-y-4">
				<h3 className="text-base font-semibold text-[color:var(--foreground)]">
					Room-by-Room Analysis
				</h3>
				{(s.rooms ?? []).map((room, idx) => (
					<div
						key={idx}
						className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4 space-y-3"
					>
						<div className="flex items-center justify-between">
							<TextField
								label="Room Name"
								value={room.room_name}
								onChange={(v) => {
									const rooms = [...(s.rooms ?? [])];
									rooms[idx] = { ...room, room_name: v };
									u("rooms", rooms);
								}}
								placeholder="e.g., Master Bathroom"
							/>
							<button
								onClick={() => {
									const rooms = (s.rooms ?? []).filter((_, i) => i !== idx);
									u("rooms", rooms);
								}}
								className="ml-2 shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
							>
								Remove
							</button>
						</div>
						<TextField
							label="Hazards"
							value={room.hazards?.join(", ")}
							onChange={(v) => {
								const rooms = [...(s.rooms ?? [])];
								rooms[idx] = {
									...room,
									hazards: v ? v.split(",").map((s) => s.trim()) : [],
								};
								u("rooms", rooms);
							}}
							placeholder="Comma-separated hazards"
						/>
						<TextField
							label="Recommendations"
							value={room.recommendations?.join(", ")}
							onChange={(v) => {
								const rooms = [...(s.rooms ?? [])];
								rooms[idx] = {
									...room,
									recommendations: v ? v.split(",").map((s) => s.trim()) : [],
								};
								u("rooms", rooms);
							}}
							placeholder="Comma-separated recommendations"
						/>
					</div>
				))}
				<button
					onClick={() =>
						u("rooms", [
							...(s.rooms ?? []),
							{ room_name: "", hazards: [], recommendations: [] },
						])
					}
					className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
				>
					+ Add Room
				</button>
			</div>

			<TextareaField
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional environmental hazard observations…"
			/>
		</div>
	);
}
