import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const target='/guide/ai-business-discovery'
function supa(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SERVICE_ROLE_KEY;return u&&k?createClient(u,k,{auth:{persistSession:false}}):null}
async function html(url:string){const r=await fetch(url,{cache:'no-store',headers:{'user-agent':'TheDamda-Discovery-Verify/1.0'}});return {ok:r.ok,status:r.status,text:await r.text()}}
export async function POST(req:Request){
 const s=supa();if(!s)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
 const origin=new URL(req.url).origin
 try{
  const [page,site,robots]=await Promise.all([html(origin+target),html(origin+'/sitemap.xml'),html(origin+'/robots.txt')])
  const title=/<title[^>]*>[^<]+<\/title>/i.test(page.text),desc=/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(page.text)||/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(page.text)
  const checks=[
   {key:'page',label:'AI 발견 준비 가이드가 정상 응답',pass:page.ok,detail:'HTTP '+page.status},
   {key:'metadata',label:'title과 description 존재',pass:title&&desc,detail:`title ${title?'확인':'없음'} · description ${desc?'확인':'없음'}`},
   {key:'sitemap',label:'sitemap에 가이드 URL 포함',pass:site.ok&&site.text.includes(target),detail:site.ok?'sitemap 확인':'sitemap 응답 실패'},
   {key:'robots',label:'robots.txt에서 가이드 차단 없음',pass:robots.ok&&!new RegExp('Disallow:\\s*'+target.replace(/\//g,'\\/'),'i').test(robots.text),detail:robots.ok?'직접 차단 규칙 없음':'robots.txt 확인 실패'},
   {key:'consultingLink',label:'가이드에서 현재 상태 진단 신청으로 연결',pass:page.text.includes('href="/ai-search/consulting"')||page.text.includes('href="'+origin+'/ai-search/consulting"'),detail:'진단 신청 링크 확인'},
   {key:'measurement',label:'실제 질문 측정·재확인 원칙 명시',pass:page.text.includes('같은 질문')&&page.text.includes('측정'),detail:'측정 원칙 확인'},
   {key:'safeCopy',label:'AI 추천·노출 보장 표현 없음',pass:!/(AI.{0,12}(노출|추천).{0,8}보장(?!하지|할 수 없)|(노출|추천).{0,8}보장(?!하지|할 수 없))/.test(page.text),detail:'부정형 안전 문구는 제외하고 보장형 표현 검사'}
  ]
  const passed=checks.every(x=>x.pass),now=new Date().toISOString()
  const task={
   project_id:1,priority:3,title:'AI에 업체가 잘 나오게 하는 준비 페이지',
   status:passed?'completed':'in_progress',
   summary:'AI에서 업체가 잘 발견되지 않을 때 준비할 공개 정보와 실제 질문 기반 측정 원칙을 안내하는 가이드를 제작하고 기술 조건을 검증합니다.',
   work_details:[
    '/guide/ai-business-discovery 신규 페이지 제작',
    '업체 설명·서비스·고객 질문·신뢰 정보·공개 텍스트 등 기본 준비 항목 구성',
    '특정 AI 추천이나 노출을 보장하지 않는 안전한 표현 적용',
    '실제 고객 질문으로 현재 상태를 측정하고 같은 질문으로 재확인하는 원칙 명시',
    'sitemap에 가이드 URL 추가',
    '가이드에서 현재 상태 진단 신청으로 연결'
   ],
   completion_criteria:checks.map(({key,label})=>({key,label})),
   verification_result:{passed,checks,origin},verified_at:now,updated_at:now
  }
  const q=await s.from('discovery_improvement_tasks').upsert(task,{onConflict:'project_id,priority'}).select('id,status,verification_result,verified_at').single()
  if(q.error)return NextResponse.json({error:q.error.message},{status:500})
  return NextResponse.json({passed,checks,task:q.data})
 }catch(e:any){return NextResponse.json({error:e.message||'검증 실패'},{status:500})}
}
