import {
	apiReference,
	pageReference,
	type ApiReferenceEntry,
} from "@/features/internal-docs/content";

// ── Access badge styles ───────────────────────────────────────────────────────
const accessBadgeStyles = {
	public: "border-slate-400 bg-white text-slate-700",
	authenticated: "border-amber-400 bg-amber-50 text-amber-800",
	"internal-api": "border-sky-400 bg-sky-50 text-sky-800",
} as const;

const accessLabels = {
	public: "Public",
	authenticated: "Auth",
	"internal-api": "Internal",
} as const;

// ── API method styles ─────────────────────────────────────────────────────────
// Solid-fill chip (white text) — mirrors Swagger UI method badges
const methodFill = {
	GET: "bg-sky-600",
	POST: "bg-emerald-600",
	PUT: "bg-amber-500",
	PATCH: "bg-violet-600",
	DELETE: "bg-rose-600",
} as const;

// Tinted row background per method
const methodRow = {
	GET: "border-sky-500 bg-sky-50",
	POST: "border-emerald-500 bg-emerald-50",
	PUT: "border-amber-500 bg-amber-50",
	PATCH: "border-violet-500 bg-violet-50",
	DELETE: "border-rose-500 bg-rose-50",
} as const;

// ── HTTP status badge ─────────────────────────────────────────────────────────
const getStatusTone = (statusCode: number | "upstream-status") => {
	if (
		typeof statusCode === "number" &&
		statusCode >= 200 &&
		statusCode < 300
	) {
		return "border-emerald-300 bg-emerald-100 text-emerald-800";
	}
	return "border-red-300 bg-red-100 text-red-800";
};

// ── Chevron SVG ───────────────────────────────────────────────────────────────
function Chevron({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			width={16}
			height={16}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M19 9l-7 7-7-7" />
		</svg>
	);
}

type ReferenceTableProps = {
	title: string;
	description: string;
	items: ReadonlyArray<{
		path: string;
		access: "public" | "authenticated" | "internal-api";
		purpose: string;
		notes: string;
	}>;
};

function ReferenceTable({ title, description, items }: ReferenceTableProps) {
	return (
		<section className="space-y-4">
			<div className="space-y-1">
				<h2 className="text-2xl font-semibold text-slate-950">
					{title}
				</h2>
				<p className="max-w-3xl text-sm leading-7 text-slate-700">
					{description}
				</p>
			</div>
			<div className="border-y border-black">
				{items.map((item) => (
					<article
						key={item.path}
						className="border-b border-black/80 py-5 last:border-b-0"
					>
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div className="space-y-1.5">
								<p className="font-mono text-sm font-semibold text-slate-950">
									{item.path}
								</p>
								<p className="text-sm leading-6 text-slate-700">
									{item.purpose}
								</p>
							</div>
							<span
								className={`inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${accessBadgeStyles[item.access]}`}
							>
								{accessLabels[item.access]}
							</span>
						</div>
						<p className="mt-3 text-sm leading-6 text-slate-800">
							{item.notes}
						</p>
					</article>
				))}
			</div>
		</section>
	);
}

type ApiReferenceTableProps = {
	title: string;
	description: string;
	items: ReadonlyArray<ApiReferenceEntry>;
};

function ApiReferenceTable({
	title,
	description,
	items,
}: ApiReferenceTableProps) {
	return (
		<section className="space-y-4">
			<div className="space-y-1">
				<h2 className="text-2xl font-semibold text-slate-950">
					{title}
				</h2>
				<p className="max-w-3xl text-sm leading-7 text-slate-700">
					{description}
				</p>
			</div>

			<div className="space-y-2">
				{items.map((item) => (
					<details
						key={item.path}
						className={`group overflow-hidden rounded border ${methodRow[item.method]}`}
					>
						{/* Clickable endpoint row */}
						<summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 [&::-webkit-details-marker]:hidden">
							{/* Method chip */}
							<span
								className={`flex w-16 shrink-0 items-center justify-center rounded px-2 py-1 text-[11px] font-bold uppercase text-white ${methodFill[item.method]}`}
							>
								{item.method}
							</span>

							{/* Path */}
							<span className="min-w-0 flex-1 truncate font-mono text-[14px] font-bold text-slate-950">
								{item.path}
							</span>

							{/* Purpose — hidden on narrow screens */}
							<span className="hidden flex-[2] truncate text-sm text-slate-700 sm:block">
								{item.purpose}
							</span>

							{/* Access badge */}
							<span
								className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${accessBadgeStyles[item.access]}`}
							>
								{accessLabels[item.access]}
							</span>

							{/* Chevron */}
							<Chevron className="h-4 w-4 shrink-0 text-slate-600 transition-transform group-open:rotate-180" />
						</summary>

						{/* Expanded body */}
						<div className="border-t border-slate-600 bg-white px-5 py-5">
							<p className="mb-3 text-sm leading-6 text-slate-700 sm:hidden">
								{item.purpose}
							</p>
							<p className="text-sm leading-6 text-slate-800">
								{item.notes}
							</p>

							<div className="mt-5">
								<p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
									Responses
								</p>
								<div className="overflow-hidden rounded border border-slate-600">
									{item.responseExamples.map(
										(example, idx) => (
											<details
												key={example.label}
												className={`group/response${idx > 0 ? " border-t border-slate-500" : ""}`}
											>
												<summary className="flex cursor-pointer list-none items-start gap-3 bg-white px-4 py-3 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
													{/* Status chip */}
													<span
														className={`mt-0.5 shrink-0 rounded border px-2 py-0.5 text-[11px] font-bold tabular-nums ${getStatusTone(example.statusCode)}`}
													>
														{typeof example.statusCode ===
														"number"
															? example.statusCode
															: "var"}
													</span>

													{/* Label + description */}
													<div className="min-w-0 flex-1">
														<span className="text-sm font-semibold text-slate-900">
															{example.label}
														</span>
														<span className="ml-2 text-sm text-slate-600">
															—{" "}
															{
																example.description
															}
														</span>
													</div>

													{/* Chevron */}
													<Chevron className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform group-open/response:rotate-180" />
												</summary>

												<pre className="overflow-x-auto border-t border-slate-600 bg-slate-950 p-4 text-xs leading-6 text-slate-50">
													<code>{example.body}</code>
												</pre>
											</details>
										)
									)}
								</div>
							</div>
						</div>
					</details>
				))}
			</div>
		</section>
	);
}

export function InternalDocsPage() {
	return (
		<div className="bg-white">
			<section className="px-6 py-10 lg:px-8 lg:py-12">
				<p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
					Internal reference
				</p>
				<h1 className="mt-3 text-3xl font-semibold text-slate-950">
					Pages and API reference for the current MVP surface
				</h1>
				<p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
					This page documents the routes and endpoints currently
					implemented in the application. It is protected behind the
					dashboard auth boundary so the reference stays internal to
					the team.
				</p>
			</section>

			<div className="border-t border-black px-6 py-10 lg:px-8 lg:py-12">
				<ReferenceTable
					title="Pages"
					description="User-facing and internal application pages that currently exist in the codebase."
					items={pageReference}
				/>
			</div>

			<div className="border-t border-black px-6 py-10 lg:px-8 lg:py-12">
				<ApiReferenceTable
					title="API endpoints"
					description="Server-side endpoints available to the application right now, including expected response bodies and status behavior."
					items={apiReference}
				/>
			</div>
		</div>
	);
}
