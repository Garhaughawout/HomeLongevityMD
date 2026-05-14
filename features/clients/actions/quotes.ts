"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/services/auth/session";
import {
	createQuote,
	updateQuoteStatus,
	regenerateQuote,
} from "@/services/quotes";

const createQuoteSchema = z.object({
	base_plan_fee: z.coerce.number().positive("Fee must be a positive number"),
	risk_multiplier: z.coerce
		.number()
		.min(1, "Multiplier must be ≥ 1.0")
		.default(1.0),
	services_included: z.string().trim().optional(),
	valid_until: z
		.string()
		.trim()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
		.or(z.literal(""))
		.optional(),
	assessment_id: z.string().uuid().or(z.literal("")).optional(),
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

	try {
		await createQuote({
			clientId,
			assessmentId: parsed.data.assessment_id || undefined,
			basePlanFee: parsed.data.base_plan_fee,
			riskMultiplier: parsed.data.risk_multiplier,
			servicesIncluded: services,
			validUntil: parsed.data.valid_until || undefined,
			userId: user.id,
		});
	} catch {
		return { globalError: "Failed to create quote. Please try again." };
	}

	revalidatePath(`/clients/${clientId}/quotes`);
	return { success: true };
}

export async function updateQuoteStatusAction(
	clientId: string,
	quoteId: string,
	status: "draft" | "sent" | "accepted" | "declined" | "expired"
): Promise<void> {
	await requireAuthenticatedUser();
	await updateQuoteStatus(quoteId, status);
	revalidatePath(`/clients/${clientId}/quotes`);
}

export async function regenerateQuoteAction(
	clientId: string,
	quoteId: string
): Promise<void> {
	const user = await requireAuthenticatedUser();
	await regenerateQuote(quoteId, user.id);
	revalidatePath(`/clients/${clientId}/quotes`);
}
