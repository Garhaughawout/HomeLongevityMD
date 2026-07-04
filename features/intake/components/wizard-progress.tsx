"use client";

import { INTAKE_SECTION_LABELS, type IntakeSectionKey, type AssessmentTier } from "@/types/domain";

// ── Step config ───────────────────────────────────────────────────────────────

export type WizardStepKey = IntakeSectionKey | "review";

export interface WizardStep {
	key: WizardStepKey;
	label: string;
	tier: AssessmentTier | "review";
	conditional?: boolean; // true for Tier 2 steps
	triggerLabel?: string; // e.g. "Triggered by TUG ≥ 12s"
}

// Base steps (always shown)
const BASE_STEPS: WizardStep[] = [
	{ key: "clinical_context", label: INTAKE_SECTION_LABELS.clinical_context, tier: "tier0" },
	{ key: "steadi", label: INTAKE_SECTION_LABELS.steadi, tier: "tier1" },
	{ key: "adl_iadl", label: INTAKE_SECTION_LABELS.adl_iadl, tier: "tier1" },
	{ key: "tug_test", label: INTAKE_SECTION_LABELS.tug_test, tier: "tier1" },
	{ key: "frail_scale", label: INTAKE_SECTION_LABELS.frail_scale, tier: "tier1" },
	{ key: "slums", label: INTAKE_SECTION_LABELS.slums, tier: "tier1" },
	{ key: "ot_clinical_judgment", label: INTAKE_SECTION_LABELS.ot_clinical_judgment, tier: "tier1_5" },
	{ key: "physician_review", label: INTAKE_SECTION_LABELS.physician_review, tier: "tier3" },
	{ key: "home_modifications", label: INTAKE_SECTION_LABELS.home_modifications, tier: "tier3_modifications" },
	{ key: "review", label: "Review & Submit", tier: "review" },
];

// Conditional Tier 2 steps (inserted before physician_review when triggered)
const TIER2_STEPS: WizardStep[] = [
	{ key: "berg_balance", label: INTAKE_SECTION_LABELS.berg_balance, tier: "tier2", conditional: true, triggerLabel: "Triggered by TUG ≥ 12s" },
	{ key: "tier2_cognitive", label: INTAKE_SECTION_LABELS.tier2_cognitive, tier: "tier2", conditional: true, triggerLabel: "Triggered by SLUMS below normal" },
	{ key: "tier2_frailty", label: INTAKE_SECTION_LABELS.tier2_frailty, tier: "tier2", conditional: true, triggerLabel: "Triggered by FRAIL ≥ 3" },
	{ key: "tier2_environmental", label: INTAKE_SECTION_LABELS.tier2_environmental, tier: "tier2", conditional: true, triggerLabel: "Triggered by STEADI hazards" },
];

// ── Helper: build dynamic step list ───────────────────────────────────────────

export function buildWizardSteps(activeTriggers: Set<string>): WizardStep[] {
	const steps = [...BASE_STEPS];
	const physicianIdx = steps.findIndex((s) => s.key === "physician_review");
	const tier2 = TIER2_STEPS.filter((s) => activeTriggers.has(s.key));
	steps.splice(physicianIdx, 0, ...tier2);
	return steps;
}

export const WIZARD_STEPS = BASE_STEPS;

// ── Tier labels ───────────────────────────────────────────────────────────────

const TIER_LABELS: Record<AssessmentTier | "review", string> = {
	tier0: "Tier 0 — Clinical Context",
	tier1: "Tier 1 — Universal Screening",
	tier1_5: "Tier 1.5 — Clinical Judgment",
	tier2: "Tier 2 — Triggered Assessments",
	tier3: "Tier 3 — Physician Review",
	tier3_modifications: "Tier 3 — Home Modifications",
	review: "Review",
};

const TIER_COLORS: Record<AssessmentTier | "review", string> = {
	tier0: "text-slate-500",
	tier1: "text-blue-600",
	tier1_5: "text-indigo-600",
	tier2: "text-amber-600",
	tier3: "text-purple-600",
	tier3_modifications: "text-teal-600",
	review: "text-emerald-600",
};

// ── Component ─────────────────────────────────────────────────────────────────

type WizardProgressProps = {
	currentStep: number;
	completedSections: Set<string>;
	onStepClick: (index: number) => void;
	steps: WizardStep[];
	activeTriggers: Set<string>;
};

export function WizardProgress({
	currentStep,
	completedSections,
	onStepClick,
	steps,
	activeTriggers: _activeTriggers,
}: WizardProgressProps) {
	let lastTier: string | null = null;
	const totalSteps = steps.length;
	const completedCount = steps.filter((s) => completedSections.has(s.key)).length;
	const progressPct = Math.round((completedCount / totalSteps) * 100);

	return (
		<aside className="sticky top-8 hidden w-72 shrink-0 self-start lg:block">
			{/* Progress bar */}
			<div className="mb-4 px-1">
				<div className="mb-1.5 flex items-center justify-between">
					<span className="text-xs font-medium text-[color:var(--muted)]">
						Progress
					</span>
					<span className="text-xs font-semibold text-[color:var(--foreground)]">
						{completedCount}/{totalSteps}
					</span>
				</div>
				<div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--border)]">
					<div
						className="h-full rounded-full bg-[color:var(--accent)] transition-all duration-300"
						style={{ width: `${progressPct}%` }}
					/>
				</div>
			</div>

			{/* Step list */}
			<nav aria-label="Intake progress">
				<ol className="space-y-0.5">
					{steps.map((step, index) => {
						const isActive = index === currentStep;
						const isComplete = completedSections.has(step.key);
						const isReachable = index <= currentStep || isComplete;

						const showTierHeader = step.tier !== lastTier;
						lastTier = step.tier;

						return (
							<li key={step.key}>
								{showTierHeader && (
									<div
										className={`mb-1 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider ${TIER_COLORS[step.tier]}`}
									>
										{TIER_LABELS[step.tier]}
									</div>
								)}
								<button
									onClick={() => isReachable && onStepClick(index)}
									disabled={!isReachable}
									aria-current={isActive ? "step" : undefined}
									className={[
										"flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
										isActive
											? "bg-[color:var(--accent)] font-medium text-white"
											: isReachable
												? "text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
												: "cursor-not-allowed text-[color:var(--muted)]",
										step.conditional ? "border-l-2 border-amber-400" : "",
									].join(" ")}
								>
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
									<span className="leading-tight">
										{step.label}
										{step.conditional && step.triggerLabel && (
											<span className="block text-[11px] text-amber-600">
												{step.triggerLabel}
											</span>
										)}
									</span>
								</button>
							</li>
						);
					})}
				</ol>
			</nav>
		</aside>
	);
}
