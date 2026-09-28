import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export async function POST(req:Request){
 try{
  const apiKey=process.env.OPENAI_API_KEY
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!apiKey||!url||!key)return NextResponse.json({error:'API 환경변수를 확인해 주세요.'},{status:500})
  const body=await req.json()
  const projectId=Number(body?.projectId)
  if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
  if(!body?.title||!body?.action)return NextResponse.json({error:'승인된 개선 과제 정보가 없습니다.'},{status:400})
  const s=createClient(url,key)
  const {data:p,error}=await s.from('discovery_projects').select('name,website_url,industry,main_services,target_customer,service_area,description').eq('id',projectId).single()
  if(error)return NextResponse.json({error:error.message},{status:500})
  const prompt=`너는 The Damda Discovery의 실행 작업 설계자다.
회사 정보: ${JSON.stringify(p)}
승인된 개선 과제:
제목: ${body.title}
이유: ${body.reason||''}
할 일: ${body.action}

이 과제를 실제 홈페이지 작업으로 옮기기 전에 대표가 검토할 수 있는 "작업 초안"을 작성하라.
아직 코드를 수정하거나 홈페이지에 게시하지 않는다.
전문용어는 꼭 필요한 경우에만 쓰고 바로 쉬운 설명을 붙여라.
회사 정보에 없는 서비스, 실적, 수치, 보장 문구를 만들지 마라.
다음 형식만 한국어로 출력하라.

[작업 목적]
2~3문장

[만들거나 수정할 것]
- 페이지/영역:
- 제안 URL:
- 핵심 내용:

[페이지 구성 초안]
1. ...
2. ...
3. ...

[실제 문구 초안]
홈페이지에 들어갈 제목과 핵심 본문을 작성

[기술 확인]
- 실제 적용 전에 확인할 항목만 작성
- 이미 적용됐는지 확인하지 않은 것은 "확인 필요"라고 표시

[최종 승인 전 체크]
- 대표가 확인해야 할 사업적 사실과 표현
`
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-5.5',input:prompt})})
  const raw=await r.json()
  if(!r.ok)return NextResponse.json({error:raw?.error?.message||'OpenAI 작업 초안 오류'},{status:502})
  const draft=(raw.output??[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('\n').trim()
  if(!draft)return NextResponse.json({error:'작업 초안을 찾지 못했습니다.'},{status:502})
  return NextResponse.json({ok:true,draft})
 }catch(e:any){return NextResponse.json({error:e?.message||'작업 초안 생성 중 오류가 발생했습니다.'},{status:500})}
}
