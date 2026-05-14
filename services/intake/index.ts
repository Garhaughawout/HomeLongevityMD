import { createServerSupabaseClient } from "@/services/supabase/server";
import type { ClientIntakeRow } from "@/types/supabase";
import type { Json } from "@/types/database";
import type { IntakeSectionKey } from "@/types/domain";

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getIntakeById(
	intakeId: string
): Promise<ClientIntakeRow | null> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("client_intake")
		.select("*")
		.eq("id", intakeId)
		.maybeSingle();

	if (error) throw new Error(error.message);
	return data;
}

/**
 * Returns the most recent intake record for a client (any status).
 * Returns null if no intake exists yet.
 */
export async function getLatestIntakeByClientId(
	clientId: string
): Promise<ClientIntakeRow | null> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("client_intake")
		.select("*")
		.eq("client_id", clientId)
		.order("version", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error) throw new Error(error.message);
	return data;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Creates a blank draft intake for a client. If a prior intake exists,
 * increments the version number so the submitted record is preserved.
 */
export async function createIntake(
	clientId: string,
	userId: string,
	previousVersion?: number
): Promise<ClientIntakeRow> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("client_intake")
		.insert({
			client_id: clientId,
			created_by: userId,
			status: "draft",
			version: previousVersion ? previousVersion + 1 : 1,
		})
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}

/**
 * Overwrites a single JSONB section on an existing intake record.
 * The updated_at trigger increments automatically.
 */
export async function upsertSection(
	intakeId: string,
	sectionKey: IntakeSectionKey,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: Record<string, any>
): Promise<ClientIntakeRow> {
	const supabase = createServerSupabaseClient();
	// Build patch as a typed Json record so Supabase's strict Update type accepts it
	const patch: Record<string, Json> = { [sectionKey]: data as Json };
	const { data: updated, error } = await supabase
		.from("client_intake")
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		.update(patch as any)
		.eq("id", intakeId)
		.eq("status", "draft") // safety: never mutate submitted intakes
		.select()
		.single();

	if (error) throw new Error(error.message);
	return updated;
}

/**
 * Marks an intake as submitted and records who submitted it.
 * This is irreversible on the submitted record; use createIntake for revisions.
 */
export async function submitIntake(
	intakeId: string,
	userId: string
): Promise<ClientIntakeRow> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("client_intake")
		.update({
			status: "submitted",
			submitted_at: new Date().toISOString(),
			submitted_by: userId,
		})
		.eq("id", intakeId)
		.eq("status", "draft") // guard: only draft records can be submitted
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}
