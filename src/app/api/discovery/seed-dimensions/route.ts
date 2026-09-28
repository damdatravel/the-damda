import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'

const types=new Set(['WHO','FOR_WHOM','WHERE','WHEN','SERVICE','PURPOSE','PROBLEM','CONDITION','PREFERENCE','URGENCY','ACTION'])
type Ingredient={type:string;value:string;source:'project'|'inquiry'|'website';evidence:string}

export async function POST(req:Request){
 try{
  const {projectId}=await req.json().catch(()=>({})),id=Number(projectId)
  if(!Number.isInteger(id)||id<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,apiKey=process.env.OPENAI_API_KEY
  if(!url||!key||!apiKey)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
  const token=cookies().get('damda_staff_token')?.value,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!token||!publishable)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:user,error:authError}=await auth.auth.getUser(token)
  if(authError||!user.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const s=createClient(url,key,{auth:{persistSession:false}})
  const {data:project,error:pe}=await s.from('discovery_projects').select('id,name,website_url,industry,main_services,target_customer,service_area,description').eq('id',id).single()
  if(pe||!project)return NextResponse.json({error:pe?.message||'프로젝트를 찾지 못했습니다.'},{status:404})
  const {data:inquiry,error:ie}=await s.from('discovery_inquiries').select('id,concerns,message,main_services,industry').eq('project_id',id).order('id',{ascending:false}).limit(1).maybeSingle()
  if(ie)return NextResponse.json({error:ie.message},{status:500})
  const {data:report,error:re}=inquiry?await s.from('discovery_diagnosis_reports').select('website_snapshot').eq('inquiry_id',inquiry.id).maybeSingle():{data:null,error:null}
  if(re)return NextResponse.json({error:re.message},{status:500})
  const snapshot:any=report?.website_snapshot||{}
  const pages=(Array.isArray(snapshot.pages)?snapshot.pages:[]).filter((p:any)=>!p.error).slice(0,8).map((p:any)=>({url:p.url,title:p.title,description:p.description,h1:p.h1,textSample:p.textSample}))
  if(!pages.length&&project.website_url){
   try{
    const target=new URL(project.website_url)
    if(target.protocol==='https:'&&!/^(localhost|\d+\.\d+\.\d+\.\d+)$/.test(target.hostname)){
     const response=await fetch(target,{signal:AbortSignal.timeout(8000),headers:{'User-Agent':'TheDamdaDiscovery/1.0'},cache:'no-store'})
     if(response.ok){const html=(await response.text()).slice(0,150000),clean=(s:string)=>s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();pages.push({url:response.url,title:clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),h1:clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||''),textSample:clean(html).slice(0,7000)})}
    }
   }catch{}
  }
  const evidence={project,inquiry:inquiry?{concerns:inquiry.concerns,message:inquiry.message,main_services:inquiry.main_services,industry:inquiry.industry}:null,pages}
  const prompt=`상담 정보와 실제 홈페이지 진단에서 AI Source Profile의 질문 재료를 추출한다. JSON 객체 {"ingredients":[{"type":"WHO","value":"...","source":"project","evidence":"원문 일부"}]}만 반환한다. 허용 type: ${[...types].join(', ')}. source는 project, inquiry, website 중 하나다. value는 해당 source 원문에서 직접 확인되는 구체적 사실이고 evidence는 이를 뒷받침하는 짧은 원문이어야 한다. 홈페이지 URL만 있고 페이지 내용이 없으면 website를 사용하지 마라. WHO는 서비스를 찾는 사람, FOR_WHOM은 서비스 대상, WHERE는 실제 서비스 장소, WHEN은 시간/시기, SERVICE는 제공 서비스, PURPOSE는 소비자의 목적, PROBLEM은 소비자의 문제, CONDITION/PREFERENCE/URGENCY는 소비자가 명시한 조건/선호/긴급성, ACTION은 소비자의 실제 행동이다. SEO/GEO 개선 제안이나 상담사의 진단 의견을 소비자 목적·문제로 오인하지 마라. 확인되지 않은 항목은 비워 두어라. 자료: ${JSON.stringify(evidence)}`
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-5.5',input:prompt})})
  const raw=await response.json()
  if(!response.ok)return NextResponse.json({error:raw?.error?.message||'질문 재료 분석 오류'},{status:502})
  const text=(raw.output??[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('').trim()
  let parsed:any
  try{parsed=JSON.parse(text.replace(/^```(?:json)?\s*|```$/g,'').trim())}catch{return NextResponse.json({error:'AI Source Profile 형식을 읽을 수 없습니다.'},{status:502})}
  const sources={project:JSON.stringify(project),inquiry:JSON.stringify(evidence.inquiry),website:JSON.stringify(pages)}
  const ingredients:Ingredient[]=(Array.isArray(parsed.ingredients)?parsed.ingredients:[]).filter((x:any)=>types.has(x.type)&&['project','inquiry','website'].includes(x.source)&&typeof x.value==='string'&&typeof x.evidence==='string'&&x.value.trim().length>1&&x.evidence.trim().length>1&&sources[x.source as keyof typeof sources].includes(x.evidence.trim())).slice(0,60).map((x:any)=>({type:x.type,value:x.value.trim().slice(0,150),source:x.source,evidence:x.evidence.trim().slice(0,220)}))
  if(!ingredients.length)return NextResponse.json({error:'근거가 확인된 질문 재료가 없습니다. 상담 정보나 홈페이지 진단을 확인해 주세요.'},{status:422})
  const {data:existing,error:ee}=await s.from('discovery_question_dimensions').select('dimension_type,dimension_value').eq('project_id',id)
  if(ee)return NextResponse.json({error:ee.message},{status:500})
  const keys=new Set((existing??[]).map((x:any)=>`${x.dimension_type}|${x.dimension_value}`))
  const fresh=ingredients.filter(x=>{const k=`${x.type}|${x.value}`;if(keys.has(k))return false;keys.add(k);return true}).map((x,i)=>({project_id:id,dimension_type:x.type,dimension_value:x.value,priority:100-i,is_active:true,source:x.source,notes:`AI Source Profile · 근거: ${x.evidence}`}))
  if(fresh.length){const {error}=await s.from('discovery_question_dimensions').insert(fresh);if(error)return NextResponse.json({error:error.message},{status:500})}
  return NextResponse.json({ok:true,added:fresh.length,total:(existing?.length??0)+fresh.length,profile:ingredients})
 }catch(e:any){return NextResponse.json({error:e?.message||'질문 재료 분석 중 오류가 발생했습니다.'},{status:500})}
}
