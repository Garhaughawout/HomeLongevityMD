import Link from "next/link";
import { requireAuthenticatedUser } from "@/services/auth/session";
import { createServerSupabaseClient } from "@/services/supabase/server";
import type { ClientRow } from "@/types/supabase";

async function getDashboardStats() {
  const supabase = createServerSupabaseClient();
  const [
    { count: total },
    { count: active },
    { count: pending },
    { count: quoteSent },
    { data: recentClients },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("quotes").select("*", { count: "exact", head: true }).eq("status", "sent"),
    supabase.from("clients").select("*").order("created_at", { ascending: false }).limit(6),
  ]);
  return {
    total: total ?? 0,
    active: active ?? 0,
    pending: pending ?? 0,
    quoteSent: quoteSent ?? 0,
    recentClients: (recentClients ?? []) as ClientRow[],
  };
}

const STATUS_STYLE: Record<string, string> = {
  active:      "bg-emerald-100 text-emerald-800",
  pending:     "bg-amber-100 text-amber-800",
  inactive:    "bg-gray-100 text-gray-600",
  prospect:    "bg-blue-100 text-blue-800",
  discharged:  "bg-gray-100 text-gray-500",
};

export default async function DashboardPage() {
  const [user, stats] = await Promise.all([
    requireAuthenticatedUser(),
    getDashboardStats(),
  ]);

  const kpis = [
    { label: "Total Clients",   value: stats.total,     color: "var(--ink)" },
    { label: "Active",          value: stats.active,    color: "#059669" },
    { label: "Pending",         value: stats.pending,   color: "var(--accent-strong)" },
    { label: "Quotes Sent",     value: stats.quoteSent, color: "var(--navy)" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">Welcome back, {user.email}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <article
            key={k.label}
            className="rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-3xl font-bold tracking-tight" style={{ color: k.color }}>{k.value}</p>
            <p className="mt-1 text-xs font-medium" style={{ color: "var(--muted)" }}>{k.label}</p>
          </article>
        ))}
      </div>

      {/* Recent clients */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Recent Clients</h2>
          <Link href="/clients" className="text-xs font-medium" style={{ color: "var(--accent-strong)" }}>
            View all →
          </Link>
        </div>
        {stats.recentClients.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm" style={{ color: "var(--muted)" }}>No clients yet. <Link href="/clients" className="underline" style={{ color: "var(--navy)" }}>Add your first.</Link></p>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {stats.recentClients.map((c) => (
              <li key={c.id} className="px-6 py-3 flex items-center justify-between gap-4">
                <Link href={`/clients/${c.id}`} className="text-sm font-medium hover:underline" style={{ color: "var(--foreground)" }}>
                  {c.full_name}
                </Link>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[c.status ?? ""] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

