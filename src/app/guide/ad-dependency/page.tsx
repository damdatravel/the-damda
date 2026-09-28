import Link from 'next/link'
import type {Metadata} from 'next'

export const metadata:Metadata={
 title:'광고를 끄면 문의가 줄어드는 이유 | 더담다',
 description:'광고를 줄이거나 중단했을 때 문의가 함께 줄어드는 기업을 위해 검색, AI, 홈페이지에서 고객이 업체를 발견할 수 있는 기반을 점검하는 가이드입니다.',
 alternates:{canonical:'https://the-damda.co.kr/guide/ad-dependency'},
}

const checks=[
 ['1. 검색에서 발견될 정보가 있는가','고객이 업체명을 모른 채 서비스나 문제를 검색해도 관련 페이지를 만날 수 있는지 확인합니다. 광고가 아닌 검색 결과에서 발견될 수 있는 정보가 쌓여 있어야 합니다.'],
 ['2. AI가 업체와 서비스를 이해할 수 있는가','업체가 누구에게 어떤 서비스를 제공하는지 공개 페이지에서 명확하게 설명하고 있는지 확인합니다. AI 답변에서 특정 업체의 노출이나 추천을 보장할 수는 없지만, 이해 가능한 정보 기반은 준비할 수 있습니다.'],
 ['3. 홈페이지가 서비스 선택에 필요한 답을 주는가','방문자가 서비스 대상, 제공 범위, 이용 방법과 문의 전 궁금한 내용을 확인할 수 있어야 합니다. 광고로 방문자를 데려와도 필요한 설명이 부족하면 문의로 이어지기 어렵습니다.'],
 ['4. 발견 이후 문의까지 연결되는가','서비스를 이해한 방문자가 상담이나 문의 방법을 쉽게 찾을 수 있는지 확인합니다. 복잡한 절차보다 다음 행동이 분명한 구조가 중요합니다.'],
]

export default function AdDependencyGuide(){
 return <main className="bg-white text-[#0A0F1E]">
  <section className="bg-[#0A0F1E] text-white"><div className="mx-auto max-w-5xl px-6 py-24">
   <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-[#10E096]">Discovery Guide</p>
   <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">광고를 끄면 문의가 줄어든다면,<br/><span className="text-[#10E096]">광고 밖의 발견 경로를 점검해 보세요.</span></h1>
   <p className="mt-7 max-w-3xl text-lg leading-8 text-gray-300">광고는 빠르게 고객을 만나는 중요한 방법입니다. 다만 광고를 줄였을 때 문의도 바로 줄어든다면, 고객이 검색과 AI, 홈페이지를 통해 업체를 발견하고 이해할 수 있는 기반이 충분한지 확인해 볼 필요가 있습니다.</p>
  </div></section>
  <section className="mx-auto max-w-5xl px-6 py-20">
   <div className="mb-12"><p className="text-sm font-bold text-[#0A9B6C]">CHECK</p><h2 className="mt-2 text-3xl font-extrabold">광고를 없애는 것이 목적은 아닙니다</h2><p className="mt-4 max-w-3xl leading-7 text-gray-600">광고의 성과와 검색·AI 발견 기반은 서로 다른 역할을 합니다. 중요한 것은 광고 외에도 고객이 업체를 찾고, 무엇을 하는 곳인지 이해하고, 문의할 수 있는 경로가 준비되어 있는지입니다.</p></div>
   <div className="space-y-5">{checks.map(([t,d])=><article key={t} className="rounded-2xl border border-gray-200 p-6"><h3 className="text-xl font-bold">{t}</h3><p className="mt-3 leading-7 text-gray-600">{d}</p></article>)}</div>
   <div className="mt-12 rounded-3xl border border-gray-200 p-8"><p className="text-sm font-bold text-[#0A9B6C]">더담다의 접근</p><h2 className="mt-2 text-2xl font-extrabold">광고비보다 먼저 ‘발견되는 구조’를 측정합니다</h2><p className="mt-4 leading-7 text-gray-600">실제 고객이 사용할 만한 질문을 기준으로 검색과 AI에서 현재 발견 상태를 확인하고, 홈페이지의 서비스 설명과 문의 연결 구조를 함께 점검합니다. 필요한 정보를 개선한 뒤 같은 기준으로 다시 측정해 변화를 기록합니다.</p></div>
   <div className="mt-8 rounded-3xl bg-[#F0FDF9] p-8"><h2 className="text-2xl font-extrabold">광고 외 유입 기반이 얼마나 준비되어 있을까요?</h2><p className="mt-4 leading-7 text-gray-600">광고를 더 쓰기 전에 현재 검색·AI·홈페이지 발견 상태부터 확인해 보세요. 진단 결과를 바탕으로 먼저 손볼 항목을 구분할 수 있습니다.</p><div className="mt-6"><Link href="/ai-search/consulting" className="inline-block rounded-xl bg-[#0A0F1E] px-5 py-3 font-bold text-white">현재 상태 진단 신청</Link></div></div>
  </section>
 </main>
}
