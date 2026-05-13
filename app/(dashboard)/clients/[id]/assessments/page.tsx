import { notFound } from "next/navigation";
import Link from "next/link";
import { getClientById } from "@/services/clients";
import { getAssessmentsByClientId } from "@/services/assessments";
import type { RiskAssessmentRow } from "@/types/supabase";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  low:                  { bg: "rgba(16,185,129,0.10)", text: "#065f46", label: "Low" },
  moderate:             { bg: "rgba(199,157,67,0.12)", text: "#9b7424", label: "Moderate" },
  high:                 { bg: "rgba(239,68,68,0.10)", text: "#991b1b", label: "High" },
  very_high:            { bg: "rgba(239,68,68,0.15)", text: "#7f1d1d", label: "Very High" },
  unsafe_independent:   { bg: "rgba(109,40,217,0.10)", text: "#4c1d95", label: "Unsafe Independent" },
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct <= 33 ? "#10b981" : pct <= 66 ? "#c79d43" : "#ef4444";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: "var(--muted-strong)" }}>
        <span>{label}</span>
        <span className="font-medium">{score}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--navy-soft)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function AssessmentCard({ assessment }: { assessment: RiskAssessmentRow }) {
  const style = CATEGORY_STYLES[assessment.risk_category] ?? CATEGORY_STYLES.moderate;
  return (
    <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
            {new Date(assessment.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>
            {assessment.aggregate_score}<span className="text-base font-normal" style={{ color: "var(--muted)" }}>/100</span>
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
          {style.label}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreBar score={assessment.home_safety_score} label="Home Safety" />
        <ScoreBar score={assessment.mobility_score} label="Mobility" />
        <ScoreBar score={assessment.adls_iadls_score} label="ADLs / IADLs" />
        <ScoreBar score={assessment.cognition_score} label="Cognition" />
        <ScoreBar score={assessment.fall_risk_score} label="Fall Risk" />
        <ScoreBar score={assessment.caregiver_support_score} label="Caregiver Support" />
      </div>
    </div>
  );
}

type Props = { params: { id: string } };

export default async function ClientAssessmentsPage({ params }: Props) {
  const [client, assessments] = await Promise.all([
    getClientById(params.id),
    getAssessmentsByClientId(params.id),
  ]);
  if (!client) notFound();

  if (assessments.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No assessments yet</p>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Complete the intake first — assessments are generated from submitted intake data.</p>
        <Link href={`/clients/${client.id}/intake`} className="mt-4 inline-block px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "var(--navy)" }}>
          Go to Intake
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map((a) => (
        <AssessmentCard key={a.id} assessment={a} />
      ))}
    </div>
  );
}
