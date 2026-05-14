import type { ClientRow } from "@/types/supabase";
import { CLIENT_STATUS_LABELS, type ClientStatus } from "@/types/domain";
import Link from "next/link";

const STATUS_STYLES: Record<ClientStatus, string> = {
	active: "border-emerald-300 bg-emerald-50 text-emerald-700",
	inactive: "border-amber-300 bg-amber-50 text-amber-700",
	archived: "border-slate-300 bg-slate-100 text-slate-500",
};

type ClientDetailHeaderProps = {
	client: ClientRow;
};

export function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
	const status = client.status as ClientStatus;

	return (
		<div>
			{/* Breadcrumb */}
			<nav className="mb-4 flex items-center gap-2 text-sm text-[color:var(--muted)]">
				<Link
					href="/clients"
					className="hover:text-[color:var(--foreground)] hover:underline"
				>
					Clients
				</Link>
				<span>/</span>
				<span className="text-[color:var(--foreground)]">
					{client.full_name}
				</span>
			</nav>

			{/* Identity row */}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-semibold text-[color:var(--foreground)]">
							{client.full_name}
						</h1>
						<span
							className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
								STATUS_STYLES[status] ?? STATUS_STYLES.inactive
							}`}
						>
							{CLIENT_STATUS_LABELS[status] ?? status}
						</span>
					</div>
					<div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted)]">
						{client.email && <span>{client.email}</span>}
						{client.phone && <span>{client.phone}</span>}
						{client.city && client.state && (
							<span>
								{client.city}, {client.state}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
