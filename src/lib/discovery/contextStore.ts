import {selectionJourneys} from './journeyStore'
import type {SupabaseClient} from '@supabase/supabase-js'
import {projectEngagement} from '../engagementStore'
import {contextVersion} from './contextVersion'
export async function projectContext(s:SupabaseClient,projectId:number){
 const [p,q,e,h,d,o,j,m]=await Promise.all([
 s.from('discovery_projects').select('name,website_url,industry,main_services,target_customer,service_area,description,ai_management,naver_management').eq('id',projectId).single(),
 s.from('discovery_questions').select('id,question').eq('project_id',projectId).eq('is_benchmark',true).order('id'),
 projectEngagement(s,projectId),
 s.from('discovery_analysis_history').select('id,measurement_round,observed').eq('project_id',projectId).in('measurement_round',['Channel Inventory','Naver Website']).order('id',{ascending:false}).limit(100),
 s.from('discovery_question_dimensions').select('id,dimension_type,dimension_value,is_active').eq('project_id',projectId).order('id',{ascending:false}),
 s.from('discovery_ontologies').select('document').eq('project_id',projectId).maybeSingle(),
 selectionJourneys(s,projectId),
 s.from('discovery_measurements').select('id,question_id,channel,created_at,is_discovered,result_text,source_urls,notes').eq('project_id',projectId).order('id',{ascending:false})
 ])
 if(m.error||p.error||q.error||h.error||d.error||(o.error&&!['42P01','PGRST205'].includes(o.error.code)))throw Error('분석 입력 기준을 확인하지 못했습니다. 다시 시도해 주세요.')
 return contextVersion(projectId,{measurements:m.data||[],company:p.data,questions:q.data||[],goal:e?{goalId:e.goalId,searchGoal:e.searchGoal,criteria:e.criteria}:null,facts:e?.confirmedFacts||[],channels:h.data?.find(x=>x.measurement_round==='Channel Inventory')?.observed||null,website:h.data?.find(x=>x.measurement_round==='Naver Website')?.observed||null,materials:d.data||[],relationships:o.data?.document||null,selection:j})
}
