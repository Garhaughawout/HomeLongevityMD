"use client";

import { useMemo } from "react";
import type { HomeFastData, HomeFastItem, YesNoNa } from "@/types/intake";
import { FieldGroup, FieldRow, SegmentedControl, TextareaField, InfoBanner } from "./fields";

type Props = {
	value: HomeFastData;
	onChange: (v: HomeFastData) => void;
};

// ── HOME FAST item definitions ────────────────────────────────────────────────

interface HomeFastQuestion {
	id: string;
	section: string;
	question: string;
}

const HOME_FAST_QUESTIONS: HomeFastQuestion[] = [
	// Flooring
	{ id: "flooring_1", section: "Flooring", question: "Are loose rugs or mats present without non-slip backing?" },
	{ id: "flooring_2", section: "Flooring", question: "Is carpet frayed, loose, or curling at edges?" },
	{ id: "flooring_3", section: "Flooring", question: "Are there uneven floors or transition strips that create tripping hazards?" },
	{ id: "flooring_4", section: "Flooring", question: "Is flooring slippery when wet (e.g., polished tile, hardwood)?" },
	// Lighting
	{ id: "lighting_1", section: "Lighting", question: "Is lighting inadequate in hallways or main living areas?" },
	{ id: "lighting_2", section: "Lighting", question: "Is stair/step lighting inadequate?" },
	{ id: "lighting_3", section: "Lighting", question: "Are night lights absent in bedroom-to-bathroom path?" },
	// Bathroom
	{ id: "bathroom_1", section: "Bathroom", question: "Are grab bars absent in the shower/tub area?" },
	{ id: "bathroom_2", section: "Bathroom", question: "Are non-slip surfaces absent in the tub/shower?" },
	{ id: "bathroom_3", section: "Bathroom", question: "Is a raised toilet seat needed but not present?" },
	{ id: "bathroom_4", section: "Bathroom", question: "Is a tub transfer bench or shower chair needed but not present?" },
	// Transfers / Mobility
	{ id: "transfers_1", section: "Transfers & Mobility", question: "Is bed height too high or too low for safe transfers?" },
	{ id: "transfers_2", section: "Transfers & Mobility", question: "Is furniture too low or difficult to rise from?" },
	// Stairs / Steps
	{ id: "stairs_1", section: "Stairs & Steps", question: "Are interior stairs present without adequate handrails on both sides?" },
	{ id: "stairs_2", section: "Stairs & Steps", question: "Are stair edges (nosings) not clearly visible or contrasting?" },
	{ id: "stairs_3", section: "Stairs & Steps", question: "Are exterior steps present without handrails?" },
	// Accessibility
	{ id: "access_1", section: "Accessibility", question: "Are entrance door thresholds raised or creating a tripping hazard?" },
	{ id: "access_2", section: "Accessibility", question: "Is doorway width inadequate for mobility device access (if needed)?" },
	{ id: "access_3", section: "Accessibility", question: "Are outdoor pathways cracked, uneven, or poorly drained?" },
	// Kitchen Safety
	{ id: "kitchen_1", section: "Kitchen Safety", question: "Are frequently used items stored out of easy reach?" },
	{ id: "kitchen_2", section: "Kitchen Safety", question: "Are there stove safety concerns (e.g., forgetting to turn off)?" },
	// Emergency / Egress
	{ id: "emergency_1", section: "Emergency & Egress", question: "Are working smoke detectors absent or non-functional?" },
	{ id: "emergency_2", section: "Emergency & Egress", question: "Are working CO detectors absent or non-functional?" },
	{ id: "emergency_3", section: "Emergency & Egress", question: "Are emergency exits obstructed or difficult to access?" },
	{ id: "emergency_4", section: "Emergency & Egress", question: "Is emergency contact information not posted or easily accessible?" },
	// Footwear & Pets
	{ id: "footwear_1", section: "Footwear & Pets", question: "Is client wearing inappropriate footwear (slippery, loose-fitting, or worn outdoors)?" },
	{ id: "footwear_2", section: "Footwear & Pets", question: "Are pets creating tripping hazards (e.g., small animals underfoot)?" },
];

// ── Component ─────────────────────────────────────────────────────────────────

function set<K extends keyof HomeFastData>(
	prev: HomeFastData,
	key: K,
	val: HomeFastData[K]
): HomeFastData {
	return { ...prev, [key]: val };
}

export function SectionHomeFast({ value, onChange }: Props) {
	const s = value;
	const u = <K extends keyof HomeFastData>(k: K, v: HomeFastData[K]) =>
		onChange(set(s, k, v));

	// Initialize items if empty
	const items: HomeFastItem[] = useMemo(() => {
		if (s.items && s.items.length > 0) return s.items;
		return HOME_FAST_QUESTIONS.map((q): HomeFastItem => ({
			id: q.id,
			section: q.section,
			question: q.question,
		}));
	}, [s.items]);

	// Group by section
	const sections = useMemo(() => {
		const map = new Map<string, HomeFastItem[]>();
		for (const item of items) {
			const arr = map.get(item.section) ?? [];
			arr.push(item);
			map.set(item.section, arr);
		}
		return map;
	}, [items]);

	// Compute hazard count — questions are phrased hazard-positively
	// ("Are grab bars absent…?"), so "yes" flags the hazard.
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
				<strong>HOME FAST</strong> — Home Fall-Hazard Assessment for Older
				Adults. Answer each item as asked: <strong>Yes</strong> flags the
				hazard, <strong>No</strong> means no hazard, <strong>N/A</strong>{" "}
				when not applicable.
			</InfoBanner>

			{hazardCount > 0 && (
				<InfoBanner variant="warning">
					<strong>{hazardCount}</strong> hazard(s) identified.
					{hazardCount >= 7 &&
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
				label="Clinician Notes"
				value={s.notes}
				onChange={(v) => u("notes", v)}
				placeholder="Additional observations about the home environment…"
			/>
		</div>
	);
}
