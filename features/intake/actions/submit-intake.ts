"use server";

import { requireAuthenticatedUser } from "@/services/auth/session";
import {
	submitIntake,
	createIntake,
	getLatestIntakeByClientId,
	getIntakeById,
} from "@/services/intake";
import { scoreIntake } from "@/services/scoring";
import { persistAssessment } from "@/services/assessments";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SubmitIntakeResult = { success: true } | { error: string };
export type StartRevisionResult = { intakeId: string } | { error: string };

// ── Submit ────────────────────────────────────────────────────────────────────

export async function submitIntakeAction(
	intakeId: string
): Promise<SubmitIntakeResult> {
	try {
		const user = await requireAuthenticatedUser();

		// 1. Fetch the draft intake (need section data for scoring)
		const intake = await getIntakeById(intakeId);
		if (!intake) throw new Error("Intake not found.");

		// 2. Mark as submitted (locks the record)
		const submitted = await submitIntake(intakeId, user.id);

		// 3. Score the submitted intake and persist the assessment
		const scoring = scoreIntake(submitted);
		await persistAssessment(
			submitted.client_id,
			intakeId,
			scoring,
			user.id
		);

		return { success: true };
	} catch (err) {
		const message =
			err instanceof Error
				? err.message
				: "Submit failed. Please try again.";
		return { error: message };
	}
}

// ── Start revision ────────────────────────────────────────────────────────────

/**
 * Creates a new draft intake version for a client whose latest intake
 * is already submitted.  The previous submitted record is preserved.
 */
export async function startRevisionAction(
	clientId: string
): Promise<StartRevisionResult> {
	try {
		const user = await requireAuthenticatedUser();
		const latest = await getLatestIntakeByClientId(clientId);
		const newIntake = await createIntake(
			clientId,
			user.id,
			latest?.version
		);
		return { intakeId: newIntake.id };
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Could not start revision.";
		return { error: message };
	}
}
