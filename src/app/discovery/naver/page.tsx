import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'
import {requireStaff} from '../../../lib/requireStaff'
import NaverExplorer from './NaverExplorer'
export const dynamic='force-dynamic'
export default async function NaverDashboard(){
 await requireStaff()
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 let projects:{id:number;name:string|null}[]=[]
 if(url&&key){const s=createClient(url,key);const {data}=await s.from('discovery_projects').select('id,name').order('id');projects=data||[]}
 return <main className="min-h-screen bg-[#F4F7F6] px-5 pb-16 pt-24 text-[#0A0F1E] md:px-8"><div className="mx-auto max-w-7xl"><header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#087A56]">Damda Discovery · Naver</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">네이버 전용 대시보드</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">프로젝트의 검색어를 웹문서·블로그·카페글·지역 검색과 검색어 트렌드에서 함께 살펴봅니다.</p></div><Link href="/discovery" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">← 회사 대시보드</Link></header>{projects.length?<NaverExplorer projects={projects}/>:<p className="rounded-xl bg-white p-6 text-sm text-gray-500">먼저 관리 프로젝트를 등록해 주세요.</p>}</div></main>
}
