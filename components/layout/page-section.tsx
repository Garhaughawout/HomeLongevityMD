type PageSectionProps = {
	id?: string;
	eyebrow: string;
	title: string;
	description: string;
	children: React.ReactNode;
};

export function PageSection({
	id,
	eyebrow,
	title,
	description,
	children,
}: PageSectionProps) {
	return (
		<section id={id} className="space-y-6">
			<div className="max-w-3xl space-y-3">
				<p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
					{eyebrow}
				</p>
				<h2 className="text-3xl font-semibold leading-tight text-balance sm:text-4xl">
					{title}
				</h2>
				<p className="text-base leading-8 text-[color:var(--muted)]">
					{description}
				</p>
			</div>
			{children}
		</section>
	);
}
