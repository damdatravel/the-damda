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
  const latest=new Map<string,any>();for(const x of (m??[]).filter(x=>x.measurement_round==='Day 0')){const key=`${x.question_id}:${x.channel}`;if(!latest.has(key))latest.set(key,x)}
  const rows=(b??[]).map(q=>({question:q.question,measurements:[...latest.entries()].filter(([key])=>key.startsWith(`${q.id}:`)).map(([,value])=>value)}))
  if(!rows.length||!rows.some(x=>x.measurements.length))return NextResponse.json({error:'Benchmark의 Day 0 측정 기록이 필요합니다.'},{status:400})
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
  const prompt=`등록된 고객 채널·소유 확인 상태: ${JSON.stringify(assets?.data||null)}. confirmed는 직원이 확인한 관계이며 플랫폼 인증을 뜻하지 않는다. unconfirmed는 후보이며 공식 계정으로 단정하지 않는다. 기존 등록 채널과 콘텐츠를 먼저 검토하고 새 채널을 불필요하게 만들지 마라. URL 등록만으로 그 페이지 본문·품질·검색 노출을 확인한 것으로 간주하지 마라.
${comparisonInstructions}
너는 검색·AI 발견 개선 분석가다. 다음은 회사 정보와 고정 Benchmark 질문의 ${comparisonMode?'최초·최신 비교를 위한 기준':'Day 0'} 채널별 측정 결과다. 채널마다 검색 방식과 결과가 다르므로 채널을 구분해서 해석하라.
희망 검색 목표: ${JSON.stringify(engagement?.searchGoal)}
목표의 시작 상태·작업 기준·검색 결과 판단 기준: ${JSON.stringify(engagement?.criteria)}
기준에 필요한 측정이 부족하면 목표 성공·실패를 확정하지 말고 추가 확인을 제안하라.
직원 검토 후 확정된 고객 사업 사실: ${JSON.stringify(engagement?.confirmedFacts)}
희망 목표는 사업 사실이나 달성된 결과가 아니다. 목표에 필요한 정보와 측정 결과를 연결하고, 목표 달성 판단은 합의한 기준과 검토로 진행한다.
관계 근거: ${JSON.stringify(relationships)}
관계 자료가 있으면 approved의 서비스·대상·지역·조건 연결과 각 evidence의 출처·원문을 인용하여 질문별 필요한 정보를 비교한다. needsReview는 사실이 아니라 확인할 후보이며, 미확인 관계를 서비스 불가나 홈페이지의 확정된 누락으로 단정하지 않는다. 제공된 일부 원문만 확인했으므로 근거를 찾지 못한 것은 '확인 자료에서 미확인'으로 표현한다. 재료 변경으로 제외된 관계(staleCount)는 재검토를 제안한다. 관계 자료가 없으면 관계를 임의로 만들어내지 않는다.
기존 개선 작업: ${JSON.stringify(priorTasks.data||[])}
후속 개선 과제와 적용·재측정 검토: ${JSON.stringify(nextTasks)}
완료된 작업과 진행 중인 과제를 대조하라. 이미 구현한 페이지·안내·기술 설정을 새로 만들라고 반복 제안하지 마라. 같은 항목을 다시 제안할 때는 기존 작업과 무엇이 다르고 어떤 추가 근거로 필요한지 명시하라. 효과가 없다는 관찰만으로 기존 작업이 실패했다고 단정하지 마라. 먼저 질문이 고객 목표에 적합한지, 측정 오류인지, 채널 조건이 다른지 검토하라. 확인 자료가 부족한 것은 확인 과제로 제안하고 홈페이지의 실제 결함이라고 표현하지 마라. 기존 적용 후 변화가 없으면 새로운 원인 가설과 검증 방법을 제안하라. 원본 측정에 없는 날짜·인용·URL을 만들지 마라.
같은 고객의 선택 서비스 범위 내 네이버 다채널 진단: ${JSON.stringify(naver.data||[])}
홈페이지 외 블로그·지역 정보·상품 상세·외부 출처도 고객 목표와 확인 근거에 따라 검토한다. 신규 콘텐츠 작업은 기존 부족 정보와 연결하고, 필요 없는 채널·뉴스를 일괄 제안하지 마라. 제작·등록·게시 비용은 추가 견적 협의 대상이며 임의 금액을 만들지 마라.
회사: ${JSON.stringify(p)}
측정: ${JSON.stringify(rows)}
목표는 발견 여부와 실제 결과를 근거로 관찰 가능한 부족 정보를 찾고, 채널별로 확인할 일과 공개 홈페이지에서 할 일을 제안하는 것이다.
채널별 측정 성격: Naver Web API는 웹문서 검색 API 상위 20건으로 네이버 통합검색 화면의 순위나 수집·색인 상태를 증명하지 않는다. Naver Search는 직원이 입력한 통합검색 화면 기록이다. Naver AI Briefing은 실제 네이버 AI 브리핑 답변과 인용 출처를 직원이 기록한 별도 채널이다. Naver AI Shopping은 실제 네이버 쇼핑 AI 화면의 추천 상품·답변·출처를 기록한 채널이다. 일반 쇼핑 검색·광고·CLOVA Studio 응답과 합치지 마라. 상품 속성·가격·배송 조건·로그인·대화 맥락이 달라지면 비교 한계를 표시한다. AI 답변 미표시·판단 보류(null)는 업체 미발견(false)이나 실패로 집계하지 마라. 일반 검색 결과와 AI 답변을 합쳐 발견으로 판단하지 마라. 인용 출처에서 실제 확인된 업체·서비스·지역 정보만 근거로 개선 방향을 제안하고, 출처가 없으면 추정이라고 명시하라. Gemini는 Gemini API와 Google Search grounding, OpenAI Web Search API는 OpenAI Responses API이며 각각 소비자용 Gemini·ChatGPT 화면과 동일하지 않다. Perplexity API와 Claude API도 소비자 화면 기록과 구분한다. notes에 적힌 측정 방식과 한계를 확인하라.
${hasNaver?'네이버 측정이 있으므로 네이버 측정의 근거를 다른 채널과 구분해 분석하라. 사이트의 수집·색인 여부는 이 측정만으로 알 수 없으므로 필요한 경우 네이버 서치어드바이저의 소유확인·수집·색인 현황을 "확인할 일"로 제안하라. 사이트맵·robots.txt·고유한 제목과 설명·질문에 실제로 답하는 본문은 확인된 부족 정보가 있을 때만 수정 작업으로 제안하라. 웹문서 API 결과와 수동 통합검색 결과가 다르면 그 차이를 관찰로 기록하라.':'네이버 측정이 없으므로 네이버에서 발견되었거나 미발견되었다고 단정하지 말고, 네이버 전용 개선안을 억지로 만들지 마라.'}
측정 결과에 없는 사실을 지어내지 마라. 미발견을 곧바로 수집 실패나 콘텐츠 품질 문제로 단정하지 말고, 확인할 일과 확인된 수정 작업을 구분하라. 키워드 반복·순위 보장·대량 문서 생성은 권하지 마라.
한국어로 다음 형식만 출력하라.
[요약]
3~5문장
${comparisonMode?'[최초·최신 비교]\n- 질문 | 채널 | 최초 날짜·관찰 | 최신 날짜·관찰 | 변화 또는 비교 대기\n[목표 점검]\n- 합의한 기준 | 확인된 관찰 | 부족한 근거와 다음 확인':''}
[공통 부족정보]
- ...
[우선 개선안]
1. 제목 | 측정 근거·확인된 사실 또는 검증할 가설 | 확인 또는 홈페이지에서 할 일 | 기대하는 관찰 가능한 변화 | 재측정 질문·채널·조건
2. ...
최대 7개
[Benchmark별 관찰]
- 질문 요약 | 채널별 현재 관찰 | 필요한 확인 또는 정보
[주의]
API와 실제 화면의 차이, 수집·색인 미확인 상태, 재측정 시 같은 Benchmark를 유지해야 한다는 점을 해당할 때 짧게 적어라.`
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-5.5',input:prompt})})
  const raw=await r.json();if(!r.ok)return NextResponse.json({error:raw?.error?.message||'OpenAI 분석 오류'},{status:502})
  const text=(raw.output??[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('\n').trim()
  if(!text)return NextResponse.json({error:'분석 결과를 찾지 못했습니다.'},{status:502})
  return NextResponse.json({ok:true,analysis:text,measurementRound:comparisonMode?'Comparison':'Day 0',observed:comparisonMode?comparison:rows,comparableCount,benchmarkCount:(b??[]).length,measurementCount:rows.reduce((count,x)=>count+x.measurements.length,0)})
 }catch(e:any){return NextResponse.json({error:e?.message||'분석 중 오류가 발생했습니다.'},{status:500})}
}
