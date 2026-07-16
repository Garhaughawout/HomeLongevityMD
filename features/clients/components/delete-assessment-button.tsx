"use client";

import { useState, useTransition } from "react";
import { deleteAssessmentAction } from "@/features/clients/actions/assessments";

type Props = {
	clientId: string;
	assessmentId: string;
};

export function DeleteAssessmentButton({ clientId, assessmentId }: Props) {
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function handleDelete() {
		const confirmed = window.confirm(
			"Delete this assessment? This cannot be undone."
		);
		if (!confirmed) return;

		setError(null);
		startTransition(async () => {
			const result = await deleteAssessmentAction(clientId, assessmentId);
			if ("error" in result) setError(result.error);
		});
	}

	return (
		<div className="flex flex-col items-end gap-1">
			<button
				type="button"
				onClick={handleDelete}
				disabled={isPending}
				className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
			>
				{isPending ? "Deleting…" : "Delete"}
			</button>
			{error && (
				<p className="max-w-xs text-right text-xs text-red-600">{error}</p>
			)}
		</div>
	);
}
