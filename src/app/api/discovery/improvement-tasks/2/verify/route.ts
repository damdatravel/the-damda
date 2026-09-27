import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const target='/guide/search-traffic-checklist'
function supa(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SERVICE_ROLE_KEY;return u&&k?createClient(u,k,{auth:{persistSession:false}}):null}
async function html(url:string){const r=await fetch(url,{cache:'no-store',headers:{'user-agent':'TheDamda-Discovery-Verify/1.0'}});return {ok:r.ok,status:r.status,text:await r.text()}}
export async function POST(req:Request){
 const s=supa();if(!s)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
 const origin=new URL(req.url).origin
 try{
  const [page,site,robots,service]=await Promise.all([html(origin+target),html(origin+'/sitemap.xml'),html(origin+'/robots.txt'),html(origin+'/ai-search')])
  const title=/<title[^>]*>[^<]+<\/title>/i.test(page.text),desc=/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(page.text)||/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(page.text)
  const checks=[
   {key:'page',label:'가이드 페이지가 정상 응답',pass:page.ok,detail:'HTTP '+page.status},
   {key:'metadata',label:'title과 description 존재',pass:title&&desc,detail:`title ${title?'확인':'없음'} · description ${desc?'확인':'없음'}`},
   {key:'sitemap',label:'sitemap에 가이드 URL 포함',pass:site.ok&&site.text.includes(target),detail:site.ok?'sitemap 확인':'sitemap 응답 실패'},
   {key:'robots',label:'robots.txt에서 가이드 차단 없음',pass:robots.ok&&!new RegExp('Disallow:\\s*'+target.replace(/\//g,'\\/'),'i').test(robots.text),detail:robots.ok?'직접 차단 규칙 없음':'robots.txt 확인 실패'},
   {key:'internalLink',label:'검색·AI 발견 관리 페이지에서 내부 링크 연결',pass:service.ok&&service.text.includes(target),detail:'/ai-search 연결 확인'},
   {key:'consultingLink',label:'가이드에서 현재 상태 진단 신청으로 연결',pass:page.text.includes('href="/ai-search/consulting"')||page.text.includes('href="'+origin+'/ai-search/consulting"'),detail:'진단 신청 링크 확인'},
   {key:'safeCopy',label:'검색 순위·AI 추천 노출 보장 표현 없음',pass:!/(1위|최상단|노출을 보장|추천을 보장)/.test(page.text),detail:'보장형 표현 검사'}
  ]
  const passed=checks.every(x=>x.pass),now=new Date().toISOString()
  const upd:any={verification_result:{passed,checks,origin},verified_at:now,updated_at:now};if(passed)upd.status='completed'
  const q=await s.from('discovery_improvement_tasks').update(upd).eq('project_id',1).eq('priority',2).select('id,status,verification_result,verified_at').single()
  if(q.error)return NextResponse.json({error:q.error.message},{status:500})
  return NextResponse.json({passed,checks,task:q.data})
 }catch(e:any){return NextResponse.json({error:e.message||'검증 실패'},{status:500})}
}