import Link from 'next/link'
import type {Metadata} from 'next'

export const metadata:Metadata={
 title:'소상공인 검색·지도·AI 발견 기본 점검 | 더담다',
 description:'소상공인과 로컬 업체가 검색, 지도·업체 정보, 홈페이지, AI에서 고객에게 발견되기 위해 점검할 기본 정보 구조를 안내합니다.',
 alternates:{canonical:'https://the-damda.co.kr/guide/local-business-discovery'},
}

const checks=[
 ['1. 검색에서 찾을 수 있는가','고객이 업체명을 모른 채 서비스, 업종, 필요한 문제를 검색했을 때 업체를 이해할 수 있는 공개 정보가 있는지 확인합니다. 홈페이지의 서비스 설명과 기본 검색 설정도 함께 살펴볼 수 있습니다.'],
 ['2. 지도·업체 정보가 정확한가','네이버 스마트플레이스, Google Business Profile, 카카오맵 같은 채널은 로컬 업체를 찾을 때 참고되는 접점입니다. 업체명, 업종, 위치, 영업정보, 연락처 등 공개 정보가 실제 운영 내용과 일치하는지 확인합니다.'],
 ['3. 홈페이지에서 서비스를 이해할 수 있는가','누구에게 어떤 서비스를 제공하는지, 이용 범위와 문의 방법이 무엇인지 실제 텍스트로 명확하게 설명되어 있는지 확인합니다. 채널마다 표현이 크게 다르면 고객과 검색 서비스가 업체를 이해하기 어려울 수 있습니다.'],
 ['4. AI가 참고할 공개 정보가 충분한가','AI가 업체와 서비스 관련 질문에 답할 때 참고할 수 있도록 홈페이지와 공개 정보가 읽고 이해하기 쉬운 형태인지 살펴봅니다. 특정 AI 답변의 추천이나 노출을 보장하는 작업은 아닙니다.'],
]

export default function LocalBusinessDiscoveryGuide(){
 return <main className="bg-white text-[#0A0F1E]">
  <section className="bg-[#0A0F1E] text-white"><div className="mx-auto max-w-5xl px-6 py-24">
   <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-[#10E096]">Local Discovery Guide</p>
   <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">소상공인·로컬 업체라면,<br/><span className="text-[#10E096]">고객이 찾는 여러 경로를 함께 점검하세요.</span></h1>
   <p className="mt-7 max-w-3xl text-lg leading-8 text-gray-300">고객은 홈페이지 한 곳만 보지 않습니다. 검색엔진, 지도·업체 정보, 홈페이지, AI 등 여러 경로에서 업체를 찾고 비교합니다. 먼저 기본 정보가 일관되고 이해하기 쉽게 공개되어 있는지 확인하는 것이 중요합니다.</p>
  </div></section>
  <section className="mx-auto max-w-5xl px-6 py-20">
   <div className="mb-12"><p className="text-sm font-bold text-[#0A9B6C]">BASIC CHECK</p><h2 className="mt-2 text-3xl font-extrabold">특별한 기술보다 기본 정보부터 맞춰봅니다</h2><p className="mt-4 max-w-3xl leading-7 text-gray-600">업체명, 서비스, 위치, 영업정보, 문의 방법처럼 고객이 실제로 확인하는 정보가 채널마다 다르거나 빠져 있지는 않은지부터 점검합니다.</p></div>
   <div className="space-y-5">{checks.map(([t,d])=><article key={t} className="rounded-2xl border border-gray-200 p-6"><h3 className="text-xl font-bold">{t}</h3><p className="mt-3 leading-7 text-gray-600">{d}</p></article>)}</div>
   <div className="mt-12 rounded-3xl border border-gray-200 p-8"><p className="text-sm font-bold text-[#0A9B6C]">더담다의 접근</p><h2 className="mt-2 text-2xl font-extrabold">채널 운영을 약속하기 전에 현재 발견 상태부터 확인합니다</h2><p className="mt-4 leading-7 text-gray-600">더담다는 특정 플랫폼 계정의 등록·운영을 이 페이지에서 일괄 서비스로 약속하지 않습니다. 먼저 공개된 업체 정보와 홈페이지를 기준으로 현재 상태를 확인하고, 어떤 채널과 정보가 실제로 정비되어야 하는지 구분합니다. 구체적인 작업 범위는 진단과 협의 후 정합니다.</p></div>
   <div className="mt-8 rounded-3xl bg-[#F0FDF9] p-8"><h2 className="text-2xl font-extrabold">우리 업체는 어디에서 어떻게 발견되고 있을까요?</h2><p className="mt-4 leading-7 text-gray-600">현재 홈페이지와 공개 정보를 바탕으로 검색·AI 발견 상태와 기본 정보 구조를 먼저 확인해 보세요.</p><div className="mt-6"><Link href="/ai-search/consulting" className="inline-block rounded-xl bg-[#0A0F1E] px-5 py-3 font-bold text-white">현재 상태 진단 신청</Link></div></div>
  </section>
 </main>
}
