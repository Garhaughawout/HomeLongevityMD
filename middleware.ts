import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const protectedRoutePrefixes = [
	"/dashboard",
	"/clients",
	"/assessments",
	"/quotes",
	"/activity",
];

const authRoutePrefixes = ["/login"];

const isMatchingRoute = (
	pathname: string,
	routePrefixes: ReadonlyArray<string>
) => {
	return routePrefixes.some((routePrefix) => {
		return (
			pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)
		);
	});
};

export async function middleware(request: NextRequest) {
	const { response, supabase } = createClient(request);
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { pathname, search } = request.nextUrl;

	if (!user && isMatchingRoute(pathname, protectedRoutePrefixes)) {
		const loginUrl = request.nextUrl.clone();
		const redirectTarget = `${pathname}${search}`;

		loginUrl.pathname = "/login";
		loginUrl.searchParams.set("next", redirectTarget);

		return Response.redirect(loginUrl);
	}

	if (user && isMatchingRoute(pathname, authRoutePrefixes)) {
		const dashboardUrl = request.nextUrl.clone();

		dashboardUrl.pathname = "/dashboard";
		dashboardUrl.search = "";

		return Response.redirect(dashboardUrl);
	}

	// Sessions created from an invite or password-reset link are pinned to
	// the set-password page until a password has actually been set.
	if (
		user &&
		request.cookies.get("hlmd_pending_password") &&
		isMatchingRoute(pathname, protectedRoutePrefixes)
	) {
		const updatePasswordUrl = request.nextUrl.clone();

		updatePasswordUrl.pathname = "/update-password";
		updatePasswordUrl.search = "";

		return Response.redirect(updatePasswordUrl);
	}

	return response;
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
