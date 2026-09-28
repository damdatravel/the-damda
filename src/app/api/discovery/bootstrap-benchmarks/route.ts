import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
function strip(html:string){return html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,12000)}
export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>({})),projectId=Number(body.projectId)
  if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,apiKey=process.env.OPENAI_API_KEY
  if(!url||!key||!apiKey)return NextResponse.json({error:'서버 환경변수를 확인해 주세요.'},{status:500})
  const s=createClient(url,key,{auth:{persistSession:false}})
  const {data:p,error:pe}=await s.from('discovery_projects').select('id,name,website_url,industry,main_services,target_customer,service_area,description').eq('id',projectId).single()
  if(pe||!p)return NextResponse.json({error:pe?.message||'프로젝트를 찾지 못했습니다.'},{status:404})
  const {data:existing,error:ee}=await s.from('discovery_questions').select('id,question').eq('project_id',projectId).eq('is_benchmark',true)
  if(ee)return NextResponse.json({error:ee.message},{status:500})
  if(existing?.length)return NextResponse.json({ok:true,reused:true,count:existing.length})
  let websiteText=''
  if(p.website_url){try{const r=await fetch(p.website_url,{headers:{'User-Agent':'Mozilla/5.0 TheDamdaDiscovery/1.0'},signal:AbortSignal.timeout(10000)});if(r.ok)websiteText=strip(await r.text())}catch{}}
  const prompt=`너는 검색·AI 발견 측정용 Benchmark 질문 설계자다.
프로젝트 정보: ${JSON.stringify(p)}
공개 홈페이지에서 읽은 텍스트: ${websiteText||'확인하지 못함'}
이 업체를 모르는 실제 잠재고객이 검색엔진이나 AI에게 자연스럽게 물을 법한 한국어 질문 5개를 만든다.
브랜드명이나 도메인을 질문에 넣지 않는다. 현재 홈페이지가 이미 잘 되어 있다고 가정하지 않는다.
서비스 탐색, 지역/상황, 비교/선택, 문제 해결 의도를 섞고 서로 의미가 겹치지 않게 한다.
측정 전후 비교를 위해 오래 유지할 수 있는 질문이어야 한다.
JSON 배열만 출력한다. 예: ["질문1","질문2","질문3","질문4","질문5"]`
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-5.5',input:prompt})})
  const raw=await r.json();if(!r.ok)return NextResponse.json({error:raw?.error?.message||'Benchmark 생성 오류'},{status:502})
  const text=(raw.output??[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('\n').trim()
  let questions:string[]=[];try{questions=JSON.parse(text.replace(/^\`\`\`json\s*|\`\`\`$/g,'').trim())}catch{}
  questions=questions.filter(x=>typeof x==='string'&&x.trim().length>8).map(x=>x.trim()).slice(0,5)
  if(questions.length<3)return NextResponse.json({error:'Benchmark 질문을 충분히 생성하지 못했습니다.'},{status:502})
  const rows=questions.map((question,i)=>({project_id:projectId,question,intent:'신규 프로젝트 자동 Benchmark',dimension_count:0,combination_key:`project-${projectId}-benchmark-${i+1}`,is_duplicate:false,is_benchmark:true,status:'saved',notes:'프로젝트 시작 자동 생성'}))
  const {data:saved,error:ie}=await s.from('discovery_questions').insert(rows).select('id,question')
  if(ie)return NextResponse.json({error:ie.message},{status:500})
  return NextResponse.json({ok:true,count:saved?.length??0,questions:saved??[]})
 }catch(e:any){return NextResponse.json({error:e?.message||'Benchmark 생성 중 오류가 발생했습니다.'},{status:500})}
}