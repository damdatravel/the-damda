import Link from 'next/link'
import type {Metadata} from 'next'

export const metadata:Metadata={
 title:'네이버에서 우리 업체가 검색되지 않는다면 | 더담다 Discovery',
 description:'네이버 웹문서와 실제 통합검색 화면을 구분해 현재 발견 상태를 확인하고, 수집·색인 상태와 홈페이지 정보를 검토해 개선 순서를 제안합니다.',
 alternates:{canonical:'https://the-damda.co.kr/ai-search/naver'},
}

const steps=[
 {number:'01',title:'검색 질문과 현재 결과 확인',text:'업체명과 실제 고객이 사용할 질문을 정합니다. 네이버 웹문서 API 결과를 기록하고, 통합검색 화면은 직접 확인해 별도로 기록합니다.'},
 {number:'02',title:'원인 확인',text:'홈페이지 내용과 검색 결과를 대조합니다. 사이트 소유자의 협조가 가능하면 네이버 서치어드바이저에서 수집·색인 현황도 확인합니다.'},
 {number:'03',title:'개선안과 재확인',text:'확인된 문제에 따라 페이지 제목·설명·서비스 안내·고객 질문에 대한 답변을 정비할 순서를 제안하고, 같은 질문으로 다시 확인합니다.'},
]

export default function NaverDiscoveryPage(){return <>
 <section className="bg-[#0A0F1E] px-6 pb-24 pt-36 text-white"><div className="mx-auto max-w-6xl"><p className="mb-5 text-sm font-bold uppercase tracking-[.18em] text-[#10E096]">Discovery · Naver</p><h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">네이버에서 우리 업체가<br/><span className="text-[#10E096]">왜 잘 보이지 않을까요?</span></h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-gray-300">홈페이지가 있어도 고객의 검색 질문에서는 발견되지 않을 수 있습니다. 먼저 현재 결과를 기록하고, 확인된 원인에 맞춰 고칠 일을 제안합니다.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/ai-search/consulting?topic=naver" className="rounded-xl bg-[#10E096] px-7 py-4 font-bold text-[#0A0F1E]">네이버 발견 상태 상담 신청</Link><Link href="/ai-search" className="rounded-xl border border-white/30 px-7 py-4 font-semibold">Discovery 전체 서비스 보기</Link></div></div></section>
 <section className="px-6 py-20"><div className="mx-auto max-w-6xl"><p className="text-sm font-bold uppercase tracking-wider text-[#087A56]">What we check</p><h2 className="mt-3 text-3xl font-extrabold text-[#0A0F1E]">측정부터 개선 순서까지</h2><div className="mt-9 grid gap-5 md:grid-cols-3">{steps.map(step=><article key={step.number} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"><span className="text-sm font-extrabold text-[#0A9B6C]">{step.number}</span><h3 className="mt-4 text-xl font-extrabold">{step.title}</h3><p className="mt-3 text-sm leading-7 text-gray-600">{step.text}</p></article>)}</div></div></section>
 <section className="bg-[#F2F9F6] px-6 py-20"><div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2"><div><p className="text-sm font-bold uppercase tracking-wider text-[#087A56]">Deliverables</p><h2 className="mt-3 text-3xl font-extrabold">고객이 받는 결과</h2><p className="mt-4 leading-7 text-gray-600">검색이 안 된다는 막연한 불안 대신, 어떤 질문에서 무엇이 확인됐고 다음에 무엇을 확인하거나 수정할지 정리합니다.</p></div><ul className="space-y-3">{['기준 질문과 채널별 현재 발견 기록','확인된 사실과 아직 확인이 필요한 항목','홈페이지에서 우선 수정할 정보 제안','적용 후 같은 질문으로 확인할 계획'].map(x=><li key={x} className="rounded-xl bg-white px-5 py-4 font-semibold text-[#0A0F1E]">✓ {x}</li>)}</ul></div></section>
 <section className="px-6 py-20"><div className="mx-auto max-w-4xl rounded-2xl border border-emerald-200 bg-white p-7 md:p-10"><h2 className="text-2xl font-extrabold">측정 범위를 분명히 안내합니다</h2><p className="mt-4 leading-7 text-gray-600">네이버 웹문서 API 상위 결과는 통합검색 화면 전체나 실제 검색 순위와 다릅니다. API 결과만으로 수집·색인 실패를 단정할 수 없으며, 서치어드바이저 자료는 사이트 소유자의 접근 협조가 있어야 확인할 수 있습니다. 검색 순위와 노출을 보장하지 않습니다.</p></div></section>
 <section className="bg-[#0A0F1E] px-6 py-20 text-center text-white"><h2 className="text-3xl font-extrabold">우리 홈페이지부터 확인해 보세요</h2><p className="mx-auto mt-4 max-w-xl text-gray-300">홈페이지 주소와 겪고 있는 검색 문제를 알려주시면, 먼저 확인할 범위를 검토합니다.</p><Link href="/ai-search/consulting?topic=naver" className="mt-8 inline-block rounded-xl bg-[#10E096] px-8 py-4 font-bold text-[#0A0F1E]">네이버 발견 상태 상담 신청</Link></section>
 </>}
