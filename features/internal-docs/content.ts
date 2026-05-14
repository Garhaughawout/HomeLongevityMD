export type InternalDocEntry = {
	path: string;
	access: "public" | "authenticated" | "internal-api";
	purpose: string;
	notes: string;
};

export type ApiResponseExample = {
	label: string;
	statusCode: number | "upstream-status";
	description: string;
	body: string;
};

export type ApiReferenceEntry = InternalDocEntry & {
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	responseExamples: ReadonlyArray<ApiResponseExample>;
};

export const pageReference: ReadonlyArray<InternalDocEntry> = [
	{
		path: "/",
		access: "public",
		purpose:
			"Public landing page for the product foundation and roadmap positioning.",
		notes: "Uses the public marketing feature slice and does not require authentication.",
	},
	{
		path: "/login",
		access: "public",
		purpose: "Staff sign-in surface backed by Supabase Auth.",
		notes: "Redirects authenticated users to /dashboard.",
	},
	{
		path: "/dashboard",
		access: "authenticated",
		purpose:
			"Protected dashboard home. Will show KPI cards, high-risk alerts, and recent activity in Phase 9.",
		notes: "Unauthenticated visitors are redirected to /login by middleware.",
	},
	{
		path: "/clients",
		access: "authenticated",
		purpose:
			"Searchable client list with name search, status filter, sort, and pagination. Includes add-client dialog.",
		notes: "Reads from the clients table via server component. Add-client uses a server action with Zod validation; on success redirects to the new client's detail page.",
	},
	{
		path: "/clients/[id]",
		access: "authenticated",
		purpose:
			"Client detail workspace — Overview tab with profile and address cards.",
		notes: "Layout fetches the client by ID server-side; 404s if not found. Tab navigation is client-side via usePathname.",
	},
	{
		path: "/clients/[id]/intake",
		access: "authenticated",
		purpose:
			"Multi-step intake wizard based on the OT HOME FAST + SAFER-HOME hybrid template. 7 clinical sections: Home Environment, Mobility & Function, ADLs & IADLs, Cognitive & Safety, Fall Risk, Caregiver Support, and Physician Review.",
		notes: "8-step wizard (7 data sections + review/submit). Each section autosaves to JSONB via server action. Supports draft → submitted lifecycle with versioned revisions.",
	},
	{
		path: "/clients/[id]/assessments",
		access: "authenticated",
		purpose:
			"Client assessments tab — placeholder shell; risk scoring arrives in Phase 6.",
		notes: "Will list persisted risk_assessments rows keyed to this client.",
	},
	{
		path: "/clients/[id]/quotes",
		access: "authenticated",
		purpose:
			"Client quotes tab — placeholder shell; quote generation arrives in Phase 7.",
		notes: "Will list quotes rows with status, rate, and revision history.",
	},
	{
		path: "/clients/[id]/notes",
		access: "authenticated",
		purpose:
			"Client notes tab — placeholder shell; notes CRUD arrives in Phase 8.",
		notes: "Soft-deleted notes stored in the notes table with is_deleted flag.",
	},
	{
		path: "/clients/[id]/activity",
		access: "authenticated",
		purpose:
			"Client activity tab — placeholder shell; event logging arrives in Phase 8.",
		notes: "Will render activity_log rows scoped to this client_id, newest first.",
	},
	{
		path: "/assessments",
		access: "authenticated",
		purpose:
			"Assessment overview listing all structured intake and risk scoring records.",
		notes: "Shell in place. Multi-step intake wizard and risk scoring arrive in Phases 5 and 6.",
	},
	{
		path: "/quotes",
		access: "authenticated",
		purpose:
			"Quote management listing generated pricing, service recommendations, and revision history.",
		notes: "Shell in place. Pricing utilities and quote generation arrive in Phase 7.",
	},
	{
		path: "/activity",
		access: "authenticated",
		purpose:
			"Audit trail for all internal actions including notes, status changes, and workflow events.",
		notes: "Shell in place. Automatic activity logging across all mutations arrives in Phase 8.",
	},
	{
		path: "/dashboard/docs",
		access: "authenticated",
		purpose:
			"Internal-only reference page for routes, APIs, and implementation surfaces.",
		notes: "Intended for operators and developers, not public visitors.",
	},
];

export const apiReference: ReadonlyArray<ApiReferenceEntry> = [
	{
		path: "/api/health/supabase",
		access: "internal-api",
		method: "GET",
		purpose:
			"Server-side connectivity check that verifies the configured Supabase project is reachable.",
		notes: "Returns safe status information only and does not expose credentials or table data.",
		responseExamples: [
			{
				label: "Success",
				statusCode: 200,
				description:
					"Supabase project is reachable and accepted the auth settings health check.",
				body: `{
  "ok": true,
  "message": "Supabase project is reachable.",
  "projectHost": "lyouvaplrfcozlylauge.supabase.co"
}`,
			},
			{
				label: "Missing configuration",
				statusCode: 500,
				description:
					"The application is missing required Supabase environment variables.",
				body: `{
  "ok": false,
  "message": "Supabase environment variables are missing."
}`,
			},
			{
				label: "Supabase unreachable",
				statusCode: 503,
				description:
					"The runtime could not reach the configured Supabase project over the network.",
				body: `{
  "ok": false,
  "message": "Unable to reach the Supabase project from the application runtime."
}`,
			},
			{
				label: "Upstream rejection",
				statusCode: "upstream-status",
				description:
					"Supabase responded but rejected the request, for example with an invalid key or project configuration issue. The route returns the upstream HTTP status.",
				body: `{
  "ok": false,
  "message": "Supabase responded, but the project rejected the health check request."
}`,
			},
		],
	},
];
