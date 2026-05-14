"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/services/auth/session";
import { createNote, softDeleteNote } from "@/services/notes";

const noteSchema = z.object({
	content: z.string().trim().min(1, "Note cannot be empty").max(5000),
});

export type NoteFormState = {
	errors?: { content?: string[] };
	globalError?: string;
};

export async function createNoteAction(
	clientId: string,
	_prev: NoteFormState,
	formData: FormData
): Promise<NoteFormState> {
	const user = await requireAuthenticatedUser();
	const parsed = noteSchema.safeParse({ content: formData.get("content") });

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	try {
		await createNote(clientId, parsed.data.content, user.id);
	} catch {
		return { globalError: "Failed to save note. Please try again." };
	}

	revalidatePath(`/clients/${clientId}/notes`);
	return {};
}

export async function deleteNoteAction(
	clientId: string,
	noteId: string
): Promise<void> {
	await requireAuthenticatedUser();
	await softDeleteNote(noteId);
	revalidatePath(`/clients/${clientId}/notes`);
}
