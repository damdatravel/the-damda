import Link from 'next/link'
import WebsiteInspector from '../WebsiteInspector'

export const dynamic='force-dynamic'

export default function WebsiteCheckPage(){
 return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
  <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">The Damda Discovery</p><h1 className="text-3xl font-extrabold md:text-4xl">홈페이지 현황 확인</h1><p className="mt-2 max-w-2xl text-sm text-gray-500">홈페이지 주소를 입력해 기존 페이지, 주요 설명, sitemap, 구조화 정보 등을 먼저 확인합니다. 아직 프로젝트에 자동 등록하거나 홈페이지를 수정하지 않습니다.</p></div><Link href="/discovery" className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white">Dashboard →</Link></header>
  <WebsiteInspector/>
  <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500"><p className="font-bold text-[#0A0F1E]">다음 연결 단계</p><p className="mt-2">검사 결과를 확인한 뒤 필요한 사이트만 새 프로젝트로 등록하거나 기존 프로젝트에 연결하도록 확장합니다. 단순 진단한 사이트가 자동으로 고객 프로젝트가 되지는 않습니다.</p></section>
 </div></div>
}