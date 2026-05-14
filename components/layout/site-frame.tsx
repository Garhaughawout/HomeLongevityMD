import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

type SiteFrameProps = {
	children: React.ReactNode;
};

export function SiteFrame({ children }: SiteFrameProps) {
	return (
		<div className="relative">
			<header className="navy-panel mb-6 flex items-center justify-between px-6 py-4 sm:px-10 lg:mx-6 lg:mt-6 lg:rounded-xl lg:px-5 xl:mx-10 2xl:mx-16">
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
						{siteConfig.name}
					</p>
					<p className="text-sm text-white/72">
						Physician-led home assessments · Omaha, NE
					</p>
				</div>
				<nav className="hidden items-center gap-3 md:flex">
					{siteConfig.publicNavigation.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/10 hover:text-white"
						>
							{item.label}
						</Link>
					))}
				</nav>
			</header>
			<div className="mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col px-6 sm:px-10 lg:px-16">
				<main className="flex-1 space-y-20 pb-16">{children}</main>
			</div>
		</div>
	);
}
