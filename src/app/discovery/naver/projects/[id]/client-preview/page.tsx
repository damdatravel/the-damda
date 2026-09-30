import Link from 'next/link'
import {notFound} from 'next/navigation'
import {createClient} from '@supabase/supabase-js'
import {requireStaff} from '../../../../../../lib/requireStaff'

export const dynamic='force-dynamic'
export const revalidate=0
type Report={id:number;created_at:string;interpreted:string;measurement_round:string;observed:{query?:string;source_history_id?:number;websiteCheckedAt?:string;websiteEvidence?:unknown}[]|null}
export default async function NaverClientPreview({params}:{params:{id:string}}){
 await requireStaff()
 const id=Number(params.id)
 if(!Number.isInteger(id)||id<1)notFound()
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return <main className="px-6 pt-24">DB 연결 설정을 확인해 주세요.</main>
 const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const [p,h,w]=await Promise.all([s.from('discovery_projects').select('name,website_url,naver_management').eq('id',id).maybeSingle(),s.from('discovery_analysis_history').select('id,created_at,interpreted,observed,measurement_round').eq('project_id',id).in('measurement_round',['Naver','Naver Approved']).order('created_at',{ascending:false}).limit(100),s.from('discovery_analysis_history').select('created_at').eq('project_id',id).eq('measurement_round','Naver Website').order('created_at',{ascending:false}).limit(1).maybeSingle()])
 if(!p.data&&!p.error||p.data&&!p.data.naver_management)notFound()
 const needsReview=(report:Report)=>{const source=(h.data||[]).find(x=>x.id===report.observed?.[0]?.source_history_id),evidence=source?.observed?.[0];return !evidence?.websiteEvidence||!!(w.data?.created_at&&(!evidence?.websiteCheckedAt||w.data.created_at>evidence.websiteCheckedAt))}
 const all=(h.data??[]) as Report[],reports=all.filter(item=>item.measurement_round==='Naver Approved').slice(0,10),drafts=all.filter(item=>item.measurement_round==='Naver').slice(0,5)
 return <main className="min-h-screen bg-[#F7F9F8] px-5 pb-16 pt-24 text-[#0A0F1E] md:px-8"><div className="mx-auto max-w-5xl"><header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#087A56]">Damda Discovery · Naver Client Preview</p><h1 className="mt-2 text-3xl font-extrabold">{p.data?.name||'고객사'} 네이버 관리 현황</h1><p className="mt-2 text-sm text-gray-600">검색 진단을 바탕으로 검토한 개선 방향을 확인합니다.</p></div><Link href={`/discovery/naver/projects/${id}`} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">← 내부 네이버 프로젝트</Link></header>
 {(p.error||h.error)&&<p className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">자료를 불러오지 못했습니다: {p.error?.message||h.error?.message}</p>}
 <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-[#087A56]">Progress</p><h2 className="mt-1 text-xl font-extrabold">최근 검토 완료 문안 {reports.length}건</h2><p className="mt-2 text-sm text-gray-500">이 화면은 직원이 고객에게 보여줄 내용을 확인하는 미리보기입니다. 문안을 저장해도 고객에게 자동으로 전달되지는 않습니다.</p></section>
 {reports.length?<div className="space-y-5">{reports.map(report=><article key={report.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold text-[#087A56]">{report.observed?.[0]?.query||'네이버 검색 진단'} · {new Date(report.created_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}</p><div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">{report.interpreted}</div>{needsReview(report)&&<div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">직원 재검토 필요: 이 문안의 원본 분석에 홈페이지 근거가 없거나, 이후 홈페이지 점검 자료가 갱신되었습니다. 기존 문안을 최신 진단으로 간주하지 말고 네이버 프로젝트에서 재조회·분석 후 문안을 갱신하세요.</div>}</article>)}</div>:<div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500">아직 검토 완료된 고객 전달 문안이 없습니다. 아래 자동 진단을 검토한 뒤 네이버 프로젝트에서 전달 문안을 확정해 주세요.</div>}
 {drafts.length>0&&<section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="text-lg font-extrabold text-amber-950">검토 전 자동 진단 · 내부 참고</h2><p className="mt-2 text-sm text-amber-900">현재 작성된 분석을 확인할 수 있습니다. 고객에게 보여줄 최종 내용으로 사용하려면 사실 확인 후 전달 문안을 저장해 주세요.</p><div className="mt-4 space-y-3">{drafts.map(report=><details key={report.id} className="rounded-xl bg-white p-4"><summary className="cursor-pointer text-sm font-bold">{report.observed?.[0]?.query||'검색어'} · {new Date(report.created_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}</summary><div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">{report.interpreted}</div></details>)}</div><Link href={`/discovery/naver/projects/${id}`} className="mt-4 inline-block text-sm font-bold text-[#087A56]">네이버 프로젝트에서 문안 검토 →</Link></section>}
 <p className="mt-6 text-xs text-gray-500">네이버 API 조회와 검색어 상대 추이는 실제 통합검색 노출 순위나 성과를 보장하지 않습니다.</p></div></main>
}
