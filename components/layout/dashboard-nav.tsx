"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Icon components ────────────────────────────────────────────────────────────

function HomeIcon() {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.75}
			stroke="currentColor"
			className="h-full w-full"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
			/>
		</svg>
	);
}

function UsersIcon() {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.75}
			stroke="currentColor"
			className="h-full w-full"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
			/>
		</svg>
	);
}

function ClipboardIcon() {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.75}
			stroke="currentColor"
			className="h-full w-full"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
			/>
		</svg>
	);
}

function DocumentIcon() {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.75}
			stroke="currentColor"
			className="h-full w-full"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			/>
		</svg>
	);
}

function ClockIcon() {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.75}
			stroke="currentColor"
			className="h-full w-full"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	);
}

function BookIcon() {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.75}
			stroke="currentColor"
			className="h-full w-full"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
			/>
		</svg>
	);
}

// ── Nav definitions ────────────────────────────────────────────────────────────

type NavItem = {
	label: string;
	href: string;
	icon: React.ReactNode;
	exact?: boolean;
};

const mainNav: ReadonlyArray<NavItem> = [
	{ label: "Dashboard", href: "/dashboard", icon: <HomeIcon />, exact: true },
	{ label: "Clients", href: "/clients", icon: <UsersIcon /> },
	{ label: "Assessments", href: "/assessments", icon: <ClipboardIcon /> },
	{ label: "Quotes", href: "/quotes", icon: <DocumentIcon /> },
	{ label: "Activity", href: "/activity", icon: <ClockIcon /> },
];

const secondaryNav: NavItem = {
	label: "Docs",
	href: "/dashboard/docs",
	icon: <BookIcon />,
	exact: true,
};

function isActive(pathname: string, href: string, exact?: boolean): boolean {
	if (exact) return pathname === href;
	return pathname === href || pathname.startsWith(`${href}/`);
}

// ── Component ──────────────────────────────────────────────────────────────────

type DashboardNavProps = {
	orientation?: "vertical" | "horizontal";
};

export function DashboardNav({ orientation = "vertical" }: DashboardNavProps) {
	const pathname = usePathname();

	if (orientation === "horizontal") {
		const allItems = [...mainNav, secondaryNav];
		return (
			<nav className="flex items-center gap-0.5 overflow-x-auto py-2">
				{allItems.map((item) => {
					const active = isActive(pathname, item.href, item.exact);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
								active
									? "bg-[color:var(--accent)] text-[color:var(--ink)] font-semibold"
									: "text-white/70 hover:bg-white/10 hover:text-white"
							}`}
						>
							<span className="h-4 w-4 shrink-0">
								{item.icon}
							</span>
							{item.label}
						</Link>
					);
				})}
			</nav>
		);
	}

	return (
		<nav className="flex flex-col gap-0.5">
			{mainNav.map((item) => {
				const active = isActive(pathname, item.href, item.exact);
				return (
					<Link
						key={item.href}
						href={item.href}
						className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
							active
								? "bg-[color:var(--accent)] text-[color:var(--ink)] font-semibold"
								: "text-white/70 hover:bg-white/10 hover:text-white"
						}`}
					>
						<span className="h-5 w-5 shrink-0">{item.icon}</span>
						{item.label}
					</Link>
				);
			})}

			<div className="my-3 border-t border-white/10" />

			{(() => {
				const active = isActive(
					pathname,
					secondaryNav.href,
					secondaryNav.exact
				);
				return (
					<Link
						href={secondaryNav.href}
						className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
							active
								? "bg-[color:var(--accent)] text-[color:var(--ink)] font-semibold"
								: "text-white/70 hover:bg-white/10 hover:text-white"
						}`}
					>
						<span className="h-5 w-5 shrink-0">
							{secondaryNav.icon}
						</span>
						{secondaryNav.label}
					</Link>
				);
			})()}
		</nav>
	);
}
