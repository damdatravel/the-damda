import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>({}))
  const projectId=Number(body.projectId)
  if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
  const apiKey=process.env.OPENAI_API_KEY,url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!apiKey||!url||!key)return NextResponse.json({error:'API 환경변수를 확인해 주세요.'},{status:500})
  const s=createClient(url,key)
  const [{data:p},{data:b},{data:m,error:me}]=await Promise.all([
   s.from('discovery_projects').select('name,website_url,industry,main_services,target_customer,service_area,description').eq('id',projectId).single(),
   s.from('discovery_questions').select('id,question').eq('project_id',projectId).eq('is_benchmark',true).order('id'),
   s.from('discovery_measurements').select('question_id,channel,is_discovered,result_text,source_urls,created_at').eq('project_id',projectId).eq('channel','OpenAI Web Search API').eq('measurement_round','Day 0').order('created_at',{ascending:false})
  ])
  if(me)return NextResponse.json({error:me.message},{status:500})
  const latest=new Map<number,any>();for(const x of m??[])if(!latest.has(Number(x.question_id)))latest.set(Number(x.question_id),x)
  const rows=(b??[]).map(q=>({question:q.question,measurement:latest.get(Number(q.id))??null}))
  const prompt=`너는 검색·AI 발견 개선 분석가다. 다음은 회사 정보와 고정 Benchmark 질문의 Day 0 OpenAI Web Search 측정 결과다.
회사: ${JSON.stringify(p)}
측정: ${JSON.stringify(rows)}
목표는 "왜 이 회사가 현재 답변에서 발견되지 않는지"를 증거 기반으로 분석하고, 공개 홈페이지에서 개선할 정보 구조를 제안하는 것이다.
측정 결과에 없는 사실을 지어내지 말고, 검색 노출을 보장한다고 표현하지 마라.
한국어로 다음 형식만 출력하라.
[요약]
3~5문장
[공통 부족정보]
- ...
[우선 개선안]
1. 제목 | 이유 | 홈페이지에서 할 일
2. ...
최대 7개
[Benchmark별 관찰]
- 질문 요약 | 현재 관찰 | 필요한 정보
[주의]
측정 한계와 재측정 시 같은 Benchmark를 유지해야 한다는 점을 짧게 적어라.`
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-5.5',input:prompt})})
  const raw=await r.json();if(!r.ok)return NextResponse.json({error:raw?.error?.message||'OpenAI 분석 오류'},{status:502})
  const text=(raw.output??[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('\n').trim()
  if(!text)return NextResponse.json({error:'분석 결과를 찾지 못했습니다.'},{status:502})
  return NextResponse.json({ok:true,analysis:text,benchmarkCount:(b??[]).length,measurementCount:rows.filter(x=>x.measurement).length})
 }catch(e:any){return NextResponse.json({error:e?.message||'분석 중 오류가 발생했습니다.'},{status:500})}
}
