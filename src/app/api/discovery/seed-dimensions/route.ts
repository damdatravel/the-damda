import {questionContextRules,contextIssue} from '../../../../lib/questionContext'
import {projectEngagement} from '../../../../lib/engagementStore'
import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'

const types=new Set(['WHO','FOR_WHOM','WHERE','WHEN','SERVICE','PURPOSE','PROBLEM','CONDITION','PREFERENCE','URGENCY','ACTION'])
type Ingredient={type:string;value:string;source:'project'|'inquiry'|'website';evidence:string}
function meaningful(x:Ingredient){
 const v=x.value.trim()
 if(x.type==='SERVICE'&&(/어디서든|어디로든|책임지는|함께하는|솔루션|서비스 제공/i.test(v)||/^(?:수거부터|처음부터)/.test(v)))return false
 if(x.type==='WHERE'&&/에서.+까지/.test(v)&&/[·,/]/.test(v))return false
 if(x.type==='WHEN'&&/^(?:당일|야간|새벽|주말|평일)$/.test(v)&&!/당일|야간|새벽|주말|평일/.test(x.evidence))return false
 return true
}

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
  let projectOrigin:string|null=null
  try{if(project.website_url)projectOrigin=new URL(project.website_url).origin}catch{}
  const pages=(Array.isArray(snapshot.pages)?snapshot.pages:[]).filter((p:any)=>{try{return !p.error&&projectOrigin&&new URL(p.url).origin===projectOrigin}catch{return false}}).slice(0,8).map((p:any)=>({url:p.url,title:p.title,description:p.description,h1:p.h1,textSample:p.textSample}))
  if(!pages.length&&project.website_url){
   try{
    const target=new URL(project.website_url)
    if(target.protocol==='https:'&&!/^(localhost|\d+\.\d+\.\d+\.\d+)$/.test(target.hostname)){
     const response=await fetch(target,{signal:AbortSignal.timeout(8000),headers:{'User-Agent':'TheDamdaDiscovery/1.0'},cache:'no-store'})
     if(response.ok){const html=(await response.text()).slice(0,150000),base=new URL(response.url),clean=(s:string)=>s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();pages.push({url:response.url,title:clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),h1:clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||''),textSample:clean(html).slice(0,3500)});
      const links=[...html.matchAll(/href=["']([^"'#]+)["']/gi)].flatMap(m=>{try{const u=new URL(m[1],base);return u.origin===base.origin&&/\/service|\/about|\/product|\/faq|\/서비스|\/소개/i.test(u.pathname)?[u.toString()]:[]}catch{return []}})
      for(const pageUrl of [...new Set(links)].slice(0,3)){try{const page=await fetch(pageUrl,{signal:AbortSignal.timeout(5000),cache:'no-store'});if(page.ok&&page.headers.get('content-type')?.includes('text/html')){const content=(await page.text()).slice(0,100000);pages.push({url:pageUrl,title:clean(content.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),h1:clean(content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||''),textSample:clean(content).slice(0,3500)})}}catch{}}
     }
    }
   }catch{}
  }
  const engagement=await projectEngagement(s,id)
  const evidence={project,inquiry:inquiry?{main_services:inquiry.main_services,industry:inquiry.industry,confirmedFacts:engagement?.confirmedFacts}:null,pages}
  const prompt=`${questionContextRules}\n고객 희망 검색 목표(사실 아님): ${JSON.stringify(engagement?.searchGoal)}. 고객이 답하고 직원이 검토한 confirmedFacts는 사업 사실의 별도 출처이며, source inquiry로 원문 그대로 연결한다. 희망 서비스·지역·조건은 검증된 사업 사실로 사용하지 않는다. 목표 관련 재료를 우선한다. 상담 정보와 실제 홈페이지 진단에서 AI Source Profile의 질문 재료를 추출한다. JSON 객체 {"ingredients":[{"type":"WHO","value":"...","source":"project","evidence":"원문 일부"}]}만 반환한다. 허용 type: ${[...types].join(', ')}. source는 project, inquiry, website 중 하나다. value는 해당 source 원문에서 직접 확인되는 구체적 사실이고 evidence는 이를 뒷받침하는 짧은 원문이어야 한다. 홈페이지 URL만 있고 페이지 내용이 없으면 website를 사용하지 마라. WHO는 서비스를 찾는 사람, FOR_WHOM은 서비스 대상, WHERE는 실제 서비스 장소, WHEN은 시간/시기, SERVICE는 제공 서비스, PURPOSE는 소비자의 목적, PROBLEM은 소비자의 문제, CONDITION/PREFERENCE/URGENCY는 소비자가 명시한 조건/선호/긴급성, ACTION은 소비자의 실제 행동이다. 프로젝트의 고객 서비스와 검색 노출 상담 자체를 구분하라. 짐 배송 프로젝트라면 '업체가 검색에 나오지 않음', '홈페이지 유입이 적음', '진단하고 싶음'은 배송 고객의 문제나 목적이 아니다. SERVICE에는 실제 제공하는 서비스명만 짧게 넣고 홍보 문구나 포괄적인 슬로건(어디서든 어디로든, 수거부터 배송까지 책임 등)을 별도 서비스로 추출하지 마라. WHERE에는 출발지와 도착지를 한 문장으로 합치지 말고 각각 확인된 장소만 넣어라. SERVICE나 WHERE에 여러 장소와 시간 조건을 합치지 마라. 사이트 문구는 사실로 확인된 내용만 사용하고 추측한 혜택·요금·예약 조건을 추가하지 마라. 확인되지 않은 항목은 비워 두어라. 자료: ${JSON.stringify(evidence)}`
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-5.5',input:prompt})})
  const raw=await response.json()
  if(!response.ok)return NextResponse.json({error:raw?.error?.message||'질문 재료 분석 오류'},{status:502})
  const text=(raw.output??[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content??[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('').trim()
  let parsed:any
  try{parsed=JSON.parse(text.replace(/^```(?:json)?\s*|```$/g,'').trim())}catch{return NextResponse.json({error:'AI Source Profile 형식을 읽을 수 없습니다.'},{status:502})}
  const sources={project:JSON.stringify(project),inquiry:JSON.stringify(evidence.inquiry),website:JSON.stringify(pages)}
  const ingredients:Ingredient[]=(Array.isArray(parsed.ingredients)?parsed.ingredients:[]).filter((x:any)=>types.has(x.type)&&['project','inquiry','website'].includes(x.source)&&typeof x.value==='string'&&typeof x.evidence==='string'&&x.value.trim().length>1&&x.evidence.trim().length>1&&sources[x.source as keyof typeof sources].includes(x.evidence.trim())).slice(0,60).map((x:any)=>({type:x.type,value:x.value.trim().slice(0,150),source:x.source,evidence:x.evidence.trim().slice(0,220)})).filter(meaningful).filter((x:Ingredient)=>!contextIssue({id:0,dimension_type:x.type,dimension_value:x.value,source:x.source,notes:'근거: '+x.evidence},[inquiry?.main_services||'',inquiry?.industry||'',...(engagement?.confirmedFacts||[]).map(f=>f.value)]))
  if(!ingredients.length)return NextResponse.json({error:'근거가 확인된 질문 재료가 없습니다. 상담 정보나 홈페이지 진단을 확인해 주세요.'},{status:422})
  const {data:existing,error:ee}=await s.from('discovery_question_dimensions').select('dimension_type,dimension_value').eq('project_id',id)
  if(ee)return NextResponse.json({error:ee.message},{status:500})
  const keys=new Set((existing??[]).map((x:any)=>`${x.dimension_type}|${x.dimension_value}`))
  const fresh=ingredients.filter(x=>{const k=`${x.type}|${x.value}`;if(keys.has(k))return false;keys.add(k);return true}).map((x,i)=>({project_id:id,dimension_type:x.type,dimension_value:x.value,priority:100-i,is_active:true,source:x.source,notes:`AI Source Profile · 근거: ${x.evidence}`}))
  if(fresh.length){const {error}=await s.from('discovery_question_dimensions').insert(fresh);if(error)return NextResponse.json({error:error.message},{status:500})}
  const {data:dimensions,error:readError}=await s.from('discovery_question_dimensions').select('id,dimension_type,dimension_value,priority,is_active,source,notes').eq('project_id',id).order('priority',{ascending:false})
  if(readError)return NextResponse.json({error:'저장 후 질문 재료 조회 실패: '+readError.message},{status:500})
  return NextResponse.json({ok:true,added:fresh.length,total:(existing?.length??0)+fresh.length,profile:ingredients,dimensions:dimensions??[]})
 }catch(e:any){return NextResponse.json({error:e?.message||'질문 재료 분석 중 오류가 발생했습니다.'},{status:500})}
}
