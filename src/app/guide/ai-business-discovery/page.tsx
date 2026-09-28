import Link from 'next/link'
import type {Metadata} from 'next'

export const metadata:Metadata={
 title:'AI가 우리 업체를 더 잘 이해하게 하려면 | 더담다',
 description:'ChatGPT 같은 AI에서 업체가 잘 발견되지 않을 때 먼저 준비할 홈페이지 정보, 서비스 설명, 고객 질문, 신뢰 정보와 일관성을 정리한 가이드입니다.',
 alternates:{canonical:'https://the-damda.co.kr/guide/ai-business-discovery'},
}

const checks=[
 ['1. 업체가 누구인지 한 문장으로 설명하기','회사명만 적기보다 어떤 고객에게 어떤 서비스를 제공하는 업체인지 홈페이지에서 분명하게 설명합니다. AI가 업체의 역할을 이해할 수 있는 기본 정보입니다.'],
 ['2. 실제 제공하는 서비스를 각각 구체적으로 설명하기','서비스 이름만 나열하지 말고 대상, 이용 상황, 제공 범위와 진행 방식을 구체적으로 적습니다. 서로 다른 서비스라면 관련 페이지를 나누는 것도 도움이 됩니다.'],
 ['3. 고객이 실제로 묻는 질문에 답하기','고객은 업체명을 모른 채 문제나 상황을 질문하는 경우가 많습니다. 자주 묻는 질문, 이용 조건, 지역, 비용을 결정하는 요소처럼 실제 질문에 답할 수 있는 정보를 준비합니다.'],
 ['4. 기본 신뢰 정보를 일관되게 유지하기','상호, 연락처, 주소가 필요한 업종이라면 주소, 운영 정보, 공식 홈페이지 등 기본 정보를 서로 다르게 적지 않도록 관리합니다. 확인 가능한 정보가 부족하면 업체를 구분하기 어려울 수 있습니다.'],
 ['5. 검색엔진과 AI가 읽을 수 있는 공개 페이지로 만들기','중요한 설명이 이미지 안에만 있거나 로그인 뒤에만 있으면 외부에서 내용을 읽기 어렵습니다. 핵심 서비스와 안내 정보는 일반 웹페이지의 텍스트로 확인할 수 있게 준비합니다.'],
 ['6. 실제 질문으로 발견 상태를 측정하고 다시 확인하기','페이지를 만들었다고 바로 특정 AI 답변에 등장한다고 단정할 수는 없습니다. 업체명을 넣지 않은 실제 고객 질문을 정해 현재 결과를 기록하고, 정보를 개선한 뒤 같은 질문으로 다시 확인합니다.'],
]

export default function AiBusinessDiscoveryGuide(){
 return <main className="bg-white text-[#0A0F1E]">
  <section className="bg-[#0A0F1E] text-white"><div className="mx-auto max-w-5xl px-6 py-24">
   <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-[#10E096]">AI Discovery Guide</p>
   <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">ChatGPT 같은 AI가<br/><span className="text-[#10E096]">우리 업체를 이해하려면 무엇이 필요할까요?</span></h1>
   <p className="mt-7 max-w-3xl text-lg leading-8 text-gray-300">AI에서 업체가 잘 보이지 않는 이유를 한 가지로 단정하기는 어렵습니다. 특정 AI의 추천이나 노출을 보장하는 방법도 없습니다. 먼저 홈페이지와 공개 정보가 업체의 역할과 서비스를 명확하게 설명하고 있는지 확인하고, 실제 고객 질문으로 발견 상태를 측정하는 것부터 시작할 수 있습니다.</p>
  </div></section>
  <section className="mx-auto max-w-5xl px-6 py-20">
   <div className="mb-12"><p className="text-sm font-bold text-[#0A9B6C]">PREPARATION</p><h2 className="mt-2 text-3xl font-extrabold">AI 발견을 위해 먼저 준비할 6가지</h2><p className="mt-4 max-w-3xl leading-7 text-gray-600">AI마다 답변 방식과 참고하는 정보가 다르고 결과도 바뀔 수 있습니다. 그래서 단순히 AI용 문구를 추가하기보다 사람, 검색엔진, AI가 모두 이해할 수 있는 기본 정보를 갖추는 것이 우선입니다.</p></div>
   <div className="space-y-5">{checks.map(([t,d])=><article key={t} className="rounded-2xl border border-gray-200 p-6"><h3 className="text-xl font-bold">{t}</h3><p className="mt-3 leading-7 text-gray-600">{d}</p></article>)}</div>
   <div className="mt-12 rounded-3xl border border-gray-200 p-8"><p className="text-sm font-bold text-[#0A9B6C]">중요한 기준</p><h2 className="mt-2 text-2xl font-extrabold">‘AI에 나오게 해준다’보다 ‘실제로 발견되는지 확인한다’</h2><p className="mt-4 leading-7 text-gray-600">더담다는 특정 AI의 답변이나 추천 순위를 보장하지 않습니다. 실제 고객이 사용할 만한 질문을 기준으로 현재 상태를 기록하고, 홈페이지와 공개 정보를 개선한 뒤 같은 질문을 다시 측정해 변화를 확인하는 방식으로 접근합니다.</p></div>
   <div className="mt-8 rounded-3xl bg-[#F0FDF9] p-8"><h2 className="text-2xl font-extrabold">우리 업체는 지금 어떻게 보이고 있을까요?</h2><p className="mt-4 leading-7 text-gray-600">홈페이지가 있다면 현재 정보 구조와 고객 질문을 기준으로 먼저 상태를 확인해 보세요. 확인 결과를 바탕으로 필요한 개선 항목을 구분할 수 있습니다.</p><div className="mt-6"><Link href="/ai-search/consulting" className="inline-block rounded-xl bg-[#0A0F1E] px-5 py-3 font-bold text-white">현재 상태 진단 신청</Link></div></div>
  </section>
 </main>
}
