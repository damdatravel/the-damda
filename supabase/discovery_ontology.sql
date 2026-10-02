-- Supabase SQL Editor에서 실행. 관계와 원문은 직원 서버에서만 조회합니다.
create table if not exists public.discovery_ontologies (
 project_id bigint primary key references public.discovery_projects(id) on delete cascade,
 document jsonb not null,
 updated_at timestamptz not null default now()
);
alter table public.discovery_ontologies enable row level security;
revoke all on public.discovery_ontologies from anon,authenticated;
grant all on public.discovery_ontologies to service_role;
