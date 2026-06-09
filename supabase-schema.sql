-- Run this in your Supabase SQL editor to set up the schema

-- Sessions table: created by consultant, one per customer engagement
create table sessions (
  id uuid primary key default gen_random_uuid(),
  consultant_id text not null,          -- Google sub/email from NextAuth
  consultant_email text not null,
  consultant_name text,
  customer_name text not null,
  customer_email text not null,
  status text not null default 'pending', -- pending | submitted | complete | error
  created_at timestamptz default now(),
  submitted_at timestamptz,
  completed_at timestamptz
);

-- Responses table: customer form submission (one per session)
create table responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  form_data jsonb not null,
  submitted_at timestamptz default now()
);

-- Results table: AI-generated recommendations (one per session)
create table results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  recommendations jsonb not null,
  generated_at timestamptz default now()
);

-- Row level security: consultants can only see their own sessions
alter table sessions enable row level security;
alter table responses enable row level security;
alter table results enable row level security;

-- Service role bypasses RLS (used server-side)
-- Anon key gets no access (customer form uses service role via API route)

-- Index for fast lookup by consultant
create index sessions_consultant_id_idx on sessions(consultant_id);
create index responses_session_id_idx on responses(session_id);
create index results_session_id_idx on results(session_id);
