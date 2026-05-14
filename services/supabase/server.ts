import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnvironment } from "@/lib/env";
import type { Database } from "@/types/database";
import type { TypedSupabaseClient } from "@/types/supabase";

export const createServerSupabaseClient = (): TypedSupabaseClient => {
	const { url, anonKey } = getSupabaseEnvironment();
	const cookieStore = cookies();

	return createServerClient<Database>(url, anonKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) => {
						cookieStore.set(name, value, options as CookieOptions);
					});
				} catch {
					// Server components may not be allowed to write cookies during render.
				}
			},
		},
	});
};
