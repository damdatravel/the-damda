import Link from 'next/link'
import type {Metadata} from 'next'

export const metadata:Metadata={
 title:'검색 유입이 거의 없을 때 점검할 것 | 더담다',
 description:'홈페이지 검색 유입이 적거나 갑자기 줄었을 때 색인, robots.txt, sitemap, 제목·설명, 검색 도구, 내부 링크와 콘텐츠 의도를 순서대로 확인하는 점검 가이드입니다.',
 alternates:{canonical:'https://the-damda.co.kr/guide/search-traffic-checklist'},
}

const checks=[
 ['1. 검색엔진이 페이지를 읽고 저장할 수 있는지','검색엔진에 페이지가 색인되어 있는지 확인합니다. 좋은 콘텐츠가 있어도 색인되지 않았다면 검색 결과에 나타나기 어렵습니다.'],
 ['2. robots.txt와 sitemap 확인','robots.txt가 중요한 페이지를 막고 있지 않은지, sitemap에 주요 서비스·가이드 페이지가 포함되어 있는지 확인합니다.'],
 ['3. 검색 결과에 보이는 정보 확인','페이지별 title과 description이 실제 내용과 고객의 검색 의도를 명확하게 설명하는지 확인합니다.'],
 ['4. 공식 검색 도구의 수집·노출 상태 확인','Google Search Console과 네이버 서치어드바이저에서 수집 오류, 색인 상태와 검색 노출 여부를 확인합니다.'],
 ['5. 중요한 페이지로 연결되는 내부 링크 확인','홈페이지와 관련 서비스·가이드 사이의 내부 링크가 충분한지 확인합니다. 중요한 페이지가 고립되어 있으면 방문자와 검색엔진 모두 찾기 어렵습니다.'],
 ['6. 콘텐츠가 고객의 검색 의도에 답하는지','회사 소개만 반복하기보다 고객이 실제로 찾는 문제, 서비스, 이용 상황과 질문에 답하고 있는지 확인합니다.'],
]

export default function SearchTrafficChecklist(){
 return <main className="bg-white text-[#0A0F1E]">
  <section className="bg-[#0A0F1E] text-white"><div className="mx-auto max-w-5xl px-6 py-24">
   <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-[#10E096]">Search Discovery Guide</p>
   <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">검색 유입이 거의 없을 때<br/><span className="text-[#10E096]">무엇부터 확인해야 할까요?</span></h1>
   <p className="mt-7 max-w-3xl text-lg leading-8 text-gray-300">검색 유입 감소에는 검색 수요, 경쟁, 사이트 운영 기간, 기술 설정, 콘텐츠 등 여러 원인이 있을 수 있습니다. 광고를 늘리기 전에 먼저 검색엔진이 홈페이지를 발견하고 이해할 수 있는 상태인지부터 순서대로 확인해 보세요.</p>
  </div></section>
  <section className="mx-auto max-w-5xl px-6 py-20">
   <div className="mb-12"><p className="text-sm font-bold text-[#0A9B6C]">CHECKLIST</p><h2 className="mt-2 text-3xl font-extrabold">6단계 기본 점검</h2><p className="mt-4 max-w-3xl leading-7 text-gray-600">한 가지 원인만으로 검색 유입이 줄었다고 단정하기보다 기술 상태, 검색 결과 정보, 공식 도구 데이터, 내부 연결과 콘텐츠 방향을 함께 살펴보는 것이 좋습니다.</p></div>
   <div className="space-y-5">{checks.map(([t,d])=><article key={t} className="rounded-2xl border border-gray-200 p-6"><h3 className="text-xl font-bold">{t}</h3><p className="mt-3 leading-7 text-gray-600">{d}</p></article>)}</div>
   <div className="mt-12 rounded-3xl bg-[#F0FDF9] p-8"><h2 className="text-2xl font-extrabold">점검 후에도 원인이 명확하지 않다면</h2><p className="mt-4 leading-7 text-gray-600">더담다는 특정 검색 순위나 AI 추천 노출을 보장하지 않습니다. 실제 고객 질문을 기준으로 현재 발견 상태와 홈페이지 정보 구조를 확인하고, 확인된 문제부터 순서대로 개선합니다.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/ai-search" className="rounded-xl bg-[#0A0F1E] px-5 py-3 font-bold text-white">검색·AI 발견 관리 보기</Link><Link href="/ai-search/consulting" className="rounded-xl border border-[#0A0F1E] px-5 py-3 font-bold">현재 상태 진단 신청</Link></div></div>
  </section>
 </main>
}