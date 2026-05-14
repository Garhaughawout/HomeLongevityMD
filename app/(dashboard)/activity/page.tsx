import { getRecentActivity } from "@/services/activity";
import { ActivityFeed } from "@/features/clients/components/activity-feed";

export default async function ActivityPage() {
	const events = await getRecentActivity(100);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-[color:var(--foreground)]">
					Activity
				</h1>
				<p className="mt-1 text-sm text-[color:var(--muted)]">
					Audit trail for all internal actions across clients,
					intakes, assessments, quotes, and notes.
				</p>
			</div>
			<ActivityFeed
				events={events}
				emptyMessage="No activity recorded yet. Actions across the app will appear here."
			/>
		</div>
	);
}
