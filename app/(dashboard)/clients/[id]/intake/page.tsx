import { EmptyState } from "@/components/ui/empty-state";

function IntakeIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

export default function ClientIntakePage() {
  return (
    <EmptyState
      icon={<IntakeIcon />}
      title="No intake yet"
      description="The multi-step intake wizard arrives in Phase 5. Start an intake to capture home safety, mobility, ADLs, cognition, fall risk, and caregiver support."
    />
  );
}
