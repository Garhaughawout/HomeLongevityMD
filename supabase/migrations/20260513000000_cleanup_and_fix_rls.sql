-- ─────────────────────────────────────────────────────────────────────────────
-- Cleanup: remove Laravel artifact tables and enforce RLS on all app tables.
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Drop Laravel-only tables (not used by the Next.js app) ────────────────
drop table if exists public.cache_locks           cascade;
drop table if exists public.cache                 cascade;
drop table if exists public.jobs                  cascade;
drop table if exists public.job_batches           cascade;
drop table if exists public.failed_jobs           cascade;
drop table if exists public.sessions              cascade;
drop table if exists public.password_reset_tokens cascade;
drop table if exists public.migrations            cascade;
drop table if exists public.users                 cascade;

-- ── 2. Enable RLS on all app tables ──────────────────────────────────────────
-- (Idempotent: safe to run even if already enabled)

alter table public.clients           enable row level security;
alter table public.client_intake     enable row level security;
alter table public.risk_assessments  enable row level security;
alter table public.quotes            enable row level security;
alter table public.notes             enable row level security;
alter table public.activity_log      enable row level security;

-- ── 3. Drop any stale policies then recreate them cleanly ────────────────────

-- clients
drop policy if exists "staff can select clients"  on public.clients;
drop policy if exists "staff can insert clients"  on public.clients;
drop policy if exists "staff can update clients"  on public.clients;
drop policy if exists "staff can delete clients"  on public.clients;

create policy "staff can select clients" on public.clients
  for select to authenticated using (auth.uid() is not null);
create policy "staff can insert clients" on public.clients
  for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update clients" on public.clients
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete clients" on public.clients
  for delete to authenticated using (auth.uid() is not null);

-- client_intake
drop policy if exists "staff can select client_intake"  on public.client_intake;
drop policy if exists "staff can insert client_intake"  on public.client_intake;
drop policy if exists "staff can update client_intake"  on public.client_intake;
drop policy if exists "staff can delete client_intake"  on public.client_intake;

create policy "staff can select client_intake" on public.client_intake
  for select to authenticated using (auth.uid() is not null);
create policy "staff can insert client_intake" on public.client_intake
  for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update client_intake" on public.client_intake
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete client_intake" on public.client_intake
  for delete to authenticated using (auth.uid() is not null);

-- risk_assessments
drop policy if exists "staff can select risk_assessments"  on public.risk_assessments;
drop policy if exists "staff can insert risk_assessments"  on public.risk_assessments;
drop policy if exists "staff can update risk_assessments"  on public.risk_assessments;
drop policy if exists "staff can delete risk_assessments"  on public.risk_assessments;

create policy "staff can select risk_assessments" on public.risk_assessments
  for select to authenticated using (auth.uid() is not null);
create policy "staff can insert risk_assessments" on public.risk_assessments
  for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update risk_assessments" on public.risk_assessments
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete risk_assessments" on public.risk_assessments
  for delete to authenticated using (auth.uid() is not null);

-- quotes
drop policy if exists "staff can select quotes"  on public.quotes;
drop policy if exists "staff can insert quotes"  on public.quotes;
drop policy if exists "staff can update quotes"  on public.quotes;
drop policy if exists "staff can delete quotes"  on public.quotes;

create policy "staff can select quotes" on public.quotes
  for select to authenticated using (auth.uid() is not null);
create policy "staff can insert quotes" on public.quotes
  for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update quotes" on public.quotes
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete quotes" on public.quotes
  for delete to authenticated using (auth.uid() is not null);

-- notes
drop policy if exists "staff can select notes"  on public.notes;
drop policy if exists "staff can insert notes"  on public.notes;
drop policy if exists "staff can update notes"  on public.notes;
drop policy if exists "staff can delete notes"  on public.notes;

create policy "staff can select notes" on public.notes
  for select to authenticated using (auth.uid() is not null);
create policy "staff can insert notes" on public.notes
  for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update notes" on public.notes
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete notes" on public.notes
  for delete to authenticated using (auth.uid() is not null);

-- activity_log (append-only: no update or delete for staff)
drop policy if exists "staff can select activity_log" on public.activity_log;
drop policy if exists "staff can insert activity_log" on public.activity_log;

create policy "staff can select activity_log" on public.activity_log
  for select to authenticated using (auth.uid() is not null);
-- ── 4. Restrict execute on the trigger helper function ───────────────────────
-- set_updated_at() is SECURITY DEFINER and only needs to fire via triggers.
-- Revoking public/anon/authenticated execute removes the advisor warnings.
revoke execute on function public.set_updated_at() from public;
revoke execute on function public.set_updated_at() from anon;
revoke execute on function public.set_updated_at() from authenticated;

