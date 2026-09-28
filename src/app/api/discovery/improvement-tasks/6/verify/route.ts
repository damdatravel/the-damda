import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const target='/guide/local-business-discovery'
function supa(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SERVICE_ROLE_KEY;return u&&k?createClient(u,k,{auth:{persistSession:false}}):null}
async function html(url:string){const r=await fetch(url,{cache:'no-store',headers:{'user-agent':'TheDamda-Discovery-Verify/1.0'}});return {ok:r.ok,status:r.status,text:await r.text()}}
export async function POST(req:Request){
 const s=supa();if(!s)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
 const origin=new URL(req.url).origin
 try{
  const [page,site,robots]=await Promise.all([html(origin+target),html(origin+'/sitemap.xml'),html(origin+'/robots.txt')])
  const title=/<title[^>]*>[^<]+<\/title>/i.test(page.text),desc=/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(page.text)||/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(page.text)
  const visible=page.text.replaceAll('<',' <').replaceAll('>','> ').replace(/\s+/g,' ')
  const channels=['네이버 스마트플레이스','Google Business Profile','카카오맵']
  const checks=[
   {key:'page',label:'소상공인 발견 기본 점검 가이드가 정상 응답',pass:page.ok,detail:'HTTP '+page.status},
   {key:'metadata',label:'title과 description 존재',pass:title&&desc,detail:`title ${title?'확인':'없음'} · description ${desc?'확인':'없음'}`},
   {key:'sitemap',label:'sitemap에 가이드 URL 포함',pass:site.ok&&site.text.includes(target),detail:site.ok?'sitemap 확인':'sitemap 응답 실패'},
   {key:'robots',label:'robots.txt에서 가이드 차단 없음',pass:robots.ok&&!new RegExp('Disallow:\\s*'+target.replace(/\//g,'\\/'),'i').test(robots.text),detail:robots.ok?'직접 차단 규칙 없음':'robots.txt 확인 실패'},
   {key:'scope',label:'검색·지도·홈페이지·AI 기본 점검 범위 명시',pass:['검색','지도','홈페이지','AI'].every(v=>visible.includes(v)),detail:'4개 기본 발견 경로 확인'},
   {key:'channels',label:'로컬 채널은 점검 대상 예시로 안내',pass:channels.every(v=>visible.includes(v)),detail:'네이버·Google·카카오 채널 예시 확인'},
   {key:'noPlatformPromise',label:'플랫폼 계정 등록·운영을 일괄 서비스로 약속하지 않음',pass:visible.includes('일괄 서비스로 약속하지 않습니다')&&visible.includes('작업 범위는 진단과 협의 후 정합니다'),detail:'서비스 범위 확정 전 과도한 약속 없음'},
   {key:'noGuarantee',label:'AI 추천·노출 보장을 약속하지 않음',pass:visible.includes('추천이나 노출을 보장하는 작업은 아닙니다'),detail:'보장 표현 제한 확인'},
   {key:'consultingLink',label:'현재 상태 진단 신청으로 연결',pass:page.text.includes('href="/ai-search/consulting"')||page.text.includes('href="'+origin+'/ai-search/consulting"'),detail:'진단 신청 링크 확인'}
  ]
  const passed=checks.every(x=>x.pass),now=new Date().toISOString()
  const task={project_id:1,priority:6,title:'소상공인·로컬 업체용 발견 관리',status:passed?'completed':'in_progress',summary:'소상공인과 로컬 업체가 검색, 지도·업체 정보, 홈페이지, AI에서 발견되기 위해 필요한 기본 정보 구조를 안내하는 가이드를 제작합니다.',work_details:['/guide/local-business-discovery 신규 페이지 제작','검색·지도·홈페이지·AI의 4개 기본 발견 경로 중심으로 범위 정리','네이버 스마트플레이스·Google Business Profile·카카오맵은 점검 대상 채널 예시로 안내','플랫폼 계정 등록·운영을 확정 서비스로 약속하지 않고 진단 후 범위를 정하도록 명시','순위·AI 추천·노출 보장 표현 제한','sitemap에 가이드 URL 추가','현재 상태 진단 신청으로 연결'],completion_criteria:checks.map(({key,label})=>({key,label})),verification_result:{passed,checks,origin},verified_at:now,updated_at:now}
  const q=await s.from('discovery_improvement_tasks').upsert(task,{onConflict:'project_id,priority'}).select('id,status,verification_result,verified_at').single()
  if(q.error)return NextResponse.json({error:q.error.message},{status:500})
  return NextResponse.json({passed,checks,task:q.data})
 }catch(e:any){return NextResponse.json({error:e.message||'검증 실패'},{status:500})}
}
