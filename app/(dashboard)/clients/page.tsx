import { Suspense } from "react";
import { getClients } from "@/services/clients";
import { ClientsTable } from "@/features/clients/components/clients-table";
import { ClientsToolbar } from "@/features/clients/components/clients-toolbar";
import { Pagination } from "@/features/clients/components/pagination";
import { AddClientDialog } from "@/features/clients/components/add-client-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { ClientStatus } from "@/types/domain";

function ClientsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

type ClientsPageProps = {
  searchParams: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
    page?: string;
  };
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const pageSize = 25;

  const result = await getClients({
    search: searchParams.search,
    status: (searchParams.status as ClientStatus | "all") ?? "all",
    sortBy: (searchParams.sortBy as "full_name" | "created_at" | "updated_at") ?? "created_at",
    sortDir: (searchParams.sortDir as "asc" | "desc") ?? "desc",
    page,
    pageSize,
  });

  const isFiltered = !!(searchParams.search || (searchParams.status && searchParams.status !== "all"));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Clients</h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            {result.total} client{result.total !== 1 ? "s" : ""}
          </p>
        </div>
        <AddClientDialog />
      </div>

      {/* Toolbar */}
      <Suspense fallback={null}>
        <ClientsToolbar />
      </Suspense>

      {/* Table or empty state */}
      <Suspense fallback={<LoadingState label="Loading clients…" />}>
        {result.clients.length === 0 ? (
          <EmptyState
            icon={<ClientsIcon />}
            title={isFiltered ? "No clients match" : "No clients yet"}
            description={
              isFiltered
                ? "Try adjusting your search or status filter."
                : "Add your first client using the button above."
            }
          />
        ) : (
          <>
            <ClientsTable clients={result.clients} />
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              total={result.total}
              pageSize={result.pageSize}
            />
          </>
        )}
      </Suspense>
    </div>
  );
}

