import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

type SiteFrameProps = {
  children: React.ReactNode;
};

export function SiteFrame({ children }: SiteFrameProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="navy-panel mb-10 flex items-center justify-between rounded-[2rem] px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
              {siteConfig.name}
            </p>
            <p className="text-sm text-white/72">
              Aging-in-place operations platform
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

        <main className="flex-1 space-y-20 pb-16">{children}</main>
      </div>
    </div>
  );
}