import { EmptyState } from "@/components/ui/empty-state";

function AssessmentsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

export default function AssessmentsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">
          Phase 5 & 6
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[color:var(--foreground)]">Assessments</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
          Structured intake capture across home safety, mobility, ADLs, cognition, fall risk, and
          caregiver support domains — with risk scoring and assessment history.
        </p>
      </div>
      <EmptyState
        icon={<AssessmentsIcon />}
        title="No assessments yet"
        description="The multi-step intake wizard and risk scoring engine arrive in Phases 5 and 6. Assessments are anchored to clients."
      />
    </div>
  );
}
