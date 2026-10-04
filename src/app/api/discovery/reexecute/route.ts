import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {POST as initializeWorkflow} from '../improvement-workflow/route'
import {POST as analyze} from '../analyze-day0/route'
import {POST as explore} from '../naver-explore/route'
import {POST as analyzeNaver} from '../analyze-naver/route'
import {projectContext} from '../../../../lib/discovery/contextStore'
import {contextImpact} from '../../../../lib/discovery/contextVersion'
import {runKey,reserveRun,EngineRun} from '../../../../lib/discovery/reexecution'
export const maxDuration=300
export async function POST(req:Request){
 const token=cookies().get('damda_staff_token')?.value,url=process.env.NEXT_PUBLIC_SUPABASE_URL,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!token||!url||!pub||!key)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const user=await createClient(url,pub).auth.getUser(token);if(user.error||!user.data.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const s=createClient(url,key),b=await req.json().catch(()=>({})),projectId=Number(b.projectId),sourceId=Number(b.sourceId)
 if(!Number.isSafeInteger(projectId)||projectId<1||!Number.isSafeInteger(sourceId)||sourceId<1)return NextResponse.json({error:'프로젝트와 원본 분석을 확인해 주세요.'},{status:400})
 const read=()=>s.from('discovery_analysis_history').select('id,observed,measurement_round').eq('project_id',projectId).eq('id',sourceId).in('measurement_round',['Day 0','Comparison','Naver']).single()
 const source=await read();if(source.error)return NextResponse.json({error:'분석 원본 조회 실패'},{status:404})
 let reserved:EngineRun|undefined
 // Compare both mutable envelopes; neither workflow edits nor another run may be overwritten.
 const save=async(row:any,runs:EngineRun[])=>{const observed=row.observed||[],idx=observed.findIndex((x:any)=>x.kind==='engine-runs'),old=idx>=0?observed[idx]:null,next={kind:'engine-runs',revision:(old?.revision||0)+1,runs},out=idx>=0?observed.map((x:any,i:number)=>i===idx?next:x):[...observed,next];let q=s.from('discovery_analysis_history').update({observed:out}).eq('project_id',projectId).eq('id',sourceId);q=old?q.eq(`observed->${idx}->>revision`,String(old.revision)):q.is(`observed->${observed.length}`,'null');const wi=observed.findIndex((x:any)=>x.kind==='improvement-workflow');if(wi>=0)q=q.eq(`observed->${wi}->workflow->>revision`,String(observed[wi].workflow.revision));const result=await q.select('id').maybeSingle();if(result.error||!result.data)throw Error('실행 기록이 동시에 변경되었습니다. 새로고침 후 확인해 주세요.')}
 try{
 const context=await projectContext(s,projectId),impact=contextImpact(source.data.observed||[],context)
 if(impact.changed.includes('questions'))return NextResponse.json({error:'벤치마크 질문이 변경되었습니다. 질문을 검토하고 해당 질문을 새로 측정한 뒤 분석해 주세요.'},{status:409})
 const runs=(source.data.observed||[]).find((x:any)=>x.kind==='engine-runs')?.runs||[],reservation=reserveRun(runs,runKey(sourceId,context),b.retry===true)
 if(reservation.reused)return NextResponse.json({ok:true,reused:true,run:reservation.reused})
 await save(source.data,reservation.runs!);reserved=reservation.run;
 const request=(body:any)=>new Request(req.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
 let resultId:number
 if(source.data.measurement_round==='Naver'){
 const raw=source.data.observed?.[0],codes:Record<string,string>={'웹문서':'webkr','블로그':'blog','카페글':'cafearticle','지역':'local'},channels=(raw?.results||[]).map((x:any)=>codes[x.channel]).filter(Boolean)
 if(!channels.length)throw Error('자동 재조회할 채널이 없습니다. 네이버 관리 화면에서 조회 조건을 선택해 주세요.')
 const response=await explore(request({projectId,query:raw.query,channels,trend:!!raw.trend,shoppingCategory:raw.shopping?.category||''})),report=await response.json();if(!response.ok)throw Error(report.error)
 if(report.results.some((x:any)=>x.error)||report.trend?.error||report.shopping?.error)throw Error('일부 네이버 채널 조회가 실패했습니다. 오류를 확인하고 재시도해 주세요.')
 const r=await analyzeNaver(request({projectId,report})),j=await r.json();if(!r.ok)throw Error(j.error);resultId=j.history.id
 }else{
 const response=await analyze(request({projectId,mode:source.data.measurement_round==='Comparison'?'comparison':'baseline'})),j=await response.json();if(!response.ok)throw Error(j.error)
 const stored=await s.from('discovery_analysis_history').insert({project_id:projectId,measurement_round:j.measurementRound,observed:j.observed,interpreted:j.analysis}).select('id').single();if(stored.error)throw Error('새 분석 저장 실패');resultId=stored.data.id
 }
 reserved={...reserved!,resultId};
 const latest=await read();if(latest.error)throw Error('실행 완료 기록 조회 실패');const updated=(latest.data.observed||[]).find((x:any)=>x.kind==='engine-runs')?.runs||[]
 const linked=await initializeWorkflow(request({projectId,sourceId:resultId,action:'init'}));const linkResult=await linked.json()
 const finished:EngineRun={...reserved!,status:'completed',finishedAt:new Date().toISOString(),resultId,...(!linked.ok?{error:'분석 저장 완료 · 과제 연결 확인 필요: '+linkResult.error}:{})};await save(latest.data,updated.map((x:EngineRun)=>x.key===reserved!.key?finished:x));return NextResponse.json({ok:true,run:finished})
 }catch(e){const message=e instanceof Error?e.message:'재실행 실패';if(reserved){const latest=await read();if(!latest.error){const runs=(latest.data.observed||[]).find((x:any)=>x.kind==='engine-runs')?.runs||[];if(runs.some((x:EngineRun)=>x.key===reserved!.key&&x.status==='running')){try{await save(latest.data,runs.map((x:EngineRun)=>x.key===reserved!.key?{...x,status:reserved!.resultId?'completed':'failed',resultId:reserved!.resultId,finishedAt:new Date().toISOString(),error:message}:x))}catch{}}}}return NextResponse.json({error:message},{status:409})}
}
