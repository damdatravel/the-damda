import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'
import {requireStaff} from '../../../lib/requireStaff'

export const dynamic='force-dynamic'
export const revalidate=0
type Project={id:number;name:string|null;website_url:string|null}
type History={project_id:number;measurement_round:string;created_at:string}
export default async function NaverDashboard(){
 await requireStaff()
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 let projects:Project[]=[],history:History[]=[],error:string|null=null
 if(url&&key){
  const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
  const [p,h]=await Promise.all([s.from('discovery_projects').select('id,name,website_url').eq('naver_management',true).order('id'),s.from('discovery_analysis_history').select('project_id,measurement_round,created_at').in('measurement_round',['Naver','Naver Approved']).order('created_at',{ascending:false}).limit(1000)])
  projects=p.data||[];history=h.data||[];error=p.error?.message??h.error?.message??null
 }else error='Supabase 환경변수를 확인해 주세요.'
 const rows=projects.map(project=>{const items=history.filter(item=>item.project_id===project.id);return {...project,diagnoses:items.filter(item=>item.measurement_round==='Naver').length,approved:items.filter(item=>item.measurement_round==='Naver Approved').length,latest:items[0]?.created_at||null}})
 const work=rows.filter(row=>history.find(item=>item.project_id===row.id)?.measurement_round==='Naver').slice(0,8)
 return <main className="min-h-screen bg-[#F4F7F6] px-5 pb-16 pt-24 text-[#0A0F1E] md:px-8"><div className="mx-auto max-w-7xl"><header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#087A56]">Damda Discovery · Naver</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">네이버 검색 관리</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">업체별 검색 자료와 진단, 개선 방향, 고객 전달 문안을 관리합니다.</p></div><Link href="/discovery" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">← 회사 대시보드</Link></header>
 {error&&<p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">DB 연결 확인 필요: {error}</p>}
 <section className="mb-7 grid gap-4 md:grid-cols-3">{[['1. 검색 자료 조회','고객의 검색 표현으로 웹문서·블로그·카페글·지역 검색과 추이를 살펴봅니다.'],['2. 진단과 개선 검토','조회 근거를 바탕으로 내부 개선안을 확인하고 고객에게 필요한 내용을 고릅니다.'],['3. 전달 문안과 후속 조회','고객용 초안을 검토·저장하고 다음 조회에서 변화를 기록합니다.']].map(([title,detail])=><article key={title} className="rounded-2xl border border-gray-200 bg-white p-6"><h2 className="text-lg font-extrabold">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-500">{detail}</p></article>)}</section>
 <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]"><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-bold">검토할 프로젝트</h2><p className="mt-1 text-xs text-gray-500">최근 진단 이후 새 전달 문안이 없는 프로젝트를 모았습니다.</p><div className="mt-5 space-y-3">{work.map(row=><div key={row.id} className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-4"><div><p className="font-extrabold">{row.name||'프로젝트'}</p><p className="mt-1 text-sm text-amber-900">진단 {row.diagnoses}건 · 검토 완료 문안 {row.approved}건</p></div><Link href={`/discovery/naver/projects/${row.id}`} className="shrink-0 text-xs font-bold text-[#087A56]">열기 →</Link></div>)}{!work.length&&<p className="rounded-xl border border-dashed p-5 text-sm text-gray-500">현재 표시할 검토 대상이 없습니다.</p>}</div></section>
 <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">관리 프로젝트</h2><span className="text-sm font-bold text-gray-400">총 {rows.length}개</span></div><p className="mt-1 text-xs text-gray-500">업체를 선택하면 해당 업체의 네이버 진단 화면으로 이동합니다.</p><div className="mt-5 space-y-3">{rows.map(row=><div key={row.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-extrabold">{row.name||'프로젝트'}</p><p className="mt-1 break-all text-xs text-gray-400">{row.website_url||'웹사이트 미등록'}</p><p className="mt-2 text-sm text-gray-600">진단 {row.diagnoses}건 · 검토 완료 문안 {row.approved}건{row.latest?` · 최근 기록 ${new Date(row.latest).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}`:''}</p></div><Link href={`/discovery/naver/projects/${row.id}`} className="shrink-0 rounded-lg bg-[#0A0F1E] px-3 py-2 text-center text-xs font-bold text-white">네이버 프로젝트</Link></div>)}{!rows.length&&<p className="text-sm text-gray-500">등록된 프로젝트가 없습니다.</p>}</div></section></div></div></main>
}
