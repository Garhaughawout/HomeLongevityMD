import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseEnvironment } from "@/lib/env";
import type { Database } from "@/types/database";

// ─────────────────────────────────────────────────────────────────────────────
// Auth email landing route.
//
// Supabase's invite and password-reset emails link here (see the custom email
// templates in the dashboard: {{ .SiteURL }}/auth/confirm?token_hash=...&type=...).
// We verify the one-time token server-side, which establishes a session, then
// forward the user to the set-password page.
//
// The session cookies are written directly onto the redirect response we
// return — cookies set via the request-scoped store don't reliably attach to
// a returned redirect in route handlers, which silently drops the session.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_TYPES: EmailOtpType[] = ["invite", "recovery", "email", "signup"];

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const tokenHash = searchParams.get("token_hash");
	const type = searchParams.get("type") as EmailOtpType | null;
	const nextPath = searchParams.get("next") ?? "/update-password";

	// Only allow same-site relative redirects
	const safeNext = nextPath.startsWith("/") ? nextPath : "/update-password";

	const failureUrl = new URL("/login", request.url);
	failureUrl.searchParams.set("auth_error", "link_invalid");

	if (!tokenHash || !type || !ALLOWED_TYPES.includes(type)) {
		return NextResponse.redirect(failureUrl);
	}

	// Build the success redirect up front and bind the Supabase client's
	// cookie writes to it, so the session survives the redirect.
	const successResponse = NextResponse.redirect(new URL(safeNext, request.url));

	const { url, anonKey } = getSupabaseEnvironment();
	const supabase = createServerClient<Database>(url, anonKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					successResponse.cookies.set(name, value, options);
				});
			},
		},
	});

	const { error } = await supabase.auth.verifyOtp({
		type,
		token_hash: tokenHash,
	});

	if (error) {
		return NextResponse.redirect(failureUrl);
	}

	// Invite/recovery sessions must set a password before using the app.
	// The middleware pins navigation to /update-password while this cookie
	// is present; the set-password form clears it on success.
	if (type === "invite" || type === "recovery") {
		successResponse.cookies.set("hlmd_pending_password", "1", {
			path: "/",
			maxAge: 60 * 60,
			sameSite: "lax",
		});
	}

	return successResponse;
}
