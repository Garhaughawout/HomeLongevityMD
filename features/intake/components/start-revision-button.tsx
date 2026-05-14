"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { startRevisionAction } from "@/features/intake/actions/submit-intake";

type Props = { clientId: string };

export function StartRevisionButton({ clientId }: Props) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	function handleClick() {
		startTransition(async () => {
			const result = await startRevisionAction(clientId);
			if ("intakeId" in result) {
				// Refresh the page — the new draft will now be the latest intake
				router.refresh();
			}
		});
	}

	return (
		<button
			onClick={handleClick}
			disabled={isPending}
			className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface)] disabled:opacity-50"
		>
			{isPending ? "Creating revision…" : "Start Revision"}
		</button>
	);
}
