"use client";

import { useState, useTransition } from "react";
import type { ClientRow, ClientIntakeRow } from "@/types/supabase";
import type {
	HomeSafetyData,
	MobilityData,
	AdlsIadlsData,
	CognitionData,
	FallRiskData,
	CaregiverSupportData,
	PhysicianReviewData,
} from "@/types/intake";
import { saveSectionAction } from "@/features/intake/actions/save-section";
import { WizardProgress, WIZARD_STEPS } from "./wizard-progress";
import { SectionHomeSafety } from "./section-home-safety";
import { SectionMobility } from "./section-mobility";
import { SectionAdlsIadls } from "./section-adls-iadls";
import { SectionCognition } from "./section-cognition";
import { SectionFallRisk } from "./section-fall-risk";
import { SectionCaregiverSupport } from "./section-caregiver";
import { SectionPhysicianReview } from "./section-physician-review";
import { IntakeReview } from "./intake-review";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
	client: ClientRow;
	intake: ClientIntakeRow | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasData(val: object | null | undefined): boolean {
	if (!val) return false;
	return Object.values(val).some(
		(v) => v !== null && v !== undefined && v !== ""
	);
}

function buildCompletedSections(intake: ClientIntakeRow | null): Set<string> {
	if (!intake) return new Set();
	const keys = [
		"home_safety",
		"mobility",
		"adls_iadls",
		"cognition",
		"fall_risk",
		"caregiver_support",
		"physician_review",
	] as const;
	const completed = new Set<string>();
	for (const k of keys) {
		if (hasData(intake[k] as object)) completed.add(k);
	}
	if (intake.status === "submitted") completed.add("review");
	return completed;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function IntakeWizard({ client, intake }: Props) {
	const [currentStep, setCurrentStep] = useState(0);
	const [intakeId, setIntakeId] = useState<string | null>(intake?.id ?? null);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [lastSaved, setLastSaved] = useState<Date | null>(
		intake ? new Date(intake.updated_at) : null
	);
	const [submitted, setSubmitted] = useState(intake?.status === "submitted");
	const [completedSections, setCompletedSections] = useState(() =>
		buildCompletedSections(intake)
	);

	// Section data (initialized from existing intake if present)
	const [homeSafety, setHomeSafety] = useState<HomeSafetyData>(
		(intake?.home_safety as HomeSafetyData) ?? {}
	);
	const [mobility, setMobility] = useState<MobilityData>(
		(intake?.mobility as MobilityData) ?? {}
	);
	const [adlsIadls, setAdlsIadls] = useState<AdlsIadlsData>(
		(intake?.adls_iadls as AdlsIadlsData) ?? {}
	);
	const [cognition, setCognition] = useState<CognitionData>(
		(intake?.cognition as CognitionData) ?? {}
	);
	const [fallRisk, setFallRisk] = useState<FallRiskData>(
		(intake?.fall_risk as FallRiskData) ?? {}
	);
	const [caregiver, setCaregiver] = useState<CaregiverSupportData>(
		(intake?.caregiver_support as CaregiverSupportData) ?? {}
	);
	const [physicianReview, setPhysicianReview] = useState<PhysicianReviewData>(
		(intake?.physician_review as PhysicianReviewData) ?? {}
	);

	const [isPending, startTransition] = useTransition();

	// ── Current section key + data ──────────────────────────────────────────────

	type SectionEntry =
		| { key: "home_safety"; data: HomeSafetyData }
		| { key: "mobility"; data: MobilityData }
		| { key: "adls_iadls"; data: AdlsIadlsData }
		| { key: "cognition"; data: CognitionData }
		| { key: "fall_risk"; data: FallRiskData }
		| { key: "caregiver_support"; data: CaregiverSupportData }
		| { key: "physician_review"; data: PhysicianReviewData };

	function getSectionEntry(): SectionEntry | null {
		switch (currentStep) {
			case 0:
				return { key: "home_safety", data: homeSafety };
			case 1:
				return { key: "mobility", data: mobility };
			case 2:
				return { key: "adls_iadls", data: adlsIadls };
			case 3:
				return { key: "cognition", data: cognition };
			case 4:
				return { key: "fall_risk", data: fallRisk };
			case 5:
				return { key: "caregiver_support", data: caregiver };
			case 6:
				return { key: "physician_review", data: physicianReview };
			default:
				return null;
		}
	}

	// ── Save & advance ──────────────────────────────────────────────────────────

	function handleSaveAndContinue() {
		const entry = getSectionEntry();
		if (!entry) {
			// on review step: just advance (no save)
			setCurrentStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
			return;
		}

		setSaveError(null);
		startTransition(async () => {
			const result = await saveSectionAction(
				client.id,
				entry.key,
				entry.data as Record<string, unknown>,
				intakeId
			);

			if ("error" in result) {
				setSaveError(result.error);
				return;
			}

			setIntakeId(result.intakeId);
			setLastSaved(new Date());
			setCompletedSections((prev) => {
				const next = new Set(prev);
				next.add(entry.key);
				return next;
			});
			setCurrentStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
		});
	}

	function handleBack() {
		setCurrentStep((s) => Math.max(s - 1, 0));
	}

	const isLastDataStep = currentStep === WIZARD_STEPS.length - 2; // step before review
	const isReviewStep = currentStep === WIZARD_STEPS.length - 1;

	// ── Submission success ──────────────────────────────────────────────────────

	if (submitted) {
		return (
			<div className="flex flex-col items-center gap-4 py-16 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
					<svg
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="h-8 w-8"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div className="space-y-1">
					<h3 className="font-semibold text-[color:var(--foreground)]">
						Intake Submitted
					</h3>
					<p className="text-sm text-[color:var(--muted)]">
						This intake record is now locked. The scoring engine
						will process it in Phase 10.
					</p>
				</div>
			</div>
		);
	}

	// ── Layout ──────────────────────────────────────────────────────────────────

	return (
		<div className="flex gap-8">
			{/* Sidebar progress */}
			<WizardProgress
				currentStep={currentStep}
				completedSections={completedSections}
				onStepClick={setCurrentStep}
			/>

			{/* Main content */}
			<div className="min-w-0 flex-1">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold text-[color:var(--foreground)]">
							{WIZARD_STEPS[currentStep]?.label}
						</h2>
						{intake && (
							<p className="text-xs text-[color:var(--muted)]">
								Version {intake.version} · Draft
							</p>
						)}
					</div>
					<div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
						{isPending && (
							<>
								<span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Saving…
							</>
						)}
						{!isPending && lastSaved && (
							<span>
								Saved{" "}
								{lastSaved.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						)}
					</div>
				</div>

				{/* Section form */}
				<div className="mb-8">
					{currentStep === 0 && (
						<SectionHomeSafety
							value={homeSafety}
							onChange={setHomeSafety}
						/>
					)}
					{currentStep === 1 && (
						<SectionMobility
							value={mobility}
							onChange={setMobility}
						/>
					)}
					{currentStep === 2 && (
						<SectionAdlsIadls
							value={adlsIadls}
							onChange={setAdlsIadls}
						/>
					)}
					{currentStep === 3 && (
						<SectionCognition
							value={cognition}
							onChange={setCognition}
						/>
					)}
					{currentStep === 4 && (
						<SectionFallRisk
							value={fallRisk}
							onChange={setFallRisk}
						/>
					)}
					{currentStep === 5 && (
						<SectionCaregiverSupport
							value={caregiver}
							onChange={setCaregiver}
						/>
					)}
					{currentStep === 6 && (
						<SectionPhysicianReview
							value={physicianReview}
							onChange={setPhysicianReview}
						/>
					)}
					{isReviewStep && intakeId && (
						<IntakeReview
							client={client}
							intakeId={intakeId}
							sections={{
								home_safety: homeSafety,
								mobility,
								adls_iadls: adlsIadls,
								cognition,
								fall_risk: fallRisk,
								caregiver_support: caregiver,
								physician_review: physicianReview,
							}}
							onSubmitSuccess={() => setSubmitted(true)}
						/>
					)}
					{isReviewStep && !intakeId && (
						<p className="text-sm text-[color:var(--muted)]">
							Save at least one section before submitting.
						</p>
					)}
				</div>

				{/* Error */}
				{saveError && (
					<p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{saveError}
					</p>
				)}

				{/* Navigation */}
				{!isReviewStep && (
					<div className="flex items-center justify-between border-t border-[color:var(--border)] pt-5">
						<button
							onClick={handleBack}
							disabled={currentStep === 0 || isPending}
							className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface)] disabled:opacity-40"
						>
							Back
						</button>
						<button
							onClick={handleSaveAndContinue}
							disabled={isPending}
							className="rounded-lg bg-[color:var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
						>
							{isPending
								? "Saving…"
								: isLastDataStep
									? "Save & Review"
									: "Save & Continue"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
