"use server";

import { requireAuthenticatedUser } from "@/services/auth/session";
import {
  submitIntake,
  createIntake,
  getLatestIntakeByClientId,
} from "@/services/intake";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SubmitIntakeResult = { success: true } | { error: string };
export type StartRevisionResult = { intakeId: string } | { error: string };

// ── Submit ────────────────────────────────────────────────────────────────────

export async function submitIntakeAction(
  intakeId: string,
): Promise<SubmitIntakeResult> {
  try {
    const user = await requireAuthenticatedUser();
    await submitIntake(intakeId, user.id);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Submit failed. Please try again.";
    return { error: message };
  }
}

// ── Start revision ────────────────────────────────────────────────────────────

/**
 * Creates a new draft intake version for a client whose latest intake
 * is already submitted.  The previous submitted record is preserved.
 */
export async function startRevisionAction(
  clientId: string,
): Promise<StartRevisionResult> {
  try {
    const user = await requireAuthenticatedUser();
    const latest = await getLatestIntakeByClientId(clientId);
    const newIntake = await createIntake(clientId, user.id, latest?.version);
    return { intakeId: newIntake.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start revision.";
    return { error: message };
  }
}
