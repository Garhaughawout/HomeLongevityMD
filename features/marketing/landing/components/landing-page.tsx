import Link from "next/link";
import { SiteFrame } from "@/components/layout/site-frame";
import {
	services,
	financialComparison,
} from "@/features/marketing/landing/content";

export function LandingPage() {
	return (
		<SiteFrame>
			{/* ── Hero — full-width text, two-column at lg ── */}
			<section className="grid gap-12 py-6 lg:grid-cols-2 lg:items-center lg:py-14">
				<div className="space-y-6">
					<span className="inline-flex items-center rounded-full border border-[color:var(--accent-soft-border)] bg-white px-4 py-1 text-sm font-medium text-[color:var(--accent-strong)] shadow-sm">
						Serving Omaha, Nebraska
					</span>
					<h1 className="text-5xl font-semibold leading-tight text-balance sm:text-6xl">
						Clarity Today.{" "}
						<span className="text-[color:var(--navy)]">
							Independence Tomorrow.
						</span>
					</h1>
					<p className="text-lg leading-8 text-[color:var(--muted-strong)]">
						Physician-led functional home assessments helping older
						adults safely age in place — and giving families the
						medically-guided answers they need before a crisis
						forces the decision.
					</p>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Link
							href="#services"
							className="inline-flex items-center justify-center rounded-full bg-[color:var(--navy)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--ink)]"
						>
							Our Services
						</Link>
						<Link
							href="#contact"
							className="inline-flex items-center justify-center rounded-full border border-[color:var(--navy-soft-border)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--navy)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--navy-strong)]"
						>
							Contact Us
						</Link>
					</div>
				</div>

				<div className="navy-panel rounded-xl p-10 space-y-4">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
						About the Company
					</p>
					<p className="text-xl font-semibold leading-snug text-white">
						Scott Haughawout, DO
					</p>
					<p className="text-md text-white/70 leading-7">
						Board-certified physical medicine and rehabilitation
						specialist with over a decade of clinical experience at
						Nebraska Spine + Pain Center in Omaha. Dr. Haughawout
						brings deep expertise in diagnostics, functional
						medicine, and patient-centered care to HomeLongevityMD —
						applying that clinical foundation to help older adults
						and their families plan for safer, more independent
						lives at home.
					</p>
					<div className="border-t border-white/10 pt-4">
						<p className="text-xs text-white/50">
							HomeLongevityMD.com &nbsp;&middot;&nbsp; Omaha, NE
						</p>
					</div>
				</div>
			</section>

			{/* ── Services — numbered list, 2-col ── */}
			<section id="services" className="space-y-10">
				<div className="max-w-2xl space-y-3">
					<p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
						What We Offer
					</p>
					<h2 className="text-3xl font-semibold leading-tight text-balance sm:text-4xl">
						Comprehensive assessments tailored to each patient
					</h2>
				</div>
				<div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
					{services.map((service, i) => (
						<div key={service.title} className="flex gap-5">
							<span className="mt-0.5 shrink-0 text-2xl font-bold tabular-nums text-[color:var(--accent)]">
								{String(i + 1).padStart(2, "0")}
							</span>
							<div>
								<h3 className="font-semibold">
									{service.title}
								</h3>
								<p className="mt-1.5 text-sm leading-7 text-[color:var(--muted-strong)]">
									{service.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ── The Need — full-width navy panel, split layout ── */}
			<section
				id="why-us"
				className="navy-panel rounded-xl overflow-hidden"
			>
				<div className="grid gap-0 lg:grid-cols-[1fr_auto]">
					<div className="p-8 lg:p-12 space-y-5">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
							The Need
						</p>
						<h2 className="text-2xl font-semibold leading-snug text-white sm:text-3xl max-w-md">
							Most families wait until a crisis forces the
							decision.
						</h2>
						<p className="text-sm leading-7 text-white/72 max-w-sm">
							A fall, a hospitalization, a sudden decline — these
							events leave families scrambling for answers under
							pressure. A professional evaluation now helps avoid
							reactive, costly transitions and plans for a safer
							future on your terms.
						</p>
					</div>
					<div className="flex flex-col divide-y divide-white/10 border-t border-white/10 lg:border-l lg:border-t-0 lg:divide-y lg:divide-white/10">
						{financialComparison.map((item) => (
							<div
								key={item.label}
								className="px-10 py-7 space-y-1"
							>
								<p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
									{item.label}
								</p>
								<p className="text-2xl font-bold text-white">
									{item.cost}
								</p>
								<p className="text-xs text-white/40">
									{item.period}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Our Difference — open columns, no card borders ── */}
			<section id="our-difference" className="space-y-10">
				<div className="space-y-3">
					<p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
						Our Difference
					</p>
					<h2 className="text-3xl font-semibold leading-tight text-balance sm:text-4xl max-w-2xl">
						Medical expertise meets in-home evaluation
					</h2>
				</div>
				<div className="grid gap-0 divide-y border-t border-b border-[color:var(--border)] divide-[color:var(--border)] md:grid-cols-3 md:divide-x md:divide-y-0">
					{(
						[
							{
								num: "01",
								label: "Medical Expertise",
								desc: "Physician-led review of health history, diagnoses, and medications — not a checklist completed by a non-clinical visitor.",
							},
							{
								num: "02",
								label: "Functional Assessment",
								desc: "Standardized clinical tools measuring mobility, cognition, ADLs, and fall risk in the actual environment where the patient lives.",
							},
							{
								num: "03",
								label: "Actionable Planning",
								desc: "A clear written report with specific recommendations families and care teams can act on — not a generic summary.",
							},
						] as const
					).map((item) => (
						<div
							key={item.label}
							className="px-0 py-8 md:px-8 md:first:pl-0 md:last:pr-0 space-y-3"
						>
							<p className="text-3xl font-bold text-[color:var(--accent)]">
								{item.num}
							</p>
							<h3 className="text-base font-semibold">
								{item.label}
							</h3>
							<p className="text-sm leading-7 text-[color:var(--muted-strong)]">
								{item.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* ── Contact — split layout ── */}
			<section
				id="contact"
				className="navy-panel rounded-xl px-8 py-14 lg:px-14"
			>
				<div className="grid gap-10 lg:grid-cols-2 lg:items-center">
					<div className="space-y-4">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
							Get in Touch
						</p>
						<h2 className="text-3xl font-semibold text-white sm:text-4xl">
							Ready to schedule an evaluation?
						</h2>
						<p className="text-base text-white/70 leading-7">
							Reach out directly — we serve patients and families
							across the Omaha, Nebraska area.
						</p>
					</div>
					<div className="flex flex-col gap-6 lg:pl-10 lg:border-l lg:border-white/10">
						<div className="space-y-1">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
								Phone
							</p>
							<p className="text-2xl font-semibold text-white">
								(402) 235-8337
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
								Email
							</p>
							<p className="text-lg font-medium text-white">
								info@homelongevitymd.com
							</p>
						</div>
					</div>
				</div>
			</section>
		</SiteFrame>
	);
}
