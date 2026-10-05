-- Titan Wave Media, phase 2: accounts, the client console, the Team view and Pay with Titan Wave.
--
-- Run this whole file in the Supabase dashboard, SQL Editor, after schema.sql.
-- It is safe to run more than once: it only adds what is missing and replaces the functions and
-- policies with the versions below. It keeps the three tables from schema.sql and their rows.
-- It runs as one transaction, so it either all goes in or none of it does.
--
-- How the rules work:
-- - Row level security is on for every table. A signed in client can only read rows that belong
--   to their own business, and cannot write any row directly.
-- - Every write goes through the website's server with the service key, after it has checked who
--   is asking. Money rows (invoices, payments, receipts, refunds, saved cards) are written only there.
-- - When someone has turned on two step sign in, they read nothing until they have typed their code.
-- - Money is kept in kobo, as whole numbers. Times are kept in UTC and shown in Lagos time.
-- - Card numbers are never kept. A saved card keeps only what Paystack returns: its authorization
--   code (in a table the browser can never read), card type, last 4 digits, expiry and bank.
-- - Project files sit in a private bucket that nobody can read or write directly. The server makes
--   one time upload links and short lived download links after checking who is asking.

begin;

-- Helpers for the policies live in their own schema, which the Data API does not show.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

-- ============================================================================================
-- 1. Tables
-- ============================================================================================

-- A client business. Everyone who signs in as a client belongs to one.
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  phone text check (char_length(phone) <= 40),
  address text check (char_length(address) <= 300),
  -- Pay Care invoices automatically with the default saved card. Off until the owner turns it on.
  autopay boolean not null default false,
  created_by uuid references auth.users (id) on delete set null
);

-- One row for every person who signs in, made when their account is made.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text check (email = lower(email)),
  full_name text not null default '' check (char_length(full_name) <= 120),
  -- Email settings: project updates, invoices and receipts, product news.
  notify_projects boolean not null default true,
  notify_billing boolean not null default true,
  notify_news boolean not null default false,
  -- When the welcome email went out, so it goes only once.
  welcomed_at timestamptz
);

-- Who belongs to which business. A person belongs to one business at most.
-- Owner: can pay, invite and remove people, and delete the account. Member: can see projects,
-- chat and invoices, but cannot pay or invite. An invite counts only once the person has signed
-- in through it (joined_at).
create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  email text not null check (email = lower(email)),
  role text not null default 'member' check (role in ('owner', 'member')),
  invited_by uuid references auth.users (id) on delete set null,
  joined_at timestamptz
);

-- Projects our team builds for a business. The tracker has 5 steps:
-- 1 First call, 2 Plan and quote, 3 Build, 4 Test with your team, 5 Live and care.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  summary text check (char_length(summary) <= 4000),
  works_on text check (char_length(works_on) <= 80),
  step smallint not null default 1 check (step between 1 and 5),
  -- What happens next, written by our team. When empty, the console shows the words for the step.
  next_note text check (char_length(next_note) <= 1000),
  -- From the accepted quote.
  setup_kobo bigint check (setup_kobo >= 0),
  care_kobo bigint check (care_kobo >= 0),
  live_at timestamptz,
  -- Care: monthly invoices start the month after the project goes live.
  care_started_on date,
  care_next_on date,
  care_ended_on date,
  created_by uuid references auth.users (id) on delete set null,
  -- Lets the tables below check that a row's business is its project's business.
  unique (id, business_id)
);

-- A quote for a project: the setup price (paid in two halves) and the monthly Care price.
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null,
  business_id uuid not null references public.businesses (id) on delete cascade,
  setup_kobo bigint not null check (setup_kobo between 2 and 100000000000),
  care_kobo bigint not null default 0 check (care_kobo between 0 and 100000000000),
  summary text check (char_length(summary) <= 4000),
  status text not null default 'sent' check (status in ('sent', 'accepted', 'changes', 'withdrawn')),
  sent_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null,
  foreign key (project_id, business_id) references public.projects (id, business_id) on delete cascade
);

-- The updates list on a project: requests, step changes, files, quotes, payments and notes.
-- The words are made by the console from `kind` and `data`, so they live in content/console/.
create table if not exists public.project_updates (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  project_id uuid not null,
  business_id uuid not null references public.businesses (id) on delete cascade,
  kind text not null check (kind in ('request', 'step', 'note', 'file', 'quote', 'quote_accepted', 'quote_changes', 'invoice', 'payment', 'care')),
  body text check (char_length(body) <= 4000),
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  foreign key (project_id, business_id) references public.projects (id, business_id) on delete cascade
);

-- Files on a project. The files themselves are in the private "project-files" bucket, under
-- <business id>/<project id>/<file id>/<name>.
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null,
  business_id uuid not null references public.businesses (id) on delete cascade,
  path text not null unique,
  name text not null check (char_length(name) between 1 and 200),
  size_bytes bigint not null check (size_bytes between 1 and 20971520),
  mime text not null,
  from_team boolean not null default false,
  uploaded_by uuid references auth.users (id) on delete set null,
  foreign key (project_id, business_id) references public.projects (id, business_id) on delete cascade,
  check (path like business_id::text || '/' || project_id::text || '/%')
);

-- Invoices, numbered INV-0001 onwards. The "billed to" details are copied in when the invoice
-- is made, so the invoice stays complete for the tax records even after an account is deleted.
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  number text not null unique,
  seq bigint not null unique,
  business_id uuid references public.businesses (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  kind text not null check (kind in ('setup_first', 'setup_second', 'care', 'custom')),
  title text not null check (char_length(title) between 1 and 200),
  billed_name text,
  billed_business text not null,
  billed_email text,
  billed_address text,
  issued_at timestamptz not null default now(),
  due_on date not null,
  status text not null default 'due' check (status in ('due', 'paid', 'refunded', 'void')),
  total_kobo bigint not null check (total_kobo > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  note text check (char_length(note) <= 500),
  -- The month a Care invoice pays for.
  period_start date,
  period_end date,
  paid_at timestamptz,
  -- Reminder emails: 3 days before the due date, on the day, and 3 days after.
  reminded_before_at timestamptz,
  reminded_due_at timestamptz,
  reminded_after_at timestamptz,
  last_reminder_at timestamptz,
  -- Automatic Care payments: the last day one was tried, so the daily job tries once a day.
  autopay_tried_on date,
  created_by uuid references auth.users (id) on delete set null,
  check (kind <> 'care' or period_start is not null)
);

create table if not exists public.invoice_lines (
  id bigint generated always as identity primary key,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  position int not null,
  description text not null check (char_length(description) between 1 and 200),
  quantity int not null check (quantity between 1 and 100000),
  unit_kobo bigint not null check (unit_kobo between 1 and 100000000000),
  amount_kobo bigint not null check (amount_kobo > 0)
);

-- Payments through Paystack. A row is made when our server starts a transaction, and marked
-- successful only after our server has verified it with Paystack (or Paystack's signed webhook
-- says so). Once successful it stays successful. Fees are Paystack's own figures.
-- "review": Paystack took a different amount from the one we asked for; the team checks it.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reference text not null unique,
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  business_id uuid references public.businesses (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  -- How they chose to pay in our window, and how they paid in the end.
  method text not null check (method in ('card', 'bank_transfer', 'ussd', 'saved_card')),
  channel text,
  source text not null default 'console' check (source in ('console', 'autopay')),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'abandoned', 'review')),
  amount_kobo bigint not null check (amount_kobo > 0),
  received_kobo bigint check (received_kobo >= 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  fees_kobo bigint check (fees_kobo >= 0),
  refunded_kobo bigint not null default 0 check (refunded_kobo >= 0),
  paystack_id bigint,
  gateway_response text,
  failure_reason text,
  card_type text,
  card_last4 text check (card_last4 ~ '^[0-9]{4}$'),
  card_bank text,
  card_exp_month text,
  card_exp_year text,
  paid_at timestamptz,
  verified_at timestamptz,
  check (refunded_kobo <= amount_kobo)
);

-- Receipts, numbered RCP-0001 onwards, one for every successful payment.
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  number text not null unique,
  seq bigint not null unique,
  payment_id uuid not null unique references public.payments (id) on delete restrict,
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  business_id uuid references public.businesses (id) on delete set null,
  amount_kobo bigint not null check (amount_kobo > 0),
  paid_at timestamptz not null,
  status text not null default 'paid' check (status in ('paid', 'refund_requested', 'refunded')),
  refunded_at timestamptz
);

-- "Ask for a refund" on a receipt. The team approves it, and the refund goes through Paystack.
-- Only one open or finished request per receipt; a declined or failed one allows another.
create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  receipt_id uuid not null references public.receipts (id) on delete restrict,
  payment_id uuid not null references public.payments (id) on delete restrict,
  business_id uuid references public.businesses (id) on delete set null,
  requested_by uuid references auth.users (id) on delete set null,
  reason text not null check (char_length(reason) between 1 and 120),
  details text check (char_length(details) <= 2000),
  -- What was asked for, and what Paystack says it refunded.
  amount_kobo bigint not null check (amount_kobo > 0),
  refunded_kobo bigint check (refunded_kobo > 0),
  status text not null default 'requested' check (status in ('requested', 'processing', 'refunded', 'declined', 'failed')),
  decided_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null,
  paystack_refund_id bigint,
  refunded_at timestamptz,
  failure_reason text
);

-- Every conversation in one place: the website's contact form and quote requests, project chats,
-- help tickets, refund requests and console feedback. The Team inbox lists these.
-- Status: new (waiting for us), replied, waiting (help ticket waiting on the client), solved.
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null check (kind in ('contact', 'quote', 'project', 'help', 'refund', 'feedback')),
  status text not null default 'new' check (status in ('new', 'replied', 'waiting', 'solved')),
  business_id uuid references public.businesses (id) on delete cascade,
  project_id uuid,
  message_id bigint references public.messages (id) on delete cascade,
  refund_id uuid references public.refund_requests (id) on delete set null,
  subject text check (char_length(subject) <= 200),
  from_name text,
  from_email text check (from_email = lower(from_email)),
  details jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  last_message_at timestamptz not null default now(),
  last_from text not null default 'client' check (last_from in ('client', 'team')),
  foreign key (project_id, business_id) references public.projects (id, business_id) on delete cascade,
  check (kind <> 'project' or project_id is not null)
);

create table if not exists public.thread_messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  from_team boolean not null default false,
  author_id uuid references auth.users (id) on delete set null,
  author_name text,
  body text not null check (char_length(body) between 1 and 4000)
);

-- Saved cards. What the browser may see: type, last 4 digits, expiry and bank.
create table if not exists public.saved_cards (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  card_type text,
  last4 text not null check (last4 ~ '^[0-9]{4}$'),
  exp_month text,
  exp_year text,
  bank text,
  -- Paystack's fingerprint of the card, so the same card is saved once.
  signature text,
  is_default boolean not null default false,
  created_by uuid references auth.users (id) on delete set null
);

-- The Paystack authorization code of a saved card. Only the server can read this table.
create table if not exists public.card_authorizations (
  card_id uuid primary key references public.saved_cards (id) on delete cascade,
  created_at timestamptz not null default now(),
  authorization_code text not null,
  -- The email the card was first charged with. Paystack needs the same one to charge it again.
  customer_email text not null
);

-- The bell: one row per person. The words come from content/console/ by `kind`.
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  audience text not null check (audience in ('client', 'team')),
  kind text not null,
  data jsonb not null default '{}'::jsonb,
  link text,
  read_at timestamptz
);

-- Recent activity on a business's console home. The words come from content/console/ by `kind`.
create table if not exists public.activity (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  kind text not null,
  data jsonb not null default '{}'::jsonb
);

-- "Notify me" on a coming soon product in the console. The Product interest page adds these to
-- the website's notify list.
create table if not exists public.product_interest (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  product text not null check (product ~ '^[a-z0-9-]{1,40}$'),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid references public.businesses (id) on delete cascade
);

-- Titan Wave Media team members, added by the owner (OWNER_EMAIL) in Team view.
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null check (email = lower(email)),
  user_id uuid references auth.users (id) on delete set null,
  added_by uuid references auth.users (id) on delete set null
);

-- A log of team actions: invoices sent, refunds approved, steps changed, members added.
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  action text not null,
  target text,
  details jsonb not null default '{}'::jsonb
);

-- Paystack webhook events. A row is written once an event has been handled, so a repeat of a
-- handled event is skipped. The money functions are safe to repeat, so an event that arrives
-- twice at the same moment is still recorded once.
create table if not exists public.paystack_events (
  id bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  dedupe_key text not null unique,
  event text not null,
  reference text,
  outcome text,
  processed_at timestamptz
);

-- Counts for the limits on sign in links and codes (5 links per email and 20 per network an
-- hour). Keys are hashed. The daily job deletes old rows.
create table if not exists public.rate_hits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  bucket text not null,
  key text not null
);

-- Sign in links we have sent. Only a digest of the token is kept. A link works once, for
-- 15 minutes, and only the newest one for an email works.
create table if not exists public.auth_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null check (email = lower(email)),
  user_id uuid references auth.users (id) on delete cascade,
  token_digest text not null unique,
  purpose text not null check (purpose in ('signin', 'signup', 'invite', 'welcome')),
  expires_at timestamptz not null,
  used_at timestamptz,
  replaced_at timestamptz
);

-- Backup codes for two step sign in, kept hashed. Shown once when they are made.
create table if not exists public.backup_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code_hash text not null,
  used_at timestamptz
);

-- The last 20 sign ins of each person: when, how, and on which browser and device.
create table if not exists public.signin_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  method text not null check (method in ('link', 'link_code', 'link_backup', 'google', 'google_code', 'google_backup')),
  browser text,
  device text
);

-- Counters for invoice and receipt numbers, so the numbers have no gaps.
create table if not exists public.counters (
  name text primary key,
  value bigint not null default 0
);
insert into public.counters (name, value) values ('invoice', 0), ('receipt', 0) on conflict (name) do nothing;

-- Each run of the daily job: what it did, for checking it worked.
create table if not exists public.cron_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  job text not null,
  ok boolean,
  summary jsonb not null default '{}'::jsonb
);

-- ============================================================================================
-- 2. Indexes
-- ============================================================================================

create unique index if not exists business_members_email_key on public.business_members (email);
create unique index if not exists business_members_user_key on public.business_members (user_id) where user_id is not null;
create index if not exists business_members_business_idx on public.business_members (business_id);
create index if not exists businesses_created_at_idx on public.businesses (created_at desc);
create unique index if not exists profiles_email_key on public.profiles (email);

create index if not exists projects_business_idx on public.projects (business_id, created_at desc);
create index if not exists projects_care_idx on public.projects (care_next_on) where care_next_on is not null;
create index if not exists quotes_project_idx on public.quotes (project_id, created_at desc);
create index if not exists quotes_business_idx on public.quotes (business_id);
create index if not exists project_updates_project_idx on public.project_updates (project_id, created_at);
create index if not exists project_updates_business_idx on public.project_updates (business_id);
create index if not exists project_files_project_idx on public.project_files (project_id, created_at desc);
create index if not exists project_files_business_idx on public.project_files (business_id);

create index if not exists invoices_business_idx on public.invoices (business_id, issued_at desc);
create index if not exists invoices_project_idx on public.invoices (project_id);
create index if not exists invoices_status_due_idx on public.invoices (status, due_on);
create unique index if not exists invoices_setup_first_key on public.invoices (project_id) where kind = 'setup_first';
create unique index if not exists invoices_setup_second_key on public.invoices (project_id) where kind = 'setup_second';
create unique index if not exists invoices_care_key on public.invoices (project_id, period_start) where kind = 'care';
create index if not exists invoice_lines_invoice_idx on public.invoice_lines (invoice_id, position);

create index if not exists payments_invoice_idx on public.payments (invoice_id);
create index if not exists payments_business_idx on public.payments (business_id, created_at desc);
create index if not exists payments_status_idx on public.payments (status, created_at desc);
create index if not exists payments_user_idx on public.payments (user_id);
create index if not exists receipts_business_idx on public.receipts (business_id, created_at desc);
create index if not exists receipts_invoice_idx on public.receipts (invoice_id);
create unique index if not exists refund_requests_open_key on public.refund_requests (receipt_id) where status in ('requested', 'processing', 'refunded');
create index if not exists refund_requests_receipt_idx on public.refund_requests (receipt_id);
create index if not exists refund_requests_payment_idx on public.refund_requests (payment_id);
create index if not exists refund_requests_business_idx on public.refund_requests (business_id);
create index if not exists refund_requests_status_idx on public.refund_requests (status);

create index if not exists threads_inbox_idx on public.threads (last_message_at desc);
create index if not exists threads_status_idx on public.threads (status, last_message_at desc);
create index if not exists threads_business_idx on public.threads (business_id, kind);
create index if not exists threads_from_email_idx on public.threads (from_email) where from_email is not null;
create unique index if not exists threads_project_key on public.threads (project_id) where kind = 'project';
create unique index if not exists threads_message_key on public.threads (message_id) where message_id is not null;
create index if not exists threads_refund_idx on public.threads (refund_id);
create index if not exists thread_messages_thread_idx on public.thread_messages (thread_id, created_at);

create index if not exists saved_cards_business_idx on public.saved_cards (business_id);
create unique index if not exists saved_cards_signature_key on public.saved_cards (business_id, signature) where signature is not null;
create unique index if not exists saved_cards_default_key on public.saved_cards (business_id) where is_default;

create index if not exists notifications_user_idx on public.notifications (user_id, audience, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (user_id, audience) where read_at is null;
create index if not exists activity_business_idx on public.activity (business_id, created_at desc);
create unique index if not exists product_interest_key on public.product_interest (product, user_id);
create index if not exists product_interest_business_idx on public.product_interest (business_id);

create unique index if not exists team_members_email_key on public.team_members (email);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists rate_hits_lookup_idx on public.rate_hits (bucket, key, created_at);
create index if not exists rate_hits_created_at_idx on public.rate_hits (created_at);
create index if not exists auth_links_email_idx on public.auth_links (email, created_at desc);
create index if not exists auth_links_created_at_idx on public.auth_links (created_at);
create index if not exists backup_codes_user_idx on public.backup_codes (user_id);
create index if not exists signin_events_user_idx on public.signin_events (user_id, created_at desc);
create index if not exists cron_runs_started_idx on public.cron_runs (job, started_at desc);

-- For the website's own tables: the daily job deletes old messages and conversations, and
-- Product interest counts the notify list.
create index if not exists chat_logs_created_at_idx on public.chat_logs (created_at);
create index if not exists notify_list_source_idx on public.notify_list (source);

-- ============================================================================================
-- 3. Functions
-- ============================================================================================

-- The businesses the signed in person belongs to (invites count once accepted).
create or replace function private.my_business_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select m.business_id from public.business_members m
  where m.user_id = (select auth.uid()) and m.joined_at is not null;
$$;

-- The businesses the signed in person owns.
create or replace function private.my_owned_business_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select m.business_id from public.business_members m
  where m.user_id = (select auth.uid()) and m.joined_at is not null and m.role = 'owner';
$$;

-- True unless the person has turned on two step sign in and has not typed their code yet.
create or replace function private.aal_ok()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f
        where f.user_id = (select auth.uid()) and f.status = 'verified'
      );
$$;

-- A profile for every new account.
create or replace function private.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    nullif(lower(btrim(coalesce(new.email, ''))), ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 120)
  )
  on conflict do nothing;
  return new;
end;
$$;

-- Keeps the profile's email the same as the account's.
create or replace function private.handle_user_email_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
    set email = nullif(lower(btrim(coalesce(new.email, ''))), ''), updated_at = now()
    where user_id = new.id;
  end if;
  return new;
end;
$$;

-- Every message from the website's contact form starts a conversation in the Team inbox.
-- Requests for AI setup are quote requests; everything else is a contact message.
create or replace function private.message_to_thread()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_thread uuid;
begin
  insert into public.threads (kind, status, message_id, from_name, from_email, details, created_at, updated_at, last_message_at, last_from)
  values (
    case when new.need = 'ai-setup' then 'quote' else 'contact' end,
    'new',
    new.id,
    new.name,
    lower(btrim(new.email)),
    jsonb_strip_nulls(jsonb_build_object('need', new.need, 'channel', new.channel, 'rows', new."rows", 'product', new.product, 'source', new.source)),
    new.created_at, new.created_at, new.created_at, 'client'
  )
  on conflict do nothing
  returning id into v_thread;
  if v_thread is not null then
    insert into public.thread_messages (thread_id, from_team, author_name, body, created_at)
    values (v_thread, false, new.name, left(new.message, 4000), new.created_at);
  end if;
  return new;
end;
$$;

-- A successful payment stays successful, and a finished refund stays finished.
create or replace function private.keep_final_status()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_table_name = 'payments' and old.status = 'success' and new.status is distinct from 'success' then
    raise exception 'A successful payment cannot change status (%).', old.reference;
  end if;
  if tg_table_name = 'refund_requests' and old.status = 'refunded' and new.status is distinct from 'refunded' then
    raise exception 'A finished refund cannot change status (%).', old.id;
  end if;
  return new;
end;
$$;

-- "INV-0001": four digits until there are more.
create or replace function public.doc_number(p_prefix text, p_seq bigint)
returns text
language sql immutable set search_path = ''
as $$
  select p_prefix || '-' || case when p_seq < 10000 then lpad(p_seq::text, 4, '0') else p_seq::text end;
$$;

-- Makes an invoice and its lines in one go, with the next number. For the two halves of a setup
-- and for each month of Care, a second call returns the invoice already made instead of a new one.
-- p_lines: [{ "description": "...", "quantity": 1, "unit_kobo": 1250000 }, ...]
create or replace function public.create_invoice(
  p_business_id uuid,
  p_project_id uuid,
  p_kind text,
  p_title text,
  p_due_on date,
  p_note text,
  p_lines jsonb,
  p_period_start date default null,
  p_period_end date default null,
  p_created_by uuid default null
)
returns public.invoices
language plpgsql security invoker set search_path = ''
as $$
declare
  v_inv public.invoices;
  v_business public.businesses;
  v_owner_name text;
  v_owner_email text;
  v_total numeric;
  v_bad int;
  v_seq bigint;
begin
  if p_kind is null or p_kind not in ('setup_first', 'setup_second', 'care', 'custom') then
    raise exception 'create_invoice: unknown kind %', p_kind;
  end if;
  if p_kind <> 'custom' and p_project_id is null then
    raise exception 'create_invoice: a % invoice needs a project', p_kind;
  end if;
  if p_kind = 'care' and p_period_start is null then
    raise exception 'create_invoice: a Care invoice needs the month it pays for';
  end if;
  if p_due_on is null then
    raise exception 'create_invoice: an invoice needs a due date';
  end if;

  select * into v_business from public.businesses where id = p_business_id;
  if not found then raise exception 'create_invoice: business % not found', p_business_id; end if;

  if p_project_id is not null then
    -- One call at a time for each project, so two calls cannot both make the same invoice.
    perform 1 from public.projects where id = p_project_id and business_id = p_business_id for update;
    if not found then
      raise exception 'create_invoice: project % is not in business %', p_project_id, p_business_id;
    end if;
    if p_kind in ('setup_first', 'setup_second') then
      select * into v_inv from public.invoices where project_id = p_project_id and kind = p_kind;
      if found then return v_inv; end if;
    elsif p_kind = 'care' then
      select * into v_inv from public.invoices where project_id = p_project_id and kind = 'care' and period_start = p_period_start;
      if found then return v_inv; end if;
    end if;
  end if;

  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 or jsonb_array_length(p_lines) > 50 then
    raise exception 'create_invoice: an invoice needs 1 to 50 lines';
  end if;
  select count(*) into v_bad
  from jsonb_array_elements(p_lines) l
  where jsonb_typeof(l) <> 'object'
     or coalesce(btrim(l ->> 'description'), '') = ''
     or char_length(btrim(l ->> 'description')) > 200
     or coalesce(l ->> 'quantity', '') !~ '^[0-9]{1,6}$'
     or coalesce(l ->> 'unit_kobo', '') !~ '^[0-9]{1,12}$';
  if v_bad = 0 then
    select count(*) into v_bad
    from jsonb_array_elements(p_lines) l
    where (l ->> 'quantity')::int not between 1 and 100000
       or (l ->> 'unit_kobo')::bigint not between 1 and 100000000000;
  end if;
  if v_bad > 0 then
    raise exception 'create_invoice: every line needs a description, a quantity from 1 to 100000 and a price';
  end if;
  select sum((l ->> 'quantity')::numeric * (l ->> 'unit_kobo')::numeric) into v_total from jsonb_array_elements(p_lines) l;
  if v_total > 1000000000000 then
    raise exception 'create_invoice: the total is too large';
  end if;

  select p.full_name, p.email into v_owner_name, v_owner_email
  from public.business_members m
  join public.profiles p on p.user_id = m.user_id
  where m.business_id = p_business_id and m.role = 'owner'
  order by m.created_at
  limit 1;
  if v_owner_email is null then
    select m.email into v_owner_email from public.business_members m
    where m.business_id = p_business_id and m.role = 'owner' order by m.created_at limit 1;
  end if;

  update public.counters set value = value + 1 where name = 'invoice' returning value into v_seq;
  if v_seq is null then raise exception 'create_invoice: the invoice counter is missing'; end if;

  insert into public.invoices (
    number, seq, business_id, project_id, kind, title,
    billed_name, billed_business, billed_email, billed_address,
    due_on, total_kobo, note, period_start, period_end, created_by
  ) values (
    public.doc_number('INV', v_seq), v_seq, p_business_id, p_project_id, p_kind, left(btrim(p_title), 200),
    nullif(v_owner_name, ''), v_business.name, v_owner_email, v_business.address,
    p_due_on, v_total::bigint, nullif(left(btrim(coalesce(p_note, '')), 500), ''), p_period_start, p_period_end, p_created_by
  )
  returning * into v_inv;

  insert into public.invoice_lines (invoice_id, position, description, quantity, unit_kobo, amount_kobo)
  select v_inv.id, x.ord, btrim(x.l ->> 'description'), (x.l ->> 'quantity')::int, (x.l ->> 'unit_kobo')::bigint,
         (x.l ->> 'quantity')::bigint * (x.l ->> 'unit_kobo')::bigint
  from jsonb_array_elements(p_lines) with ordinality as x(l, ord);

  return v_inv;
end;
$$;

-- Records a payment that Paystack has confirmed: marks it successful, marks the invoice paid and
-- makes the receipt with the next number. Safe to call twice for the same payment (the verify
-- step and the webhook can both arrive): the second call returns the first result.
-- If Paystack took a different amount, the payment goes to "review" and the invoice stays due.
create or replace function public.record_payment_success(
  p_reference text,
  p_paystack_id bigint,
  p_amount_kobo bigint,
  p_currency text,
  p_fees_kobo bigint,
  p_channel text,
  p_paid_at timestamptz,
  p_card_type text default null,
  p_card_last4 text default null,
  p_card_bank text default null,
  p_card_exp_month text default null,
  p_card_exp_year text default null,
  p_gateway_response text default null
)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_pay public.payments;
  v_inv public.invoices;
  v_rcp public.receipts;
  v_seq bigint;
  v_double boolean := false;
  v_paid_at timestamptz := coalesce(p_paid_at, now());
begin
  select * into v_pay from public.payments where reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_reference');
  end if;

  if v_pay.status = 'success' then
    select * into v_rcp from public.receipts where payment_id = v_pay.id;
    v_double := (select count(*) from public.payments where invoice_id = v_pay.invoice_id and status = 'success') > 1;
    return jsonb_build_object('ok', true, 'already', true, 'payment_id', v_pay.id, 'invoice_id', v_pay.invoice_id,
      'business_id', v_rcp.business_id, 'receipt_id', v_rcp.id, 'receipt_number', v_rcp.number, 'double', v_double);
  end if;

  select * into v_inv from public.invoices where id = v_pay.invoice_id for update;

  if p_amount_kobo is distinct from v_pay.amount_kobo
     or v_pay.amount_kobo is distinct from v_inv.total_kobo
     or upper(coalesce(p_currency, '')) is distinct from v_pay.currency then
    update public.payments
    set status = 'review', received_kobo = p_amount_kobo, failure_reason = 'amount_mismatch',
        paystack_id = coalesce(p_paystack_id, paystack_id), channel = left(p_channel, 40),
        gateway_response = left(p_gateway_response, 200), paid_at = v_paid_at, verified_at = now()
    where id = v_pay.id;
    return jsonb_build_object('ok', false, 'error', 'amount_mismatch', 'payment_id', v_pay.id, 'invoice_id', v_pay.invoice_id);
  end if;

  update public.payments
  set status = 'success',
      received_kobo = p_amount_kobo,
      paystack_id = coalesce(p_paystack_id, paystack_id),
      channel = left(p_channel, 40),
      fees_kobo = p_fees_kobo,
      card_type = nullif(btrim(left(p_card_type, 40)), ''),
      card_last4 = case when p_card_last4 ~ '^[0-9]{4}$' then p_card_last4 else null end,
      card_bank = nullif(btrim(left(p_card_bank, 80)), ''),
      card_exp_month = left(p_card_exp_month, 2),
      card_exp_year = left(p_card_exp_year, 4),
      gateway_response = left(p_gateway_response, 200),
      failure_reason = null,
      paid_at = v_paid_at,
      verified_at = now()
  where id = v_pay.id;

  if v_inv.status = 'due' then
    update public.invoices set status = 'paid', paid_at = v_paid_at where id = v_inv.id;
  else
    -- The invoice was already paid by another payment: the team is told, to refund one of them.
    v_double := true;
  end if;

  update public.counters set value = value + 1 where name = 'receipt' returning value into v_seq;
  if v_seq is null then raise exception 'record_payment_success: the receipt counter is missing'; end if;

  insert into public.receipts (number, seq, payment_id, invoice_id, business_id, amount_kobo, paid_at)
  values (public.doc_number('RCP', v_seq), v_seq, v_pay.id, v_inv.id, v_inv.business_id, p_amount_kobo, v_paid_at)
  returning * into v_rcp;

  return jsonb_build_object('ok', true, 'already', false, 'payment_id', v_pay.id, 'invoice_id', v_inv.id,
    'business_id', v_inv.business_id, 'receipt_id', v_rcp.id, 'receipt_number', v_rcp.number, 'double', v_double);
end;
$$;

-- Records a refund that Paystack has finished, with the amount Paystack says it refunded.
-- The receipt shows Refunded once its whole payment is refunded, and the invoice once no money
-- is left on it. Safe to call twice.
create or replace function public.record_refund_done(
  p_refund_id uuid,
  p_paystack_refund_id bigint,
  p_refunded_kobo bigint,
  p_refunded_at timestamptz
)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_ref public.refund_requests;
  v_pay public.payments;
  v_amount bigint;
  v_left bigint;
  v_at timestamptz := coalesce(p_refunded_at, now());
begin
  select * into v_ref from public.refund_requests where id = p_refund_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'unknown_refund'); end if;
  if v_ref.status = 'refunded' then
    return jsonb_build_object('ok', true, 'already', true, 'receipt_id', v_ref.receipt_id, 'business_id', v_ref.business_id);
  end if;

  select * into v_pay from public.payments where id = v_ref.payment_id for update;
  v_amount := coalesce(p_refunded_kobo, v_ref.amount_kobo);
  if v_amount <= 0 or v_pay.refunded_kobo + v_amount > v_pay.amount_kobo then
    raise exception 'record_refund_done: % kobo is more than is left on payment %', v_amount, v_pay.reference;
  end if;

  update public.refund_requests
  set status = 'refunded', refunded_kobo = v_amount, refunded_at = v_at,
      paystack_refund_id = coalesce(p_paystack_refund_id, paystack_refund_id), failure_reason = null
  where id = v_ref.id;
  update public.payments set refunded_kobo = refunded_kobo + v_amount where id = v_pay.id;

  update public.receipts
  set status = case when v_pay.refunded_kobo + v_amount >= v_pay.amount_kobo then 'refunded' else 'paid' end,
      refunded_at = v_at
  where id = v_ref.receipt_id;

  perform 1 from public.invoices where id = v_pay.invoice_id for update;
  select coalesce(sum(p.amount_kobo - p.refunded_kobo), 0) into v_left
  from public.payments p
  where p.invoice_id = v_pay.invoice_id and p.status = 'success';
  if v_left = 0 then
    update public.invoices set status = 'refunded' where id = v_pay.invoice_id and status = 'paid';
  end if;

  return jsonb_build_object('ok', true, 'already', false, 'receipt_id', v_ref.receipt_id, 'business_id', v_ref.business_id,
    'refunded_kobo', v_amount);
end;
$$;

-- Records a refund that Paystack could not make. The receipt goes back to Paid, so the client
-- can ask again. Does nothing to a refund that has finished.
create or replace function public.record_refund_failed(p_refund_id uuid, p_reason text)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_ref public.refund_requests;
begin
  select * into v_ref from public.refund_requests where id = p_refund_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'unknown_refund'); end if;
  if v_ref.status in ('refunded', 'failed') then
    return jsonb_build_object('ok', true, 'already', true, 'status', v_ref.status);
  end if;
  update public.refund_requests set status = 'failed', failure_reason = left(p_reason, 200) where id = v_ref.id;
  update public.receipts set status = 'paid' where id = v_ref.receipt_id and status = 'refund_requested';
  return jsonb_build_object('ok', true, 'already', false, 'receipt_id', v_ref.receipt_id, 'business_id', v_ref.business_id);
end;
$$;

-- ============================================================================================
-- 4. Triggers
-- ============================================================================================

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function private.handle_user_email_change();

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute function private.message_to_thread();

drop trigger if exists keep_final_status on public.payments;
create trigger keep_final_status
  before update of status on public.payments
  for each row execute function private.keep_final_status();

drop trigger if exists keep_final_status on public.refund_requests;
create trigger keep_final_status
  before update of status on public.refund_requests
  for each row execute function private.keep_final_status();

-- People who already had an account before this file was run get a profile too.
insert into public.profiles (user_id, email, full_name)
select u.id, nullif(lower(btrim(coalesce(u.email, ''))), ''),
       left(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''), 120)
from auth.users u
where not exists (select 1 from public.profiles p where p.user_id = u.id)
on conflict do nothing;

-- Contact messages that arrived before this file was run join the inbox too.
insert into public.threads (kind, status, message_id, from_name, from_email, details, created_at, updated_at, last_message_at, last_from)
select case when m.need = 'ai-setup' then 'quote' else 'contact' end, 'new', m.id, m.name, lower(btrim(m.email)),
       jsonb_strip_nulls(jsonb_build_object('need', m.need, 'channel', m.channel, 'rows', m."rows", 'product', m.product, 'source', m.source)),
       m.created_at, m.created_at, m.created_at, 'client'
from public.messages m
where not exists (select 1 from public.threads t where t.message_id = m.id)
on conflict do nothing;

insert into public.thread_messages (thread_id, from_team, author_name, body, created_at)
select t.id, false, m.name, left(m.message, 4000), m.created_at
from public.threads t
join public.messages m on m.id = t.message_id
where not exists (select 1 from public.thread_messages tm where tm.thread_id = t.id);

-- ============================================================================================
-- 5. Who may do what
-- ============================================================================================

-- Functions: the policy helpers may be used by signed in people; the rest only by the server.
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.my_business_ids() to authenticated, service_role;
grant execute on function private.my_owned_business_ids() to authenticated, service_role;
grant execute on function private.aal_ok() to authenticated, service_role;

revoke all on function public.doc_number(text, bigint) from public, anon, authenticated;
revoke all on function public.create_invoice(uuid, uuid, text, text, date, text, jsonb, date, date, uuid) from public, anon, authenticated;
revoke all on function public.record_payment_success(text, bigint, bigint, text, bigint, text, timestamptz, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.record_refund_done(uuid, bigint, bigint, timestamptz) from public, anon, authenticated;
revoke all on function public.record_refund_failed(uuid, text) from public, anon, authenticated;
grant execute on function public.doc_number(text, bigint) to service_role;
grant execute on function public.create_invoice(uuid, uuid, text, text, date, text, jsonb, date, date, uuid) to service_role;
grant execute on function public.record_payment_success(text, bigint, bigint, text, bigint, text, timestamptz, text, text, text, text, text, text) to service_role;
grant execute on function public.record_refund_done(uuid, bigint, bigint, timestamptz) to service_role;
grant execute on function public.record_refund_failed(uuid, text) to service_role;

-- Row level security on every table.
alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.business_members enable row level security;
alter table public.projects enable row level security;
alter table public.quotes enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_files enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.payments enable row level security;
alter table public.receipts enable row level security;
alter table public.refund_requests enable row level security;
alter table public.threads enable row level security;
alter table public.thread_messages enable row level security;
alter table public.saved_cards enable row level security;
alter table public.card_authorizations enable row level security;
alter table public.notifications enable row level security;
alter table public.activity enable row level security;
alter table public.product_interest enable row level security;
alter table public.team_members enable row level security;
alter table public.audit_log enable row level security;
alter table public.paystack_events enable row level security;
alter table public.rate_hits enable row level security;
alter table public.auth_links enable row level security;
alter table public.backup_codes enable row level security;
alter table public.signin_events enable row level security;
alter table public.counters enable row level security;
alter table public.cron_runs enable row level security;
alter table public.messages enable row level security;
alter table public.notify_list enable row level security;
alter table public.chat_logs enable row level security;

-- Nobody signed out may touch any of them. Signed in people may only read, and only the tables
-- below with a policy. Every write is made by the server with the service key.
revoke all on
  public.businesses, public.profiles, public.business_members, public.projects, public.quotes,
  public.project_updates, public.project_files, public.invoices, public.invoice_lines, public.payments,
  public.receipts, public.refund_requests, public.threads, public.thread_messages, public.saved_cards,
  public.card_authorizations, public.notifications, public.activity, public.product_interest,
  public.team_members, public.audit_log, public.paystack_events, public.rate_hits, public.auth_links,
  public.backup_codes, public.signin_events, public.counters, public.cron_runs,
  public.messages, public.notify_list, public.chat_logs
from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select on
  public.businesses, public.profiles, public.business_members, public.projects, public.quotes,
  public.project_updates, public.project_files, public.invoices, public.invoice_lines, public.payments,
  public.receipts, public.refund_requests, public.threads, public.thread_messages, public.saved_cards,
  public.notifications, public.activity, public.product_interest, public.signin_events
to authenticated;

grant all on
  public.businesses, public.profiles, public.business_members, public.projects, public.quotes,
  public.project_updates, public.project_files, public.invoices, public.invoice_lines, public.payments,
  public.receipts, public.refund_requests, public.threads, public.thread_messages, public.saved_cards,
  public.card_authorizations, public.notifications, public.activity, public.product_interest,
  public.team_members, public.audit_log, public.paystack_events, public.rate_hits, public.auth_links,
  public.backup_codes, public.signin_events, public.counters, public.cron_runs,
  public.messages, public.notify_list, public.chat_logs
to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Reading: your own business, and your own rows.
drop policy if exists "Businesses: members read" on public.businesses;
create policy "Businesses: members read" on public.businesses for select to authenticated
  using (id in (select private.my_business_ids()));

drop policy if exists "Profiles: yourself and your business" on public.profiles;
create policy "Profiles: yourself and your business" on public.profiles for select to authenticated
  using (
    user_id = (select auth.uid())
    or user_id in (select m.user_id from public.business_members m where m.business_id in (select private.my_business_ids()))
  );

drop policy if exists "Members: same business" on public.business_members;
create policy "Members: same business" on public.business_members for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Projects: own business" on public.projects;
create policy "Projects: own business" on public.projects for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Quotes: own business" on public.quotes;
create policy "Quotes: own business" on public.quotes for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Project updates: own business" on public.project_updates;
create policy "Project updates: own business" on public.project_updates for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Project files: own business" on public.project_files;
create policy "Project files: own business" on public.project_files for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Invoices: own business" on public.invoices;
create policy "Invoices: own business" on public.invoices for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Invoice lines: own business" on public.invoice_lines;
create policy "Invoice lines: own business" on public.invoice_lines for select to authenticated
  using (invoice_id in (select i.id from public.invoices i where i.business_id in (select private.my_business_ids())));

drop policy if exists "Payments: own business" on public.payments;
create policy "Payments: own business" on public.payments for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Receipts: own business" on public.receipts;
create policy "Receipts: own business" on public.receipts for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Refund requests: own business" on public.refund_requests;
create policy "Refund requests: own business" on public.refund_requests for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Threads: own business" on public.threads;
create policy "Threads: own business" on public.threads for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Thread messages: own business" on public.thread_messages;
create policy "Thread messages: own business" on public.thread_messages for select to authenticated
  using (thread_id in (select t.id from public.threads t where t.business_id in (select private.my_business_ids())));

-- Saved cards: only the business owner, who is the one who pays.
drop policy if exists "Saved cards: business owner" on public.saved_cards;
create policy "Saved cards: business owner" on public.saved_cards for select to authenticated
  using (business_id in (select private.my_owned_business_ids()));

-- The client bell only. The team bell is read by the server after its team check.
drop policy if exists "Notifications: your own" on public.notifications;
create policy "Notifications: your own" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()) and audience = 'client');

drop policy if exists "Activity: own business" on public.activity;
create policy "Activity: own business" on public.activity for select to authenticated
  using (business_id in (select private.my_business_ids()));

drop policy if exists "Product interest: your own" on public.product_interest;
create policy "Product interest: your own" on public.product_interest for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Sign ins: your own" on public.signin_events;
create policy "Sign ins: your own" on public.signin_events for select to authenticated
  using (user_id = (select auth.uid()));

-- Two step sign in: with it on, nothing can be read until the code has been typed.
do $$
declare
  t text;
begin
  foreach t in array array[
    'businesses', 'profiles', 'business_members', 'projects', 'quotes', 'project_updates', 'project_files',
    'invoices', 'invoice_lines', 'payments', 'receipts', 'refund_requests', 'threads', 'thread_messages',
    'saved_cards', 'notifications', 'activity', 'product_interest', 'signin_events'
  ]
  loop
    execute format('drop policy if exists "Two step sign in" on public.%I', t);
    execute format('create policy "Two step sign in" on public.%I as restrictive for all to authenticated using ((select private.aal_ok()))', t);
  end loop;
end;
$$;

-- ============================================================================================
-- 6. File storage: a private bucket for project files
-- ============================================================================================

-- 20 MB a file. PDF, images, Word (.docx), Excel (.xlsx), CSV, plain text and zip. The console
-- sends each file with the type that matches its extension.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-files', 'project-files', false, 20971520,
  array[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'text/plain',
    'application/zip'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- No policies for signed in people on this bucket: nobody reads or writes it directly. Uploads
-- use one time upload links made by the server, and downloads use signed links that last
-- 60 seconds, made by the server after it has checked the person belongs to the business.
drop policy if exists "Project files: own business can read" on storage.objects;

commit;
