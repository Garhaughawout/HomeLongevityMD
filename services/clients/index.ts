import { createServerSupabaseClient } from "@/services/supabase/server";
import type { ClientRow } from "@/types/supabase";
import type { ClientStatus } from "@/types/domain";

// ── Query params ──────────────────────────────────────────────────────────────

export type ClientsQueryParams = {
	search?: string;
	status?: ClientStatus | "all";
	sortBy?: "full_name" | "created_at" | "updated_at";
	sortDir?: "asc" | "desc";
	page?: number;
	pageSize?: number;
};

export type ClientsPage = {
	clients: ClientRow[];
	total: number;
	page: number;
	pageSize: number;
	pageCount: number;
};

// ── List ──────────────────────────────────────────────────────────────────────

export async function getClients(
	params: ClientsQueryParams = {}
): Promise<ClientsPage> {
	const {
		search,
		status = "all",
		sortBy = "created_at",
		sortDir = "desc",
		page = 1,
		pageSize = 25,
	} = params;

	const supabase = createServerSupabaseClient();
	const from = (page - 1) * pageSize;
	const to = from + pageSize - 1;

	let query = supabase.from("clients").select("*", { count: "exact" });

	if (search && search.trim().length > 0) {
		query = query.ilike("full_name", `%${search.trim()}%`);
	}

	if (status !== "all") {
		query = query.eq("status", status);
	}

	query = query
		.order(sortBy, { ascending: sortDir === "asc" })
		.range(from, to);

	const { data, error, count } = await query;

	if (error) throw new Error(error.message);

	const total = count ?? 0;
	return {
		clients: data ?? [],
		total,
		page,
		pageSize,
		pageCount: Math.max(1, Math.ceil(total / pageSize)),
	};
}

// ── Single ────────────────────────────────────────────────────────────────────

export async function getClientById(id: string): Promise<ClientRow | null> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("clients")
		.select("*")
		.eq("id", id)
		.single();

	if (error?.code === "PGRST116") return null; // not found
	if (error) throw new Error(error.message);
	return data;
}

// ── Create ────────────────────────────────────────────────────────────────────

export type CreateClientInput = {
	full_name: string;
	email?: string | null;
	phone?: string | null;
	date_of_birth?: string | null; // ISO date YYYY-MM-DD
	address_line1?: string | null;
	address_line2?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
	created_by: string;
};

export async function createClient(
	input: CreateClientInput
): Promise<ClientRow> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("clients")
		.insert(input)
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}

// ── Update status ─────────────────────────────────────────────────────────────

export async function updateClientStatus(
	id: string,
	status: ClientStatus
): Promise<void> {
	const supabase = createServerSupabaseClient();
	const { error } = await supabase
		.from("clients")
		.update({ status })
		.eq("id", id);

	if (error) throw new Error(error.message);
}
