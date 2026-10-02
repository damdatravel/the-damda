alter table public.discovery_inquiries add column if not exists search_goal jsonb;
create table if not exists public.discovery_engagements (
 inquiry_id bigint primary key references public.discovery_inquiries(id) on delete cascade,
 public_token text not null unique,
 document jsonb not null,
 revision bigint not null default 0
);
alter table public.discovery_engagements enable row level security;
revoke all on public.discovery_engagements from anon,authenticated;
grant all on public.discovery_engagements to service_role;
-- Customer responses append atomically and cannot overwrite staff changes or submit twice.
create or replace function public.discovery_submit_confirmation(link_token text, request_id text, answers jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare entry_row public.discovery_engagements%rowtype; r jsonb; entry jsonb;
begin
 select * into entry_row from public.discovery_engagements where public_token=link_token for update;
 if not found then return false; end if;
 if exists(select 1 from public.discovery_inquiries where id=entry_row.inquiry_id and status='closed') then return false; end if;
 r=entry_row.document->'request';
 if r is null or r='null'::jsonb or r->>'id'<>request_id or (r->>'expiresAt')::timestamptz<now() or r->>'answeredAt' is not null then return false; end if;
 entry=jsonb_build_object('requestId',request_id,'at',now(),'facts',r->'facts','answers',answers);
 update public.discovery_engagements set document=jsonb_set(jsonb_set(jsonb_set(entry_row.document,'{request,answers}',answers),'{request,answeredAt}',to_jsonb(now())), '{responses}',coalesce(entry_row.document->'responses','[]'::jsonb)||jsonb_build_array(entry)),revision=revision+1 where inquiry_id=entry_row.inquiry_id;
 return true;
end; $$;
revoke all on function public.discovery_submit_confirmation(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.discovery_submit_confirmation(text,text,jsonb) to service_role;
