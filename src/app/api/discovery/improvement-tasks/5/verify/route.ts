import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const target='/guide/discovery-provider-checklist'
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
   {key:'page',label:'업체 선택 체크리스트가 정상 응답',pass:page.ok,detail:'HTTP '+page.status},
   {key:'metadata',label:'title과 description 존재',pass:title&&desc,detail:`title ${title?'확인':'없음'} · description ${desc?'확인':'없음'}`},
   {key:'sitemap',label:'sitemap에 체크리스트 URL 포함',pass:site.ok&&site.text.includes(target),detail:site.ok?'sitemap 확인':'sitemap 응답 실패'},
   {key:'robots',label:'robots.txt에서 체크리스트 차단 없음',pass:robots.ok&&!new RegExp('Disallow:\\s*'+target.replace(/\//g,'\\/'),'i').test(robots.text),detail:robots.ok?'직접 차단 규칙 없음':'robots.txt 확인 실패'},
   {key:'criteria',label:'진단·작업 범위·소유권·기록·재측정·AI 기준 포함',pass:['현재 상태','작업 범위','소유권','기록','다시 측정','AI 발견'].every(v=>visible.includes(v)),detail:'핵심 비교 기준 확인'},
   {key:'consultingLink',label:'현재 상태 진단 신청으로 연결',pass:page.text.includes('href="/ai-search/consulting"')||page.text.includes('href="'+origin+'/ai-search/consulting"'),detail:'진단 신청 링크 확인'},
   {key:'neutralCompare',label:'더담다를 포함해 같은 기준으로 비교하도록 안내',pass:visible.includes('더담다를 포함해 같은 기준으로 비교'),detail:'비교 안내 확인'},
   {key:'noGuarantee',label:'특정 순위·추천·노출 보장을 서비스 약속으로 사용하지 않음',pass:visible.includes('보장하지')||visible.includes('보장하기보다'),detail:'보장 대신 측정·개선 원칙 확인'}
  ]
  const passed=checks.every(x=>x.pass),now=new Date().toISOString()
  const task={project_id:1,priority:5,title:'검색 노출 관리 업체 선택 기준',status:passed?'completed':'in_progress',summary:'검색·AI 발견 관리 업체를 선택할 때 확인할 진단, 작업 범위, 계정과 데이터 소유권, 작업 기록, 재측정과 과장 표현 여부를 안내하는 체크리스트를 제작합니다.',work_details:['/guide/discovery-provider-checklist 신규 페이지 제작','검색·AI 발견 관리 업체를 같은 기준으로 비교하는 7개 체크 항목 구성','계정과 데이터 소유권 및 실제 작업 기록 기준 포함','같은 질문·기준으로 재측정하는 원칙 포함','순위·추천·노출 보장보다 측정과 개선 범위를 확인하도록 안내','sitemap에 체크리스트 URL 추가','현재 상태 진단 신청으로 연결'],completion_criteria:checks.map(({key,label})=>({key,label})),verification_result:{passed,checks,origin},verified_at:now,updated_at:now}
  const q=await s.from('discovery_improvement_tasks').upsert(task,{onConflict:'project_id,priority'}).select('id,status,verification_result,verified_at').single()
  if(q.error)return NextResponse.json({error:q.error.message},{status:500})
  return NextResponse.json({passed,checks,task:q.data})
 }catch(e:any){return NextResponse.json({error:e.message||'검증 실패'},{status:500})}
}
