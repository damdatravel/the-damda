import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '검색·AI 발견 관리 상담 | 주식회사 더담다',
  description: '홈페이지와 기본 정보를 남겨주시면 검색과 AI에서의 현재 발견 상태를 확인하는 것부터 시작합니다.',
  alternates: { canonical: 'https://the-damda.co.kr/ai-search/consulting' },
}

const concerns=['검색해도 업체가 잘 나오지 않음','ChatGPT 등 AI에서 잘 발견되지 않음','광고 의존도가 높음','홈페이지 검색 유입이 적음','현재 상태를 먼저 진단하고 싶음']

export default function DiscoveryConsultingPage(){
 return <main className="min-h-screen bg-[#F7FAF9]">
  <section className="bg-[#0A0F1E] px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-4xl">
   <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#10E096]">Search · AI Discovery Consulting</p>
   <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">현재 발견 상태부터<br/><span className="text-[#10E096]">확인해 보세요.</span></h1>
   <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">홈페이지 주소와 기본 정보를 남겨주시면 검색과 AI에서 고객이 귀사를 어떻게 찾을 수 있는지 확인하는 것부터 시작합니다.</p>
  </div></section>
  <section className="px-6 py-16"><div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1.1fr_.9fr]">
   <div className="rounded-3xl border border-gray-200 bg-white p-7 md:p-9">
    <p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">상담 준비 정보</p>
    <h2 className="mt-2 text-2xl font-extrabold text-[#0A0F1E]">진단에 필요한 기본 정보</h2>
    <p className="mt-3 text-sm leading-relaxed text-gray-500">아직 자동 접수 폼은 연결하지 않았습니다. 아래 내용을 준비해 문의해 주시면 확인 후 안내드립니다.</p>
    <div className="mt-7 space-y-4">{['업체명 또는 브랜드명','홈페이지 주소(URL)','업종과 주요 서비스·상품','현재 가장 궁금한 검색·AI 노출 문제','담당자 이름과 연락 가능한 이메일 또는 전화번호'].map((x,i)=><div key={x} className="flex gap-4 rounded-2xl bg-[#F7FAF9] p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10E096]/20 text-xs font-extrabold text-[#087A56]">{i+1}</span><span className="text-sm font-semibold text-[#0A0F1E]">{x}</span></div>)}</div>
    <a href="mailto:ceo@the-damda.co.kr?subject=%EA%B2%80%EC%83%89%C2%B7AI%20%EB%B0%9C%EA%B2%AC%20%EA%B4%80%EB%A6%AC%20%EC%83%81%EB%8B%B4%20%EC%8B%A0%EC%B2%AD" className="mt-7 inline-flex rounded-xl bg-[#10E096] px-6 py-3 font-bold text-[#0A0F1E] hover:bg-[#0DC47D]">상담 정보 보내기 →</a>
   </div>
   <div className="space-y-6">
    <div className="rounded-3xl bg-[#0A0F1E] p-7 text-white"><p className="text-sm font-bold text-[#10E096]">이런 경우에 확인해 보세요</p><div className="mt-5 space-y-3">{concerns.map(x=><p key={x} className="border-b border-white/10 pb-3 text-sm text-gray-300">✓ {x}</p>)}</div></div>
    <div className="rounded-3xl border border-green-100 bg-[#EFFFF8] p-7"><h3 className="font-extrabold text-[#0A0F1E]">진행 방식</h3><p className="mt-3 text-sm leading-relaxed text-gray-600">홈페이지 현황 확인 → 실제 고객 질문 설정 → 최초 발견 상태 측정 → 우선 개선안 제안 순으로 진행합니다. 특정 검색 순위나 AI 추천 노출을 보장하지 않습니다.</p></div>
    <Link href="/ai-search" className="inline-flex text-sm font-bold text-[#087A56]">← 서비스 설명 다시 보기</Link>
   </div>
  </div></section>
 </main>
}