import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const target='/'
function supa(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SERVICE_ROLE_KEY;return u&&k?createClient(u,k,{auth:{persistSession:false}}):null}
async function html(url:string){const r=await fetch(url,{cache:'no-store',headers:{'user-agent':'TheDamda-Discovery-Verify/1.0'}});return {ok:r.ok,status:r.status,text:await r.text()}}
export async function POST(req:Request){
 const s=supa();if(!s)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
 const origin=new URL(req.url).origin
 try{
  const page=await html(origin+target)
  const visible=page.text.replaceAll('<',' <').replaceAll('>','> ').replace(/\s+/g,' ')
  const scripts=Array.from(page.text.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)).map(m=>m[1])
  const joined=scripts.join(' ')
  const checks=[
   {key:'page',label:'홈페이지 메인이 정상 응답',pass:page.ok,detail:'HTTP '+page.status},
   {key:'company',label:'회사명과 공식 URL이 명확함',pass:visible.includes('주식회사 더담다')&&page.text.includes('https://the-damda.co.kr'),detail:'회사명·URL 확인'},
   {key:'serviceSplit',label:'고객 제공 서비스와 자체 사업을 구분',pass:visible.includes('고객에게 제공하는 서비스')&&visible.includes('자체 사업')&&visible.includes('광고·마케팅')&&visible.includes('검색·AI 발견 관리'),detail:'서비스/자체사업 구분 확인'},
   {key:'faq',label:'실제 회사·서비스 FAQ가 화면에 표시',pass:['더담다는 어떤 회사인가요?','어떤 서비스를 제공하나요?','검색·AI 발견 관리는 무엇인가요?','홈페이지가 없어도 상담할 수 있나요?','문의는 어떻게 하나요?'].every(v=>visible.includes(v)),detail:'FAQ 5개 확인'},
   {key:'organization',label:'Organization 구조화 데이터 존재',pass:joined.includes('"@type":"Organization"')&&joined.includes('"name":"주식회사 더담다"'),detail:'Organization JSON-LD 확인'},
   {key:'website',label:'WebSite 구조화 데이터 존재',pass:joined.includes('"@type":"WebSite"'),detail:'WebSite JSON-LD 확인'},
   {key:'faqSchema',label:'화면 FAQ와 FAQPage 구조화 데이터가 함께 존재',pass:joined.includes('"@type":"FAQPage"')&&joined.includes('검색·AI 발견 관리는 무엇인가요?'),detail:'FAQPage JSON-LD 확인'},
   {key:'contactRoutes',label:'일반 문의와 검색·AI 진단 경로를 구분',pass:page.text.includes('href="/contact"')&&page.text.includes('href="/ai-search/consulting"'),detail:'두 문의 경로 확인'},
   {key:'noFloating',label:'중복 플로팅 문의 버튼 제거',pass:!page.text.includes('fixed bottom-8 right-8 z-40'),detail:'플로팅 문의 버튼 없음'}
  ]
  const passed=checks.every(x=>x.pass),now=new Date().toISOString()
  const task={project_id:1,priority:7,title:'구조화 데이터와 인용 가능 정보 정비',status:passed?'completed':'in_progress',summary:'더담다 홈페이지의 회사 정보, 고객 제공 서비스, 자체 사업, 문의 경로와 FAQ를 명확히 정리하고 실제 화면과 일치하는 Organization·WebSite·FAQPage 구조화 데이터를 적용합니다.',work_details:['홈페이지 회사 설명과 Organization 정보 정비','고객 제공 서비스와 DamdaTravel·Yeonunnal·SqueezeBean 자체 사업을 명확히 구분','회사·서비스 이해를 위한 실제 FAQ 5개 추가','Organization·WebSite·FAQPage JSON-LD 적용','일반 문의와 검색·AI 발견 관리 진단 경로 구분','중복 문의 플로팅 버튼 제거'],completion_criteria:checks.map(({key,label})=>({key,label})),verification_result:{passed,checks,origin},verified_at:now,updated_at:now}
  const q=await s.from('discovery_improvement_tasks').upsert(task,{onConflict:'project_id,priority'}).select('id,status,verification_result,verified_at').single()
  if(q.error)return NextResponse.json({error:q.error.message},{status:500})
  return NextResponse.json({passed,checks,task:q.data})
 }catch(e:any){return NextResponse.json({error:e.message||'검증 실패'},{status:500})}
}
