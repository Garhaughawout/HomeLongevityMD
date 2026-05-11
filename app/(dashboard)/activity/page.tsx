import { EmptyState } from "@/components/ui/empty-state";

function ActivityIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function ActivityPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">
          Phase 8
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[color:var(--foreground)]">Activity</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
          Audit trail for all internal actions — client creation, intake saves, assessment
          persistence, quote generation, status changes, note updates, and more.
        </p>
      </div>
      <EmptyState
        icon={<ActivityIcon />}
        title="No activity yet"
        description="Automatic activity logging arrives in Phase 8, emitted from real mutations across the client, intake, quote, and notes workflows."
      />
    </div>
  );
}
