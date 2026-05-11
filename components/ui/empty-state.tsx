import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)]">
          {icon}
        </div>
      )}
      <div className="max-w-sm space-y-1.5">
        <h3 className="font-semibold text-[color:var(--foreground)]">{title}</h3>
        <p className="text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
