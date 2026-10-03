create table if not exists public.discovery_question_reviews (
 id uuid primary key default gen_random_uuid(),
 project_id bigint not null references public.discovery_projects(id) on delete cascade,
 parent_review_id uuid references public.discovery_question_reviews(id),
 staff_id uuid not null,
 goal_snapshot jsonb,
 candidates jsonb not null,
 reviews jsonb not null,
 staff_decisions jsonb,
 created_at timestamptz not null default now(),
 finalized_at timestamptz
);
create index if not exists discovery_question_reviews_project_time on public.discovery_question_reviews(project_id,created_at desc);
alter table public.discovery_question_reviews enable row level security;
revoke all on public.discovery_question_reviews from anon,authenticated;
grant all on public.discovery_question_reviews to service_role;
alter table public.discovery_questions add column if not exists review_session_id uuid references public.discovery_question_reviews(id);
alter table public.discovery_questions add column if not exists goal_snapshot jsonb;
create or replace function public.discovery_finalize_question_review(review_id uuid,project_id bigint,decisions jsonb,question_rows jsonb,actor_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.discovery_question_reviews%rowtype; q jsonb; candidate jsonb; choice jsonb; saved_count integer:=0; skipped_count integer:=0;
begin
 perform pg_advisory_xact_lock(project_id);
 select * into r from public.discovery_question_reviews where id=review_id and discovery_question_reviews.project_id=discovery_finalize_question_review.project_id for update;
 if not found or actor_id is null then raise exception 'Review missing'; end if;
 if r.finalized_at is not null then
  if r.staff_decisions=decisions then return jsonb_build_object('saved',0,'skipped',jsonb_array_length(question_rows)); end if;
  raise exception 'Review already finalized';
 end if;
 if jsonb_typeof(decisions)<>'array' or jsonb_array_length(decisions)<>jsonb_array_length(r.candidates) then raise exception 'Incomplete decisions'; end if;
 for candidate in select * from jsonb_array_elements(r.candidates) loop
  if (select count(*) from jsonb_array_elements(decisions) x where x->>'key'=candidate->>'key')<>1 then raise exception 'Invalid decision coverage'; end if;
 end loop;
 if (select count(*) from jsonb_array_elements(decisions) x where x->>'selected'='true')<>jsonb_array_length(question_rows) then raise exception 'Selection mismatch'; end if;
 for q in select * from jsonb_array_elements(question_rows) loop
  if (q->>'project_id')::bigint<>project_id or q->>'review_session_id'<>review_id::text or nullif(q->'goal_snapshot','null'::jsonb) is distinct from r.goal_snapshot then raise exception 'Project or goal mismatch'; end if;
  if exists(select 1 from public.discovery_questions x where x.project_id=discovery_finalize_question_review.project_id and x.question=q->>'question') then skipped_count:=skipped_count+1;continue;end if;
  insert into public.discovery_questions(project_id,question,intent,who,for_whom,where_location,purpose,problem,action,service,dimension_count,combination_key,is_duplicate,is_benchmark,status,notes,review_session_id,goal_snapshot)
  values(project_id,q->>'question',q->>'intent',q->>'who',q->>'for_whom',q->>'where_location',q->>'purpose',q->>'problem',q->>'action',q->>'service',(q->>'dimension_count')::integer,q->>'combination_key',false,false,'saved',q->>'notes',review_id,r.goal_snapshot);
  saved_count:=saved_count+1;
 end loop;
 update public.discovery_question_reviews set staff_decisions=decisions,finalized_at=now(),staff_id=actor_id where id=review_id;
 return jsonb_build_object('saved',saved_count,'skipped',skipped_count);
end;$$;
revoke all on function public.discovery_finalize_question_review(uuid,bigint,jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.discovery_finalize_question_review(uuid,bigint,jsonb,jsonb,uuid) to service_role;
