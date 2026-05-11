-- ─────────────────────────────────────────────────────────────────────────────
-- 005: notes
--   Free-text staff notes attached to a client.  Soft-delete via is_deleted
--   so the activity_log can still reference the note entity after removal.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.notes (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- ownership
  client_id   uuid        not null references public.clients (id) on delete cascade,

  -- content
  content     text        not null check (length(trim(content)) > 0),

  -- soft delete
  is_deleted  boolean     not null default false,

  -- audit
  created_by  uuid references auth.users (id) on delete set null,
  updated_by  uuid references auth.users (id) on delete set null
);

-- updated_at trigger
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index notes_client_id_idx on public.notes (client_id);

-- Most queries filter out deleted notes
create index notes_active_idx
  on public.notes (client_id, created_at desc)
  where is_deleted = false;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.notes enable row level security;

create policy "staff can select notes"
  on public.notes for select
  to authenticated
  using (true);

create policy "staff can insert notes"
  on public.notes for insert
  to authenticated
  with check (true);

create policy "staff can update notes"
  on public.notes for update
  to authenticated
  using (true)
  with check (true);

create policy "staff can delete notes"
  on public.notes for delete
  to authenticated
  using (true);
