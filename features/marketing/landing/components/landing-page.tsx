import Link from "next/link";
import { SiteFrame } from "@/components/layout/site-frame";
import {
	services,
	financialComparison,
} from "@/features/marketing/landing/content";

export function LandingPage() {
	return (
		<SiteFrame>
			{/* ── Hero — warm, centered, speaks to both audiences ── */}
			<section className="warm-panel rounded-xl px-6 py-14 text-center sm:px-12 lg:py-20">
				<p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">
					Physician-led home assessments · Omaha, Nebraska
				</p>
				<h1 className="font-display-serif mx-auto mt-6 max-w-3xl text-balance text-4xl leading-tight text-[color:var(--navy)] sm:text-5xl">
					Stay in the home you love. Help someone you love stay in
					theirs.
				</h1>
				<p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted-strong)]">
					Maybe you plan to grow old in the house you know by heart.
					Maybe you&rsquo;ve started noticing small changes in a parent
					— the missed step, the unopened mail. Either way, the
					question is the same: <em>what needs to happen so home stays
					possible?</em> A physician-led team comes to the home,
					assesses health, mobility, and safety, and turns that
					question into a clear plan.
				</p>
				<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Link
						href="#contact"
						className="inline-flex items-center justify-center rounded-full bg-[color:var(--navy)] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--ink)]"
					>
						Schedule an evaluation
					</Link>
					<Link
						href="#how-it-works"
						className="inline-flex items-center justify-center rounded-full border border-[color:var(--navy-soft-border)] bg-white px-7 py-3 text-sm font-semibold text-[color:var(--navy)] transition hover:border-[color:var(--accent)]"
					>
						See how it works
					</Link>
				</div>
			</section>

			{/* ── Three steps ── */}
			<section id="how-it-works" className="space-y-10">
				<h2 className="font-display-serif text-center text-3xl leading-tight text-[color:var(--navy)] sm:text-4xl">
					One visit. Three simple steps.
				</h2>
				<div className="grid gap-8 text-center sm:grid-cols-3">
					{(
						[
							{
								step: "1",
								title: "We visit",
								desc: "A trained clinician comes to the home at a time that works for you, and sees how daily life actually happens there — something no office visit can show.",
							},
							{
								step: "2",
								title: "We assess",
								desc: "Standardized clinical tools measure mobility, cognition, daily function, and home hazards — the same instruments used in rehabilitation medicine.",
							},
							{
								step: "3",
								title: "You decide",
								desc: "You receive a clear written plan with prioritized recommendations. What happens next is entirely up to you — at your own pace, with everything laid out.",
							},
						] as const
					).map((item) => (
						<div key={item.step} className="space-y-3">
							<span className="font-display-serif mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--accent-soft-border)] bg-white text-xl text-[color:var(--accent-strong)]">
								{item.step}
							</span>
							<h3 className="text-lg font-semibold text-[color:var(--navy)]">
								{item.title}
							</h3>
							<p className="mx-auto max-w-xs text-sm leading-7 text-[color:var(--muted-strong)]">
								{item.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* ── Who we help — both audiences, explicitly ── */}
			<section className="grid gap-6 lg:grid-cols-2">
				<div className="warm-panel rounded-xl p-8 sm:p-10">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent-strong)]">
						If this is about you
					</p>
					<h3 className="font-display-serif mt-3 text-2xl leading-snug text-[color:var(--navy)]">
						You intend to stay. Let&rsquo;s make sure your home
						agrees.
					</h3>
					<p className="mt-4 text-base leading-8 text-[color:var(--muted-strong)]">
						You&rsquo;ve lived here for decades and you&rsquo;re not
						interested in leaving. Good — that&rsquo;s the goal. An
						assessment gives you an honest, physician-reviewed read on
						what will keep you independent: which rooms need
						attention, which habits carry risk, and what to change
						now, on your terms, before something changes it for you.
					</p>
				</div>
				<div className="warm-panel rounded-xl p-8 sm:p-10">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent-strong)]">
						If this is about a parent
					</p>
					<h3 className="font-display-serif mt-3 text-2xl leading-snug text-[color:var(--navy)]">
						You&rsquo;ve noticed the little things. Now what?
					</h3>
					<p className="mt-4 text-base leading-8 text-[color:var(--muted-strong)]">
						Worry without information becomes conflict — between
						siblings, and with the parent you&rsquo;re trying to
						protect. A physician-led assessment replaces guessing
						with answers your whole family can stand behind: how Mom
						or Dad is really doing, what the home needs, and whether
						it&rsquo;s time to talk about something more.
					</p>
				</div>
			</section>

			{/* ── Services ── */}
			<section id="services" className="space-y-10">
				<div className="mx-auto max-w-2xl space-y-3 text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
						What we offer
					</p>
					<h2 className="font-display-serif text-3xl leading-tight text-[color:var(--navy)] sm:text-4xl">
						Everything a home visit can answer
					</h2>
				</div>
				<div className="mx-auto grid max-w-4xl gap-x-12 gap-y-8 md:grid-cols-2">
					{services.map((service, i) => (
						<div key={service.title} className="flex gap-5">
							<span className="font-display-serif mt-0.5 shrink-0 text-2xl tabular-nums text-[color:var(--accent)]">
								{String(i + 1).padStart(2, "0")}
							</span>
							<div>
								<h3 className="font-semibold text-[color:var(--navy)]">
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

			{/* ── The cost of waiting ── */}
			<section id="why-us" className="navy-panel overflow-hidden rounded-xl">
				<div className="grid gap-0 lg:grid-cols-[1fr_auto]">
					<div className="space-y-5 p-8 lg:p-12">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
							Why now
						</p>
						<h2 className="font-display-serif max-w-md text-2xl leading-snug text-white sm:text-3xl">
							Most families wait until a crisis forces the
							decision.
						</h2>
						<p className="max-w-sm text-sm leading-7 text-white/72">
							A fall, a hospitalization, a sudden decline — these
							events leave families scrambling under pressure, and
							the reactive options are the expensive ones. A
							planning assessment now costs a fraction of a
							reactive move later.
						</p>
					</div>
					<div className="flex flex-col divide-y divide-white/10 border-t border-white/10 lg:border-l lg:border-t-0">
						{financialComparison.map((item) => (
							<div key={item.label} className="space-y-1 px-10 py-7">
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

			{/* ── About the doctor ── */}
			<section className="warm-panel rounded-xl p-8 sm:p-12">
				<div className="mx-auto max-w-3xl space-y-5 text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent-strong)]">
						Who leads HomeLongevityMD
					</p>
					<h2 className="font-display-serif text-3xl leading-tight text-[color:var(--navy)]">
						Scott Haughawout, DO
					</h2>
					<p className="text-base leading-8 text-[color:var(--muted-strong)]">
						Board-certified physical medicine and rehabilitation
						specialist with over a decade of clinical experience at
						Nebraska Spine + Pain Center in Omaha. Dr. Haughawout
						brings deep expertise in diagnostics, functional
						medicine, and patient-centered care to HomeLongevityMD —
						applying that clinical foundation to help older adults
						and their families plan for safer, more independent
						lives at home. Every assessment follows his clinical
						methodology and is reviewed under his direction.
					</p>
				</div>
			</section>

			{/* ── Contact ── */}
			<section id="contact" className="navy-panel rounded-xl px-8 py-14 text-center lg:px-14">
				<div className="mx-auto max-w-2xl space-y-6">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
						Get in touch
					</p>
					<h2 className="font-display-serif text-3xl leading-tight text-white sm:text-4xl">
						Whenever you&rsquo;re ready, the conversation is easy to
						start.
					</h2>
					<p className="text-base leading-7 text-white/70">
						Call or email — for yourself, or for someone you love. We
						serve patients and families across the Omaha, Nebraska
						area.
					</p>
					<div className="flex flex-col items-center justify-center gap-6 pt-2 sm:flex-row sm:gap-14">
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
