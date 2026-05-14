import { NextResponse } from "next/server";
import { checkSupabaseConnection } from "@/services";

export const dynamic = "force-dynamic";

export async function GET() {
	const health = await checkSupabaseConnection();

	if (!health.ok) {
		return NextResponse.json(
			{
				ok: false,
				message: health.reason,
			},
			{ status: health.status }
		);
	}

	return NextResponse.json({
		ok: true,
		message: "Supabase project is reachable.",
		projectHost: health.projectHost,
	});
}
