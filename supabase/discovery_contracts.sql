-- 직원 발송·고객 서명 전용. 서비스 역할 서버 API에서만 접근.
create table if not exists public.discovery_contracts (
 id uuid primary key default gen_random_uuid(),
 inquiry_id bigint not null references public.discovery_inquiries(id),
 snapshot jsonb not null,
 snapshot_hash text not null,
 recipient_email text not null,
 recipient_phone text not null,
 status text not null default 'sending' check(status in ('sending','sent','send_failed','signed','cancelled')),
 expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 provider_approved_at timestamptz not null default now(),
 provider_user_id uuid not null,
 otp_hash text,
 otp_expires_at timestamptz,
 otp_last_sent_at timestamptz,
 otp_sends integer not null default 0,
 otp_attempts integer not null default 0,
 sent_at timestamptz,
 signed_at timestamptz,
 signature_data text,
 signing_evidence jsonb,
 completion_email_status text not null default 'pending' check(completion_email_status in ('pending','sent','failed'))
);
alter table public.discovery_contracts enable row level security;
create unique index if not exists discovery_contracts_one_open on public.discovery_contracts(inquiry_id) where status in ('sending','sent','send_failed');
create or replace function public.protect_discovery_contract() returns trigger language plpgsql set search_path=public as $$
begin
 if old.status='signed' and (to_jsonb(new)-'completion_email_status') is distinct from (to_jsonb(old)-'completion_email_status') then raise exception 'Signed contract is immutable'; end if;
 if new.snapshot is distinct from old.snapshot or new.snapshot_hash is distinct from old.snapshot_hash or new.recipient_email is distinct from old.recipient_email or new.recipient_phone is distinct from old.recipient_phone or new.provider_user_id is distinct from old.provider_user_id or new.provider_approved_at is distinct from old.provider_approved_at or new.expires_at is distinct from old.expires_at then raise exception 'Contract snapshot is immutable'; end if;
 return new;
end $$;
drop trigger if exists protect_discovery_contract on public.discovery_contracts;
create trigger protect_discovery_contract before update on public.discovery_contracts for each row execute function public.protect_discovery_contract();
