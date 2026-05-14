import { createServerSupabaseClient } from "@/services/supabase/server";

export const createClient = () => {
	return createServerSupabaseClient();
};
