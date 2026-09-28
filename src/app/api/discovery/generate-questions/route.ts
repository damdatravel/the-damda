import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'
import {createHash} from 'node:crypto'

const intents=new Set(['문제 인식 → 해결 탐색','발견/서비스 탐색','비교/선택 탐색','가격/조건 탐색','이용/예약 탐색'])
type Dimension={id:number;dimension_type:string;dimension_value:string}

export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>({})),projectId=Number(body.projectId),count=Math.min(24,Math.max(6,Number(body.count)||12))
  if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY,apiKey=process.env.OPENAI_API_KEY
  if(!url||!publishable||!secret||!apiKey)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
  const token=cookies().get('damda_staff_token')?.value
  if(!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:user,error:authError}=await auth.auth.getUser(token)
  if(authError||!user.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const s=createClient(url,secret,{auth:{persistSession:false}})
  const [{data:project,error:pe},{data:rows,error:de}]=await Promise.all([
   s.from('discovery_projects').select('id,name,industry,main_services,target_customer,service_area,description').eq('id',projectId).maybeSingle(),
   s.from('discovery_question_dimensions').select('id,dimension_type,dimension_value').eq('project_id',projectId).eq('is_active',true).order('priority',{ascending:false}).limit(60)
  ])
  if(pe||de||!project)return NextResponse.json({error:pe?.message||de?.message||'프로젝트를 찾지 못했습니다.'},{status:404})
  const dimensions=(rows??[]) as Dimension[]
  if(!dimensions.some(x=>x.dimension_type==='SERVICE')||dimensions.length<2)return NextResponse.json({error:'활성 서비스 재료와 다른 질문 재료가 필요합니다.'},{status:422})
  const prompt=`너는 다양한 업종의 소비자가 검색과 AI 서비스에 직접 물어볼 법한 한국어 질문 후보를 만드는 편집자다. 아래 프로젝트 설명은 맥락일 뿐이며, 사실과 조건은 검토된 질문 재료에 있는 것만 사용한다.
프로젝트: ${JSON.stringify(project)}
검토된 재료: ${JSON.stringify(dimensions)}
${count}개 후보를 JSON 객체 {"questions":[{"question":"...","intent":"발견/서비스 탐색","ingredientIds":[1,2,3]}]} 형식으로만 반환한다.
규칙: 업종과 고객 상황에 맞게 질문을 쓴다. 광고 문구를 반복하거나 서비스명 전체를 모든 질문 앞에 붙이지 않는다. 의미가 다른 질문을 만들고 같은 의도의 바꿔 쓰기는 피한다. 발견, 문제 해결, 비교, 가격/조건, 이용/예약 중 실제 자료와 관련 있는 의도를 골고루 다룬다. 가격/예약 방식/가능 여부는 자료에 없는 사실로 단정하지 않고 물음으로만 표현한다. 사업자를 찾는 고객의 질문이어야 하며 검색 노출 상담사의 고민을 다른 업종 고객의 고민으로 혼동하지 않는다. 서비스는 제공된 SERVICE에서 고르고 장소·시간·고객 등 구체적인 조건이 있으면 해당 재료의 id를 연결한다. 질문마다 서로 다른 종류의 재료 2개 이상을 사용한다. 장소·시간이 없어도 지어내지 않는다. ingredientIds는 반드시 실제 재료 id만 사용한다. 가능한 의도: ${[...intents].join(', ')}.`
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-5.5',input:prompt})})
  const raw=await response.json()
  if(!response.ok)return NextResponse.json({error:raw?.error?.message||'질문 생성 오류'},{status:502})
  const text=(raw.output??[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('').trim()
  let parsed:any
  try{parsed=JSON.parse(text.replace(/^```(?:json)?\s*|```$/g,'').trim())}catch{return NextResponse.json({error:'질문 생성 결과를 읽을 수 없습니다.'},{status:502})}
  const byId=new Map(dimensions.map(x=>[x.id,x])),seen=new Set<string>()
  const questions=(Array.isArray(parsed.questions)?parsed.questions:[]).flatMap((item:any)=>{
   if(typeof item.question!=='string'||!intents.has(item.intent)||!Array.isArray(item.ingredientIds))return []
   const question=item.question.trim().replace(/\s+/g,' ')
   const ingredients=[...new Set(item.ingredientIds.filter((id:unknown)=>Number.isInteger(id)))].map(id=>byId.get(id as number)).filter(Boolean) as Dimension[]
   if(question.length<12||question.length>170||!question.endsWith('?')||!ingredients.some(x=>x.dimension_type==='SERVICE')||new Set(ingredients.map(x=>x.dimension_type)).size<2||seen.has(question))return []
   seen.add(question)
   return [{question,intent:item.intent,mode:ingredients.length>=3?'상황 질문':'기본 질문',ingredients,combinationKey:ingredients.map(x=>x.dimension_type+':'+x.id).sort().join('|')+'|q:'+createHash('sha256').update(question).digest('hex').slice(0,16)}]
  }).slice(0,count)
  if(!questions.length)return NextResponse.json({error:'검토된 재료로 유효한 질문을 만들지 못했습니다. 질문 재료를 확인해 주세요.'},{status:422})
  return NextResponse.json({questions})
 }catch(e:any){return NextResponse.json({error:e?.message||'질문 생성 중 오류가 발생했습니다.'},{status:500})}
}
