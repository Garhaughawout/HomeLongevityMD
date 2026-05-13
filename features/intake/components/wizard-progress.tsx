"use client";

import { INTAKE_SECTION_LABELS, type IntakeSectionKey } from "@/types/domain";

// ── Step config ───────────────────────────────────────────────────────────────

export type WizardStepKey = IntakeSectionKey | "review";

export const WIZARD_STEPS: Array<{ key: WizardStepKey; label: string }> = [
  { key: "home_safety",       label: INTAKE_SECTION_LABELS.home_safety },
  { key: "mobility",          label: INTAKE_SECTION_LABELS.mobility },
  { key: "adls_iadls",        label: INTAKE_SECTION_LABELS.adls_iadls },
  { key: "cognition",         label: INTAKE_SECTION_LABELS.cognition },
  { key: "fall_risk",         label: INTAKE_SECTION_LABELS.fall_risk },
  { key: "caregiver_support", label: INTAKE_SECTION_LABELS.caregiver_support },
  { key: "physician_review",  label: INTAKE_SECTION_LABELS.physician_review },
  { key: "review",            label: "Review & Submit" },
];

// ── Component ─────────────────────────────────────────────────────────────────

type WizardProgressProps = {
  currentStep: number;
  completedSections: Set<string>;
  onStepClick: (index: number) => void;
};

export function WizardProgress({ currentStep, completedSections, onStepClick }: WizardProgressProps) {
  return (
    <nav aria-label="Intake progress" className="w-56 shrink-0">
      <ol className="space-y-1">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = completedSections.has(step.key);
          const isReachable = index <= currentStep || isComplete;

          return (
            <li key={step.key}>
              <button
                onClick={() => isReachable && onStepClick(index)}
                disabled={!isReachable}
                aria-current={isActive ? "step" : undefined}
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  isActive
                    ? "bg-[color:var(--accent)] font-medium text-white"
                    : isReachable
                    ? "text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                    : "cursor-not-allowed text-[color:var(--muted)]",
                ].join(" ")}
              >
                {/* Step number / check icon */}
                <span
                  className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : isComplete
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-[color:var(--border)] text-[color:var(--muted)]",
                  ].join(" ")}
                >
                  {isComplete && !isActive ? (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="leading-tight">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
