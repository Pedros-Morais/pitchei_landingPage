-- Pitchei landing — tabela de waitlist
-- Permite INSERT anônimo (form público), proíbe SELECT (emails são privados).
-- Roda no projeto Supabase do Pitchei (mesmo do app).

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  origem text default 'landing-pt-br',
  user_agent text,
  referer text,
  created_at timestamptz not null default now(),

  -- Email único, case-insensitive
  constraint waitlist_email_unique unique (email)
);

-- Validação básica de email (regex). Constraint pode ser mais frouxa que client-side.
alter table public.waitlist
  add constraint waitlist_email_format
  check (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

-- Habilitar RLS — sem isso o anon key teria acesso total.
alter table public.waitlist enable row level security;

-- Política: anyone (incluindo anon) pode INSERT.
create policy "anon can insert waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- NÃO criamos policy de SELECT. Sem policy, ninguém lê via API pública.
-- Pedro lê via SQL Editor / Dashboard / service-role key (server-side).

-- Index para consultas internas (análise, exportação)
create index if not exists waitlist_created_at_idx
  on public.waitlist (created_at desc);

comment on table public.waitlist is
  'Cadastros da landing pitchei.com.br. INSERT anônimo, SELECT apenas via service-role.';
