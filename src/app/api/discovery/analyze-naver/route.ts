import {selectionJourneys} from '../../../../lib/discovery/journeyStore'
import {projectEngagement} from '../../../../lib/engagementStore'
import {naverReviewPrompt} from '../../../../lib/discovery/reviewComposition'
import {projectContext} from '../../../../lib/discovery/contextStore'
import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {consultationScope} from '../../../../lib/consultationScope'

export async function POST(request:Request){
 try{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY,apiKey=process.env.OPENAI_API_KEY
  const token=cookies().get('damda_staff_token')?.value
  if(!url||!publishable||!service||!apiKey)return NextResponse.json({error:'분석 환경 설정을 확인해 주세요.'},{status:503})
  if(!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:{user}}=await auth.auth.getUser(token)
  if(!user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const {projectId:rawProjectId,inquiryId:rawInquiryId,report}=await request.json(),projectId=Number(rawProjectId),inquiryId=Number(rawInquiryId)
  const isProject=Number.isInteger(projectId)&&projectId>0,isInquiry=Number.isInteger(inquiryId)&&inquiryId>0
  if(isProject===isInquiry||!report||typeof report.query!=='string'||report.query.length>80||!Array.isArray(report.results)||JSON.stringify(report).length>60000)return NextResponse.json({error:'분석할 조회 결과를 확인해 주세요.'},{status:400})
  const s=createClient(url,service,{auth:{persistSession:false}})
  const {data:project}=isProject?await s.from('discovery_projects').select('name,website_url,industry,main_services,target_customer,service_area,description,naver_management').eq('id',projectId).maybeSingle():await s.from('discovery_inquiries').select('company_name,website_url,industry,main_services,concerns,status').eq('id',inquiryId).maybeSingle()
  if(!project||isProject&&!('naver_management' in project&&project.naver_management))return NextResponse.json({error:'네이버 관리 대상 업체를 찾지 못했습니다.'},{status:404})
  const websiteQuery=isProject?await s.from('discovery_analysis_history').select('observed,created_at').eq('project_id',projectId).eq('measurement_round','Naver Website').order('created_at',{ascending:false}).limit(1).maybeSingle():await s.from('discovery_diagnosis_reports').select('website_snapshot,updated_at').eq('inquiry_id',inquiryId).maybeSingle()
  if(websiteQuery.error)return NextResponse.json({error:'홈페이지 진단 이력 확인 실패: '+websiteQuery.error.message},{status:500})
  const websiteEvidence=isProject?(websiteQuery.data as any)?.observed?.[0]||null:(websiteQuery.data as any)?.website_snapshot||null
  const websiteCheckedAt=isProject?(websiteQuery.data as any)?.created_at:(websiteQuery.data as any)?.updated_at
  if(isInquiry){
   const {data:inquiry}=await s.from('discovery_inquiries').select('project_id,concerns').eq('id',inquiryId).maybeSingle()
   if(inquiry?.project_id)return NextResponse.json({error:'계약된 고객은 관리 프로젝트에서 분석해 주세요.'},{status:409})
   if(!consultationScope(websiteEvidence,inquiry?.concerns).naver||!Array.isArray(websiteEvidence?.naverSelectedQueries)||!websiteEvidence.naverSelectedQueries.includes(report.query))return NextResponse.json({error:'상담에서 선택한 대표 검색어의 결과만 분석할 수 있습니다.'},{status:409})
  }
  const mq=isProject?await s.from('discovery_questions').select('id,question').eq('project_id',projectId).eq('question',report.query):{data:[],error:null}
  if(mq.error)throw Error('AI 화면 질문 조회 실패')
  const manualAi=mq.data?.length?await s.from('discovery_measurements').select('id,question_id,channel,is_discovered,result_text,source_urls,notes,created_at').eq('project_id',projectId).in('question_id',mq.data.map(q=>q.id)).in('channel',['Naver AI Briefing','Naver AI Shopping']).order('created_at',{ascending:false}).limit(20):{data:[],error:null}
  if(manualAi.error)throw Error('네이버 AI 화면 근거 조회 실패')
  const evidence={query:report.query,checkedAt:report.checkedAt,results:report.results.slice(0,5).map((channel:any)=>({channel:channel.label,error:channel.error||null,items:(channel.items||[]).slice(0,10).map((item:any)=>({title:item.title,description:item.description,link:item.link,address:item.address}))})),trend:report.trend,shopping:report.shopping,manualAi:manualAi.data||[]}
  const prior=isProject?await s.from('discovery_analysis_history').select('id,interpreted,observed').eq('project_id',projectId).eq('measurement_round','Naver').order('id',{ascending:false}).limit(5):{data:[],error:null}
  if(prior.error)return NextResponse.json({error:'기존 네이버 작업 조회 실패'},{status:500})
  const assets=isInquiry?null:await s.from('discovery_analysis_history').select('observed,created_at').eq('project_id',projectId).eq('measurement_round','Channel Inventory').order('id',{ascending:false}).limit(1).maybeSingle()
  if(assets?.error)throw Error('고객 채널 정보 조회 실패')
  const engagement=isProject?await projectEngagement(s,projectId):null
  const journeys=isProject?await selectionJourneys(s,projectId):[]
  const inputContext=isProject?await projectContext(s,projectId):null
  const prompt=naverReviewPrompt({assets,project,evidence,websiteCheckedAt,websiteEvidence,prior,engagement,journeys})
  const scopedPrompt=isInquiry?prompt+'\n이번 분석은 계약 전 초기 상담입니다. 주요 관찰과 가능한 문제, 개선 방향을 최대 3개로 요약하고 상세 실행 절차·콘텐츠 제작·반복 관리·일괄 측정 계획은 제공하지 마세요. 계약 이후 협의할 관리 범위를 짧게 구분하세요.':prompt
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-5.5',input:scopedPrompt})})
  const raw=await response.json();if(!response.ok)return NextResponse.json({error:raw?.error?.message||'분석 API 오류'},{status:502})
  const analysis=(raw.output??[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('\n').trim()
  if(!analysis)return NextResponse.json({error:'분석 결과가 비어 있습니다.'},{status:502})
  const observed={...evidence,websiteEvidence,websiteCheckedAt:websiteCheckedAt||null}
  const {data:history,error}=isProject?await s.from('discovery_analysis_history').insert({project_id:projectId,measurement_round:'Naver',observed:[observed,...(inputContext?[inputContext]:[])],interpreted:analysis}).select('id,created_at').single():await s.from('discovery_naver_inquiry_history').insert({inquiry_id:inquiryId,query:report.query,observed,interpreted:analysis}).select('id,created_at').single()
  if(error)return NextResponse.json({error:'진단 이력 저장 실패: '+error.message},{status:500})
  return NextResponse.json({analysis,history:{...history,interpreted:analysis,observed:[observed,...(inputContext?[inputContext]:[])]}})
 }catch(e:any){return NextResponse.json({error:e?.message||'네이버 분석 중 오류가 발생했습니다.'},{status:500})}
}
