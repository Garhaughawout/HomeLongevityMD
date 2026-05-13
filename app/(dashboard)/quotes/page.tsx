import Link from "next/link";
import { createServerSupabaseClient } from "@/services/supabase/server";
import type { QuoteRow } from "@/types/supabase";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft:    { bg: "#f3f4f6",                       text: "#374151" },
  sent:     { bg: "rgba(199,157,67,0.12)",          text: "#9b7424" },
  accepted: { bg: "rgba(16,185,129,0.12)",          text: "#065f46" },
  declined: { bg: "rgba(239,68,68,0.10)",           text: "#991b1b" },
  expired:  { bg: "#f3f4f6",                       text: "#6b7280" },
};

async function getAllQuotes(): Promise<(QuoteRow & { client_name?: string })[]> {
  const supabase = createServerSupabaseClient();
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  if (!quotes || quotes.length === 0) return [];

  const clientIds = [...new Set(quotes.map((q) => q.client_id))];
  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name")
    .in("id", clientIds);
  const nameMap = new Map((clients ?? []).map((c: { id: string; full_name: string }) => [c.id, c.full_name]));

  return quotes.map((q) => ({ ...q, client_name: nameMap.get(q.client_id) ?? "Unknown" }));
}

export default async function QuotesPage() {
  const quotes = await getAllQuotes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Quotes</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          All pricing proposals across clients, newest first.
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted)" }}>No quotes yet. Open a client and create one from the Quotes tab.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Client</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Rate / mo</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Valid Until</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Created</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {quotes.map((q) => {
                const style = STATUS_STYLES[q.status] ?? STATUS_STYLES.draft;
                return (
                  <tr key={q.id} className="hover:bg-black/[0.02]">
                    <td className="px-5 py-3">
                      <Link href={`/clients/${q.client_id}/quotes`} className="font-medium hover:underline" style={{ color: "var(--foreground)" }}>
                        {(q as QuoteRow & { client_name?: string }).client_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: style.bg, color: style.text }}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums" style={{ color: "var(--ink)" }}>
                      ${Number(q.final_monthly_rate).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-right text-xs tabular-nums" style={{ color: "var(--muted)" }}>
                      {q.valid_until ? new Date(q.valid_until).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-xs tabular-nums" style={{ color: "var(--muted)" }}>
                      {new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
