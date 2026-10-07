-- 기존 동의의 24시간 보관 기한은 늘리지 않습니다.
alter table public.discovery_public_diagnoses add column if not exists retained_until timestamptz;
update public.discovery_public_diagnoses set retained_until=expires_at where retained_until is null;
alter table public.discovery_public_diagnoses alter column retained_until set default (now()+interval '24 hours');
alter table public.discovery_public_diagnoses alter column retained_until set not null;
alter table public.discovery_inquiries add column if not exists public_receipt_agreed boolean not null default false;
select cron.alter_job(job_id:=jobid,command:='delete from public.discovery_public_diagnoses where retained_until < now()')
from cron.job where jobname='discovery-public-diagnosis-cleanup';
