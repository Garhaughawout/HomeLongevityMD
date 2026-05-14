import { createServerSupabaseClient } from "@/services/supabase/server";
import type { NoteRow } from "@/types/supabase";

export async function getNotesByClientId(clientId: string): Promise<NoteRow[]> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("notes")
		.select("*")
		.eq("client_id", clientId)
		.eq("is_deleted", false)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return data ?? [];
}

export async function createNote(
	clientId: string,
	content: string,
	userId: string
): Promise<NoteRow> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase
		.from("notes")
		.insert({
			client_id: clientId,
			content: content.trim(),
			created_by: userId,
		})
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}

export async function softDeleteNote(noteId: string): Promise<void> {
	const supabase = createServerSupabaseClient();
	const { error } = await supabase
		.from("notes")
		.update({ is_deleted: true })
		.eq("id", noteId);

	if (error) throw new Error(error.message);
}
