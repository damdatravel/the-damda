import {projectContext} from '../../../../lib/discovery/contextStore'
import {executionPrompt} from '../../../../lib/discovery/executionComposition'
import {originalEvidence} from '../../../../lib/discovery/evidence'
import {parseWorkPlan} from '../../../../lib/workPlan'
import {readWorkflow} from '../../../../lib/improvementWorkflow'
import {projectEngagement} from '../../../../lib/engagementStore'
import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export async function POST(req:Request){
 try{
  const apiKey=process.env.OPENAI_API_KEY
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  const pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,token=cookies().get('damda_staff_token')?.value
  if(!url||!pub||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const user=await createClient(url,pub,{auth:{persistSession:false}}).auth.getUser(token)
  if(user.error||!user.data.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  if(!apiKey||!url||!key)return NextResponse.json({error:'API 환경변수를 확인해 주세요.'},{status:500})
  const body=await req.json()
  const projectId=Number(body?.projectId)
  if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
  const s=createClient(url,key)
  const {data:p,error}=await s.from('discovery_projects').select('name,website_url,industry,main_services,target_customer,service_area,description,ai_management,naver_management').eq('id',projectId).single()
  if(error)return NextResponse.json({error:error.message},{status:500})
  const sourceId=Number(body.sourceId)
  if(!Number.isSafeInteger(sourceId)||sourceId<1||typeof body.taskId!=='string')return NextResponse.json({error:'원본 분석과 과제를 선택해 주세요.'},{status:400})
  const source=await s.from('discovery_analysis_history').select('id,observed,created_at,measurement_round').eq('project_id',projectId).eq('id',sourceId).in('measurement_round',['Comparison','Day 0','Naver']).single()
  if(source.error)return NextResponse.json({error:'원본 분석을 찾지 못했습니다.'},{status:404})
  if(source.data.measurement_round==='Naver'?!p.naver_management:!p.ai_management)return NextResponse.json({error:'선택 서비스 범위 밖의 분석입니다.'},{status:409})
  const task=readWorkflow(source.data.observed||[])?.tasks.find(t=>t.id===body.taskId)
  if(!task||task.status!=='approved')return NextResponse.json({error:'승인된 과제만 초안을 생성할 수 있습니다.'},{status:409})
  const [questions,website,engagement,naver]=await Promise.all([
   s.from('discovery_questions').select('id,question,is_benchmark').eq('project_id',projectId),
   s.from('discovery_analysis_history').select('id,observed,created_at').eq('project_id',projectId).eq('measurement_round','Naver Website').order('created_at',{ascending:false}).limit(1).maybeSingle(),
   projectEngagement(s,projectId),
   p.ai_management&&p.naver_management?s.from('discovery_analysis_history').select('id,observed,created_at').eq('project_id',projectId).eq('measurement_round','Naver').order('created_at',{ascending:false}).limit(5):Promise.resolve({data:[],error:null})
  ])
  if(questions.error||website.error||naver.error)return NextResponse.json({error:'질문·홈페이지 근거 조회에 실패했습니다.'},{status:500})
  const evidence=originalEvidence(source.data.observed)
  const previous=await s.from('discovery_improvement_tasks').select('title,status,summary,work_details').eq('project_id',projectId)
  if(previous.error)return NextResponse.json({error:'기존 작업을 확인하지 못했습니다.'},{status:500})
  const assets=await s.from('discovery_analysis_history').select('observed,created_at').eq('project_id',projectId).eq('measurement_round','Channel Inventory').order('id',{ascending:false}).limit(1).maybeSingle()
  if(assets?.error)throw Error('고객 채널 정보 조회 실패')
  const inputContext=await projectContext(s,projectId)
  const prompt=executionPrompt({assets,p,source,questions,evidence,website,naver,engagement,previous,task})
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-5.5',input:prompt})})
  const raw=await r.json()
  if(!r.ok)return NextResponse.json({error:raw?.error?.message||'OpenAI 작업 초안 오류'},{status:502})
  const draft=(raw.output??[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('\n').trim()
  if(draft.length>20000)return NextResponse.json({error:'초안이 너무 깁니다. 다시 생성해 주세요.'},{status:502})
  if(!draft)return NextResponse.json({error:'작업 초안을 찾지 못했습니다.'},{status:502})
  const plan=parseWorkPlan(draft)
  return NextResponse.json({ok:true,generationContext:inputContext,...plan})
 }catch(e:any){return NextResponse.json({error:e?.message||'작업 초안 생성 중 오류가 발생했습니다.'},{status:500})}
}
