import { notFound } from "next/navigation";
import { getClientById } from "@/services/clients";
import { getActivityByClientId } from "@/services/activity";
import { ActivityFeed } from "@/features/clients/components/activity-feed";

type Props = { params: { id: string } };

export default async function ClientActivityPage({ params }: Props) {
  const [client, events] = await Promise.all([
    getClientById(params.id),
    getActivityByClientId(params.id),
  ]);
  if (!client) notFound();

  return (
    <ActivityFeed
      events={events}
      emptyMessage="No activity recorded for this client yet. Actions like intake saves, assessments, quotes, and notes will appear here."
    />
  );
}
