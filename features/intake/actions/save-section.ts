"use server";

import { requireAuthenticatedUser } from "@/services/auth/session";
import {
	getLatestIntakeByClientId,
	createIntake,
	upsertSection,
} from "@/services/intake";
import { logActivity } from "@/services/activity";
import type { IntakeSectionKey } from "@/types/domain";

// -- Types --

export type SaveSectionResult =
	| { intakeId: string; updatedAt: string }
	| { error: string };

// -- Action --

export async function saveSectionAction(
	clientId: string,
	sectionKey: IntakeSectionKey,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: Record<string, any>,
	intakeId: string | null
): Promise<SaveSectionResult> {
	try {
		const user = await requireAuthenticatedUser();

		let resolvedIntakeId = intakeId;

		if (!resolvedIntakeId) {
			// Find existing draft or create a new one
			const existing = await getLatestIntakeByClientId(clientId);
			if (existing && existing.status === "draft") {
				resolvedIntakeId = existing.id;
			} else {
				const created = await createIntake(
					clientId,
					user.id,
					existing?.version
				);
				resolvedIntakeId = created.id;
			}
		}

		const updated = await upsertSection(resolvedIntakeId, sectionKey, data);

		await logActivity({
			clientId,
			userId: user.id,
			eventType: "intake_saved",
			metadata: { section: sectionKey },
		});

		return { intakeId: updated.id, updatedAt: updated.updated_at };
	} catch (err) {
		const message =
			err instanceof Error
				? err.message
				: "Save failed. Please try again.";
		return { error: message };
	}
}
