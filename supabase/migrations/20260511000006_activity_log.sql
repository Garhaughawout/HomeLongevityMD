-- ─────────────────────────────────────────────────────────────────────────────
-- 006: activity_log
--   Append-only audit trail for all internal workflow events.
--   client_id is nullable so non-client events (future: system events) can
--   still be logged.  No updated_at: rows are never mutated after insert.
--   entity_type + entity_id give a polymorphic pointer to the source record.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.activity_log (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  -- context
  client_id    uuid references public.clients (id) on delete set null,
  actor_id     uuid references auth.users (id)     on delete set null,

  -- event classification
  event_type   text        not null
                 check (event_type in (
                   'client_created',
                   'client_updated',
                   'client_status_changed',
                   'intake_saved',
                   'intake_submitted',
                   'assessment_persisted',
                   'quote_generated',
                   'quote_sent',
                   'quote_accepted',
                   'quote_declined',
                   'note_created',
                   'note_updated',
                   'note_deleted'
                 )),

  -- polymorphic source reference
  entity_type  text,   -- 'client' | 'intake' | 'assessment' | 'quote' | 'note'
  entity_id    uuid,

  -- arbitrary extra context (diff snapshots, old/new status, etc.)
  metadata     jsonb
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index activity_log_client_id_idx  on public.activity_log (client_id);
create index activity_log_actor_id_idx   on public.activity_log (actor_id);
create index activity_log_event_type_idx on public.activity_log (event_type);
create index activity_log_created_at_idx on public.activity_log (created_at desc);
create index activity_log_entity_idx     on public.activity_log (entity_type, entity_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- Append-only: staff can SELECT and INSERT; no UPDATE or DELETE policies.

alter table public.activity_log enable row level security;

create policy "staff can select activity_log"
  on public.activity_log for select
  to authenticated
  using (true);

create policy "staff can insert activity_log"
  on public.activity_log for insert
  to authenticated
  with check (true);
