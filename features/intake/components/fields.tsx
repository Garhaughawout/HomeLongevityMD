"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitive field components for the intake wizard.
// All components are controlled (value + onChange props).
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";
import type { YesNoNa, YesNoUnknown, AssistanceLevel } from "@/types/intake";

// ── Layout helpers ────────────────────────────────────────────────────────────

type FieldGroupProps = {
	legend: string;
	children: ReactNode;
};

export function FieldGroup({ legend, children }: FieldGroupProps) {
	return (
		<fieldset className="space-y-4">
			<legend className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
				{legend}
			</legend>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{children}
			</div>
		</fieldset>
	);
}

type FieldWrapProps = {
	label: string;
	children: ReactNode;
	hint?: string;
	fullWidth?: boolean;
};

export function FieldWrap({
	label,
	children,
	hint,
	fullWidth,
}: FieldWrapProps) {
	return (
		<div className={fullWidth ? "sm:col-span-2" : undefined}>
			<label className="mb-1.5 block text-sm font-medium text-[color:var(--foreground)]">
				{label}
			</label>
			{children}
			{hint && (
				<p className="mt-1 text-xs text-[color:var(--muted)]">{hint}</p>
			)}
		</div>
	);
}

// ── Yes / No / N/A radio (matches paper form) ─────────────────────────────────

type YesNoNaFieldProps = {
	label: string;
	value: YesNoNa | undefined;
	onChange: (v: YesNoNa) => void;
	hint?: string;
};

export function YesNoNaField({ label, value, onChange, hint }: YesNoNaFieldProps) {
	return (
		<FieldWrap label={label} hint={hint}>
			<div className="flex gap-4">
				{(["yes", "no", "na"] as const).map((opt) => (
					<label
						key={opt}
						className="flex cursor-pointer items-center gap-1.5 text-sm"
					>
						<input
							type="radio"
							checked={value === opt}
							onChange={() => onChange(opt)}
							className="accent-[color:var(--accent)]"
						/>
						{opt === "na"
							? "N/A"
							: opt.charAt(0).toUpperCase() + opt.slice(1)}
					</label>
				))}
			</div>
		</FieldWrap>
	);
}

// ── Yes / No / Unknown radio ──────────────────────────────────────────────────

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
		<FieldWrap label={label} hint={hint}>
			<div className="flex gap-4">
				{(["yes", "no", "unknown"] as const).map((opt) => (
					<label
						key={opt}
						className="flex cursor-pointer items-center gap-1.5 text-sm capitalize"
					>
						<input
							type="radio"
							checked={value === opt}
							onChange={() => onChange(opt)}
							className="accent-[color:var(--accent)]"
						/>
						{opt === "unknown"
							? "Unknown"
							: opt.charAt(0).toUpperCase() + opt.slice(1)}
					</label>
				))}
			</div>
		</FieldWrap>
	);
}

// ── Yes / No radio (no Unknown option) ───────────────────────────────────────

type YesNoFieldProps = {
	label: string;
	value: boolean | undefined;
	onChange: (v: boolean) => void;
	hint?: string;
};

export function YesNoField({ label, value, onChange, hint }: YesNoFieldProps) {
	return (
		<FieldWrap label={label} hint={hint}>
			<div className="flex gap-4">
				{([true, false] as const).map((opt) => (
					<label
						key={String(opt)}
						className="flex cursor-pointer items-center gap-1.5 text-sm"
					>
						<input
							type="radio"
							checked={value === opt}
							onChange={() => onChange(opt)}
							className="accent-[color:var(--accent)]"
						/>
						{opt ? "Yes" : "No"}
					</label>
				))}
			</div>
		</FieldWrap>
	);
}

// ── Independence / Needs Help / Dependent radio ────────────────────────────────

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
		<FieldWrap label={label} hint={hint}>
			<div className="flex gap-4">
				{(
					["independent", "needs_help", "dependent"] as const
				).map((opt) => (
					<label
						key={opt}
						className="flex cursor-pointer items-center gap-1.5 text-sm"
					>
						<input
							type="radio"
							checked={value === opt}
							onChange={() => onChange(opt)}
							className="accent-[color:var(--accent)]"
						/>
						{opt === "needs_help"
							? "Needs Help"
							: opt.charAt(0).toUpperCase() + opt.slice(1)}
					</label>
				))}
			</div>
		</FieldWrap>
	);
}

// ── Assistance Level (1–5) ────────────────────────────────────────────────────

const ASSISTANCE_LABELS: Record<AssistanceLevel, string> = {
	1: "1 – Independent",
	2: "2 – Setup only",
	3: "3 – Minimal assist",
	4: "4 – Moderate assist",
	5: "5 – Total assist",
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
		<FieldWrap label={label}>
			<select
				value={value ?? ""}
				onChange={(e) =>
					onChange(Number(e.target.value) as AssistanceLevel)
				}
				className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
			>
				<option value="">— Select —</option>
				{([1, 2, 3, 4, 5] as AssistanceLevel[]).map((lvl) => (
					<option key={lvl} value={lvl}>
						{ASSISTANCE_LABELS[lvl]}
					</option>
				))}
			</select>
		</FieldWrap>
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
		<FieldWrap label={label} hint={hint}>
			<div className="flex items-center gap-2">
				<input
					type="number"
					value={value ?? ""}
					onChange={(e) => {
						const v =
							e.target.value === ""
								? undefined
								: Number(e.target.value);
						onChange(v);
					}}
					min={min}
					max={max}
					step={step ?? 1}
					className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
				/>
				{unit && (
					<span className="shrink-0 text-sm text-[color:var(--muted)]">
						{unit}
					</span>
				)}
			</div>
		</FieldWrap>
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
		<FieldWrap label={label} hint={hint}>
			<input
				type="text"
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
			/>
		</FieldWrap>
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
		<FieldWrap label={label} fullWidth>
			<textarea
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				rows={rows}
				className="w-full resize-none rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
			/>
		</FieldWrap>
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
		<FieldWrap label={label} hint={hint}>
			<select
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value as T)}
				className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
			>
				<option value="">{placeholder ?? "— Select —"}</option>
				{options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</FieldWrap>
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
		<FieldWrap label={label} hint={hint} fullWidth>
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
				<span className="w-8 text-center text-sm font-semibold text-[color:var(--foreground)]">
					{value ?? 0}
				</span>
			</div>
			<div className="mt-1 flex justify-between text-xs text-[color:var(--muted)]">
				<span>0 – No pain</span>
				<span>10 – Worst possible</span>
			</div>
		</FieldWrap>
	);
}

// ── Checkbox group ────────────────────────────────────────────────────────────

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
		<FieldWrap label={label} hint={hint} fullWidth>
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{options.map((opt) => (
					<label
						key={opt.value}
						className="flex cursor-pointer items-center gap-2 text-sm"
					>
						<input
							type="checkbox"
							checked={current.includes(opt.value)}
							onChange={() => toggle(opt.value)}
							className="accent-[color:var(--accent)]"
						/>
						{opt.label}
					</label>
				))}
			</div>
		</FieldWrap>
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
			className={`rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}
		>
			{children}
		</div>
	);
}
