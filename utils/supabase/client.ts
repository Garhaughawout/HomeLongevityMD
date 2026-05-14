import { getBrowserSupabaseClient } from "@/services/supabase/browser";

export const createClient = () => {
	return getBrowserSupabaseClient();
};
