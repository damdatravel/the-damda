-- 고객 직접 사전 진단: 서버만 접근하며 24시간 후 만료 자료는 삭제합니다.
create table if not exists public.discovery_public_diagnoses (
 id uuid primary key default gen_random_uuid(),
 phone text not null,
 website_url text not null,
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now() + interval '24 hours'),
 email_status text not null default 'pending' check (email_status in ('pending','sending','sent','failed')),
 email text,
 inquiry_id bigint references public.discovery_inquiries(id)
);
alter table public.discovery_public_diagnoses enable row level security;
revoke all on public.discovery_public_diagnoses from anon, authenticated;
create index if not exists public_diagnosis_phone_time on public.discovery_public_diagnoses(phone, created_at);

-- Supabase Cron 사용: 만료된 임시 진단을 매시간 삭제합니다.
create extension if not exists pg_cron;
do $$ begin
 if not exists (select 1 from cron.job where jobname = 'discovery-public-diagnosis-cleanup') then
  perform cron.schedule('discovery-public-diagnosis-cleanup', '0 * * * *',
    'delete from public.discovery_public_diagnoses where expires_at < now()');
 end if;
end $$;
