import Link from 'next/link'
import WebsiteInspector from '../WebsiteInspector'
export const dynamic='force-dynamic'
export const revalidate=0
export default function WebsiteCheckPage(){
 return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-6xl px-5 pb-10 pt-16 md:px-8 md:pt-20">
  <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">Damda Discovery</p><h1 className="text-3xl font-extrabold md:text-4xl">홈페이지 현황 확인</h1><p className="mt-2 max-w-2xl text-sm text-gray-500">URL을 입력해 공개 페이지의 기본 검색·구조 정보를 빠르게 확인합니다.</p></div><Link href="/discovery" className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white">회사 대시보드로 돌아가기 →</Link></header>
  <WebsiteInspector/>
 </div></div>
}