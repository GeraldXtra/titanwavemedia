begin;

create or replace function public.hook_titanwave_before_user_created(event jsonb)
returns jsonb
language plpgsql stable set search_path = ''
as $$
declare
  v_app jsonb := coalesce(event -> 'user' -> 'app_metadata', '{}'::jsonb);
  v_provider text := coalesce(v_app ->> 'provider', '');
  v_anonymous boolean := coalesce((event -> 'user' ->> 'is_anonymous')::boolean, false);
begin
  if not v_anonymous and v_provider = 'google' then
    return '{}'::jsonb;
  end if;
  if not v_anonymous and v_app ->> 'made_by' = 'titanwave-server' then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Please create your account on our website.'
    )
  );
end;
$$;

grant execute on function public.hook_titanwave_before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_titanwave_before_user_created(jsonb) from authenticated, anon, public;

commit;
