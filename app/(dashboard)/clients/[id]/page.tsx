import { getClientById } from "@/services/clients";
import { notFound } from "next/navigation";

type ClientOverviewPageProps = {
	params: { id: string };
};

function formatDate(iso: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

function DetailRow({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-0.5 py-3">
			<dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
				{label}
			</dt>
			<dd className="text-sm text-[color:var(--foreground)]">
				{value ?? "—"}
			</dd>
		</div>
	);
}

export default async function ClientOverviewPage({
	params,
}: ClientOverviewPageProps) {
	const client = await getClientById(params.id);
	if (!client) notFound();

	const address = [
		client.address_line1,
		client.address_line2,
		[client.city, client.state].filter(Boolean).join(", "),
		client.zip,
	]
		.filter(Boolean)
		.join("\n");

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Profile card */}
			<section className="surface rounded-2xl p-6">
				<h2 className="mb-2 text-sm font-semibold text-[color:var(--foreground)]">
					Profile
				</h2>
				<dl className="divide-y divide-[color:var(--border)]">
					<DetailRow label="Full name" value={client.full_name} />
					<DetailRow label="Email" value={client.email} />
					<DetailRow label="Phone" value={client.phone} />
					<DetailRow
						label="Date of birth"
						value={formatDate(client.date_of_birth)}
					/>
					<DetailRow label="Status" value={client.status} />
					<DetailRow
						label="Added"
						value={formatDate(client.created_at)}
					/>
				</dl>
			</section>

			{/* Address card */}
			<section className="surface rounded-2xl p-6">
				<h2 className="mb-2 text-sm font-semibold text-[color:var(--foreground)]">
					Address
				</h2>
				{address ? (
					<p className="whitespace-pre-line text-sm text-[color:var(--foreground)]">
						{address}
					</p>
				) : (
					<p className="text-sm italic text-[color:var(--muted)]">
						No address on file.
					</p>
				)}
			</section>
		</div>
	);
}
