import { getSupabaseEnvironment, hasSupabaseEnvironment } from "@/lib/env";

export type SupabaseConnectionHealth =
	| {
			ok: true;
			status: number;
			projectHost: string;
	  }
	| {
			ok: false;
			status: number;
			reason: string;
	  };

const authSettingsPath = "/auth/v1/settings";

const getProjectHost = (url: string) => {
	return new URL(url).host;
};

export const checkSupabaseConnection = async (): Promise<SupabaseConnectionHealth> => {
	if (!hasSupabaseEnvironment) {
		return {
			ok: false,
			status: 500,
			reason: "Supabase environment variables are missing.",
		};
	}

	const { url, anonKey } = getSupabaseEnvironment();

	try {
		const response = await fetch(`${url}${authSettingsPath}`, {
			method: "GET",
			headers: {
				apikey: anonKey,
			},
			cache: "no-store",
		});

		if (!response.ok) {
			return {
				ok: false,
				status: response.status,
				reason: "Supabase responded, but the project rejected the health check request.",
			};
		}

		return {
			ok: true,
			status: response.status,
			projectHost: getProjectHost(url),
		};
	} catch {
		return {
			ok: false,
			status: 503,
			reason: "Unable to reach the Supabase project from the application runtime.",
		};
	}
};