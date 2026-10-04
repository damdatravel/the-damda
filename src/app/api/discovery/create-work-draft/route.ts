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
  if(!body?.title||!body?.action)return NextResponse.json({error:'승인된 개선 과제 정보가 없습니다.'},{status:400})
  const s=createClient(url,key)
  const {data:p,error}=await s.from('discovery_projects').select('name,website_url,industry,main_services,target_customer,service_area,description').eq('id',projectId).single()
  if(error)return NextResponse.json({error:error.message},{status:500})
  const previous=await s.from('discovery_improvement_tasks').select('title,status,summary,work_details').eq('project_id',projectId)
  if(previous.error)return NextResponse.json({error:'기존 작업을 확인하지 못했습니다.'},{status:500})
  const prompt=`너는 담다 디스커버리의 실행 작업 설계자다.
회사 정보: ${JSON.stringify(p)}
이미 진행한 작업: ${JSON.stringify(previous.data||[])}
승인된 개선 과제:
제목: ${body.title}
이유: ${body.reason||''}
할 일: ${body.action}
기대 변화: ${body.expected||'확인 필요'}
재측정 조건: ${body.remeasure||'동일 질문·채널 재측정'}

이 과제를 실행하기 전에 대표가 검토할 수 있는 작업 초안을 작성하라.
먼저 운영·측정·사실 확인 과제인지 홈페이지 수정·콘텐츠 제작 과제인지 구분하라. 재측정 조건 합의, 질문 검토, 측정 실행, 출처 확인 과제는 내부 운영 절차로 작성하라. 이를 설명하는 신규 홈페이지 페이지 제작으로 바꾸지 마라. 기존 완료 작업은 새로 제작하라고 반복하지 마라. 확인 자료가 부족하면 실행 전 확인 단계로 두고, 없는 결함을 만들어내지 마라. 외부 제작사 작업이 필요하지 않은 과제는 제작사 요청서 항목에 '외부 제작 요청 없음'이라고 명시하라.
아직 코드를 수정하거나 홈페이지에 게시하지 않는다.
전문용어는 꼭 필요한 경우에만 쓰고 바로 쉬운 설명을 붙여라.
회사 정보에 없는 서비스, 실적, 수치, 보장 문구를 만들지 마라.
다음 형식만 한국어로 출력하라.

[작업 목적]
2~3문장

[작업 유형과 실행 대상]
- 작업 유형: 운영·측정·확인 또는 홈페이지 수정·콘텐츠 제작
- 실행 대상: 질문·채널·측정 기록 또는 실제 페이지/영역
- 필요한 자료:

[실행 순서]
1. ...
2. ...
3. ...

[실행 자료 초안]
운영·측정·확인은 체크리스트와 기록 양식, 홈페이지 수정·콘텐츠 제작은 필요한 문구만 작성

[기술 확인]
- 실제 적용 전에 확인할 항목만 작성
- 이미 적용됐는지 확인하지 않은 것은 "확인 필요"라고 표시

[제작사에 전달할 작업 요청서]
- 대상 페이지·영역과 변경 요청
- 필요한 자료·관리자 권한·플랫폼 제약: 확인 필요 항목 구분
- 완료 확인 방법과 적용 증빙 URL
- 근거가 부족한 경우 수정 전에 확인할 일

[재측정 계획]
- 승인된 조건을 바탕으로 같은 질문·채널·조건 유지
- 변화가 없을 때 재검토할 가설

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
