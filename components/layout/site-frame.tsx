import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

type SiteFrameProps = {
  children: React.ReactNode;
};

export function SiteFrame({ children }: SiteFrameProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="surface mb-10 flex items-center justify-between rounded-full px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              {siteConfig.name}
            </p>
            <p className="text-sm text-[color:var(--muted)]">
              Aging-in-place operations platform
            </p>
          </div>
          <nav className="hidden items-center gap-3 md:flex">
            {siteConfig.publicNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--accent-soft)] hover:text-foreground"
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