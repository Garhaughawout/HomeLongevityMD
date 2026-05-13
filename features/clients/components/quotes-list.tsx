"use client";

import { useState, useActionState } from "react";
import {
  createQuoteAction,
  updateQuoteStatusAction,
  type CreateQuoteFormState,
} from "@/features/clients/actions/quotes";
import type { QuoteRow, RiskAssessmentRow } from "@/types/supabase";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft:    { bg: "#f3f4f6", text: "#374151" },
  sent:     { bg: "rgba(199,157,67,0.12)", text: "#9b7424" },
  accepted: { bg: "rgba(16,185,129,0.12)", text: "#065f46" },
  declined: { bg: "rgba(239,68,68,0.10)", text: "#991b1b" },
  expired:  { bg: "#f3f4f6", text: "#6b7280" },
};

function formatCurrency(n: number | string | null) {
  if (n == null) return "—";
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function QuoteRow_({ quote, clientId }: { quote: QuoteRow; clientId: string }) {
  const colors = STATUS_COLORS[quote.status] ?? STATUS_COLORS.draft;

  const handleStatus = async (status: "sent" | "accepted" | "declined" | "expired") => {
    await updateQuoteStatusAction(clientId, quote.id, status);
  };

  return (
    <div
      className="rounded-xl p-5 flex flex-wrap items-start gap-4 justify-between"
      style={{ background: "var(--cream-strong)", border: "1px solid var(--border)" }}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Quote v{quote.version}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {quote.status}
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>
          {formatCurrency(quote.final_monthly_rate)}<span className="text-sm font-normal text-[color:var(--muted)]">/mo</span>
        </p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Base {formatCurrency(quote.base_monthly_rate)} · Multiplier {Number(quote.risk_multiplier).toFixed(2)}x · Valid until {formatDate(quote.valid_until)}
        </p>
        {Array.isArray(quote.services_included) && quote.services_included.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {(quote.services_included as string[]).map((s, i) => (
              <li key={i} className="text-xs flex gap-1.5 items-center" style={{ color: "var(--muted-strong)" }}>
                <span style={{ color: "var(--accent)" }}>✓</span> {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {quote.status === "draft" && (
        <div className="flex gap-2 flex-wrap">
          <form action={() => handleStatus("sent")}>
            <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "var(--navy)" }}>
              Mark Sent
            </button>
          </form>
        </div>
      )}
      {quote.status === "sent" && (
        <div className="flex gap-2 flex-wrap">
          <form action={() => handleStatus("accepted")}>
            <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-700">Accept</button>
          </form>
          <form action={() => handleStatus("declined")}>
            <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600">Decline</button>
          </form>
        </div>
      )}
    </div>
  );
}

function CreateQuoteForm({
  clientId,
  assessments,
  onClose,
}: {
  clientId: string;
  assessments: RiskAssessmentRow[];
  onClose: () => void;
}) {
  const boundAction = createQuoteAction.bind(null, clientId);
  const [state, formAction, pending] = useActionState<CreateQuoteFormState, FormData>(
    boundAction,
    {},
  );

  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>New Quote</h2>
      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
              Base Monthly Rate ($) *
            </label>
            <input
              name="base_monthly_rate"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
            />
            {state.errors?.base_monthly_rate && (
              <p className="mt-1 text-xs text-red-600">{state.errors.base_monthly_rate[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
              Risk Multiplier (e.g. 1.25)
            </label>
            <input
              name="risk_multiplier"
              type="number"
              step="0.01"
              min="1"
              defaultValue="1.00"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
              Valid Until
            </label>
            <input
              name="valid_until"
              type="date"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
            />
          </div>
          {assessments.length > 0 && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
                Link Assessment (optional)
              </label>
              <select
                name="assessment_id"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
              >
                <option value="">None</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.risk_category} — {new Date(a.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-strong)" }}>
            Services Included (one per line)
          </label>
          <textarea
            name="services_included"
            rows={4}
            placeholder={"Personal care assistance\nMedication management\nFall prevention monitoring"}
            className="w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--border-strong)", color: "var(--foreground)", backgroundColor: "var(--surface-strong)" }}
          />
        </div>
        {state.globalError && <p className="text-xs text-red-600">{state.globalError}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg text-sm border" style={{ borderColor: "var(--border-strong)", color: "var(--muted-strong)" }}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--navy)" }}
          >
            {pending ? "Creating…" : "Create Quote"}
          </button>
        </div>
      </form>
    </div>
  );
}

type QuotesListProps = {
  clientId: string;
  initialQuotes: QuoteRow[];
  assessments: RiskAssessmentRow[];
};

export function QuotesList({ clientId, initialQuotes, assessments }: QuotesListProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          {initialQuotes.length} Quote{initialQuotes.length !== 1 ? "s" : ""}
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "var(--navy)" }}
          >
            + New Quote
          </button>
        )}
      </div>

      {showForm && (
        <CreateQuoteForm
          clientId={clientId}
          assessments={assessments}
          onClose={() => setShowForm(false)}
        />
      )}

      {initialQuotes.length === 0 && !showForm ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>No quotes yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {initialQuotes.map((q) => (
            <QuoteRow_ key={q.id} quote={q} clientId={clientId} />
          ))}
        </div>
      )}
    </div>
  );
}
