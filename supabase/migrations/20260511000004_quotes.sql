-- ─────────────────────────────────────────────────────────────────────────────
-- 004: quotes
--   Pricing proposals generated from a risk_assessment.
--   Versioning tracks regenerations; only one quote per client/assessment pair
--   should be in 'sent'/'accepted' state at a time (enforced at app layer).
--   Monetary columns use numeric(10,2) for precision; risk_multiplier is
--   numeric(5,4) to allow e.g. 1.3500 (35% uplift).
-- ─────────────────────────────────────────────────────────────────────────────

create table public.quotes (
  id                  uuid          primary key default gen_random_uuid(),
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now(),

  -- lineage
  client_id           uuid          not null references public.clients (id)            on delete cascade,
  assessment_id       uuid                   references public.risk_assessments (id)   on delete set null,

  -- versioning
  version             int           not null default 1,

  -- workflow
  status              text          not null default 'draft'
                        check (status in ('draft', 'sent', 'accepted', 'declined', 'expired')),

  -- pricing
  base_monthly_rate   numeric(10,2) not null check (base_monthly_rate   >= 0),
  risk_multiplier     numeric(5,4)  not null default 1.0000 check (risk_multiplier >= 1.0),
  final_monthly_rate  numeric(10,2) not null check (final_monthly_rate  >= 0),

  -- detail blobs
  services_included   jsonb,   -- array of service line items
  pricing_details     jsonb,   -- full breakdown used to render the quote PDF / UI

  -- lifecycle timestamps
  valid_until         date,
  sent_at             timestamptz,
  accepted_at         timestamptz,

  -- audit
  created_by          uuid references auth.users (id) on delete set null
);

-- updated_at trigger
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index quotes_client_id_idx     on public.quotes (client_id);
create index quotes_assessment_id_idx on public.quotes (assessment_id);
create index quotes_status_idx        on public.quotes (status);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.quotes enable row level security;

create policy "staff can select quotes"
  on public.quotes for select
  to authenticated
  using (true);

create policy "staff can insert quotes"
  on public.quotes for insert
  to authenticated
  with check (true);

create policy "staff can update quotes"
  on public.quotes for update
  to authenticated
  using (true)
  with check (true);

create policy "staff can delete quotes"
  on public.quotes for delete
  to authenticated
  using (true);
