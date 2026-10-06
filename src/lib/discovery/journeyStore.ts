import type {SupabaseClient} from '@supabase/supabase-js'
import {validateJourney} from './selectionJourney'
export async function selectionJourneys(s:SupabaseClient,projectId:number,limit=3){const r=await s.from('discovery_analysis_history').select('id,observed,created_at').eq('project_id',projectId).eq('measurement_round','Selection Journey').order('id',{ascending:false}).limit(limit);if(r.error)throw Error('추천·선택 기록 조회 실패');return (r.data||[]).flatMap(row=>{const j=row.observed?.[0];return validateJourney(j)&&j.reviewed?[{id:row.id,createdAt:row.created_at,journey:j}]:[]})}
