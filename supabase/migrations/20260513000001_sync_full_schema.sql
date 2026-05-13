-- -----------------------------------------------------------------------------
-- DROP and RECREATE all app tables from scratch.
-- ? DESTRUCTIVE: all existing rows will be deleted.
-- Run once in Supabase Dashboard ? SQL Editor ? New query.
-- -----------------------------------------------------------------------------

-- -- Drop all app tables (reverse FK order) -----------------------------------
drop table if exists public.activity_log      cascade;
drop table if exists public.notes             cascade;
drop table if exists public.quotes            cascade;
drop table if exists public.risk_assessments  cascade;
drop table if exists public.client_intake     cascade;
drop table if exists public.clients           cascade;

-- -- 0. Trigger helper --------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

revoke execute on function public.set_updated_at() from public;
revoke execute on function public.set_updated_at() from anon;
revoke execute on function public.set_updated_at() from authenticated;


-- -- 1. clients ---------------------------------------------------------------
create table public.clients (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  full_name     text        not null,
  email         text,
  phone         text,
  date_of_birth date,
  address_line1 text,
  address_line2 text,
  city          text,
  state         char(2),
  zip           text,
  status        text        not null default 'active'
                  check (status in ('active', 'inactive', 'archived')),
  created_by    uuid references auth.users (id) on delete set null
);

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create index clients_status_idx     on public.clients (status);
create index clients_full_name_idx  on public.clients (lower(full_name));
create index clients_created_by_idx on public.clients (created_by);

alter table public.clients enable row level security;


-- -- 2. client_intake ---------------------------------------------------------
create table public.client_intake (
  id                uuid        primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  client_id         uuid        not null references public.clients (id) on delete cascade,
  version           int         not null default 1,
  status            text        not null default 'draft'
                      check (status in ('draft', 'submitted')),
  home_safety       jsonb,
  mobility          jsonb,
  adls_iadls        jsonb,
  cognition         jsonb,
  fall_risk         jsonb,
  caregiver_support jsonb,
  physician_review  jsonb,
  submitted_at      timestamptz,
  submitted_by      uuid references auth.users (id) on delete set null,
  created_by        uuid references auth.users (id) on delete set null
);

create trigger client_intake_set_updated_at
  before update on public.client_intake
  for each row execute function public.set_updated_at();

create index client_intake_client_id_idx on public.client_intake (client_id);
create index client_intake_status_idx    on public.client_intake (status);

alter table public.client_intake enable row level security;


-- -- 3. risk_assessments ------------------------------------------------------
create table public.risk_assessments (
  id                      uuid        primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  client_id               uuid        not null references public.clients (id)       on delete cascade,
  intake_id               uuid                 references public.client_intake (id) on delete set null,
  scoring_version         text        not null default '1.0',
  home_safety_score       smallint    not null check (home_safety_score       between 0 and 100),
  mobility_score          smallint    not null check (mobility_score          between 0 and 100),
  adls_iadls_score        smallint    not null check (adls_iadls_score        between 0 and 100),
  cognition_score         smallint    not null check (cognition_score         between 0 and 100),
  fall_risk_score         smallint    not null check (fall_risk_score         between 0 and 100),
  caregiver_support_score smallint    not null check (caregiver_support_score between 0 and 100),
  aggregate_score         smallint    not null check (aggregate_score         between 0 and 100),
  risk_category           text        not null
                            check (risk_category in ('low','moderate','high','very_high','unsafe_independent')),
  score_details           jsonb,
  created_by              uuid references auth.users (id) on delete set null
);

create trigger risk_assessments_set_updated_at
  before update on public.risk_assessments
  for each row execute function public.set_updated_at();

create index risk_assessments_client_id_idx     on public.risk_assessments (client_id);
create index risk_assessments_intake_id_idx     on public.risk_assessments (intake_id);
create index risk_assessments_risk_category_idx on public.risk_assessments (risk_category);

alter table public.risk_assessments enable row level security;


-- -- 4. quotes ----------------------------------------------------------------
create table public.quotes (
  id                  uuid          primary key default gen_random_uuid(),
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now(),
  client_id           uuid          not null references public.clients (id)          on delete cascade,
  assessment_id       uuid                   references public.risk_assessments (id) on delete set null,
  version             int           not null default 1,
  status              text          not null default 'draft'
                        check (status in ('draft','sent','accepted','declined','expired')),
  base_monthly_rate   numeric(10,2) not null check (base_monthly_rate  >= 0),
  risk_multiplier     numeric(5,4)  not null default 1.0000 check (risk_multiplier >= 1.0),
  final_monthly_rate  numeric(10,2) not null check (final_monthly_rate >= 0),
  services_included   jsonb,
  pricing_details     jsonb,
  valid_until         date,
  sent_at             timestamptz,
  accepted_at         timestamptz,
  created_by          uuid references auth.users (id) on delete set null
);

create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

create index quotes_client_id_idx     on public.quotes (client_id);
create index quotes_assessment_id_idx on public.quotes (assessment_id);
create index quotes_status_idx        on public.quotes (status);

alter table public.quotes enable row level security;


-- -- 5. notes -----------------------------------------------------------------
create table public.notes (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  client_id   uuid        not null references public.clients (id) on delete cascade,
  content     text        not null check (length(trim(content)) > 0),
  is_deleted  boolean     not null default false,
  created_by  uuid references auth.users (id) on delete set null,
  updated_by  uuid references auth.users (id) on delete set null
);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create index notes_client_id_idx on public.notes (client_id);
create index notes_active_idx    on public.notes (client_id, created_at desc) where is_deleted = false;

alter table public.notes enable row level security;


-- -- 6. activity_log ----------------------------------------------------------
create table public.activity_log (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  client_id   uuid references public.clients (id) on delete set null,
  actor_id    uuid references auth.users (id)     on delete set null,
  event_type  text        not null
                check (event_type in (
                  'client_created','client_updated','client_status_changed',
                  'intake_saved','intake_submitted',
                  'assessment_persisted',
                  'quote_generated','quote_sent','quote_accepted','quote_declined',
                  'note_created','note_updated','note_deleted'
                )),
  entity_type text,
  entity_id   uuid,
  metadata    jsonb
);

create index activity_log_client_id_idx  on public.activity_log (client_id);
create index activity_log_actor_id_idx   on public.activity_log (actor_id);
create index activity_log_event_type_idx on public.activity_log (event_type);
create index activity_log_created_at_idx on public.activity_log (created_at desc);
create index activity_log_entity_idx     on public.activity_log (entity_type, entity_id);

alter table public.activity_log enable row level security;


-- -- 7. RLS policies ----------------------------------------------------------
-- clients
create policy "staff can select clients" on public.clients for select to authenticated using (auth.uid() is not null);
create policy "staff can insert clients" on public.clients for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update clients" on public.clients for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete clients" on public.clients for delete to authenticated using (auth.uid() is not null);

-- client_intake
create policy "staff can select client_intake" on public.client_intake for select to authenticated using (auth.uid() is not null);
create policy "staff can insert client_intake" on public.client_intake for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update client_intake" on public.client_intake for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete client_intake" on public.client_intake for delete to authenticated using (auth.uid() is not null);

-- risk_assessments
create policy "staff can select risk_assessments" on public.risk_assessments for select to authenticated using (auth.uid() is not null);
create policy "staff can insert risk_assessments" on public.risk_assessments for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update risk_assessments" on public.risk_assessments for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete risk_assessments" on public.risk_assessments for delete to authenticated using (auth.uid() is not null);

-- quotes
create policy "staff can select quotes" on public.quotes for select to authenticated using (auth.uid() is not null);
create policy "staff can insert quotes" on public.quotes for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update quotes" on public.quotes for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete quotes" on public.quotes for delete to authenticated using (auth.uid() is not null);

-- notes
create policy "staff can select notes" on public.notes for select to authenticated using (auth.uid() is not null);
create policy "staff can insert notes" on public.notes for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update notes" on public.notes for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete notes" on public.notes for delete to authenticated using (auth.uid() is not null);

-- activity_log (append-only)
create policy "staff can select activity_log" on public.activity_log for select to authenticated using (auth.uid() is not null);
create policy "staff can insert activity_log" on public.activity_log for insert to authenticated with check (auth.uid() is not null);
