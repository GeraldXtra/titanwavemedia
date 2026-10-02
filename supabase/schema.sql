-- Titan Wave Media: the tables the website writes to.
-- Run this once in the Supabase SQL editor (see supabase/README.md). Running it again is safe.

-- Messages from the contact form, and contact details the site assistant collected.
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  need text not null,
  channel text,
  "rows" text,
  product text,
  message text not null,
  source text not null default 'contact'
);

-- People who asked to hear when a product launches or when there is news. One row per email.
create table if not exists public.notify_list (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email text not null unique,
  source text
);

-- Conversations with the site assistant. Names, phone numbers, account numbers and emails are
-- replaced with [NAME], [PHONE], [ACCOUNT] and [EMAIL] before a row is saved.
create table if not exists public.chat_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);
create index if not exists notify_list_created_at_idx on public.notify_list (created_at desc);
create index if not exists chat_logs_session_idx on public.chat_logs (session_id, created_at);

-- Only the website's server, which uses the service key, can read or write these tables.
-- Row level security with no policies shuts out the public keys completely.
alter table public.messages enable row level security;
alter table public.notify_list enable row level security;
alter table public.chat_logs enable row level security;

revoke all on public.messages, public.notify_list, public.chat_logs from anon, authenticated;
