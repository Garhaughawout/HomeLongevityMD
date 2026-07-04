"use client";

import { useMemo } from "react";
import type { SteadiData, SteadiItem, YesNoNa } from "@/types/intake";
import { FieldGroup, FieldRow, SegmentedControl, TextareaField, InfoBanner } from "./fields";

type Props = {
	value: SteadiData;
	onChange: (v: SteadiData) => void;
};

// ── CDC STEADI "Check for Safety" checklist items (public domain) ─────────────

interface SteadiQuestion {
	id: string;
	section: string;
	question: string;
}

export const STEADI_QUESTIONS: SteadiQuestion[] = [
	// Floors
	{ id: "floors_furniture", section: "Floors", question: "When you walk through a room, do you have to walk around furniture?" },
	{ id: "floors_throw_rugs", section: "Floors", question: "Do you have throw rugs on the floor?" },
	{ id: "floors_clutter", section: "Floors", question: "Are papers, shoes, books, or other objects on the floor?" },
	{ id: "floors_cords", section: "Floors", question: "Do you have to walk over or around wires or cords (like lamp, telephone, or extension cords)?" },
	// Stairs & steps
	{ id: "stairs_clutter", section: "Stairs & Steps", question: "Are papers, shoes, books, or other objects on the stairs?" },
	{ id: "stairs_broken", section: "Stairs & Steps", question: "Are some steps broken or uneven?" },
	{ id: "stairs_no_light", section: "Stairs & Steps", question: "Is a light over the stairway missing or broken?" },
	{ id: "stairs_one_switch", section: "Stairs & Steps", question: "Is there only one light switch for the stairs (only at the top or at the bottom)?" },
	{ id: "stairs_handrails", section: "Stairs & Steps", question: "Are the handrails loose or broken, or is there a handrail on only one side of the stairs?" },
	{ id: "stairs_carpet", section: "Stairs & Steps", question: "Is the carpet on the steps loose or torn?" },
	// Kitchen
	{ id: "kitchen_high_shelves", section: "Kitchen", question: "Are the things you use often on high shelves?" },
	{ id: "kitchen_step_stool", section: "Kitchen", question: "Is the step stool unsteady?" },
	// Bedrooms
	{ id: "bedroom_light_reach", section: "Bedrooms", question: "Is the light near the bed hard to reach?" },
	{ id: "bedroom_dark_path", section: "Bedrooms", question: "Is the path from the bed to the bathroom dark?" },
	// Bathrooms
	{ id: "bath_slippery", section: "Bathrooms", question: "Is the tub or shower floor slippery?" },
	{ id: "bath_support", section: "Bathrooms", question: "Is support needed getting in and out of the tub, or up from the toilet?" },
];

// ── Component ─────────────────────────────────────────────────────────────────

function set<K extends keyof SteadiData>(
	prev: SteadiData,
	key: K,
	val: SteadiData[K]
): SteadiData {
	return { ...prev, [key]: val };
}

export function SectionSteadi({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof SteadiData>(k: K, v: SteadiData[K]) =>
		onChange(set(s, k, v));

	// Initialize items if empty
	const items: SteadiItem[] = useMemo(() => {
		if (s.items && s.items.length > 0) return s.items;
		return STEADI_QUESTIONS.map((q): SteadiItem => ({
			id: q.id,
			section: q.section,
			question: q.question,
		}));
	}, [s.items]);

	// Group by room
	const sections = useMemo(() => {
		const map = new Map<string, SteadiItem[]>();
		for (const item of items) {
			const arr = map.get(item.section) ?? [];
			arr.push(item);
			map.set(item.section, arr);
		}
		return map;
	}, [items]);

	// "Yes" flags the hazard on every STEADI item
	const hazardCount = useMemo(() => {
		return items.filter((item) => item.response === "yes").length;
	}, [items]);

	function updateItem(id: string, response: YesNoNa) {
		const newItems = items.map((item) =>
			item.id === id ? { ...item, response } : item
		);
		const newHazardCount = newItems.filter((i) => i.response === "yes").length;
		onChange({ ...s, items: newItems, hazard_count: newHazardCount });
	}

	return (
		<div className="space-y-5">
			<InfoBanner variant="info">
				<strong>Home Safety Checklist</strong> — based on the CDC STEADI
				&ldquo;Check for Safety&rdquo; checklist. Walk each room with the
				client. <strong>Yes</strong> flags the hazard, <strong>No</strong>{" "}
				means no hazard, <strong>N/A</strong> when not applicable (e.g., no
				stairs in the home).
			</InfoBanner>

			{hazardCount > 0 && (
				<InfoBanner variant="warning">
					<strong>{hazardCount}</strong> hazard(s) identified.
					{hazardCount >= 4 &&
						" This will trigger the Environmental Hazard Pathway (Tier 2)."}
				</InfoBanner>
			)}

			{Array.from(sections.entries()).map(([sectionName, sectionItems]) => {
				const answered = sectionItems.filter((i) => i.response !== undefined).length;
				return (
					<FieldGroup
						key={sectionName}
						legend={sectionName}
						badge={`${answered} of ${sectionItems.length}`}
					>
						{sectionItems.map((item) => (
							<FieldRow key={item.id} label={item.question}>
								<SegmentedControl
									ariaLabel={item.question}
									value={item.response}
									onChange={(v) => updateItem(item.id, v)}
									options={[
										{ value: "yes", label: "Yes" },
										{ value: "no", label: "No" },
										{ value: "na", label: "N/A" },
									]}
								/>
							</FieldRow>
						))}
					</FieldGroup>
				);
			})}

			<TextareaField
				label="Clinician notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional observations about the home environment…"
			/>
		</div>
	);
}
