"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser } from "@/services/auth/session";
import { deleteAssessment } from "@/services/assessments";
import { logActivity } from "@/services/activity";

export type DeleteAssessmentResult = { success: true } | { error: string };

export async function deleteAssessmentAction(
	clientId: string,
	assessmentId: string
): Promise<DeleteAssessmentResult> {
	try {
		const user = await requireAuthenticatedUser();

		await deleteAssessment(assessmentId);

		await logActivity({
			clientId,
			userId: user.id,
			eventType: "assessment_deleted",
		});

		revalidatePath(`/clients/${clientId}/assessments`);
		revalidatePath(`/clients/${clientId}/activity`);
		revalidatePath("/assessments");
		return { success: true };
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Delete failed. Please try again.";
		return { error: message };
	}
}
