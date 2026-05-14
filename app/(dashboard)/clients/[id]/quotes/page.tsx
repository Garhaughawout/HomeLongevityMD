import { notFound } from "next/navigation";
import { getClientById } from "@/services/clients";
import { getQuotesByClientId } from "@/services/quotes";
import { getAssessmentsByClientId } from "@/services/assessments";
import { QuotesList } from "@/features/clients/components/quotes-list";

type Props = {
	params: { id: string };
	searchParams: { assessment_id?: string };
};

export default async function ClientQuotesPage({
	params,
	searchParams,
}: Props) {
	const [client, quotes, assessments] = await Promise.all([
		getClientById(params.id),
		getQuotesByClientId(params.id),
		getAssessmentsByClientId(params.id),
	]);
	if (!client) notFound();

	return (
		<QuotesList
			clientId={client.id}
			initialQuotes={quotes}
			assessments={assessments}
			defaultAssessmentId={searchParams.assessment_id}
		/>
	);
}
