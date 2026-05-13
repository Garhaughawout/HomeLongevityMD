"use client";

import { useActionState } from "react";
import { createNoteAction, deleteNoteAction, type NoteFormState } from "@/features/clients/actions/notes";
import type { NoteRow } from "@/types/supabase";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function NoteForm({ clientId }: { clientId: string }) {
  const boundAction = createNoteAction.bind(null, clientId);
  const [state, formAction, pending] = useActionState<NoteFormState, FormData>(boundAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="content" className="sr-only">Note</label>
        <textarea
          id="content"
          name="content"
          rows={3}
          placeholder="Add a note…"
          className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--border-strong)",
            color: "var(--foreground)",
            backgroundColor: "var(--surface-strong)",
            // @ts-expect-error custom property
            "--tw-ring-color": "var(--accent)",
          }}
        />
        {state.errors?.content && (
          <p className="mt-1 text-xs text-red-600">{state.errors.content[0]}</p>
        )}
      </div>
      {state.globalError && (
        <p className="text-xs text-red-600">{state.globalError}</p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition disabled:opacity-50"
          style={{ backgroundColor: "var(--navy)" }}
        >
          {pending ? "Saving…" : "Add Note"}
        </button>
      </div>
    </form>
  );
}

function NoteCard({ note, clientId }: { note: NoteRow; clientId: string }) {
  const deleteWithIds = deleteNoteAction.bind(null, clientId, note.id);

  return (
    <div
      className="rounded-xl p-4 flex gap-3"
      style={{ backgroundColor: "var(--cream-strong)", border: "1px solid var(--border)" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--foreground)" }}>
          {note.content}
        </p>
        <p className="mt-1.5 text-xs" style={{ color: "var(--muted)" }}>
          {formatDate(note.created_at)}
        </p>
      </div>
      <form action={deleteWithIds}>
        <button
          type="submit"
          title="Delete note"
          className="shrink-0 p-1 rounded hover:bg-red-50 transition"
        >
          <svg className="h-4 w-4 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </form>
    </div>
  );
}

type NotesListProps = {
  clientId: string;
  initialNotes: NoteRow[];
};

export function NotesList({ clientId, initialNotes }: NotesListProps) {
  return (
    <div className="space-y-6">
      <section
        className="rounded-2xl p-6 space-y-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Add Note</h2>
        <NoteForm clientId={clientId} />
      </section>

      {initialNotes.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {initialNotes.map((note) => (
            <NoteCard key={note.id} note={note} clientId={clientId} />
          ))}
        </div>
      )}
    </div>
  );
}
