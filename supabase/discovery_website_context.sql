alter table public.discovery_inquiries add column if not exists website_context jsonb;
-- 홈페이지가 없는 고객의 URL은 빈 문자열로 저장합니다.
create table if not exists public.discovery_website_work (
 inquiry_id bigint primary key references public.discovery_inquiries(id) on delete cascade,
 document jsonb not null default '{"items":[]}'::jsonb,
 revision bigint not null default 0
);
alter table public.discovery_website_work enable row level security;
revoke all on public.discovery_website_work from anon, authenticated;
grant all on public.discovery_website_work to service_role;
