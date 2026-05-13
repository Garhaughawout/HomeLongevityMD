import { notFound } from "next/navigation";
import { getClientById } from "@/services/clients";
import { getNotesByClientId } from "@/services/notes";
import { NotesList } from "@/features/clients/components/notes-list";

type Props = { params: { id: string } };

export default async function ClientNotesPage({ params }: Props) {
  const [client, notes] = await Promise.all([
    getClientById(params.id),
    getNotesByClientId(params.id),
  ]);
  if (!client) notFound();

  return <NotesList clientId={client.id} initialNotes={notes} />;
}
