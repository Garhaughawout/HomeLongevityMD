import { notFound } from "next/navigation";
import { getClientById } from "@/services/clients";
import { ClientDetailHeader } from "@/features/clients/components/client-detail-header";
import { ClientDetailTabs } from "@/features/clients/components/client-detail-tabs";

type ClientDetailLayoutProps = {
  children: React.ReactNode;
  params: { id: string };
};

export default async function ClientDetailLayout({ children, params }: ClientDetailLayoutProps) {
  const client = await getClientById(params.id);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <ClientDetailHeader client={client} />
      <ClientDetailTabs clientId={client.id} />
      <div>{children}</div>
    </div>
  );
}
