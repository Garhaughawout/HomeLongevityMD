"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/services/auth/session";
import {
	createQuote,
	updateQuote,
	updateQuoteStatus,
	regenerateQuote,
	deleteQuote,
	recordQuoteOutcome,
} from "@/services/quotes";
import { logActivity } from "@/services/activity";
import type { QuoteSuggestion } from "@/services/pricing";

const createQuoteSchema = z.object({
	base_plan_fee: z.coerce.number().positive("Fee must be a positive number"),
	risk_multiplier: z.coerce
		.number()
		.min(1, "Multiplier must be >= 1.0")
		.default(1.0),
	services_included: z.string().trim().optional(),
	valid_until: z
		.string()
		.trim()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
		.or(z.literal(""))
		.optional(),
	assessment_id: z.string().uuid().or(z.literal("")).optional(),
	// Suggestion tracking (hidden fields)
	suggested_base_fee: z.coerce.number().optional(),
	suggested_multiplier: z.coerce.number().optional(),
	suggested_plan_fee: z.coerce.number().optional(),
	suggested_services: z.string().optional(),
});

export type CreateQuoteFormState = {
	errors?: Partial<Record<keyof z.infer<typeof createQuoteSchema>, string[]>>;
	globalError?: string;
	success?: true;
};

export async function createQuoteAction(
	clientId: string,
	_prev: CreateQuoteFormState,
	formData: FormData
): Promise<CreateQuoteFormState> {
	const user = await requireAuthenticatedUser();

	const parsed = createQuoteSchema.safeParse({
		base_plan_fee: formData.get("base_plan_fee"),
		risk_multiplier: formData.get("risk_multiplier") || 1.0,
		services_included: formData.get("services_included"),
		valid_until: formData.get("valid_until"),
		assessment_id: formData.get("assessment_id"),
		suggested_base_fee: formData.get("suggested_base_fee"),
		suggested_multiplier: formData.get("suggested_multiplier"),
		suggested_plan_fee: formData.get("suggested_plan_fee"),
		suggested_services: formData.get("suggested_services"),
	});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	const services = parsed.data.services_included
		? parsed.data.services_included
				.split("\n")
				.map((s) => s.trim())
				.filter(Boolean)
		: undefined;

	// Build suggestion object if we have one
	let suggestion: QuoteSuggestion | undefined;
	if (parsed.data.suggested_base_fee !== undefined) {
		const suggestedServices = parsed.data.suggested_services
			? parsed.data.suggested_services.split("\n").map((s) => s.trim()).filter(Boolean)
			: [];
		suggestion = {
			base_plan_fee: parsed.data.suggested_base_fee,
			risk_multiplier: parsed.data.suggested_multiplier ?? 1.0,
			plan_fee: parsed.data.suggested_plan_fee ?? parsed.data.suggested_base_fee,
			suggested_services: suggestedServices,
		};
	}

	try {
		await createQuote({
			clientId,
			assessmentId: parsed.data.assessment_id || undefined,
			basePlanFee: parsed.data.base_plan_fee,
			riskMultiplier: parsed.data.risk_multiplier,
			servicesIncluded: services,
			validUntil: parsed.data.valid_until || undefined,
			userId: user.id,
			suggestion,
		});

		await logActivity({
			clientId,
			userId: user.id,
			eventType: "quote_generated",
			metadata: { plan_fee: parsed.data.base_plan_fee },
		});
	} catch {
		return { globalError: "Failed to create quote. Please try again." };
	}

	revalidatePath(`/clients/${clientId}/quotes`);
	revalidatePath(`/clients/${clientId}/activity`);
	return { success: true };
}

export async function deleteQuoteAction(
	clientId: string,
	quoteId: string
): Promise<void> {
	const user = await requireAuthenticatedUser();
	await deleteQuote(quoteId);
	await logActivity({
		clientId,
		userId: user.id,
		eventType: "quote_deleted",
	});
	revalidatePath(`/clients/${clientId}/quotes`);
	revalidatePath(`/clients/${clientId}/activity`);
}

const editQuoteSchema = z.object({
	base_plan_fee: z.coerce.number().positive("Fee must be a positive number"),
	risk_multiplier: z.coerce
		.number()
		.min(1, "Multiplier must be >= 1.0")
		.default(1.0),
	services_included: z.string().trim().optional(),
	valid_until: z
		.string()
		.trim()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
		.or(z.literal(""))
		.optional(),
	adjustment_reason: z.string().trim().optional(),
	adjustment_note: z.string().trim().optional(),
});

export type EditQuoteFormState = {
	errors?: Partial<Record<keyof z.infer<typeof editQuoteSchema>, string[]>>;
	globalError?: string;
	success?: true;
};

export async function updateQuoteAction(
	clientId: string,
	quoteId: string,
	_prev: EditQuoteFormState,
	formData: FormData
): Promise<EditQuoteFormState> {
	const user = await requireAuthenticatedUser();

	const parsed = editQuoteSchema.safeParse({
		base_plan_fee: formData.get("base_plan_fee"),
		risk_multiplier: formData.get("risk_multiplier") || 1.0,
		services_included: formData.get("services_included"),
		valid_until: formData.get("valid_until"),
	});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	const services = parsed.data.services_included
		? parsed.data.services_included
				.split("\n")
				.map((s) => s.trim())
				.filter(Boolean)
		: undefined;

	const adjustmentReason = (formData.get("adjustment_reason") as string) || undefined;
	const adjustmentNote = (formData.get("adjustment_note") as string) || undefined;

	try {
		await updateQuote(quoteId, {
			basePlanFee: parsed.data.base_plan_fee,
			riskMultiplier: parsed.data.risk_multiplier,
			servicesIncluded: services,
			validUntil: parsed.data.valid_until || undefined,
			adjustmentReason: adjustmentReason || undefined,
			adjustmentNote: adjustmentNote || undefined,
			userId: user.id,
		});
	} catch {
		return { globalError: "Failed to update quote. Please try again." };
	}

	revalidatePath(`/clients/${clientId}/quotes`);
	return { success: true };
}

// -- Quote outcome action --

const outcomeSchema = z.object({
	outcome: z.enum(["accepted", "declined", "expired", "withdrawn"]),
	decline_reason: z.string().trim().optional(),
	competitor_name: z.string().trim().optional(),
	competitor_price: z.coerce.number().optional(),
	client_feedback: z.string().trim().optional(),
	adjusted_final_price: z.coerce.number().optional(),
});

export type OutcomeFormState = {
	errors?: Partial<Record<keyof z.infer<typeof outcomeSchema>, string[]>>;
	globalError?: string;
	success?: true;
};

export async function recordOutcomeAction(
	clientId: string,
	quoteId: string,
	_prev: OutcomeFormState,
	formData: FormData
): Promise<OutcomeFormState> {
	const user = await requireAuthenticatedUser();

	const parsed = outcomeSchema.safeParse({
		outcome: formData.get("outcome"),
		decline_reason: formData.get("decline_reason"),
		competitor_name: formData.get("competitor_name"),
		competitor_price: formData.get("competitor_price"),
		client_feedback: formData.get("client_feedback"),
		adjusted_final_price: formData.get("adjusted_final_price"),
	});

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await recordQuoteOutcome({
			quoteId,
			clientId,
			outcome: parsed.data.outcome,
			declineReason: parsed.data.decline_reason || undefined,
			competitorName: parsed.data.competitor_name || undefined,
			competitorPrice: parsed.data.competitor_price || undefined,
			clientFeedback: parsed.data.client_feedback || undefined,
			adjustedFinalPrice: parsed.data.adjusted_final_price || undefined,
			userId: user.id,
		});

		const eventType =
			parsed.data.outcome === "accepted" ? "quote_accepted" : "quote_declined";

		await logActivity({
			clientId,
			userId: user.id,
			eventType,
			metadata: {
				reason: parsed.data.decline_reason ?? null,
				final_price: parsed.data.adjusted_final_price ?? null,
			},
		});
	} catch {
		return { globalError: "Failed to record outcome." };
	}

	revalidatePath(`/clients/${clientId}/quotes`);
	revalidatePath(`/clients/${clientId}/activity`);
	return { success: true };
}

export async function updateQuoteStatusAction(
	clientId: string,
	quoteId: string,
	status: "draft" | "sent" | "accepted" | "declined" | "expired"
): Promise<void> {
	const user = await requireAuthenticatedUser();
	await updateQuoteStatus(quoteId, status);

	if (status === "sent") {
		await logActivity({
			clientId,
			userId: user.id,
			eventType: "quote_sent",
		});
	}

	revalidatePath(`/clients/${clientId}/quotes`);
	revalidatePath(`/clients/${clientId}/activity`);
}

export async function regenerateQuoteAction(
	clientId: string,
	quoteId: string
): Promise<void> {
	const user = await requireAuthenticatedUser();
	await regenerateQuote(quoteId, user.id);
	await logActivity({
		clientId,
		userId: user.id,
		eventType: "quote_generated",
		metadata: { regenerated: true },
	});
	revalidatePath(`/clients/${clientId}/quotes`);
	revalidatePath(`/clients/${clientId}/activity`);
}
