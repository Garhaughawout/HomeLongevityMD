import { EmptyState } from "@/components/ui/empty-state";

function QuotesIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function QuotesPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">
          Phase 7
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[color:var(--foreground)]">Quotes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
          Service pricing built on top of risk assessments — including base pricing, risk multipliers,
          monthly cost calculations, and revision history.
        </p>
      </div>
      <EmptyState
        icon={<QuotesIcon />}
        title="No quotes yet"
        description="Quote generation and pricing utilities arrive in Phase 7, after the intake and scoring engine is complete."
      />
    </div>
  );
}
