"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { CLIENT_STATUS_LABELS, type ClientStatus } from "@/types/domain";

const STATUS_OPTIONS: Array<{ value: "all" | ClientStatus; label: string }> = [
	{ value: "all", label: "All statuses" },
	{ value: "active", label: CLIENT_STATUS_LABELS.active },
	{ value: "inactive", label: CLIENT_STATUS_LABELS.inactive },
	{ value: "archived", label: CLIENT_STATUS_LABELS.archived },
];

const SORT_OPTIONS = [
	{ value: "created_at:desc", label: "Newest first" },
	{ value: "created_at:asc", label: "Oldest first" },
	{ value: "full_name:asc", label: "Name A–Z" },
	{ value: "full_name:desc", label: "Name Z–A" },
	{ value: "updated_at:desc", label: "Recently updated" },
];

export function ClientsToolbar() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const current = {
		search: searchParams.get("search") ?? "",
		status: searchParams.get("status") ?? "all",
		sort: `${searchParams.get("sortBy") ?? "created_at"}:${searchParams.get("sortDir") ?? "desc"}`,
	};

	function update(key: string, value: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (value === "" || value === "all") {
			params.delete(key);
		} else {
			params.set(key, value);
		}
		params.delete("page");
		startTransition(() => {
			router.push(`${pathname}?${params.toString()}`);
		});
	}

	function handleSearch(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const q = (
			e.currentTarget.elements.namedItem("search") as HTMLInputElement
		).value;
		update("search", q);
	}

	function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const [sortBy, sortDir] = e.target.value.split(":");
		const params = new URLSearchParams(searchParams.toString());
		params.set("sortBy", sortBy);
		params.set("sortDir", sortDir);
		params.delete("page");
		startTransition(() => {
			router.push(`${pathname}?${params.toString()}`);
		});
	}

	return (
		<div
			className={`flex flex-wrap items-center gap-3 transition-opacity ${isPending ? "opacity-60" : ""}`}
		>
			{/* Search */}
			<form
				onSubmit={handleSearch}
				className="flex min-w-0 flex-1 items-center gap-2"
			>
				<div className="relative flex-1">
					<svg
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.75}
						stroke="currentColor"
						className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"
						/>
					</svg>
					<input
						name="search"
						defaultValue={current.search}
						placeholder="Search by name…"
						className="w-full rounded-lg border border-[color:var(--border)] bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/40"
					/>
				</div>
				<button
					type="submit"
					className="shrink-0 rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--muted)] transition hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)]"
				>
					Search
				</button>
			</form>

			{/* Status filter */}
			<select
				value={current.status}
				onChange={(e) => update("status", e.target.value)}
				className="rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
			>
				{STATUS_OPTIONS.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>

			{/* Sort */}
			<select
				value={current.sort}
				onChange={handleSortChange}
				className="rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
			>
				{SORT_OPTIONS.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</div>
	);
}
