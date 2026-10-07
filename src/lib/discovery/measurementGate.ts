import type {SupabaseClient} from '@supabase/supabase-js'
import {measurementCycle,inCycle} from './measurementCycle'
export async function measurementGate(s:SupabaseClient,projectId:number,existing:{created_at:string}|null){
 const {data,error}=await s.from('discovery_measurements').select('created_at').eq('project_id',projectId).order('created_at',{ascending:true}).limit(1)
 if(error)throw Error('프로젝트 측정 기준일 조회 실패')
 const cycle=measurementCycle((data||[]).map(x=>x.created_at))
 return {cycle,reuse:!!existing&&inCycle(existing.created_at,cycle),blocked:!cycle.due,message:`정기 측정일은 ${cycle.next}입니다. 추가 채널도 이날 함께 측정합니다. (프로젝트 기준일 ${cycle.base} · 15일 간격)`}
}
