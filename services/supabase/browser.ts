import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvironment } from "@/lib/env";
import type { Database } from "@/types/database";
import type { TypedSupabaseClient } from "@/types/supabase";

let browserSupabaseClient: TypedSupabaseClient | undefined;

export const createBrowserSupabaseClient = (): TypedSupabaseClient => {
	const { url, anonKey } = getSupabaseEnvironment();

	return createBrowserClient<Database>(url, anonKey);
};

export const getBrowserSupabaseClient = (): TypedSupabaseClient => {
	if (!browserSupabaseClient) {
		browserSupabaseClient = createBrowserSupabaseClient();
	}

	return browserSupabaseClient;
};
