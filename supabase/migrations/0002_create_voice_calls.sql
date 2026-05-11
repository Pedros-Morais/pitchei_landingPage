-- Rate-limit ledger for the public voice-suggest demo.
-- Server-only access via service_role; no anon policies.
create table if not exists public.voice_calls (
  id bigserial primary key,
  ip text not null,
  called_at timestamptz not null default now()
);

create index if not exists voice_calls_ip_called_idx
  on public.voice_calls (ip, called_at desc);

alter table public.voice_calls enable row level security;
-- (No policies on purpose: only service_role from the edge function writes/reads.)

comment on table public.voice_calls is
  'Rate-limit ledger for /functions/v1/voice-suggest. One row per call. Server-only.';
