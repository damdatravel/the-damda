import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const target='/guide/ad-dependency'
function supa(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SERVICE_ROLE_KEY;return u&&k?createClient(u,k,{auth:{persistSession:false}}):null}
async function html(url:string){const r=await fetch(url,{cache:'no-store',headers:{'user-agent':'TheDamda-Discovery-Verify/1.0'}});return {ok:r.ok,status:r.status,text:await r.text()}}
export async function POST(req:Request){
 const s=supa();if(!s)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
 const origin=new URL(req.url).origin
 try{
  const [page,site,robots]=await Promise.all([html(origin+target),html(origin+'/sitemap.xml'),html(origin+'/robots.txt')])
  const title=/<title[^>]*>[^<]+<\/title>/i.test(page.text),desc=/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(page.text)||/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(page.text)
  const visible=page.text.replaceAll('<',' <').replaceAll('>','> ').replace(/\s+/g,' ')
  const checks=[
   {key:'page',label:'광고 의존도 가이드가 정상 응답',pass:page.ok,detail:'HTTP '+page.status},
   {key:'metadata',label:'title과 description 존재',pass:title&&desc,detail:`title ${title?'확인':'없음'} · description ${desc?'확인':'없음'}`},
   {key:'sitemap',label:'sitemap에 가이드 URL 포함',pass:site.ok&&site.text.includes(target),detail:site.ok?'sitemap 확인':'sitemap 응답 실패'},
   {key:'robots',label:'robots.txt에서 가이드 차단 없음',pass:robots.ok&&!new RegExp('Disallow:\\s*'+target.replace(/\//g,'\\/'),'i').test(robots.text),detail:robots.ok?'직접 차단 규칙 없음':'robots.txt 확인 실패'},
   {key:'scope',label:'검색·AI·홈페이지·문의 연결 범위 명시',pass:visible.includes('검색')&&visible.includes('AI')&&visible.includes('홈페이지')&&visible.includes('문의'),detail:'Discovery 범위 확인'},
   {key:'consultingLink',label:'현재 상태 진단 신청으로 연결',pass:page.text.includes('href="/ai-search/consulting"')||page.text.includes('href="'+origin+'/ai-search/consulting"'),detail:'진단 신청 링크 확인'},
   {key:'noCrm',label:'CRM 종합관리 서비스로 표현하지 않음',pass:!visible.includes('CRM'),detail:'CRM 표현 없음'},
   {key:'noRoadmap',label:'고정 90일 로드맵을 상품처럼 제시하지 않음',pass:!visible.includes('90일'),detail:'고정 로드맵 없음'}
  ]
  const passed=checks.every(x=>x.pass),now=new Date().toISOString()
  const task={project_id:1,priority:4,title:'광고 의존도 진단·개선 페이지',status:passed?'completed':'in_progress',summary:'광고를 줄였을 때 문의가 함께 줄어드는 기업을 위해 광고 외 검색·AI·홈페이지 발견 기반을 점검하는 가이드를 제작합니다.',work_details:['/guide/ad-dependency 신규 페이지 제작','광고 중단 자체가 목적이 아니라 광고 외 발견 경로를 점검하는 방향으로 범위 조정','검색·AI·홈페이지·문의 연결 구조 중심으로 구성','CRM 종합관리와 고정 90일 로드맵은 범위에서 제외','sitemap에 가이드 URL 추가','현재 상태 진단 신청으로 연결'],completion_criteria:checks.map(({key,label})=>({key,label})),verification_result:{passed,checks,origin},verified_at:now,updated_at:now}
  const q=await s.from('discovery_improvement_tasks').upsert(task,{onConflict:'project_id,priority'}).select('id,status,verification_result,verified_at').single()
  if(q.error)return NextResponse.json({error:q.error.message},{status:500})
  return NextResponse.json({passed,checks,task:q.data})
 }catch(e:any){return NextResponse.json({error:e.message||'검증 실패'},{status:500})}
}
