"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitive field components for the intake wizard.
// Clinical-worksheet style: each question is one row — full-sentence label in
// foreground text on the left, a segmented answer control on the right, rows
// separated by hairline dividers inside a section card.
// All components are controlled (value + onChange props).
// ─────────────────────────────────────────────────────────────────────────────

import { Children, isValidElement, type ReactNode } from "react";
import type { YesNoNa, YesNoUnknown, AssistanceLevel } from "@/types/intake";

// ── Section card with answered counter ────────────────────────────────────────

function countAnswers(children: ReactNode): { answered: number; total: number } {
	let answered = 0;
	let total = 0;
	Children.forEach(children, (child) => {
		if (!isValidElement(child)) return;
		const p = child.props as Record<string, unknown>;
		if (!("value" in p) && !("values" in p)) return;
		total += 1;
		const v = "values" in p ? p.values : p.value;
		const isAnswered = Array.isArray(v)
			? v.length > 0
			: v !== undefined && v !== null && v !== "";
		if (isAnswered) answered += 1;
	});
	return { answered, total };
}

type FieldGroupProps = {
	legend: string;
	description?: ReactNode;
	/** Overrides the auto "N of M" counter chip (e.g. a points subtotal) */
	badge?: string;
	children: ReactNode;
};

export function FieldGroup({ legend, description, badge, children }: FieldGroupProps) {
	const { answered, total } = countAnswers(children);
	const chip = badge ?? (total >= 2 ? `${answered} of ${total}` : null);
	const complete = badge === undefined && total >= 2 && answered === total;

	return (
		<section className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4">
			<div className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] pb-3">
				<div>
					<h3 className="text-base font-semibold text-[color:var(--foreground)]">
						{legend}
					</h3>
					{description && (
						<p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">
							{description}
						</p>
					)}
				</div>
				{chip && (
					<span
						className={[
							"shrink-0 rounded-full px-2.5 py-1 text-sm font-medium tabular-nums",
							complete
								? "bg-emerald-100 text-emerald-800"
								: "border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--foreground)]",
						].join(" ")}
					>
						{chip}
					</span>
				)}
			</div>
			<div className="divide-y divide-[color:var(--border)]">{children}</div>
		</section>
	);
}

// ── Worksheet row ─────────────────────────────────────────────────────────────

type FieldRowProps = {
	label: string;
	children: ReactNode;
	hint?: string;
	/** Stack the control below the label (textareas, sliders, chip grids) */
	stacked?: boolean;
};

export function FieldRow({ label, children, hint, stacked }: FieldRowProps) {
	if (stacked) {
		return (
			<div className="py-3.5">
				<p className="text-[15px] leading-snug text-[color:var(--foreground)]">
					{label}
				</p>
				{hint && (
					<p className="mt-0.5 text-xs text-[color:var(--muted)]">{hint}</p>
				)}
				<div className="mt-2">{children}</div>
			</div>
		);
	}
	return (
		<div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5">
			<div className="min-w-[12rem] flex-1">
				<p className="text-[15px] leading-snug text-[color:var(--foreground)]">
					{label}
				</p>
				{hint && (
					<p className="mt-0.5 text-xs text-[color:var(--muted)]">{hint}</p>
				)}
			</div>
			<div className="shrink-0">{children}</div>
		</div>
	);
}

/** Kept for backward compatibility — renders a stacked worksheet row. */
export function FieldWrap({
	label,
	children,
	hint,
}: {
	label: string;
	children: ReactNode;
	hint?: string;
	fullWidth?: boolean;
}) {
	return (
		<FieldRow label={label} hint={hint} stacked>
			{children}
		</FieldRow>
	);
}

// ── Segmented answer control ──────────────────────────────────────────────────

type SegmentedOption<T> = { value: T; label: string };

export function SegmentedControl<T extends string | number | boolean>({
	options,
	value,
	onChange,
	ariaLabel,
}: {
	options: Array<SegmentedOption<T>>;
	value: T | undefined;
	onChange: (v: T) => void;
	ariaLabel?: string;
}) {
	return (
		<div
			role="group"
			aria-label={ariaLabel}
			className="inline-flex overflow-hidden rounded-lg border border-[color:var(--border-strong)] [&>button+button]:border-l [&>button+button]:border-[color:var(--border-strong)]"
		>
			{options.map((opt) => {
				const active = value === opt.value;
				return (
					<button
						key={String(opt.value)}
						type="button"
						aria-pressed={active}
						onClick={() => onChange(opt.value)}
						className={[
							"min-h-10 min-w-[2.75rem] px-3.5 py-1.5 text-sm font-medium transition-colors",
							active
								? "bg-[color:var(--accent)] text-white"
								: "bg-[color:var(--surface-strong)] text-[color:var(--muted-strong)] hover:bg-[color:var(--surface)]",
						].join(" ")}
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}

// ── Single-select chips (for option sets too long for a segmented control) ───

type ChipSelectFieldProps<T extends string> = {
	label: string;
	value: T | undefined;
	onChange: (v: T) => void;
	options: Array<{ value: T; label: string }>;
	hint?: string;
};

export function ChipSelectField<T extends string>({
	label,
	value,
	onChange,
	options,
	hint,
}: ChipSelectFieldProps<T>) {
	return (
		<FieldRow label={label} hint={hint} stacked>
			<div className="flex flex-wrap gap-2" role="group" aria-label={label}>
				{options.map((opt) => {
					const active = value === opt.value;
					return (
						<button
							key={opt.value}
							type="button"
							aria-pressed={active}
							onClick={() => onChange(opt.value)}
							className={[
								"min-h-10 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors",
								active
									? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
									: "border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] text-[color:var(--muted-strong)] hover:bg-[color:var(--surface)]",
							].join(" ")}
						>
							{opt.label}
						</button>
					);
				})}
			</div>
		</FieldRow>
	);
}

// ── Yes / No / N/A ────────────────────────────────────────────────────────────

type YesNoNaFieldProps = {
	label: string;
	value: YesNoNa | undefined;
	onChange: (v: YesNoNa) => void;
	hint?: string;
};

export function YesNoNaField({ label, value, onChange, hint }: YesNoNaFieldProps) {
	return (
		<FieldRow label={label} hint={hint}>
			<SegmentedControl
				ariaLabel={label}
				value={value}
				onChange={onChange}
				options={[
					{ value: "yes", label: "Yes" },
					{ value: "no", label: "No" },
					{ value: "na", label: "N/A" },
				]}
			/>
		</FieldRow>
	);
}

// ── Yes / No / Unknown ────────────────────────────────────────────────────────

type YesNoUnknownFieldProps = {
	label: string;
	value: YesNoUnknown | undefined;
	onChange: (v: YesNoUnknown) => void;
	hint?: string;
};

export function YesNoUnknownField({
	label,
	value,
	onChange,
	hint,
}: YesNoUnknownFieldProps) {
	return (
		<FieldRow label={label} hint={hint}>
			<SegmentedControl
				ariaLabel={label}
				value={value}
				onChange={onChange}
				options={[
					{ value: "yes", label: "Yes" },
					{ value: "no", label: "No" },
					{ value: "unknown", label: "Unknown" },
				]}
			/>
		</FieldRow>
	);
}

// ── Yes / No ──────────────────────────────────────────────────────────────────

type YesNoFieldProps = {
	label: string;
	value: boolean | undefined;
	onChange: (v: boolean) => void;
	hint?: string;
};

export function YesNoField({ label, value, onChange, hint }: YesNoFieldProps) {
	return (
		<FieldRow label={label} hint={hint}>
			<SegmentedControl
				ariaLabel={label}
				value={value}
				onChange={onChange}
				options={[
					{ value: true, label: "Yes" },
					{ value: false, label: "No" },
				]}
			/>
		</FieldRow>
	);
}

// ── Independent / Needs help / Dependent ──────────────────────────────────────

type IndependenceLevelFieldProps = {
	label: string;
	value: "independent" | "needs_help" | "dependent" | undefined;
	onChange: (v: "independent" | "needs_help" | "dependent") => void;
	hint?: string;
};

export function IndependenceLevelField({
	label,
	value,
	onChange,
	hint,
}: IndependenceLevelFieldProps) {
	return (
		<FieldRow label={label} hint={hint}>
			<SegmentedControl
				ariaLabel={label}
				value={value}
				onChange={onChange}
				options={[
					{ value: "independent", label: "Independent" },
					{ value: "needs_help", label: "Needs help" },
					{ value: "dependent", label: "Dependent" },
				]}
			/>
		</FieldRow>
	);
}

// ── Assistance level (1–5) ────────────────────────────────────────────────────

const ASSISTANCE_LABELS: Record<AssistanceLevel, string> = {
	1: "Independent",
	2: "Setup only",
	3: "Minimal assist",
	4: "Moderate assist",
	5: "Total assist",
};

type AssistanceLevelFieldProps = {
	label: string;
	value: AssistanceLevel | undefined;
	onChange: (v: AssistanceLevel) => void;
};

export function AssistanceLevelField({
	label,
	value,
	onChange,
}: AssistanceLevelFieldProps) {
	return (
		<FieldRow
			label={label}
			hint={
				value !== undefined
					? `${value} — ${ASSISTANCE_LABELS[value]}`
					: "1 = independent · 5 = total assist"
			}
		>
			<SegmentedControl
				ariaLabel={label}
				value={value}
				onChange={onChange}
				options={([1, 2, 3, 4, 5] as AssistanceLevel[]).map((lvl) => ({
					value: lvl,
					label: String(lvl),
				}))}
			/>
		</FieldRow>
	);
}

// ── Number input ──────────────────────────────────────────────────────────────

type NumberFieldProps = {
	label: string;
	value: number | undefined;
	onChange: (v: number | undefined) => void;
	min?: number;
	max?: number;
	step?: number;
	hint?: string;
	unit?: string;
};

export function NumberField({
	label,
	value,
	onChange,
	min,
	max,
	step,
	hint,
	unit,
}: NumberFieldProps) {
	return (
		<FieldRow label={label} hint={hint}>
			<div className="flex items-center gap-2">
				<input
					type="number"
					value={value ?? ""}
					onChange={(e) => {
						const v =
							e.target.value === "" ? undefined : Number(e.target.value);
						onChange(v);
					}}
					min={min}
					max={max}
					step={step ?? 1}
					className="w-28 rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] px-3 py-2 text-right text-[15px] text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
				/>
				{unit && (
					<span className="shrink-0 text-sm text-[color:var(--muted)]">
						{unit}
					</span>
				)}
			</div>
		</FieldRow>
	);
}

// ── Text input ────────────────────────────────────────────────────────────────

type TextFieldProps = {
	label: string;
	value: string | undefined;
	onChange: (v: string) => void;
	placeholder?: string;
	hint?: string;
};

export function TextField({
	label,
	value,
	onChange,
	placeholder,
	hint,
}: TextFieldProps) {
	return (
		<FieldRow label={label} hint={hint}>
			<input
				type="text"
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="w-full rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] px-3 py-2 text-[15px] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] sm:w-72"
			/>
		</FieldRow>
	);
}

// ── Textarea ──────────────────────────────────────────────────────────────────

type TextareaFieldProps = {
	label: string;
	value: string | undefined;
	onChange: (v: string) => void;
	placeholder?: string;
	rows?: number;
};

export function TextareaField({
	label,
	value,
	onChange,
	placeholder,
	rows = 3,
}: TextareaFieldProps) {
	return (
		<FieldRow label={label} stacked>
			<textarea
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				rows={rows}
				className="w-full resize-none rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] px-3 py-2 text-[15px] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
			/>
		</FieldRow>
	);
}

// ── Select ────────────────────────────────────────────────────────────────────

type SelectFieldProps<T extends string> = {
	label: string;
	value: T | undefined;
	onChange: (v: T) => void;
	options: Array<{ value: T; label: string }>;
	placeholder?: string;
	hint?: string;
};

export function SelectField<T extends string>({
	label,
	value,
	onChange,
	options,
	placeholder,
	hint,
}: SelectFieldProps<T>) {
	return (
		<FieldRow label={label} hint={hint}>
			<select
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value as T)}
				className="w-full rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] px-3 py-2 text-[15px] text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] sm:w-72"
			>
				<option value="">{placeholder ?? "— Select —"}</option>
				{options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</FieldRow>
	);
}

// ── NRS pain slider (0–10) ────────────────────────────────────────────────────

type NrsSliderProps = {
	label: string;
	value: number | undefined;
	onChange: (v: number) => void;
	hint?: string;
};

export function NrsSlider({ label, value, onChange, hint }: NrsSliderProps) {
	return (
		<FieldRow label={label} hint={hint} stacked>
			<div className="flex items-center gap-3">
				<input
					type="range"
					min={0}
					max={10}
					step={1}
					value={value ?? 0}
					onChange={(e) => onChange(Number(e.target.value))}
					className="flex-1 accent-[color:var(--accent)]"
				/>
				<span className="w-8 text-center text-[15px] font-semibold text-[color:var(--foreground)]">
					{value ?? 0}
				</span>
			</div>
			<div className="mt-1 flex justify-between text-xs text-[color:var(--muted)]">
				<span>0 – No pain</span>
				<span>10 – Worst possible</span>
			</div>
		</FieldRow>
	);
}

// ── Checkbox group (multi-select chips) ───────────────────────────────────────

type CheckboxGroupProps = {
	label: string;
	options: Array<{ value: string; label: string }>;
	values: string[] | undefined;
	onChange: (v: string[]) => void;
	hint?: string;
};

export function CheckboxGroup({
	label,
	options,
	values,
	onChange,
	hint,
}: CheckboxGroupProps) {
	const current = values ?? [];

	function toggle(val: string) {
		if (current.includes(val)) {
			onChange(current.filter((v) => v !== val));
		} else {
			onChange([...current, val]);
		}
	}

	return (
		<FieldRow label={label} hint={hint} stacked>
			<div className="flex flex-wrap gap-2">
				{options.map((opt) => {
					const active = current.includes(opt.value);
					return (
						<button
							key={opt.value}
							type="button"
							aria-pressed={active}
							onClick={() => toggle(opt.value)}
							className={[
								"min-h-10 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors",
								active
									? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
									: "border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] text-[color:var(--muted-strong)] hover:bg-[color:var(--surface)]",
							].join(" ")}
						>
							{opt.label}
						</button>
					);
				})}
			</div>
		</FieldRow>
	);
}

// ── Info banner (for trigger notifications) ──────────────────────────────────

type InfoBannerProps = {
	children: ReactNode;
	variant?: "info" | "warning" | "success";
};

export function InfoBanner({ children, variant = "info" }: InfoBannerProps) {
	const styles: Record<string, string> = {
		info: "border-blue-200 bg-blue-50 text-blue-800",
		warning: "border-amber-200 bg-amber-50 text-amber-800",
		success: "border-emerald-200 bg-emerald-50 text-emerald-800",
	};

	return (
		<div
			className={`rounded-lg border px-4 py-3 text-[15px] leading-relaxed ${styles[variant]}`}
		>
			{children}
		</div>
	);
}
