"use client";

import { useState } from "react";
import type { HomeModificationsData, ModificationItem, ModificationCategory, ModificationPriority } from "@/types/modifications";
import {
	MODIFICATION_CATALOG,
	MODIFICATION_CATALOG_MAP,
	PRIORITY_LABELS,
	PRIORITY_COLORS,
	CATEGORY_LABELS,
} from "@/types/modifications";
import { FieldGroup, TextareaField, InfoBanner } from "./fields";
import type { HomeFinding } from "@/features/intake/lib/findings";

type Props = {
	value: HomeModificationsData;
	onChange: (v: HomeModificationsData) => void;
	/** Issues flagged during assessment (STEADI hazards, Tier 2 findings) */
	findings?: HomeFinding[];
};

let idCounter = 0;
function genId(): string {
	idCounter += 1;
	return `mod-${Date.now()}-${idCounter}`;
}

export function SectionHomeModifications({ value, onChange, findings = [] }: Props) {
	const [selectedType, setSelectedType] = useState("");
	const [customMode, setCustomMode] = useState(false);

	function findingIsAdded(f: HomeFinding): boolean {
		return value.items.some((item) => item.triggered_by === f.triggered_by);
	}

	function addFromFinding(f: HomeFinding) {
		if (findingIsAdded(f)) return;
		const entry = f.suggested_type
			? MODIFICATION_CATALOG_MAP[f.suggested_type]
			: undefined;
		const item: ModificationItem = {
			id: genId(),
			category: entry?.category ?? f.suggested_category,
			modification_type: f.suggested_type ?? "custom",
			description: entry?.label ?? "",
			estimated_cost: entry?.default_cost ?? 0,
			priority: "recommended",
			triggered_by: f.triggered_by,
		};
		onChange({ ...value, items: [...value.items, item] });
	}

	function addItem(modType: string, overrides?: Partial<ModificationItem>) {
		const catalogEntry = MODIFICATION_CATALOG_MAP[modType];
		const item: ModificationItem = {
			id: genId(),
			category: (catalogEntry?.category ?? "general") as ModificationCategory,
			modification_type: modType,
			description: catalogEntry?.label ?? modType,
			estimated_cost: catalogEntry?.default_cost ?? 0,
			priority: "recommended",
			...overrides,
		};
		const newItems = [...value.items, item];
		onChange({ ...value, items: newItems });
	}

	function addCustomItem() {
		const item: ModificationItem = {
			id: genId(),
			category: "general",
			modification_type: "custom",
			description: "",
			estimated_cost: 0,
			priority: "recommended",
		};
		const newItems = [...value.items, item];
		onChange({ ...value, items: newItems });
	}

	function updateItem(id: string, field: keyof ModificationItem, val: unknown) {
		const newItems = value.items.map((item) =>
			item.id === id ? { ...item, [field]: val } : item
		);
		onChange({ ...value, items: newItems });
	}

	function removeItem(id: string) {
		const newItems = value.items.filter((item) => item.id !== id);
		onChange({ ...value, items: newItems });
	}

	const totalCost = value.items.reduce((sum, item) => sum + (item.estimated_cost ?? 0), 0);

	// Group catalog by category for the dropdown
	const catalogByCategory: Record<string, typeof MODIFICATION_CATALOG> = {};
	for (const entry of MODIFICATION_CATALOG) {
		if (!catalogByCategory[entry.category]) catalogByCategory[entry.category] = [];
		catalogByCategory[entry.category].push(entry);
	}

	return (
		<div className="space-y-6">
			<InfoBanner variant="info">
				<strong>Home modifications</strong> — record the recommended
				modifications based on assessment findings. Adding from a finding
				links the modification to its evidence, which feeds the pricing
				model.
			</InfoBanner>

			{/* Findings from assessment */}
			{findings.length > 0 && (
				<FieldGroup
					legend="Findings from assessment"
					description="Issues flagged during the STEADI checklist and Tier 2 environmental review. Add the matching modification with one click — the trigger is recorded automatically."
					badge={`${findings.length} found`}
				>
					{findings.map((f) => {
						const added = findingIsAdded(f);
						const suggestion = f.suggested_type
							? MODIFICATION_CATALOG_MAP[f.suggested_type]
							: undefined;
						return (
							<div
								key={f.id}
								className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5"
							>
								<div className="min-w-[14rem] flex-1">
									<p className="text-[15px] leading-snug text-[color:var(--foreground)]">
										{f.description}
									</p>
									<p className="mt-0.5 text-xs text-[color:var(--muted)]">
										{f.area}
										{" · "}
										{f.source === "steadi" ? "STEADI" : "Tier 2 environmental"}
										{suggestion && (
											<>
												{" · suggests "}
												{suggestion.label} (${suggestion.default_cost})
											</>
										)}
									</p>
								</div>
								{added ? (
									<span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
										Added
									</span>
								) : (
									<button
										type="button"
										onClick={() => addFromFinding(f)}
										className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white"
										style={{ backgroundColor: "var(--accent)" }}
									>
										{suggestion ? "Add modification" : "Add as custom"}
									</button>
								)}
							</div>
						);
					})}
				</FieldGroup>
			)}

			{/* Add from catalog */}
			<FieldGroup legend="Add Modification">
				<div className="flex gap-2">
					<select
						value={selectedType}
						onChange={(e) => setSelectedType(e.target.value)}
						className="flex-1 rounded-lg border px-3 py-2 text-sm"
						style={{
							borderColor: "var(--border-strong)",
							color: "var(--foreground)",
							backgroundColor: "var(--surface-strong)",
						}}
					>
						<option value="">Select from catalog...</option>
						{Object.entries(catalogByCategory).map(([cat, items]) => (
							<optgroup key={cat} label={CATEGORY_LABELS[cat as ModificationCategory] ?? cat}>
								{items.map((entry) => (
									<option key={entry.type} value={entry.type}>
										{entry.label} (${entry.default_cost})
									</option>
								))}
							</optgroup>
						))}
					</select>
					<button
						type="button"
						disabled={!selectedType}
						onClick={() => {
							addItem(selectedType);
							setSelectedType("");
						}}
						className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						style={{ backgroundColor: "var(--navy)" }}
					>
						Add
					</button>
					<button
						type="button"
						onClick={() => {
							addCustomItem();
							setCustomMode(true);
						}}
						className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium border"
						style={{
							borderColor: "var(--border-strong)",
							color: "var(--foreground)",
						}}
					>
						+ Custom
					</button>
				</div>
			</FieldGroup>

			{/* Items list */}
			{value.items.length > 0 ? (
				<div className="space-y-3">
					{value.items.map((item) => (
						<div
							key={item.id}
							className="rounded-xl p-4 space-y-3"
							style={{
								background: "var(--surface)",
								border: "1px solid var(--border)",
							}}
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 space-y-3">
									{/* Description / label */}
									<div>
										<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
											Modification
										</label>
										<input
											type="text"
											value={item.description ?? ""}
											onChange={(e) => updateItem(item.id, "description", e.target.value)}
											className="w-full rounded-lg border px-3 py-2 text-sm"
											style={{
												borderColor: "var(--border-strong)",
												color: "var(--foreground)",
												backgroundColor: "var(--surface-strong)",
											}}
											placeholder="e.g., Install grab bars in bathroom"
										/>
									</div>

									<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
										{/* Category */}
										<div>
											<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
												Category
											</label>
											<select
												value={item.category}
												onChange={(e) => updateItem(item.id, "category", e.target.value)}
												className="w-full rounded-lg border px-2 py-1.5 text-xs"
												style={{
													borderColor: "var(--border-strong)",
													color: "var(--foreground)",
													backgroundColor: "var(--surface-strong)",
												}}
											>
												{Object.entries(CATEGORY_LABELS).map(([val, label]) => (
													<option key={val} value={val}>{label}</option>
												))}
											</select>
										</div>

										{/* Priority */}
										<div>
											<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
												Priority
											</label>
											<select
												value={item.priority}
												onChange={(e) => updateItem(item.id, "priority", e.target.value)}
												className="w-full rounded-lg border px-2 py-1.5 text-xs"
												style={{
													borderColor: "var(--border-strong)",
													color: "var(--foreground)",
													backgroundColor: "var(--surface-strong)",
												}}
											>
												{Object.entries(PRIORITY_LABELS).map(([val, label]) => (
													<option key={val} value={val}>{label}</option>
												))}
											</select>
										</div>

										{/* Estimated cost */}
										<div>
											<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
												Est. Cost ($)
											</label>
											<input
												type="number"
												min="0"
												step="1"
												value={item.estimated_cost ?? 0}
												onChange={(e) => updateItem(item.id, "estimated_cost", Number(e.target.value))}
												className="w-full rounded-lg border px-2 py-1.5 text-xs"
												style={{
													borderColor: "var(--border-strong)",
													color: "var(--foreground)",
													backgroundColor: "var(--surface-strong)",
												}}
											/>
										</div>

										{/* Triggered by */}
										<div>
											<label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
												Triggered By
											</label>
											<input
												type="text"
												value={item.triggered_by ?? ""}
												onChange={(e) => updateItem(item.id, "triggered_by", e.target.value)}
												className="w-full rounded-lg border px-2 py-1.5 text-xs"
												style={{
													borderColor: "var(--border-strong)",
													color: "var(--foreground)",
													backgroundColor: "var(--surface-strong)",
												}}
												placeholder="e.g., STEADI bathroom"
											/>
										</div>
									</div>
								</div>

								{/* Remove button */}
								<button
									type="button"
									onClick={() => removeItem(item.id)}
									className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium"
									style={{
										color: "#dc2626",
										border: "1px solid var(--border-strong)",
									}}
								>
									Remove
								</button>
							</div>

							{/* Priority indicator */}
							<div className="flex items-center gap-2">
								<span
									className="h-2 w-2 rounded-full"
									style={{ backgroundColor: PRIORITY_COLORS[item.priority] }}
								/>
								<span className="text-xs" style={{ color: "var(--muted)" }}>
									{PRIORITY_LABELS[item.priority]}
								</span>
							</div>
						</div>
					))}
				</div>
			) : (
				<div
					className="rounded-xl p-8 text-center"
					style={{
						background: "var(--surface)",
						border: "1px solid var(--border)",
					}}
				>
					<p className="text-sm" style={{ color: "var(--muted)" }}>
						No modifications added yet. Select from the catalog above or add a custom item.
					</p>
				</div>
			)}

			{/* Total */}
			{value.items.length > 0 && (
				<div
					className="flex items-center justify-between rounded-xl px-4 py-3"
					style={{
						background: "var(--surface)",
						border: "1px solid var(--border)",
					}}
				>
					<span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
						Total Estimated Cost
					</span>
					<span className="text-lg font-bold tabular-nums" style={{ color: "var(--navy)" }}>
						${totalCost.toLocaleString()}
					</span>
				</div>
			)}

			<TextareaField
				label="Assessor Notes"
				value={value.notes ?? ""}
				onChange={(v) => onChange({ ...value, notes: v })}
				placeholder="Overall approach, sequencing, client preferences..."
			/>
		</div>
	);
}
