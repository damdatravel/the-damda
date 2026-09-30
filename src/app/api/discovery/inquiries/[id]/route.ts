import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'
import {validateQuotation,quoteServicesConsistent} from '../../../../../lib/quotation'
import {transferNaverConsultation} from '../../../../../lib/transferNaverConsultation'
import {ensureCaseReport,validClosure} from '../../../../../lib/caseReport'
const allowed=new Set(['diagnosis_pending','reviewing','proposal','customer_delivery','quote_drafting','quote_ready','quote_sent','contracted','closed'])
export async function PATCH(req:Request,{params}:{params:{id:string}}){
 const token=cookies().get('damda_staff_token')?.value,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!token||!publishable||!process.env.NEXT_PUBLIC_SUPABASE_URL)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data:{user}}=await auth.auth.getUser(token)
 if(!user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
 const body=await req.json().catch(()=>({}))
 if(!allowed.has(body.status))return NextResponse.json({error:'허용되지 않은 상태입니다.'},{status:400})
 const s=createClient(url,key,{auth:{persistSession:false}})
 const id=Number(params.id)
 if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:'상담 번호를 확인해 주세요.'},{status:400})
 const current=await s.from('discovery_inquiries').select('project_id,status').eq('id',id).maybeSingle()
 if(current.error||!current.data)return NextResponse.json({error:'상담을 찾을 수 없습니다.'},{status:404})
 if(current.data.project_id&&body.status!=='contracted')return NextResponse.json({error:'계약된 상담을 미계약으로 전환할 수 없습니다. 관리 프로젝트에서 계약 종료를 관리하세요.'},{status:409})
 if(body.status==='contracted'){
  const quote=await s.from('discovery_quotations').select('document').eq('inquiry_id',id).maybeSingle()
  if(quote.error)return NextResponse.json({error:'계약 기준 견적을 조회하지 못했습니다.'},{status:500})
  if(quote.data&&(!validateQuotation(quote.data.document)||!quoteServicesConsistent(quote.data.document)))return NextResponse.json({error:'저장된 견적의 서비스와 채널을 정리한 뒤 계약을 진행해 주세요.'},{status:409})
  const ai=quote.data?quote.data.document.ai:body.ai_management,naver=quote.data?quote.data.document.naver:body.naver_management
  if(typeof ai!=='boolean'||typeof naver!=='boolean'||(!ai&&!naver))return NextResponse.json({error:'이용할 관리 서비스를 하나 이상 선택해 주세요.'},{status:400})
  const inquiry=await s.from('discovery_inquiries').select('id,company_name,website_url,industry,main_services,project_id').eq('id',id).single()
  if(inquiry.error)return NextResponse.json({error:inquiry.error.message},{status:500})
  try{await ensureCaseReport(s,id)}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'고객 보고서 준비 실패'},{status:500})}
  if(inquiry.data.project_id){
   const done=await s.from('discovery_inquiries').update({status:'contracted',updated_at:new Date().toISOString()}).eq('id',id).select('id,status,project_id').single()
   if(done.error)return NextResponse.json({error:done.error.message},{status:500})
   return NextResponse.json(done.data)
  }
  const {data:diagnosis,error:diagnosisError}=await s.from('discovery_diagnosis_reports').select('summary,website_snapshot').eq('inquiry_id',id).maybeSingle()
  if(diagnosisError)return NextResponse.json({error:'기존 진단 요약 확인 실패: '+diagnosisError.message},{status:500})
  const created=await s.from('discovery_projects').insert({name:inquiry.data.company_name,website_url:inquiry.data.website_url,industry:inquiry.data.industry,main_services:inquiry.data.main_services,description:diagnosis?.summary||null,status:'active',ai_management:ai,naver_management:naver}).select('id').single()
  if(created.error)return NextResponse.json({error:'프로젝트 생성 실패: '+created.error.message},{status:500})
  if(naver){try{await transferNaverConsultation(s,created.data.id,diagnosis?.website_snapshot,id)}catch(e){await s.from('discovery_projects').delete().eq('id',created.data.id);return NextResponse.json({error:e instanceof Error?e.message:'상담 자료 연결 실패'},{status:500})}}
  const done=await s.from('discovery_inquiries').update({status:'contracted',project_id:created.data.id,updated_at:new Date().toISOString()}).eq('id',id).is('project_id',null).eq('status',current.data.status).select('id,status,project_id').single()
  if(done.error){await s.from('discovery_projects').delete().eq('id',created.data.id);return NextResponse.json({error:'상담 건 연결 실패: '+done.error.message},{status:500})}
  return NextResponse.json(done.data)
 }
 if(body.status==='closed'){
  if(!validClosure(body.closure))return NextResponse.json({error:'미계약 사유와 검토 내용을 작성해 주세요.'},{status:400})
  try{
   await ensureCaseReport(s,id)
   const entry={reason:body.closure.reason,customerStatement:body.closure.customerStatement,analysis:body.closure.analysis,followUp:body.closure.followUp,recordedAt:new Date().toISOString(),recordedBy:user.id}
   const saved=await s.rpc('discovery_close_inquiry',{case_id:id,closure_entry:entry})
   if(saved.error)throw new Error('미계약 보고서 저장 실패: '+saved.error.message)
   return NextResponse.json(saved.data)
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'미계약 사유 저장 실패'},{status:500})}
 }
 const r=await s.from('discovery_inquiries').update({status:body.status,updated_at:new Date().toISOString()}).eq('id',id).is('project_id',null).select('id,status,project_id').single()
 if(r.error)return NextResponse.json({error:r.error.message},{status:500})
 return NextResponse.json(r.data)
}
