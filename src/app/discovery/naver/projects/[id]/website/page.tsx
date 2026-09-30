import Link from 'next/link'
import {notFound} from 'next/navigation'
import {createClient} from '@supabase/supabase-js'
import {requireStaff} from '../../../../../../lib/requireStaff'
import ProjectWebsiteInspector from './ProjectWebsiteInspector'
import {normalizeQueries} from '../../../../../../lib/naverKeywords'

export const dynamic='force-dynamic'
export const revalidate=0
export default async function NaverWebsite({params}:{params:{id:string}}){
 await requireStaff()
 const id=Number(params.id)
 if(!Number.isInteger(id)||id<1)notFound()
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return <main className="px-6 pt-24">DB 연결 설정을 확인해 주세요.</main>
 const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const {data:project,error}=await s.from('discovery_projects').select('name,website_url,naver_management').eq('id',id).maybeSingle()
 if(!project&&!error||project&&!project.naver_management)notFound()
 const [website,suggestions,selection]=await Promise.all(['Naver Website','Naver Keyword Suggestions','Naver Keywords'].map(round=>s.from('discovery_analysis_history').select('id,created_at,observed').eq('project_id',id).eq('measurement_round',round).order('created_at',{ascending:false}).limit(1).maybeSingle()))
 const saved=suggestions.data?{id:suggestions.data.id,created_at:suggestions.data.created_at,keywords:suggestions.data.observed?.[0]?.keywords||[],websiteHistoryId:suggestions.data.observed?.[0]?.websiteHistoryId}:null
 const historyError=website.error||suggestions.error||selection.error
 return <main className="min-h-screen bg-[#F4F7F6] px-5 pb-16 pt-24 text-[#0A0F1E] md:px-8"><div className="mx-auto max-w-6xl"><header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#087A56]">Damda Discovery · Naver</p><h1 className="mt-2 text-3xl font-extrabold">{project?.name||'프로젝트'} 홈페이지 진단</h1><p className="mt-2 text-sm text-gray-600">공개 페이지의 제목·설명·구조화 정보와 sitemap을 확인해 네이버 개선 방향을 검토합니다.</p></div><Link href={`/discovery/naver/projects/${id}`} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">← 네이버 프로젝트</Link></header>{error?<p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">프로젝트 조회 실패: {error.message}</p>:<><ProjectWebsiteInspector projectId={id} url={project?.website_url||null} websiteHistoryId={website.data?.id||null} saved={saved} selectedQueries={normalizeQueries(selection.data?.observed?.[0]?.queries)||[]}/>{historyError&&<p role="alert" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">이전 진단·검색어 이력을 불러오지 못했습니다. 다시 시도해 주세요.</p>}</>}<p className="text-xs text-gray-500">홈페이지 현황은 검색 결과와 함께 검토할 자료입니다. 네이버 노출·색인 여부를 확정하지 않습니다.</p></div></main>
}
