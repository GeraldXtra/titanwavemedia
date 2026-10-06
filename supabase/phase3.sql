-- Titan Wave Media, phase 3: Wave Assist, the chat assistant a business adds to its own website.
--
-- Run this whole file in the Supabase dashboard, SQL Editor, after phase2.sql.
-- It is safe to run more than once: it only adds what is missing and replaces the functions and
-- policies with the versions below. It keeps every table from schema.sql and phase2.sql, and
-- their rows. It runs as one transaction, so it either all goes in or none of it does.
--
-- How the rules work, the same way as phase 2:
-- - Row level security is on for every new table. A signed in person can only read the
--   assistant, conversations, handovers and usage of their own business, and cannot write any
--   row directly.
-- - Every write goes through the website's server with the service key, after it has checked who
--   is asking. The chat on a business's website talks only to our server, never to the database.
-- - Conversations and their handovers are kept for 6 months. The daily job deletes older ones.
-- - Times are kept in UTC and shown in Lagos time. AI costs are kept in US dollars, the way the
--   AI provider bills them.

begin;

-- ============================================================================================
-- 1. Tables
-- ============================================================================================

-- One assistant for each business: what it knows, how its button looks, the websites it may run
-- on, and whether it is on.
create table if not exists public.assistants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_id uuid not null unique references public.businesses (id) on delete cascade,
  -- The id in the business's install code. It is not a secret.
  public_id text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)
    check (public_id ~ '^[a-z0-9]{8,32}$'),
  is_on boolean not null default false,
  -- The business's details.
  name text not null default '' check (char_length(name) <= 120),
  sells text not null default '' check (char_length(sells) <= 2000),
  -- Prices, or a menu, pasted in.
  prices text not null default '' check (char_length(prices) <= 10000),
  hours text not null default '' check (char_length(hours) <= 1000),
  areas text not null default '' check (char_length(areas) <= 1000),
  -- How customers reach a person. WhatsApp is digits only, with the country code.
  whatsapp text not null default '' check (whatsapp ~ '^([0-9]{8,15})?$'),
  phone text not null default '' check (char_length(phone) <= 40),
  email text not null default '' check (char_length(email) <= 254),
  -- Questions and answers, up to 50: [{ "q": "...", "a": "..." }].
  qa jsonb not null default '[]'::jsonb
    check (jsonb_typeof(qa) = 'array' and jsonb_array_length(qa) <= 50 and char_length(qa::text) <= 200000),
  -- Anything else it should know, pasted in.
  extra text not null default '' check (char_length(extra) <= 20000),
  greeting text not null default '' check (char_length(greeting) <= 300),
  -- Up to 4 starter questions: ["...", "..."].
  starters jsonb not null default '[]'::jsonb
    check (jsonb_typeof(starters) = 'array' and jsonb_array_length(starters) <= 4 and char_length(starters::text) <= 2000),
  -- The chat button: its colour, the text colour that reads on it at 4.6:1 or more, and the corner.
  color text not null default '#0b0b0b' check (color ~ '^#[0-9a-f]{6}$'),
  text_color text not null default '#ffffff' check (text_color in ('#ffffff', '#000000')),
  corner text not null default 'right' check (corner in ('right', 'left')),
  -- The websites it may run on: host names with an optional port, without "www.", like
  -- "shop.com" or "localhost:3201". Up to 20. The server cleans and checks each one.
  sites text[] not null default '{}'
    check (cardinality(sites) <= 20 and array_to_string(sites, ' ', ' ') ~ '^([a-z0-9.:-]+( [a-z0-9.:-]+)*)?$'),
  -- Conversations a month, by Lagos calendar month. The team can change it.
  monthly_limit integer not null default 100 check (monthly_limit between 0 and 1000000),
  -- The last time the chat opened on one of the listed websites, and which one.
  seen_at timestamptz,
  seen_site text check (char_length(seen_site) <= 300),
  updated_by uuid references auth.users (id) on delete set null,
  -- Lets the tables below check that a row's business is its assistant's business.
  unique (id, business_id)
);

-- A conversation between the assistant and one customer on the business's website. It starts
-- with the customer's first message, and ends after 24 hours with no messages, or when the
-- customer starts again. Test chats in the console are never kept here.
create table if not exists public.assist_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  assistant_id uuid not null,
  business_id uuid not null references public.businesses (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  -- The customer's messages so far. A conversation takes up to 30.
  message_count integer not null default 0 check (message_count >= 0),
  -- answered: every question was answered. unanswered: at least one wasn't. handed_over: the
  -- customer went to a person, on WhatsApp or by leaving their details.
  outcome text not null default 'answered' check (outcome in ('answered', 'unanswered', 'handed_over')),
  first_message text check (char_length(first_message) <= 600),
  -- Started after the business's monthly limit was reached: it only offers a person, and it
  -- does not count towards the limit.
  over_limit boolean not null default false,
  -- When the customer pressed Start again.
  ended_at timestamptz,
  -- When the customer pressed the business's WhatsApp.
  whatsapp_at timestamptz,
  foreign key (assistant_id, business_id) references public.assistants (id, business_id) on delete cascade,
  unique (id, business_id)
);

-- The messages in a conversation, oldest first by id. Card, account and phone numbers and
-- email addresses are taken out of the customer's words before they are kept.
create table if not exists public.assist_messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  conversation_id uuid not null,
  business_id uuid not null references public.businesses (id) on delete cascade,
  role text not null check (role in ('customer', 'assistant')),
  body text not null check (char_length(body) between 1 and 2000),
  -- Whether the assistant could answer the question from what it was taught. Null when a limit,
  -- or an answer that took too long, stopped it trying.
  answered boolean,
  -- On the assistant's message: it offered the customer a person.
  handover boolean not null default false,
  -- On the assistant's message, how the answer was made: by the AI model, by matching the
  -- business's questions and answers, or a set reply when a limit was reached, or the model
  -- took too long or failed.
  source text check (source in ('model', 'match', 'limit', 'timeout', 'error')),
  -- On the customer's message: the question in a plain form, so repeats can be grouped, and when
  -- the business added an answer for it.
  question_key text check (char_length(question_key) <= 200),
  resolved_at timestamptz,
  foreign key (conversation_id, business_id) references public.assist_conversations (id, business_id) on delete cascade
);

-- "Leave your details": a customer who wants a person to get back to them. The business sees it
-- in its console, with a bell notice and an email.
create table if not exists public.assist_handovers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  conversation_id uuid not null,
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  phone text check (char_length(phone) <= 40),
  email text check (char_length(email) <= 254),
  -- What the customer asked, so the business knows what it is about.
  question text check (char_length(question) <= 600),
  handled_at timestamptz,
  handled_by uuid references auth.users (id) on delete set null,
  check (coalesce(phone, '') <> '' or coalesce(email, '') <> ''),
  foreign key (conversation_id, business_id) references public.assist_conversations (id, business_id) on delete cascade
);

-- Every answer from the AI model: its tokens, including cache reads and writes, and a rough cost.
-- Test chats are marked: they count towards the daily safety limit and the cost, but not the
-- business's conversations.
create table if not exists public.assist_usage (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  assistant_id uuid not null,
  business_id uuid not null references public.businesses (id) on delete cascade,
  conversation_id uuid,
  test boolean not null default false,
  model text not null check (char_length(model) <= 100),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cache_write_tokens integer not null default 0 check (cache_write_tokens >= 0),
  cache_read_tokens integer not null default 0 check (cache_read_tokens >= 0),
  cost_usd numeric(12, 6) not null default 0 check (cost_usd >= 0),
  ms integer check (ms >= 0),
  outcome text not null default 'ok' check (outcome in ('ok', 'timeout', 'error')),
  foreign key (assistant_id, business_id) references public.assistants (id, business_id) on delete cascade,
  -- When a conversation is deleted, its usage stays for the costs, without the conversation.
  foreign key (conversation_id, business_id) references public.assist_conversations (id, business_id) on delete set null (conversation_id)
);

-- The rest of this file changes these tables. Taking their locks now, in the same order the chat
-- takes them (assistant first), means a second run can never get stuck behind a chat in progress.
lock table public.assistants, public.assist_conversations, public.assist_messages, public.assist_handovers, public.assist_usage
in access exclusive mode;

-- ============================================================================================
-- 2. Indexes
-- ============================================================================================

create index if not exists assist_conversations_business_idx on public.assist_conversations (business_id, last_message_at desc);
create index if not exists assist_conversations_started_idx on public.assist_conversations (business_id, created_at desc);
create index if not exists assist_conversations_month_idx on public.assist_conversations (assistant_id, created_at);
create index if not exists assist_conversations_old_idx on public.assist_conversations (last_message_at);
create index if not exists assist_messages_conversation_idx on public.assist_messages (conversation_id, id);
create index if not exists assist_messages_business_idx on public.assist_messages (business_id, created_at desc);
create index if not exists assist_messages_unanswered_idx on public.assist_messages (business_id, created_at desc)
  where role = 'customer' and answered = false and resolved_at is null;
create index if not exists assist_messages_question_idx on public.assist_messages (business_id, question_key)
  where role = 'customer';
create index if not exists assist_handovers_business_idx on public.assist_handovers (business_id, created_at desc);
create index if not exists assist_handovers_open_idx on public.assist_handovers (business_id) where handled_at is null;
create index if not exists assist_handovers_conversation_idx on public.assist_handovers (conversation_id);
create index if not exists assist_usage_created_at_idx on public.assist_usage (created_at);
create index if not exists assist_usage_business_idx on public.assist_usage (business_id, created_at desc);
create index if not exists assist_usage_assistant_idx on public.assist_usage (assistant_id);
create index if not exists assist_usage_conversation_idx on public.assist_usage (conversation_id);

-- ============================================================================================
-- 3. Functions, for the server only
-- ============================================================================================

-- Starts a conversation. When the business has already had its monthly limit of conversations
-- this Lagos calendar month, the new one is marked over_limit: it only offers a person, and it
-- does not count. One call at a time for each assistant, so two new conversations cannot both
-- take the last place.
create or replace function public.assist_open_conversation(p_assistant_id uuid, p_first text)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_a public.assistants;
  v_month_start timestamptz := date_trunc('month', now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos';
  v_used integer;
  v_over boolean;
  v_id uuid;
begin
  select * into v_a from public.assistants where id = p_assistant_id for no key update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_assistant');
  end if;
  select count(*) into v_used
  from public.assist_conversations c
  where c.assistant_id = v_a.id and c.created_at >= v_month_start and not c.over_limit;
  v_over := v_used >= v_a.monthly_limit;
  insert into public.assist_conversations (assistant_id, business_id, first_message, over_limit)
  values (v_a.id, v_a.business_id, nullif(left(btrim(coalesce(p_first, '')), 600), ''), v_over)
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id, 'over_limit', v_over,
    'used', v_used + case when v_over then 0 else 1 end, 'limit', v_a.monthly_limit);
end;
$$;

-- Keeps one question and its answer, and moves the conversation on: one more customer message,
-- the time of the last message, and the outcome (once handed over, it stays handed over; a
-- question it couldn't answer makes it unanswered). Only for a conversation of this assistant
-- that is still open: not ended, and under 30 customer messages.
drop function if exists public.assist_add_turn(uuid, text, text, text, boolean, boolean, text);
create or replace function public.assist_add_turn(
  p_assistant_id uuid,
  p_conversation_id uuid,
  p_customer text,
  p_question_key text,
  p_reply text,
  p_answered boolean,
  p_handover boolean,
  p_source text
)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_c public.assist_conversations;
begin
  if p_source is null or p_source not in ('model', 'match', 'limit', 'timeout', 'error') then
    raise exception 'assist_add_turn: unknown source %', p_source;
  end if;
  if coalesce(btrim(p_customer), '') = '' or coalesce(btrim(p_reply), '') = '' then
    raise exception 'assist_add_turn: a turn needs the question and the answer';
  end if;
  select * into v_c from public.assist_conversations where id = p_conversation_id for no key update;
  if not found or v_c.assistant_id is distinct from p_assistant_id then
    return jsonb_build_object('ok', false, 'error', 'unknown_conversation');
  end if;
  if v_c.ended_at is not null or v_c.message_count >= 30 then
    return jsonb_build_object('ok', false, 'error', 'closed', 'count', v_c.message_count);
  end if;
  insert into public.assist_messages (conversation_id, business_id, role, body, answered, question_key)
  values (v_c.id, v_c.business_id, 'customer', left(p_customer, 2000), p_answered, nullif(left(coalesce(p_question_key, ''), 200), ''));
  insert into public.assist_messages (conversation_id, business_id, role, body, answered, handover, source)
  values (v_c.id, v_c.business_id, 'assistant', left(p_reply, 2000), p_answered, coalesce(p_handover, false), p_source);
  update public.assist_conversations
  set message_count = message_count + 1,
      last_message_at = now(),
      first_message = coalesce(first_message, nullif(left(btrim(coalesce(p_customer, '')), 600), '')),
      outcome = case
        when outcome = 'handed_over' then 'handed_over'
        when p_answered is distinct from true then 'unanswered'
        else outcome
      end
  where id = v_c.id
  returning * into v_c;
  return jsonb_build_object('ok', true, 'count', v_c.message_count, 'outcome', v_c.outcome);
end;
$$;

-- ============================================================================================
-- 4. Who may do what
-- ============================================================================================

revoke all on function public.assist_open_conversation(uuid, text) from public, anon, authenticated;
revoke all on function public.assist_add_turn(uuid, uuid, text, text, text, boolean, boolean, text) from public, anon, authenticated;
grant execute on function public.assist_open_conversation(uuid, text) to service_role;
grant execute on function public.assist_add_turn(uuid, uuid, text, text, text, boolean, boolean, text) to service_role;

alter table public.assistants enable row level security;
alter table public.assist_conversations enable row level security;
alter table public.assist_messages enable row level security;
alter table public.assist_handovers enable row level security;
alter table public.assist_usage enable row level security;

-- Nobody signed out may touch them. Signed in people may only read, through the policies
-- below. Every write is made by the server with the service key.
revoke all on public.assistants, public.assist_conversations, public.assist_messages, public.assist_handovers, public.assist_usage
from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select on public.assistants, public.assist_conversations, public.assist_messages, public.assist_handovers, public.assist_usage
to authenticated;
grant all on public.assistants, public.assist_conversations, public.assist_messages, public.assist_handovers, public.assist_usage
to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Reading: your own business's assistant, conversations, messages, handovers and usage.
drop policy if exists "Assistants: own business" on public.assistants;
create policy "Assistants: own business" on public.assistants for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Assist conversations: own business" on public.assist_conversations;
create policy "Assist conversations: own business" on public.assist_conversations for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Assist messages: own business" on public.assist_messages;
create policy "Assist messages: own business" on public.assist_messages for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Assist handovers: own business" on public.assist_handovers;
create policy "Assist handovers: own business" on public.assist_handovers for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Assist usage: own business" on public.assist_usage;
create policy "Assist usage: own business" on public.assist_usage for select to authenticated
  using (business_id in (select private.my_business_ids()));

-- Two step sign in: with it on, nothing can be read until the code has been typed.
do $$
declare
  t text;
begin
  foreach t in array array['assistants', 'assist_conversations', 'assist_messages', 'assist_handovers', 'assist_usage']
  loop
    execute format('drop policy if exists "Two step sign in" on public.%I', t);
    execute format('create policy "Two step sign in" on public.%I as restrictive for all to authenticated using ((select private.aal_ok()))', t);
  end loop;
end;
$$;

commit;
