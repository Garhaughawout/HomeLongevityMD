import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvironment } from "@/lib/env";
import type { Database } from "@/types/database";
import type { TypedSupabaseClient } from "@/types/supabase";

type MiddlewareSupabaseClientResult = {
	response: NextResponse;
	supabase: TypedSupabaseClient;
};

export const createMiddlewareSupabaseClient = (
	request: NextRequest
): MiddlewareSupabaseClientResult => {
	const { url, anonKey } = getSupabaseEnvironment();

	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient<Database>(url, anonKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) => {
					request.cookies.set(name, value);
				});

				response = NextResponse.next({
					request: {
						headers: request.headers,
					},
				});

				cookiesToSet.forEach(({ name, value, options }) => {
					response.cookies.set(name, value, options);
				});
			},
		},
	});

	return { response, supabase };
};
