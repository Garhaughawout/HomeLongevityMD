"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
	createClientAction,
	type CreateClientFormState,
} from "@/features/clients/actions/create-client";

const initialState: CreateClientFormState = {};

type FieldProps = {
	label: string;
	name: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
	errors?: string[];
	hint?: string;
};

function Field({
	label,
	name,
	type = "text",
	placeholder,
	required,
	errors,
	hint,
}: FieldProps) {
	const id = `field-${name}`;
	const hasError = errors && errors.length > 0;
	return (
		<div>
			<label
				htmlFor={id}
				className="mb-1 block text-sm font-medium text-[color:var(--foreground)]"
			>
				{label}
				{required && <span className="ml-0.5 text-rose-500">*</span>}
			</label>
			<input
				id={id}
				name={name}
				type={type}
				placeholder={placeholder}
				required={required}
				className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[color:var(--accent)]/40 ${
					hasError
						? "border-rose-400 bg-rose-50 focus:border-rose-400"
						: "border-[color:var(--border)] bg-white focus:border-[color:var(--accent)]"
				}`}
			/>
			{hint && !hasError && (
				<p className="mt-1 text-xs text-[color:var(--muted)]">{hint}</p>
			)}
			{hasError && (
				<p className="mt-1 text-xs text-rose-600">{errors[0]}</p>
			)}
		</div>
	);
}

type AddClientFormProps = {
	onCancel: () => void;
};

function FormActions({ onCancel }: { onCancel: () => void }) {
	const { pending } = useFormStatus();
	return (
		<div className="flex items-center justify-end gap-3 border-t border-[color:var(--border)] pt-5">
			<button
				type="button"
				onClick={onCancel}
				disabled={pending}
				className="rounded-full border border-[color:var(--border)] px-5 py-2 text-sm font-medium text-[color:var(--muted)] transition hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)] disabled:opacity-50"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={pending}
				className="rounded-full bg-[color:var(--accent)] px-5 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:opacity-90 disabled:opacity-50"
			>
				{pending ? "Adding\u2026" : "Add client"}
			</button>
		</div>
	);
}

export function AddClientForm({ onCancel }: AddClientFormProps) {
	const [state, formAction] = useFormState(createClientAction, initialState);
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<form ref={formRef} action={formAction} className="space-y-6">
			{state.globalError && (
				<div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{state.globalError}
				</div>
			)}

			{/* Identity */}
			<fieldset className="space-y-4">
				<legend className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
					Identity
				</legend>
				<Field
					label="Full name"
					name="full_name"
					placeholder="Jane Smith"
					required
					errors={state.errors?.full_name}
				/>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field
						label="Email"
						name="email"
						type="email"
						placeholder="jane@example.com"
						errors={state.errors?.email}
					/>
					<Field
						label="Phone"
						name="phone"
						type="tel"
						placeholder="(555) 000-0000"
						errors={state.errors?.phone}
					/>
				</div>
			</fieldset>

			{/* Address */}
			<fieldset className="space-y-4">
				<legend className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
					Address
				</legend>
				<Field
					label="Address line 1"
					name="address_line1"
					placeholder="123 Main St"
					errors={state.errors?.address_line1}
				/>
				<Field
					label="Address line 2"
					name="address_line2"
					placeholder="Apt 4B"
					errors={state.errors?.address_line2}
				/>
				<div className="grid gap-4 sm:grid-cols-3">
					<div className="sm:col-span-1">
						<Field
							label="City"
							name="city"
							placeholder="Springfield"
							errors={state.errors?.city}
						/>
					</div>
					<Field
						label="State"
						name="state"
						placeholder="IL"
						hint="2-letter code"
						errors={state.errors?.state}
					/>
					<Field
						label="ZIP"
						name="zip"
						placeholder="62701"
						errors={state.errors?.zip}
					/>
				</div>
			</fieldset>

			{/* Actions */}
			<FormActions onCancel={onCancel} />
		</form>
	);
}
