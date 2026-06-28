import Link from "next/link";
import { CLIENT_STATUS_LABELS, type ClientStatus } from "@/types/domain";
import type { ClientRow } from "@/types/supabase";

const STATUS_STYLES: Record<ClientStatus, string> = {
	active: "border-emerald-300 bg-emerald-50 text-emerald-700",
	inactive: "border-amber-300 bg-amber-50 text-amber-700",
	archived: "border-slate-300 bg-slate-100 text-slate-500",
};

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

type ClientsTableProps = {
	clients: ClientRow[];
};

export function ClientsTable({ clients }: ClientsTableProps) {
	return (
		<div className="overflow-hidden rounded-xl border border-[color:var(--border)]">
			<table className="w-full min-w-[640px] border-collapse text-sm">
				<thead>
					<tr className="border-b border-[color:var(--border)] bg-[color:var(--surface)]">
						<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
							Name
						</th>
						<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
							Contact
						</th>
						<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
							Status
						</th>
						<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
							Added
						</th>
						<th className="px-4 py-3" />
					</tr>
				</thead>
				<tbody>
					{clients.map((client, i) => (
						<tr
							key={client.id}
							className={`border-b border-[color:var(--border)] transition-colors hover:bg-[color:var(--surface)] ${
								i === clients.length - 1 ? "border-b-0" : ""
							}`}
						>
							{/* Name */}
							<td className="px-4 py-3 font-medium text-[color:var(--foreground)]">
								<Link
									href={`/clients/${client.id}`}
									className="hover:underline"
								>
									{client.full_name}
								</Link>
							</td>

							{/* Contact */}
							<td className="px-4 py-3 text-[color:var(--muted)]">
								{client.email ?? client.phone ?? (
									<span className="italic text-[color:var(--muted)]/60">
										—
									</span>
								)}
							</td>

							{/* Status badge */}
							<td className="px-4 py-3">
								<span
									className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
										STATUS_STYLES[
											client.status as ClientStatus
										] ?? STATUS_STYLES.inactive
									}`}
								>
									{CLIENT_STATUS_LABELS[
										client.status as ClientStatus
									] ?? client.status}
								</span>
							</td>

							{/* Added date */}
							<td className="px-4 py-3 text-[color:var(--muted)]">
								{formatDate(client.created_at)}
							</td>

							{/* Row actions */}
							<td className="px-4 py-3">
								<div className="flex items-center justify-end gap-2">
									<Link
										href={`/clients/${client.id}/intake`}
										className="rounded-lg bg-[color:var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
									>
										Start Intake
									</Link>
									<Link
										href={`/clients/${client.id}`}
										className="text-xs font-medium text-[color:var(--accent)] hover:underline"
									>
										View →
									</Link>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
