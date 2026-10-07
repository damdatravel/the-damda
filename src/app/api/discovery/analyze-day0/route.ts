import {measurementCycle,cycleMeasurements} from '../../../../lib/discovery/measurementCycle'
import {selectionJourneys} from '../../../../lib/discovery/journeyStore'
import {day0ReviewPrompt} from '../../../../lib/discovery/reviewComposition'
import {projectContext} from '../../../../lib/discovery/contextStore'
import {readWorkflow} from '../../../../lib/improvementWorkflow'
import {compareMeasurements} from '../../../../lib/measurementComparison'
import {projectEngagement} from '../../../../lib/engagementStore'
import {analysisContext} from '../../../../lib/ontology'
import {readOntology} from '../../../../lib/ontologyStore'
import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'
export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>({}))
  const comparisonMode=body.mode==='comparison'
  const projectId=Number(body.projectId)
  if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
  const apiKey=process.env.OPENAI_API_KEY,url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!apiKey||!url||!publishable||!key)return NextResponse.json({error:'API 환경변수를 확인해 주세요.'},{status:500})
  const token=cookies().get('damda_staff_token')?.value
  if(!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:user,error:authError}=await auth.auth.getUser(token)
  if(authError||!user.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const s=createClient(url,key,{auth:{persistSession:false}})
  const [{data:p},{data:b},{data:m,error:me}]=await Promise.all([
   s.from('discovery_projects').select('name,website_url,industry,main_services,target_customer,service_area,description,ai_management,naver_management').eq('id',projectId).single(),
   s.from('discovery_questions').select('id,question').eq('project_id',projectId).eq('is_benchmark',true).order('id'),
   s.from('discovery_measurements').select('id,question_id,channel,measurement_round,is_discovered,result_text,source_urls,notes,created_at').eq('project_id',projectId).order('created_at',{ascending:false})
  ])
  if(me)return NextResponse.json({error:me.message},{status:500})
  if(p&&!p.ai_management)return NextResponse.json({error:'AI 관리 서비스가 선택된 프로젝트에서 분석해 주세요.'},{status:409})
  if(!p)return NextResponse.json({error:'프로젝트를 찾지 못했습니다.'},{status:404})
  const cycle=measurementCycle((m??[]).map(x=>x.created_at))
  const latest=cycleMeasurements(m??[],cycle)
  const rows=(b??[]).map(q=>({question_id:q.id,question:q.question,measurements:[...latest.entries()].filter(([key])=>key.startsWith(`${q.id}:`)).map(([,value])=>value)}))
  if(!rows.length||!rows.some(x=>x.measurements.length))return NextResponse.json({error:'이번 정기 회차의 Benchmark 측정 기록이 필요합니다. 다음 정기 측정일에 측정해 주세요.'},{status:400})
  const comparison=compareMeasurements(b??[],m??[])
  const comparableCount=comparison.reduce((n,q)=>n+q.measurements.filter(x=>x.comparable).length,0)
  if(comparisonMode&&!comparableCount)return NextResponse.json({error:'같은 Benchmark·채널의 Day 0 이후 측정 기록이 필요합니다.'},{status:400})
  const channels=[...new Set((comparisonMode?comparison:rows).flatMap(row=>row.measurements.map((measurement:any)=>measurement.channel)))]
  const hasNaver=channels.includes('Naver Web API')||channels.includes('Naver Search')||channels.includes('Naver AI Briefing')||channels.includes('Naver AI Shopping')
  const [priorTasks,priorAnalysis]=await Promise.all([s.from('discovery_improvement_tasks').select('title,status,summary,work_details,completed_at').eq('project_id',projectId),s.from('discovery_analysis_history').select('id,observed').eq('project_id',projectId).in('measurement_round',['Comparison','Day 0']).order('id',{ascending:false}).limit(100)])
  if(priorTasks.error||priorAnalysis.error)throw Error('기존 개선 작업 조회에 실패했습니다. 완료 작업을 확인한 뒤 분석해 주세요.')
  const nextTasks=(priorAnalysis.data||[]).flatMap(x=>readWorkflow(x.observed||[])?.tasks||[])
  const engagement=await projectEngagement(s,projectId)
  const ontology=await readOntology(s,projectId)
  const dimensions=ontology?await s.from('discovery_question_dimensions').select('id,dimension_type,dimension_value,is_active').eq('project_id',projectId):null
  if(dimensions?.error)throw Error('분석용 질문 재료 조회 실패')
  const relationships=ontology?analysisContext(ontology.graph,dimensions?.data||[]):null
  const comparisonInstructions=comparisonMode?`이번 분석은 최초 Day 0와 최신 측정의 비교다. 동일 질문·동일 채널별 최초 Day 0를 기준으로 삼았다. 다음 구조의 baseline과 latest의 날짜, measurement_round, 발견 여부, 응답 원문, 출처와 notes를 비교하라: ${JSON.stringify(comparison)}
comparable=false는 재측정 대기 또는 기준 없음이므로 성공·실패 변화에 포함하지 마라. null은 판단 보류다. 단일 관찰의 변화는 장기 성과나 개선 작업의 인과관계를 증명하지 않는다. 측정 방식·모델·조건이 달라졌다면 직접 비교의 한계를 명시하고 같은 조건의 재측정을 제안하라. 합의된 목표 기준 충족 여부와 부족한 근거를 구분하라. [요약] 다음에 [최초·최신 비교]를 넣어 질문·채널·두 측정 날짜·관찰 변화를 설명하고, [목표 점검]에서 현재 목표 기준·관찰·다음 확인을 정리하라. [우선 개선안]에는 최신 상태에서 필요한 다음 작업을 제안하라.`:''
  const naver=p.naver_management?await s.from('discovery_analysis_history').select('id,observed,interpreted,created_at').eq('project_id',projectId).eq('measurement_round','Naver').order('id',{ascending:false}).limit(5):{data:[],error:null}
  if(naver.error)throw Error('계약 범위 내 네이버 근거 조회 실패')
  const assets=await s.from('discovery_analysis_history').select('observed,created_at').eq('project_id',projectId).eq('measurement_round','Channel Inventory').order('id',{ascending:false}).limit(1).maybeSingle()
  if(assets?.error)throw Error('고객 채널 정보 조회 실패')
  const journeys=await selectionJourneys(s,projectId)
  const inputContext=await projectContext(s,projectId)
  const coverage=(b??[]).map(q=>({questionId:q.id,missingChannels:[...new Set((m??[]).filter(x=>x.question_id===q.id).map(x=>x.channel))].filter(channel=>!latest.has(`${q.id}:${channel}`))}))
  const cycleContext={kind:'measurement-cycle',...cycle,coverage}
  const prompt=`이번 분석은 프로젝트 ${cycle.round}차 정기 측정 종합 분석이다. 기준일 ${cycle.base}, 회차 시작일 ${cycle.start}. 최신 회차에 없는 채널은 미측정으로 표시하고 미발견으로 간주하지 마라. 측정 시각이 다르면 명시하라. 이전 회차 기록은 비교용으로만 사용하라. 채널별 공통 관찰과 차이를 근거로 통합 개선안을 제안하라. 회차별 미측정 채널: ${JSON.stringify(coverage)}\n`+day0ReviewPrompt({assets,comparisonInstructions,comparisonMode,engagement,relationships,priorTasks,nextTasks,naver,p,rows,hasNaver,journeys})
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-5.5',input:prompt})})
  const raw=await r.json();if(!r.ok)return NextResponse.json({error:raw?.error?.message||'OpenAI 분석 오류'},{status:502})
  const text=(raw.output??[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('\n').trim()
  if(!text)return NextResponse.json({error:'분석 결과를 찾지 못했습니다.'},{status:502})
  return NextResponse.json({ok:true,analysis:text,measurementRound:comparisonMode?'Comparison':'Day 0',observed:[...(comparisonMode?comparison:rows),cycleContext,inputContext],comparableCount,benchmarkCount:(b??[]).length,measurementCount:rows.reduce((count,x)=>count+x.measurements.length,0)})
 }catch(e:any){return NextResponse.json({error:e?.message||'분석 중 오류가 발생했습니다.'},{status:500})}
}
