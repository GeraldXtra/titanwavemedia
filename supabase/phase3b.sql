begin;

lock table public.assistants, public.assist_conversations, public.assist_messages, public.assist_handovers, public.assist_usage
in access exclusive mode;

alter table public.assistants add column if not exists docs jsonb not null default '[]'::jsonb;
alter table public.assistants add column if not exists plan_kobo bigint;
alter table public.assistants add column if not exists billing_on boolean not null default false;
alter table public.assistants add column if not exists billing_day smallint;
alter table public.assistants add column if not exists billing_next_on date;
alter table public.assistants add column if not exists billing_started_on date;

alter table public.assistants drop constraint if exists assistants_prices_check;
alter table public.assistants add constraint assistants_prices_check check (char_length(prices) <= 50000);
alter table public.assistants drop constraint if exists assistants_extra_check;
alter table public.assistants add constraint assistants_extra_check check (char_length(extra) <= 50000);
alter table public.assistants drop constraint if exists assistants_docs_check;
alter table public.assistants add constraint assistants_docs_check
  check (jsonb_typeof(docs) = 'array' and jsonb_array_length(docs) <= 5 and char_length(docs::text) <= 400000);

update public.assistants
set is_on = false, updated_at = now()
where is_on and whatsapp = '' and btrim(phone) = '' and btrim(email) = '';
alter table public.assistants drop constraint if exists assistants_reach_check;
alter table public.assistants add constraint assistants_reach_check
  check (not is_on or whatsapp <> '' or btrim(phone) <> '' or btrim(email) <> '');

alter table public.assistants drop constraint if exists assistants_plan_check;
alter table public.assistants add constraint assistants_plan_check check (
  (plan_kobo is null or plan_kobo between 10000 and 100000000000)
  and (billing_day is null or billing_day between 1 and 31)
  and (not billing_on or (plan_kobo is not null and billing_day is not null and billing_next_on is not null))
);

create or replace function public.assist_knowledge_size(
  p_name text,
  p_sells text,
  p_prices text,
  p_hours text,
  p_areas text,
  p_qa jsonb,
  p_extra text,
  p_docs jsonb
)
returns integer
language sql immutable set search_path = ''
as $$
  select coalesce(char_length(p_name), 0) + coalesce(char_length(p_sells), 0) + coalesce(char_length(p_prices), 0)
    + coalesce(char_length(p_hours), 0) + coalesce(char_length(p_areas), 0) + coalesce(char_length(p_extra), 0)
    + coalesce((
        select sum(coalesce(char_length(q.value ->> 'q'), 0) + coalesce(char_length(q.value ->> 'a'), 0))
        from jsonb_array_elements(case when jsonb_typeof(p_qa) = 'array' then p_qa else '[]'::jsonb end) q
        where jsonb_typeof(q.value) = 'object'
      ), 0)::integer
    + coalesce((
        select sum(coalesce(char_length(d.value ->> 'text'), 0))
        from jsonb_array_elements(case when jsonb_typeof(p_docs) = 'array' then p_docs else '[]'::jsonb end) d
        where jsonb_typeof(d.value) = 'object'
      ), 0)::integer;
$$;

create or replace function private.assist_check_knowledge()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if jsonb_typeof(new.docs) = 'array' and exists (
    select 1 from jsonb_array_elements(new.docs) d
    where jsonb_typeof(d.value) <> 'object'
       or jsonb_typeof(d.value -> 'name') is distinct from 'string'
       or jsonb_typeof(d.value -> 'text') is distinct from 'string'
       or char_length(d.value ->> 'name') not between 1 and 200
       or char_length(d.value ->> 'text') not between 1 and 50000
  ) then
    raise exception 'assistants: every document needs a name and its text';
  end if;
  if public.assist_knowledge_size(new.name, new.sells, new.prices, new.hours, new.areas, new.qa, new.extra, new.docs) > 50000 then
    raise exception 'assistants: what the assistant knows can be up to 50000 characters';
  end if;
  return new;
end;
$$;

drop trigger if exists assist_check_knowledge on public.assistants;
create trigger assist_check_knowledge
  before insert or update of name, sells, prices, hours, areas, qa, extra, docs on public.assistants
  for each row execute function private.assist_check_knowledge();

alter table public.assist_handovers alter column conversation_id drop not null;

create table if not exists public.assist_counters (
  bucket text not null check (bucket in ('day', 'test', 'starts')),
  key text not null check (char_length(key) between 0 and 128),
  day date not null,
  n integer not null default 0 check (n >= 0),
  updated_at timestamptz not null default now(),
  primary key (bucket, key, day)
);
create index if not exists assist_counters_day_idx on public.assist_counters (day);

alter table public.invoices add column if not exists late_noticed_at timestamptz;

do $$
declare
  c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.invoices'::regclass and contype = 'c'
      and (pg_get_constraintdef(oid) like '%setup_first%' or pg_get_constraintdef(oid) like '%period_start IS NOT NULL%')
  loop
    execute format('alter table public.invoices drop constraint %I', c);
  end loop;
end;
$$;
alter table public.invoices add constraint invoices_kind_check
  check (kind in ('setup_first', 'setup_second', 'care', 'custom', 'assist'));
alter table public.invoices add constraint invoices_period_check
  check (kind not in ('care', 'assist') or period_start is not null);

create unique index if not exists invoices_assist_key on public.invoices (business_id, period_start) where kind = 'assist';
create index if not exists invoices_late_idx on public.invoices (kind, status, due_on) where late_noticed_at is null;
create index if not exists assistants_billing_idx on public.assistants (billing_next_on) where billing_on;

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
  if p_kind is null or p_kind not in ('setup_first', 'setup_second', 'care', 'custom', 'assist') then
    raise exception 'create_invoice: unknown kind %', p_kind;
  end if;
  if p_kind not in ('custom', 'assist') and p_project_id is null then
    raise exception 'create_invoice: a % invoice needs a project', p_kind;
  end if;
  if p_kind = 'assist' and p_project_id is not null then
    raise exception 'create_invoice: a Wave Assist invoice is not for a project';
  end if;
  if p_kind in ('care', 'assist') and p_period_start is null then
    raise exception 'create_invoice: a % invoice needs the month it pays for', p_kind;
  end if;
  if p_due_on is null then
    raise exception 'create_invoice: an invoice needs a due date';
  end if;

  select * into v_business from public.businesses where id = p_business_id;
  if not found then raise exception 'create_invoice: business % not found', p_business_id; end if;

  if p_project_id is not null then
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

  if p_kind = 'assist' then
    perform 1 from public.businesses where id = p_business_id for update;
    select * into v_inv from public.invoices where business_id = p_business_id and kind = 'assist' and period_start = p_period_start;
    if found then return v_inv; end if;
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

create or replace function public.rate_take(p_bucket text, p_key text, p_limit integer, p_window_seconds integer)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_count integer;
  v_oldest timestamptz;
  v_since timestamptz;
begin
  if coalesce(p_bucket, '') = '' or coalesce(p_key, '') = '' or p_limit is null or p_window_seconds is null or p_window_seconds <= 0 then
    raise exception 'rate_take: a bucket, a key, a limit and a window are needed';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_bucket || ':' || p_key, 0));
  v_since := clock_timestamp() - make_interval(secs => p_window_seconds);
  select count(*), min(created_at) into v_count, v_oldest
  from public.rate_hits
  where bucket = p_bucket and key = p_key and created_at >= v_since;
  if v_count >= p_limit then
    return jsonb_build_object('ok', false,
      'retry_after', greatest(1, ceil(extract(epoch from (coalesce(v_oldest, clock_timestamp()) + make_interval(secs => p_window_seconds) - clock_timestamp())))::integer));
  end if;
  insert into public.rate_hits (created_at, bucket, key) values (clock_timestamp(), p_bucket, p_key);
  return jsonb_build_object('ok', true, 'count', v_count + 1);
end;
$$;

create or replace function public.assist_count_take(p_bucket text, p_key text, p_day date, p_limit integer)
returns integer
language plpgsql security invoker set search_path = ''
as $$
declare
  v_n integer;
begin
  if p_limit is null or p_limit <= 0 then
    return null;
  end if;
  insert into public.assist_counters (bucket, key, day, n)
  values (p_bucket, p_key, p_day, 1)
  on conflict (bucket, key, day) do update
    set n = public.assist_counters.n + 1, updated_at = now()
    where public.assist_counters.n < p_limit
  returning n into v_n;
  return v_n;
end;
$$;

create or replace function public.assist_begin_turn(
  p_assistant_id uuid,
  p_conversation_id uuid,
  p_visitor_key text,
  p_starts_key text,
  p_first text,
  p_test boolean,
  p_model boolean,
  p_visitor_limit integer,
  p_conversation_limit integer,
  p_starts_limit integer,
  p_day_limit integer,
  p_test_limit integer
)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_a public.assistants;
  v_c public.assist_conversations;
  v_open boolean := false;
  v_day date := (now() at time zone 'Africa/Lagos')::date;
  v_month_start timestamptz := date_trunc('month', now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos';
  v_rate jsonb;
  v_used integer;
  v_n integer;
  v_new boolean := false;
begin
  select * into v_a from public.assistants where id = p_assistant_id for no key update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_assistant');
  end if;

  if not coalesce(p_test, false) and p_conversation_id is not null then
    select * into v_c from public.assist_conversations
    where id = p_conversation_id and assistant_id = v_a.id
    for no key update;
    v_open := found and v_c.ended_at is null and v_c.last_message_at > now() - interval '24 hours';
  end if;

  v_rate := public.rate_take('assistVisitor', p_visitor_key, p_visitor_limit, 3600);
  if not (v_rate ->> 'ok')::boolean then
    return jsonb_build_object('ok', true, 'limited', 'visitor', 'conversation_id', case when v_open then v_c.id end);
  end if;

  if coalesce(p_test, false) then
    if p_model then
      v_n := public.assist_count_take('test', v_a.id::text, v_day, p_test_limit);
      if v_n is null then
        return jsonb_build_object('ok', true, 'limited', 'test', 'conversation_id', null);
      end if;
    end if;
    return jsonb_build_object('ok', true, 'limited', null, 'conversation_id', null);
  end if;

  if v_open then
    if v_c.message_count >= p_conversation_limit then
      return jsonb_build_object('ok', true, 'limited', 'conversation', 'conversation_id', v_c.id);
    end if;
    update public.assist_conversations
    set message_count = message_count + 1, last_message_at = now()
    where id = v_c.id
    returning * into v_c;
  else
    v_n := public.assist_count_take('starts', p_starts_key, v_day, p_starts_limit);
    if v_n is null then
      return jsonb_build_object('ok', true, 'limited', 'starts', 'conversation_id', null);
    end if;
    select count(*) into v_used
    from public.assist_conversations c
    where c.assistant_id = v_a.id and c.created_at >= v_month_start and not c.over_limit;
    insert into public.assist_conversations (assistant_id, business_id, first_message, over_limit, message_count, last_message_at)
    values (v_a.id, v_a.business_id, nullif(left(btrim(coalesce(p_first, '')), 600), ''), v_used >= v_a.monthly_limit, 1, now())
    returning * into v_c;
    v_new := true;
  end if;

  if v_c.over_limit then
    return jsonb_build_object('ok', true, 'limited', 'month', 'conversation_id', v_c.id, 'new', v_new, 'count', v_c.message_count);
  end if;

  if p_model then
    v_n := public.assist_count_take('day', '', v_day, p_day_limit);
    if v_n is null then
      return jsonb_build_object('ok', true, 'limited', 'day', 'conversation_id', v_c.id, 'new', v_new, 'count', v_c.message_count);
    end if;
  end if;

  return jsonb_build_object('ok', true, 'limited', null, 'conversation_id', v_c.id, 'new', v_new, 'count', v_c.message_count);
end;
$$;

create or replace function public.assist_finish_turn(
  p_assistant_id uuid,
  p_conversation_id uuid,
  p_customer text,
  p_question_key text,
  p_reply text,
  p_answered boolean,
  p_handover boolean,
  p_source text,
  p_person boolean
)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_c public.assist_conversations;
  v_answered boolean := case when coalesce(p_person, false) then null else p_answered end;
begin
  if p_source is null or p_source not in ('model', 'match', 'limit', 'timeout', 'error') then
    raise exception 'assist_finish_turn: unknown source %', p_source;
  end if;
  if coalesce(btrim(p_customer), '') = '' or coalesce(btrim(p_reply), '') = '' then
    raise exception 'assist_finish_turn: a turn needs the question and the answer';
  end if;
  select * into v_c from public.assist_conversations where id = p_conversation_id for no key update;
  if not found or v_c.assistant_id is distinct from p_assistant_id then
    return jsonb_build_object('ok', false, 'error', 'unknown_conversation');
  end if;
  insert into public.assist_messages (conversation_id, business_id, role, body, answered, question_key)
  values (v_c.id, v_c.business_id, 'customer', left(p_customer, 2000), v_answered, nullif(left(coalesce(p_question_key, ''), 200), ''));
  insert into public.assist_messages (conversation_id, business_id, role, body, answered, handover, source)
  values (v_c.id, v_c.business_id, 'assistant', left(p_reply, 2000), v_answered, coalesce(p_handover, false), p_source);
  update public.assist_conversations
  set last_message_at = now(),
      first_message = coalesce(first_message, nullif(left(btrim(coalesce(p_customer, '')), 600), '')),
      outcome = case
        when outcome = 'handed_over' or coalesce(p_person, false) then 'handed_over'
        when p_answered is distinct from true then 'unanswered'
        else outcome
      end
  where id = v_c.id
  returning * into v_c;
  return jsonb_build_object('ok', true, 'count', v_c.message_count, 'outcome', v_c.outcome);
end;
$$;

create or replace function public.assist_end_conversation(
  p_assistant_id uuid,
  p_conversation_id uuid,
  p_starts_key text,
  p_starts_limit integer
)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_n integer;
  v_day date := (now() at time zone 'Africa/Lagos')::date;
begin
  select n into v_n from public.assist_counters where bucket = 'starts' and key = p_starts_key and day = v_day;
  if coalesce(v_n, 0) >= p_starts_limit then
    return jsonb_build_object('ok', true, 'ended', false, 'kept', true);
  end if;
  if p_conversation_id is null then
    return jsonb_build_object('ok', true, 'ended', false, 'kept', false);
  end if;
  update public.assist_conversations
  set ended_at = now()
  where id = p_conversation_id and assistant_id = p_assistant_id and ended_at is null;
  return jsonb_build_object('ok', true, 'ended', found, 'kept', false);
end;
$$;

revoke all on function public.assist_knowledge_size(text, text, text, text, text, jsonb, text, jsonb) from public, anon, authenticated;
revoke all on function private.assist_check_knowledge() from public, anon, authenticated;
revoke all on function public.create_invoice(uuid, uuid, text, text, date, text, jsonb, date, date, uuid) from public, anon, authenticated;
revoke all on function public.rate_take(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.assist_count_take(text, text, date, integer) from public, anon, authenticated;
revoke all on function public.assist_begin_turn(uuid, uuid, text, text, text, boolean, boolean, integer, integer, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.assist_finish_turn(uuid, uuid, text, text, text, boolean, boolean, text, boolean) from public, anon, authenticated;
revoke all on function public.assist_end_conversation(uuid, uuid, text, integer) from public, anon, authenticated;
grant execute on function public.assist_knowledge_size(text, text, text, text, text, jsonb, text, jsonb) to service_role;
grant execute on function public.create_invoice(uuid, uuid, text, text, date, text, jsonb, date, date, uuid) to service_role;
grant execute on function public.rate_take(text, text, integer, integer) to service_role;
grant execute on function public.assist_count_take(text, text, date, integer) to service_role;
grant execute on function public.assist_begin_turn(uuid, uuid, text, text, text, boolean, boolean, integer, integer, integer, integer, integer) to service_role;
grant execute on function public.assist_finish_turn(uuid, uuid, text, text, text, boolean, boolean, text, boolean) to service_role;
grant execute on function public.assist_end_conversation(uuid, uuid, text, integer) to service_role;

alter table public.assist_counters enable row level security;
revoke all on public.assist_counters from anon, authenticated;
grant all on public.assist_counters to service_role;

commit;
