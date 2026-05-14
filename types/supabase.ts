import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database";

export type TypedSupabaseClient = SupabaseClient<Database>;

// ── Convenience row types ─────────────────────────────────────────────────────
// Import these instead of reaching into Database["public"]["Tables"][...]["Row"].

export type ClientRow = Tables<"clients">;
export type ClientIntakeRow = Tables<"client_intake">;
export type RiskAssessmentRow = Tables<"risk_assessments">;
export type QuoteRow = Tables<"quotes">;
export type NoteRow = Tables<"notes">;
export type ActivityLogRow = Tables<"activity_log">;
