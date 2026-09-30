import {randomBytes} from 'crypto'
import type {SupabaseClient} from '@supabase/supabase-js'
import {reportFromBaseline} from './caseReportDocument'
export {validClosure} from './caseReportDocument'
export async function ensureCaseReport(s:SupabaseClient,id:number){
 const existing=await s.from('discovery_case_reports').select('*').eq('inquiry_id',id).maybeSingle()
 if(existing.error)throw new Error('고객 보고·상담 종료 저장소를 준비해 주세요. discovery_case_reports.sql 실행이 필요합니다.')
 if(existing.data)return existing.data
 const source=await s.from('discovery_diagnosis_reports').select('title,summary,findings,priorities,proposal,status,published_at').eq('inquiry_id',id).maybeSingle()
 if(source.error)throw new Error('상담 보고서를 확인하지 못했습니다.')
 const baseline=source.data||{},draft=reportFromBaseline(baseline)
 const created=await s.from('discovery_case_reports').upsert({inquiry_id:id,public_token:randomBytes(32).toString('base64url'),baseline,draft},{onConflict:'inquiry_id',ignoreDuplicates:true})
 if(created.error)throw new Error('고객 보고서를 준비하지 못했습니다.')
 const row=await s.from('discovery_case_reports').select('*').eq('inquiry_id',id).single()
 if(row.error)throw new Error('고객 보고서를 확인하지 못했습니다.')
 return row.data
}
