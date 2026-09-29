import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'
import {requireStaff} from '../../../../../lib/requireStaff'
export const dynamic='force-dynamic'

export default async function ProjectArchive({params}:{params:{id:string}}){
 await requireStaff()
 const id=Number(params.id),url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!Number.isInteger(id)||id<1||!url||!key)return <p className="p-8">프로젝트를 확인할 수 없습니다.</p>
 const s=createClient(url,key,{auth:{persistSession:false}})
 const [p,h,m,t,i]=await Promise.all([
  s.from('discovery_projects').select('name,description').eq('id',id).maybeSingle(),
  s.from('discovery_analysis_history').select('id,observed,interpreted,created_at').eq('project_id',id).order('created_at',{ascending:false}).limit(20),
  s.from('discovery_measurements').select('id,channel,is_discovered,measurement_round,result_text,source_urls,created_at').eq('project_id',id).order('created_at',{ascending:false}).limit(100),
  s.from('discovery_improvement_tasks').select('id,title,status,summary,completed_at,created_at').eq('project_id',id).order('created_at',{ascending:false}),
  s.from('discovery_inquiries').select('id').eq('project_id',id)
 ])
 const inquiryIds=(i.data??[]).map(x=>x.id)
 const precontract=inquiryIds.length?await s.from('discovery_naver_inquiry_history').select('id,inquiry_id,query,observed,interpreted,created_at').in('inquiry_id',inquiryIds).order('created_at',{ascending:false}):null
 if(p.error||!p.data)return <p className="p-8">프로젝트를 찾지 못했습니다.</p>
 return <main className="min-h-screen bg-[#F4F7F6] p-5 text-[#0A0F1E] md:p-10"><div className="mx-auto max-w-5xl"><Link href={'/discovery/projects/'+id} className="text-sm font-bold text-[#087A56]">← 프로젝트 대시보드</Link><h1 className="mt-5 text-3xl font-extrabold">{p.data.name} · 분석 아카이브</h1><p className="mt-2 text-sm text-gray-600">관찰한 측정, 해석한 분석, 진행한 작업과 결과를 함께 확인합니다.</p>{p.data.description&&<p className="mt-5 rounded-xl bg-white p-4 text-sm">승계된 진단 요약: {p.data.description}</p>}
  {(h.data??[]).map((entry:any)=>{const laterMeasurements=(m.data??[]).filter((x:any)=>x.created_at>entry.created_at),laterTasks=(t.data??[]).filter((x:any)=>(x.completed_at||x.created_at)>entry.created_at);return <article key={entry.id} className="mt-6 rounded-2xl border bg-white p-5"><h2 className="font-extrabold">{new Date(entry.created_at).toLocaleString('ko-KR')} 분석</h2><div className="mt-4 grid gap-4 md:grid-cols-3"><section><h3 className="font-bold text-[#087A56]">Observed · 관찰</h3><p className="mt-2 text-sm">Benchmark {(entry.observed||[]).length}개 질문의 채널별 측정</p><details className="mt-2 text-xs"><summary className="cursor-pointer">측정 원본 보기</summary><pre className="mt-2 overflow-auto whitespace-pre-wrap">{JSON.stringify(entry.observed,null,2)}</pre></details></section><section><h3 className="font-bold text-[#087A56]">Interpreted · 해석</h3><p className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-sm">{entry.interpreted}</p></section><section><h3 className="font-bold text-[#087A56]">Outcome · 이후 기록</h3><p className="mt-2 text-sm">이 분석 이후 측정 {laterMeasurements.length}건 · 작업 {laterTasks.length}건</p><div className="mt-3 max-h-64 space-y-2 overflow-auto">{laterMeasurements.map((x:any)=><details key={'m'+x.id} className="rounded-lg bg-gray-50 p-2 text-xs"><summary className="cursor-pointer">{x.channel} · {x.measurement_round} · {x.is_discovered?'발견':'미발견'}</summary><p className="mt-2 whitespace-pre-wrap">{x.result_text||'답변 기록 없음'}</p></details>)}{laterTasks.map((x:any)=><p key={'t'+x.id} className="rounded-lg bg-gray-50 p-2 text-xs">{x.title} · {x.status}</p>)}</div><p className="mt-2 text-xs text-gray-500">시간순으로 연결한 기록이며, 이 분석의 인과적 효과로 단정하지 않습니다.</p></section></div></article>})}
  {(precontract?.data??[]).length>0&&<section className="mt-8"><h2 className="text-xl font-extrabold">계약 전 네이버 진단</h2><p className="mt-2 text-sm text-gray-500">상담 단계에서 저장한 검색 근거와 분석입니다.</p>{(precontract?.data??[]).map((entry:any)=><details key={entry.id} className="mt-3 rounded-2xl border bg-white p-5"><summary className="cursor-pointer font-bold">{entry.query} · {new Date(entry.created_at).toLocaleString('ko-KR')}</summary><p className="mt-4 whitespace-pre-wrap text-sm leading-7">{entry.interpreted}</p><details className="mt-3 text-xs"><summary className="cursor-pointer">조회 근거 보기</summary><pre className="mt-2 overflow-auto whitespace-pre-wrap">{JSON.stringify(entry.observed,null,2)}</pre></details></details>)}</section>}
  {precontract?.error&&<p className="mt-6 text-sm text-red-700">계약 전 네이버 이력을 읽지 못했습니다: {precontract.error.message}</p>}
  {!h.error&&(h.data??[]).length===0&&<p className="mt-6 rounded-xl bg-white p-5 text-sm">저장된 프로젝트 자동분석이 없습니다.</p>}{h.error&&<p className="mt-6 text-sm text-red-700">분석 이력을 읽지 못했습니다: {h.error.message}. SQL 설치 상태를 확인해 주세요.</p>}</div></main>
}
