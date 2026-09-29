import Link from 'next/link'
import {notFound} from 'next/navigation'
import {createClient} from '@supabase/supabase-js'
import {requireStaff} from '../../../../../lib/requireStaff'
import NaverExplorer from '../../NaverExplorer'

export const dynamic='force-dynamic'
export const revalidate=0
export default async function NaverProject({params}:{params:{id:string}}){
 await requireStaff()
 const projectId=Number(params.id)
 if(!Number.isInteger(projectId)||projectId<1)notFound()
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return <main className="px-6 pt-24">Supabase 환경변수를 확인해 주세요.</main>
 const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const {data:project,error}=await s.from('discovery_projects').select('id,name,website_url,naver_management').eq('id',projectId).maybeSingle()
 if(!project&&!error)notFound()
 if(project&&!project.naver_management)notFound()
 return <main className="min-h-screen bg-[#F4F7F6] px-5 pb-16 pt-24 text-[#0A0F1E] md:px-8"><div className="mx-auto max-w-7xl"><header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#087A56]">Damda Discovery · Naver Project</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{project?.name||'네이버 프로젝트'}</h1><p className="mt-3 text-sm text-gray-600">네이버 검색 진단 · 내부 개선 검토 · 고객 전달 문안</p>{project?.website_url&&<p className="mt-1 break-all text-xs text-gray-500">{project.website_url}</p>}</div><div className="flex flex-wrap gap-2"><Link href="/discovery/naver" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">← 네이버 프로젝트 목록</Link><Link href={`/discovery/projects/${projectId}`} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">프로젝트 설정</Link><Link href={`/discovery/naver/projects/${projectId}/client-preview`} className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-[#087A56]">고객 화면 미리보기 →</Link><Link href={`/discovery/naver/projects/${projectId}/website`} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">홈페이지 진단 →</Link></div></header>{error?<p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">프로젝트를 불러오지 못했습니다: {error.message}</p>:project&&<NaverExplorer projects={[project]}/>}</div></main>
}
