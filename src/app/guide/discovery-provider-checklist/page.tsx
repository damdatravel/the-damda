import Link from 'next/link'
import type {Metadata} from 'next'

export const metadata:Metadata={
 title:'검색·AI 발견 관리 업체 선택 체크리스트 | 더담다',
 description:'검색과 AI 발견 관리를 맡길 업체를 비교할 때 현재 상태 진단, 작업 범위, 계정과 데이터 소유권, 작업 기록, 재측정, 과장된 보장 표현 여부를 확인하는 체크리스트입니다.',
 alternates:{canonical:'https://the-damda.co.kr/guide/discovery-provider-checklist'},
}

const checks=[
 ['1. 현재 상태를 먼저 측정하는가','작업을 시작하기 전에 지금 검색과 AI에서 업체와 서비스가 어떻게 발견되는지 확인하는지 살펴보세요. 출발점이 없으면 이후 변화도 판단하기 어렵습니다.'],
 ['2. 무엇을 어디까지 하는지 설명하는가','홈페이지 정보 구조, 검색 노출을 위한 기본 설정, AI가 이해할 수 있는 서비스 설명 등 실제 작업 범위가 구체적인지 확인합니다. 단순히 ‘관리한다’는 말만으로는 작업 내용을 알기 어렵습니다.'],
 ['3. 계정과 데이터의 소유권이 고객에게 있는가','홈페이지, 검색 도구, 분석 도구 등 고객 사업에 필요한 계정과 데이터는 계약이 끝난 뒤에도 고객이 확인하고 사용할 수 있는 구조인지 확인합니다.'],
 ['4. 무엇을 했는지 기록으로 보여주는가','페이지 수정, 정보 보완, 측정과 재측정처럼 실제 수행한 작업을 날짜와 함께 확인할 수 있는지 살펴보세요. 결과뿐 아니라 과정이 남아야 관리 내용을 확인하기 쉽습니다.'],
 ['5. 같은 기준으로 다시 측정하는가','처음 확인한 질문이나 기준을 개선 후에도 다시 사용해야 변화 여부를 비교할 수 있습니다. 측정 기준이 계속 달라지면 전후 변화를 판단하기 어렵습니다.'],
 ['6. 검색엔진뿐 아니라 AI 발견도 확인하는가','고객은 검색엔진뿐 아니라 AI에도 서비스와 업체를 묻습니다. 계약 범위에 포함된 검색·AI 채널에서 실제 발견 상태를 어떻게 확인하는지 물어보세요.'],
 ['7. 순위나 AI 노출을 보장한다고 과장하지 않는가','검색 결과와 AI 답변은 플랫폼과 시점에 따라 달라질 수 있습니다. 특정 순위, 추천, 노출을 확정적으로 보장하기보다 무엇을 측정하고 개선할지를 설명하는지 확인합니다.'],
]

export default function DiscoveryProviderChecklist(){
 return <main className="bg-white text-[#0A0F1E]">
  <section className="bg-[#0A0F1E] text-white"><div className="mx-auto max-w-5xl px-6 py-24">
   <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-[#10E096]">Provider Checklist</p>
   <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">검색·AI 발견 관리 업체,<br/><span className="text-[#10E096]">무엇을 확인하고 선택해야 할까요?</span></h1>
   <p className="mt-7 max-w-3xl text-lg leading-8 text-gray-300">업체를 비교할 때는 ‘상위에 올려준다’는 말보다 현재 상태를 어떻게 확인하고, 어떤 작업을 하며, 이후 변화를 어떤 기준으로 보여주는지를 확인하는 것이 중요합니다.</p>
  </div></section>
  <section className="mx-auto max-w-5xl px-6 py-20">
   <div className="mb-12"><p className="text-sm font-bold text-[#0A9B6C]">COMPARE</p><h2 className="mt-2 text-3xl font-extrabold">더담다를 포함해 같은 기준으로 비교해 보세요</h2><p className="mt-4 max-w-3xl leading-7 text-gray-600">서비스 이름이나 전문용어보다 실제로 무엇을 확인하고 기록하는지가 중요합니다. 아래 기준은 특정 업체를 선택하라는 기준이 아니라 계약 전에 확인해 볼 질문입니다.</p></div>
   <div className="space-y-5">{checks.map(([t,d])=><article key={t} className="rounded-2xl border border-gray-200 p-6"><h3 className="text-xl font-bold">{t}</h3><p className="mt-3 leading-7 text-gray-600">{d}</p></article>)}</div>
   <div className="mt-12 rounded-3xl border border-gray-200 p-8"><p className="text-sm font-bold text-[#0A9B6C]">더담다의 관리 기준</p><h2 className="mt-2 text-2xl font-extrabold">진단 → 개선 → 같은 기준으로 재측정 → 작업 기록</h2><p className="mt-4 leading-7 text-gray-600">더담다는 실제 고객이 사용할 만한 질문을 기준으로 현재 발견 상태를 기록하고, 필요한 정보를 개선한 뒤 같은 기준으로 다시 확인합니다. 수행한 개선 작업과 측정 결과도 시간 순서로 남기는 방향으로 관리합니다.</p></div>
   <div className="mt-8 rounded-3xl bg-[#F0FDF9] p-8"><h2 className="text-2xl font-extrabold">비교하기 전에 우리 회사의 현재 상태부터 확인해 보세요</h2><p className="mt-4 leading-7 text-gray-600">홈페이지와 현재 운영 정보를 바탕으로 검색·AI 발견 상태를 먼저 확인하면 어떤 관리가 필요한지 판단하기 쉬워집니다.</p><div className="mt-6"><Link href="/ai-search/consulting" className="inline-block rounded-xl bg-[#0A0F1E] px-5 py-3 font-bold text-white">현재 상태 진단 신청</Link></div></div>
  </section>
 </main>
}
