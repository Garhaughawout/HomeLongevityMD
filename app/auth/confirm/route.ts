import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/services/supabase/server";

// ─────────────────────────────────────────────────────────────────────────────
// Auth email landing route.
//
// Supabase's invite and password-reset emails link here (see the custom email
// templates in the dashboard: {{ .SiteURL }}/auth/confirm?token_hash=...&type=...).
// We verify the one-time token server-side, which establishes a session
// cookie, then forward the user to the set-password page.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_TYPES: EmailOtpType[] = ["invite", "recovery", "email", "signup"];

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const tokenHash = searchParams.get("token_hash");
	const type = searchParams.get("type") as EmailOtpType | null;
	const nextPath = searchParams.get("next") ?? "/update-password";

	// Only allow same-site relative redirects
	const safeNext = nextPath.startsWith("/") ? nextPath : "/update-password";

	if (tokenHash && type && ALLOWED_TYPES.includes(type)) {
		const supabase = createServerSupabaseClient();
		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash: tokenHash,
		});

		if (!error) {
			return NextResponse.redirect(new URL(safeNext, request.url));
		}
	}

	// Invalid or expired link — send to login with a hint
	const loginUrl = new URL("/login", request.url);
	loginUrl.searchParams.set("auth_error", "link_invalid");
	return NextResponse.redirect(loginUrl);
}
