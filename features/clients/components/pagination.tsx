"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type PaginationProps = {
	page: number;
	pageCount: number;
	total: number;
	pageSize: number;
};

export function Pagination({
	page,
	pageCount,
	total,
	pageSize,
}: PaginationProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const from = Math.min((page - 1) * pageSize + 1, total);
	const to = Math.min(page * pageSize, total);

	function goTo(p: number) {
		const params = new URLSearchParams(searchParams.toString());
		if (p === 1) {
			params.delete("page");
		} else {
			params.set("page", String(p));
		}
		startTransition(() => {
			router.push(`${pathname}?${params.toString()}`);
		});
	}

	if (total === 0) return null;

	return (
		<div
			className={`flex items-center justify-between text-sm transition-opacity ${isPending ? "opacity-60" : ""}`}
		>
			<p className="text-[color:var(--muted)]">
				{from}–{to} of {total} client{total !== 1 ? "s" : ""}
			</p>
			<div className="flex items-center gap-1">
				<button
					disabled={page <= 1 || isPending}
					onClick={() => goTo(page - 1)}
					className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 font-medium text-[color:var(--muted)] transition hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
				>
					← Prev
				</button>
				<span className="px-2 tabular-nums text-[color:var(--muted)]">
					{page} / {pageCount}
				</span>
				<button
					disabled={page >= pageCount || isPending}
					onClick={() => goTo(page + 1)}
					className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 font-medium text-[color:var(--muted)] transition hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
				>
					Next →
				</button>
			</div>
		</div>
	);
}
