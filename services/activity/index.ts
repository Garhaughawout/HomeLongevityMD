import { createServerSupabaseClient } from "@/services/supabase/server";
import type { ActivityLogRow } from "@/types/supabase";

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
