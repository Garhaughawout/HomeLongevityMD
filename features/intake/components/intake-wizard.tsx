"use client";

import { useState, useTransition, useMemo } from "react";
import type { ClientRow, ClientIntakeRow } from "@/types/supabase";
import type {
	ClinicalContextData,
	SteadiData,
	AdlIadlData,
	TugTestData,
	FrailScaleData,
	SlumsData,
	OtClinicalJudgmentData,
	BergBalanceData,
	Tier2CognitiveData,
	Tier2FrailtyData,
	Tier2EnvironmentalData,
	PhysicianReviewData,
} from "@/types/intake";
import type { HomeModificationsData } from "@/types/modifications";
import { saveSectionAction } from "@/features/intake/actions/save-section";
import { WizardProgress, buildWizardSteps, type WizardStep } from "./wizard-progress";
import { SectionClinicalContext } from "./section-clinical-context";
import { SectionSteadi } from "./section-steadi";
import { SectionAdlIadl } from "./section-adl-iadl";
import { SectionTugTest } from "./section-tug-test";
import { SectionFrailScale } from "./section-frail-scale";
import { SectionSlums, slumsBelowNormal } from "./section-slums";
import { SectionOtClinicalJudgment } from "./section-ot-clinical-judgment";
import { SectionBergBalance } from "./section-berg-balance";
import { SectionTier2Cognitive } from "./section-tier2-cognitive";
import { SectionTier2Frailty } from "./section-tier2-frailty";
import { SectionTier2Environmental } from "./section-tier2-environmental";
import { SectionPhysicianReview } from "./section-physician-review";
import { SectionHomeModifications } from "./section-home-modifications";
import { IntakeReview } from "./intake-review";
import { extractHomeFindings } from "@/features/intake/lib/findings";

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
		"clinical_context",
		"steadi",
		"adl_iadl",
		"tug_test",
		"frail_scale",
		"slums",
		"ot_clinical_judgment",
		"berg_balance",
		"tier2_cognitive",
		"tier2_frailty",
		"tier2_environmental",
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
	const [clinicalContext, setClinicalContext] = useState<ClinicalContextData>(
		(intake?.clinical_context as ClinicalContextData) ?? {}
	);
	const [steadi, setSteadi] = useState<SteadiData>(
		(intake?.steadi as SteadiData) ?? {}
	);
	const [adlIadl, setAdlIadl] = useState<AdlIadlData>(
		(intake?.adl_iadl as AdlIadlData) ??
			(intake?.adls_iadls as AdlIadlData) ??
			{}
	);
	const [tugTest, setTugTest] = useState<TugTestData>(
		(intake?.tug_test as TugTestData) ?? {}
	);
	const [frailScale, setFrailScale] = useState<FrailScaleData>(
		(intake?.frail_scale as FrailScaleData) ?? {}
	);
	const [slums, setSlums] = useState<SlumsData>(
		(intake?.slums as SlumsData) ?? {}
	);
	const [otJudgment, setOtJudgment] = useState<OtClinicalJudgmentData>(
		(intake?.ot_clinical_judgment as OtClinicalJudgmentData) ?? {}
	);
	const [bergBalance, setBergBalance] = useState<BergBalanceData>(
		(intake?.berg_balance as BergBalanceData) ?? {}
	);
	const [tier2Cognitive, setTier2Cognitive] = useState<Tier2CognitiveData>(
		(intake?.tier2_cognitive as Tier2CognitiveData) ?? {}
	);
	const [tier2Frailty, setTier2Frailty] = useState<Tier2FrailtyData>(
		(intake?.tier2_frailty as Tier2FrailtyData) ?? {}
	);
	const [tier2Environmental, setTier2Environmental] = useState<Tier2EnvironmentalData>(
		(intake?.tier2_environmental as Tier2EnvironmentalData) ?? {}
	);
	const [physicianReview, setPhysicianReview] = useState<PhysicianReviewData>(
		(intake?.physician_review as PhysicianReviewData) ?? {}
	);
	const [homeModifications, setHomeModifications] = useState<HomeModificationsData>(
		(intake?.home_modifications as unknown as HomeModificationsData) ?? { items: [] }
	);

	const [isPending, startTransition] = useTransition();

	// ── Compute active triggers from Tier 1 data ────────────────────────────────

	const activeTriggers = useMemo(() => {
		const triggers = new Set<string>();

		// TUG >= 12 seconds → Berg Balance
		if (tugTest.performed && tugTest.seconds !== undefined && tugTest.seconds >= 12) {
			triggers.add("berg_balance");
		}

		// SLUMS below the normal (education-adjusted) range → Cognitive
		// Pathway. Requires actual item answers so a stored total_score of 0
		// from an untouched section can't trigger it.
		if (slumsBelowNormal(slums)) {
			triggers.add("tier2_cognitive");
		}

		// FRAIL >= 3 → Frailty Pathway
		const frailTotal = frailScale.total_score;
		if (frailTotal !== undefined && frailTotal >= 3) {
			triggers.add("tier2_frailty");
		}

		// STEADI high hazards (>= 4 of 16 items) → Environmental Pathway
		const hazardCount = steadi.hazard_count ?? 0;
		if (hazardCount >= 4) {
			triggers.add("tier2_environmental");
		}

		return triggers;
	}, [tugTest, slums, frailScale, steadi]);

	// ── Build dynamic step list ────────────────────────────────────────────────

	const steps = useMemo(() => buildWizardSteps(activeTriggers), [activeTriggers]);

	// ── Issues flagged during assessment (drives modification suggestions) ─────

	const homeFindings = useMemo(
		() => extractHomeFindings(steadi, tier2Environmental),
		[steadi, tier2Environmental]
	);

	// ── Current section key + data ──────────────────────────────────────────────

	type SectionEntry = {
		key: string;
		data: object;
	};

	function getSectionEntry(): SectionEntry | null {
		const step = steps[currentStep];
		if (!step || step.key === "review") return null;

		switch (step.key) {
			case "clinical_context":
				return { key: step.key, data: clinicalContext };
			case "steadi":
				return { key: step.key, data: steadi };
			case "adl_iadl":
				return { key: step.key, data: adlIadl };
			case "tug_test":
				return { key: step.key, data: tugTest };
			case "frail_scale":
				return { key: step.key, data: frailScale };
			case "slums":
				return { key: step.key, data: slums };
			case "ot_clinical_judgment":
				return { key: step.key, data: otJudgment };
			case "berg_balance":
				return { key: step.key, data: bergBalance };
			case "tier2_cognitive":
				return { key: step.key, data: tier2Cognitive };
			case "tier2_frailty":
				return { key: step.key, data: tier2Frailty };
			case "tier2_environmental":
				return { key: step.key, data: tier2Environmental };
			case "physician_review":
				return { key: step.key, data: physicianReview };
			case "home_modifications":
				return { key: step.key, data: homeModifications };
			default:
				return null;
		}
	}

	// ── Save & advance ──────────────────────────────────────────────────────────

	function handleSaveAndContinue() {
		const entry = getSectionEntry();
		if (!entry) {
			setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
			return;
		}

		setSaveError(null);
		startTransition(async () => {
			const result = await saveSectionAction(
				client.id,
				entry.key as never,
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
			setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
		});
	}

	function handleBack() {
		setCurrentStep((s) => Math.max(s - 1, 0));
	}

	const isReviewStep = steps[currentStep]?.key === "review";

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
						This intake record is now locked. The scoring engine will
						process it automatically.
					</p>
				</div>
			</div>
		);
	}

	// ── Layout ──────────────────────────────────────────────────────────────────

	return (
		<div className="flex gap-8">
			<WizardProgress
				currentStep={currentStep}
				completedSections={completedSections}
				onStepClick={setCurrentStep}
				steps={steps}
				activeTriggers={activeTriggers}
			/>

			<div className="min-w-0 flex-1">
				{/* Mobile step indicator */}
				<div className="mb-4 flex items-center gap-2 text-xs text-[color:var(--muted)] lg:hidden">
					<span>Step {currentStep + 1} of {steps.length}</span>
					<span className="text-[color:var(--border)]">·</span>
					<span className="font-medium text-[color:var(--foreground)]">{steps[currentStep]?.label}</span>
				</div>
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold text-[color:var(--foreground)]">
							{steps[currentStep]?.label}
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

				<div className="mb-8">
					{steps[currentStep]?.key === "clinical_context" && (
						<SectionClinicalContext
							value={clinicalContext}
							onChange={setClinicalContext}
						/>
					)}
					{steps[currentStep]?.key === "steadi" && (
						<SectionSteadi
							value={steadi}
							onChange={setSteadi}
						/>
					)}
					{steps[currentStep]?.key === "adl_iadl" && (
						<SectionAdlIadl
							value={adlIadl}
							onChange={setAdlIadl}
						/>
					)}
					{steps[currentStep]?.key === "tug_test" && (
						<SectionTugTest
							value={tugTest}
							onChange={setTugTest}
						/>
					)}
					{steps[currentStep]?.key === "frail_scale" && (
						<SectionFrailScale
							value={frailScale}
							onChange={setFrailScale}
						/>
					)}
					{steps[currentStep]?.key === "slums" && (
						<SectionSlums
							value={slums}
							onChange={setSlums}
						/>
					)}
					{steps[currentStep]?.key === "ot_clinical_judgment" && (
						<SectionOtClinicalJudgment
							value={otJudgment}
							onChange={setOtJudgment}
						/>
					)}
					{steps[currentStep]?.key === "berg_balance" && (
						<SectionBergBalance
							value={bergBalance}
							onChange={setBergBalance}
						/>
					)}
					{steps[currentStep]?.key === "tier2_cognitive" && (
						<SectionTier2Cognitive
							value={tier2Cognitive}
							onChange={setTier2Cognitive}
						/>
					)}
					{steps[currentStep]?.key === "tier2_frailty" && (
						<SectionTier2Frailty
							value={tier2Frailty}
							onChange={setTier2Frailty}
						/>
					)}
					{steps[currentStep]?.key === "tier2_environmental" && (
						<SectionTier2Environmental
							value={tier2Environmental}
							onChange={setTier2Environmental}
						/>
					)}
					{steps[currentStep]?.key === "physician_review" && (
						<SectionPhysicianReview
							value={physicianReview}
							onChange={setPhysicianReview}
						/>
					)}
					{steps[currentStep]?.key === "home_modifications" && (
						<SectionHomeModifications
							value={homeModifications}
							onChange={setHomeModifications}
							findings={homeFindings}
						/>
					)}
					{isReviewStep && intakeId && (
						<IntakeReview
							client={client}
							intakeId={intakeId}
							sections={{
								clinical_context: clinicalContext,
								steadi: steadi,
								adl_iadl: adlIadl,
								tug_test: tugTest,
								frail_scale: frailScale,
								slums: slums,
								ot_clinical_judgment: otJudgment,
								berg_balance: bergBalance,
								tier2_cognitive: tier2Cognitive,
								tier2_frailty: tier2Frailty,
								tier2_environmental: tier2Environmental,
								physician_review: physicianReview,
								home_modifications: homeModifications,
							} as never}
							onSubmitSuccess={() => setSubmitted(true)}
						/>
					)}
					{isReviewStep && !intakeId && (
						<p className="text-sm text-[color:var(--muted)]">
							Save at least one section before submitting.
						</p>
					)}
				</div>

				{saveError && (
					<p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{saveError}
					</p>
				)}

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
								: "Save & Continue"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
