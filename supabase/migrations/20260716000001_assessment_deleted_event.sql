-- Allow the assessment_deleted event type in the activity log
-- (supports the new per-assessment delete with audit trail).

alter table public.activity_log
  drop constraint if exists activity_log_event_type_check;

alter table public.activity_log
  add constraint activity_log_event_type_check
  check (event_type in (
    'client_created', 'client_updated', 'client_status_changed',
    'intake_saved', 'intake_submitted',
    'assessment_persisted', 'assessment_deleted',
    'quote_generated', 'quote_sent', 'quote_accepted', 'quote_declined',
    'quote_deleted',
    'note_created', 'note_updated', 'note_deleted'));
