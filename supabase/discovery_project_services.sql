-- 기존 프로젝트는 현재 두 관리 화면에 표시되므로 두 서비스를 유지한다.
-- 신규 계약은 실제 이용 서비스만 선택해 저장한다.
alter table public.discovery_projects
  add column if not exists ai_management boolean not null default true,
  add column if not exists naver_management boolean not null default true;

alter table public.discovery_projects
  drop constraint if exists discovery_projects_at_least_one_service;
alter table public.discovery_projects
  add constraint discovery_projects_at_least_one_service
  check (ai_management or naver_management);

comment on column public.discovery_projects.ai_management is 'AI 검색 관리 이용 여부';
comment on column public.discovery_projects.naver_management is '네이버 검색 관리 이용 여부';
