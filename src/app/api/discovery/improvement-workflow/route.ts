import {validAssessment,validAdditionalWork,naverComparable} from '../../../../lib/workPlan'
import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {proposals,readWorkflow,workflowReport,NextTask} from '../../../../lib/improvementWorkflow'
import {ensureCaseReport} from '../../../../lib/caseReport'
async function client(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY,token=cookies().get('damda_staff_token')?.value
 if(!url||!pub||!key||!token)return null
 const user=await createClient(url,pub,{auth:{persistSession:false}}).auth.getUser(token)
 return user.error||!user.data.user?null:createClient(url,key,{auth:{persistSession:false}})
}
export async function GET(req:Request){
 try{
 const s=await client();if(!s)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const projectId=Number(new URL(req.url).searchParams.get('projectId'));if(!Number.isSafeInteger(projectId)||projectId<1)return NextResponse.json({error:'프로젝트를 확인해 주세요.'},{status:400})
 const project=await s.from('discovery_projects').select('ai_management,naver_management').eq('id',projectId).single()
 if(project.error)return NextResponse.json({error:'프로젝트 조회 실패'},{status:404})
 const rounds=[...(project.data.ai_management?['Comparison','Day 0']:[]),...(project.data.naver_management?['Naver']:[])]
 const r=await s.from('discovery_analysis_history').select('id,observed,created_at,measurement_round').eq('project_id',projectId).in('measurement_round',rounds).order('id',{ascending:false}).limit(100)
 if(r.error)return NextResponse.json({error:'개선 과제 조회 실패'},{status:500})
 const inquiry=await s.from('discovery_inquiries').select('id').eq('project_id',projectId).in('status',['contracted','converted']).limit(1)
 return NextResponse.json({batches:(r.data||[]).flatMap(x=>{const workflow=readWorkflow(x.observed||[]);return workflow?[{sourceId:x.id,createdAt:x.created_at,sourceRound:x.measurement_round,references:(x.observed||[]).flatMap((r:any)=>r.measurements||[]).map((r:any)=>r.latest||r).filter((r:any)=>r.question_id&&r.channel),...workflow}]:[]}),inquiryId:inquiry.data?.[0]?.id||null,naverHistory:project.data.naver_management?await s.from('discovery_analysis_history').select('id,observed,created_at').eq('project_id',projectId).eq('measurement_round','Naver').order('id',{ascending:false}).limit(100).then(x=>{if(x.error)throw Error('네이버 재조회 기록 확인 실패');return (x.data||[]).map(row=>({...row,observed:(row.observed||[]).filter((v:any)=>v.kind!=='improvement-workflow')}))}):[]})
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'개선 과제 조회 실패'},{status:500})}
}
export async function POST(req:Request){
 try{
 const s=await client();if(!s)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const b=await req.json(),projectId=Number(b.projectId),sourceId=Number(b.sourceId)
 if(!Number.isSafeInteger(projectId)||projectId<1||!Number.isSafeInteger(sourceId)||sourceId<1)return NextResponse.json({error:'과제 원본을 확인해 주세요.'},{status:400})
 const r=await s.from('discovery_analysis_history').select('id,observed,interpreted,measurement_round').eq('project_id',projectId).eq('id',sourceId).in('measurement_round',['Comparison','Day 0','Naver']).single()
 if(r.error)return NextResponse.json({error:'원본 분석을 찾지 못했습니다.'},{status:404})
 const project=await s.from('discovery_projects').select('ai_management,naver_management').eq('id',projectId).single()
 if(project.error||!project.data||(r.data.measurement_round==='Naver'?!project.data.naver_management:!project.data.ai_management))return NextResponse.json({error:'선택 서비스 범위 밖의 분석입니다.'},{status:409})
 const observed=Array.isArray(r.data.observed)?r.data.observed:[],previous=readWorkflow(observed)
 if(b.action==='init'&&previous)return NextResponse.json({ok:true,workflow:previous})
 if(b.action!=='init'&&(!previous||b.revision!==previous.revision))return NextResponse.json({error:'다른 작업에서 변경되었습니다. 새로고침 후 확인해 주세요.'},{status:409})
 let tasks=previous?.tasks||proposals(r.data.interpreted,sourceId)
 if(!tasks.length)return NextResponse.json({error:'연결할 개선안이 없습니다. 분석 원문을 확인해 주세요.'},{status:400})
 if(b.action==='report'){
  const inquiry=await s.from('discovery_inquiries').select('id').eq('project_id',projectId).in('status',['contracted','converted']).limit(1)
  if(inquiry.error||!inquiry.data?.length)return NextResponse.json({error:'계약된 상담 연결이 없어 보고서에 저장할 수 없습니다.'},{status:409})
  const id=inquiry.data[0].id,row=await ensureCaseReport(s,id),text=workflowReport(tasks)
  if(!text)return NextResponse.json({error:'승인된 작업이 없습니다.'},{status:400})
  const start=`[개선 진행 · 분석 ${sourceId}]`,end=`[/개선 진행 · 분석 ${sourceId}]`,progress=String(row.draft?.progress||''),from=progress.indexOf(start),to=progress.indexOf(end,from)
  const rest=from>=0&&to>=from?progress.slice(0,from)+progress.slice(to+end.length):progress
  const next=await s.from('discovery_case_reports').update({draft:{...row.draft,progress:(rest.trim()+'\n\n'+start+'\n'+text+'\n'+end).trim()},updated_at:new Date().toISOString()}).eq('inquiry_id',id).eq('updated_at',row.updated_at).select('inquiry_id').maybeSingle()
  if(next.error||!next.data)return NextResponse.json({error:'보고서가 변경되었거나 저장에 실패했습니다. 다시 확인해 주세요.'},{status:409})
  return NextResponse.json({ok:true,inquiryId:id})
 }
 if(b.action==='update'){
 const i=tasks.findIndex(t=>t.id===b.taskId);if(i<0)return NextResponse.json({error:'과제를 찾지 못했습니다.'},{status:404})
 const t=tasks[i],p=b.patch||{}
 if(['applied','reviewed'].includes(t.status)&&Object.keys(p).some(k=>!['status','outcome'].includes(k)))return NextResponse.json({error:'적용 후에는 작업 정의를 변경할 수 없습니다. 새 과제로 검토해 주세요.'},{status:409})
 const allowed:Record<string,string[]>={pending:['approved','hold'],approved:['pending','hold','applied'],hold:['pending'],applied:['reviewed'],reviewed:[]}
 if(p.status&&p.status!==t.status&&!allowed[t.status].includes(p.status))return NextResponse.json({error:'과제 진행 순서를 확인해 주세요.'},{status:400})
 for(const k of ['title','reason','action','expected','remeasure','draft','reviewNote','application','outcome'])if(k in p&&(typeof p[k]!=='string'||p[k].length>20000))return NextResponse.json({error:'과제 내용이 올바르지 않습니다.'},{status:400})
 if('assessment' in p&&!validAssessment(p.assessment)||'additionalWork' in p&&p.additionalWork!==null&&!validAdditionalWork(p.additionalWork))return NextResponse.json({error:'작업 판단·견적 후보를 확인해 주세요.'},{status:400})
 if(('assessment' in p||'additionalWork' in p)&&(!p.draft||t.status!=='approved'))return NextResponse.json({error:'작업 판단은 승인된 과제의 초안과 함께 저장합니다.'},{status:409})
 const next={...t,...Object.fromEntries(['title','reason','action','expected','remeasure','draft','reviewNote','assessment','additionalWork','application','outcome','status'].filter(k=>k in p).map(k=>[k,p[k]])),updatedAt:new Date().toISOString()} as NextTask
 if(['title','reason','action','expected','remeasure'].some(k=>k in p&&p[k]!==t[k as keyof NextTask])){next.draft='';next.assessment={status:'needs_evidence',reason:'작업 정의가 변경되었습니다. 근거·수정안을 다시 준비해 주세요.'};next.additionalWork=null}
 if(!next.title.trim()||!next.action.trim())return NextResponse.json({error:'제목과 할 일을 입력해 주세요.'},{status:400})
 if(p.draft&&t.status!=='approved')return NextResponse.json({error:'승인된 과제에서만 초안을 저장할 수 있습니다.'},{status:409})
 if(next.additionalWork&&next.assessment?.status!=='ready')next.additionalWork=null
 if(p.status==='applied'){if(next.assessment&&next.assessment.status!=='ready')return NextResponse.json({error:'추가 근거 확인·보류 과제는 수정안을 다시 검토한 후 적용해 주세요.'},{status:409});if(!next.application.trim())return NextResponse.json({error:'실제 적용 내용과 URL을 기록해 주세요.'},{status:400});next.appliedAt=new Date().toISOString()}
 if(p.status==='reviewed'){
  if(!next.outcome.trim()||!Array.isArray(b.measurementIds)||!b.measurementIds.length||b.measurementIds.length>50)return NextResponse.json({error:'재측정 기록과 결과 해석을 선택해 주세요.'},{status:400})
  if(r.data.measurement_round==='Naver'){
   const history=await s.from('discovery_analysis_history').select('id,observed,created_at').eq('project_id',projectId).eq('measurement_round','Naver').in('id',b.measurementIds)
   if(history.error||history.data?.length!==new Set(b.measurementIds).size||!history.data.every(x=>naverComparable(r.data,x,t.appliedAt!)))return NextResponse.json({error:'적용 후 같은 검색어·정상 조회 채널의 네이버 진단 기록이 필요합니다.'},{status:400})
   next.naverHistoryIds=b.measurementIds
  }else{
  const mr=await s.from('discovery_measurements').select('id,question_id,channel,created_at').eq('project_id',projectId).in('id',b.measurementIds).gt('created_at',t.appliedAt!)
  const qm=await s.from('discovery_questions').select('id').eq('project_id',projectId).eq('is_benchmark',true)
  const evidence=observed.flatMap((x:any)=>x.measurements||[]).map((x:any)=>x.latest||x).filter((x:any)=>x.question_id&&x.channel)
  if(mr.error||qm.error||mr.data?.length!==new Set(b.measurementIds).size||mr.data.some(x=>!qm.data?.some(q=>q.id===x.question_id)||!evidence.some(e=>e.question_id===x.question_id&&e.channel===x.channel)))return NextResponse.json({error:'적용 후 같은 원본 Benchmark·채널로 측정한 기록이 필요합니다.'},{status:400})
  next.measurementIds=b.measurementIds
  }
 }
 tasks=tasks.map((x,n)=>n===i?next:x)
 }else if(b.action!=='init')return NextResponse.json({error:'지원하지 않는 작업입니다.'},{status:400})
 const workflow={revision:(previous?.revision||0)+1,tasks},audit=observed.find(x=>x?.kind==='improvement-workflow')?.audit||[],nextObserved=[...observed.filter(x=>x?.kind!=='improvement-workflow'),{kind:'improvement-workflow',workflow,audit:[...audit,{at:new Date().toISOString(),action:b.action,taskId:b.taskId||null,previous:previous||null}]}]
 const workflowIndex=observed.findIndex(x=>x?.kind==='improvement-workflow')
 let update=s.from('discovery_analysis_history').update({observed:nextObserved}).eq('id',sourceId).eq('project_id',projectId)
 update=previous?update.eq(`observed->${workflowIndex}->workflow->>revision`,String(previous.revision)):update.is(`observed->${observed.length}->workflow`,'null')
 const saved=await update.select('id').maybeSingle()
 if(saved.error||!saved.data)return NextResponse.json({error:'동시 변경 또는 저장 오류입니다. 새로고침 후 확인해 주세요.'},{status:409})
 return NextResponse.json({ok:true,workflow})
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'개선 과제 처리 실패'},{status:500})}
}
