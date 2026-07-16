import { createServerSupabaseClient } from "@/services/supabase/server";
import type { ActivityLogRow } from "@/types/supabase";

// -- Read --

export async function getActivityByClientId(
	clientId: string
): Promise<ActivityLogRow[]> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("activity_log")
		.select("*")
		.eq("client_id", clientId)
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) throw new Error(error.message);
	return data ?? [];
}

export async function getRecentActivity(limit = 50): Promise<ActivityLogRow[]> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("activity_log")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error) throw new Error(error.message);
	return data ?? [];
}

// -- Write --

type EventType =
	| "client_created"
	| "client_updated"
	| "client_status_changed"
	| "intake_saved"
	| "intake_submitted"
	| "assessment_persisted"
	| "assessment_deleted"
	| "quote_generated"
	| "quote_sent"
	| "quote_accepted"
	| "quote_declined"
	| "quote_deleted"
	| "note_created"
	| "note_deleted";

type LogActivityInput = {
	clientId: string;
	userId: string;
	eventType: EventType;
	metadata?: Record<string, string | number | boolean | null>;
};

export async function logActivity({
	clientId,
	userId,
	eventType,
	metadata,
}: LogActivityInput): Promise<void> {
	const supabase = createServerSupabaseClient();
	const { error } = await supabase.from("activity_log").insert({
		client_id: clientId,
		event_type: eventType,
		actor_id: userId,
		metadata: metadata ?? {},
	});

	if (error) {
		// Don't throw — activity logging is best-effort.
		// The primary action already succeeded.
		console.error("Failed to log activity:", error.message);
	}
}
