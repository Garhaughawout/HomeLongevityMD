"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
	label: string;
	href: string;
	exact?: boolean;
};

function tabs(clientId: string): Tab[] {
	return [
		{ label: "Overview", href: `/clients/${clientId}`, exact: true },
		{ label: "Intake", href: `/clients/${clientId}/intake` },
		{ label: "Assessments", href: `/clients/${clientId}/assessments` },
		{ label: "Quotes", href: `/clients/${clientId}/quotes` },
		{ label: "Notes", href: `/clients/${clientId}/notes` },
		{ label: "Activity", href: `/clients/${clientId}/activity` },
	];
}

type ClientDetailTabsProps = {
	clientId: string;
};

export function ClientDetailTabs({ clientId }: ClientDetailTabsProps) {
	const pathname = usePathname();

	return (
		<div className="border-b border-[color:var(--border)]">
			<nav className="-mb-px flex items-end gap-0 overflow-x-auto">
				{tabs(clientId).map((tab) => {
					const active = tab.exact
						? pathname === tab.href
						: pathname.startsWith(tab.href);
					return (
						<Link
							key={tab.href}
							href={tab.href}
							className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
								active
									? "border-[color:var(--accent)] text-[color:var(--foreground)]"
									: "border-transparent text-[color:var(--muted)] hover:border-[color:var(--border)] hover:text-[color:var(--foreground)]"
							}`}
						>
							{tab.label}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
