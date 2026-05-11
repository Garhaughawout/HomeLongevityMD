import { EmptyState } from "@/components/ui/empty-state";

function ActivityIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function ClientActivityPage() {
  return (
    <EmptyState
      icon={<ActivityIcon />}
      title="No activity yet"
      description="Client-scoped activity events will appear here as actions are taken — intake saves, assessment runs, quote generation, note changes, and status updates."
    />
  );
}
