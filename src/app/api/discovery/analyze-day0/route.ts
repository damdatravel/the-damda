import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'
export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>({}))
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
   s.from('discovery_projects').select('name,website_url,industry,main_services,target_customer,service_area,description').eq('id',projectId).single(),
   s.from('discovery_questions').select('id,question').eq('project_id',projectId).eq('is_benchmark',true).order('id'),
   s.from('discovery_measurements').select('question_id,channel,is_discovered,result_text,source_urls,created_at').eq('project_id',projectId).eq('measurement_round','Day 0').order('created_at',{ascending:false})
  ])
  if(me)return NextResponse.json({error:me.message},{status:500})
  if(!p)return NextResponse.json({error:'프로젝트를 찾지 못했습니다.'},{status:404})
  const latest=new Map<string,any>();for(const x of m??[]){const key=`${x.question_id}:${x.channel}`;if(!latest.has(key))latest.set(key,x)}
  const rows=(b??[]).map(q=>({question:q.question,measurements:[...latest.entries()].filter(([key])=>key.startsWith(`${q.id}:`)).map(([,value])=>value)}))
  if(!rows.length||!rows.some(x=>x.measurements.length))return NextResponse.json({error:'Benchmark의 Day 0 측정 기록이 필요합니다.'},{status:400})
  const prompt=`너는 검색·AI 발견 개선 분석가다. 다음은 회사 정보와 고정 Benchmark 질문의 Day 0 채널별 측정 결과다. 채널마다 검색 방식과 결과가 다르므로 채널을 구분해서 해석하라.
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
  return NextResponse.json({ok:true,analysis:text,observed:rows,benchmarkCount:(b??[]).length,measurementCount:rows.reduce((count,x)=>count+x.measurements.length,0)})
 }catch(e:any){return NextResponse.json({error:e?.message||'분석 중 오류가 발생했습니다.'},{status:500})}
}
