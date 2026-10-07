alter table public.discovery_public_diagnoses
 add column if not exists intake_context jsonb,
 add column if not exists public_receipt_agreed boolean not null default false;
