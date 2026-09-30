-- Supabase SQL Editor에서 실행. 고객 공개 자료와 내부 미계약 기록을 분리합니다.
create table if not exists public.discovery_case_reports (
 inquiry_id bigint primary key references public.discovery_inquiries(id) on delete cascade,
 public_token text not null unique,
 baseline jsonb not null default '{}',
 draft jsonb not null default '{}',
 published jsonb,
 published_at timestamptz,
 closure_history jsonb not null default '[]',
 updated_at timestamptz not null default now()
);
alter table public.discovery_case_reports enable row level security;
-- 익명/일반 인증 사용자의 조회 정책을 만들지 않습니다. 서버가 공개 확정 필드만 전달합니다.
revoke all on public.discovery_case_reports from anon, authenticated;
grant all on public.discovery_case_reports to service_role;

-- Store the closure report and status together; serialize against contract updates.
create or replace function public.discovery_close_inquiry(case_id bigint, closure_entry jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare inquiry public.discovery_inquiries%rowtype;
begin
 select * into inquiry from public.discovery_inquiries where id=case_id for update;
 if not found then raise exception '상담을 찾을 수 없습니다.'; end if;
 if inquiry.project_id is not null then raise exception '계약된 상담은 미계약으로 종료할 수 없습니다.'; end if;
 update public.discovery_case_reports set closure_history=closure_history||jsonb_build_array(closure_entry),updated_at=now() where inquiry_id=case_id;
 if not found then raise exception '미계약 보고서 저장소가 없습니다.'; end if;
 update public.discovery_inquiries set status='closed',updated_at=now() where id=case_id;
 return jsonb_build_object('id',case_id,'status','closed','project_id',null);
end; $$;
revoke all on function public.discovery_close_inquiry(bigint,jsonb) from public,anon,authenticated;
grant execute on function public.discovery_close_inquiry(bigint,jsonb) to service_role;
