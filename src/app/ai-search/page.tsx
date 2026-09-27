import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '검색·AI 발견 관리 | 검색 노출 진단·개선',
  description: '검색엔진과 AI가 업체의 서비스와 고객 이용 상황을 이해하기 쉽도록 정보 구조를 점검하고, 고정 질문으로 발견 상태를 측정·개선합니다.',
  alternates: { canonical: 'https://the-damda.co.kr/ai-search' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '검색·AI 발견 관리 서비스',
  provider: {
    '@type': 'Organization',
    name: '주식회사 더담다',
    url: 'https://the-damda.co.kr',
  },
  description: '고객이 실제로 검색하거나 AI에 물어볼 질문을 기준으로 현재 발견 상태를 측정하고, 홈페이지 정보 구조와 콘텐츠를 순차적으로 개선한 뒤 같은 질문으로 변화를 재측정하는 서비스',
  areaServed: 'KR',
  serviceType: '검색·AI 발견 상태 진단 및 개선 관리',
}

const targets = [
  {
    icon: '🏢',
    category: '분양 현장',
    sub: '지식산업센터 · 아파트 · 오피스텔',
    desc: '투자자·실수요자가 검색과 AI에서 현장을 찾을 때 필요한 정보가 명확히 전달되도록 발견 상태를 점검하고 개선합니다.',
    badge: 'B2B',
  },
  {
    icon: '🏥',
    category: '병원',
    sub: '성형외과 · 치과 · 피부과',
    desc: '진료과목과 이용 상황에 관한 실제 고객 질문을 기준으로 검색·AI에서 병원 정보가 어떻게 발견되는지 측정하고 개선합니다.',
    badge: '구독형',
  },
  {
    icon: '⚖️',
    category: '전문직',
    sub: '변호사 · 세무사 · 변리사',
    desc: '법률·세무 관련 고객 질문에서 전문 서비스와 업무 범위를 이해하기 쉽도록 정보 구조와 발견 상태를 점검합니다.',
    badge: '구독형',
  },
  {
    icon: '🏭',
    category: '기업 · 브랜드',
    sub: '대기업 · FMCG · 신제품 런칭',
    desc: '신제품과 브랜드 관련 질문에서 공식 정보가 검색·AI에 명확하게 전달되도록 현재 상태를 측정하고 필요한 정보를 보완합니다.',
    badge: 'Enterprise',
  },
]

export default function AiSearchPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section className="min-h-screen bg-[#0A0F1E] flex items-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(16,224,150,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,224,150,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#10E096]/8 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-24">
          <div className="max-w-3xl">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-6">
              AI Search Optimization · AEO / GEO / SEO
            </p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
              검색에서도, AI에서도<br />
              <span className="text-[#10E096]">찾을 수 있게 준비합니다.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              고객이 실제로 묻는 질문을 기준으로 현재 발견 상태를 측정하고,<br />
              홈페이지의 정보 구조를 하나씩 개선한 뒤 같은 질문으로 다시 확인합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/ai-search/consulting"
                className="bg-[#10E096] text-[#0A0F1E] font-bold px-8 py-4 rounded-xl text-base hover:bg-[#0DC47D] transition-all hover:scale-105"
              >
                도입 문의하기
              </Link>
              <a
                href="#targets"
                className="border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-all"
              >
                패키지 보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Problem</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E] mb-6">
              광고만으로는 알기 어려운<br />검색·AI 발견 상태를 확인합니다
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              고객은 검색엔진뿐 아니라 ChatGPT, Perplexity, 구글 AI처럼 다양한 경로에서 업체와 서비스를 찾습니다.
              더담다는 <strong className="text-[#0A0F1E]">실제 고객 질문을 기준으로 현재 어디에서 발견되는지부터 측정합니다.</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'ChatGPT', desc: '"강남 성형외과 추천해줘" "인천 지식산업센터 투자 괜찮아?"' },
              { icon: '🔍', title: 'Perplexity', desc: '"변호사 수임료 기준이 어떻게 돼?" "피부과 레이저 부작용은?"' },
              { icon: '✨', title: '구글 AI Overview', desc: '"동아제약 박카스 효능" "농심 신라면 레시피"' },
            ].map(item => (
              <div key={item.title} className="bg-[#F8FAFB] rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-[#0A0F1E] font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed italic">"{item.desc}"</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 mt-8 text-sm">
            이 질문들에 당신의 브랜드가 답변으로 노출되고 있습니까?
          </p>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="py-24 bg-[#0A0F1E]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Solution</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              질문을 만들고, 측정하고,<br />필요한 정보부터 개선합니다
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              주식회사 더담다는 업종과 서비스를 바탕으로 고객이 실제로 물어볼 질문을 만들고,
              검색·AI에서의 발견 상태를 기록합니다. 이후 <span className="text-[#10E096] font-semibold">서비스 설명, FAQ, 가이드, 구조화 정보</span> 등 필요한 부분을 순서대로 개선하고 같은 질문으로 다시 측정합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Benchmark 질문 · 최초 측정',
                desc: '업체 이름을 넣지 않은 실제 고객 질문을 정하고 검색·AI에서 현재 발견 상태를 기록합니다.',
              },
              {
                step: '02',
                title: '우선순위별 개선 작업',
                desc: '측정 결과를 바탕으로 부족한 서비스 설명, FAQ, 가이드와 기술 정보를 순서대로 보완합니다.',
              },
              {
                step: '03',
                title: '같은 질문으로 재측정',
                desc: '작업 이력과 적용 시점을 기록하고 같은 Benchmark 질문으로 발견 상태의 변화를 다시 확인합니다.',
              },
            ].map(item => (
              <div key={item.step} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#10E096]/30 transition-all">
                <p className="text-[#10E096] text-sm font-bold tracking-widest mb-4">STEP {item.step}</p>
                <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="py-24 bg-[#F0FDF9]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Proof</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E] mb-6">
              우리가 먼저 해봤습니다
            </h2>
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-green-100">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#10E096]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-[#0DC47D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.5l1.5-9h15l1.5 9M3 13.5H21M3 13.5l-1.5 6h19.5l-1.5-6M8 13.5V6m4 7.5V6m4 7.5V6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0A0F1E] mb-2">담다트래블 — 검색·AI 발견 관리 자체 적용 사례</h3>
                  <p className="text-gray-500 leading-relaxed mb-4">
                    자체 서비스인 <strong className="text-[#0A0F1E]">담다트래블(damdatravel.com)</strong>은 정식 오픈 전부터
                    검색·AI 환경에서 발견되는 과정을 직접 확인하며 홈페이지 정보 구조와 콘텐츠를 지속적으로 점검해 왔습니다.
                  </p>
                  <p className="text-gray-500 leading-relaxed">
                    이 경험을 바탕으로 고객사도 현재 상태를 먼저 측정하고, 필요한 개선 작업을 순서대로 진행합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TARGETS */}
      <section id="targets" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Packages</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E]">
              업종별 맞춤 패키지
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {targets.map(item => (
              <div key={item.category} className="bg-[#F8FAFB] rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-4xl">{item.icon}</div>
                  <span className="text-xs bg-[#10E096]/20 text-[#0A7A5A] font-semibold px-3 py-1 rounded-full">{item.badge}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0A0F1E] mb-1">{item.category}</h3>
                <p className="text-[#0DC47D] text-sm font-semibold mb-4">{item.sub}</p>
                <p className="text-gray-600 leading-relaxed mb-6">{item.desc}</p>
                <div className="border-t border-gray-200 pt-5">
                  <Link
                    href="/ai-search/consulting"
                    className="inline-flex items-center gap-2 text-[#0DC47D] font-semibold hover:gap-4 transition-all"
                  >
                    도입 문의하기
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            * 제공 제외: 네이버 블로그/카페, SNS DB 광고, 현수막 등 기존 실행사 영역
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0A0F1E]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Contact</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            현재 발견 상태부터 확인하세요
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            검색과 AI에서 현재 어떻게 발견되는지 확인하고,<br />
            필요한 개선 작업을 순서대로 제안합니다.
          </p>
          <Link
            href="/ai-search/consulting"
            className="inline-block bg-[#10E096] text-[#0A0F1E] font-bold text-lg px-10 py-4 rounded-xl hover:bg-[#0DC47D] transition-colors"
          >
            도입 문의하기
          </Link>
        </div>
      </section>
    </>
  )
}
